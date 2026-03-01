'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    subtext: string;
}

export default function StatCard({ title, value, icon, subtext }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 italic">
                    {icon}
                </div>
                <div className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                    Active
                </div>
            </div>
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1 italic">{title}</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter font-serif">{value}</h3>
                <p className="text-gray-400 text-[10px] mt-2 font-medium italic">{subtext}</p>
            </div>
        </motion.div>
    );
}
