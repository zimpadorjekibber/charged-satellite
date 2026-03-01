'use client';

import React from 'react';

interface LivePreviewProps {
    menuAppearance: any;
}

export function LivePreview({ menuAppearance }: LivePreviewProps) {
    return (
        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 shadow-inner mt-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live Style Preview (Customer View)
            </h3>
            <div className="space-y-4">
                <h2 style={{ fontSize: menuAppearance.categoryFontSize, color: menuAppearance.categoryColor }} className="font-serif border-b border-white/5 pb-2 transition-all">
                    Signature Starters
                </h2>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 style={{ fontSize: menuAppearance.itemNameFontSize, color: menuAppearance.itemNameColor }} className="font-bold transition-all">
                            Tibetan Butter Tea
                        </h3>
                        <p className="text-xs text-gray-500 max-w-[200px]">Hand-churned with local butter and Himalayan salt.</p>
                    </div>
                    <span style={{ color: menuAppearance.accentColor }} className="font-bold text-sm">
                        ₹120
                    </span>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex gap-2 overflow-x-auto pb-2">
                {['Breakfast', 'Lunch', 'Dinner'].map(cat => (
                    <div key={cat} className="px-3 py-1 rounded-full text-[10px] uppercase font-bold border" style={{ borderColor: `${menuAppearance.accentColor}40`, color: menuAppearance.accentColor }}>
                        {cat}
                    </div>
                ))}
            </div>
        </div>
    );
}
