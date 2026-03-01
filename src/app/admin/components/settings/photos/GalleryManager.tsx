'use client';

import React from 'react';
import { Plus, Trash, ImageIcon } from 'lucide-react';
import { PhotoUploadSection } from '@/components/PhotoUpload';

interface GalleryManagerProps {
    title: string;
    path: 'location' | 'climate';
    photos: string[];
    captions: Record<string, string>;
    onUpdatePhotos: (path: string, photos: string[]) => void;
    onUpdateCaption: (path: string, url: string, caption: string) => void;
}

export function GalleryManager({ title, path, photos, captions, onUpdatePhotos, onUpdateCaption }: GalleryManagerProps) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-2 flex-1">{title}</h3>
                <button
                    onClick={() => onUpdatePhotos(path, [...(photos || []), ''])}
                    className="ml-4 bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <Plus size={16} />
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(photos || []).map((url, i) => (
                    <div key={i} className="group relative">
                        <PhotoUploadSection
                            title={`Photo ${i + 1}`}
                            description=""
                            icon={<ImageIcon size={16} />}
                            aspectRatio="square"
                            currentImageUrl={url}
                            placeholder="Add Photo"
                            onUploadSuccess={(newUrl) => {
                                const updated = [...(photos || [])];
                                updated[i] = newUrl;
                                onUpdatePhotos(path, updated);
                            }}
                        />
                        <div className="mt-2">
                            <input
                                value={captions?.[url] || ''}
                                onChange={(e) => onUpdateCaption(path, url, e.target.value)}
                                placeholder="Add caption..."
                                className="w-full text-[10px] bg-gray-50 border-none focus:ring-1 ring-tashi-accent rounded px-2 py-1"
                            />
                        </div>
                        <button
                            onClick={() => {
                                const updated = (photos || []).filter((_, idx) => idx !== i);
                                onUpdatePhotos(path, updated);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
