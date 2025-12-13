'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Info, Phone, MessageCircle, MapPin, X } from 'lucide-react';
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

    const [showInfo, setShowInfo] = useState(false);


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
        <div className="min-h-[100dvh] bg-tashi-darker pb-20">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-tashi-darker/95 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center justify-between" style={{ willChange: 'transform' }}>
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
                    {/* Info Button Removed */}

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

            {/* Contact Info Modal */}
            {showInfo && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowInfo(false)}>
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white font-serif">Contact Us</h3>
                                <p className="text-sm text-gray-400">We are here to help!</p>
                            </div>
                            <button onClick={() => setShowInfo(false)} className="bg-white/10 p-1 rounded-full text-white hover:bg-white/20"><X size={20} /></button>
                        </div>

                        <div className="space-y-3 pt-2">
                            <a href="tel:+919876543210" className="flex items-center gap-4 bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group">
                                <div className="bg-green-500/20 p-3 rounded-full text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-200">Call Us</p>
                                    <p className="text-xs text-gray-500">+91 98765 43210</p>
                                </div>
                            </a>

                            <a href="https://wa.me/919876543210" target="_blank" className="flex items-center gap-4 bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group">
                                <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-200">WhatsApp</p>
                                    <p className="text-xs text-gray-500">Chat with us</p>
                                </div>
                            </a>

                            <a href="https://maps.google.com/?q=TashiZom+Resort" target="_blank" className="flex items-center gap-4 bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group">
                                <div className="bg-blue-500/20 p-3 rounded-full text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-200">Get Directions</p>
                                    <p className="text-xs text-gray-500">Locate us on Maps</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Nav (Optional, mostly covered by header, but let's keep it simple) */}
        </div>
    );
}
