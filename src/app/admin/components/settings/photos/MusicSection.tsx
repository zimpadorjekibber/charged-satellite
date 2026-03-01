'use client';

import React from 'react';
import { Music } from 'lucide-react';

interface MusicSectionProps {
    landingPhotos: any;
    updateBackgroundMusic: (key: string, value: string) => void;
}

export function MusicSection({ landingPhotos, updateBackgroundMusic }: MusicSectionProps) {
    return (
        <div className="mb-12">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Background Ambience Music</h3>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-600 text-white rounded-xl">
                        <Music size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">Atmospheric Audio</h4>
                        <p className="text-xs text-gray-500">Paste links to MP3 files (Dropbox/Firebase/Direct URLs)</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400">Home Page Music</label>
                        <input
                            defaultValue={typeof landingPhotos?.backgroundMusic === 'object' ? landingPhotos?.backgroundMusic?.home : ''}
                            onBlur={(e) => updateBackgroundMusic('home', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none"
                            placeholder="https://example.com/ambient.mp3"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
