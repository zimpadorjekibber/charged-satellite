'use client';

import { useStore, Homestay } from '@/lib/store';
import { Phone, MapPin, ArrowLeft, Home, Info, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function StaysPage() {
    const homestays = useStore((state) => state.homestays);
    const initialize = useStore((state) => state.initialize);
    const [selectedVillage, setSelectedVillage] = useState<'All' | 'Kibber' | 'Chicham' | 'Kee'>('All');

    useEffect(() => {
        initialize();
    }, []);

    const filteredStays = selectedVillage === 'All'
        ? homestays
        : homestays.filter(s => s.village === selectedVillage);

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-amber-100 px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="p-2 hover:bg-amber-50 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-serif font-black tracking-tight uppercase">Village Stays</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-6 py-12 bg-gradient-to-b from-amber-50/50 to-transparent text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest">
                        <Home size={12} /> Community Initiative
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight">
                        Wanderer's <span className="text-amber-600 italic">Rest</span>
                    </h2>
                    <p className="text-gray-600 text-lg font-medium leading-relaxed">
                        Helping you find authentic local homes in the high Himalayas.
                        We connect you <span className="text-amber-700 font-bold">directly</span> with the owners. No commission.
                    </p>
                </motion.div>
            </section>

            {/* Village Filter */}
            <section className="px-6 mb-8 overflow-x-auto">
                <div className="max-w-4xl mx-auto flex gap-3 pb-2">
                    {['All', 'Kibber', 'Chicham', 'Kee'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setSelectedVillage(v as any)}
                            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${selectedVillage === v
                                    ? 'bg-[#1A1A1A] text-white border-black shadow-lg'
                                    : 'bg-white text-gray-500 border-amber-100 hover:border-amber-300'
                                }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </section>

            {/* Stays List */}
            <section className="px-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredStays.length > 0 ? (
                        filteredStays.map((stay) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={stay.id}
                                className="bg-white rounded-[2rem] overflow-hidden border border-amber-100 shadow-sm hover:shadow-xl transition-all group"
                            >
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    {stay.image ? (
                                        <img src={stay.image} alt={stay.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-amber-200 bg-amber-50/30">
                                            <Home size={48} />
                                            <span className="text-[10px] font-black uppercase mt-2">Village Home</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase text-amber-900 border border-amber-100">
                                            {stay.village}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-serif font-black text-gray-900 mb-1">{stay.name}</h3>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <MapPin size={14} className="text-amber-500" />
                                            <span className="text-xs font-bold uppercase tracking-wider">{stay.village} Village</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-amber-50 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Host</p>
                                            <p className="text-sm font-bold">{stay.ownerName}</p>
                                        </div>
                                        <a
                                            href={`tel:${stay.phone}`}
                                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-5 py-2.5 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                                        >
                                            <Phone size={16} /> CALL DIRECT
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-[3rem] border-2 border-dashed border-amber-200">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-300">
                                <Home size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">No stays listed yet</h3>
                                <p className="text-gray-400 text-sm">We are busy verifying homestays in this village.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* SEO Contribution Box */}
            <section className="px-6 mt-16 pb-12">
                <div className="max-w-4xl mx-auto bg-[#1A1A1A] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-amber-400">
                                <ShieldCheck size={14} /> Our Promise
                            </div>
                            <h3 className="text-3xl md:text-4xl font-serif font-black leading-tight">
                                Supporting the <br />
                                <span className="text-amber-500 italic">High Himalayan</span> Spirit
                            </h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                TashiZom acts as a bridge between travelers and locals. We do not handle payments or bookings.
                                By listing these homes, we aim to preserve the authentic culture of Spiti and support our neighbors
                                in Kibber, Chicham, and Kee.
                            </p>
                        </div>
                        <div className="w-full md:w-64 space-y-4">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                                <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-2">Distance from Kee</p>
                                <p className="text-2xl font-black">15 Mins</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                                <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-2">Distance from Chicham</p>
                                <p className="text-2xl font-black">10 Mins</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Nav Spacer */}
            <div className="h-10" />
        </div>
    );
}
