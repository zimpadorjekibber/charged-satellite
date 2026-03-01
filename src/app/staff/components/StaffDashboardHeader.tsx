'use client';

import React from 'react';
import { User, Bell, Volume2, VolumeX, Settings } from 'lucide-react';

interface StaffDashboardHeaderProps {
    userName: string;
    isRinging: boolean;
    isSoundEnabled: boolean;
    onStopSound: () => void;
    onToggleSound: () => void;
    onOpenSettings: () => void;
}

export default function StaffDashboardHeader({
    userName,
    isRinging,
    isSoundEnabled,
    onStopSound,
    onToggleSound,
    onOpenSettings
}: StaffDashboardHeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-xl font-bold text-gray-900">Kitchen Dashboard</h1>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <User size={20} className="text-orange-600" />
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                                <p className="text-xs text-gray-500">Staff Portal</p>
                            </div>
                        </div>
                        {isRinging && (
                            <button
                                onClick={onStopSound}
                                className="flex p-3 bg-red-600 text-white border-2 border-white rounded-lg text-sm font-bold items-center gap-2 transition-all hover:bg-red-700 animate-pulse shadow-lg"
                                title="Stop Ringing"
                            >
                                <Bell className="animate-bounce" size={18} /> Stop Ring
                            </button>
                        )}
                        <button
                            onClick={onToggleSound}
                            className={`hidden md:flex p-2 border rounded-lg text-xs items-center gap-2 transition-colors ${isSoundEnabled
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                }`}
                            title={isSoundEnabled ? "Sound Enabled" : "Sound Muted"}
                        >
                            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            {isSoundEnabled ? 'Sound ON' : 'Sound OFF'}
                        </button>
                        <button
                            onClick={onOpenSettings}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Settings"
                        >
                            <Settings size={22} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
