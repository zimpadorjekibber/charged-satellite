'use client';

import React from 'react';
import { Home, Trash, Pencil, Users, Phone } from 'lucide-react';
import { Homestay } from '@/lib/store';

interface HomestayCardProps {
    stay: Homestay;
    onEdit: (stay: Homestay) => void;
    onDelete: (id: string) => void;
}

export function HomestayCard({ stay, onEdit, onDelete }: HomestayCardProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
            <div className="aspect-video bg-gray-100 relative">
                {stay.image ? (
                    <img src={stay.image} className="w-full h-full object-cover" alt={stay.name} />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <Home size={40} />
                        <span className="text-[10px] mt-2 font-bold uppercase tracking-widest">No Image</span>
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg ${stay.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {stay.available ? 'Available' : 'Sold Out'}
                    </span>
                </div>
                <div className="absolute top-4 right-4 group-hover:opacity-100 opacity-0 transition-opacity">
                    <button
                        onClick={() => onDelete(stay.id)}
                        className="p-2 bg-white/90 backdrop-blur rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                        <Trash size={16} />
                    </button>
                </div>
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">{stay.village} Village</p>
                        <h3 className="text-xl font-bold text-gray-900 font-serif">{stay.name}</h3>
                    </div>
                    <button
                        onClick={() => onEdit(stay)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <Pencil size={18} />
                    </button>
                </div>
                <div className="space-y-2 border-t border-gray-100 pt-4 mt-4">
                    <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                        <Users size={14} className="text-gray-400" /> {stay.ownerName}
                    </p>
                    <p className="text-sm font-bold flex items-center gap-2 text-gray-900">
                        <Phone size={14} className="text-green-500" /> {stay.phone}
                    </p>
                </div>
            </div>
        </div>
    );
}
