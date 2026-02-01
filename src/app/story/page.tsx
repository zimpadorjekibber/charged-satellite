'use client';

import { useStore } from '@/lib/store';
import { ArrowLeft, Clock, Utensils, Heart, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';

export default function StoryPage() {
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
                    <h1 className="text-xl font-serif font-black tracking-tight uppercase">Our Story</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12 space-y-24">
                {/* Legacy Section */}
                <section className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 font-mono text-[10px] text-amber-400 uppercase tracking-widest">
                            <Clock size={14} /> Established 1995
                        </div>
                        <h2 className="text-4xl md:text-6xl font-serif font-black leading-tight">
                            A Legacy of <span className="text-amber-500 italic">Hospitality</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            टशीज़ोम isn't just a business; it's a dream that started with a single piece of paper and a heart full of hope in the mountains of Spiti. This journey began over three decades ago with a vision to bring world-class hospitality to the Roof of the World.
                        </p>
                    </motion.div>

                    {landingPhotos?.registrationDoc && (
                        <div className="relative group max-w-2xl mx-auto">
                            <div className="absolute -inset-1 bg-[#2a1b0a] rounded-lg shadow-2xl" />
                            <div className="relative bg-[#3d2b1f] p-4 md:p-8 rounded-lg border-[8px] border-[#1a1108]">
                                <div className="bg-[#f4f1ea] p-6 md:p-12 shadow-inner">
                                    <img
                                        src={landingPhotos.registrationDoc}
                                        alt="Original Registration"
                                        className="w-full h-auto opacity-90"
                                    />
                                    <div className="mt-8 pt-8 border-t border-black/10 text-center">
                                        <p className="text-gray-500 font-serif italic text-sm tracking-widest uppercase">
                                            Historical Archive - 1995
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
                                <Heart size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Community First</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                From our very first day, we've been more than just a restaurant. We are a junction of Spitian culture, supporting local farmers and artisans.
                            </p>
                        </div>
                        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
                                <Award size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Authentic Taste</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                We preserve the ancient recipes of the valley while embracing modern culinary excellence to serve you the best of both worlds.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Village History Section */}
                <section className="space-y-12 pt-12 border-t border-white/5">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 font-mono text-[10px] text-blue-400 uppercase tracking-widest">
                            <Sparkles size={14} /> Living Civilization
                        </div>
                        <h2 className="text-3xl md:text-5xl font-serif font-black leading-tight">
                            A Story Carved <br />
                            <span className="text-amber-500 italic">In High Altitude</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                            <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4">The People</h4>
                            <p className="text-gray-400 text-base leading-relaxed">
                                Kibber is more than a village; it is a <span className="text-white font-bold">Living Civilization</span> of about 500 souls. From tantriks and blacksmiths to farmers and drummers, we are a self-sustaining community preserving traditions for centuries.
                            </p>
                        </div>
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                            <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4">The First Road</h4>
                            <p className="text-gray-400 text-base leading-relaxed">
                                History remembers that when the first roads were carved from Manali, <span className="text-white font-bold">Kibber</span> was connected right after Rangrik—long before Kaza. For decades, we stood as Asia's highest motorable village.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900/20 to-black p-8 md:p-12 rounded-[2.5rem] border border-blue-500/20 space-y-6">
                        <h3 className="text-2xl font-serif font-bold flex items-center gap-3 italic">
                            Gateway to the Wild
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            Kibber Wildlife Sanctuary is a global hub for wildlife videography. Giants like <span className="text-white font-bold">NetGeo, BBC, and Netflix</span> visit annually to film the elusive Snow Leopard. Before roads stretched further, the legendary Parangla Pass trek to Leh Ladakh started right here at our doorstep.
                        </p>
                    </div>
                </section>

                {/* Chef Section */}
                <section className="space-y-12 pt-12 border-t border-white/5">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 font-mono text-[10px] text-pink-400 uppercase tracking-widest">
                            <Utensils size={14} /> The Mastermind
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight">
                            The <span className="text-pink-500 italic">Soul</span> of TashiZom
                        </h2>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group">
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-1/2 relative aspect-square">
                                {landingPhotos?.chefPhoto ? (
                                    <img src={landingPhotos.chefPhoto} alt="Chef Lalit" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                        <Utensils size={48} className="text-gray-700" />
                                    </div>
                                )}
                                <div className="absolute bottom-6 left-6">
                                    <div className="px-3 py-1 bg-pink-600 rounded-full text-[10px] font-black uppercase">
                                        Since 2004
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-6">
                                <h3 className="text-3xl font-black font-serif uppercase tracking-tight">Chef Lalit Kumar</h3>
                                <p className="text-gray-400 text-lg leading-relaxed italic">
                                    "Chef Lalit has been the pillar of TashiZom's kitchen for over two decades. His passion for Himalayan flavors is what makes every meal here special."
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-pink-500" />
                                        <p className="text-sm font-bold">Master of Multi-cuisine</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-pink-500" />
                                        <p className="text-sm font-bold">Preserving Ancient Flavors</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-pink-500" />
                                        <p className="text-sm font-bold">Top-Rated Mountain Cuisine</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Closing thought */}
                <section className="text-center py-12 space-y-6">
                    <Sparkles className="mx-auto text-amber-500" size={32} />
                    <h3 className="text-2xl font-serif italic text-gray-400">Join our journey and taste the history of Kibber village.</h3>
                </section>
            </main>
        </div>
    );
}
