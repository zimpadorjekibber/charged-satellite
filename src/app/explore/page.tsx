'use client';

import { useStore } from '@/lib/store';
import { ArrowLeft, MapPin, Sparkles, Navigation, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ExplorePage() {
    const landingPhotos = useStore((state) => state.landingPhotos);
    const initialize = useStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, []);

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/5 px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-serif font-black tracking-tight uppercase">Explore Surroundings</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-24">
                {/* Intro */}
                <section className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 font-mono text-[10px] text-amber-400 uppercase tracking-widest">
                        <MapPin size={14} /> Local Wonders
                    </div>
                    <h2 className="text-4xl md:text-6xl font-serif font-black leading-tight">
                        Landmarks Near <span className="text-amber-500 italic">TashiZom</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Kibber is surrounded by some of the most iconic engineering marvels and spiritual centers in the world.
                    </p>
                </section>

                {/* Chicham Bridge */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1 space-y-6">
                        <h3 className="text-3xl md:text-4xl font-black font-serif uppercase">Chicham Bridge</h3>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Suspended at a staggering altitude of <span className="text-white font-bold">13,596 feet</span>, Asia's highest bridge is a gateway between worlds. It connects the remote villages of Kibber and Chicham, spanning across a deep, terrifyingly beautiful gorge.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <Info className="text-amber-500" />
                                <p className="text-sm">Offers panoramic views of the Spiti River and the rugged Himalayan landscape.</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <Navigation className="text-amber-500" />
                                <p className="text-sm font-bold">Just 10 minutes drive from TashiZom.</p>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        {landingPhotos?.chichamPhoto && (
                            <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                                <img src={landingPhotos.chichamPhoto} alt="Chicham Bridge" className="w-full h-auto" />
                            </div>
                        )}
                    </div>
                </section>

                {/* Kee Monastery */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        {landingPhotos?.keePhoto && (
                            <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                                <img src={landingPhotos.keePhoto} alt="Kee Monastery" className="w-full h-auto" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl md:text-4xl font-black font-serif uppercase">Kee Monastery</h3>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            A <span className="text-white font-bold">1000-year-old</span> fortress of spirituality. Kee Monastery is the largest monastery in Spiti and serves as a major training center for Lamas. Its tiered architecture climbing up the hill is one of the most photographed sites in India.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <Sparkles className="text-amber-500" />
                                <p className="text-sm">Houses ancient murals, thangkas, and rare manuscripts of Buddhist history.</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <Navigation className="text-amber-500" />
                                <p className="text-sm font-bold">Just 15 minutes drive from TashiZom.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Guide Section */}
                <section className="bg-gradient-to-br from-amber-600/20 to-black border border-amber-500/20 p-8 md:p-12 rounded-[3rem] text-center space-y-6">
                    <h3 className="text-2xl font-serif font-bold italic text-amber-200">Traveler's Tip</h3>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        We recommend visiting Kee Monastery early in the morning for the prayers, and Chicham Bridge during sunset for the best lights and photographs.
                    </p>
                </section>
            </main>
        </div>
    );
}
