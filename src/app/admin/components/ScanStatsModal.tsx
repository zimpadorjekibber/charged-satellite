'use client';

import React, { useState } from 'react';
import { X, Search, Filter, Download } from 'lucide-react';

export default function ScanStatsModal({ onClose, stats }: { onClose: () => void; stats: any[] }) {
    const [filter, setFilter] = useState('');

    const filteredStats = stats.filter(s =>
        s.tableNumber.toString().includes(filter) ||
        (s.userAgent || '').toLowerCase().includes(filter.toLowerCase())
    );

    const getDeviceInfo = (ua: string) => {
        if (!ua) return 'Unknown';
        if (ua.includes('iPhone')) return 'iPhone';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Macintosh')) return 'Mac';
        return 'Other Device';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl p-6 shadow-2xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">QR Scan Analytics</h2>
                        <p className="text-gray-500 text-sm">Real-time engagement tracking across tables</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Filter by table or device..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tashi-primary transition-all shadow-inner"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 text-xs font-black uppercase text-gray-400 tracking-widest">Table</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-400 tracking-widest">Time</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-400 tracking-widest">Device</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-400 tracking-widest">Browser</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStats.map((s, i) => (
                                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white font-bold text-xs ring-4 ring-gray-100">
                                            {s.tableNumber}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-600">
                                        {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <span className="block text-[10px] text-gray-400 uppercase font-black">{new Date(s.timestamp).toLocaleDateString()}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getDeviceInfo(s.userAgent).includes('iPhone') ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                            {getDeviceInfo(s.userAgent)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-[10px] font-mono text-gray-400 truncate max-w-[200px]" title={s.userAgent}>
                                        {s.userAgent?.slice(0, 40)}...
                                    </td>
                                </tr>
                            ))}
                            {filteredStats.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
                                                <Filter className="text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-serif italic">No matching scans found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
