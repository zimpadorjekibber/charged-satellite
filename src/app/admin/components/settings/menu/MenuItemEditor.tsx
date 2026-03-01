'use client';

import React, { useState, useEffect } from 'react';
import { X, ImageIcon } from 'lucide-react';
import { MenuItem } from '@/lib/store';

interface MenuItemEditorProps {
    item: MenuItem;
    onClose: () => void;
    onUpdate: (id: string, updates: any) => void | Promise<void>;
    onOpenGallery: () => void;
    categories: string[];
}

export function MenuItemEditor({ item, onClose, onUpdate, onOpenGallery, categories }: MenuItemEditorProps) {
    const [imageUrl, setImageUrl] = useState(item.image || '');

    useEffect(() => {
        setImageUrl(item.image || '');
    }, [item.image]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <h2 className="text-xl font-bold mb-6">Edit Item</h2>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        const updates = {
                            name: formData.get('name') as string,
                            price: Number(formData.get('price')),
                            category: formData.get('category') as string,
                            description: formData.get('description') as string,
                            image: formData.get('image') as string,
                            isVegetarian: formData.get('isVegetarian') === 'on',
                            isSpicy: formData.get('isSpicy') === 'on',
                            isChefSpecial: formData.get('isChefSpecial') === 'on',
                        };
                        await onUpdate(item.id, updates);
                        onClose();
                        alert('Item updated!');
                    }}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <input name="name" defaultValue={item.name} required className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:border-tashi-accent outline-none" />
                        <input name="price" type="number" defaultValue={item.price} required className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:border-tashi-accent outline-none" />
                    </div>
                    <input list="category-list-edit" name="category" defaultValue={item.category} required className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:border-tashi-accent outline-none" />
                    <datalist id="category-list-edit">
                        {categories.map(c => <option key={c} value={c} />)}
                    </datalist>
                    <div className="flex gap-2">
                        <input name="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL..." className="flex-1 bg-white border border-gray-300 rounded-lg p-3 text-sm outline-none" />
                        <button type="button" onClick={onOpenGallery} className="bg-gray-100 hover:bg-gray-200 px-4 rounded-lg font-bold text-sm border border-gray-300 transition-colors flex items-center gap-2"><ImageIcon size={16} /> Gallery</button>
                    </div>
                    <textarea name="description" defaultValue={item.description} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm min-h-[80px] outline-none" />
                    <div className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700"><input name="isVegetarian" type="checkbox" defaultChecked={item.isVegetarian} className="w-5 h-5 accent-green-500" /> Veg</label>
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700"><input name="isSpicy" type="checkbox" defaultChecked={item.isSpicy} className="w-5 h-5 accent-red-500" /> Spicy</label>
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700"><input name="isChefSpecial" type="checkbox" defaultChecked={item.isChefSpecial} className="w-5 h-5 accent-yellow-500" /> Chef's Special</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-tashi-primary text-white font-bold shadow-lg shadow-red-500/20">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
