'use client';

import LocalMapGuide from '@/app/customer/components/LocalMapGuide';
import Link from 'next/link';
import { ArrowLeftRight, ArrowRight, MapPin, Clock, Star, Users, Utensils, Newspaper, ShoppingBag, PlayCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function Home() {
  const [showFood, setShowFood] = useState(true);
  const reviews = useStore((state: any) => state.reviews);
  const menu = useStore((state: any) => state.menu);
  const landingPhotos = useStore((state: any) => state.landingPhotos);
  const initialize = useStore((state: any) => state.initialize);
  const valleyUpdates = useStore((state: any) => state.valleyUpdates) || [];
  const gearItems = useStore((state: any) => state.gearItems);
  const menuAppearance = useStore((state: any) => state.menuAppearance);

  const [fullScreenMedia, setFullScreenMedia] = useState<{ url: string; type: 'image' | 'video'; title: string } | null>(null);

  useEffect(() => {
    // Clear previous table session for generic app entry
    useStore.getState().setTableId(null);

    initialize();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          useStore.getState().recordScan('app_qr', { path: '/' }, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        () => {
          useStore.getState().recordScan('app_qr', { path: '/' });
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      useStore.getState().recordScan('app_qr', { path: '/' });
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowFood((prev) => !prev);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-tashi-dark relative overflow-x-hidden">
      {/* --- PRAYER FLAGS SECTION --- */}
      {landingPhotos?.prayerFlags && (
        <div className="absolute top-0 left-0 right-0 z-[100] h-10 md:h-12 overflow-hidden flex pointer-events-none select-none border-b border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="flex animate-[flags_30s_linear_infinite] min-w-full">
            {[...Array(10)].map((_, i) => (
              <img key={i} src={landingPhotos.prayerFlags} alt="" className="h-full w-auto object-contain flex-shrink-0" title="Tashi Delek" />
            ))}
            {[...Array(10)].map((_, i) => (
              <img key={`dup-${i}`} src={landingPhotos.prayerFlags} alt="" className="h-full w-auto object-contain flex-shrink-0" />
            ))}
          </div>
        </div>
      )}

      {/* --- HERO SECTION (100vh) --- */}
      <section className="h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
        {/* --- MODE 1: FULL SCREEN FOOD BACKGROUND --- */}
        <div
          className={`absolute inset-0 z-0 transition-opacity duration-[2000ms] ease-in-out ${showFood ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img
            src="/tashizom-new-bg.jpg"
            alt="Food Spread at TashiZom"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* --- MODE 2: 3-SECTION BUILDING SPLIT --- */}
        <div
          className={`absolute inset-0 z-10 flex flex-col transition-opacity duration-[2000ms] ease-in-out ${!showFood ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex-1 relative overflow-hidden group border-b border-black/20">
            <div className="absolute inset-0 bg-black/20 z-10" />
            <img src="/tashizom-summer.jpg" alt="TashiZom Summer View" className="w-full h-full object-cover object-center" />
          </div>
          <div className="flex-1 relative overflow-hidden group border-y border-black/20">
            <div className="absolute inset-0 bg-black/20 z-10" />
            <img src="/tashizom-winter.jpg" alt="TashiZom Winter View" className="w-full h-full object-cover object-center" />
          </div>
          <div className="flex-1 relative overflow-hidden group border-t border-black/20">
            <div className="absolute inset-0 bg-black/20 z-10" />
            <img src="/tashizom-night.jpg" alt="TashiZom Night View" className="w-full h-full object-cover object-center" />
          </div>
        </div>


        {/* Hero Content */}
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col pt-12 pb-12 items-center">
          <div className="flex-1 flex flex-col items-center justify-start pt-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="pointer-events-auto text-center flex items-center justify-center gap-2 md:gap-8">
              {landingPhotos?.prayerWheel && (
                <img
                  src={landingPhotos.prayerWheel}
                  className="w-16 h-16 md:w-28 md:h-28 object-contain drop-shadow-[0_0_15px_rgba(218,165,32,0.5)]"
                />
              )}
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter font-serif flex flex-row items-center justify-center whitespace-nowrap">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-amber-200 via-tashi-accent to-amber-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  Tash
                </span>
                <span className="relative inline-flex items-center justify-center px-[0.02em]">
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-amber-200 via-tashi-accent to-amber-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                    i
                  </span>
                  <motion.img
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.8, type: 'spring', damping: 15 }}
                    src="/logo_crest.png"
                    className="absolute bottom-[85%] left-1/2 -translate-x-1/2 w-[0.7em] h-[0.7em] rounded-full border-2 border-amber-500/80 shadow-[0_0_20px_rgba(218,165,32,0.6)] z-[100] bg-black/40 backdrop-blur-sm object-cover pointer-events-none"
                    alt="Logo"
                  />
                </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-amber-200 via-tashi-accent to-amber-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  Zom
                </span>
              </h1>
              {landingPhotos?.prayerWheel && (
                <img
                  src={landingPhotos.prayerWheel}
                  className="w-16 h-16 md:w-28 md:h-28 object-contain drop-shadow-[0_0_15px_rgba(218,165,32,0.5)]"
                />
              )}
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-between py-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="pointer-events-auto text-center mt-2 group">
              <div className="relative inline-block">
                <p className="text-xl md:text-4xl text-amber-200 font-serif italic font-bold tracking-[0.2em] drop-shadow-xl px-4 text-center">
                  Multi-Cuisine Restaurant
                </p>
                <div className="h-[2px] w-0 group-hover:w-full bg-tashi-accent transition-all duration-700 mt-1 mx-auto" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }} className="flex flex-col items-center mb-2">
              <div className="flex items-center gap-4 text-white/40 mb-2">
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/20" />
                <span className="text-[10px] uppercase tracking-[0.6em] font-bold">The Spiti Valley</span>
                <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white/20" />
              </div>
              <div className="text-white font-serif tracking-[0.6em] uppercase text-lg md:text-2xl font-bold drop-shadow-glow">
                Kibber
              </div>
              <div className="text-amber-500/80 font-serif text-xs md:text-sm tracking-[0.2em] mt-2 italic font-medium drop-shadow-md flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                All Season Open
              </div>
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-start pt-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.4 }} className="pointer-events-auto text-center">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <Link
                  href="/customer/menu"
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-b from-amber-400 to-amber-600 text-tashi-dark px-10 py-4 rounded-xl font-black shadow-[0_0_30px_rgba(218,165,32,0.3)] hover:shadow-[0_0_50px_rgba(218,165,32,0.5)] transition-all duration-500 active:scale-95"
                >
                  <span className="relative z-10 text-lg md:text-xl font-serif uppercase tracking-widest">Discover Flavors</span>
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
                </Link>

                <button
                  onClick={() => {
                    document.getElementById('valley-essentials')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border border-white/20 transition-all flex items-center gap-3"
                >
                  <Newspaper size={20} className="text-blue-400" />
                  LATEST NEWS
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 z-40 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
          <img src="/tashi-corner.png" alt="" className="w-full h-full object-contain filter invert-[.25] sepia saturate-[5] hue-rotate-[20deg] brightness-[1.1] contrast-[1.2] drop-shadow-lg" />
        </div>
        <div className="absolute top-0 right-0 z-40 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
          <img src="/tashi-corner.png" alt="" className="w-full h-full object-contain -scale-x-100 filter invert-[.25] sepia saturate-[5] hue-rotate-[20deg] brightness-[1.1] contrast-[1.2] drop-shadow-lg" />
        </div>
        <div className="absolute bottom-0 left-0 z-40 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
          <img src="/tashi-corner.png" alt="" className="w-full h-full object-contain -scale-y-100 filter invert-[.25] sepia saturate-[5] hue-rotate-[20deg] brightness-[1.1] contrast-[1.2] drop-shadow-lg" />
        </div>
        <div className="absolute bottom-0 right-0 z-40 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
          <img src="/tashi-corner.png" alt="" className="w-full h-full object-contain rotate-180 filter invert-[.25] sepia saturate-[5] hue-rotate-[20deg] brightness-[1.1] contrast-[1.2] drop-shadow-lg" />
        </div>
      </section>

      {/* --- SEO CONTENT SECTION --- */}
      <section className="bg-black py-20 px-6 relative z-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-6 mb-6">
              {landingPhotos?.prayerWheel && (
                <img
                  src={landingPhotos.prayerWheel}
                  className="w-12 h-12 md:w-20 md:h-20 object-contain"
                />
              )}
              <h2 className="text-3xl md:text-5xl font-serif font-black text-amber-500">Welcome to TashiZom Kibber</h2>
              {landingPhotos?.prayerWheel && (
                <img
                  src={landingPhotos.prayerWheel}
                  className="w-12 h-12 md:w-20 md:h-20 object-contain"
                />
              )}
            </div>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-8 rounded-full" />
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-light">
              Located at the heart of <span className="text-amber-400 font-bold">Kibber Village</span> at 4,270 Meters (14,009 Feet),
              TashiZom is Spiti Valley's premier multi-cuisine destination. We believe food is a journey, and every dish
              we serve carries the essence of the high Himalayas.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20 text-center">
            {/* Prime Location */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors group flex flex-col h-full">
                <MapPin className="w-10 h-10 text-amber-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-xl mb-2">Prime Location</h3>
                <p className="text-gray-400 text-sm flex-1 leading-relaxed">
                  Ideally situated in <span className="text-white font-medium">Kibber Village</span>, just a few minutes away from the iconic <span className="text-white font-medium">Chicham Bridge</span> and the historic <span className="text-white font-medium">Kee Monastery</span>. Our restaurant serves as the perfect pitstop for travelers exploring the high-altitude wonders of Spiti.
                </p>
                {landingPhotos?.location?.length > 0 && (
                  <div className="mt-6 flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
                    {landingPhotos.location.map((url: string, i: number) => {
                      const isVideo = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('facebook.com') || url.includes('fb.watch') || url.includes('instagram.com') || url.endsWith('.mp4');
                      const title = landingPhotos.locationCaptions?.[btoa(url).substring(0, 100)] || 'Prime Location';

                      return (
                        <div
                          key={i}
                          className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10 snap-center relative group/img cursor-zoom-in"
                          onClick={() => setFullScreenMedia({ url, type: isVideo ? 'video' : 'image', title })}
                        >
                          {isVideo ? (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                              <PlayCircle className="text-white/50" size={32} />
                            </div>
                          ) : (
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          )}
                          {landingPhotos.locationCaptions?.[btoa(url).substring(0, 100)] && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                              <span className="text-[8px] text-white font-bold leading-tight line-clamp-2">
                                {landingPhotos.locationCaptions[btoa(url).substring(0, 100)]}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Authentic Taste */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors group flex flex-col h-full">
                <Utensils className="w-10 h-10 text-amber-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-xl mb-2">Authentic Taste</h3>
                <p className="text-gray-400 text-sm flex-1">From local Spitian Thukpa to North Indian classics and Pizzas.</p>
                {menu.filter((m: any) => m.isChefSpecial && m.image).length > 0 && (
                  <div className="mt-6 flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
                    {menu.filter((m: any) => m.isChefSpecial && m.image).map((item: any, i: number) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10 snap-center relative cursor-zoom-in group/food"
                        onClick={() => setFullScreenMedia({ url: item.image, type: 'image', title: item.name })}
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 group-hover/food:bg-black/60 transition-colors flex items-end p-1">
                          <span className="text-[7px] text-white font-bold leading-tight">{item.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Open Always */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors group flex flex-col h-full">
                <Clock className="w-10 h-10 text-amber-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-xl mb-2">Open Always</h3>
                <p className="text-gray-400 text-sm flex-1 leading-relaxed">
                  We are proud to be the only restaurant in <span className="text-white font-medium">Kibber</span> that remains open throughout the harsh <span className="text-white font-medium">winter season</span>. Whether it's heavy snow or sub-zero temperatures, TashiZom continues to serve hot, fresh meals to locals and adventure seekers alike.
                </p>
                {landingPhotos?.climate?.length > 0 && (
                  <div className="mt-6 flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
                    {landingPhotos.climate.map((url: string, i: number) => {
                      const isVideo = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('facebook.com') || url.includes('fb.watch') || url.includes('instagram.com') || url.endsWith('.mp4');
                      const title = landingPhotos.climateCaptions?.[btoa(url).substring(0, 100)] || 'Winter Condition';

                      return (
                        <div
                          key={i}
                          className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10 snap-center relative group/img cursor-zoom-in"
                          onClick={() => setFullScreenMedia({ url, type: isVideo ? 'video' : 'image', title })}
                        >
                          {isVideo ? (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                              <PlayCircle className="text-white/50" size={32} />
                            </div>
                          ) : (
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          )}
                          {landingPhotos.climateCaptions?.[btoa(url).substring(0, 100)] && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                              <span className="text-[8px] text-white font-bold leading-tight line-clamp-3">
                                {landingPhotos.climateCaptions[btoa(url).substring(0, 100)]}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* --- CUSTOM MAP SECTION (New Location) --- */}
          {landingPhotos?.customMap && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group mt-16 mb-20"
            >
              <div className="absolute inset-0 bg-amber-500/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4 font-mono text-[10px] text-amber-400 uppercase tracking-widest">
                  Cartography
                </div>
                <h3 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">
                  <span className="text-amber-500 italic">Gateway</span> to the Wild
                </h3>
              </div>

              <div
                className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl cursor-zoom-in w-full md:max-w-4xl mx-auto"
                onClick={() => setFullScreenMedia({ url: landingPhotos.customMap!, type: 'image', title: 'Hand-drawn Valley Map' })}
              >
                <img src={landingPhotos.customMap} alt="Custom Valley Map" className="w-full h-auto" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
              </div>

              {/* Travel Info Box Below Map */}
              <div className="mt-8 max-w-4xl mx-auto">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-500 rounded-lg text-black mt-1">
                      <Info size={20} strokeWidth={3} />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-white font-bold text-lg uppercase tracking-tight">Traveler's Guide & Connectivity</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <p className="text-gray-300 text-sm leading-relaxed font-medium italic border-l-2 border-amber-500/30 pl-4">
                          "If you are traveling from <span className="text-white font-bold">Kee Monastery</span> towards <span className="text-amber-400">Chicham Bridge</span>, you can pass directly through <span className="text-white">TashiZom</span>—the road is fully connected."
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed font-medium italic border-l-2 border-amber-500/30 pl-4">
                          "Similarly, after arriving at <span className="text-white">TashiZom</span> from <span className="text-amber-400">Chicham Bridge</span>, you can proceed directly towards <span className="text-white font-bold">Kaza</span>. There is no need to go back via Chicham."
                        </p>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80">
                        <Clock size={14} /> Seasonal Note: This road is open in SUMMER and remains closed during WINTER.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- INTERACTIVE ROAD LOOP GUIDE --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 font-mono text-[10px] text-blue-400 uppercase tracking-widest">
                Interactive Loop
              </div>
              <h3 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">
                Smart <span className="text-blue-500 italic">Travel</span> Guide
              </h3>
              <p className="text-gray-400 text-sm mt-4 font-medium max-w-2xl mx-auto">
                Discover the road connectivity between Kee, TashiZom, and Chicham. Play the guide to see the exact loop!
              </p>
            </div>

            <div className="max-w-4xl mx-auto rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.1)]">
              <LocalMapGuide autoPlay={false} />
            </div>
          </motion.div>

          {/* SEO and Order Ahead Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-amber-900/40 to-black border border-amber-500/20 p-8 md:p-12 rounded-3xl text-center"
          >
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-amber-200 mb-6 italic tracking-tight">The Authentic Taste of Spiti Valley</h3>
            <p className="text-gray-300 md:text-lg leading-relaxed mb-10 font-medium">
              Nestled in the beautiful valleys of Kibber Village, TashiZom offers you the warmth of home-cooked flavors and the freshness of the mountains. We are not just a restaurant, but a junction of Spitian culture and traditions. Whether you are visiting Kee Monastery or Chicham Bridge, a stop at TashiZom will make your journey unforgettable.
            </p>

            {/* QR Code Pre-ordering Feature */}
            <div className="bg-white/5 border border-amber-500/30 rounded-3xl p-8 mb-8 backdrop-blur-md relative overflow-hidden group/qr">
              <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover/qr:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30 group-hover/qr:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-black text-amber-300 tracking-tight">Order Ahead, Eat Fresh & Hot!</h4>
                </div>

                <p className="text-gray-200 leading-relaxed text-base md:text-xl font-semibold mb-6">
                  Visiting <span className="text-amber-500 underline decoration-2 underline-offset-4">Chicham Bridge</span> or <span className="text-amber-500 underline decoration-2 underline-offset-4">Kee Monastery</span>?
                  Don't wait in line! Simply scan our <span className="text-white font-black bg-amber-500/20 px-2 py-0.5 rounded">QR Code</span> and place your order in advance.
                  By the time you reach TashiZom, your <span className="text-amber-300 font-bold">hot and fresh meal</span> will be ready for you!
                </p>

                <div className="inline-flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-amber-500/20">
                  <span className="text-amber-500 animate-pulse text-lg">🎯</span>
                  <p className="text-amber-400/90 text-sm font-bold uppercase tracking-widest">
                    Our QR Codes are placed throughout Spiti Valley - Scan to start!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black text-amber-500/40 uppercase tracking-[0.3em]">
              <span className="hover:text-amber-500 transition-colors cursor-default">#BestRestaurantInSpiti</span>
              <span className="hover:text-amber-500 transition-colors cursor-default">#KibberFood</span>
              <span className="hover:text-amber-500 transition-colors cursor-default">#SpitiValleyLife</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- KIBBER LEGACY & HISTORY SECTION --- */}
      <section className="bg-tashi-dark py-24 px-6 relative overflow-hidden border-t border-white/5">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row gap-16 items-start">

            {/* Left Column: The Story */}
            <div className="flex-1 space-y-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6 font-mono text-[10px] text-amber-500 uppercase tracking-widest">
                  Our Legacy
                </div>
                <h2 className="text-4xl md:text-6xl font-serif font-black text-gray-900 mb-6 leading-tight">
                  A Story Carved <br />
                  <span className="text-amber-600 italic">In High Altitude</span>
                </h2>
                <p className="text-gray-700 text-xl md:text-2xl leading-relaxed">
                  Our journey began in <span className="text-tashi-primary font-bold underline decoration-amber-500 decoration-2 underline-offset-4">1998</span>.
                  Originally registered as <span className="text-amber-600 italic font-bold">'Resang Hotel'</span> with the Himachal Tourism Department,
                  we later evolved into <span className="text-tashi-primary font-black">TashiZom</span>. Though heavy Himalayan rains once took our rooms,
                  leaving only our legendary restaurant, we are currently rebuilding. Soon, you will again be able
                  to wake up to the clouds in our brand new guest rooms.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-4 border-l-2 border-amber-500/30 pl-6">
                  <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs">The Civilization</h4>
                  <p className="text-gray-700 text-base leading-relaxed font-semibold">
                    Kibber is more than a village; it is a <span className="text-tashi-primary font-bold">Living Civilization</span> of about 500 souls.
                    From tantriks and blacksmiths to farmers and drummers, we are a self-sustaining community
                    preserving traditions for centuries.
                  </p>
                </div>
                <div className="space-y-4 border-l-2 border-amber-500/30 pl-6">
                  <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs">The First Road</h4>
                  <p className="text-gray-700 text-base leading-relaxed font-semibold">
                    History remembers that when the first roads were carved from Manali,
                    <span className="text-tashi-primary font-bold"> Kibber</span> was connected right after Rangrik—long before Kaza.
                    For decades, we stood as Asia's highest motorable village.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Adventure & Nature */}
            <div className="flex-1 w-full space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm shadow-2xl"
              >
                <h3 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-3">
                  <Users className="text-amber-500" /> Gateway to the Wild
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <p className="text-gray-800 text-lg">
                      Kibber Wildlife Sanctuary is a global hub for wildlife videography.
                      Giants like <span className="text-amber-600 font-bold">NetGeo, BBC, and Netflix</span> visit annually
                      to film the elusive <span className="text-tashi-primary font-bold">Snow Leopard</span>.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <p className="text-gray-800 text-lg">
                      Before roads stretched further, the legendary <span className="text-tashi-primary font-bold">Parangla Pass</span> trek to Leh Ladakh
                      started right here at our doorstep in Kibber.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <p className="text-gray-800 text-lg">
                      For those seeking a climb, the summit of <span className="text-tashi-primary font-bold">Mount Kanamo (5000m+)</span>
                      still finds its path starting through the village of Kibber.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 italic text-gray-700 text-base font-bold">
                  "While modern tourism shifts to the towns, the true heart and history of Spiti still beat in Kibber."
                </div>
              </motion.div>
            </div>

          </div>

          {/* --- HERITAGE SECTION (Relocated) --- */}
          {landingPhotos?.registrationDoc && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center gap-16"
            >
              <div
                className="flex-1 w-full max-w-2xl cursor-zoom-in order-2 md:order-1"
                onClick={() => setFullScreenMedia({ url: landingPhotos.registrationDoc!, type: 'image', title: 'Original Registration Document' })}
              >
                <div className="relative group">
                  <div className="absolute -inset-4 bg-amber-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-white p-4 md:p-8 rounded-lg shadow-2xl transform group-hover:rotate-1 transition-transform duration-500">
                    <img src={landingPhotos.registrationDoc} alt="First Registration" className="w-full h-auto border border-gray-200" />
                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                      <span className="text-gray-400 font-serif italic">Historical Archive - 1995</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-8 text-left order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 font-mono text-[10px] text-amber-400 uppercase tracking-widest">
                  Our Roots
                </div>
                {/* ... text content remains same ... */}
                <h2 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight">
                  A Legacy of <span className="text-amber-500 italic">Hospitality</span>
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  टशीज़ोम isn't just a business; it's a dream that started with a single piece of paper and a heart full of hope. This original registration document marks the beginning of our journey to bring world-class hospitality to the Roof of the World.
                </p>
                <div className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500"><Clock size={24} /></div>
                  <div>
                    <h4 className="text-white font-bold">Since the Early Days</h4>
                    <p className="text-gray-400 text-sm">Committed to serving the Spiti community and travelers alike.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- THE SOUL OF TASHIZOM: MEET OUR CHEF --- */}
          <div className="mt-24 space-y-12">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6 font-mono text-[10px] text-pink-400 uppercase tracking-widest">
                The Heart of our Kitchen
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-black text-white mb-6">The <span className="text-amber-500 italic">Soul</span> of TashiZom</h2>
            </div>

            <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-pink-500/30 transition-all shadow-2xl">
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-2/5 aspect-square relative overflow-hidden bg-gray-900">
                  {landingPhotos?.chefPhoto ? (
                    <img src={landingPhotos.chefPhoto} alt="Chef Lalit Kumar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                      <Utensils size={48} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Chef Photo Pending</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <div className="px-3 py-1 rounded-full bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest ">
                      Since 2004
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-3/5 p-8 md:p-12 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-3xl md:text-4xl font-black text-white font-serif uppercase tracking-tight">Chef Lalit Kumar</h3>
                    <p className="text-pink-500 font-bold text-sm uppercase tracking-[0.2em]">Master of Himalayan Tastes</p>
                  </div>
                  <p className="text-gray-800 text-xl leading-relaxed italic font-bold">
                    "Chef Lalit has been the pillar of TashiZom's kitchen for over two decades. His passion for authentic Spitian flavors and his mastery over multi-cuisine dishes are what make every meal here a legendary experience."
                  </p>
                  <div className="pt-6 border-t border-white/10 flex items-center gap-6">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Experience</p>
                      <p className="text-white font-bold text-xl">20+ Years</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Speciality</p>
                      <p className="text-white font-bold text-xl">Spitian & Continental</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- MUST VISIT PLACES SECTION --- */}
          <div className="mt-24 space-y-12">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6 font-mono text-[10px] text-amber-500 uppercase tracking-widest">
                Local Wonders
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-black text-white mb-6">Explore the <span className="text-amber-500 italic">Surroundings</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Chicham Bridge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:border-amber-500/50 transition-all shadow-xl flex flex-col"
              >
                {landingPhotos?.chichamPhoto && (
                  <div className="h-48 overflow-hidden relative">
                    <img src={landingPhotos.chichamPhoto} alt="Chicham Bridge" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <div className="p-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500 text-black rounded-2xl shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 18h18M3 6h18M12 3v18" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-white font-serif uppercase tracking-tight">Chicham Bridge</h3>
                  </div>
                  <p className="text-gray-800 text-base leading-relaxed font-bold">
                    Suspended at <span className="text-amber-600 font-black">13,596 feet</span>, Asia's highest bridge connects Kibber to Chicham village. This engineering marvel spans a deep gorge, offering breathtaking views of the Spiti River below and the starkly beautiful mountains around.
                  </p>
                  <div className="pt-4 flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest">
                    <MapPin size={14} /> 10 mins from TashiZom
                  </div>
                </div>
              </motion.div>

              {/* Kee Monastery */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:border-amber-500/50 transition-all shadow-xl flex flex-col"
              >
                {landingPhotos?.keePhoto && (
                  <div className="h-48 overflow-hidden relative">
                    <img src={landingPhotos.keePhoto} alt="Kee Monastery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <div className="p-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500 text-black rounded-2xl shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3L4 9v12h16V9l-8-6zM12 12h.01" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-white font-serif uppercase tracking-tight">Kee Monastery</h3>
                  </div>
                  <p className="text-gray-800 text-base leading-relaxed font-bold">
                    A <span className="text-amber-600 font-black">1000-year-old</span> Tibetan Buddhist monastery that looks like a fortress on a hill. It is the largest in Spiti, housing priceless murals, thangkas, and ancient scriptures. A center for spiritual learning that feels frozen in time.
                  </p>
                  <div className="pt-4 flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest">
                    <MapPin size={14} /> 15 mins from TashiZom
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Background Texture Element */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />
      </section>

      {/* --- VALLEY ESSENTIALS (Transferred from Menu) --- */}
      <section id="valley-essentials" className="bg-black py-24 px-6 relative overflow-hidden border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-24">

          {/* 1. Valley Updates Section */}
          {valleyUpdates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 font-mono text-[10px] text-blue-400 uppercase tracking-widest">
                    Live Status
                  </div>
                  <h2 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight">
                    Valley <span className="text-blue-400 italic">Updates</span>
                  </h2>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm max-w-sm">
                  <p className="text-gray-400 text-sm italic italic">"Keeping you connected with the pulse of the valley, even when the snow piles high."</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {valleyUpdates.map((update: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${update.statusColor === 'green' ? 'bg-green-500' : update.statusColor === 'blue' ? 'bg-blue-500' : 'bg-red-500'}`} />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{update.status}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{update.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">{update.description}</p>

                    {update.mediaUrl && (
                      <div
                        className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group/media"
                        onClick={() => setFullScreenMedia({ url: update.mediaUrl!, type: update.mediaType === 'video' ? 'video' : 'image', title: update.title })}
                      >
                        {update.mediaType === 'video' ? (
                          <div className="w-full h-full bg-black flex items-center justify-center relative">
                            {/* Smart Video Preview */}
                            {(() => {
                              const isYoutube = update.mediaUrl.includes('youtube.com') || update.mediaUrl.includes('youtu.be');
                              const isFacebook = update.mediaUrl.includes('facebook.com') || update.mediaUrl.includes('fb.watch');
                              const isInstagram = update.mediaUrl.includes('instagram.com');

                              if (isYoutube) {
                                // Improved YouTube ID extraction for multiple formats
                                let videoId = null;

                                // Format: youtube.com/watch?v=VIDEO_ID
                                if (update.mediaUrl.includes('v=')) {
                                  videoId = update.mediaUrl.split('v=')[1]?.split('&')[0]?.split('#')[0];
                                }
                                // Format: youtu.be/VIDEO_ID
                                else if (update.mediaUrl.includes('youtu.be/')) {
                                  videoId = update.mediaUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
                                }
                                // Format: youtube.com/embed/VIDEO_ID
                                else if (update.mediaUrl.includes('/embed/')) {
                                  videoId = update.mediaUrl.split('/embed/')[1]?.split('?')[0];
                                }

                                if (videoId) {
                                  return (
                                    <>
                                      <img
                                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                        alt="YouTube Preview"
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(e) => {
                                          // Fallback to maxresdefault if hqdefault fails
                                          const img = e.target as HTMLImageElement;
                                          if (!img.src.includes('maxresdefault')) {
                                            img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                                          }
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black/30" />
                                      <PlayCircle className="relative z-10 text-white group-hover/media:scale-125 transition-transform drop-shadow-2xl" size={64} />
                                    </>
                                  );
                                }
                              }

                              if (isFacebook) {
                                return (
                                  <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700" />
                                    <div className="relative z-10 text-center">
                                      <PlayCircle className="mx-auto text-white group-hover/media:scale-125 transition-transform drop-shadow-2xl mb-2" size={64} />
                                      <p className="text-white text-xs font-bold">Facebook Video</p>
                                    </div>
                                  </>
                                );
                              }

                              if (isInstagram) {
                                return (
                                  <>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" />
                                    <div className="relative z-10 text-center">
                                      <PlayCircle className="mx-auto text-white group-hover/media:scale-125 transition-transform drop-shadow-2xl mb-2" size={64} />
                                      <p className="text-white text-xs font-bold uppercase tracking-widest">Instagram Reel</p>
                                    </div>
                                  </>
                                );
                              }

                              // Direct video URLs
                              return (
                                <>
                                  <video
                                    src={update.mediaUrl}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    muted loop playsInline
                                  />
                                  <div className="absolute inset-0 bg-black/40" />
                                  <PlayCircle className="relative z-10 text-white group-hover/media:scale-125 transition-transform drop-shadow-2xl" size={64} />
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <img src={update.mediaUrl} alt="" className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-700" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-white text-xs font-bold flex items-center gap-2">View Highlight <ArrowRight size={14} /></span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 2. Local Winter Gears Section */}
          {gearItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4 font-mono text-[10px] text-orange-400 uppercase tracking-widest">
                    Spiti Handmade
                  </div>
                  <h2 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight">
                    Local <span className="text-orange-400 italic">Winter Gears</span>
                  </h2>
                </div>
                <Link href="/customer/menu" className="group h-fit px-8 py-4 bg-orange-500 text-black font-black rounded-xl hover:bg-orange-400 transition-all flex items-center gap-3">
                  SHOP GEAR <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {gearItems.slice(0, 4).map((item: any) => (
                  <GearItemCard
                    key={item.id}
                    name={item.name}
                    price={item.price}
                    items={item.items}
                    badge={item.badge}
                    available={item.available}
                  />
                ))}
              </div>
            </motion.div>
          )}


        </div>
      </section>
      {
        reviews && reviews.length > 0 && (
          <section className="bg-tashi-dark py-20 px-6 border-t border-white/5">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-serif font-black text-gray-900">Guest Stories</h2>
                  <p className="text-gray-700 mt-2 font-bold italic text-lg">"Hear what travelers say about us"</p>
                </div>
                <div className="flex items-center gap-4 bg-amber-500/10 px-6 py-3 rounded-2xl border border-amber-500/20">
                  <Star className="text-amber-500 fill-amber-500" size={24} />
                  <span className="text-2xl font-bold text-gray-900">4.9 / 5</span>
                  <span className="text-gray-600 text-sm font-bold">({reviews.length} reviews)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.slice(0, 3).map((review: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl relative"
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, star) => (
                        <Star key={star} size={14} className={star < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-600'} />
                      ))}
                    </div>
                    <p className="text-gray-800 text-base italic mb-6 leading-relaxed font-bold">"{review.comment}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
                        {review.customerName?.charAt(0) || 'G'}
                      </div>
                      <div>
                        <h4 className="text-gray-900 text-base font-black">{review.customerName || 'Happy Guest'}</h4>
                        <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Verified Review</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link href="/customer/menu" className="text-amber-500 font-bold hover:underline underline-offset-8">
                  View more experiences & menu →
                </Link>
              </div>
            </div>
          </section>
        )
      }

      {/* Footer Branding */}
      <footer className="bg-black py-16 border-t border-white/5 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="space-y-6 text-center md:text-left">
            <img src="/logo_crest.png" alt="TashiZom Logo" className="w-16 h-16 grayscale opacity-80 mx-auto md:mx-0 shadow-glow" />
            <h3 className="text-2xl font-serif font-black text-white tracking-widest">TashiZom</h3>
            <p className="text-gray-400 text-sm italic font-medium leading-relaxed">
              Serving warmth and authenticity at the roof of the world. Kibber's pride since 1998.
            </p>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <h4 className="text-amber-500 font-bold uppercase tracking-[0.3em] text-[10px]">Contact Us</h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">TashiZom Front Desk</p>
                <p className="text-white text-lg font-bold">+91 94186 12295</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Chef Lalit Kumar</p>
                <p className="text-white text-lg font-bold">+91 97363 30290</p>
              </div>
              <p className="text-gray-400 text-sm">V.P.O. Kibber, Spiti Valley,<br />Lahaul & Spiti, H.P. 172114</p>
              <p className="text-amber-500/80 text-xs font-mono">tashizomkibber@gmail.com</p>
            </div>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <h4 className="text-amber-500 font-bold uppercase tracking-[0.3em] text-[10px]">Follow Our Journey</h4>
            <div className="flex justify-center md:justify-start gap-6">
              <a href="https://www.instagram.com/tashi_zom/" target="_blank" className="p-3 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-full text-white hover:scale-110 transition-all shadow-xl border border-white/20">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61557485935703" target="_blank" className="p-3 bg-[#1877F2] rounded-full text-white hover:scale-110 transition-all shadow-xl border border-white/20">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" /></svg>
              </a>
            </div>
            <p className="text-gray-500 text-xs font-medium pt-4">Tag us: #TashiZomKibber</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-[10px] text-gray-500 font-mono tracking-[0.4em] uppercase">
            © 2026 TashiZom Kibber | All Rights Reserved
          </span>
          <div className="flex gap-8 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
            <span>Spiti Valley</span>
            <span>4,270 Meters</span>
            <span>Est. 1998</span>
          </div>
        </div>
      </footer>


      {/* Media Modal */}
      <AnimatePresence>
        {fullScreenMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <button
              onClick={() => setFullScreenMedia(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X size={32} />
            </button>
            <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl relative bg-black">
              {fullScreenMedia.type === 'video' ? (
                // Helper to determine video type
                (() => {
                  const url = fullScreenMedia.url;
                  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
                  const isFacebook = url.includes('facebook.com') || url.includes('fb.watch');
                  const isInstagram = url.includes('instagram.com');

                  if (isYoutube) {
                    const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
                    return <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />;
                  }
                  if (isFacebook) {
                    return <iframe
                      src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=1`}
                      className="w-full h-full"
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                    />;
                  }
                  if (isInstagram) {
                    const cleanUrl = url.split('?')[0];
                    const embedUrl = cleanUrl.endsWith('/') ? `${cleanUrl}embed` : `${cleanUrl}/embed`;
                    return <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allowTransparency={true}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                    />;
                  }
                  return <video src={fullScreenMedia.url} className="w-full h-full object-contain" controls autoPlay />;
                })()
              ) : (
                <img src={fullScreenMedia.url} className="w-full h-full object-contain" alt="" />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-2xl font-serif font-black text-white">{fullScreenMedia.title}</h2>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main >
  );
}

// Reusing GearItemCard component
const GearItemCard = ({ name, price, items, badge, available }: { name: string, price: number, items: { url: string, label: string, details?: string, worn?: boolean }[], badge: string, available?: boolean }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full group hover:bg-white/10 transition-all">
      <div className="h-48 relative overflow-hidden" onClick={() => setCurrentIdx((currentIdx + 1) % items.length)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <img
              src={items[currentIdx].url}
              alt={name}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!available ? 'grayscale opacity-50' : ''}`}
            />

            {!available && (
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-2xl border border-white/20 uppercase tracking-widest rotate-[-12deg]">
                  Out of Stock
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-4 left-4 flex flex-col gap-1">
          <div className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full border border-white/10 w-fit uppercase tracking-widest">
            {badge}
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {items.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIdx ? 'bg-amber-500 w-4' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-white font-bold text-sm mb-2 line-clamp-1">{name}</h3>
          <div className="flex justify-between items-center">
            <span className="text-amber-500 font-black font-serif text-lg">₹{price}</span>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {items[currentIdx].label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
