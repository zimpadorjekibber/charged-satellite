'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation, Info, X } from 'lucide-react';
import { useState } from 'react';

export default function LocalMapGuide() {
    const [headerVisible, setHeaderVisible] = useState(true);

    return (
        <div className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden relative w-full aspect-square md:aspect-video max-w-3xl mx-auto shadow-2xl">
            {/* Map Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />

            {/* Header / Legend */}
            <div className={`absolute top-4 left-4 z-20 transition-all duration-300 ${headerVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
                    <h3 className="text-tashi-accent font-serif font-bold text-lg mb-1 flex items-center gap-2">
                        <Navigation size={18} /> Tourist Loop
                    </h3>
                    <p className="text-gray-300 text-xs max-w-[220px] leading-relaxed">
                        Complete clearer loop:
                        <br />• <span className="text-white font-bold">TashiZom</span> to <span className="text-white font-bold">Chicham Bridge</span>
                        <br />• <span className="text-white font-bold">Chicham Bridge</span> to <span className="text-white font-bold">Link Road</span>
                        <br />• <span className="text-white font-bold">Link Road</span> back to <span className="text-white font-bold">TashiZom</span>
                    </p>
                </div>
            </div>

            {/* Interactive SVG Map */}
            <svg viewBox="0 0 800 600" className="w-full h-full p-4 md:p-12">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#DAA520" />
                    </marker>
                    {/* Glow Filter */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Road System - TRIANGULAR LOOP schema */}
                {/* 
                   Points:
                   A: TashiZom (Bottom Right) -> 600, 450
                   B: Chicham Bridge (Top Center) -> 400, 100
                   C: Link Road (Bottom Left) -> 200, 450
                */}

                {/* Connectivity Lines (The Roads) */}

                {/* 1. TashiZom to Chicham Bridge (Right Leg) */}
                <path
                    d="M 600 450 Q 600 250 400 100"
                    fill="none"
                    stroke="#333"
                    strokeWidth="16"
                    strokeLinecap="round"
                />

                {/* 2. Chicham Bridge to Link Road (Left Leg) */}
                <path
                    d="M 400 100 Q 200 250 200 450"
                    fill="none"
                    stroke="#333"
                    strokeWidth="16"
                    strokeLinecap="round"
                />

                {/* 3. Link Road to TashiZom (Bottom Connection) */}
                <path
                    d="M 200 450 L 600 450"
                    fill="none"
                    stroke="#333"
                    strokeWidth="16"
                    strokeLinecap="round"
                />

                {/* Animated Flows (Golden Arrows) */}

                {/* Flow: TashiZom -> Chicham Bridge */}
                <motion.path
                    d="M 600 450 Q 600 250 400 100"
                    fill="none"
                    stroke="#DAA520"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    markerEnd="url(#arrowhead)"
                />

                {/* Flow: Chicham Bridge -> Link Road */}
                <motion.path
                    d="M 400 100 Q 200 250 200 450"
                    fill="none"
                    stroke="#DAA520"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2.5, delay: 2.5, repeat: Infinity, ease: "linear" }}
                    markerEnd="url(#arrowhead)"
                />

                {/* Flow: Link Road -> TashiZom */}
                <motion.path
                    d="M 200 450 L 600 450"
                    fill="none"
                    stroke="#DAA520"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2.5, delay: 5.0, repeat: Infinity, ease: "linear" }}
                    markerEnd="url(#arrowhead)"
                />


                {/* --- NODES / LOCATIONS --- */}

                {/* A. TashiZom (Bottom Right) */}
                <g transform="translate(600, 450)" onClick={() => setHeaderVisible(prev => !prev)} className="cursor-pointer">
                    {/* Ripple Effect */}
                    <circle r="40" fill="#DAA520" opacity="0.2">
                        <animate attributeName="r" from="20" to="50" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle r="25" fill="#171717" stroke="#DAA520" strokeWidth="3" />
                    <text x="35" y="5" fill="#DAA520" fontSize="24" fontWeight="bold" fontFamily="serif" filter="url(#glow)">TashiZom</text>
                    <text x="35" y="25" fill="#9ca3af" fontSize="12" fontFamily="sans-serif">You are here</text>
                </g>

                {/* B. Chicham Bridge (Top Center) */}
                <g transform="translate(400, 100)" className="cursor-pointer">
                    <circle r="15" fill="#ef4444" />
                    <text x="-60" y="-25" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Chicham Bridge</text>
                    <text x="-60" y="-10" fill="#94a3b8" fontSize="12" fontFamily="sans-serif">Tourist Spot</text>
                </g>

                {/* C. Link Road (Bottom Left) */}
                <g transform="translate(200, 450)" className="cursor-pointer">
                    <circle r="12" fill="#3b82f6" />
                    <text x="-40" y="40" fill="white" fontSize="16" fontWeight="bold" fontFamily="sans-serif">Link Road</text>
                    <text x="-40" y="60" fill="#94a3b8" fontSize="12" fontFamily="sans-serif">To Kaza / Main RD</text>
                </g>

            </svg>

            {/* Footer Note */}
            <div className="absolute bottom-4 right-4 z-20">
                <span className="bg-black/50 px-3 py-1 rounded-full text-[10px] text-gray-500 border border-white/5 backdrop-blur">
                    Circular Loop • No Need to U-Turn
                </span>
            </div>
        </div>
    );
}
