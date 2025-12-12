'use client';

import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';

export default function LocalMapGuide() {
    return (
        <div className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden relative w-full flex flex-col max-w-3xl mx-auto shadow-2xl">
            {/* Map Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />

            {/* Header / Instructions - Now Relative flow for Mobile */}
            <div className="bg-black/40 backdrop-blur-md p-4 w-full z-20 border-b border-white/5 relative">
                <h3 className="text-tashi-accent font-serif font-bold text-lg mb-1 flex items-center gap-2">
                    <Navigation size={18} /> Tourist Loop
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                    <span className="text-white font-bold">Link Road</span> ➔ <span className="text-white font-bold">TashiZom</span> ➔ <span className="text-white font-bold">Kibber</span> ➔ <span className="text-white font-bold">Chicham Bridge</span>
                </p>
                <p className="text-[10px] text-gray-500 mt-1 italic">
                    Seamless circular drive. No U-Turn needed!
                </p>
            </div>

            {/* Interactive SVG Map */}
            <div className="flex-1 w-full aspect-[4/3] md:aspect-video relative">
                <svg viewBox="0 0 800 600" className="w-full h-full p-2">
                    <defs>
                        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#DAA520" />
                        </marker>
                        <marker id="arrowhead-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
                        </marker>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* 
                       UPDATED Topology (Curved Loop):
                       A: Link Road (Bottom Left) -> 150, 500
                       B: TashiZom (Bottom Right) -> 650, 500
                       C: Kibber (Right Middle)  -> 650, 300
                       D: Chicham (Top Left)     -> 300, 100
                    */}

                    {/* ROADS (Base Dark Lines) */}

                    {/* 1. Link Road to TashiZom (Curved Bottom) */}
                    <path
                        d="M 150 500 Q 400 580 650 500"
                        fill="none"
                        stroke="#333"
                        strokeWidth="16"
                        strokeLinecap="round"
                    />

                    {/* 2. TashiZom to Kibber (Short Upward Curve) */}
                    <path
                        d="M 650 500 Q 680 400 650 300"
                        fill="none"
                        stroke="#333"
                        strokeWidth="16"
                        strokeLinecap="round"
                    />

                    {/* 3. Kibber to Chicham (Diagonal Top) */}
                    <path
                        d="M 650 300 Q 500 150 300 100"
                        fill="none"
                        stroke="#333"
                        strokeWidth="16"
                        strokeLinecap="round"
                    />

                    {/* 4. Chicham to Link Road (Left Down) */}
                    <path
                        d="M 300 100 Q 100 250 150 500"
                        fill="none"
                        stroke="#333"
                        strokeWidth="16"
                        strokeLinecap="round"
                    />


                    {/* GOLDEN FLOW ANIMATIONS */}

                    <motion.path
                        d="M 150 500 Q 400 580 650 500"
                        fill="none"
                        stroke="#DAA520"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        markerEnd="url(#arrowhead)"
                    />

                    <motion.path
                        d="M 650 500 Q 680 400 650 300"
                        fill="none"
                        stroke="#DAA520"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 2.0, repeat: Infinity, ease: "linear" }}
                        markerEnd="url(#arrowhead)"
                    />

                    <motion.path
                        d="M 650 300 Q 500 150 300 100"
                        fill="none"
                        stroke="#DAA520"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2.0, delay: 3.0, repeat: Infinity, ease: "linear" }}
                        markerEnd="url(#arrowhead)"
                    />

                    <motion.path
                        d="M 300 100 Q 100 250 150 500"
                        fill="none"
                        stroke="#DAA520"
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2.5, delay: 4.5, repeat: Infinity, ease: "linear" }}
                        markerEnd="url(#arrowhead)"
                    />


                    {/* To Kaza Direction */}
                    <g transform="translate(150, 500)">
                        <path d="M 0 20 Q -20 40 -40 60" fill="none" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" markerEnd="url(#arrowhead-green)" />
                        <text x="-60" y="80" fill="#22c55e" fontSize="16" fontWeight="bold" fontFamily="sans-serif">To Kaza</text>
                        <text x="-60" y="95" fill="#4ade80" fontSize="10" fontFamily="sans-serif">Main Highway</text>
                    </g>

                    {/* --- NODES / LOCATIONS --- */}

                    {/* A. Link Road */}
                    <g transform="translate(150, 500)" className="cursor-pointer">
                        <circle r="12" fill="#3b82f6" />
                        <text x="-40" y="40" fill="white" fontSize="16" fontWeight="bold" fontFamily="sans-serif">Link Road</text>
                        <text x="-40" y="55" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">From Kaza</text>
                    </g>

                    {/* B. TashiZom */}
                    <g transform="translate(650, 500)" className="cursor-pointer">
                        {/* Pulse */}
                        <circle r="40" fill="#DAA520" opacity="0.2">
                            <animate attributeName="r" from="20" to="50" dur="1.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <circle r="20" fill="#171717" stroke="#DAA520" strokeWidth="3" />
                        <text x="30" y="10" fill="#DAA520" fontSize="22" fontWeight="bold" fontFamily="serif" filter="url(#glow)">TashiZom</text>
                        <text x="30" y="25" fill="#9ca3af" fontSize="10" fontFamily="sans-serif">YOU ARE HERE</text>
                    </g>

                    {/* C. Kibber Village */}
                    <g transform="translate(650, 300)" className="cursor-pointer">
                        <circle r="12" fill="#22c55e" />
                        <text x="20" y="5" fill="white" fontSize="16" fontWeight="bold" fontFamily="sans-serif">Kibber</text>
                        <text x="20" y="20" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Village</text>
                    </g>

                    {/* D. Chicham Bridge */}
                    <g transform="translate(300, 100)" className="cursor-pointer">
                        <circle r="12" fill="#ef4444" />
                        <text x="-60" y="-30" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Chicham Bridge</text>
                        <text x="-60" y="-15" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Highest Bridge</text>
                    </g>

                </svg>
            </div>
        </div>
    );
}
