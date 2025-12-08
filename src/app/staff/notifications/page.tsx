
'use client';

import { useStore } from '@/lib/store';
import { Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationsPage() {
    const notifications = useStore((state) => state.notifications);
    const resolveNotification = useStore((state) => state.resolveNotification);

    const activeNotifications = notifications.filter(n => n.status === 'pending');

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white font-serif flex items-center gap-3">
                <Bell className="text-tashi-accent" />
                Notifications
            </h1>

            {activeNotifications.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-white/5">
                    <p>No new notifications</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {activeNotifications.map((notif) => (
                            <motion.div
                                key={notif.id}
                                layout
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-neutral-900 border border-red-500/50 p-4 rounded-xl flex items-center justify-between shadow-lg shadow-red-900/10"
                            >
                                <div>
                                    <p className="font-bold text-white text-xl">{notif.tableId}</p>
                                    <p className="text-red-400 text-sm uppercase font-bold tracking-wide">
                                        {notif.type === 'call_staff' ? 'Call Service' : 'Bill Request'}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1 font-mono">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                                </div>
                                <button
                                    onClick={() => resolveNotification(notif.id)}
                                    className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-lg transition-all shadow-md active:scale-95"
                                >
                                    <Check size={24} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
