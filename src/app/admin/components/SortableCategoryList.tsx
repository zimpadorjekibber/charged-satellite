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
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '@/lib/store';

export function SortableCategoryList({ categories, onReorder }: { categories: string[]; onReorder: (newOrder: string[]) => void }) {
    const [localCats, setLocalCats] = useState(categories);

    useEffect(() => {
        setLocalCats(categories);
    }, [categories]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = localCats.indexOf(active.id as string);
            const newIndex = localCats.indexOf(over.id as string);
            const newOrder = arrayMove(localCats, oldIndex, newIndex);
            setLocalCats(newOrder);
            onReorder(newOrder);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localCats} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap gap-3">
                    {localCats.map((cat) => (
                        <SortableCategoryItem key={cat} category={cat} />
                    ))}
                    {localCats.length === 0 && <span className="text-gray-500 text-sm">No items added yet.</span>}
                </div>
            </SortableContext>
        </DndContext>
    );
}

function SortableCategoryItem({ category }: { category: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const menu = useStore((state) => state.menu);

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors select-none shadow-sm">
            <span className="text-gray-900 font-bold text-sm">{category}</span>
            <button
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag
                onClick={async (e) => {
                    e.stopPropagation();
                    const newName = prompt(`Rename category "${category}" to: `, category);
                    if (!newName || newName === category) return;

                    const itemsToUpdate = menu.filter(i => i.category === category);
                    if (confirm(`This will move ${itemsToUpdate.length} items from "${category}" to "${newName}".Continue ? `)) {
                        for (const item of itemsToUpdate) {
                            await useStore.getState().updateMenuItem(item.id, { category: newName });
                        }
                        alert('Categories updated!');
                    }
                }}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
            >
                Rename
            </button>
        </div>
    );
}
