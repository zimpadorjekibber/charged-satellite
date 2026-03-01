'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { StyleControls } from './appearance/StyleControls';
import { LivePreview } from './appearance/LivePreview';

export function AppearanceSettings() {
    const menuAppearance = useStore((state) => state.menuAppearance);
    const updateMenuAppearance = useStore((state) => state.updateMenuAppearance);

    return (
        <div id="appearance-settings" className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="p-2 bg-purple-100 rounded-lg text-purple-600"><Sparkles size={20} /></span>
                        Menu Appearance Styling
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Customize fonts and colors for your customer-facing menu. Changes are live instantly.</p>
                </div>
            </div>

            <StyleControls
                menuAppearance={menuAppearance}
                updateMenuAppearance={updateMenuAppearance}
            />

            <LivePreview menuAppearance={menuAppearance} />

            <div className="mt-4 flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 italic">
                    <strong>💡 Tip:</strong> These styles apply to ALL devices instantly.
                </p>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Saved to Cloud
                </div>
            </div>
        </div>
    );
}
