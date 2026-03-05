'use client';

import React from 'react';
import { CloudSnow, Bell, Mic } from 'lucide-react';
import { useStore } from '@/lib/store';

export function GeofencingSettings() {
    const geoRadius = useStore((state) => state.geoRadius);
    const callStaffRadius = useStore((state) => state.callStaffRadius);
    const aiAssistantEnabled = useStore((state) => state.aiAssistantEnabled);
    const aiAssistantMinDistanceKm = useStore((state) => state.aiAssistantMinDistanceKm);
    const updateSettings = useStore((state: any) => state.updateSettings);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-8">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Distance & Geofencing Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Geofencing */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <CloudSnow size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Ordering Radius</h3>
                            <p className="text-xs text-gray-500">Distance from cafe to allow ordering (in meters)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="10"
                            max="5000"
                            step="10"
                            value={geoRadius}
                            onChange={(e) => updateSettings({ geoRadius: Number(e.target.value) })}
                            className="flex-1 accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="w-16 text-center font-bold text-gray-900 text-sm bg-blue-50 py-1 rounded border border-blue-200">
                            {geoRadius}m
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Customers further than this can ONLY browse the menu.</p>
                </div>

                {/* Call Staff Geofencing */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Call Staff Radius</h3>
                            <p className="text-xs text-gray-500">Restrict 'Call Staff' button near cafe</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="2"
                            max="100"
                            step="1"
                            value={callStaffRadius}
                            onChange={(e) => updateSettings({ callStaffRadius: Number(e.target.value) })}
                            className="flex-1 accent-orange-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="w-16 text-center font-bold text-gray-900 text-sm bg-orange-50 py-1 rounded border border-orange-200">
                            {callStaffRadius}m
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Only works when the guest is very close to the restaurant.</p>
                </div>
            </div>

            {/* AI Assistant (Tashi) Geofencing */}
            <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <Mic size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">AI Assistant (Tashi)</h3>
                            <p className="text-xs text-gray-500">Voice assistant for remote customers only</p>
                        </div>
                    </div>
                    <button
                        onClick={() => updateSettings({ aiAssistantEnabled: !aiAssistantEnabled })}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${aiAssistantEnabled ? 'bg-amber-500' : 'bg-gray-300'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${aiAssistantEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                </div>

                {aiAssistantEnabled && (
                    <div className="ml-11 space-y-3">
                        <div>
                            <p className="text-xs text-gray-600 font-medium mb-2">Minimum Distance from Restaurant (km)</p>
                            <p className="text-[10px] text-gray-400 mb-2">Only customers farther than this distance will see Tashi. Nearby guests won't see it.</p>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="500"
                                    step="1"
                                    value={aiAssistantMinDistanceKm}
                                    onChange={(e) => updateSettings({ aiAssistantMinDistanceKm: Number(e.target.value) })}
                                    className="flex-1 accent-amber-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="w-20 text-center font-bold text-gray-900 text-sm bg-amber-50 py-1 rounded border border-amber-200">
                                    {aiAssistantMinDistanceKm} km
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
