"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoomCard from "@/components/RoomCard";
import { rooms } from "@/data/rooms";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Mountain, Wind, Coffee, Wifi } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight"
          >
            Himalayan <span className="text-brand-secondary italic">Serenity</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-stone-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light"
          >
            Escape to TashiZom Home Stay. Where luxury meets the raw beauty of Spiti Valley. Experience authentic hospitality in every season.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="rounded-full px-8">View Our Rooms</Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 border-white text-white hover:bg-white hover:text-stone-900 border-2">Contact Us</Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70"
        >
          <div className="w-[1px] h-16 bg-white/30 mx-auto" />
          <span className="text-[10px] uppercase tracking-widest mt-2 block">Scroll</span>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-full shadow-sm text-brand-primary">
                <Mountain size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">Premium Views</h3>
              <p className="text-sm text-stone-600">Every room offers uninterrupted views of the Himalayan peaks.</p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-full shadow-sm text-brand-primary">
                <Coffee size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">Home Cooked</h3>
              <p className="text-sm text-stone-600">Enjoy local Spitian delicacies prepared with organic ingredients.</p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-full shadow-sm text-brand-primary">
                <Wind size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">All Season Stay</h3>
              <p className="text-sm text-stone-600">Cozy in Winter with heaters, breezy and refreshing in Summer.</p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-full shadow-sm text-brand-primary">
                <Wifi size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">Modern Comforts</h3>
              <p className="text-sm text-stone-600">High-speed WiFi and hot water to keep you connected and comfortable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="font-serif text-4xl font-bold text-stone-900 mb-4">Our Curated Spaces</h2>
              <p className="text-stone-600">
                Choose from our selection of rooms, each designed to provide a unique perspective of the valley.
                Whether you prefer the cozy warmth of wood or the grandeur of panoramic glass.
              </p>
            </div>
            <Button variant="outline" className="shrink-0">View All Rooms</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.slice(0, 3).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Attractions */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-stone-900 mb-4">Explore Nearby</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              TashiZom is the perfect base to explore the iconic landmarks of Spiti Valley.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kee Monastery */}
            <div className="group relative overflow-hidden rounded-lg aspect-video bg-stone-200 shadow-md hover:shadow-xl transition-shadow">
              {/* Placeholder for Image */}
              <div className="absolute inset-0 bg-stone-300 flex items-center justify-center text-stone-500 font-medium animate-pulse">
                [ Image: Kee Monastery ]
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-8">
                <div className="transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                  <h3 className="text-3xl font-serif font-bold text-white mb-2">Kee Monastery</h3>
                  <p className="text-white/90 text-sm md:text-base max-w-md">
                    A thousand-year-old Tibetan Buddhist monastery perched on a hilltop, overlooking the Spiti River.
                  </p>
                </div>
              </div>
            </div>

            {/* Chicham Bridge */}
            <div className="group relative overflow-hidden rounded-lg aspect-video bg-stone-200 shadow-md hover:shadow-xl transition-shadow">
              {/* Placeholder for Image */}
              <div className="absolute inset-0 bg-stone-300 flex items-center justify-center text-stone-500 font-medium animate-pulse">
                [ Image: Chicham Bridge ]
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-8">
                <div className="transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                  <h3 className="text-3xl font-serif font-bold text-white mb-2">Chicham Bridge</h3>
                  <p className="text-white/90 text-sm md:text-base max-w-md">
                    The highest bridge in Asia. A marvel of engineering connecting Kibber to Chicham village.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
