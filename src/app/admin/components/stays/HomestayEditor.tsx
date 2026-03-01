'use client';

import React from 'react';
import { Homestay } from '@/lib/store';

interface HomestayEditorProps {
    item: Homestay | null;
    isAdding: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    formData: any;
    setFormData: (data: any) => void;
}

export function HomestayEditor({
    item,
    isAdding,
    onClose,
    onSave,
    onImageUpload,
    formData,
    setFormData
}: HomestayEditorProps) {
    if (!isAdding && !item) return null;

    return (
        <div className="bg-amber-50 p-8 rounded-[2rem] border-2 border-amber-200 space-y-6">
            <h3 className="text-xl font-bold">{item ? 'Edit Homestay' : 'Add New Homestay'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Homestay / Hotel Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-4 rounded-xl border border-amber-200 focus:ring-2 ring-amber-500 bg-white"
                        placeholder="e.g. Tashi's Home"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Owner Name</label>
                    <input
                        type="text"
                        value={formData.ownerName}
                        onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                        className="w-full p-4 rounded-xl border border-amber-200 focus:ring-2 ring-amber-500 bg-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Phone Number</label>
                    <input
                        type="text"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-4 rounded-xl border border-amber-200 focus:ring-2 ring-amber-500 bg-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Village</label>
                    <select
                        value={formData.village}
                        onChange={e => setFormData({ ...formData, village: e.target.value as any })}
                        className="w-full p-4 rounded-xl border border-amber-200 focus:ring-2 ring-amber-500 bg-white"
                    >
                        <option value="Kibber">Kibber</option>
                        <option value="Chicham">Chicham</option>
                        <option value="Kee">Kee</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Photo (Optional)</label>
                    <input type="file" onChange={onImageUpload} className="w-full p-3 bg-white rounded-xl border border-amber-200" />
                    {formData.image && <img src={formData.image} className="w-20 h-20 rounded-lg object-cover mt-2" alt="Preview" />}
                </div>
                <div className="space-y-2 flex items-center gap-2 pt-6">
                    <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={e => setFormData({ ...formData, available: e.target.checked })}
                        className="w-6 h-6 accent-green-500"
                    />
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Available</label>
                </div>
            </div>
            <div className="flex gap-4 pt-4">
                <button onClick={onSave} className="flex-1 bg-black text-white p-4 rounded-xl font-bold text-lg">SAVE HOMESTAY</button>
                <button onClick={onClose} className="px-8 bg-gray-200 p-4 rounded-xl font-bold">CANCEL</button>
            </div>
        </div>
    );
}
