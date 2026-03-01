'use client';

import React from 'react';
import { Trash, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';

export function ValleyUpdatesSettings() {
    const valleyUpdates = useStore((state) => state.valleyUpdates);
    const saveValleyUpdates = useStore((state) => state.saveValleyUpdates);

    return (
        <div id="valley-updates-management" className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm scroll-mt-24">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 font-serif">Valley Updates</h2>
                <button
                    onClick={() => {
                        const newUpdate = {
                            id: Math.random().toString(36).substr(2, 9),
                            title: 'New Update',
                            description: 'Description here...',
                            status: 'Normal',
                            statusColor: 'green'
                        };
                        saveValleyUpdates([...valleyUpdates, newUpdate]);
                    }}
                    className="bg-tashi-accent text-tashi-dark font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-yellow-400 transition-colors"
                >
                    <Plus size={18} /> Add Update
                </button>
            </div>

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
                                        onBlur={(e) => {
                                            const newUpdates = [...valleyUpdates];
                                            newUpdates[idx].title = e.target.value;
                                            saveValleyUpdates(newUpdates);
                                        }}
                                        placeholder="e.g. Road Block Alert"
                                        className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-gray-900 font-bold text-sm w-full focus:ring-2 ring-tashi-accent outline-none shadow-inner"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this update?')) {
                                            const newUpdates = valleyUpdates.filter((_, i) => i !== idx);
                                            saveValleyUpdates(newUpdates);
                                        }
                                    }}
                                    className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 block">Detailed Info</label>
                                    <textarea
                                        defaultValue={update.description}
                                        onBlur={(e) => {
                                            const newUpdates = [...valleyUpdates];
                                            newUpdates[idx].description = e.target.value;
                                            saveValleyUpdates(newUpdates);
                                        }}
                                        placeholder="Add details about road condition, weather etc."
                                        rows={2}
                                        className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-gray-600 text-xs w-full focus:ring-2 ring-tashi-accent outline-none shadow-inner"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 block">Quick Status</label>
                                        <input
                                            defaultValue={update.status}
                                            onBlur={(e) => {
                                                const newUpdates = [...valleyUpdates];
                                                newUpdates[idx].status = e.target.value;
                                                saveValleyUpdates(newUpdates);
                                            }}
                                            placeholder="e.g. Cleared"
                                            className="bg-white border border-gray-200 rounded-lg py-1 px-3 text-gray-900 font-bold text-[10px] w-full focus:ring-2 ring-tashi-accent outline-none uppercase"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 block">Alert Color</label>
                                        <select
                                            value={update.statusColor}
                                            onChange={(e) => {
                                                const newUpdates = [...valleyUpdates];
                                                newUpdates[idx].statusColor = e.target.value;
                                                saveValleyUpdates(newUpdates);
                                            }}
                                            className="bg-white border border-gray-200 rounded-lg py-1 px-2 text-[10px] font-bold w-full focus:ring-2 ring-tashi-accent outline-none"
                                        >
                                            <option value="green">Green (Safe)</option>
                                            <option value="blue">Blue (Info)</option>
                                            <option value="red">Red (Critical)</option>
                                        </select>
                                    </div>
                                </div>
                                {update.mediaUrl && (
                                    <div className="mt-2 text-[10px] text-blue-500 truncate">
                                        Media Attached: {update.mediaUrl}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
