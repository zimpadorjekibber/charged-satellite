'use client';

import Link from 'next/link';
import { ChefHat, List, BellRing, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useState, useEffect, useRef } from 'react';

export default function StaffShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const orders = useStore((state) => state.orders);
    const notifications = useStore((state) => state.notifications);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const prevOrdersLength = useRef(0);
    const prevNotifLength = useRef(0);

    // Initial sync
    useEffect(() => {
        prevOrdersLength.current = orders.filter(o => o.status === 'Pending').length;
        prevNotifLength.current = notifications.filter(n => n.status === 'pending').length;
    }, []);

    useEffect(() => {
        if (!soundEnabled) return;

        const pendingOrders = orders.filter(o => o.status === 'Pending').length;
        const pendingNotifs = notifications.filter(n => n.status === 'pending').length;

        if (pendingOrders > prevOrdersLength.current || pendingNotifs > prevNotifLength.current) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.error("Audio play failed", e));
        }

        prevOrdersLength.current = pendingOrders;
        prevNotifLength.current = pendingNotifs;
    }, [orders, notifications, soundEnabled]);

    const toggleSound = () => {
        if (!soundEnabled) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().then(() => {
                setSoundEnabled(true);
            }).catch(e => {
                console.error("Audio permission denied", e);
                alert("Please interact with the document first or check browser permissions.");
            });
        } else {
            setSoundEnabled(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 flex flex-col md:flex-row">
            {/* Sidebar for Desktop / Bottom bar for mobile */}
            <aside className="md:w-64 bg-neutral-950 border-r border-white/5 flex flex-col justify-between">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-tashi-accent mb-8">
                        <ChefHat size={32} />
                        <span className="font-bold font-serif text-xl">Staff Portal</span>
                    </div>

                    <nav className="space-y-2">
                        <NavLink href="/staff/dashboard" icon={<List size={20} />} active={pathname.includes('dashboard')}>
                            Orders Board
                        </NavLink>
                        <NavLink href="/staff/notifications" icon={<BellRing size={20} />} active={pathname.includes('notifications')}>
                            Notifications
                        </NavLink>
                    </nav>
                </div>

                <div className="p-6 space-y-4">
                    <button
                        onClick={toggleSound}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${soundEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                    >
                        <BellRing size={20} className={soundEnabled ? 'animate-pulse' : ''} />
                        <span className="font-bold text-sm">{soundEnabled ? 'Sound ON' : 'Sound OFF'}</span>
                    </button>

                    <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors px-4">
                        <LogOut size={20} />
                        <span>Exit</span>
                    </Link>
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-10 overflow-auto">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, icon, children, active }: any) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-tashi-primary text-white font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            {icon}
            <span>{children}</span>
        </Link>
    );
}
