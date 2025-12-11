'use client';

import Link from 'next/link';
import { UtensilsCrossed, ChefHat, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ['/tashizom-winter.jpg', '/tashizom-summer.jpg'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev: number) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-tashi-darker relative overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Using standard img tag for simplicity with external/local files if Image component has config issues, 
                 but Next.js Image is better. We'll use a div with background-image for easy cover behavior 
                 OR Next.js Image with fill. Let's use Next.js Image. */}
            <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark overlay */}
            <img
              src={images[currentImageIndex]}
              alt="Tashizom Restaurant"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] z-20 pointer-events-none mix-blend-overlay"></div>
      </div>

      {/* Decorative Corners - TashiZom Style */}
      <div className="absolute top-0 left-0 z-40 w-24 h-24 md:w-32 md:h-32 pointer-events-none mix-blend-multiply">
        <img src="/tashi-corner.png" alt="decorative corner" className="w-full h-full object-contain drop-shadow-lg" />
      </div>
      <div className="absolute top-0 right-0 z-40 w-24 h-24 md:w-32 md:h-32 pointer-events-none mix-blend-multiply">
        <img src="/tashi-corner.png" alt="decorative corner" className="w-full h-full object-contain -scale-x-100 drop-shadow-lg" />
      </div>
      <div className="absolute bottom-0 left-0 z-40 w-24 h-24 md:w-32 md:h-32 pointer-events-none mix-blend-multiply">
        <img src="/tashi-corner.png" alt="decorative corner" className="w-full h-full object-contain -scale-y-100 drop-shadow-lg" />
      </div>
      <div className="absolute bottom-0 right-0 z-40 w-24 h-24 md:w-32 md:h-32 pointer-events-none mix-blend-multiply">
        <img src="/tashi-corner.png" alt="decorative corner" className="w-full h-full object-contain rotate-180 drop-shadow-lg" />
      </div>



      <div className="relative z-30 w-full max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-8xl font-bold mb-2 text-tashi-accent drop-shadow-2xl tracking-tight font-serif">
            TashiZom
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-16 font-light tracking-[0.3em] uppercase opacity-90 text-shadow-sm">
            Kibber • Spiti Valley
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col items-center gap-6 max-w-md mx-auto"
        >
          <div className="p-8 text-center">
            <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center">
              <UtensilsCrossed size={48} className="text-gray-300 opacity-80" />
            </div>
            <p className="text-gray-200 mb-6 font-medium">Please scan the QR code on your table to browse the menu and place orders.</p>
            <Link
              href="/customer/menu"
              className="inline-flex items-center gap-2 bg-tashi-accent text-tashi-dark px-8 py-3 rounded-full font-bold hover:bg-white hover:scale-105 transition-all duration-300"
            >
              Preview Menu
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Fixed Footer Links - High Z-Index for Clickability */}
      <div className="absolute bottom-10 left-0 w-full flex flex-col items-center gap-4 z-50 pointer-events-auto">
        <span className="text-[10px] text-gray-400 font-mono">ANTIGRAVITY SYSTEMS v1.0</span>
      </div>
    </main>
  );
}

function RoleCard({ href, title, icon, desc, color, delay }: { href: string; title: string; icon: React.ReactNode; desc: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.5 }}
    >
      <Link href={href} className={`group block relative p-8 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 ${color}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 p-4 rounded-2xl bg-black/20 text-gray-300 group-hover:text-white group-hover:scale-110 transition-all duration-300 ring-1 ring-white/5">
            {icon}
          </div>
          <h2 className="text-xl font-bold text-gray-200 group-hover:text-white mb-2 transition-colors">{title}</h2>
          <p className="text-sm text-gray-500 group-hover:text-gray-400 mb-6 transition-colors">{desc}</p>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 group-hover:text-tashi-accent transition-colors">
            <span>Access</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
