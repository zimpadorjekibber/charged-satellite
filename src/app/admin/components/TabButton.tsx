'use client';

import React from 'react';

interface TabButtonProps {
    active: boolean;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}

export default function TabButton({ active, label, icon, onClick }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${active
                ? 'bg-tashi-primary text-white font-bold shadow-lg shadow-tashi-primary/20'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
