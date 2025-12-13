'use client';

import { useStore, Order, OrderStatus } from '@/lib/store';
import { Bell, Check, Clock, Utensils, ChefHat, User, ArrowLeft, LogOut, Menu as MenuIcon, X, Phone, TrendingUp, TrendingDown, Package, CheckCircle2, Volume2, VolumeX, Printer, Share2, Receipt, FileText, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function StaffDashboard() {
    const orders = useStore((state: any) => state.orders);
    const updateOrderStatus = useStore((state: any) => state.updateOrderStatus);
    const deleteOrder = useStore((state: any) => state.deleteOrder);
    const notifications = useStore((state: any) => state.notifications);
    const resolveNotification = useStore((state: any) => state.resolveNotification);

    // Auth
    const currentUser = useStore((state: any) => state.currentUser);
    const login = useStore((state: any) => state.login);
    const logout = useStore((state: any) => state.logout);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // State
    const [activeFilter, setActiveFilter] = useState<'new' | 'preparing' | 'ready'>('new');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());

    // Sound notification
    const [prevPendingCount, setPrevPendingCount] = useState(0);
    const [prevNotificationCount, setPrevNotificationCount] = useState(0);
    const [showVisualAlert, setShowVisualAlert] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [isRinging, setIsRinging] = useState(false);
    const audioCtxRef = useRef<any>(null);
    const isFirstMount = useRef(true);

    // Derived data
    const activeOrders = [...(orders || [])].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const today = new Date().toDateString();
    const todaysOrders = (orders || []).filter((o: any) => new Date(o.createdAt).toDateString() === today);

    // Stats
    const newOrders = activeOrders.filter((o: any) => o.status === 'Pending');
    const preparingOrders = activeOrders.filter((o: any) => o.status === 'Preparing');
    const readyOrders = activeOrders.filter((o: any) => o.status === 'Ready' || o.status === 'Served');

    // Active Service Requests
    const activeNotifications = (notifications || []).filter((n: any) => n.status === 'pending');

    // Filter orders based on active tab
    const filteredOrders = activeOrders.filter((o: any) => {
        if (activeFilter === 'new') return o.status === 'Pending';
        if (activeFilter === 'preparing') return o.status === 'Preparing';
        if (activeFilter === 'ready') return o.status === 'Ready' || o.status === 'Served';
        return false;
    });

    // Calculate average preparation time
    const avgPrepTime = preparingOrders.length > 0
        ? Math.round(preparingOrders.reduce((sum: number, order: any) => {
            const elapsed = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
            return sum + elapsed;
        }, 0) / preparingOrders.length)
        : 14;

    // Calculate trend
    const activeTrend = newOrders.length > 5 ? '+20%' : newOrders.length < 3 ? '-5%' : '+10%';
    const timeTrend = avgPrepTime > 15 ? '+5%' : avgPrepTime < 12 ? '-5%' : '-2%';

    // Sound notification
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

    const playNotificationSound = () => {
        if (!isSoundEnabled) return;

        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
        }

        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3');
            audio.volume = 1.0;
            currentAudioRef.current = audio;
            setIsRinging(true);

            audio.addEventListener('ended', () => {
                setIsRinging(false);
            });

            audio.play().catch(e => {
                console.error("Audio play failed", e);
                setIsRinging(false);
            });
        } catch (e) {
            console.error("Audio setup failed", e);
            setIsRinging(false);
        }
    };

    const stopNotificationSound = () => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
            currentAudioRef.current = null;
        }
        setIsRinging(false);
    };

    const toggleSound = () => {
        const newState = !isSoundEnabled;
        setIsSoundEnabled(newState);
        if (newState) {
            playNotificationSound();
        } else {
            stopNotificationSound();
        }
    };

    // Monitor for new pending orders AND notifications
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            setPrevPendingCount(newOrders.length);
            setPrevNotificationCount(activeNotifications.length);
            return;
        }

        if (newOrders.length > prevPendingCount) {
            playNotificationSound();
            setShowVisualAlert(true);
            setTimeout(() => setShowVisualAlert(false), 3000);
        }

        if (activeNotifications.length > prevNotificationCount) {
            playNotificationSound();
        }

        if (activeNotifications.length < prevNotificationCount) {
            stopNotificationSound();
        }

        setPrevPendingCount(newOrders.length);
        setPrevNotificationCount(activeNotifications.length);
    }, [newOrders.length, activeNotifications.length]);

    // Toggle order expansion
    const toggleOrderExpansion = (orderId: string) => {
        setExpandedOrderIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = await login(username, password);
        if (!success) {
            setError('Invalid credentials');
        }
    };

    // Login Screen
    if (!currentUser || (currentUser.role !== 'staff' && currentUser.role !== 'admin')) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <Link href="/" className="absolute top-8 left-8 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2">
                    <ArrowLeft size={20} /> Back
                </Link>
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-orange-100 rounded-full text-orange-600">
                            <ChefHat size={32} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Staff Portal</h1>
                    <p className="text-gray-500 text-center mb-8 text-sm">Kitchen Dashboard Access</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Staff ID</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                placeholder="e.g. tenzin"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-orange-200"
                        >
                            Login
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400">Authorized Personnel Only</p>
                    </div>
                </div>
            </div>
        );
    }

    // Main Dashboard
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Visual Alert */}
            <AnimatePresence>
                {showVisualAlert && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-orange-500/10 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1.2 }}
                            exit={{ scale: 0.5 }}
                            transition={{ type: 'spring', damping: 10 }}
                            className="bg-orange-500 text-white font-black text-6xl md:text-8xl px-12 py-8 rounded-3xl shadow-2xl"
                        >
                            NEW ORDER!
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-bold text-gray-900">Kitchen Dashboard</h1>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <User size={20} className="text-orange-600" />
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
                                    <p className="text-xs text-gray-500">Staff Portal</p>
                                </div>
                            </div>
                            {isRinging && (
                                <button
                                    onClick={stopNotificationSound}
                                    className="flex p-3 bg-red-600 text-white border-2 border-white rounded-lg text-sm font-bold items-center gap-2 transition-all hover:bg-red-700 animate-pulse shadow-lg"
                                    title="Stop Ringing"
                                >
                                    <Bell className="animate-bounce" size={18} /> Stop Ring
                                </button>
                            )}
                            <button
                                onClick={toggleSound}
                                className={`hidden md:flex p-2 border rounded-lg text-xs items-center gap-2 transition-colors ${isSoundEnabled
                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                    }`}
                                title={isSoundEnabled ? "Sound Enabled" : "Sound Muted"}
                            >
                                {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                {isSoundEnabled ? 'Sound ON' : 'Sound OFF'}
                            </button>
                            <button
                                onClick={logout}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Service Request Alerts */}
                <AnimatePresence>
                    {activeNotifications.length > 0 && (
                        <div className="mb-6 space-y-2">
                            {activeNotifications.map((notification: any) => {
                                const table = useStore.getState().tables.find((t: any) => t.id === notification.tableId);
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
                        </div>
                    )}
                </AnimatePresence>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                            <Package size={18} className="text-orange-500" />
                            <span className="uppercase font-semibold">Active</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <h3 className="text-4xl font-bold text-gray-900">{newOrders.length}</h3>
                            <div className={`flex items-center gap-1 text-sm font-semibold ${activeTrend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {activeTrend.startsWith('+') ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                <span>{activeTrend}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                            <Clock size={18} className="text-blue-500" />
                            <span className="uppercase font-semibold">Avg Time</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <h3 className="text-4xl font-bold text-gray-900">{avgPrepTime}m</h3>
                            <div className={`flex items-center gap-1 text-sm font-semibold ${timeTrend.startsWith('-') ? 'text-green-600' : 'text-red-600'}`}>
                                {timeTrend.startsWith('-') ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                                <span>{timeTrend}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                    <button
                        onClick={() => setActiveFilter('new')}
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeFilter === 'new'
                            ? 'bg-orange-50 text-orange-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        New <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeFilter === 'new' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {newOrders.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveFilter('preparing')}
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeFilter === 'preparing'
                            ? 'bg-gray-100 text-gray-800 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Preparing <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeFilter === 'preparing' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {preparingOrders.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveFilter('ready')}
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeFilter === 'ready'
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Ready <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeFilter === 'ready' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {readyOrders.length}
                        </span>
                    </button>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                            <ChefHat size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 font-medium">No orders in this category</p>
                            <p className="text-gray-400 text-sm mt-1">Orders will appear here when placed</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={(status) => updateOrderStatus(order.id, status)}
                                onDelete={() => deleteOrder(order.id)}
                                isNew={activeFilter === 'new'}
                                isPreparing={activeFilter === 'preparing'}
                                isReady={activeFilter === 'ready'}
                                isExpanded={expandedOrderIds.has(order.id)}
                                onToggleExpand={() => toggleOrderExpansion(order.id)}
                            />
                        ))
                    )}
                </div>
            </main>
        </div >
    );
}

// Helper Functions for KOT and Bill
const handlePrintKOT = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tables = useStore.getState().tables;
    const matchedTable = tables.find((t: any) => t.id === order.tableId || t.name === order.tableId);
    const tableName = matchedTable ? matchedTable.name : 'Remote Order';

    printWindow.document.write(`
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>KOT #${order.id.slice(0, 6)}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: 'Courier New', monospace; 
                    padding: 20px; 
                    background: white; 
                    color: black;
                    font-size: 16px;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 3px solid #000; 
                    padding-bottom: 15px; 
                    margin-bottom: 20px; 
                }
                .header h2 { font-size: 24px; margin-bottom: 5px; }
                .header h3 { font-size: 42px; font-weight: 900; }
                .meta { 
                    font-size: 18px; 
                    margin-bottom: 25px; 
                    padding-bottom: 15px;
                    border-bottom: 2px dashed #000;
                    line-height: 1.8;
                }
                .meta div { margin: 5px 0; }
                .meta strong { font-weight: 900; }
                .items { margin: 20px 0; }
                .item { 
                    display: flex; 
                    justify-content: space-between; 
                    padding: 12px 0; 
                    border-bottom: 1px solid #ddd;
                    font-size: 18px;
                }
                .item strong { font-size: 24px; font-weight: 900; }
                .footer { 
                    margin-top: 30px; 
                    padding-top: 20px; 
                    border-top: 3px solid #000; 
                    text-align: center; 
                    font-size: 14px;
                }
                @media print {
                    body { padding: 10px; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>KITCHEN ORDER TICKET</h2>
                <h3>KOT #${order.id.slice(0, 6)}</h3>
            </div>
            
            <div class="meta">
                <div><strong>TABLE:</strong> ${tableName}</div>
                ${order.customerName ? `<div><strong>CUSTOMER:</strong> ${order.customerName}</div>` : ''}
                ${order.customerPhone ? `<div><strong>PHONE:</strong> ${order.customerPhone}</div>` : ''}
                <div><strong>TIME:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
                <div><strong>STATUS:</strong> ${order.status}</div>
            </div>
            
            <div class="items">
                <h3 style="margin-bottom: 15px; font-size: 20px;">ITEMS:</h3>
                ${order.items.map((item: any) => `
                    <div class="item">
                        <span><strong>${item.quantity}x</strong> ${item.name}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="footer">
                <p>Total Items: ${order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)}</p>
                <p style="margin-top: 10px;">Printed: ${new Date().toLocaleTimeString()}</p>
            </div>
            
            <script>
                window.onload = function() { 
                    window.print(); 
                    setTimeout(() => window.close(), 500);
                }
            </script>
        </body>
    </html>
    `);
    printWindow.document.close();
};

const handlePrintBill = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tables = useStore.getState().tables;
    const matchedTable = tables.find((t: any) => t.id === order.tableId || t.name === order.tableId);
    const tableName = matchedTable ? matchedTable.name : 'Remote Order';

    printWindow.document.write(`
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bill #${order.id.slice(0, 6)}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: 'Arial', sans-serif; 
                    padding: 20px; 
                    max-width: 400px;
                    margin: 0 auto;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #000;
                }
                .header h1 { font-size: 28px; margin-bottom: 5px; }
                .header p { font-size: 14px; color: #666; }
                .bill-info { margin: 20px 0; font-size: 14px; }
                .bill-info div { margin: 5px 0; display: flex; justify-content: space-between; }
                .items { margin: 20px 0; }
                .items table { width: 100%; border-collapse: collapse; }
                .items th { 
                    background: #f0f0f0; 
                    padding: 10px; 
                    text-align: left; 
                    font-size: 12px;
                    border-bottom: 2px solid #000;
                }
                .items td { 
                    padding: 8px; 
                    border-bottom: 1px solid #ddd;
                    font-size: 14px;
                }
                .total-section { 
                    margin-top: 20px; 
                    padding-top: 15px; 
                    border-top: 2px solid #000;
                }
                .total-row { 
                    display: flex; 
                    justify-content: space-between; 
                    padding: 8px 0;
                    font-size: 16px;
                }
                .total-row.grand { 
                    font-size: 20px; 
                    font-weight: bold; 
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 2px dashed #000;
                }
                .footer { 
                    text-align: center; 
                    margin-top: 30px; 
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>TashiZom</h1>
                <p>Kibber, Spiti Valley</p>
                <p style="margin-top: 10px; font-weight: bold;">BILL #${order.id.slice(0, 6)}</p>
            </div>
            
            <div class="bill-info">
                <div><strong>Table:</strong> <span>${tableName}</span></div>
                ${order.customerName ? `<div><strong>Customer:</strong> <span>${order.customerName}</span></div>` : ''}
                ${order.customerPhone ? `<div><strong>Phone:</strong> <span>${order.customerPhone}</span></div>` : ''}
                <div><strong>Date:</strong> <span>${new Date(order.createdAt).toLocaleDateString()}</span></div>
                <div><strong>Time:</strong> <span>${new Date(order.createdAt).toLocaleTimeString()}</span></div>
            </div>
            
            <div class="items">
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map((item: any) => `
                            <tr>
                                <td>${item.name}</td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: right;">₹${item.price}</td>
                                <td style="text-align: right;">₹${item.price * item.quantity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>₹${order.totalAmount}</span>
                </div>
                <div class="total-row grand">
                    <span>TOTAL:</span>
                    <span>₹${order.totalAmount}</span>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for dining with us!</p>
                <p style="margin-top: 5px;">Visit us again soon</p>
                <p style="margin-top: 15px; font-size: 10px;">Printed: ${new Date().toLocaleString()}</p>
            </div>
            
            <script>
                window.onload = function() { 
                    window.print(); 
                    setTimeout(() => window.close(), 500);
                }
            </script>
        </body>
    </html>
    `);
    printWindow.document.close();
};

const handleShareKOT = async (order: Order) => {
    const tables = useStore.getState().tables;
    const matchedTable = tables.find((t: any) => t.id === order.tableId || t.name === order.tableId);
    const tableName = matchedTable ? matchedTable.name : 'Remote Order';

    const kotText = `🍴 KITCHEN ORDER TICKET (KOT)
KOT #${order.id.slice(0, 6)}

📍 TABLE: ${tableName}
${order.customerName ? `👤 CUSTOMER: ${order.customerName}\n` : ''}⏰ TIME: ${new Date(order.createdAt).toLocaleTimeString()}

📋 ITEMS:
${order.items.map((item: any) => `${item.quantity}x ${item.name}`).join('\n')}

Total Items: ${order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)}`.trim();

    if (navigator.share) {
        try {
            await navigator.share({
                title: `KOT #${order.id.slice(0, 6)}`,
                text: kotText
            });
        } catch (err) {
            console.error('Share failed:', err);
            navigator.clipboard.writeText(kotText);
            alert('KOT copied to clipboard!');
        }
    } else {
        navigator.clipboard.writeText(kotText);
        alert('KOT copied to clipboard!');
    }
};

const handleShareBill = async (order: Order) => {
    const tables = useStore.getState().tables;
    const matchedTable = tables.find((t: any) => t.id === order.tableId || t.name === order.tableId);
    const tableName = matchedTable ? matchedTable.name : 'Remote Order';

    const billText = `🧾 BILL - TashiZom
Bill #${order.id.slice(0, 6)}

📍 Table: ${tableName}
${order.customerName ? `👤 Customer: ${order.customerName}\n` : ''}📅 Date: ${new Date(order.createdAt).toLocaleDateString()}
⏰ Time: ${new Date(order.createdAt).toLocaleTimeString()}

ITEMS:
${order.items.map((item: any) => `${item.quantity}x ${item.name} - ₹${item.price * item.quantity}`).join('\n')}

-------------------
TOTAL: ₹${order.totalAmount}
-------------------

Thank you for dining with us! 🙏`.trim();

    if (navigator.share) {
        try {
            await navigator.share({
                title: `Bill #${order.id.slice(0, 6)}`,
                text: billText
            });
        } catch (err) {
            console.error('Share failed:', err);
            navigator.clipboard.writeText(billText);
            alert('Bill copied to clipboard!');
        }
    } else {
        navigator.clipboard.writeText(billText);
        alert('Bill copied to clipboard!');
    }
};

// Order Card Component with Collapsible View
function OrderCard({ order, onUpdateStatus, onDelete, isNew, isPreparing, isReady, isExpanded, onToggleExpand }: {
    order: Order;
    onUpdateStatus: (status: OrderStatus) => void;
    onDelete?: () => void;
    isNew: boolean;
    isPreparing: boolean;
    isReady: boolean;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
}) {
    const tables = useStore((state: any) => state.tables);

    const getElapsedTime = () => {
        const now = Date.now();
        const created = new Date(order.createdAt).getTime();
        const diff = now - created;
        const minutes = Math.floor(diff / 60000);
        return minutes;
    };

    const matchedTable = tables.find((t: any) => t.id === order.tableId || t.name === order.tableId);
    const isTableOrder = !!matchedTable;
    const isRemoteOrder = !isTableOrder || order.tableId === 'Remote' || order.tableId === 'REQUEST';

    const elapsed = getElapsedTime();
    const borderColor = isNew ? 'border-l-red-500' : isPreparing ? 'border-l-orange-500' : 'border-l-blue-500';
    const totalItems = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl shadow-sm border-l-4 ${borderColor} border-y border-r border-gray-100 overflow-hidden`}
        >
            {/* Clickable Header */}
            <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={onToggleExpand}
            >
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                #{order.id.slice(0, 6)}
                            </span>

                            {isTableOrder && matchedTable && (
                                <span className="text-sm font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-300">
                                    📍 {matchedTable.name}
                                </span>
                            )}

                            {isRemoteOrder && (
                                <span className="text-sm font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-300">
                                    🚚 Remote
                                </span>
                            )}

                            <span className="text-sm text-gray-600">
                                {totalItems} item{totalItems !== 1 ? 's' : ''}
                            </span>

                            <span className={`text-sm font-semibold ${elapsed > 12 ? 'text-red-600' : 'text-gray-500'}`}>
                                {elapsed}min
                            </span>

                            <span className="ml-auto text-gray-400">
                                {isExpanded ? '▼' : '▶'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100"
                    >
                        <div className="p-6">
                            {(order.customerName || order.customerPhone) && (
                                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                    {order.customerName && (
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <span className="text-purple-600 font-semibold">👤 Customer:</span>
                                            <span className="font-bold text-gray-900">{order.customerName}</span>
                                        </div>
                                    )}
                                    {order.customerPhone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-purple-600 font-semibold">📞 Phone:</span>
                                            <a
                                                href={`tel:${order.customerPhone}`}
                                                className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                {order.customerPhone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 p-4 bg-gray-50 rounded-xl">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="flex items-center justify-center w-7 h-7 bg-orange-500 text-white rounded text-sm font-bold">
                                            {item.quantity}x
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* KOT and Bill Buttons */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handlePrintKOT(order); }}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
                                >
                                    <Printer size={16} /> Print KOT
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleShareKOT(order); }}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
                                >
                                    <Share2 size={16} /> Share KOT
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handlePrintBill(order); }}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold text-sm transition-colors"
                                >
                                    <Receipt size={16} /> Print Bill
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleShareBill(order); }}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lng font-semibold text-sm transition-colors"
                                >
                                    <Share2 size={16} /> Share Bill
                                </button>
                            </div>

                            {/* Status Actions */}
                            <div className="flex gap-2">
                                {isNew && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onUpdateStatus('Preparing'); }}
                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-orange-200 active:scale-95"
                                    >
                                        <Utensils size={18} className="inline mr-2" />
                                        Start Preparation
                                    </button>
                                )}
                                {isPreparing && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onUpdateStatus('Ready'); }}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-200 active:scale-95"
                                    >
                                        <CheckCircle2 size={18} className="inline mr-2" />
                                        Mark Ready
                                    </button>
                                )}
                                {isReady && onDelete && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-200 active:scale-95"
                                    >
                                        <Trash2 size={18} className="inline mr-2" />
                                        Delete Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
