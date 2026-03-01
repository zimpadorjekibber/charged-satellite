'use client';

import React from 'react';
import { X, Trash } from 'lucide-react';

interface MediaItem {
    id: string;
    url: string;
}

interface GalleryPickerProps {
    onClose: () => void;
    onSelect: (url: string) => void;
    localGallery: { name: string; path: string }[];
    media: MediaItem[];
    onDeleteLocal: (path: string) => Promise<void>;
}

export function GalleryPicker({ onClose, onSelect, localGallery, media, onDeleteLocal }: GalleryPickerProps) {
    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold">Select Image</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-auto p-6 space-y-8">
                    <section>
                        <h4 className="font-bold text-gray-400 uppercase text-xs mb-4">Local Gallery</h4>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {localGallery.map((file, idx) => (
                                <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer border-2 border-transparent hover:border-tashi-primary transition-all"
                                    onClick={() => onSelect(file.path)}
                                >
                                    <img src={file.path} alt={`Local image: ${file.name}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteLocal(file.path); }}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h4 className="font-bold text-gray-400 uppercase text-xs mb-4">Uploaded Media</h4>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {media?.map((item) => (
                                <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer border-2 border-transparent hover:border-tashi-primary transition-all"
                                    onClick={() => onSelect(item.url)}
                                >
                                    <img src={item.url} alt="Uploaded media" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
