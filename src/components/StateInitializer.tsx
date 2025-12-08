'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function StateInitializer() {
    const initialize = useStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return null;
}
