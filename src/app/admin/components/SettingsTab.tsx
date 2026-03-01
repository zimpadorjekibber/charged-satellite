'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, Newspaper, ImageIcon, Home, Grid, Sparkles, MapPin, ShoppingBag, BookOpen, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AppearanceSettings } from './settings/AppearanceSettings';
import { ValleyUpdatesSettings } from './settings/ValleyUpdatesSettings';
import { LandingPhotosSettings } from './settings/LandingPhotosSettings';
import { GeofencingSettings } from './settings/GeofencingSettings';
import { ContactSettings } from './settings/ContactSettings';
import { DangerZoneSettings } from './settings/DangerZoneSettings';
import { TableManagement } from './settings/TableManagement';
import { MenuManagement } from './settings/MenuManagement';
import { AppSharingSettings } from './settings/AppSharingSettings';

interface SettingsTabProps {
    onTabChange: (tab: string) => void;
}

export default function SettingsTab({ onTabChange }: SettingsTabProps) {
    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
        >
            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <button
                    onClick={() => scrollToSection('app-sharing-settings')}
                    className="bg-orange-100 hover:bg-orange-200 p-4 rounded-2xl border border-orange-200 flex flex-col items-center gap-2 transition-all group"
                >
                    <div className="p-3 bg-orange-600 text-white rounded-xl shadow-lg ring-4 ring-orange-100 group-hover:scale-110 transition-transform">
                        <Share2 size={24} />
                    </div>
                    <span className="text-xs font-bold text-black uppercase tracking-wider">Share</span>
                </button>

                <button
                    onClick={() => scrollToSection('appearance-settings')}
                    className="bg-purple-100 hover:bg-purple-200 p-4 rounded-2xl border border-purple-200 flex flex-col items-center gap-2 transition-all group"
                >
                    <div className="p-3 bg-purple-600 text-white rounded-xl shadow-lg ring-4 ring-purple-100 group-hover:scale-110 transition-transform">
                        <Sparkles size={24} />
                    </div>
                    <span className="text-xs font-bold text-black uppercase tracking-wider">Style</span>
                </button>

                <button
                    onClick={() => scrollToSection('menu-management')}
                    className="bg-green-100 hover:bg-green-200 p-4 rounded-2xl border border-green-200 flex flex-col items-center gap-2 transition-all group"
                >
                    <div className="p-3 bg-green-600 text-white rounded-xl shadow-lg ring-4 ring-green-100 group-hover:scale-110 transition-transform">
                        <Grid size={24} />
                    </div>
                    <span className="text-xs font-bold text-black uppercase tracking-wider">Menu Items</span>
                </button>

                <button
                    onClick={() => scrollToSection('valley-updates-management')}
                    className="bg-sky-100 hover:bg-sky-200 p-4 rounded-2xl border border-sky-200 flex flex-col items-center gap-2 transition-all group"
                >
                    <div className="p-3 bg-sky-600 text-white rounded-xl shadow-lg ring-4 ring-sky-100 group-hover:scale-110 transition-transform">
                        <Newspaper size={24} />
                    </div>
                    <span className="text-xs font-bold text-black uppercase tracking-wider">Updates</span>
                </button>

                <button
                    onClick={() => scrollToSection('landing-photos')}
                    className="bg-amber-100 hover:bg-amber-200 p-4 rounded-2xl border border-amber-200 flex flex-col items-center gap-2 transition-all group"
                >
                    <div className="p-3 bg-amber-600 text-white rounded-xl shadow-lg ring-4 ring-amber-100 group-hover:scale-110 transition-transform">
                        <ImageIcon size={24} />
                    </div>
                    <span className="text-xs font-bold text-black uppercase tracking-wider">Photos</span>
                </button>

                <button
                    onClick={() => onTabChange('stays')}
                    className="bg-pink-100 hover:bg-pink-200 p-4 rounded-2xl border border-pink-200 flex flex-col items-center gap-2 transition-all group"
                >
                    <div className="p-3 bg-pink-600 text-white rounded-xl shadow-lg ring-4 ring-pink-100 group-hover:scale-110 transition-transform">
                        <Home size={24} />
                    </div>
                    <span className="text-xs font-bold text-black uppercase tracking-wider">Stays</span>
                </button>
            </div>

            {/* Landing Photos Section */}
            <LandingPhotosSettings />

            {/* App Sharing & QR Section */}
            <AppSharingSettings />

            {/* Modularized Settings Sections */}
            <AppearanceSettings />
            <ValleyUpdatesSettings />
            <MenuManagement />
            <TableManagement />
            <GeofencingSettings />
            <ContactSettings />
            <DangerZoneSettings />
        </motion.div>
    );
}
