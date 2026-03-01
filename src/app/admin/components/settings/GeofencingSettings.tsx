'use client';

import React from 'react';
import { CloudSnow, Bell } from 'lucide-react';
import { useStore } from '@/lib/store';

export function GeofencingSettings() {
    const geoRadius = useStore((state) => state.geoRadius);
    const callStaffRadius = useStore((state) => state.callStaffRadius);
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
        </div>
    );
}
