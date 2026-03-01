'use client';

import React from 'react';
import { Upload } from 'lucide-react';

interface AddItemFormProps {
    categories: string[];
    onAdd: (newItem: any) => Promise<void>;
    onUploadImage: (file: File, isMenu: boolean) => Promise<string>;
}

export function AddItemForm({ categories, onAdd, onUploadImage }: AddItemFormProps) {
    return (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Add Item</h3>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);
                    const newItem: any = {
                        name: (formData.get('name') as string) || 'Unnamed Item',
                        description: (formData.get('description') as string) || '',
                        price: Number(formData.get('price')) || 0,
                        category: (formData.get('category') as string) || 'Main Course',
                        isVegetarian: formData.get('isVegetarian') === 'on',
                        isSpicy: formData.get('isSpicy') === 'on',
                        isChefSpecial: formData.get('isChefSpecial') === 'on',
                        available: true
                    };
                    const image = formData.get('image') as string;
                    if (image) newItem.image = image;

                    await onAdd(newItem);
                    form.reset();
                    alert("Item added successfully!");
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <input name="name" required placeholder="Name" className="bg-white border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-tashi-accent" />
                <input name="price" type="number" required placeholder="Price" className="bg-white border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-tashi-accent" />
                <input list="category-list" name="category" required placeholder="Category" className="bg-white border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-tashi-accent" />
                <datalist id="category-list">
                    {categories.map(c => <option key={c} value={c} />)}
                </datalist>
                <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 text-xs text-gray-700"><input name="isVegetarian" type="checkbox" className="accent-green-500" /> Veg</label>
                    <label className="flex items-center gap-2 text-xs text-gray-700"><input name="isSpicy" type="checkbox" className="accent-red-500" /> Spicy</label>
                    <label className="flex items-center gap-2 text-xs text-gray-700"><input name="isChefSpecial" type="checkbox" className="accent-yellow-500" /> Chef's Special</label>
                </div>
                <div className="md:col-span-3 flex gap-2">
                    <input name="image" id="add-item-image-url" placeholder="Image URL..." className="flex-1 bg-white border border-gray-300 rounded-lg p-3 text-sm outline-none" />
                    <label className="cursor-pointer bg-white hover:bg-gray-100 text-gray-600 rounded-lg px-4 flex items-center justify-center border border-gray-300">
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file && confirm(`Upload ${file.name}?`)) {
                                const url = await onUploadImage(file, true);
                                const input = document.getElementById('add-item-image-url') as HTMLInputElement;
                                if (input) input.value = url;
                            }
                        }} />
                        <Upload size={20} />
                    </label>
                </div>
                <input name="description" required placeholder="Description" className="md:col-span-4 bg-white border border-gray-300 rounded-lg p-3 text-sm outline-none" />
                <button type="submit" className="md:col-span-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg">Add Item</button>
            </form>
        </div>
    );
}
