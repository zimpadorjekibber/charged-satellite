'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Trash, Upload, Download, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StorageManagerView() {
    const media = useStore((state) => state.media);
    const menu = useStore((state) => state.menu);
    const deleteMedia = useStore((state) => state.deleteMedia);
    const [localGallery, setLocalGallery] = useState<any[]>([]);

    useEffect(() => {
        // Fetch local gallery manifest
        fetch('/gallery-manifest.json')
            .then(res => res.json())
            .then(data => setLocalGallery(data))
            .catch(err => console.error('Failed to load local gallery', err));
    }, []);

    // Helper to check if image is used in menu
    const isImageUsed = (source: string) => {
        if (!source) return false;
        const fileName = source.split('/').pop()?.split('?')[0];
        if (!fileName) return false;

        return menu.some(m => {
            if (!m.image) return false;
            if (m.image === source) return true;
            if (m.image.includes(fileName)) return true;
            return false;
        });
    };

    const handleDeleteLocal = async (path: string) => {
        if (!confirm('Permanently delete this file? This cannot be undone.')) return;

        try {
            const res = await fetch('/api/media/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: path })
            });
            if (res.ok) {
                setLocalGallery(prev => prev.filter(p => p.path !== path));
            } else {
                alert('Failed to delete file');
            }
        } catch (e) {
            console.error(e);
            alert('Error deleting file');
        }
    };

    return (
        <div className="space-y-8">
            {/* Firebase Media Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 font-serif">Cloud Media (Firebase)</h2>
                        <p className="text-sm text-gray-500">Manage images stored in Firebase Storage</p>
                    </div>
                </div>

                {media.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                        <p className="text-gray-400">No cloud media records found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {media.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden group relative">
                                <div className="aspect-square bg-gray-200 relative">
                                    <img src={item.url} className="w-full h-full object-cover" alt={item.name} />
                                    {isImageUsed(item.url) && (
                                        <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">IN USE</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => window.open(item.url, '_blank')}
                                            className="p-2 bg-white rounded-full text-gray-900"
                                            title="Open Original"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this media record?')) {
                                                    deleteMedia(item.id || item.url);
                                                }
                                            }}
                                            className="p-2 bg-red-500 rounded-full text-white"
                                            title="Delete Record"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <p className="text-[10px] font-bold text-gray-900 truncate">{item.name}</p>
                                    <p className="text-[10px] text-gray-400 font-mono break-all line-clamp-1">{item.url}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Local Media Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 font-serif">Local Gallery</h2>
                        <p className="text-sm text-gray-500">Images found in public/gallery, uploads, etc.</p>
                    </div>
                </div>

                {localGallery.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                        <p className="text-gray-400">No local images found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {localGallery.map((file, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden group relative">
                                <div className="aspect-square bg-gray-200 relative">
                                    <img src={file.path} className="w-full h-full object-cover" alt={file.name} />
                                    {isImageUsed(file.path) && (
                                        <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">IN USE</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(file.path);
                                                alert('Copied to clipboard: ' + file.path);
                                            }}
                                            className="p-2 bg-white rounded-full text-gray-900 text-[10px] font-bold"
                                        >
                                            COPY PATH
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLocal(file.path)}
                                            className="p-2 bg-red-500 rounded-full text-white"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <p className="text-[10px] font-bold text-gray-900 truncate">{file.name}</p>
                                    <p className="text-[9px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
