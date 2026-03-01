'use client';

import React from 'react';
import { Grid, Plus, Trash, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '@/lib/store';

export function TableManagement() {
    const tables = useStore((state) => state.tables);
    const addTable = useStore((state) => state.addTable);
    const updateTable = useStore((state) => state.updateTable);
    const removeTable = useStore((state) => state.removeTable);

    const HOST_URL = typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' ? 'http://192.168.1.109:3000' : window.location.origin)
        : '';

    return (
        <div id="table-management" className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm scroll-mt-24">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Grid size={24} className="text-tashi-accent" /> Table Management
                    </h2>
                    <p className="text-gray-500 text-sm">Add or remove tables and generate QR codes for each.</p>
                </div>
                <button
                    onClick={() => {
                        const name = prompt("Enter Table Name/Number:");
                        if (name) addTable(name);
                    }}
                    className="bg-black text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
                >
                    <Plus size={18} /> Add Table
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map((table) => (
                    <div key={table.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-4 group hover:border-tashi-accent transition-colors">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <QRCodeSVG
                                value={`${HOST_URL}/?table=${table.id}`}
                                size={120}
                                level="H"
                                includeMargin={true}
                                id={`qr-${table.id}`}
                            />
                        </div>
                        <div className="text-center w-full">
                            <input
                                defaultValue={table.name}
                                onBlur={(e) => updateTable(table.id, e.target.value)}
                                className="bg-transparent text-lg font-bold text-gray-900 border-b-2 border-transparent focus:border-tashi-accent outline-none text-center w-full px-2 py-1"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-mono">ID: {table.id}</p>
                        </div>
                        <div className="flex gap-2 w-full pt-2">
                            <button
                                onClick={() => {
                                    const svg = document.getElementById(`qr-${table.id}`);
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
                                                downloadLink.download = `table-${table.name}-qr.png`;
                                                downloadLink.href = pngFile;
                                                downloadLink.click();
                                            }
                                        };
                                        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                                    }
                                }}
                                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-50 mb-2"
                            >
                                <Download size={14} /> Download QR
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm("Delete Table?")) removeTable(table.id);
                                }}
                                className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-2"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
