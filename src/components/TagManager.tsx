import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, X, Plus, Check } from 'lucide-react';
import { useStore } from '@/store/useLeadStore';
import { cn } from '@/lib/utils';

interface TagManagerProps {
  leadId: string;
  currentTags: string[];
  onTagsChange?: (newTags: string[]) => void;
}

export function TagManager({ leadId, currentTags, onTagsChange }: TagManagerProps) {
  const { updateLead } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([
    'High Value', 'Urgent', 'Follow Up', 'Local', 'Chain', 'Tech-Savvy'
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = async (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag || currentTags.includes(trimmedTag)) return;

    const newTags = [...currentTags, trimmedTag];
    await updateLead(leadId, { tags: newTags });
    onTagsChange?.(newTags);
    setInputValue('');
    
    // Add to suggestions if not present
    if (!suggestedTags.includes(trimmedTag)) {
      setSuggestedTags(prev => [...prev, trimmedTag]);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    await updateLead(leadId, { tags: newTags });
    onTagsChange?.(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const filteredSuggestions = suggestedTags.filter(
    tag => tag.toLowerCase().includes(inputValue.toLowerCase()) && !currentTags.includes(tag)
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button / Tag List */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {currentTags.map(tag => (
          <span 
            key={tag} 
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-md border border-blue-100 group"
          >
            {tag}
            <button 
              onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag); }}
              className="opacity-0 group-hover:opacity-100 hover:text-blue-900 transition-opacity"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors",
            currentTags.length === 0 
              ? "text-gray-400 hover:text-blue-600 hover:bg-blue-50" 
              : "text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100"
          )}
        >
          <Plus className="w-3 h-3" />
          {currentTags.length === 0 ? "Add Tag" : ""}
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-50 top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-2 border-b border-gray-50">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type tag name..."
                className="w-full text-xs px-2 py-1 bg-gray-50 rounded border-none focus:ring-2 focus:ring-blue-500/20 outline-none placeholder:text-gray-400"
              />
            </div>
            
            <div className="max-h-32 overflow-y-auto custom-scrollbar p-1">
              {inputValue && !suggestedTags.includes(inputValue) && (
                 <button
                  onClick={() => handleAddTag(inputValue)}
                  className="w-full text-left px-2 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" /> Create "{inputValue}"
                </button>
              )}
              
              {filteredSuggestions.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  className="w-full text-left px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded flex items-center justify-between group"
                >
                  <span>{tag}</span>
                  <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-gray-400" />
                </button>
              ))}
              
              {filteredSuggestions.length === 0 && !inputValue && (
                <p className="text-[10px] text-gray-400 text-center py-2">No suggestions</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
