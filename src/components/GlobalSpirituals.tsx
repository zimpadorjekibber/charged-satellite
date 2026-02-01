'use client';

import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function GlobalSpirituals() {
    const landingPhotos = useStore((state) => state.landingPhotos);
    const pathname = usePathname();

    // Optionally hide on specific pages (like admin) if desired, 
    // but user asked for "har pages" (every page)
    if (!landingPhotos) return null;

    return (
        <>
            {/* Global Moving Spiritual Strip (Flags + Rotating Wheels) */}
            {landingPhotos.prayerFlags && (
                <div
                    className="fixed top-0 left-0 right-0 z-[100] h-10 md:h-14 overflow-hidden flex pointer-events-none select-none bg-black/5 backdrop-blur-[1px] border-b border-white/10"
                    style={{
                        transform: 'translate3d(0,0,0)',
                        WebkitTransform: 'translate3d(0,0,0)',
                        willChange: 'transform',
                        paddingTop: 'env(safe-area-inset-top)'
                    }}
                >
                    <div className="flex animate-[flags_60s_linear_infinite] items-center">
                        {[...Array(12)].map((_, i) => (
                            <div key={`group-${i}`} className="flex items-center flex-shrink-0">
                                {/* The Prayer Flags */}
                                <img
                                    src={landingPhotos.prayerFlags!}
                                    alt=""
                                    className="h-6 md:h-10 w-auto object-contain opacity-80"
                                />

                                {/* The Prayer Wheel (GIF - rotates itself) */}
                                {landingPhotos.prayerWheel && (
                                    <div className="mx-4 md:mx-8">
                                        <img
                                            src={landingPhotos.prayerWheel}
                                            alt="Spiritual Wheel"
                                            className="h-8 md:h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(218,165,32,0.4)] opacity-70"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* Perfect Duplicate for Infinite Animation */}
                        {[...Array(12)].map((_, i) => (
                            <div key={`dup-${i}`} className="flex items-center flex-shrink-0">
                                <img
                                    src={landingPhotos.prayerFlags!}
                                    alt=""
                                    className="h-6 md:h-10 w-auto object-contain opacity-80"
                                />
                                {landingPhotos.prayerWheel && (
                                    <div className="mx-4 md:mx-8">
                                        <img
                                            src={landingPhotos.prayerWheel}
                                            alt="Spiritual Wheel"
                                            className="h-8 md:h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(218,165,32,0.4)] opacity-70"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
