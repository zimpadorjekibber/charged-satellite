'use client';

import { useStore, OrderStatus, Order, Notification, User as StoreUser } from '@/lib/store';
import {
    ChefHat, User, ArrowLeft, LogOut, X, TrendingUp, TrendingDown, Package, Volume2, VolumeX, Settings, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Modular Components
import StaffOrderCard from '../components/StaffOrderCard';
import StaffServiceAlerts from '../components/StaffServiceAlerts';
import StaffDashboardHeader from '../components/StaffDashboardHeader';

export default function StaffDashboard() {
    const orders = useStore((state) => state.orders);
    const updateOrderStatus = useStore((state) => state.updateOrderStatus);
    const deleteOrder = useStore((state) => state.deleteOrder);
    const notifications = useStore((state) => state.notifications);
    const resolveNotification = useStore((state) => state.resolveNotification);
    const confirmPayment = useStore((state) => state.confirmPayment);

    // Auth
    const currentUser = useStore((state) => state.currentUser);
    const login = useStore((state) => state.login);
    const logout = useStore((state) => state.logout);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // State
    const [activeFilter, setActiveFilter] = useState<'new' | 'preparing' | 'ready'>('new');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Sound notification
    const [prevPendingCount, setPrevPendingCount] = useState(0);
    const [prevNotificationCount, setPrevNotificationCount] = useState(0);
    const [showVisualAlert, setShowVisualAlert] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [isRinging, setIsRinging] = useState(false);
    const audioCtxRef = useRef<any>(null);
    const isFirstMount = useRef(true);

    // Derived data
    const activeOrders = [...(orders || [])].sort((a: Order, b: Order) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
    const today = new Date().toDateString();
    const todaysOrders = (orders || []).filter((o: Order) => new Date(o.createdAt).toDateString() === today);

    // Stats
    const newOrders = activeOrders.filter((o: Order) => o.status === 'Pending');
    const preparingOrders = activeOrders.filter((o: Order) => o.status === 'Preparing');
    const readyOrders = activeOrders.filter((o: Order) => o.status === 'Ready' || o.status === 'Served');

    // Active Service Requests
    const activeNotifications = (notifications || []).filter((n: Notification) => n.status === 'pending');

    // Filter orders based on active tab
    const filteredOrders = activeOrders.filter((o: Order) => {
        if (activeFilter === 'new') return o.status === 'Pending';
        if (activeFilter === 'preparing') return o.status === 'Preparing';
        if (activeFilter === 'ready') return o.status === 'Ready' || o.status === 'Served';
        return false;
    });

    // Calculate average preparation time
    const avgPrepTime = preparingOrders.length > 0
        ? Math.round(preparingOrders.reduce((sum: number, order: Order) => {
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
            audio.loop = true;
            audio.volume = 1.0;
            currentAudioRef.current = audio;
            setIsRinging(true);

            // Audio loop enabled, so we don't auto-stop on 'ended'

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

        // Trigger Alert for NEW items
        if (newOrders.length > prevPendingCount || activeNotifications.length > prevNotificationCount) {
            playNotificationSound();
            setShowVisualAlert(true);
        }

        // Keep ringing if ANY action is needed
        const hasActionsNeeded = newOrders.length > 0 || activeNotifications.length > 0;

        if (isSoundEnabled && hasActionsNeeded) {
            if (!isRinging) {
                playNotificationSound();
            }
        } else {
            // Silence if everything is clear
            if (isRinging) {
                stopNotificationSound();
            }
            if (!hasActionsNeeded) {
                setShowVisualAlert(false);
            }
        }

        setPrevPendingCount(newOrders.length);
        setPrevNotificationCount(activeNotifications.length);
    }, [newOrders.length, activeNotifications.length, isSoundEnabled]);

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
            <StaffDashboardHeader
                userName={currentUser?.name || 'Staff'}
                isRinging={isRinging}
                isSoundEnabled={isSoundEnabled}
                onStopSound={stopNotificationSound}
                onToggleSound={toggleSound}
                onOpenSettings={() => setShowSettingsModal(true)}
            />

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <StaffServiceAlerts notifications={notifications} />

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
                            <StaffOrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={(status) => updateOrderStatus(order.id, status)}
                                onDelete={() => deleteOrder(order.id)}
                                isNew={activeFilter === 'new'}
                                isPreparing={activeFilter === 'preparing'}
                                isReady={activeFilter === 'ready'}
                                isExpanded={expandedOrderIds.has(order.id)}
                                onToggleExpand={() => toggleOrderExpansion(order.id)}
                                onConfirmPayment={() => confirmPayment(order.id)}
                            />
                        ))
                    )}
                </div>
            </main>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettingsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowSettingsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowSettingsModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>

                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Settings className="text-gray-500" /> Settings
                            </h2>

                            {/* Profile Info */}
                            <div className="bg-gray-50 p-4 rounded-xl mb-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <User size={24} className="text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{currentUser?.name || 'Staff'}</p>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Logged In</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Sound Toggle Duplicate for Mobile */}
                                <button
                                    onClick={toggleSound}
                                    className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition-colors ${isSoundEnabled
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : 'bg-red-50 border-red-200 text-red-700'
                                        }`}
                                >
                                    <span className="font-bold flex items-center gap-2">
                                        {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                        Sound Notifications
                                    </span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded bg-white/50 border ${isSoundEnabled ? 'border-green-200' : 'border-red-200'}`}>
                                        {isSoundEnabled ? 'ON' : 'OFF'}
                                    </span>
                                </button>

                                {/* Logout Section */}
                                <div className="pt-4 border-t border-gray-100">
                                    {!showLogoutConfirm ? (
                                        <button
                                            onClick={() => setShowLogoutConfirm(true)}
                                            className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-xl border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 group"
                                        >
                                            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> Request Logout
                                        </button>
                                    ) : (
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center animate-pulse">
                                            <p className="text-red-800 font-bold mb-3 text-lg">⚠️ Are you sure?</p>
                                            <p className="text-red-600 text-xs mb-4">You will need to re-enter credentials to access the dashboard.</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setShowLogoutConfirm(false)}
                                                    className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setShowSettingsModal(false);
                                                    }}
                                                    className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-red-700"
                                                >
                                                    Yes, Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-center text-[10px] text-gray-400 mt-6 font-mono">
                                Charged Satellite v2.0 • {new Date().getFullYear()}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}


