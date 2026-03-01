'use client';

import React from 'react';
import { Pencil, Trash } from 'lucide-react';
import { GearItem } from '@/lib/store';

interface GearItemCardProps {
    item: GearItem;
    onEdit: (item: GearItem) => void;
    onDelete: (id: string) => void;
}

export function GearItemCard({ item, onEdit, onDelete }: GearItemCardProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            <div className="aspect-[4/5] bg-gray-100 relative">
                <img
                    src={item.items[0]?.url || '/images/placeholders/gear-product.png'}
                    className="w-full h-full object-cover"
                    alt={item.name}
                />
                {!item.available && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500 text-white font-bold py-1 px-4 rounded-full text-sm">OUT OF STOCK</span>
                    </div>
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-tashi-accent text-tashi-dark text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                        {item.badge}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider ${item.category === 'harvest' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                        {item.category === 'harvest' ? 'Spices / Harvest' : 'Clothing / Wear'}
                    </span>
                </div>
            </div>
            <div className="p-4 border-t border-gray-100">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    <span className="text-tashi-primary font-bold">₹{item.price}</span>
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => onEdit(item)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <Pencil size={14} /> Edit
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
