
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        // Attempt to rescue legacy QR codes: /scan/TABLE_ID
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path.startsWith('/scan/')) {
                const parts = path.split('/');
                const legacyId = parts[parts.length - 1]; // items/scan/123 -> 123
                if (legacyId && legacyId !== 'scan') {
                    console.log('Redirecting legacy QR to:', `/scan?tableId=${legacyId}`);
                    router.replace(`/scan?tableId=${legacyId}`);
                    return;
                }
            }
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-tashi-darker flex flex-col items-center justify-center text-center p-6">
            <h1 className="text-4xl font-bold text-tashi-accent mb-4 font-serif">404</h1>
            <p className="text-gray-400 mb-8">Page not found.</p>
            <Loader2 className="animate-spin text-white/20" />
            <p className="text-gray-600 text-xs mt-4">Checking for redirects...</p>
        </div>
    );
}
