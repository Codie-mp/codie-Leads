"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderPlus, Trash2, Folder, Save, ChevronRight, ChevronDown } from 'lucide-react';
import { PlaceResult } from '@/services/gemini';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
interface Category {
  id: string;
  name: string;
  lists: {
    id: string;
    name: string;
    date: string;
    places: PlaceResult[];
  }[];
}

interface CategoryManagerProps {
  currentPlaces: PlaceResult[];
  onLoadList: (places: PlaceResult[]) => void;
}

export function CategoryManager({ currentPlaces, onLoadList }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');

  // Load categories from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gtm_categories');
    if (saved) {
      try {
        setCategories(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse categories", e);
      }
    }
  }, []);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gtm_categories', JSON.stringify(categories));
  }, [categories]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: newCategoryName.trim(),
      lists: []
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    if (selectedCategory === id) setSelectedCategory(null);
  };

  const handleSaveList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !newListName.trim() || currentPlaces.length === 0) return;

    const updatedCategories = categories.map(cat => {
      if (cat.id === selectedCategory) {
        return {
          ...cat,
          lists: [...cat.lists, {
            id: crypto.randomUUID(),
            name: newListName.trim(),
            date: new Date().toLocaleDateString(),
            places: currentPlaces
          }]
        };
      }
      return cat;
    });

    setCategories(updatedCategories);
    setNewListName('');
    toast.success('List saved successfully!');
  };

  const handleDeleteList = (categoryId: string, listId: string) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          lists: cat.lists.filter(l => l.id !== listId)
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  return (
    <motion.div 
      className="fixed left-4 top-24 z-30"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className={cn(
        "bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col",
        isExpanded ? "w-80 h-[calc(100vh-8rem)]" : "w-14 h-14"
      )}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center justify-center w-14 h-14 shrink-0 hover:bg-gray-50 transition-colors",
            isExpanded ? "border-b border-gray-100" : ""
          )}
        >
          <Folder className={cn("w-6 h-6 text-blue-600", !isExpanded && "animate-pulse")} />
        </button>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-6"
            >
              {/* Create Category */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Category</h3>
                <form onSubmit={handleCreateCategory} className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Chicago Leads"
                    className="flex-1 text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button type="submit" className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                    <FolderPlus className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Save Current List */}
              {currentPlaces.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Save className="w-3 h-3" /> Save Current Results
                  </h3>
                  <form onSubmit={handleSaveList} className="flex flex-col gap-2">
                    <select 
                      value={selectedCategory || ''} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-sm p-2 border border-blue-200 rounded-lg focus:outline-none bg-white"
                      required
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="List Name (e.g. Q1 Search)"
                      className="text-sm p-2 border border-blue-200 rounded-lg focus:outline-none bg-white"
                      required
                    />
                    <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                      Save List
                    </button>
                  </form>
                </div>
              )}

              {/* Categories List */}
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Collections</h3>
                <div className="space-y-2">
                  {categories.length === 0 && (
                    <p className="text-sm text-gray-400 italic text-center py-4">No categories yet.</p>
                  )}
                  {categories.map(cat => (
                    <div key={cat.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <div 
                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      >
                        <div className="flex items-center gap-2 font-medium text-gray-700 text-sm">
                          {selectedCategory === cat.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          {cat.name}
                          <span className="text-xs text-gray-400 font-normal">({cat.lists.length})</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {selectedCategory === cat.id && (
                        <div className="bg-white p-2 space-y-1">
                          {cat.lists.length === 0 && <p className="text-xs text-gray-400 pl-6">No lists saved.</p>}
                          {cat.lists.map(list => (
                            <div key={list.id} className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg group">
                              <button 
                                onClick={() => onLoadList(list.places)}
                                className="text-sm text-gray-600 hover:text-blue-700 text-left flex-1 truncate"
                              >
                                {list.name} <span className="text-xs text-gray-400 ml-1">{list.date}</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteList(cat.id, list.id)}
                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
