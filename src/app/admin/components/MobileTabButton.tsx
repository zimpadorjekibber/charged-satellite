'use client';

import React from 'react';

interface MobileTabButtonProps {
    active: boolean;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}

export default function MobileTabButton({ active, label, icon, onClick }: MobileTabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all flex-shrink-0 min-w-[64px] ${active
                ? 'text-tashi-primary bg-tashi-primary/5'
                : 'text-gray-400 hover:text-gray-600'
                }`}
        >
            <div className={`p-1 rounded-full ${active ? 'bg-tashi-primary/10' : ''}`}>
                {icon}
            </div>
            <span className="text-[10px] font-bold mt-1">{label}</span>
        </button>
    );
}
