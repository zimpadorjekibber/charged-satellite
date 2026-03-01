'use client';

import React, { useState } from 'react';
import { ImageIcon, Link as LinkIcon, CheckCircle2, Upload } from 'lucide-react';
import { PhotoUploadSection } from '@/components/PhotoUpload';
import { useStore } from '@/lib/store';

export function QuickUploadTool() {
    const [manualUploadUrl, setManualUploadUrl] = useState<string | undefined>(undefined);
    const [copied, setCopied] = useState(false);
    const updateLandingPhotos = useStore((state) => state.updateLandingPhotos);

    const handleQuickAssign = async (key: 'customMap' | 'registrationDoc' | 'chichamPhoto' | 'keePhoto' | 'prayerFlags' | 'prayerWheel') => {
        if (!manualUploadUrl) return;
        await updateLandingPhotos(key, manualUploadUrl);
        alert(`${key} updated successfully!`);
        setManualUploadUrl(undefined); // Reset after assigning
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-[2rem] p-8 shadow-sm mb-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 space-y-6">
                    <div>
                        <h2 className="text-2xl font-black text-indigo-900 flex items-center gap-2">
                            <Upload className="text-indigo-500" />
                            Quick Upload Tool (Get Image Link)
                        </h2>
                        <p className="text-indigo-600/80 text-sm font-medium mt-1">
                            Device se photo upload karein aur uska Link payein. Phir us Link ko copy karke use karein.
                        </p>
                    </div>

                    <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-indigo-50">
                        <PhotoUploadSection
                            title="GENERATE LINK"
                            description="Upload any image here"
                            icon={<ImageIcon size={20} className="text-blue-500" />}
                            aspectRatio="video"
                            currentImageUrl={manualUploadUrl}
                            onUploadSuccess={(url) => setManualUploadUrl(url)}
                            placeholder="Upload to get Link"
                        />
                    </div>
                </div>

                {manualUploadUrl && (
                    <div className="w-full lg:w-1/2 bg-white rounded-3xl p-6 shadow-xl border border-green-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CheckCircle2 size={100} className="text-green-500" />
                        </div>
                        <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-6 relative z-10">
                            Photo Data Ready (Don't Scroll, Use Buttons!)
                        </h3>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6 relative z-10">
                            <p className="text-[10px] font-mono text-gray-500 break-all leading-relaxed">
                                {manualUploadUrl}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 relative z-10">
                            <button onClick={() => handleQuickAssign('customMap')} className="bg-green-600 text-white font-black text-[10px] md:text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all hover:scale-105 active:scale-95">
                                Map Lagado
                            </button>
                            <button onClick={() => handleQuickAssign('registrationDoc')} className="bg-blue-600 text-white font-black text-[10px] md:text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
                                Doc Lagado
                            </button>
                            <button onClick={() => handleQuickAssign('chichamPhoto')} className="bg-orange-500 text-white font-black text-[10px] md:text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all hover:scale-105 active:scale-95">
                                Chicham Photo
                            </button>
                            <button onClick={() => handleQuickAssign('keePhoto')} className="bg-purple-500 text-white font-black text-[10px] md:text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-purple-500/20 hover:bg-purple-600 transition-all hover:scale-105 active:scale-95">
                                Kee Photo
                            </button>
                            <button onClick={() => handleQuickAssign('prayerFlags')} className="bg-indigo-600 text-white font-black text-[10px] md:text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
                                Prayer Flags
                            </button>
                            <button onClick={() => handleQuickAssign('prayerWheel')} className="bg-teal-600 text-white font-black text-[10px] md:text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all hover:scale-105 active:scale-95">
                                Prayer Wheel
                            </button>
                        </div>

                        <div className="mt-6 text-center text-[10px] text-gray-400 font-bold border-t border-gray-100 pt-4 relative z-10">
                            <button onClick={() => { navigator.clipboard.writeText(manualUploadUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="hover:text-gray-600 underline underline-offset-4 flex items-center justify-center gap-1 mx-auto">
                                <LinkIcon size={12} /> {copied ? 'Copied!' : '(Copy Raw Link [Not Recommended])'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
