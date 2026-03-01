'use client';

import React, { useState } from 'react';
import { Plus, Home } from 'lucide-react';
import { useStore, Homestay } from '@/lib/store';
import { HomestayCard } from './stays/HomestayCard';
import { HomestayEditor } from './stays/HomestayEditor';

export default function StaysManagementView() {
    const homestays = useStore((state) => state.homestays);
    const addHomestay = useStore((state) => state.addHomestay);
    const updateHomestay = useStore((state) => state.updateHomestay);
    const removeHomestay = useStore((state) => state.removeHomestay);
    const uploadImage = useStore((state) => state.uploadImage);

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        ownerName: '',
        phone: '',
        village: 'Kibber' as 'Kibber' | 'Chicham' | 'Kee',
        image: '',
        available: true
    });

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.phone) return showToast('Name and Phone are required!');

        // Clean data for Firestore (remove ID if present)
        const { id, ...dataToSave } = formData as any;

        try {
            if (editingId) {
                await updateHomestay(editingId, dataToSave);
                setEditingId(null);
            } else {
                await addHomestay(dataToSave);
                setIsAdding(false);
            }
            setFormData({ name: '', ownerName: '', phone: '', village: 'Kibber', image: '', available: true });
        } catch (err) {
            console.error('Error saving homestay:', err);
            showToast('Failed to save homestay. Please check console for details.');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const url = await uploadImage(file, true);
                setFormData(prev => ({ ...prev, image: url }));
            } catch (err) {
                showToast('Image upload failed');
            }
        }
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = () => {
        if (deleteConfirmId) {
            removeHomestay(deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };

    const handleEdit = (stay: Homestay) => {
        setEditingId(stay.id);
        setFormData({ ...stay, image: stay.image || '' });
    };

    const activeItem = editingId ? homestays.find(h => h.id === editingId) || null : null;

    return (
        <div className="space-y-6 relative">
            {toastMessage && (
                <div className="fixed top-20 right-8 bg-black text-white px-6 py-3 rounded-xl shadow-2xl z-50 text-sm font-bold animate-pulse">
                    {toastMessage}
                </div>
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-2">Delete Homestay?</h3>
                        <p className="text-gray-500 text-sm mb-6">This action cannot be undone. This homestay will be removed from the directory.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 shadow-lg shadow-red-500/20">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Homestay Directory</h2>
                    <p className="text-gray-500 text-sm">Manage village homestays for direct customer connection</p>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setEditingId(null); }}
                    className="bg-black text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
                >
                    <Plus size={18} /> Add Homestay
                </button>
            </div>

            <HomestayEditor
                item={activeItem}
                isAdding={isAdding}
                onClose={() => { setIsAdding(false); setEditingId(null); }}
                onSave={handleSave}
                onImageUpload={handleImageUpload}
                formData={formData}
                setFormData={setFormData}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homestays.map(stay => (
                    <HomestayCard
                        key={stay.id}
                        stay={stay}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}

                {homestays.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <Home size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-400 font-serif italic text-lg">No homestays listed yet. Add your first village home!</p>
                        <button onClick={() => setIsAdding(true)} className="text-amber-600 font-bold mt-2 hover:underline">Add Homestay</button>
                    </div>
                )}
            </div>
        </div >
    );
}
