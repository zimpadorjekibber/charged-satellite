
'use client';

import { useStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Loader2, MapPinOff } from 'lucide-react';

// Coordinates for TashiZom, Kibber (Approximate for demo)
const RESTAURANT_LOCATION = {
    lat: 32.329112,
    lng: 78.0080953
};
const MAX_DISTANCE_KM = 50000; // Increased for testing

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

function ScanPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tableId = searchParams.get('tableId');
    const setTableId = useStore((state) => state.setTableId);

    const geoRadius = useStore((state) => state.geoRadius);

    const [status, setStatus] = useState<string>('Verifying location...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tableId) {
            setError("Invalid QR Code. No Table ID found.");
            return;
        }

        // Record Scan
        useStore.getState().recordScan('table_qr', { tableId });

        // Check if Geolocation is supported
        if (!navigator.geolocation) {
            console.warn("Geolocation not supported. Proceeding...");
            proceed();
            return;
        }

        setStatus('Checking distance...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const dist = calculateDistance(
                    position.coords.latitude,
                    position.coords.longitude,
                    RESTAURANT_LOCATION.lat,
                    RESTAURANT_LOCATION.lng
                );

                console.log(`User distance: ${dist.toFixed(2)}km, Allowed: ${geoRadius}km`);

                if (dist > geoRadius) {
                    setError(`You are ${dist.toFixed(2)}km away. Orders are restricted to within ${geoRadius}km of the restaurant.`);
                    setStatus('');
                } else {
                    proceed();
                }
            },
            (err) => {
                console.error("Geolocation Error:", err);
                // If denied or error, we might want to block or allow. 
                // Currently blocking if we can't verify location for strict mode.
                // But for better UX on random devices/errors, we might show a warning.
                // However, user asked for restriction. Let's block if we can't verify, or ask to retry.
                if (err.code === 1) { // PERMISSION_DENIED
                    setError("Location permission denied. Please enable location services to place an order.");
                } else {
                    // Position unavailable or timeout
                    // Ideally we should block, but in dev it might be annoying. 
                    // Let's block but offer a 'retry' which reloads.
                    setError("Unable to retrieve location. Please ensure GPS is on.");
                }
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );

        async function proceed() {
            if (tableId) {
                setTableId(tableId);
                // Allow state persistence to trigger
                await new Promise(resolve => setTimeout(resolve, 100));
                router.replace('/customer/menu');
            }
        }
    }, [tableId, router, setTableId, geoRadius]);

    if (error) {
        return (
            <div className="min-h-screen bg-tashi-darker flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <MapPinOff size={32} />
                </div>
                <h1 className="text-xl font-bold text-white mb-2">Turn On Location please...</h1>
                <p className="text-gray-400 mb-6">{error}</p>
                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 font-bold"
                    >
                        Retry Location
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tashi-darker flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="animate-spin text-tashi-accent mb-4" size={48} />
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to TashiZom</h1>
            <p className="text-gray-400">{status}</p>
        </div>
    );
}

export default function ScanPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-tashi-darker flex items-center justify-center">
                <Loader2 className="animate-spin text-tashi-accent" size={32} />
            </div>
        }>
            <ScanPageContent />
        </Suspense>
    );
}
