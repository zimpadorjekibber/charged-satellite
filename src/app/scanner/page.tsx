'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { X, Loader2, Camera, ScanLine, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScannerPage() {
    const router = useRouter();
    const setTableId = useStore((state: any) => state.setTableId);
    const [error, setError] = useState<string>('');
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const mountedRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;

        const initScanner = async () => {
            try {
                // Permission Check
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    // Close immediately, we just wanted to ask permission
                    stream.getTracks().forEach(track => track.stop());
                    setHasPermission(true);
                } catch (err: any) {
                    console.error("Permission check failed:", err);
                    setHasPermission(false);
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                        setError("Camera access was denied. Please allow camera access in your browser settings.");
                    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                        setError("No camera found on this device.");
                    } else {
                        setError("Cannot access camera. Please retry or upload an image.");
                    }
                    return; // Stop here, show fallback UI
                }

                // If element exists
                if (!document.getElementById("reader")) {
                    console.error("Reader element not found");
                    return;
                }

                const html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        handleScanSuccess(decodedText);
                    },
                    (errorMessage) => {
                        // Ignore frame read errors
                    }
                );
                setIsScanning(true);

            } catch (err: any) {
                console.error("Scanner start error:", err);
                // Don't show critical error for every failure, just log it.
                // Fallback UI is available.
                // If it's a secure context error
                if (typeof window !== 'undefined' && !window.isSecureContext) {
                    setError("Camera requires a secure connection (HTTPS). Use the 'Upload' button or switch to HTTPS.");
                } else {
                    setError("Failed to start scanner. You can upload a QR image instead.");
                }
            }
        };

        // Delay slightly for UI mount
        setTimeout(initScanner, 300);

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
                scannerRef.current.clear();
            }
        };
    }, []);

    const processScannedData = (decodedText: string) => {
        console.log("Processing Scan:", decodedText);
        let scannedTableId = '';

        try {
            // 1. Try URL parsing
            const url = new URL(decodedText);
            const params = new URLSearchParams(url.search);
            scannedTableId = params.get('tableId') || '';
        } catch (e) {
            // 2. Not a URL, try extracting from string
            if (decodedText.includes('tableId=')) {
                const parts = decodedText.split('tableId=');
                if (parts.length > 1) {
                    scannedTableId = parts[1].split('&')[0];
                }
            } else {
                // 3. Raw text (alphanumeric only)
                // Filter out common junk if it's not a table ID
                if (decodedText.length < 20) { // arbitrary length check for safety
                    scannedTableId = decodedText.replace(/[^a-zA-Z0-9-]/g, '');
                }
            }
        }

        if (scannedTableId) {
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            setTableId(scannedTableId);
            router.replace('/customer/cart');
        } else {
            // Invalid QR
            alert("Invalid QR Code: Could not find a Table ID.");
            // Restart scanning if it was a camera scan
            if (scannerRef.current && !scannerRef.current.isScanning) {
                scannerRef.current.resume();
            }
        }
    };

    const handleScanSuccess = (decodedText: string) => {
        // Pause scanning
        if (scannerRef.current) {
            scannerRef.current.pause(true);
        }
        processScannedData(decodedText);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        // We can reuse the existing instance or instantiate a light one just for file
        // Ideally reuse scannerRef if available, but it might be running.
        // Easiest is to use the static parser

        // Actually, html5-qrcode has a scanFile method on the instance
        if (scannerRef.current) {
            scannerRef.current.scanFile(file, true)
                .then(decodedText => {
                    processScannedData(decodedText);
                })
                .catch(err => {
                    console.error("File scan error", err);
                    alert("Could not read QR code from this image. Please try another.");
                });
        } else {
            // Fallback if permission was denied and scannerRef wasn't fully started
            const tempScanner = new Html5Qrcode("reader"); // Re-bind to main div for parsing
            tempScanner.scanFile(file, true)
                .then(decodedText => {
                    processScannedData(decodedText);
                })
                .catch(err => {
                    console.error("File scan error", err);
                    alert("Could not read QR code from image.");
                });
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

            {/* Main Viewport */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                <div id="reader" className="w-full h-full object-cover"></div>

                {/* Loading / Initial State */}
                {hasPermission === null && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white z-10 pointer-events-none">
                        <Loader2 className="animate-spin text-tashi-accent" size={48} />
                        <p className="font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur">Starting Scanner...</p>
                    </div>
                )}

                {/* Overlay Guide (Only show if Scanning) */}
                {hasPermission === true && !error && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        <div className="w-[280px] h-[280px] border-2 border-tashi-accent/50 rounded-3xl relative">
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-tashi-accent rounded-tl-xl -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-tashi-accent rounded-tr-xl -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-tashi-accent rounded-bl-xl -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-tashi-accent rounded-br-xl -mb-1 -mr-1"></div>

                            {/* Scanning Animation */}
                            <motion.div
                                animate={{ top: ['10%', '90%', '10%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                className="absolute left-[10%] right-[10%] h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                            />
                        </div>
                    </div>
                )}

                {/* Fallback / Error UI */}
                {error && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center z-30">
                        <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                            <Camera size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Scanner Issue</h2>
                        <p className="text-gray-400 mb-8 max-w-xs">{error}</p>

                        <div className="flex flex-col gap-3 w-full max-w-xs">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-neutral-800 text-white rounded-xl font-bold hover:bg-neutral-700 transition-colors"
                            >
                                Retry Camera
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls (Always visible for Upload Fallback) */}
            <div className="p-6 bg-neutral-900 border-t border-white/10 z-20">
                <div className="flex gap-4">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 bg-white/10 hover:bg-white/15 text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-colors"
                    >
                        <ImageIcon size={24} className="text-tashi-accent" />
                        <span className="text-xs uppercase tracking-wider">Upload Image</span>
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </div>
                <p className="text-[10px] text-gray-500 text-center mt-3">
                    TashiZom Dining
                </p>
            </div>
        </div>
    );
}
