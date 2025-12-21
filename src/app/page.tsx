'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function Home() {
  const [showFood, setShowFood] = useState(true); // Toggle between Food and Buildings

  useEffect(() => {
    // Clear previous table session for generic app entry
    useStore.getState().setTableId(null);
    useStore.getState().recordScan('app_qr', { path: '/' });
  }, []);

  // Toggle between Food view and Building view every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setShowFood((prev) => !prev);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="h-[100dvh] flex flex-col items-center justify-center bg-black relative overflow-hidden">

      {/* --- MODE 1: FULL SCREEN FOOD BACKGROUND --- */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-[2000ms] ease-in-out ${showFood ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img
          src="/tashizom-new-bg.jpg"
          alt="Food Spread"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* --- MODE 2: 3-SECTION BUILDING SPLIT (Summer, Winter, Night) --- */}
      <div
        className={`absolute inset-0 z-10 flex flex-col transition-opacity duration-[2000ms] ease-in-out ${!showFood ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Top: Summer */}
        <div className="flex-1 relative overflow-hidden group border-b border-black/20">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img src="/tashizom-summer.jpg" alt="Summer View" className="w-full h-full object-cover object-center" />
        </div>

        {/* Middle: Winter */}
        <div className="flex-1 relative overflow-hidden group border-y border-black/20">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img src="/tashizom-winter.jpg" alt="Winter View" className="w-full h-full object-cover object-center" />
        </div>

        {/* Bottom: Night */}
        <div className="flex-1 relative overflow-hidden group border-t border-black/20">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img src="/tashizom-night.jpg" alt="Night View" className="w-full h-full object-cover object-center" />
        </div>
      </div>

      {/* Top Center Crest Logo */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-50 rounded-full shadow-2xl bg-black/50 p-1 backdrop-blur-sm border border-amber-500/30"
      >
        <img
          src="/logo_crest.png"
          alt="TashiZom Crest"
          className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col pt-12 pb-12">
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none mix-blend-overlay"></div>

        {/* Top Section Content (Summer) */}
        <div className="flex-1 flex flex-col items-center justify-start pt-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="pointer-events-auto text-center"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-tashi-accent drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] tracking-tighter font-serif">
              TashiZom
            </h1>
          </motion.div>
        </div>

        {/* Middle Section Content (Winter/Snow) */}
        <div className="flex-1 flex flex-col items-center justify-between py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="pointer-events-auto text-center mt-2"
          >
            <p className="text-xl md:text-3xl text-amber-900 font-serif italic font-bold tracking-widest drop-shadow-sm px-4">
              Multi-Cuisine Restaurant
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-col items-center mb-2"
          >
            <div className="text-white font-serif tracking-[0.4em] uppercase text-sm md:text-base font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              Kibber
            </div>
            <div className="text-white/90 font-serif text-xs md:text-sm tracking-[0.1em] mt-1 italic font-medium drop-shadow-md">
              (All Season Open)
            </div>
          </motion.div>
        </div>

        {/* Bottom Section Content (Night) */}
        <div className="flex-1 flex flex-col items-center justify-start pt-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="pointer-events-auto text-center"
          >
            <Link
              href="/customer/menu"
              className="inline-flex items-center gap-2 bg-tashi-accent text-tashi-dark px-6 py-2.5 rounded-lg font-bold hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl text-base md:text-lg border border-amber-400/30"
            >
              Preview Menu
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative Corners - True Transparent PNG */}
      {/* Top Left */}
      <div className="absolute top-0 left-0 z-40 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
        <img src="/tashi-corner.png" onError={(e) => e.currentTarget.style.display = 'none'} alt="" className="w-full h-full object-contain filter invert-[.25] sepia saturate-[5] hue-rotate-[20deg] brightness-[1.1] contrast-[1.2] drop-shadow-lg" />
      </div>
      {/* Top Right */}
      <div className="absolute top-0 right-0 z-40 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
        <img src="/tashi-corner.png" onError={(e) => e.currentTarget.style.display = 'none'} alt="" className="w-full h-full object-contain -scale-x-100 filter invert-[.25] sepia saturate-[5] hue-rotate-[20deg] brightness-[1.1] contrast-[1.2] drop-shadow-lg" />
      </div>
      {/* Bottom Left */}
      <div className="absolute bottom-0 left-0 z-40 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
        <img src="/tashi-corner.png" onError={(e) => e.currentTarget.style.display = 'none'} alt="" className="w-full h-full object-contain -scale-y-100 filter invert-[.25] sepia saturate-[5] hue-rotate-[20deg] brightness-[1.1] contrast-[1.2] drop-shadow-lg" />
      </div>
      {/* Bottom Right */}
      <div className="absolute bottom-0 right-0 z-40 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
        <img src="/tashi-corner.png" onError={(e) => e.currentTarget.style.display = 'none'} alt="" className="w-full h-full object-contain rotate-180 filter invert-[.25] sepia saturate-[5] hue-rotate-[20deg] brightness-[1.1] contrast-[1.2] drop-shadow-lg" />
      </div>

      {/* Fixed Footer */}
      <div className="absolute bottom-4 w-full flex justify-center z-50 pointer-events-none">
        <span className="text-[9px] text-gray-400 font-mono opacity-60 drop-shadow-md">ANTIGRAVITY SYSTEMS v1.0</span>
      </div>

    </main>
  );
}
