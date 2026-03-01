'use client';

import React, { useState, useEffect } from 'react';
import { Printer, Plus, Trash, X, Upload, ImageIcon, ChevronRight } from 'lucide-react';
import { useStore, MenuItem } from '@/lib/store';
import { handlePrintMenu } from '@/app/admin/utils/menuPrintHelpers';
import { SortableMenuList } from '../SortableMenuList';

// Modular Components
import { CategoryManager } from './menu/CategoryManager';
import { AddItemForm } from './menu/AddItemForm';
import { MenuItemEditor } from './menu/MenuItemEditor';
import { GalleryPicker } from './menu/GalleryPicker';

export function MenuManagement() {
    const menu = useStore((state) => state.menu);
    const categoryOrder = useStore((state) => state.categoryOrder);
    const media = useStore((state) => state.media);
    const addMenuItem = useStore((state) => state.addMenuItem);
    const updateMenuItem = useStore((state) => state.updateMenuItem);
    const reorderMenuItems = useStore((state) => state.reorderMenuItems);
    const updateCategoryOrder = useStore((state) => state.updateCategoryOrder);
    const uploadImage = useStore((state) => state.uploadImage);

    const [menuSearchQuery, setMenuSearchQuery] = useState('');
    const [menuCategoryFilter, setMenuCategoryFilter] = useState('All');
    const [showGalleryPicker, setShowGalleryPicker] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [localGallery, setLocalGallery] = useState<{ name: string; path: string }[]>([]);

    useEffect(() => {
        fetchLocalGallery();
    }, []);

    const fetchLocalGallery = async () => {
        try {
            const res = await fetch('/api/media/list');
            if (res.ok) {
                const data = await res.json();
                setLocalGallery(data.files || []);
            }
        } catch (e) {
            console.error('Failed to fetch local gallery:', e);
        }
    };

    const handleDeleteLocal = async (path: string) => {
        if (!confirm('Permanently delete this file? This cannot be undone.')) return;
        try {
            const res = await fetch('/api/media/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: path })
            });
            if (res.ok) {
                setLocalGallery(prev => prev.filter(p => p.path !== path));
            } else {
                alert('Failed to delete file');
            }
        } catch (e) {
            console.error(e);
            alert('Error deleting file');
        }
    };

    const categories = (Array.from(new Set(menu.map(i => i.category))) as string[]).sort((a, b) => {
        const idxA = categoryOrder.indexOf(a);
        const idxB = categoryOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    const filteredMenu = menu
        .filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase());
            const matchesCategory = menuCategoryFilter === 'All' || item.category === menuCategoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

    return (
        <div id="menu-management" className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm scroll-mt-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Menu & Inventory</h2>
                    <p className="text-gray-500 text-sm">Update prices, availability, and menu categories.</p>
                </div>
                <button
                    onClick={() => handlePrintMenu(menu)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors text-sm border border-gray-300 shadow-sm"
                >
                    <Printer size={16} /> Print Full Menu
                </button>
            </div>

            <CategoryManager
                categories={categories}
                onReorder={updateCategoryOrder}
            />

            <AddItemForm
                categories={categories}
                onAdd={addMenuItem}
                onUploadImage={uploadImage}
            />

            {/* Search and Filters */}
            <div className="bg-gray-50/95 backdrop-blur-md border border-gray-200 rounded-2xl p-4 md:p-6 mb-6 space-y-4 sticky top-[72px] z-30 shadow-sm transition-all">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={menuSearchQuery}
                        onChange={(e) => setMenuSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 pl-10 text-gray-900 focus:outline-none focus:border-tashi-accent"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['All', ...categories].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setMenuCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${menuCategoryFilter === cat ? 'bg-tashi-accent text-tashi-dark shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <SortableMenuList
                items={filteredMenu}
                onReorder={(newItems) => reorderMenuItems(newItems)}
                onEdit={setEditingItem}
            />

            {editingItem && (
                <MenuItemEditor
                    item={editingItem}
                    categories={categories}
                    onClose={() => setEditingItem(null)}
                    onUpdate={updateMenuItem}
                    onOpenGallery={() => setShowGalleryPicker(true)}
                />
            )}

            {showGalleryPicker && (
                <GalleryPicker
                    localGallery={localGallery}
                    media={media}
                    onClose={() => setShowGalleryPicker(false)}
                    onDeleteLocal={handleDeleteLocal}
                    onSelect={(url) => {
                        if (editingItem) {
                            setEditingItem({ ...editingItem, image: url });
                        }
                        setShowGalleryPicker(false);
                    }}
                />
            )}
        </div>
    );
}
