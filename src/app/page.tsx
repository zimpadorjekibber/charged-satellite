'use client';

import LocalMapGuide from '@/app/customer/components/LocalMapGuide';
import Link from 'next/link';
import { ArrowLeftRight, ArrowRight, MapPin, Clock, Star, Users, Utensils, Newspaper, ShoppingBag, PlayCircle, Info, X, Home as HomeIcon, ChevronRight, Phone, ShieldCheck } from 'lucide-react';
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
  const homestays = useStore((state: any) => state.homestays) || [];
  const gearItems = useStore((state: any) => state.gearItems) || [];
  const menuAppearance = useStore((state: any) => state.menuAppearance);

  const [fullScreenMedia, setFullScreenMedia] = useState<{ items: { url: string; type: 'image' | 'video'; title: string }[]; index: number } | null>(null);

  const navigateMedia = (direction: 'next' | 'prev') => {
    if (!fullScreenMedia) return;
    const { items, index } = fullScreenMedia;
    let newIndex = direction === 'next' ? index + 1 : index - 1;
    if (newIndex >= items.length) newIndex = 0;
    if (newIndex < 0) newIndex = items.length - 1;
    setFullScreenMedia({ items, index: newIndex });
  };

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
          className={`absolute inset-0 z-[5] flex flex-col transition-opacity duration-[2000ms] ease-in-out ${!showFood ? 'opacity-100' : 'opacity-0'}`}
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
                <span className="relative inline-flex items-center justify-center px-0"> {/* Removed px-2 to fix spacing */}
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-amber-200 via-tashi-accent to-amber-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                    i
                  </span>
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
              <Link
                href="/customer/menu"
                className="group relative inline-flex items-center gap-3 bg-gradient-to-b from-amber-400 to-amber-600 text-tashi-dark px-10 py-4 rounded-xl font-black shadow-[0_0_30px_rgba(218,165,32,0.3)] hover:shadow-[0_0_50px_rgba(218,165,32,0.5)] transition-all duration-500 active:scale-95 mb-6"
              >
                <span className="relative z-10 text-lg md:text-xl font-serif uppercase tracking-widest">Digital Menu</span>
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
              </Link>

              <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
                <p className="text-[10px] text-amber-500/80 font-black uppercase tracking-widest animate-pulse">
                  Hungry? Call Chef Directly!
                </p>
                {/* Primary Contact - Chef */}
                <a href="tel:+919736330290" className="flex items-center justify-between w-full bg-amber-500 text-black px-5 py-3 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:bg-amber-400 transition-all font-bold group active:scale-95 border-2 border-amber-500">
                  <div className="flex items-center gap-3">
                    <div className="bg-black/10 p-2.5 rounded-full">
                      <Utensils size={20} className="text-black" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-70 leading-none mb-0.5">Cafe / Chef Order</span>
                      <span className="text-base font-black font-mono tracking-wide">+91 97363 30290</span>
                    </div>
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest border border-black/20 px-2 py-1 rounded bg-black/5">
                    Call 1st
                  </div>
                </a>

                {/* Secondary Contacts - Front Desk & WhatsApp */}
                <div className="flex gap-3 w-full">
                  <a href="tel:+919418612295" className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white px-3 py-3 rounded-xl transition-all active:scale-95 group">
                    <Phone size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[8px] text-gray-500 group-hover:text-gray-300 uppercase tracking-widest leading-none mb-0.5 transition-colors">Front Desk</span>
                      <span className="text-xs font-bold font-mono text-gray-300 group-hover:text-white transition-colors">+91 94186 12295</span>
                    </div>
                  </a>

                  <a href="https://wa.me/919418612295" target="_blank" className="flex items-center justify-center bg-[#25D366]/10 hover:bg-[#25D366]/20 backdrop-blur-md border border-[#25D366]/20 text-white w-14 rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(37,211,102,0.1)] hover:shadow-[0_0_25px_rgba(37,211,102,0.3)]" aria-label="WhatsApp Us">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#25D366]">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </a>
                </div>
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
                          onClick={() => {
                            const items = landingPhotos.location.map((u: string) => {
                              const isVid = u.includes('youtube.com') || u.includes('youtu.be') || u.includes('facebook.com') || u.includes('fb.watch') || u.includes('instagram.com') || u.endsWith('.mp4');
                              const t = landingPhotos.locationCaptions?.[btoa(u).substring(0, 100)] || 'Prime Location';
                              return { url: u, type: isVid ? 'video' : 'image', title: t };
                            });
                            setFullScreenMedia({ items, index: i });
                          }}
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
                        onClick={() => {
                          const items = menu.filter((m: any) => m.isChefSpecial && m.image).map((m: any) => ({ url: m.image, type: 'image', title: m.name }));
                          setFullScreenMedia({ items, index: i });
                        }}
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
                          onClick={() => {
                            const items = landingPhotos.climate.map((u: string) => {
                              const isVid = u.includes('youtube.com') || u.includes('youtu.be') || u.includes('facebook.com') || u.includes('fb.watch') || u.includes('instagram.com') || u.endsWith('.mp4');
                              const t = landingPhotos.climateCaptions?.[btoa(u).substring(0, 100)] || 'Winter Condition';
                              return { url: u, type: isVid ? 'video' : 'image', title: t };
                            });
                            setFullScreenMedia({ items, index: i });
                          }}
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
                onClick={() => setFullScreenMedia({ items: [{ url: landingPhotos.customMap!, type: 'image', title: 'Hand-drawn Valley Map' }], index: 0 })}
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

          {/* --- VILLAGE STAYS DIRECTORY (New Home Feature) --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-12 px-4 md:px-0"
          >
            <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 rounded-[2rem] p-6 md:p-8 relative overflow-hidden group/stays">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover/stays:bg-indigo-500/20 transition-colors duration-1000" />

              <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 font-mono text-[9px] text-indigo-400 uppercase tracking-widest">
                    <HomeIcon size={12} /> Community Stay
                  </div>
                  <h3 className="text-2xl md:text-4xl font-serif font-black text-white leading-tight">
                    Wanderer's <span className="text-indigo-400 italic">Rest</span>
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-md">
                    Verified homestays in <span className="text-white">Kibber, Chicham & Kee</span>. Connect directly with local hosts—no middleman.
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <Link href="/customer/stays" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                      Explore <ArrowRight size={14} />
                    </Link>
                    <div className="flex -space-x-2 items-center">
                      {homestays.slice(0, 3).map((stay: any, i: number) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-indigo-900 overflow-hidden bg-gray-800">
                          {stay.image ? <img src={stay.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[7px] font-bold">{stay.village[0]}</div>}
                        </div>
                      ))}
                      <span className="ml-3 text-[9px] font-black uppercase tracking-tighter text-indigo-400/80">
                        {homestays.length}+ Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-auto grid grid-cols-2 gap-3">
                  <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:border-indigo-500/30 transition-colors min-w-[140px]">
                    <Phone size={14} className="text-indigo-400 mb-2" />
                    <h4 className="text-white text-[11px] font-bold mb-0.5">Direct Booking</h4>
                    <p className="text-gray-500 text-[9px] leading-tight">No commissions.</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:border-indigo-500/30 transition-colors min-w-[140px]">
                    <ShieldCheck size={14} className="text-indigo-400 mb-2" />
                    <h4 className="text-white text-[11px] font-bold mb-0.5">Verified Hosts</h4>
                    <p className="text-gray-500 text-[9px] leading-tight">Trusted homes.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
                    Our QR Codes are placed at all nearby prime locations - Scan to start!
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
      {/* --- KIBBER LEGACY, CHEF & SURROUNDINGS --- */}
      <section className="bg-tashi-dark py-24 px-6 relative overflow-hidden border-t border-white/5">
        <div className="max-w-6xl mx-auto relative z-10 space-y-24">

          {/* 1. Village Heritage Teaser */}
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 font-mono text-[10px] text-amber-500 uppercase tracking-widest">
              Village Heritage
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-gray-900 leading-tight">
              A Story Carved <span className="text-amber-600 italic">In High Altitude</span>
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Kibber is more than just a destination; it's a living civilization of 500 souls, preserving traditions at 14,000 feet. From the first road to the wild Snow Leopards, our roots run deep.
            </p>
            <Link href="/story" className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-amber-700 transition-all shadow-lg mx-auto">
              Learn about our History <ArrowRight size={14} />
            </Link>
          </div>

          {/* 2. Heritage Document Teaser */}
          {landingPhotos?.registrationDoc && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-12 pt-12 border-t border-white/5"
            >
              <div
                className="flex-1 w-full max-w-xl cursor-zoom-in"
                onClick={() => setFullScreenMedia({ items: [{ url: landingPhotos.registrationDoc!, type: 'image', title: 'Original Registration Document' }], index: 0 })}
              >
                {/* ... Document Frame ... */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-[#2a1b0a] rounded-lg shadow-2xl" />
                  <div className="relative bg-[#3d2b1f] p-3 md:p-6 rounded-lg border-[8px] border-[#1a1108]">
                    <div className="bg-[#f4f1ea] p-4 md:p-8 shadow-inner relative overflow-hidden">
                      <img src={landingPhotos.registrationDoc} alt="Heritage" className="w-full h-auto opacity-90" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <h3 className="text-2xl md:text-3xl font-serif font-black text-white leading-tight">
                  A Legacy of <span className="text-amber-500 italic">Hospitality</span>
                </h3>
                <p className="text-gray-400 text-base leading-relaxed">
                  टशीज़ोम isn't just a business; it's a dream that started with a single piece of paper and a heart full of hope.
                </p>
                <Link href="/story" className="inline-flex items-center gap-2 text-amber-500 font-black text-xs uppercase tracking-widest">
                  View Full Document & Story <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}

          {/* 3. Meet the Chef Teaser */}
          <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-pink-500/30 transition-all">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/3 aspect-square relative overflow-hidden bg-gray-900 shrink-0">
                {landingPhotos?.chefPhoto ? (
                  <img src={landingPhotos.chefPhoto} alt="Chef Lalit" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600"><Utensils size={48} /></div>
                )}
              </div>
              <div className="flex-1 p-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 font-mono text-[9px] text-pink-400 uppercase tracking-widest">
                  The Soul of TashiZom
                </div>
                <h3 className="text-2xl font-black text-white font-serif tracking-tight">Chef Lalit Kumar</h3>
                <p className="text-gray-400 text-sm leading-relaxed italic">
                  "Chef Lalit has been the pillar of TashiZom's kitchen for over two decades, mastering both Spitian and Continental flavors."
                </p>
                <Link href="/story" className="inline-flex items-center gap-2 text-pink-500 font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all">
                  Full Interview & Specials <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* 4. Local Wonders Teaser */}
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-serif font-black text-white mb-4">Explore the <span className="text-amber-500 italic">Surroundings</span></h2>
              <p className="text-gray-400 max-w-xl mx-auto text-sm">Beyond our kitchen, Kibber is home to some of Asia's most iconic landmarks.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/explore" className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-amber-500/30 transition-all flex flex-col">
                <div className="h-40 overflow-hidden relative">
                  <img src={landingPhotos?.chichamPhoto} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                  <div className="absolute bottom-3 left-4 text-white font-serif font-black text-sm uppercase">Chicham Bridge</div>
                </div>
                <div className="p-4"><p className="text-gray-400 text-xs leading-relaxed line-clamp-2 italic underline underline-offset-4">Click to see details and directions</p></div>
              </Link>
              <Link href="/explore" className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-amber-500/30 transition-all flex flex-col">
                <div className="h-40 overflow-hidden relative">
                  <img src={landingPhotos?.keePhoto} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                  <div className="absolute bottom-3 left-4 text-white font-serif font-black text-sm uppercase">Kee Monastery</div>
                </div>
                <div className="p-4"><p className="text-gray-400 text-xs leading-relaxed line-clamp-2 italic underline underline-offset-4">Click to see details and directions</p></div>
              </Link>
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
              id="valley-updates"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12 scroll-mt-24"
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
                {valleyUpdates.map((update: any) => (
                  <div key={update.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${update.statusColor === 'green' ? 'bg-green-500' : update.statusColor === 'blue' ? 'bg-blue-500' : 'bg-red-500'}`} />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{update.status}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{update.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">{update.description}</p>

                    {update.mediaUrl && (
                      <div
                        className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group/media"
                        onClick={() => {
                          const items = valleyUpdates.filter((u: any) => u.mediaUrl).map((u: any) => ({ url: u.mediaUrl, type: u.mediaType === 'video' ? 'video' : 'image', title: u.title }));
                          const idx = items.findIndex((item: any) => item.url === update.mediaUrl);
                          setFullScreenMedia({ items, index: idx >= 0 ? idx : 0 });
                        }}
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
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#1877F2] to-[#0051C1]" />
                                    <div className="relative z-10 text-center">
                                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/20">
                                        <PlayCircle className="text-white group-hover/media:scale-110 transition-transform drop-shadow-2xl" size={40} />
                                      </div>
                                      <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Facebook Video</p>
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
              id="village-harvest"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12 scroll-mt-24"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4 font-mono text-[10px] text-orange-400 uppercase tracking-widest">
                    Spiti Handmade
                  </div>
                  <h2 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight mb-4">
                    Local <span className="text-orange-400 italic">Winter Gears & Harvest</span>
                  </h2>
                  <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed italic border-l-2 border-orange-500/30 pl-4">
                    "Authentically handcrafted and harvested by the locals of Kibber Village. These rare items are available for purchase at our place. Please inquire with our staff for availability and details."
                  </p>
                </div>
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

      {reviews && reviews.length > 0 && (
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
      )}

      {/* Footer Branding */}
      <footer className="bg-black py-20 border-t border-white/5 px-6 relative overflow-hidden">
        {/* Decorative Corners for Footer */}
        <div className="absolute top-0 left-0 z-10 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
          <img src="/tashi-corner.png" alt="" className="w-full h-full object-contain filter invert-[.25] sepia saturate-[5] hue-rotate-[20deg] brightness-[1.1] contrast-[1.2] drop-shadow-lg" />
        </div>
        <div className="absolute top-0 right-0 z-10 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
          <img src="/tashi-corner.png" alt="" className="w-full h-full object-contain -scale-x-100 filter invert-[.25] sepia saturate-[5] hue-rotate-[20deg] brightness-[1.1] contrast-[1.2] drop-shadow-lg" />
        </div>
        <div className="absolute bottom-0 left-0 z-10 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
          <img src="/tashi-corner.png" alt="" className="w-full h-full object-contain -scale-y-100 filter invert-[.25] sepia saturate-[5] hue-rotate-[20deg] brightness-[1.1] contrast-[1.2] drop-shadow-lg" />
        </div>
        <div className="absolute bottom-0 right-0 z-10 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
          <img src="/tashi-corner.png" alt="" className="w-full h-full object-contain -scale-100 filter invert-[.25] sepia saturate-[5] hue-rotate-[20deg] brightness-[1.1] contrast-[1.2] drop-shadow-lg" />
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start relative z-10">
          <div className="space-y-6 text-center md:text-left">
            <img src="/tashizom-logo.png" alt="TashiZom Logo" className="w-24 h-24 mx-auto md:mx-0 drop-shadow-glow object-contain" />
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
              <a href="https://www.youtube.com/channel/UCnxqNRN9L_XSfEAgY2ik3Wg" target="_blank" className="p-3 bg-[#FF0000] rounded-full text-white hover:scale-110 transition-all shadow-xl border border-white/20">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
            <p className="text-gray-500 text-xs font-medium pt-4">Tag us: #TashiZomKibber</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
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


      <AnimatePresence>
        {fullScreenMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 touch-none"
          >
            {/* Navigation Controls */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[110]">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-black text-white/70 uppercase">
                  {fullScreenMedia.index + 1} / {fullScreenMedia.items.length}
                </div>
              </div>
              <button
                onClick={() => setFullScreenMedia(null)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X size={32} />
              </button>
            </div>

            {fullScreenMedia.items.length > 1 && (
              <>
                <button
                  onClick={() => navigateMedia('prev')}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[110] p-4 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-all hidden md:block"
                >
                  <ArrowLeftRight className="rotate-180" size={32} />
                </button>
                <button
                  onClick={() => navigateMedia('next')}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[110] p-4 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-all hidden md:block"
                >
                  <ArrowRight size={32} />
                </button>
              </>
            )}

            <motion.div
              key={fullScreenMedia.items[fullScreenMedia.index].url}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl relative bg-black"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -100) navigateMedia('next');
                else if (swipe > 100) navigateMedia('prev');
              }}
            >
              {fullScreenMedia.items[fullScreenMedia.index].type === 'video' ? (
                (() => {
                  const url = fullScreenMedia.items[fullScreenMedia.index].url;
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
                      src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=1&mute=0`}
                      className="w-full h-full border-0 overflow-hidden"
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                    />;
                  }
                  if (isInstagram) {
                    const cleanUrl = url.split('?')[0];
                    const embedUrl = cleanUrl.endsWith('/') ? `${cleanUrl}embed` : `${cleanUrl}/embed`;
                    return <iframe
                      src={embedUrl}
                      className="w-full h-full border-0 overflow-hidden"
                      allowTransparency={true}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                    />;
                  }
                  return <video src={url} className="w-full h-full object-contain" controls autoPlay />;
                })()
              ) : (
                <img src={fullScreenMedia.items[fullScreenMedia.index].url} className="w-full h-full object-contain" alt="" />
              )}

              {/* Title positioned at Top Right */}
              <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <h2 className="text-xs font-bold uppercase tracking-widest text-white/90 drop-shadow-lg bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  {fullScreenMedia.items[fullScreenMedia.index].title}
                </h2>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col md:flex-row items-end justify-between gap-4 pointer-events-none">
                <div className="pointer-events-auto">
                  {(fullScreenMedia.items[fullScreenMedia.index].url.includes('facebook') || fullScreenMedia.items[fullScreenMedia.index].url.includes('fb.watch') || fullScreenMedia.items[fullScreenMedia.index].url.includes('instagram')) && (
                    <p className="text-amber-500/80 text-[10px] font-bold uppercase tracking-widest mt-1">Social media embed might have viewing restrictions</p>
                  )}
                </div>
                {fullScreenMedia.items[fullScreenMedia.index].type === 'video' && (
                  <a
                    href={fullScreenMedia.items[fullScreenMedia.index].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl border border-white/20 transition-all font-bold text-xs uppercase tracking-widest group"
                  >
                    <PlayCircle size={16} className="text-amber-500 group-hover:scale-110 transition-transform" />
                    View Original
                  </a>
                )}
              </div>
            </motion.div>

            {/* Mobile Indicator */}
            <div className="mt-8 flex gap-2 md:hidden">
              {fullScreenMedia.items.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === fullScreenMedia.index ? 'bg-amber-500 w-4' : 'bg-white/20'}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Navigation Bar */}
      <div className="fixed bottom-10 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
        <div className="flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 shadow-2xl items-center gap-1 md:gap-4 pointer-events-auto">
          <Link href="/customer/menu" className="flex items-center gap-2 text-white hover:text-amber-400 px-3 py-1.5 rounded-full transition-all text-[10px] md:text-xs font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20">
            <Utensils size={14} className="text-amber-500" />
            <span>Menu</span>
          </Link>
          <div className="w-[1px] h-4 bg-white/10 hidden md:block" />
          <Link href="/customer/stays" className="flex items-center gap-2 text-white hover:text-amber-400 px-3 py-1.5 rounded-full transition-all text-[10px] md:text-xs font-black uppercase tracking-widest">
            <HomeIcon size={14} className="text-amber-500" />
            <span>Stays</span>
          </Link>
          <div className="w-[1px] h-4 bg-white/10" />
          <Link href="#valley-updates" className="flex items-center gap-2 text-white hover:text-amber-400 px-3 py-1.5 rounded-full transition-all text-[10px] md:text-xs font-black uppercase tracking-widest">
            <Newspaper size={14} className="text-amber-500" />
            <span>Updates</span>
          </Link>
          <div className="w-[1px] h-4 bg-white/10 hidden md:block" />
          <Link href="#village-harvest" className="flex items-center gap-2 text-white hover:text-amber-400 px-3 py-1.5 rounded-full transition-all text-[10px] md:text-xs font-black uppercase tracking-widest">
            <ShoppingBag size={14} className="text-amber-500" />
            <span>Harvest</span>
          </Link>
        </div>
      </div>

    </main>
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
