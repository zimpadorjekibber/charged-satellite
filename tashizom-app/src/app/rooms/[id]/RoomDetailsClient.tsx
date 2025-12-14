"use client";

import { useState } from "react";
import Image from "next/image";
import { Room } from "@/data/rooms";
import BookingForm from "@/components/BookingForm";
import { Sun, Snowflake, Check, Maximize } from "lucide-react";
import { motion } from "framer-motion";

export default function RoomDetailsClient({ room }: { room: Room }) {
    const [season, setSeason] = useState<'summer' | 'winter'>('summer');

    return (
        <>
            {/* Hero Gallery */}
            <section className="relative h-[60vh] md:h-[70vh] bg-stone-900">
                <Image
                    src={room.mainImage}
                    alt={room.name}
                    fill
                    className="object-cover opacity-90"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-3 py-1 bg-brand-gold text-white text-xs font-bold tracking-wider uppercase mb-4 rounded-sm">
                            {room.style}
                        </span>
                        <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-2">
                            {room.name}
                        </h1>
                        <p className="text-stone-300 text-lg max-w-2xl">
                            {room.shortDescription}
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Description */}
                        <section>
                            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">About this Space</h2>
                            <p className="text-stone-600 leading-relaxed text-lg">
                                {room.description}
                            </p>
                        </section>

                        {/* Amenities */}
                        <section>
                            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">Amenities</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {room.amenities.map((amenity) => (
                                    <div key={amenity} className="flex items-center gap-3 text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-100">
                                        <Check size={16} className="text-brand-green" />
                                        <span className="text-sm font-medium">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Gallery Grid */}
                        <section>
                            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">Gallery</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {room.gallery.map((img, idx) => (
                                    <div key={idx} className="relative h-64 rounded-lg overflow-hidden group">
                                        <Image
                                            src={img}
                                            alt={`Gallery ${idx}`}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <Maximize className="text-white drop-shadow-lg" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* Right Sidebar (Booking) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-xl border border-stone-100 ring-1 ring-black/5">

                            {/* Season Toggle */}
                            <div className="flex bg-stone-100 p-1 rounded-lg mb-8 relative">
                                <button
                                    onClick={() => setSeason('summer')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all z-10 ${season === 'summer' ? 'text-brand-green' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    <Sun size={16} />
                                    Summer
                                </button>
                                <button
                                    onClick={() => setSeason('winter')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all z-10 ${season === 'winter' ? 'text-blue-600' : 'text-stone-500 hover:text-stone-700'}`}
                                >
                                    <Snowflake size={16} />
                                    Winter
                                </button>

                                {/* Slider Background */}
                                <motion.div
                                    layoutId="season-bg"
                                    className="absolute bg-white shadow-sm rounded-md h-[calc(100%-8px)] top-1 bottom-1 w-[calc(50%-4px)]"
                                    initial={false}
                                    animate={{ x: season === 'summer' ? 4 : '100%' }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            </div>

                            {/* Price Display */}
                            <div className="mb-6 text-center">
                                <div className="text-sm text-stone-500 mb-1">Price per Night</div>
                                <div className="flex items-center justify-center gap-1">
                                    <span className="font-serif text-4xl font-bold text-stone-900">
                                        ₹{season === 'summer' ? room.pricing.summer : room.pricing.winter}
                                    </span>
                                </div>
                                <p className="text-xs text-stone-400 mt-2">
                                    {season === 'summer' ? 'April - September' : 'October - March'} Rates
                                </p>
                            </div>

                            <div className="h-px bg-stone-100 mb-6" />

                            <BookingForm />

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
