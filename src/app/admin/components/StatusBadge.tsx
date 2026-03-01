'use client';

import React from 'react';

export default function StatusBadge({ status }: { status: string }) {
    const getStatusStyles = () => {
        switch (status) {
            case 'Pending': return 'bg-orange-500 text-white shadow-orange-500/20';
            case 'Preparing': return 'bg-blue-500 text-white shadow-blue-500/20';
            case 'Served': return 'bg-purple-500 text-white shadow-purple-500/20';
            case 'Paid': return 'bg-green-500 text-white shadow-green-500/20';
            case 'Cancelled':
            case 'Rejected': return 'bg-red-500 text-white shadow-red-500/20';
            default: return 'bg-gray-500 text-white shadow-gray-500/20';
        }
    };

    return (
        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm uppercase tracking-widest ${getStatusStyles()}`}>
            {status}
        </span>
    );
}
