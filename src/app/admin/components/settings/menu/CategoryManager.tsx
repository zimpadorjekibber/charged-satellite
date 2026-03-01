'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SortableCategoryList } from '../../SortableCategoryList';

interface CategoryManagerProps {
    categories: string[];
    onReorder: (newOrder: string[]) => void;
}

export function CategoryManager({ categories, onReorder }: CategoryManagerProps) {
    const [showPrompt, setShowPrompt] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleCreateCategory = () => {
        if (!newCategoryName.trim()) return;
        setShowPrompt(false);
        setShowSuccess(true);
        setNewCategoryName('');
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 relative">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Manage Categories</h3>
                    <p className="text-xs text-gray-500 mt-1">Categories are created automatically when you add an item.</p>
                </div>
                <button
                    onClick={() => setShowPrompt(true)}
                    className="text-xs bg-tashi-accent text-tashi-dark font-bold px-3 py-2 rounded hover:bg-yellow-400 flex items-center gap-2 transition-colors"
                >
                    <Plus size={14} /> Create Category
                </button>
            </div>

            {showPrompt && (
                <div className="absolute top-0 right-0 mt-16 mr-6 bg-white border border-gray-200 shadow-xl rounded-lg p-4 z-10 w-64">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold">New Category</span>
                        <button onClick={() => setShowPrompt(false)} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
                    </div>
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Desserts"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2 focus:outline-none focus:border-tashi-accent"
                        autoFocus
                    />
                    <button
                        onClick={handleCreateCategory}
                        className="w-full bg-tashi-accent text-tashi-dark font-bold text-xs py-1.5 rounded transition-colors hover:bg-yellow-400"
                    >
                        Confirm
                    </button>
                </div>
            )}

            {showSuccess && (
                <div className="absolute top-0 right-0 mt-16 mr-6 bg-green-100 text-green-800 border border-green-200 shadow-md rounded-lg p-3 z-10 text-xs font-medium">
                    Category selected! Now add an item to create it.
                </div>
            )}
            <SortableCategoryList
                categories={categories}
                onReorder={onReorder}
            />
        </div>
    );
}
