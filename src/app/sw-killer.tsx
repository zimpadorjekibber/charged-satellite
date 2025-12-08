'use client';

import { useEffect } from 'react';

export function ServiceWorkerKiller() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (const registration of registrations) {
                    console.log('Unregistering Service Worker:', registration);
                    registration.unregister();
                }
            });

            // Also clear caches
            if ('caches' in window) {
                caches.keys().then((names) => {
                    for (const name of names) {
                        console.log('Deleting cache:', name);
                        caches.delete(name);
                    }
                });
            }
        }
    }, []);

    return null;
}
