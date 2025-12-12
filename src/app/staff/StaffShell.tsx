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

    // Layout removed to allow Dashboard to handle full UI.
    return (
        <div className="min-h-screen bg-black">
            {children}
        </div>
    );
}

function NavLink({ href, icon, children, active }: any) {
    // Deprecated
    return null;
}
