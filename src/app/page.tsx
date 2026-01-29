'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, Clock, Star, Users, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function Home() {
  const [showFood, setShowFood] = useState(true);
  const reviews = useStore((state: any) => state.reviews);

  useEffect(() => {
    // Clear previous table session for generic app entry
    useStore.getState().setTableId(null);

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

        {/* Top Center Crest Logo */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-50 rounded-full shadow-2xl border-2 border-amber-500/50"
        >
          <img
            src="/logo_crest.png"
            alt="TashiZom Crest Logo"
            className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover scale-[1.2]"
          />
        </motion.div>

        {/* Hero Content */}
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col pt-12 pb-12 items-center">
          <div className="flex-1 flex flex-col items-center justify-start pt-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="pointer-events-auto text-center">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter font-serif">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-amber-200 via-tashi-accent to-amber-700 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  TashiZom
                </span>
              </h1>
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
                className="group relative inline-flex items-center gap-3 bg-gradient-to-b from-amber-400 to-amber-600 text-tashi-dark px-10 py-4 rounded-xl font-black shadow-[0_0_30px_rgba(218,165,32,0.3)] hover:shadow-[0_0_50px_rgba(218,165,32,0.5)] transition-all duration-500 active:scale-95"
              >
                <span className="relative z-10 text-lg md:text-xl font-serif uppercase tracking-widest">Discover Flavors</span>
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
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
            <h2 className="text-3xl md:text-5xl font-serif font-black text-amber-500 mb-6">Welcome to TashiZom Kibber</h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-8 rounded-full" />
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-light">
              Located at the heart of <span className="text-amber-400 font-bold">Kibber Village</span> at 14,000 feet,
              TashiZom is Spiti Valley's premier multi-cuisine destination. We believe food is a journey, and every dish
              we serve carries the essence of the high Himalayas.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors group">
                <MapPin className="w-10 h-10 text-amber-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-xl mb-2">Prime Location</h3>
                <p className="text-gray-400 text-sm">Ideally situated in Kibber, near the Chicham Bridge and Kee Monastery.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors group">
                <Utensils className="w-10 h-10 text-amber-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-xl mb-2">Authentic Taste</h3>
                <p className="text-gray-400 text-sm">From local Spitian Thukpa to North Indian classics and Pizzas.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors group">
                <Clock className="w-10 h-10 text-amber-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-xl mb-2">Open Always</h3>
                <p className="text-gray-400 text-sm">The only restaurant in Kibber that stays open throughout the winter season.</p>
              </div>
            </motion.div>
          </div>

          {/* Hindi Context for Local SEO */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-amber-900/40 to-black border border-amber-500/20 p-8 md:p-12 rounded-3xl text-center"
          >
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-amber-200 mb-6 italic">स्पीति घाटी का असली स्वाद</h3>
            <p className="text-gray-300 md:text-lg leading-relaxed mb-6">
              किब्बर गाँव की सुंदर वादियों के बीच स्थित, ताशीज़ोम (TashiZom) आपको देता है घर जैसा स्वाद और
              पहाड़ों की ताज़गी। हम केवल खाना ही नहीं, बल्कि स्पीति की संस्कृति और परंपराओं का संगम हैं।
              चाहे आप की मॉनेस्ट्री घूम रहे हों या चिचम ब्रिज, हमारे यहाँ का ठहराव आपकी यात्रा को यादगार बना देगा।
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-amber-500/60 uppercase tracking-widest">
              <span>#BestRestaurantInSpiti</span>
              <span>#KibberFood</span>
              <span>#SpitiValleyLife</span>
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
                <h2 className="text-4xl md:text-6xl font-serif font-black text-white mb-6 leading-tight">
                  A Story Carved <br />
                  <span className="text-amber-500 italic">In High Altitude</span>
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed font-light">
                  Our journey began in <span className="text-white font-bold underline decoration-amber-500 decoration-2 underline-offset-4">1995</span>.
                  Originally registered as <span className="text-amber-200 italic font-medium">'Resang Hotel'</span> with the Himachal Tourism Department,
                  we later evolved into <span className="text-amber-500 font-bold">TashiZom</span>. Though heavy Himalayan rains once took our rooms,
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
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Kibber is more than a village; it is a <span className="text-white">Living Civilization</span> of about 500 souls.
                    From tantriks and blacksmiths to farmers and drummers, we are a self-sustaining community
                    preserving traditions for centuries.
                  </p>
                </div>
                <div className="space-y-4 border-l-2 border-amber-500/30 pl-6">
                  <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs">The First Road</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    History remembers that when the first roads were carved from Manali,
                    <span className="text-white"> Kibber</span> was connected right after Rangrik—long before Kaza.
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
                    <p className="text-gray-300 text-base">
                      Kibber Wildlife Sanctuary is a global hub for wildlife videography.
                      Giants like <span className="text-amber-400 font-medium">NetGeo, BBC, and Netflix</span> visit annually
                      to film the elusive <span className="text-white font-bold">Snow Leopard</span>.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <p className="text-gray-300 text-base">
                      Before roads stretched further, the legendary <span className="text-white font-bold">Parangla Pass</span> trek to Leh Ladakh
                      started right here at our doorstep in Kibber.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <p className="text-gray-300 text-base">
                      For those seeking a climb, the summit of <span className="text-white font-bold">Mount Kanamo (5000m+)</span>
                      still finds its path starting through the village of Kibber.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 italic text-gray-500 text-sm">
                  "While modern tourism shifts to the towns, the true heart and history of Spiti still beat in Kibber."
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* Background Texture Element */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />
      </section>
      {reviews && reviews.length > 0 && (
        <section className="bg-tashi-dark py-20 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-serif font-black text-white">Guest Stories</h2>
                <p className="text-gray-400 mt-2">Hear what travelers say about us</p>
              </div>
              <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                <Star className="text-amber-500 fill-amber-500" size={24} />
                <span className="text-2xl font-bold text-white">4.9 / 5</span>
                <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
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
                  <p className="text-gray-300 text-sm italic mb-6 leading-relaxed">"{review.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
                      {review.customerName?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold">{review.customerName || 'Happy Guest'}</h4>
                      <p className="text-gray-500 text-xs">Verified Review</p>
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
      <footer className="bg-black py-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <img src="/logo_crest.png" alt="TashiZom Logo" className="w-12 h-12 grayscale opacity-40" />
          <span className="text-[10px] text-gray-500 font-mono tracking-[0.4em] uppercase">
            © 2026 TashiZom Kibber | Antigravity Systems v1.0
          </span>
        </div>
      </footer>

    </main>
  );
}
