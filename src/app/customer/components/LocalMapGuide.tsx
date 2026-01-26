'use client';

import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Navigation, Info, Clock, Mountain, ArrowLeftRight, PlayCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const LOCATIONS = {
    kee: {
        name: 'Kee Monastery',
        elevation: '4,166m',
        desc: '11th-century Tibetan Buddhist monastery and a world-renowned landmark.',
        time: '12 mins from Link Rd'
    },
    kibber: {
        name: 'Kibber Village',
        elevation: '4,270m',
        desc: 'One of the highest inhabited villages in the world, famous for snow leopard sightings.',
        time: '15 mins from Kee'
    },
    tashizom: {
        name: 'TashiZom',
        elevation: '4,250m',
        desc: 'Located just to the right of the main road. Your premium comfort hub in the heart of the Kibber wildlife sanctuary.',
        time: '2 mins from Kibber'
    },
    chicham: {
        name: 'Chicham Bridge',
        elevation: '4,145m',
        desc: "Asia's highest suspension bridge. This is the direct route to Manali (168km via Losar).",
        time: '15 mins from TashiZom'
    },
    linkroad: {
        name: 'Chicham-Kibber Link Road',
        elevation: '3,800m',
        desc: 'CRUCIAL POINT: Turn RIGHT here. Chicham Bridge is connected VIA Kibber. Do not go straight (leads to Kaza).',
        time: 'Turn RIGHT for Kibber'
    }
};

export default function LocalMapGuide({ autoPlay = false }: { autoPlay?: boolean }) {
    const [isReverse, setIsReverse] = useState(false);
    const [selectedLoc, setSelectedLoc] = useState<keyof typeof LOCATIONS | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStartedAutoPlay, setHasStartedAutoPlay] = useState(false);

    // Camera/ViewBox Motion Values
    const cameraX = useMotionValue(0);
    const cameraY = useMotionValue(0);
    const cameraW = useMotionValue(600);
    const cameraH = useMotionValue(750);
    const viewBoxString = useTransform(
        [cameraX, cameraY, cameraW, cameraH],
        ([x, y, w, h]) => `${x} ${y} ${w} ${h}`
    );

    // Toggle direction every 15 seconds for a dynamic guide
    useEffect(() => {
        if (isPlaying) return; // Pause auto-toggle during tour
        const interval = setInterval(() => {
            setIsReverse(prev => !prev);
        }, 15000);
        return () => clearInterval(interval);
    }, [isPlaying]);

    // Handle AutoPlay on Mount
    useEffect(() => {
        if (autoPlay && !hasStartedAutoPlay) {
            setHasStartedAutoPlay(true);
            setTimeout(() => {
                playTour();
            }, 500); // Small delay to allow SVG to render
        }
    }, [autoPlay, hasStartedAutoPlay]);

    // Tour Sequence
    const playTour = async () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setSelectedLoc(null);
        setIsReverse(false); // Force forward direction

        const ease = "easeInOut";

        // 1. Zoom to Kee (Bottom)
        animate(cameraX, 280, { duration: 2, ease });
        animate(cameraY, 550, { duration: 2, ease });
        animate(cameraW, 200, { duration: 2, ease });
        await animate(cameraH, 200, { duration: 2, ease }).finished;

        setSelectedLoc('kee');
        await new Promise(r => setTimeout(r, 4000));
        setSelectedLoc(null);

        // 1.5. Pan to Link Road (Crucial Turn)
        animate(cameraX, 260, { duration: 2, ease });
        animate(cameraY, 400, { duration: 2, ease }); // Centered on 360,500
        await animate(cameraW, 200, { duration: 2, ease }).finished;

        setSelectedLoc('linkroad');
        await new Promise(r => setTimeout(r, 5000)); // Longer pause for crucial info
        setSelectedLoc(null);

        // 2. Pan to Kibber/TashiZom (Right)
        animate(cameraX, 380, { duration: 3, ease: "linear" }); // Follow road
        animate(cameraY, 200, { duration: 3, ease: "linear" });
        await new Promise(r => setTimeout(r, 1000)); // slight pause mid-pan?

        animate(cameraX, 380, { duration: 1.5, ease });
        animate(cameraY, 200, { duration: 1.5, ease });

        // Final position for step 2
        animate(cameraX, 350, { duration: 2, ease });
        animate(cameraY, 190, { duration: 2, ease });
        await animate(cameraW, 220, { duration: 2, ease }).finished;

        setSelectedLoc('tashizom');
        await new Promise(r => setTimeout(r, 4000));
        setSelectedLoc(null);

        // 3. Pan to Chicham (Top Left)
        animate(cameraX, 80, { duration: 2.5, ease });
        animate(cameraY, 20, { duration: 2.5, ease });
        await animate(cameraW, 200, { duration: 2.5, ease }).finished;

        setSelectedLoc('chicham');
        await new Promise(r => setTimeout(r, 3000));
        setSelectedLoc(null);

        // 4. Reset to Full View
        animate(cameraX, 0, { duration: 2, ease });
        animate(cameraY, 0, { duration: 2, ease });
        animate(cameraW, 600, { duration: 2, ease });
        await animate(cameraH, 750, { duration: 2, ease }).finished;

        setIsPlaying(false);
    };

    return (
        <div className="bg-white border-0 md:border md:border-tashi-accent/20 rounded-none md:rounded-3xl overflow-hidden relative w-full flex flex-col h-full md:h-auto max-w-3xl mx-auto shadow-none md:shadow-[0_0_50px_rgba(0,0,0,0.1)]">
            {/* Topography Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstripe.png')]" />

            {/* Header / Instructions */}
            <div className="bg-white/60 backdrop-blur-xl p-5 w-full z-20 border-b border-black/10 relative">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-black font-serif font-bold text-xl flex items-center gap-2">
                            <Navigation size={20} className={`transition-transform duration-700 text-tashi-accent ${isReverse ? 'rotate-180' : ''}`} />
                            Interactive Real Map
                        </h3>
                        <div className='flex items-center gap-2 mt-1'>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Terrain View</p>
                            <div className='h-3 w-[1px] bg-black/20'></div>
                            <button onClick={playTour} disabled={isPlaying} className={`text-[10px] font-bold flex items-center gap-1 ${isPlaying ? 'text-tashi-accent' : 'text-blue-600 animate-pulse hover:text-blue-800'}`}>
                                <PlayCircle size={12} /> {isPlaying ? 'Playing Guide...' : 'Play Guide Map'}
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsReverse(!isReverse)}
                        className="bg-black/5 hover:bg-tashi-accent/20 border border-black/10 p-2 rounded-xl transition-all active:scale-90 group"
                        title="Switch Direction"
                    >
                        <ArrowLeftRight size={18} className="text-tashi-accent group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs">
                    <span className="text-white/40 italic">Recommended path:</span>
                    <p className="text-gray-300 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {isReverse ? (
                            <>
                                <b className="text-black">Chicham</b> ➔ <b className="text-black">Kibber</b> ➔ <b className="text-black">TashiZom</b> ➔ <b className="text-black">Kee</b>
                            </>
                        ) : (
                            <>
                                <b className="text-black">Kee</b> ➔ <b className="text-black">Kibber</b> ➔ <b className="text-black">TashiZom</b> ➔ <b className="text-black">Chicham</b>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Interactive SVG Map */}
            <div className="flex-1 w-full h-full min-h-0 md:h-[600px] relative bg-white overflow-hidden">
                <motion.svg viewBox={viewBoxString as any} className="w-full h-full p-0" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#DAA520" />
                        </marker>
                        <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#d4d4d4" />
                            <stop offset="20%" stopColor="#e5e5e5" />
                            <stop offset="80%" stopColor="#e5e5e5" />
                            <stop offset="100%" stopColor="#d4d4d4" />
                        </linearGradient>
                        <linearGradient id="riverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#a5f3fc" />
                            <stop offset="100%" stopColor="#67e8f9" />
                        </linearGradient>
                        <pattern id="terrainPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="#000000" opacity="0.05" />
                        </pattern>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* REAL MAP BACKGROUND - Illustrated Map */}
                    <image href="/spiti-real-map.png" x="0" y="0" width="600" height="750" preserveAspectRatio="xMidYMid slice" opacity="0.9" />

                    {/* ANIMATED FLOW OVERLAY */}
                    <g fill="none" stroke="#DAA520" strokeWidth="6" strokeLinecap="round" opacity="0.8" filter="url(#glow)">

                        {/* Segment 1: Kee Area/Link Road -> TashiZom */}
                        <motion.path
                            d={isReverse
                                ? "M 480 300 C 450 400, 360 450, 360 500"
                                : "M 360 500 C 360 450, 450 400, 480 300"}
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            markerEnd="url(#arrowhead)"
                        />

                        {/* Segment 2: TashiZom -> Chicham */}
                        <motion.path
                            d={isReverse
                                ? "M 180 100 C 250 150, 450 200, 480 300"
                                : "M 480 300 C 450 200, 250 150, 180 100"}
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            markerEnd="url(#arrowhead)"
                        />

                        {/* Segment 3: Chicham -> Link Road (Direct Bypass) */}
                        <motion.path
                            d={isReverse
                                ? "M 360 500 C 280 400, 160 300, 180 100"
                                : "M 180 100 C 160 300, 280 400, 360 500"}
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ duration: 3, delay: 3, repeat: Infinity, ease: "easeInOut" }}
                            strokeDasharray="10,10"
                            markerEnd="url(#arrowhead)"
                        />
                    </g>

                    {/* Drive Times */}
                    {!isReverse && (
                        <g fill="#333" fontSize="12" fontStyle="italic" fontWeight="bold">
                            <text x="430" y="420">~15m</text>
                            <text x="320" y="180">~15m</text>
                        </g>
                    )}

                    {/* Nodes */}

                    {/* Nodes */}

                    {/* Link Road / Bifurcation Point - UPDATED */}
                    <g transform="translate(360, 500)" className="group cursor-pointer" onClick={() => setSelectedLoc('linkroad')}>
                        <motion.circle r="8" fill="#d97706" animate={selectedLoc === 'linkroad' ? { scale: 1.5, fill: "#ef4444" } : {}} />
                        <circle r="12" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="2,2" />

                        {/* Turn Right Indicator - Only visible during tour/selection */}
                        <AnimatePresence>
                            {selectedLoc === 'linkroad' && (
                                <motion.g
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {/* Curved Arrow indicating Right Turn */}
                                    <path d="M -10 20 Q 10 20 20 -10 L 15 -5 M 20 -10 L 25 -5" fill="none" stroke="#ef4444" strokeWidth="4" markerEnd="url(#arrowhead)" />
                                    <text x="30" y="-10" fill="#ef4444" fontSize="14" fontWeight="bold">TURN RIGHT</text>
                                    <text x="30" y="5" fill="#333" fontSize="10" fontWeight="bold">to Kibber/Chicham</text>
                                </motion.g>
                            )}
                        </AnimatePresence>
                    </g>

                    {/* Kee Monastery (Bottom Center) - NEW */}
                    <g transform="translate(380, 650)" className="group cursor-pointer" onClick={() => setSelectedLoc('kee')}>
                        <motion.circle r="14" fill="#d97706" animate={selectedLoc === 'kee' ? { r: 18 } : {}} />
                        <text x="0" y="28" textAnchor="middle" fill="black" fontSize="16" fontWeight="bold">Kee Monastery</text>
                        {/* Path to Link Road */}
                        <path d="M 0 -14 L -20 -150" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="4,4" opacity="0.6" />
                    </g>


                    {/* Kibber Village / TashiZom (Center Right) */}
                    <g transform="translate(480, 300)" className="group cursor-pointer" onClick={() => setSelectedLoc('kibber')}>
                        <circle r="12" fill="#22c55e" />
                        <text x="20" y="5" textAnchor="start" fill="black" fontSize="14" fontWeight="bold">Kibber Village</text>
                    </g>

                    {/* Chicham Bridge (Top Left) */}
                    <g transform="translate(180, 100)" className="group cursor-pointer" onClick={() => setSelectedLoc('chicham')}>
                        <circle r="14" fill="#ef4444" />
                        <text x="0" y="30" textAnchor="middle" fill="black" fontSize="15" fontWeight="bold">Chicham Bridge</text>
                    </g>

                    {/* TashiZom - Highlight */}
                    <g transform="translate(500, 310)" className="cursor-pointer" onClick={() => setSelectedLoc('tashizom')}>
                        <circle r="45" fill="#DAA520" opacity="0.15">
                            <animate attributeName="r" from="25" to="65" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle r="18" fill="#DAA520" />
                        <circle r="22" fill="none" stroke="#DAA520" strokeWidth="1" strokeDasharray="4,4">
                            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite" />
                        </circle>
                        <text x="-25" y="10" textAnchor="end" fill="#DAA520" fontSize="24" fontWeight="bold" fontFamily="serif" filter="url(#glow)">TashiZom</text>
                        <motion.g animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                            <path d="M -8 -30 L 0 -45 L 8 -30 Z" fill="#DAA520" />
                        </motion.g>
                    </g>
                    {/* Directional Route Markers */}

                    {/* To Manali (North West) */}
                    <g transform="translate(150, 60)">
                        <motion.path
                            d="M 0 0 L -20 -20"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="3"
                            strokeDasharray="5,5"
                        />
                        <text x="0" y="-25" textAnchor="middle" fill="#22c55e" fontSize="14" fontWeight="bold">To Manali</text>
                    </g>

                    {/* To Kaza (Bottom) */}
                    <g transform="translate(360, 720)">
                        <text x="0" y="0" textAnchor="middle" fill="#22c55e" fontSize="16" fontWeight="bold">To Kaza ↓</text>
                    </g>

                </motion.svg>

                {/* Legend / Overlay - Positioned at Top Right to avoid overlaps */}
                <motion.div
                    drag
                    dragMomentum={false}
                    className="absolute top-4 right-4 flex flex-col gap-2 cursor-move"
                >
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-2 rounded-full border border-black/10 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-tashi-accent animate-pulse" />
                        <span className="text-[10px] text-black font-bold">Click markers for details</span>
                    </div>
                </motion.div>
            </div>

            {/* Location Detail Panel */}
            <AnimatePresence mode="wait">
                {selectedLoc && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white/80 backdrop-blur-2xl border-t border-tashi-accent/30 overflow-hidden"
                    >
                        <div className="p-6 relative">
                            <button
                                onClick={() => setSelectedLoc(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-black"
                            >
                                <Info size={20} />
                            </button>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-tashi-accent/10 rounded-2xl border border-tashi-accent/20">
                                    <Mountain className="text-tashi-accent" size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-xl font-bold text-black font-serif">{LOCATIONS[selectedLoc].name}</h4>
                                        <span className="bg-tashi-accent/20 text-tashi-accent px-2 py-0.5 rounded text-[10px] font-bold border border-tashi-accent/30">
                                            {LOCATIONS[selectedLoc].elevation}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-xs leading-relaxed mb-3">
                                        {LOCATIONS[selectedLoc].desc}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-tashi-accent text-[10px] font-bold uppercase tracking-wider">
                                            <Clock size={12} />
                                            {LOCATIONS[selectedLoc].time}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Prompt */}
            {
                !selectedLoc && (
                    <div className="bg-white/40 p-3 text-center border-t border-black/5">
                        <p className="text-[10px] text-gray-500 font-medium">
                            Exploring Spiti? Grab a hot beverage at TashiZom before your next landmark!
                        </p>
                    </div>
                )
            }
        </div >
    );
}

