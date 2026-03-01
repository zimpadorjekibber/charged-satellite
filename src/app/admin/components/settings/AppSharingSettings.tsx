'use client';

import React from 'react';
import { Share2, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export function AppSharingSettings() {
    const handleShareApp = async () => {
        const shareData = {
            title: 'TashiZom | Digital Dining',
            text: 'Check out the TashiZom menu and order food instantly!',
            url: 'https://tashizomcafe.in'
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            navigator.clipboard.writeText('https://tashizomcafe.in');
            alert('Link copied to clipboard!');
        }
    };

    const handleDownloadQR = () => {
        const svg = document.getElementById('app-home-qr');
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                if (ctx) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    const pngFile = canvas.toDataURL('image/png');
                    const downloadLink = document.createElement('a');
                    downloadLink.download = 'tashizom-app-qr.png';
                    downloadLink.href = pngFile;
                    downloadLink.click();
                }
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        }
    };

    return (
        <div id="app-sharing-settings" className="bg-gradient-to-br from-orange-100 to-white border border-tashi-accent/30 rounded-2xl p-8 shadow-sm scroll-mt-24">
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="bg-white p-4 rounded-xl shadow-lg shadow-orange-100 border border-orange-100">
                    <QRCodeSVG
                        value="https://tashizomcafe.in"
                        size={200}
                        level="H"
                        includeMargin={true}
                        id="app-home-qr"
                    />
                </div>
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Share TashiZom App</h2>
                        <p className="text-gray-600">
                            Scan to open the home page immediately. Share this link with guests to let them access the menu from anywhere.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <button
                            onClick={handleShareApp}
                            className="bg-tashi-accent hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-yellow-500/20"
                        >
                            <Share2 size={20} />
                            Share App Link
                        </button>

                        <button
                            onClick={handleDownloadQR}
                            className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl flex items-center gap-2 border border-gray-200 shadow-sm"
                        >
                            <Download size={20} />
                            Download QR
                        </button>
                    </div>
                    <p className="text-xs text-orange-500 font-mono">https://tashizomcafe.in</p>
                </div>
            </div>
        </div>
    );
}
