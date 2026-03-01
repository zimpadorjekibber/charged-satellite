'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Order, MenuItem } from '@/lib/store';

export default function AnalyticsView({ orders, menu }: { orders: Order[], menu: MenuItem[] }) {
    // 1. Top Selling Items
    const topItems = useMemo(() => {
        const itemCounts: Record<string, number> = {};
        orders.forEach(o => {
            o.items.forEach(i => {
                itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
            });
        });

        return Object.entries(itemCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    }, [orders]);

    // 2. Hourly Sales (Simple approximation)
    const hours = useMemo(() => {
        const hArray = Array(24).fill(0);
        orders.forEach(o => {
            try {
                const date = new Date(o.createdAt);
                if (!isNaN(date.getTime())) {
                    hArray[date.getHours()] += o.totalAmount;
                }
            } catch (e) {
                console.error("Invalid date parsing", e);
            }
        });
        return hArray;
    }, [orders]);

    const maxHourSales = useMemo(() => Math.max(...hours, 1), [hours]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Top Selling Items</h3>
                <div className="space-y-4">
                    {topItems.map(([name, count], idx) => (
                        <div key={name} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-tashi-primary text-white font-bold flex items-center justify-center">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-900 font-medium">{name}</span>
                                    <span className="text-gray-500 text-sm">{count} sold</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-tashi-primary" style={{ width: `${(count / topItems[0][1]) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {topItems.length === 0 && <p className="text-gray-500">Not enough data yet.</p>}
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue / Hour</h3>
                <div className="flex items-end justify-between h-48 gap-2">
                    {hours.map((val, idx) => {
                        const height = (val / maxHourSales) * 100;
                        if (idx < 10 || idx > 23) return null; // Show 10 AM to 11 PM range approx
                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="relative flex-1 w-full flex items-end">
                                    <div
                                        className="w-full bg-tashi-primary rounded-t-sm transition-all group-hover:bg-red-600"
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ₹{val}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">{idx % 12 || 12}{idx >= 12 ? 'PM' : 'AM'}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
