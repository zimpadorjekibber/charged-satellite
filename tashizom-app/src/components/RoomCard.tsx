"use client";

import Image from "next/image";
import Link from "next/link";
import { Room } from "@/data/rooms";
import { Users, Maximize } from "lucide-react";
import { motion } from "framer-motion";


interface RoomCardProps {
    room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100"
        >
            <div className="relative h-64 overflow-hidden border-b-4 border-brand-primary">
                <Image
                    src={room.mainImage}
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-primary uppercase tracking-wide">
                    {room.style}
                </div>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-brand-primary transition-colors">
                        {room.name}
                    </h3>
                </div>

                <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                    {room.shortDescription}
                </p>

                <div className="flex items-center gap-4 text-xs text-stone-500 mb-6 font-medium">
                    <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14" /></svg>
                        {room.size}
                    </div>
                    <div className="flex items-center gap-1">
                        <Users size={14} />
                        Up to {room.capacity} Guests
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-stone-500">Starts from</span>
                        <span className="font-serif text-lg font-bold text-brand-secondary">
                            ₹{room.pricing.winter}
                            <span className="text-stone-400 text-xs font-normal">/night (Winter)</span>
                        </span>
                    </div>
                    <Link
                        href={`/rooms/${room.id}`}
                        className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded hover:bg-brand-primary transition-colors"
                    >
                        View Room
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
