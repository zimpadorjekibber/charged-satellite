'use client';

import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function GlobalSpirituals() {
    const landingPhotos = useStore((state) => state.landingPhotos);
    const pathname = usePathname();

    // Optionally hide on specific pages (like admin) if desired, 
    // but user asked for "har pages" (every page)
    const isAdmin = pathname?.startsWith('/admin');

    if (!landingPhotos) return null;

    return (
        <>
            {/* Global Prayer Flags at the top of everything */}
            {landingPhotos.prayerFlags && (
                <div className="fixed top-0 left-0 right-0 z-[100] h-5 md:h-8 overflow-hidden flex pointer-events-none select-none bg-black/5 backdrop-blur-[1px] border-b border-white/5">
                    <div className="flex animate-[flags_40s_linear_infinite] min-w-full">
                        {[...Array(20)].map((_, i) => (
                            <img
                                key={i}
                                src={landingPhotos.prayerFlags!}
                                alt=""
                                className="h-full w-auto object-contain flex-shrink-0"
                                title="Tashi Delek"
                            />
                        ))}
                        {[...Array(20)].map((_, i) => (
                            <img
                                key={`dup-${i}`}
                                src={landingPhotos.prayerFlags!}
                                alt=""
                                className="h-full w-auto object-contain flex-shrink-0"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Subtle Rotating Prayer Wheel in Corner */}
            {landingPhotos.prayerWheel && !isAdmin && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed bottom-6 right-6 z-[90] pointer-events-none select-none hidden md:block"
                >
                    <motion.img
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        src={landingPhotos.prayerWheel}
                        alt="Prayer Wheel"
                        className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(218,165,32,0.2)] opacity-30 group-hover:opacity-50 transition-opacity"
                    />
                </motion.div>
            )}

            {/* Mobile Prayer Wheel (Top Corner) */}
            {landingPhotos.prayerWheel && !isAdmin && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed top-10 right-3 z-[90] pointer-events-none select-none md:hidden"
                >
                    <motion.img
                        animate={{ rotate: 360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        src={landingPhotos.prayerWheel}
                        alt="Prayer Wheel"
                        className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(218,165,32,0.1)] opacity-20"
                    />
                </motion.div>
            )}
        </>
    );
}
