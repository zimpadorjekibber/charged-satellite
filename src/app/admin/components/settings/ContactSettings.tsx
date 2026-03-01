'use client';

import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import { useStore } from '@/lib/store';

export function ContactSettings() {
    const contactInfo = useStore((state) => state.contactInfo);
    const updateContactSettings = useStore((state: any) => state.updateContactSettings);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Contact Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Primary Phone Number</label>
                    <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            defaultValue={contactInfo?.phone}
                            onBlur={(e) => updateContactSettings({ phone: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-tashi-accent outline-none"
                            placeholder="+91 00000 00000"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">WhatsApp Number (For Orders)</label>
                    <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            defaultValue={contactInfo?.whatsapp}
                            onBlur={(e) => updateContactSettings({ whatsapp: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-tashi-accent outline-none"
                            placeholder="+91 00000 00000"
                        />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Google Maps Embed/Link URL</label>
                    <div className="relative">
                        <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            defaultValue={contactInfo?.mapsLocation}
                            onBlur={(e) => updateContactSettings({ mapsLocation: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-tashi-accent outline-none"
                            placeholder="Paste Share Link from Maps..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
