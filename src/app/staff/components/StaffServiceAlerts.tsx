'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useStore } from '@/lib/store';

interface StaffServiceAlertsProps {
    notifications: any[];
}

export default function StaffServiceAlerts({ notifications }: StaffServiceAlertsProps) {
    const tables = useStore((state) => state.tables);
    const resolveNotification = useStore((state) => state.resolveNotification);

    const activeNotifications = (notifications || []).filter((n: any) => n.status === 'pending');

    if (activeNotifications.length === 0) return null;

    return (
        <div className="mb-6 space-y-2">
            <AnimatePresence>
                {activeNotifications.map((notification: any) => {
                    const table = tables.find((t: any) => t.id === notification.tableId);
                    const tableName = table ? table.name : 'Unknown Table';
                    return (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-red-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-pulse"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Bell className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">
                                        {notification.type === 'call_staff' ? 'STAFF CALLED' : 'BILL REQUESTED'}
                                    </h3>
                                    <p className="font-medium opacity-90">
                                        {tableName} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {(notification.customerName || notification.customerPhone) && (
                                        <p className="text-xs font-bold mt-1 bg-black/20 inline-block px-2 py-1 rounded">
                                            👤 {notification.customerName || 'Guest'} {notification.customerPhone ? `• 📞 ${notification.customerPhone}` : ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => resolveNotification(notification.id)}
                                className="bg-white text-red-600 px-4 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2 text-lg"
                            >
                                <X size={20} /> Dismiss
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
