'use client';

import React from 'react';

interface StyleControlsProps {
    menuAppearance: any;
    updateMenuAppearance: (data: any) => void;
}

export function StyleControls({ menuAppearance, updateMenuAppearance }: StyleControlsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Headers */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-2">Category Headers</h3>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Font Size</label>
                    <select
                        value={menuAppearance.categoryFontSize}
                        onChange={(e) => updateMenuAppearance({ categoryFontSize: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:border-tashi-primary outline-none"
                    >
                        <option value="1rem">Normal (1rem)</option>
                        <option value="1.25rem">Large (1.25rem)</option>
                        <option value="1.5rem">Extra Large (1.5rem)</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Text Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={menuAppearance.categoryColor}
                            onChange={(e) => updateMenuAppearance({ categoryColor: e.target.value })}
                            className="bg-white h-8 w-8 rounded cursor-pointer border border-gray-300"
                        />
                        <span className="text-xs text-gray-500 uppercase">{menuAppearance.categoryColor}</span>
                    </div>
                </div>
            </div>

            {/* Item Titles */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-2">Item Names</h3>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Font Size</label>
                    <select
                        value={menuAppearance.itemNameFontSize}
                        onChange={(e) => updateMenuAppearance({ itemNameFontSize: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:border-tashi-primary outline-none"
                    >
                        <option value="0.9rem">Compact (0.9rem)</option>
                        <option value="1rem">Standard (1rem)</option>
                        <option value="1.1rem">Large (1.1rem)</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Text Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={menuAppearance.itemNameColor}
                            onChange={(e) => updateMenuAppearance({ itemNameColor: e.target.value })}
                            className="bg-white h-8 w-8 rounded cursor-pointer border border-gray-300"
                        />
                        <span className="text-xs text-gray-500 uppercase">{menuAppearance.itemNameColor}</span>
                    </div>
                </div>
            </div>

            {/* Price & Accent */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-2">Accents & Prices</h3>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Accent Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={menuAppearance.accentColor}
                            onChange={(e) => updateMenuAppearance({ accentColor: e.target.value })}
                            className="bg-white h-8 w-8 rounded cursor-pointer border border-gray-300"
                        />
                        <span className="text-xs text-gray-500 uppercase">{menuAppearance.accentColor}</span>
                    </div>
                </div>
                <div className="pt-2">
                    <button
                        onClick={() => updateMenuAppearance({
                            categoryFontSize: '1.25rem',
                            categoryColor: '#FFFFFF',
                            itemNameFontSize: '1rem',
                            itemNameColor: '#E5E5E5',
                            accentColor: '#DAA520'
                        })}
                        className="w-full bg-white hover:bg-gray-100 text-xs font-bold py-2 rounded text-gray-600 border border-gray-300 transition-colors"
                    >
                        Reset to Default
                    </button>
                </div>
            </div>
        </div>
    );
}
