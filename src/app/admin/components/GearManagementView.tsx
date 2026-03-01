'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag } from 'lucide-react';
import { useStore, GearItem } from '@/lib/store';
import { GearItemCard } from './gear/GearItemCard';
import { GearItemEditor } from './gear/GearItemEditor';

export default function GearManagementView() {
    const gearItems = useStore((state) => state.gearItems);
    const addGearItem = useStore((state) => state.addGearItem);
    const updateGearItem = useStore((state) => state.updateGearItem);
    const removeGearItem = useStore((state) => state.removeGearItem);

    const [isAdding, setIsAdding] = useState(false);
    const [editingGear, setEditingGear] = useState<GearItem | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const handleSave = async (itemData: any) => {
        if (editingGear) {
            await updateGearItem(editingGear.id, itemData);
            setEditingGear(null);
        } else {
            await addGearItem(itemData);
            setIsAdding(false);
        }
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = () => {
        if (deleteConfirmId) {
            removeGearItem(deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
        >
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-2">Delete Gear Item?</h3>
                        <p className="text-gray-500 text-sm mb-6">This action cannot be undone. This gear item will be removed from your catalog.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 shadow-lg shadow-red-500/20">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-serif">Cold Weather Gears</h2>
                    <p className="text-gray-500 text-sm">Manage items in the 'Cold Weather Gear' carousel</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-tashi-primary hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
                >
                    <Plus size={20} /> Add Item
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gearItems.map((item) => (
                    <GearItemCard
                        key={item.id}
                        item={item}
                        onEdit={setEditingGear}
                        onDelete={handleDelete}
                    />
                ))}

                {gearItems.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-300 rounded-2xl">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No gear items yet.</p>
                        <button onClick={() => setIsAdding(true)} className="text-tashi-primary font-bold mt-2">Add your first item</button>
                    </div>
                )}
            </div>

            <GearItemEditor
                item={editingGear}
                isAdding={isAdding}
                onClose={() => { setIsAdding(false); setEditingGear(null); }}
                onSave={handleSave}
            />
        </motion.div>
    );
}
