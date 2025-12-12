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
                    <p className="text-gray-300 text-xs max-w-[200px] leading-relaxed">
                        Don't double back! The road connects <span className="text-white font-bold">Chicham Bridge</span> and <span className="text-white font-bold">TashiZom</span> in a seamless loop.
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

                {/* Road System - The Loop */}
                {/* 
                   Points:
                   - Link Road (Start/Bottom Left): 200, 500
                   - TashiZom (Right): 600, 300
                   - Chicham Bridge (Top Left): 250, 100
                */}

                {/* Connecting Roads (Base) */}
                <path
                    d="M 200 500 Q 400 550 600 300" // Link to TashiZom
                    fill="none"
                    stroke="#333"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                <path
                    d="M 600 300 Q 500 150 250 100" // TashiZom to Bridge
                    fill="none"
                    stroke="#333"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                <path
                    d="M 250 100 Q 100 250 200 500" // Bridge back to Link Road (Closing the loop roughly)
                    fill="none"
                    stroke="#333"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="10 10" // Dash for generic connecting road
                />

                {/* Animated Directional Path (The "Flow") */}
                <motion.path
                    d="M 200 500 Q 400 550 600 300"
                    fill="none"
                    stroke="#DAA520"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    markerEnd="url(#arrowhead)"
                />
                <motion.path
                    d="M 600 300 Q 500 150 250 100"
                    fill="none"
                    stroke="#DAA520"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    markerEnd="url(#arrowhead)"
                />

                {/* --- LOCATIONS --- */}

                {/* 1. Link Road (Entry) */}
                <g transform="translate(200, 500)" className="cursor-pointer group">
                    <circle r="12" fill="#3b82f6" className="animate-pulse" />
                    <circle r="6" fill="white" />
                    <text x="-40" y="40" fill="#94a3b8" fontSize="14" fontWeight="bold" fontFamily="sans-serif">From Kaza</text>
                    <text x="-60" y="60" fill="white" fontSize="16" fontWeight="bold" fontFamily="sans-serif">Link Road</text>
                </g>

                {/* 2. TashiZom (Hero Location) */}
                <g transform="translate(600, 300)" onClick={() => setHeaderVisible(prev => !prev)} className="cursor-pointer">
                    {/* Ripple Effect */}
                    <circle r="40" fill="#DAA520" opacity="0.2">
                        <animate attributeName="r" from="20" to="50" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>

                    <circle r="25" fill="#171717" stroke="#DAA520" strokeWidth="3" />
                    {/* Simple House Icon inside */}
                    <path d="M-10 5 L0 -8 L10 5 Z M-10 5 L10 5" fill="#DAA520" />

                    <text x="35" y="5" fill="#DAA520" fontSize="24" fontWeight="bold" fontFamily="serif" filter="url(#glow)">TashiZom</text>
                    <text x="35" y="25" fill="#9ca3af" fontSize="12" fontFamily="sans-serif">Restaurant & Stay</text>
                </g>

                {/* 3. Chicham Bridge */}
                <g transform="translate(250, 100)" className="cursor-pointer">
                    <circle r="15" fill="#ef4444" />
                    <path d="M-8 0 L8 0 M-6 -4 L6 -4 M-6 4 L6 4" stroke="white" strokeWidth="2" />
                    <text x="-60" y="-25" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Chicham Bridge</text>
                    <text x="-60" y="-10" fill="#94a3b8" fontSize="12" fontFamily="sans-serif">Highest Bridge</text>
                </g>

            </svg>

            {/* Footer Note */}
            <div className="absolute bottom-4 right-4 z-20">
                <span className="bg-black/50 px-3 py-1 rounded-full text-[10px] text-gray-500 border border-white/5 backdrop-blur">
                    Schematic Map (Not to scale)
                </span>
            </div>
        </div>
    );
}
