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
        <div className="bg-neutral-900 border border-tashi-accent/20 rounded-3xl overflow-hidden relative w-full flex flex-col max-w-3xl mx-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Topography Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstripe.png')]" />

            {/* Header / Instructions */}
            <div className="bg-black/60 backdrop-blur-xl p-5 w-full z-20 border-b border-white/10 relative">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-tashi-accent font-serif font-bold text-xl flex items-center gap-2">
                            <Navigation size={20} className={`transition-transform duration-700 ${isReverse ? 'rotate-180' : ''}`} />
                            Interactive Tourist Loop
                        </h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 font-bold">Spiti Valley Expedition Guide</p>
                    </div>
                    <button
                        onClick={() => setIsReverse(!isReverse)}
                        className="bg-white/5 hover:bg-tashi-accent/20 border border-white/10 p-2 rounded-xl transition-all active:scale-90 group"
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
                                <b className="text-white">Chicham</b> ➔ <b className="text-white">Kibber</b> ➔ <b className="text-white">TashiZom</b> ➔ <b className="text-white">Kee</b>
                            </>
                        ) : (
                            <>
                                <b className="text-white">Kee</b> ➔ <b className="text-white">Kibber</b> ➔ <b className="text-white">TashiZom</b> ➔ <b className="text-white">Chicham</b>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Interactive SVG Map */}
            <div className="flex-1 w-full aspect-[4/3] relative bg-[#0a0a0a]">
                <svg viewBox="0 0 800 600" className="w-full h-full p-4">
                    <defs>
                        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#DAA520" />
                        </marker>
                        <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#1a1a1a" />
                            <stop offset="50%" stopColor="#222" />
                            <stop offset="100%" stopColor="#1a1a1a" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* MOUNTAIN SILHOUETTES Background */}
                    <path d="M 0 400 L 150 250 L 300 380 L 500 150 L 650 320 L 800 180 V 600 H 0 Z" fill="#0f0f0f" opacity="0.5" />
                    <path d="M 0 450 L 200 320 L 400 450 L 600 280 L 800 400 V 600 H 0 Z" fill="#141414" opacity="0.8" />

                    {/* ROADS - Base */}
                    <g stroke="url(#roadGrad)" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.8">
                        <path d="M 120 530 Q 230 520 350 480" />
                        <path d="M 350 480 Q 515 480 680 380" />
                        <path d="M 680 380 Q 700 315 680 250" />
                        <path d="M 680 250 Q 550 150 350 100" />
                        <path d="M 350 100 Q 200 250 350 480" />
                    </g>

                    {/* ANIMATED FLOW */}
                    <g fill="none" stroke="#DAA520" strokeWidth="4" strokeLinecap="round" opacity="0.8">
                        <motion.path
                            key={isReverse ? 's1r' : 's1f'}
                            d={isReverse ? "M 350 480 Q 230 520 120 530" : "M 120 530 Q 230 520 350 480"}
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            markerEnd="url(#arrowhead)"
                        />
                        <motion.path
                            key={isReverse ? 's2r' : 's2f'}
                            d={isReverse ? "M 680 380 Q 515 480 350 480" : "M 350 480 Q 515 480 680 380"}
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "linear" }}
                            markerEnd="url(#arrowhead)"
                        />
                        <motion.path
                            key={isReverse ? 's3r' : 's3f'}
                            d={isReverse ? "M 680 250 Q 700 315 680 380" : "M 680 380 Q 700 315 680 250"}
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 2, repeat: Infinity, ease: "linear" }}
                            markerEnd="url(#arrowhead)"
                        />
                        <motion.path
                            key={isReverse ? 's4r' : 's4f'}
                            d={isReverse ? "M 350 100 Q 550 150 680 250" : "M 680 250 Q 550 150 350 100"}
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ duration: 2.5, delay: 3, repeat: Infinity, ease: "linear" }}
                            markerEnd="url(#arrowhead)"
                        />
                        <motion.path
                            key={isReverse ? 's5r' : 's5f'}
                            d={isReverse ? "M 350 480 Q 200 250 350 100" : "M 350 100 Q 200 250 350 480"}
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ duration: 3, delay: 4.5, repeat: Infinity, ease: "linear" }}
                            markerEnd="url(#arrowhead)"
                        />
                    </g>

                    {/* Drive Times */}
                    {!isReverse && (
                        <g fill="#555" fontSize="10" fontStyle="italic" fontWeight="bold">
                            <text x="210" y="515">~12m</text>
                            <text x="500" y="470">~15m</text>
                            <text x="695" y="325">~2m</text>
                            <text x="500" y="160">~15m</text>
                        </g>
                    )}

                    {/* Nodes */}
                    {/* Link Road */}
                    <g transform="translate(350, 480)" className="group cursor-pointer" onClick={() => setSelectedLoc('linkroad')}>
                        <circle r="12" fill={selectedLoc === 'linkroad' ? '#3b82f6' : '#222'} stroke="#3b82f6" strokeWidth="2" />
                        <text y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Link Road</text>
                    </g>

                    {/* Kee Monastery */}
                    <g transform="translate(120, 530)" className="group cursor-pointer" onClick={() => setSelectedLoc('kee')}>
                        <motion.circle r="14" fill="#d97706" animate={selectedLoc === 'kee' ? { r: 18 } : {}} />
                        <text y="-25" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Kee Monastery</text>
                    </g>

                    {/* Kibber Village */}
                    <g transform="translate(680, 250)" className="group cursor-pointer" onClick={() => setSelectedLoc('kibber')}>
                        <circle r="12" fill="#22c55e" />
                        <text x="20" y="0" fill="white" fontSize="14" fontWeight="bold">Kibber Village</text>
                    </g>

                    {/* Chicham Bridge */}
                    <g transform="translate(350, 100)" className="group cursor-pointer" onClick={() => setSelectedLoc('chicham')}>
                        <circle r="14" fill="#ef4444" />
                        <text y="-25" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Chicham Bridge</text>
                    </g>

                    {/* TashiZom - THE TARGET */}
                    <g transform="translate(680, 380)" className="cursor-pointer" onClick={() => setSelectedLoc('tashizom')}>
                        <circle r="45" fill="#DAA520" opacity="0.15">
                            <animate attributeName="r" from="25" to="55" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle r="18" fill="#DAA520" />
                        <circle r="22" fill="none" stroke="#DAA520" strokeWidth="1" strokeDasharray="4,4">
                            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite" />
                        </circle>
                        <text x="30" y="10" fill="#DAA520" fontSize="24" fontWeight="bold" fontFamily="serif" filter="url(#glow)">TashiZom</text>
                        <motion.g animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                            <path d="M -8 -30 L 0 -45 L 8 -30 Z" fill="#DAA520" />
                        </motion.g>
                    </g>
                    {/* Directional Route Markers */}

                    {/* To Manali (North from Chicham) */}
                    <g transform="translate(350, 80)">
                        <motion.path
                            d="M 0 -10 L 0 -50"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="3"
                            strokeDasharray="5,5"
                            animate={{ strokeDashoffset: [0, -10] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                        <path d="M -5 -45 L 0 -55 L 5 -45" fill="#22c55e" />
                        <text x="10" y="-45" fill="#22c55e" fontSize="20" fontWeight="bold">Manali</text>
                        <text x="12" y="-28" fill="#4ade80" fontSize="10" fontWeight="medium">168 km from TashiZom</text>
                    </g>

                    {/* To Kaza (South from Link Road area) */}
                    <g transform="translate(350, 500)">
                        <motion.path
                            d="M 0 10 L 0 50"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray="5,5"
                            animate={{ strokeDashoffset: [0, 10] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                        <path d="M -5 45 L 0 55 L 5 45" fill="#3b82f6" />
                        <text x="10" y="48" fill="#3b82f6" fontSize="18" fontWeight="bold">To Kaza</text>
                        <text x="12" y="62" fill="#60a5fa" fontSize="11" fontWeight="medium">20 km from TashiZom</text>
                    </g>

                </svg>

                {/* Legend / Overlay */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-tashi-accent animate-pulse" />
                        <span className="text-[10px] text-white font-medium">Click markers for details</span>
                    </div>
                </div>
            </div>

            {/* Location Detail Panel */}
            <AnimatePresence mode="wait">
                {selectedLoc && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/80 backdrop-blur-2xl border-t border-tashi-accent/30 overflow-hidden"
                    >
                        <div className="p-6 relative">
                            <button
                                onClick={() => setSelectedLoc(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <Info size={20} />
                            </button>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-tashi-accent/10 rounded-2xl border border-tashi-accent/20">
                                    <Mountain className="text-tashi-accent" size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-xl font-bold text-white font-serif">{LOCATIONS[selectedLoc].name}</h4>
                                        <span className="bg-tashi-accent/20 text-tashi-accent px-2 py-0.5 rounded text-[10px] font-bold border border-tashi-accent/30">
                                            {LOCATIONS[selectedLoc].elevation}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-xs leading-relaxed mb-3">
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
            {!selectedLoc && (
                <div className="bg-black/40 p-3 text-center border-t border-white/5">
                    <p className="text-[10px] text-gray-500 font-medium">
                        Exploring Spiti? Grab a hot beverage at TashiZom before your next landmark!
                    </p>
                </div>
            )}
        </div>
    );
}

