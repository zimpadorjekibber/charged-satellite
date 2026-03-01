'use client';

import React from 'react';
import { Trash, Plus, PlayCircle } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function ValleyUpdatesView() {
    const valleyUpdates = useStore((state) => state.valleyUpdates);
    const saveValleyUpdates = useStore((state) => state.saveValleyUpdates);

    const handleAddUpdate = () => {
        const currentUpdates = valleyUpdates || [];
        const newUpdate = {
            id: Math.random().toString(36).substr(7),
            title: 'Road Status Update',
            status: 'LIVE',
            statusColor: 'green',
            description: 'Everything is normal...',
            mediaType: 'image' as const,
            mediaUrl: ''
        };
        saveValleyUpdates([...currentUpdates, newUpdate]);
    };

    const handleDeleteUpdate = (idx: number) => {
        if (confirm('Delete this update?')) {
            const newUpdates = valleyUpdates.filter((_, i) => i !== idx);
            saveValleyUpdates(newUpdates);
        }
    };

    const handleUpdateChange = (idx: number, field: string, value: any) => {
        const newUpdates = [...valleyUpdates];
        newUpdates[idx] = { ...newUpdates[idx], [field]: value };
        saveValleyUpdates(newUpdates);
    };

    return (
        <div id="valley-updates-management" className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 font-serif">Valley Updates</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(valleyUpdates || []).map((update, idx) => (
                        <div key={update.id || idx} className={`bg-white p-5 rounded-2xl border-l-4 shadow-sm hover:shadow-md transition-all relative group ${update.statusColor === 'red' ? 'border-l-red-500 bg-red-50/10' :
                            update.statusColor === 'blue' ? 'border-l-blue-500 bg-blue-50/10' :
                                'border-l-green-500 bg-green-50/10'
                            } border border-gray-100`}>
                            <div className="flex justify-between items-start mb-4 gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 block">Title / Headline</label>
                                    <input
                                        defaultValue={update.title}
                                        onBlur={(e) => handleUpdateChange(idx, 'title', e.target.value)}
                                        placeholder="e.g. Road Block Alert"
                                        className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-gray-900 font-bold text-sm w-full focus:ring-2 ring-tashi-accent outline-none shadow-inner"
                                    />
                                </div>
                                <button
                                    onClick={() => handleDeleteUpdate(idx)}
                                    className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 block">Category</label>
                                    <select
                                        defaultValue={update.statusColor}
                                        onChange={(e) => handleUpdateChange(idx, 'statusColor', e.target.value)}
                                        className="w-full bg-white text-xs font-bold text-gray-700 rounded-lg p-2 border border-gray-200 focus:ring-2 ring-tashi-accent outline-none"
                                    >
                                        <option value="green">🟢 GOOD / NORMAL</option>
                                        <option value="blue">🔵 INFO / STATUS</option>
                                        <option value="red">🔴 DANGER / ALERT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 block">Badge Text</label>
                                    <input
                                        defaultValue={update.status}
                                        onBlur={(e) => handleUpdateChange(idx, 'status', e.target.value)}
                                        placeholder="LIVE"
                                        className="w-full bg-white text-xs font-bold text-gray-700 rounded-lg p-2 border border-gray-200 focus:ring-2 ring-tashi-accent outline-none placeholder:text-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 block">Detail Description</label>
                                <textarea
                                    defaultValue={update.description}
                                    onBlur={(e) => handleUpdateChange(idx, 'description', e.target.value)}
                                    placeholder="Describe the update in detail..."
                                    className="w-full bg-white text-xs text-gray-600 rounded-lg p-3 border border-gray-200 focus:ring-2 ring-tashi-accent outline-none resize-none h-20 shadow-inner"
                                />
                            </div>

                            {/* Media Inputs */}
                            <div className="space-y-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 shadow-inner">
                                <div className="flex gap-2 items-end">
                                    <div className="w-1/3">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1 block">Media Type</label>
                                        <select
                                            defaultValue={update.mediaType || 'image'}
                                            onChange={(e) => handleUpdateChange(idx, 'mediaType', e.target.value)}
                                            className="w-full bg-white text-[10px] text-gray-600 rounded-lg p-2 border border-gray-200"
                                        >
                                            <option value="image">🖼️ IMAGE</option>
                                            <option value="video">🎥 VIDEO</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1 block">Media URL</label>
                                        <input
                                            placeholder="Paste Link (YouTube/Insta/Direct)..."
                                            defaultValue={update.mediaUrl || ''}
                                            onBlur={(e) => handleUpdateChange(idx, 'mediaUrl', e.target.value)}
                                            className="w-full bg-white text-[10px] text-blue-600 font-mono rounded-lg p-2 border border-gray-200 focus:ring-2 ring-blue-100 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Media Preview */}
                                {update.mediaUrl && (
                                    <div className="w-full h-32 rounded-xl bg-black/5 flex items-center justify-center overflow-hidden border border-gray-200 relative group/preview">
                                        {(() => {
                                            const url = update.mediaUrl;
                                            const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
                                            const isFacebook = url.includes('facebook.com') || url.includes('fb.watch');
                                            const isInstagram = url.includes('instagram.com');

                                            if (update.mediaType === 'video') {
                                                if (isYoutube) {
                                                    const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
                                                    return <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} className="h-full w-full object-cover grayscale group-hover/preview:grayscale-0 transition-all" />;
                                                }
                                                if (isFacebook) return <div className="bg-blue-600 w-full h-full flex items-center justify-center text-white font-bold text-[10px]">FB Video Preview</div>;
                                                if (isInstagram) return <div className="bg-pink-600 w-full h-full flex items-center justify-center text-white font-bold text-[10px]">Insta Reel Preview</div>;
                                                return <video src={url} className="h-full max-w-full" />;
                                            }
                                            return <img src={url} className="h-full w-full object-cover" alt="Preview" />;
                                        })()}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/preview:bg-transparent transition-all">
                                            {update.mediaType === 'video' && <PlayCircle size={32} className="text-white drop-shadow-lg opacity-80" />}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleAddUpdate}
                        className="bg-white hover:bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-gray-900 transition-all min-h-[300px] shadow-sm hover:shadow-md"
                    >
                        <div className="p-4 bg-gray-50 rounded-full border border-gray-100 group-hover:scale-110 transition-transform">
                            <Plus size={32} className="text-gray-300" />
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-black uppercase tracking-widest block">Add New Post</span>
                            <span className="text-[10px] font-medium opacity-60">Notify travelers about valley status</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
