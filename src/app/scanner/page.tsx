'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { X, Loader2, Camera, ScanLine } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScannerPage() {
    const router = useRouter();
    const setTableId = useStore((state: any) => state.setTableId);
    const [error, setError] = useState<string>('');
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;

        const startScanner = async () => {
            try {
                // Check permissions first
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    stream.getTracks().forEach(track => track.stop()); // Stop immediately, just checking
                    setHasPermission(true);
                } catch (err) {
                    console.error("Camera permission denied:", err);
                    setHasPermission(false);
                    setError("Camera permission is required to scan QR codes.");
                    return;
                }

                const html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText, decodedResult) => {
                        handleScanSuccess(decodedText);
                    },
                    (errorMessage) => {
                        // ignore errors like "QR code not found"
                    }
                );
            } catch (err) {
                console.error("Failed to start scanner:", err);
                setError("Failed to start camera. Please ensure you are using a secure connection (HTTPS).");
            }
        };

        // Small delay to ensure DOM is ready
        setTimeout(startScanner, 100);

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
                scannerRef.current.clear();
            }
        };
    }, []);

    const handleScanSuccess = (decodedText: string) => {
        if (scannerRef.current) {
            scannerRef.current.stop().catch(console.error);
        }

        console.log("Scanned:", decodedText);

        // Parse Table ID
        // Expected formats: 
        // 1. Full URL: https://domain.com/scan?tableId=5
        // 2. Query param: tableId=5
        // 3. Raw text: 5 (Fallback)

        let scannedTableId = '';

        try {
            const url = new URL(decodedText);
            const params = new URLSearchParams(url.search);
            scannedTableId = params.get('tableId') || '';
        } catch (e) {
            // Not a URL, check if it's a query string
            if (decodedText.includes('tableId=')) {
                const parts = decodedText.split('tableId=');
                if (parts.length > 1) {
                    scannedTableId = parts[1].split('&')[0];
                }
            } else {
                // Assume raw text
                scannedTableId = decodedText.replace(/[^a-zA-Z0-9-]/g, '');
            }
        }

        if (scannedTableId) {
            // Success!
            if (navigator.vibrate) navigator.vibrate(200);

            // Set ID
            setTableId(scannedTableId);

            // Redirect back to Cart to finish order
            router.replace('/customer/cart');
        } else {
            setError("Invalid QR Code. Could not find Table ID.");
            // Restart scanner after 2s
            setTimeout(() => {
                setError('');
                if (scannerRef.current) {
                    scannerRef.current.resume();
                }
            }, 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <h1 className="text-white font-bold text-lg flex items-center gap-2">
                    <ScanLine className="text-tashi-accent" /> Scan QR
                </h1>
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Scanner Viewport */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                <div id="reader" className="w-full h-full object-cover"></div>

                {/* Overlay UI when permission ok */}
                {hasPermission === true && !error && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        <div className="w-[280px] h-[280px] border-2 border-tashi-accent/50 rounded-3xl relative">
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-tashi-accent rounded-tl-xl -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-tashi-accent rounded-tr-xl -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-tashi-accent rounded-bl-xl -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-tashi-accent rounded-br-xl -mb-1 -mr-1"></div>

                            {/* Scanning Line Animation */}
                            <motion.div
                                animate={{ top: ['10%', '90%', '10%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                className="absolute left-[10%] right-[10%] h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                            />
                        </div>
                        <p className="mt-8 text-white/80 font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                            Point camera at Table QR Code
                        </p>
                    </div>
                )}

                {/* Loading State */}
                {hasPermission === null && (
                    <div className="text-white flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-tashi-accent" size={48} />
                        <p>Starting Camera...</p>
                    </div>
                )}

                {/* Error State */}
                {((hasPermission === false) || error) && (
                    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8 text-center z-10">
                        <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <Camera size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Camera Issue</h2>
                        <p className="text-gray-400 mb-8">{error || "Please allow camera access to scan codes."}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-tashi-primary text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
