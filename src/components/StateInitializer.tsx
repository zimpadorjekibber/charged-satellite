'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function StateInitializer() {
    const initialize = useStore((state) => state.initialize);

    useEffect(() => {
        initialize();

        // Canvas/Domain Redirect
        if (typeof window !== 'undefined' && window.location.hostname === 'charged-satellite.vercel.app') {
            window.location.replace('https://tashizomcafe.in' + window.location.pathname + window.location.search);
        }
    }, [initialize]);

    return null;
}
