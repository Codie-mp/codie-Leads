"use client";
import React, { useState } from 'react';
import { useStore } from '@/store/useLeadStore';
import { X, FolderPlus, Trash2, Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManagerModal({ isOpen, onClose }: Props) {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#8b5cf6');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await addCategory({ name: newCategoryName.trim(), color: newCategoryColor });
      setNewCategoryName('');
      toast.success("Category created!");
    } catch (e) {
      toast.error("Failed to create category");
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color || '#8b5cf6');
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateCategory(id, { name: editName.trim(), color: editColor });
      setEditingId(null);
      toast.success("Category updated!");
    } catch (e) {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove the category from all assigned leads.")) return;
    try {
      await deleteCategory(id);
      toast.success("Category deleted!");
    } catch (e) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-purple-600" />
            Manage Categories
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {/* Create New */}
          <form onSubmit={handleCreate} className="flex gap-2 mb-6">
            <input
              type="color"
              value={newCategoryColor}
              onChange={e => setNewCategoryColor(e.target.value)}
              className="w-10 h-10 p-1 rounded border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="New category name..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <button
              type="submit"
              disabled={!newCategoryName.trim()}
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Add
            </button>
          </form>

          {/* List existing */}
          <div className="space-y-2">
            {categories.map((cat: any) => (
              <div key={cat.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-200">
                {editingId === cat.id ? (
                  <div className="flex flex-1 gap-2 mr-2">
                    <input
                      type="color"
                      value={editColor}
                      onChange={e => setEditColor(e.target.value)}
                      className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: cat.color || '#e5e7eb' }} />
                    <span className="font-medium text-gray-800">{cat.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  {editingId === cat.id ? (
                    <button onClick={() => handleUpdate(cat.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => startEdit(cat)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No categories created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
