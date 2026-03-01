'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Leaf, Drumstick, Star, Pencil, Trash } from 'lucide-react';
import { useStore, MenuItem } from '@/lib/store';

export function SortableMenuList({ items, onReorder, onEdit }: { items: MenuItem[]; onReorder: (items: MenuItem[]) => void; onEdit: (item: MenuItem) => void }) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [localItems, setLocalItems] = useState<MenuItem[]>(items);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        setLocalItems(items);
    }, [items]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = localItems.findIndex((item) => item.id === active.id);
            const newIndex = localItems.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(localItems, oldIndex, newIndex);
            setLocalItems(newItems);
            onReorder(newItems);
        }

        setActiveId(null);
    };

    if (localItems.length === 0) {
        return (
            <div className="text-center py-12 bg-neutral-800/50 rounded-xl border border-dashed border-white/10">
                <p className="text-gray-500">No menu items found. Add some items or adjust your filters.</p>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">Remove Menu Item?</h3>
                        <p className="text-gray-500 text-sm mb-6">This item will be permanently deleted from the menu.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Cancel</button>
                            <button onClick={() => {
                                useStore.getState().removeMenuItem(deleteConfirmId);
                                setDeleteConfirmId(null);
                            }} className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 shadow-lg shadow-red-500/20">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {localItems.map((item) => (
                        <SortableMenuItem key={item.id} item={item} onEdit={onEdit} onDelete={() => setDeleteConfirmId(item.id)} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

function SortableMenuItem({ item, onEdit, onDelete }: { item: MenuItem; onEdit: (item: MenuItem) => void; onDelete: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border ${isDragging ? 'border-tashi-primary shadow-lg' : 'border-gray-200 hover:border-gray-300'} `}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 p-2 -ml-2"
                title="Drag to reorder"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="7" cy="5" r="1.5" />
                    <circle cx="13" cy="5" r="1.5" />
                    <circle cx="7" cy="10" r="1.5" />
                    <circle cx="13" cy="10" r="1.5" />
                    <circle cx="7" cy="15" r="1.5" />
                    <circle cx="13" cy="15" r="1.5" />
                </svg>
            </div>

            {/* Item Info */}
            <div className="flex items-center gap-4 flex-1">
                {item.image && <img src={item.image} className="w-10 h-10 rounded object-cover" />}
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <span className={`w-2 h-2 rounded-full ${item.available !== false ? 'bg-green-500' : 'bg-red-500'} `} />
                        {item.isVegetarian ? <Leaf size={12} className="text-green-500" /> : <Drumstick size={12} className="text-red-500" />}
                    </div>
                    <p className="text-xs text-gray-500">{item.category} • ₹{item.price}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                <button
                    onClick={() => useStore.getState().updateMenuItem(item.id, { available: !(item.available !== false) })}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${item.available !== false ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'} `}
                >
                    {item.available !== false ? 'Active' : 'Sold Out'}
                </button>
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                    <button
                        onClick={() => useStore.getState().updateMenuItem(item.id, { isVegetarian: !item.isVegetarian })}
                        className={`p-1.5 rounded-md transition-colors ${item.isVegetarian ? 'bg-green-500 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-200'} `}
                        title={item.isVegetarian ? "Switch to Non-Veg" : "Switch to Veg"}
                    >
                        <Leaf size={14} />
                    </button>
                    <button
                        onClick={() => useStore.getState().updateMenuItem(item.id, { isChefSpecial: !item.isChefSpecial })}
                        className={`p-1.5 rounded-md transition-colors ${item.isChefSpecial ? 'bg-yellow-500 text-black shadow-sm' : 'text-gray-400 hover:bg-gray-200'} `}
                        title={item.isChefSpecial ? "Remove from Chef's Specials" : "Mark as Chef's Special"}
                    >
                        <Star size={14} className={item.isChefSpecial ? "fill-black" : ""} />
                    </button>
                </div>
                <button onClick={() => onEdit(item)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100">
                    <Pencil size={18} />
                </button>
                <button onClick={onDelete} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100">
                    <Trash size={18} />
                </button>
            </div>
        </div>
    );
}
