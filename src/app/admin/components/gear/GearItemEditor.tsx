'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GearItem } from '@/lib/store';

interface GearItemEditorProps {
    item: GearItem | null;
    isAdding: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export function GearItemEditor({ item, isAdding, onClose, onSave }: GearItemEditorProps) {
    if (!isAdding && !item) return null;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const itemData = {
            name: formData.get('name') as string,
            price: parseFloat(formData.get('price') as string),
            badge: formData.get('badge') as string,
            category: formData.get('category') as 'wear' | 'harvest',
            available: formData.get('available') === 'on',
            items: [
                {
                    url: formData.get('img0_url') as string || '/images/placeholders/gear-product.png',
                    label: 'Product View',
                    details: formData.get('img0_details') as string || 'Hand-knitted in Kibber'
                },
                {
                    url: formData.get('img1_url') as string || '/images/placeholders/gear-lifestyle-1.png',
                    label: formData.get('img1_label') as string || 'Local Man Lifestyle',
                    details: 'Worn by local artisan',
                    worn: true
                },
                {
                    url: formData.get('img2_url') as string || '/images/placeholders/gear-lifestyle-2.png',
                    label: formData.get('img2_label') as string || 'Fashion Shot',
                    details: 'Premium Spitian Wool',
                    worn: true
                }
            ]
        };

        await onSave(itemData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white border border-gray-200 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
            >
                <form onSubmit={handleFormSubmit} className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 font-serif">
                            {item ? 'Edit Gear Item' : 'Add New Local Gear'}
                        </h2>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                                <input name="name" required defaultValue={item?.name} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-tashi-accent outline-none" placeholder="e.g. Spitian Ear Warmer" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                <select name="category" defaultValue={item?.category || 'wear'} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-tashi-accent outline-none">
                                    <option value="wear">Clothing / Gear</option>
                                    <option value="harvest">Local Spices / Harvest</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Price (₹)</label>
                                <input name="price" type="number" required defaultValue={item?.price} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-tashi-accent outline-none" placeholder="e.g. 450" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Badge / Material</label>
                                <input name="badge" defaultValue={item?.badge} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-tashi-accent outline-none" placeholder="e.g. 100% Pure Wool" />
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <input name="available" type="checkbox" defaultChecked={item ? item.available : true} className="w-6 h-6 accent-green-500" />
                                <span className="font-bold text-gray-700">In Stock</span>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-gray-100 pt-6">
                            <h3 className="font-bold text-gray-900">Carousel Frames (3 Recommended)</h3>

                            {/* Frame 1: Product */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Frame 1 (Product Shot)</span>
                                </div>
                                <input name="img0_url" defaultValue={item?.items[0]?.url} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-tashi-accent outline-none" placeholder="Image URL (Clean background preferred)" />
                                <input name="img0_details" defaultValue={item?.items[0]?.details} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-tashi-accent outline-none" placeholder="Details (e.g. Hand-knitted in Kibber)" />
                            </div>

                            {/* Frame 2: Lifestyle 1 */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Frame 2 (Lifestyle - Man)</span>
                                    <input name="img1_label" defaultValue={item?.items[1]?.label || 'Local Man Lifestyle'} className="bg-transparent text-right text-xs font-bold text-tashi-primary focus:outline-none" placeholder="Label" />
                                </div>
                                <input name="img1_url" defaultValue={item?.items[1]?.url} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-tashi-accent outline-none" placeholder="Image URL (Man facing left)" />
                            </div>

                            {/* Frame 3: Lifestyle 2 */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Frame 3 (Lifestyle - Lady)</span>
                                    <input name="img2_label" defaultValue={item?.items[2]?.label || 'Fashion Shot'} className="bg-transparent text-right text-xs font-bold text-tashi-primary focus:outline-none" placeholder="Label" />
                                </div>
                                <input name="img2_url" defaultValue={item?.items[2]?.url} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-tashi-accent outline-none" placeholder="Image URL (Fashion shot)" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">Cancel</button>
                        <button type="submit" className="px-8 py-2 rounded-xl bg-tashi-primary text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                            {item ? 'Update Item' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
