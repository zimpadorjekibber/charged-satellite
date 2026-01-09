import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Info, Clock, Mountain, ArrowLeftRight } from 'lucide-react';
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
        desc: 'Your premium comfort hub in the heart of the Kibber wildlife sanctuary.',
        time: '2 mins from Kibber'
    },
    chicham: {
        name: 'Chicham Bridge',
        elevation: '4,145m',
        desc: "Asia's highest suspension bridge. This is the direct route to Manali (168km via Losar).",
        time: '15 mins from TashiZom'
    },
    linkroad: {
        name: 'Link Road Exit',
        elevation: '3,800m',
        desc: 'The vital gateway connecting the Kibber loop to the main highway. Head south from here for Kaza.',
        time: 'Direct access to Kaza'
    }
};

export default function LocalMapGuide() {
    const [isReverse, setIsReverse] = useState(false);
    const [selectedLoc, setSelectedLoc] = useState<keyof typeof LOCATIONS | null>(null);

    // Toggle direction every 15 seconds for a dynamic guide
    useEffect(() => {
        const interval = setInterval(() => {
            setIsReverse(prev => !prev);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

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
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 font-bold">Terrain View with Route Flow</p>
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
                <svg viewBox="160 0 480 600" className="w-full h-full p-0" preserveAspectRatio="xMidYMid slice">
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

                    {/* REAL MAP BACKGROUND */}
                    <image href="/spiti-real-map.png" x="0" y="0" width="800" height="600" preserveAspectRatio="xMidYMid slice" opacity="0.8" />

                    {/* ANIMATED FLOW OVERLAY - Tracing the real map road */}
                    <g fill="none" stroke="#DAA520" strokeWidth="6" strokeLinecap="round" opacity="0.8" filter="url(#glow)">
                        {/* 
                            Path Logic - Emphasizing the LOOP:
                            1. Enter from Link Road (Bottom)
                            2. Go UP to TashiZom/Kibber (Right)
                            3. Connect DIRECTLY across to Chicham (Left)
                            4. Exit to Manali (Top)
                         */}

                        {/* Segment 1: Link Road -> TashiZom (Arrival) */}
                        <motion.path
                            d={isReverse
                                ? "M 570 360 C 500 400, 420 500, 400 580"
                                : "M 400 580 C 420 500, 500 400, 570 360"}
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            markerEnd="url(#arrowhead)"
                        />

                        {/* Segment 2: TashiZom -> Chicham (The Direct Link) */}
                        {/* This curve visualizes the high-altitude connecting road - Adjusted end point to (280, 180) */}
                        <motion.path
                            d={isReverse
                                ? "M 280 180 C 380 160, 550 220, 570 360"
                                : "M 570 360 C 550 220, 380 160, 280 180"}
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            markerEnd="url(#arrowhead)"
                        />
                    </g>

                    {/* Drive Times */}
                    {!isReverse && (
                        <g fill="#555" fontSize="10" fontStyle="italic" fontWeight="bold">
                            <text x="450" y="480">~15m</text>
                            <text x="400" y="270">~15m</text>
                        </g>
                    )}

                    {/* Nodes */}

                    {/* Chicham-Kibber Link Road (Formerly Kee Marker position) - Moved to bifurcation point */}
                    <g transform="translate(400, 550)" className="group cursor-pointer" onClick={() => setSelectedLoc('linkroad')}>
                        {/* Using Link Road data but orange marker style as requested */}
                        <motion.circle r="12" fill="#d97706" animate={selectedLoc === 'linkroad' ? { r: 16 } : {}} />
                        <text x="0" y="28" textAnchor="middle" fill="black" fontSize="13" fontWeight="bold">Chicham-Kibber Link Rd</text>
                    </g>

                    {/* To Kee Monastery (Directional Arrow at Bottom Left) */}
                    <g transform="translate(250, 550)">
                        <motion.path
                            d="M 0 -10 L 0 30"
                            fill="none"
                            stroke="#d97706"
                            strokeWidth="3"
                            strokeDasharray="5,5"
                            animate={{ strokeDashoffset: [0, 10] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                        <path d="M -5 25 L 0 35 L 5 25" fill="#d97706" />
                        <text x="0" y="-15" textAnchor="middle" fill="#d97706" fontSize="14" fontWeight="bold">To Kee Monastery</text>
                    </g>

                    {/* Kibber Village (Center Right) */}
                    <g transform="translate(550, 350)" className="group cursor-pointer" onClick={() => setSelectedLoc('kibber')}>
                        <circle r="12" fill="#22c55e" />
                        <text x="-15" y="5" textAnchor="end" fill="black" fontSize="14" fontWeight="bold">Kibber Village</text>
                    </g>

                    {/* Chicham Bridge (Top Left) - Moved DOWN to 180 to shrink space */}
                    <g transform="translate(280, 180)" className="group cursor-pointer" onClick={() => setSelectedLoc('chicham')}>
                        <circle r="14" fill="#ef4444" />
                        <text x="-15" y="5" textAnchor="end" fill="black" fontSize="14" fontWeight="bold">Chicham Bridge</text>
                    </g>

                    {/* TashiZom - THE TARGET (Near Kibber) */}
                    <g transform="translate(570, 360)" className="cursor-pointer" onClick={() => setSelectedLoc('tashizom')}>
                        <circle r="45" fill="#DAA520" opacity="0.15">
                            <animate attributeName="r" from="25" to="55" dur="2s" repeatCount="indefinite" />
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

                    {/* To Manali (North from Chicham) - Moved down with Chicham */}
                    <g transform="translate(260, 160)">
                        <motion.path
                            d="M 0 0 L -20 -30"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="3"
                            strokeDasharray="5,5"
                            animate={{ strokeDashoffset: [0, -10] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                        <text x="0" y="-35" textAnchor="start" fill="#22c55e" fontSize="14" fontWeight="bold">To Manali</text>
                    </g>

                    {/* To Kaza (South from Link Road area) - Changed to Green */}
                    <g transform="translate(400, 580)">
                        <motion.path
                            d="M 0 10 L 0 50"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="3"
                            strokeDasharray="5,5"
                            animate={{ strokeDashoffset: [0, 10] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                        <text x="10" y="30" fill="#22c55e" fontSize="14" fontWeight="bold">To Kaza</text>
                    </g>

                </svg>

                {/* Legend / Overlay - Positioned near the river bend as requested */}
                <motion.div
                    drag
                    dragMomentum={false}
                    className="absolute top-[40%] left-6 flex flex-col gap-2 cursor-move"
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

