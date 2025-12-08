'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Bell, ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState } from 'react';

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const cart = useStore((state) => state.cart);
    const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Store hooks
    const currentTableId = useStore((state) => state.currentTableId);
    const notifications = useStore((state) => state.notifications);
    const addNotification = useStore((state) => state.addNotification);

    // Check Global Pending State
    const hasPendingCall = notifications.some(n => n.tableId === currentTableId && n.type === 'call_staff' && n.status === 'pending');

    const handleCallStaff = () => {
        if (!currentTableId) {
            alert('Please scan a QR code table first.');
            return;
        }
        if (hasPendingCall) return; // Prevent duplicate calls
        addNotification(currentTableId, 'call_staff');
    };

    const isMenu = pathname === '/customer/menu';

    return (
        <div className="min-h-screen bg-tashi-darker pb-20">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {!isMenu && (
                        <Link href="/customer/menu" className="text-gray-300 hover:text-white">
                            <ArrowLeft size={24} />
                        </Link>
                    )}
                    <div>
                        <h1 className="text-lg font-bold text-tashi-accent font-serif tracking-wide leading-none">
                            TashiZom
                        </h1>
                        {currentTableId && (
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                {useStore.getState().tables.find(t => t.id === currentTableId)?.name || currentTableId}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCallStaff}
                        disabled={hasPendingCall}
                        className={`p-2 rounded-full transition-all border ${hasPendingCall ? 'bg-yellow-500 text-black border-yellow-500 animate-pulse' : 'bg-white/10 text-tashi-accent hover:bg-white/20 border-white/5'}`}
                    >
                        <Bell size={20} className={hasPendingCall ? 'fill-current' : ''} />
                    </button>

                    <Link href="/customer/cart" className="relative p-2 rounded-full bg-tashi-primary text-white hover:bg-tashi-primary-light transition-colors">
                        <ShoppingCart size={20} />
                        {itemsCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-white text-tashi-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-tashi-darker">
                                {itemsCount}
                            </span>
                        )}
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 px-4">
                {children}
            </main>

            {/* Mobile Bottom Nav (Optional, mostly covered by header, but let's keep it simple) */}
        </div>
    );
}
