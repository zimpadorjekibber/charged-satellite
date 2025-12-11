'use client';

import { useStore, Order, OrderStatus } from '@/lib/store';
import { Bell, Check, Clock, Utensils, ChefHat, CheckCircle2, Lock, ArrowLeft, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function StaffDashboard() {
    const orders = useStore((state) => state.orders);
    const tables = useStore((state) => state.tables);
    const notifications = useStore((state) => state.notifications);
    const updateOrderStatus = useStore((state) => state.updateOrderStatus);
    const resolveNotification = useStore((state) => state.resolveNotification);

    // Auth
    const currentUser = useStore((state) => state.currentUser);
    const login = useStore((state) => state.login);
    const logout = useStore((state) => state.logout);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Sound & Visual Notification Logic
    const [prevPendingCount, setPrevPendingCount] = useState(0);
    const [showVisualAlert, setShowVisualAlert] = useState(false);

    // Filter unresolved notifications
    const activeNotifications = (notifications || []).filter((n) => n.status === 'pending');
    // Sort orders: Newest first
    // Sort orders: Newest first, exclude rejected/cancelled from active processing view
    const activeOrders = [...(orders || [])]
        .filter(o => o.status !== 'Rejected' && o.status !== 'Cancelled')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate Daily Stats
    const today = new Date().toDateString();
    const todaysOrders = (orders || []).filter(o => new Date(o.createdAt).toDateString() === today);
    const dailyRevenue = todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrdersCount = activeOrders.filter(o => o.status === 'Pending').length;

    const audioCtxRef = useRef<any>(null);

    const [audioReady, setAudioReady] = useState(false);

    // Initialize Audio Context on user interaction
    const initAudio = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                audioCtxRef.current = new AudioContext();
            }
        }
        if (audioCtxRef.current) {
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume().then(() => {
                    console.log("Audio Context Resumed");
                    setAudioReady(true);
                }).catch(console.error);
            } else if (audioCtxRef.current.state === 'running') {
                setAudioReady(true);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('click', initAudio);
        window.addEventListener('keydown', initAudio);
        return () => {
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
        };
    }, []);

    // Initialize Store (Real-time) - only once
    const initialize = useStore((state) => state.initialize);
    useEffect(() => {
        initialize();
    }, [initialize]);

    const playNotificationSound = () => {
        try {
            // Audio context setup...
            if (!audioCtxRef.current) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContext) audioCtxRef.current = new AudioContext();
            }

            const ctx = audioCtxRef.current;
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume();

            // Function to play a single loud siren blast
            const playBlast = (startTime: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sawtooth'; // Piercing sound
                osc.frequency.setValueAtTime(900, startTime); // Start High
                osc.frequency.linearRampToValueAtTime(500, startTime + 0.4); // Drop Low (Siren)

                // MAX VOLUME
                gain.gain.setValueAtTime(1.0, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.5);
            };

            // Loop 8 times for noisy kitchen
            const now = ctx.currentTime;
            for (let i = 0; i < 8; i++) {
                playBlast(now + (i * 0.6)); // Play every 600ms
            }

        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const isFirstMountOrders = useRef(true);
    // Monitor for new pending orders
    useEffect(() => {
        if (isFirstMountOrders.current) {
            isFirstMountOrders.current = false;
            setPrevPendingCount(pendingOrdersCount);
            return;
        }

        if (pendingOrdersCount > prevPendingCount) {
            playNotificationSound();
            setShowVisualAlert(true);
            setTimeout(() => setShowVisualAlert(false), 3000);
        }
        setPrevPendingCount(pendingOrdersCount);
    }, [pendingOrdersCount]);

    // Monitor for new notifications
    const [prevNotifCount, setPrevNotifCount] = useState(0);
    const activeNotifCount = activeNotifications.length;
    const isFirstMountNotifs = useRef(true);

    useEffect(() => {
        if (isFirstMountNotifs.current) {
            isFirstMountNotifs.current = false;
            setPrevNotifCount(activeNotifCount);
            return;
        }

        if (activeNotifCount > prevNotifCount) {
            playNotificationSound();
        }
        setPrevNotifCount(activeNotifCount);
    }, [activeNotifCount]);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        initAudio(); // Initialize audio on login click
        setError('');
        const success = await login(username, password);
        if (success) {
            // Logged in
        } else {
            setError('Invalid credentials');
        }
    };

    const handlePrintKOT = (order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <title>KOT #${order.id.slice(0, 4)}</title>
                    <style>
                        * { box-sizing: border-box; }
                        body { 
                            font-family: 'Courier New', monospace; 
                            margin: 0; 
                            padding: 15px; 
                            background: white; 
                            color: black;
                            min-height: 100vh;
                            display: flex;
                            flex-direction: column;
                        }
                        .container {
                            max-width: 100%;
                            margin: 0 auto;
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                        }
                        .header { 
                            text-align: center; 
                            border-bottom: 3px solid #000; 
                            padding-bottom: 15px; 
                            margin-bottom: 20px; 
                        }
                        .header h2 { margin: 0 0 5px 0; font-size: 24px; text-transform: uppercase; }
                        .header h3 { margin: 0; font-size: 42px; font-weight: 900; line-height: 1; }
                        
                        .meta { 
                            font-size: 16px; 
                            margin-bottom: 25px; 
                            padding-bottom: 15px;
                            border-bottom: 1px dashed #000;
                            line-height: 1.5;
                        }
                        .items {
                            flex: 1;
                        }
                        .item { 
                            display: flex; 
                            align-items: flex-start;
                            margin-bottom: 15px; 
                            font-size: 20px; 
                            font-weight: bold;
                            line-height: 1.3;
                        }
                        .qty { 
                            min-width: 45px;
                            margin-right: 10px; 
                            font-size: 24px;
                            display: inline-block;
                        }
                        
                        .actions {
                            margin-top: 30px;
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 15px;
                            padding-top: 20px;
                            border-top: 2px solid #eee;
                        }
                        
                        .btn {
                            padding: 20px;
                            font-size: 20px;
                            font-weight: bold;
                            border: none;
                            border-radius: 12px;
                            cursor: pointer;
                            text-transform: uppercase;
                            width: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                        }
                        
                        .print-btn {
                            background: #000;
                            color: #fff;
                            grid-column: span 2;
                        }
                        
                        .close-btn {
                            background: #e5e5e5;
                            color: #333;
                            grid-column: span 2;
                        }

                        @media print { 
                            .no-print { display: none !important; } 
                            body { padding: 0; }
                            .header h3 { font-size: 32px; }
                            .item { font-size: 16px; }
                            .qty { font-size: 18px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Kitchen Order</h2>
                            <h3>${order.tableId}</h3>
                        </div>
                        <div class="meta">
                            <strong>KOT #:</strong> ${order.id.slice(0, 6)}<br>
                            <strong>Time:</strong> ${new Date(order.createdAt).toLocaleTimeString()}<br>
                            <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
                            ${order.customerName ? `<strong>Guest:</strong> ${order.customerName}<br>` : ''}
                            ${order.customerPhone ? `<strong>Phone:</strong> ${order.customerPhone}` : ''}
                        </div>
                        <div class="items">
                            ${order.items.map(item => `
                                <div class="item">
                                    <span class="qty">${item.quantity}</span>
                                    <span>${item.name}</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="actions no-print">
                            <button class="btn print-btn" onclick="window.print()">
                                🖨️ PRINT KOT
                            </button>
                            <button class="btn close-btn" onclick="window.close()">
                                ✖ CLOSE
                            </button>
                        </div>
                    </div>
                </body>
            </html>
            `);
        printWindow.document.close();
    };

    const handlePrintBill = (order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const rawTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const finalTotal = rawTotal;

        printWindow.document.write(`
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <title>Bill #${order.id.slice(0, 4)}</title>
                    <style>
                        * { box-sizing: border-box; }
                        body { 
                            font-family: 'Courier New', monospace; 
                            margin: 0; 
                            padding: 15px; 
                            background: white; 
                            color: black;
                            min-height: 100vh;
                            display: flex;
                            flex-direction: column;
                        }
                        .container {
                            max-width: 100%;
                            margin: 0 auto;
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                        }
                        .header { 
                            text-align: center; 
                            border-bottom: 2px dashed #000; 
                            padding-bottom: 15px; 
                            margin-bottom: 20px; 
                        }
                        .store-name { font-size: 28px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px; }
                        .store-subtitle { font-size: 14px; margin-bottom: 10px; }
                        
                        .meta { 
                            font-size: 14px; 
                            margin-bottom: 20px; 
                            padding-bottom: 15px;
                            border-bottom: 1px solid #000;
                            line-height: 1.4;
                        }
                        
                        .items {
                            flex: 1;
                        }
                        .item { 
                            display: flex; 
                            justify-content: space-between;
                            margin-bottom: 10px; 
                            font-size: 16px; 
                            font-weight: bold;
                        }
                        .item-name { flex: 1; margin-right: 10px; }
                        
                        .totals {
                            margin-top: 20px;
                            border-top: 2px solid #000;
                            padding-top: 15px;
                        }
                        .row { display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 5px; }
                        .grand { font-size: 24px; font-weight: 900; margin-top: 10px; }
                        
                        .footer {
                            margin-top: 30px;
                            text-align: center;
                            font-size: 14px;
                            margin-bottom: 20px;
                        }

                        .actions {
                            margin-top: auto;
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 15px;
                            padding-top: 20px;
                            border-top: 2px solid #eee;
                        }
                        
                        .btn {
                            padding: 15px;
                            font-size: 18px;
                            font-weight: bold;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            text-transform: uppercase;
                            width: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 5px;
                        }
                        
                        .print-btn { background: #000; color: #fff; grid-column: span 2; }
                        .close-btn { background: #e5e5e5; color: #333; grid-column: span 2; }

                        @media print { 
                            .no-print { display: none !important; } 
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="store-name">TashiZom</div>
                            <div class="store-subtitle">Multi-Cuisine Restaurant</div>
                        </div>
                        <div class="meta">
                            <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
                            <strong>Order #:</strong> ${order.id.slice(0, 8)}<br>
                            <strong>Table:</strong> ${order.tableId}<br>
                            ${order.customerName ? `<strong>Guest:</strong> ${order.customerName}<br>` : ''}
                            ${order.customerPhone ? `<strong>Phone:</strong> ${order.customerPhone}` : ''}
                        </div>
                        <div class="items">
                            ${order.items.map(item => `
                                <div class="item">
                                    <span class="item-name">${item.quantity} x ${item.name}</span>
                                    <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="totals">
                            <div class="row grand"><span>TOTAL</span><span>₹${finalTotal.toFixed(2)}</span></div>
                        </div>
                        <div class="footer">
                            Thank you for visiting!<br>Please come again.
                        </div>
                        
                        <div class="actions no-print">
                            <button class="btn print-btn" onclick="window.print()">
                                🧾 PRINT BILL
                            </button>
                            <button class="btn close-btn" onclick="window.close()">
                                ✖ CLOSE
                            </button>
                        </div>
                    </div>
                </body>
            </html>
            `);
        printWindow.document.close();
    };

    const handleShareBill = async (order: Order) => {
        const rawTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

        const text = `🧾 *TashiZom Bill*\n\n` +
            `Order #: ${order.id.slice(0, 4)}\n` +
            `Table: ${order.tableId}\n` +
            `Date: ${new Date().toLocaleDateString()}\n\n` +
            `*Items:*\n` +
            order.items.map(i => `${i.quantity} x ${i.name} - ₹${i.price * i.quantity}`).join('\n') +
            `\n\n----------------\n` +
            `*TOTAL: ₹${rawTotal.toFixed(2)}*\n\n` +
            `Thank you for visiting!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'TashiZom Bill',
                    text: text,
                });
            } catch (err) {
                console.log('Error sharing:', err);
                // Fallback to clipboard or whatsapp
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    if (!currentUser || (currentUser.role !== 'staff' && currentUser.role !== 'admin')) {
        return (
            <div className="min-h-screen bg-tashi-darker flex flex-col items-center justify-center p-6">
                <Link href="/" className="absolute top-8 left-8 text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowLeft size={20} /> Back
                </Link>
                <div className="w-full max-w-md bg-white/5 border border-white/5 p-8 rounded-2xl backdrop-blur-xl">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-blue-500/20 rounded-full text-blue-400">
                            <ChefHat size={32} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white text-center mb-2">Staff Portal</h1>
                    <p className="text-gray-400 text-center mb-8 text-sm">Kitchen & Service Access</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Staff ID</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="e.g. tenzin"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            onClick={async () => {
                                const s = await useStore.getState().login(username, password);
                                if (s) window.location.reload();
                                else setError("Manual Login Failed");
                            }}
                            className="w-full bg-gray-700 text-white text-xs py-2 rounded mt-2"
                        >
                            Force Login (Debug)
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-gray-500">Authorized Personnel Only</p>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="space-y-8 max-w-[1600px] mx-auto relative px-6 py-6 text-white min-h-screen">
            <AnimatePresence>
                {!audioReady && currentUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center"
                        onClick={initAudio}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="bg-tashi-accent text-tashi-dark p-6 rounded-full mb-6 cursor-pointer shadow-[0_0_50px_rgba(255,255,255,0.3)]"
                        >
                            <Bell size={64} />
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Tap Anywhere to Start</h2>
                        <p className="text-xl text-gray-400 max-w-md">
                            Kitchen Sound System needs activation.
                            <br />
                            <span className="text-tashi-accent text-sm font-bold mt-2 block">(Browser Security Requirement)</span>
                        </p>
                    </motion.div>
                )}
                {showVisualAlert && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-tashi-accent/20 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1.2 }}
                            exit={{ scale: 0.5 }}
                            transition={{ type: 'spring', damping: 10 }}
                            className="bg-tashi-accent text-tashi-dark font-black text-6xl md:text-8xl px-12 py-8 rounded-3xl shadow-2xl border-4 border-white transform rotate-[-5deg]"
                        >
                            NEW ORDER!
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/5 mx-1 gap-4 md:gap-0">
                <h1 className="text-2xl font-bold text-white font-serif flex items-center gap-3">
                    <div className="p-2 bg-tashi-accent/20 rounded-lg text-tashi-accent">
                        <ChefHat size={24} />
                    </div>
                    Kitchen Display System
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-tashi-accent bg-tashi-accent/10 text-tashi-accent select-none cursor-default">
                        <Bell size={16} className="animate-pulse" />
                        <span>Sound ACTIVE</span>
                    </div>

                    <div className="flex gap-4 text-sm font-mono bg-black/20 px-4 py-2 rounded-lg border border-white/5">
                        <span className="text-gray-400">
                            Today's Orders: <strong className="text-white">{todaysOrders.length}</strong>
                        </span>
                        <div className="w-px h-4 bg-white/10" />
                        <span className="text-gray-400">
                            Sales: <strong className="text-tashi-accent">₹{dailyRevenue.toLocaleString()}</strong>
                        </span>
                    </div>

                    <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-white hidden sm:inline">{currentUser?.name}</span>
                            {currentUser?.serialNumber && (
                                <span className="text-[10px] bg-white/10 px-1.5 rounded text-tashi-accent font-mono">{currentUser.serialNumber}</span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 bg-white/5 hover:bg-red-900/40 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {activeNotifications.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                        <h2 className="text-red-400 font-bold flex items-center gap-2 mb-4 text-lg">
                            <Bell className="animate-bounce" /> Attention Required ({activeNotifications.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {activeNotifications.map((notif) => (
                                <motion.div
                                    key={notif.id}
                                    layout
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-neutral-900 border border-red-500/50 p-4 rounded-xl flex items-center justify-between shadow-lg shadow-red-900/10 group"
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[calc(100vh-280px)] lg:overflow-hidden pb-32 lg:pb-0">
                <StatusColumn
                    title="Pending"
                    icon={<Clock size={20} />}
                    color="text-yellow-400"
                    bgColor="bg-yellow-400/5"
                    borderColor="border-yellow-400/20"
                    orders={activeOrders.filter(o => o.status === 'Pending')}
                    onUpdateStatus={updateOrderStatus}
                    handlePrintKOT={handlePrintKOT}
                    handlePrintBill={handlePrintBill}
                    handleShareBill={handleShareBill}
                />
                <StatusColumn
                    title="Cooking"
                    icon={<Utensils size={20} />}
                    color="text-blue-400"
                    bgColor="bg-blue-400/5"
                    borderColor="border-blue-400/20"
                    orders={activeOrders.filter(o => o.status === 'Preparing')}
                    onUpdateStatus={updateOrderStatus}
                    handlePrintKOT={handlePrintKOT}
                    handlePrintBill={handlePrintBill}
                    handleShareBill={handleShareBill}
                />
                <StatusColumn
                    title="Ready to Serve"
                    icon={<CheckCircle2 size={20} />}
                    color="text-green-400"
                    bgColor="bg-green-400/5"
                    borderColor="border-green-400/20"
                    orders={activeOrders.filter(o => o.status === 'Served')}
                    onUpdateStatus={updateOrderStatus}
                    handlePrintKOT={handlePrintKOT}
                    handlePrintBill={handlePrintBill}
                    handleShareBill={handleShareBill}
                />
            </div>
        </div>
    );
}

function StatusColumn({ title, icon, color, bgColor, borderColor, orders, onUpdateStatus, handlePrintKOT, handlePrintBill, handleShareBill, handleShareKOT }: any) {
    return (
        <div className={`glass-card rounded-2xl flex flex-col h-full border ${borderColor} ${bgColor}`}>
            <div className={`flex items-center gap-3 p-4 border-b ${borderColor} ${color}`}>
                {icon}
                <h3 className="font-bold text-lg tracking-wide uppercase">{title}</h3>
                <span className="ml-auto bg-white/10 px-3 py-1 rounded-full text-sm font-mono text-white">
                    {orders.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-32">
                <AnimatePresence mode="popLayout">
                    {orders.map((order: Order) => (
                        <StaffOrderCard
                            key={order.id}
                            order={order}
                            onUpdateStatus={(s) => onUpdateStatus(order.id, s)}
                            onPrintKOT={() => handlePrintKOT(order)}
                            onPrintBill={() => handlePrintBill(order)}
                            onShareBill={() => handleShareBill(order)}
                            onShareKOT={() => handleShareKOT(order)}
                        />
                    ))}
                </AnimatePresence>

                {orders.length === 0 && (
                    <div className="text-center py-10 opacity-30">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            {icon}
                        </div>
                        <p className="font-mono text-sm">No orders</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function StaffOrderCard({ order, onUpdateStatus, onPrintKOT, onPrintBill, onShareBill, onShareKOT }: { order: Order; onUpdateStatus: (s: OrderStatus) => void, onPrintKOT: () => void, onPrintBill: () => void, onShareBill: () => void, onShareKOT: () => void }) {
    const tables = useStore((state) => state.tables);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-neutral-800 p-4 rounded-xl border-l-4 border-l-tashi-accent shadow-lg relative group flex flex-col max-h-[85vh]"
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-white text-xl flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        {tables.find(t => t.id === order.tableId)?.name || order.tableId}
                        {(order.customerName || order.customerPhone) && (
                            <span className="text-sm font-normal text-gray-400">
                                ({order.customerName} {order.customerPhone && (
                                    <>
                                        • <a
                                            href={`tel:${order.customerPhone}`}
                                            className="hover:text-tashi-accent hover:underline transition-colors cursor-pointer"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Call Customer"
                                        >
                                            {order.customerPhone}
                                        </a>
                                    </>
                                )})
                            </span>
                        )}
                    </h4>
                    <p className="text-xs text-gray-500 font-mono mt-1">#{order.id.slice(0, 4)} • {new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-tashi-accent font-bold text-lg">₹{order.totalAmount}</p>
                </div>
            </div>

            <div className="space-y-2 my-2 border-t border-b border-white/5 py-2 bg-black/20 rounded-xl px-4 max-h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-300 items-center">
                        <span className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-5 h-5 bg-white/10 rounded text-xs font-bold text-white flex-shrink-0">{item.quantity}</span>
                            <span className="text-sm">{item.name}</span>
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-2 relative z-10 shrink-0 mt-auto pt-1">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onPrintKOT}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-2 rounded font-bold font-mono shadow-lg shadow-orange-900/20 active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                        🖨️ KOT
                    </button>
                    <button
                        onClick={onShareKOT}
                        className="bg-orange-500/80 hover:bg-orange-600/80 text-white text-xs px-2 py-2 rounded font-bold font-mono shadow-lg shadow-orange-900/20 active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                        📱 Share KOT
                    </button>

                    <button
                        onClick={onPrintBill}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-2 rounded font-bold font-mono shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                        🧾 Bill
                    </button>
                    <button
                        onClick={onShareBill}
                        className="bg-purple-600/80 hover:bg-purple-700/80 text-white text-xs px-2 py-2 rounded font-bold font-mono shadow-lg shadow-green-900/20 active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                        📱 Share Bill
                    </button>
                </div>

                <div className="flex gap-2">
                    {order.status === 'Pending' && (
                        <div className="flex gap-2 flex-1">
                            <button
                                onClick={() => onUpdateStatus('Rejected')}
                                className="flex-1 bg-red-900/40 hover:bg-red-900/60 border border-red-900 text-red-400 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all active:scale-95"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => onUpdateStatus('Preparing')}
                                className="flex-[2] bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-green-900/20"
                            >
                                Accept Order
                            </button>
                        </div>
                    )}
                    {order.status === 'Preparing' && (
                        <button onClick={() => onUpdateStatus('Served')} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-green-900/20">
                            Mark Ready
                        </button>
                    )}
                    {order.status === 'Served' && (
                        <button onClick={() => onUpdateStatus('Paid')} className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-gray-300 hover:text-white py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all active:scale-95">
                            Close Order
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
