'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, TrendingUp, Users, Lock, LogOut, History, BarChart3, LayoutDashboard, Settings, Leaf, Drumstick, Star, ArrowRight, Plus, Trash, Pencil, X, Printer, FolderOpen, Image as ImageIcon, Upload, Share2, Download, Sun, Moon, MapPin, ShoppingBag, Grid, BookOpen, Sparkles, Bell, Check, CloudSnow, Snowflake, Clock } from 'lucide-react';
import { useStore, Order } from '@/lib/store';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-gray-400" size={32} /></div>}>
            <AdminDashboard />
        </Suspense>
    );
}

function AdminDashboard() {
    const orders = useStore((state) => state.orders);
    const notifications = useStore((state) => state.notifications); // Ensure notifications are selected
    const tables = useStore((state) => state.tables);
    const menu = useStore((state) => state.menu);
    const categoryOrder = useStore((state) => state.categoryOrder);
    const currentUser = useStore((state) => state.currentUser);
    const login = useStore((state) => state.login);
    const logout = useStore((state) => state.logout);
    const valleyUpdates = useStore((state) => state.valleyUpdates);
    const initialize = useStore((state) => state.initialize);
    const menuAppearance = useStore((state: any) => state.menuAppearance);
    const updateMenuAppearance = useStore((state: any) => state.updateMenuAppearance);
    const landingPhotos = useStore((state) => state.landingPhotos);
    const updateLandingPhotos = useStore((state) => state.updateLandingPhotos);
    const uploadImage = useStore((state) => state.uploadImage);

    // Sound Logic
    const [soundEnabled, setSoundEnabled] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initial preload removal (handled by JSX now)

    // Theme removed - forcing Premium Dark Mode

    const prevOrdersLength = useRef(0);
    const prevNotifLength = useRef(0);
    const [showVisualAlert, setShowVisualAlert] = useState(false);

    // Scan Stats Logic
    const [showScanStats, setShowScanStats] = useState(false);
    const [scanStats, setScanStats] = useState<any[]>([]);
    const fetchScanStats = useStore((state) => state.fetchScanStats);

    useEffect(() => {
        if (showScanStats) {
            fetchScanStats().then(setScanStats);
        }
    }, [showScanStats, fetchScanStats]);

    useEffect(() => {
        prevOrdersLength.current = orders.filter(o => o.status === 'Pending').length;
        prevNotifLength.current = notifications.filter(n => n.status === 'pending').length;
    }, []);

    useEffect(() => {
        const currentPendingOrders = orders.filter(o => o.status === 'Pending').length;
        const currentPendingNotifs = notifications.filter(n => n.status === 'pending').length;

        // Trigger Alert for NEW items
        if (currentPendingOrders > prevOrdersLength.current || currentPendingNotifs > prevNotifLength.current) {
            setShowVisualAlert(true);

            // If sound is enabled and not already ringing, play a chime or start ring
            if (soundEnabled && audioRef.current) {
                audioRef.current.loop = true;
                if (audioRef.current.paused) {
                    audioRef.current.play().catch(e => console.error("Sound play failed", e));
                }
            }
        }

        // Keep ringing if ANY action is needed (Order Pending or Service Request Pending)
        const hasActionsNeeded = currentPendingOrders > 0 || currentPendingNotifs > 0;

        if (soundEnabled && hasActionsNeeded) {
            if (audioRef.current) {
                audioRef.current.loop = true;
                if (audioRef.current.paused) {
                    audioRef.current.play().catch(e => console.error("Ring loop failed", e));
                }
            }
        } else {
            // Silence if everything is clear
            if (audioRef.current) {
                audioRef.current.loop = false;
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            if (!hasActionsNeeded) {
                setShowVisualAlert(false);
            }
        }

        prevOrdersLength.current = currentPendingOrders;
        prevNotifLength.current = currentPendingNotifs;
    }, [notifications, orders, soundEnabled]);

    const toggleSound = () => {
        if (!soundEnabled) {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().then(() => {
                    setSoundEnabled(true);
                }).catch(e => {
                    console.error("Audio permission denied", e);
                    alert("Please interact with the document first or check browser permissions.");
                });
            }
        } else {
            setSoundEnabled(false);
        }
    };

    const media = useStore((state) => state.media);
    const [localGallery, setLocalGallery] = useState<any[]>([]);

    useEffect(() => {
        initialize();
        // Fetch local gallery manifest
        fetch('/gallery-manifest.json')
            .then(res => res.json())
            .then(data => setLocalGallery(data))
            .catch(err => console.error('Failed to load local gallery', err));
    }, [initialize]);

    // !! IMPORTANT FOR MOBILE TESTING !!
    const HOST_URL = typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' ? 'http://192.168.1.109:3000' : window.location.origin)
        : '';

    const [activeTab, setActiveTab] = useState<'live' | 'history' | 'analytics' | 'reviews' | 'settings' | 'media' | 'storage' | 'gear'>('live');
    const searchParams = useSearchParams();
    const router = useRouter();

    // Sync tab with URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        const validTabs = ['live', 'history', 'analytics', 'reviews', 'settings', 'media', 'storage', 'gear'];
        if (tab && validTabs.includes(tab)) {
            setActiveTab(tab as any);
        }
    }, [searchParams]);

    // Update URL when tab changes
    const handleTabChange = (tab: string) => {
        setActiveTab(tab as any);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.push(`/admin?${params.toString()}`, { scroll: false });
    };

    // Auth Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [editingItem, setEditingItem] = useState<any>(null); // State for editing item
    const [menuSearchQuery, setMenuSearchQuery] = useState(''); // Search filter for menu
    const [historySearch, setHistorySearch] = useState(''); // Search filter for history
    const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('All'); // Category filter
    const [showGalleryPicker, setShowGalleryPicker] = useState(false); // State for gallery picker modal

    // Helper to check if image is used in menu
    const isImageUsed = (source: string) => {
        if (!source) return false;
        const fileName = source.split('/').pop()?.split('?')[0]; // Handle query params if any
        if (!fileName) return false;

        return menu.some(m => {
            if (!m.image) return false;
            // Check exact match
            if (m.image === source) return true;
            // Check filename match (handles different base URLs or relative/absolute mismatch)
            if (m.image.includes(fileName)) return true;
            return false;
        });
    };

    const handleDeleteLocal = async (path: string) => {
        if (!confirm('Permanently delete this file? This cannot be undone.')) return;

        try {
            const res = await fetch('/api/media/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: path })
            });
            if (res.ok) {
                setLocalGallery(prev => prev.filter(p => p.path !== path));
            } else {
                alert('Failed to delete file');
            }
        } catch (e) {
            console.error(e);
            alert('Error deleting file');
        }
    };


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const success = await login(username, password);
            if (success) {
                const user = useStore.getState().currentUser;
                if (user?.role !== 'admin') {
                    logout();
                    setError('Access Denied. You do not have admin privileges.');
                }
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            console.error(err);
            setError('Login error occurred');
        }
    };

    const handlePrintAllQRs = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // chunk tables into groups of 2
        const chunkedTables = [];
        for (let i = 0; i < tables.length; i += 2) {
            chunkedTables.push(tables.slice(i, i + 2));
        }

        printWindow.document.write(`
        <html>
            <head>
                <style>
                    @page { size: A4; margin: 0; }
                    body { margin: 0; padding: 0; font-family: sans-serif; background: white; }
                    .page {
                        width: 210mm;
                        height: 297mm;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-around;
                        page-break-after: always;
                        padding: 10mm;
                        box-sizing: border-box;
                    }
                    .qr-container {
                        text-align: center;
                        border: 2px solid #000;
                        padding: 20px;
                        border-radius: 20px;
                        width: 80%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        height: 40%;
                        justify-content: center;
                    }
                    .qr-image {
                        width: 300px;
                        height: 300px;
                        margin: 20px 0;
                    }
                    h1 { margin: 0; font-size: 3em; font-weight: 800; }
                    p { color: #000; margin-top: 10px; font-size: 1.5em; }
                </style>
            </head>
            <body>
                ${chunkedTables.map(chunk => `
                    <div class="page">
                        ${chunk.map(table => `
                            <div class="qr-container">
                                <h1>${table.name}</h1>
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${HOST_URL}/scan?tableId=${table.id}`)}" class="qr-image" />
                                <p>Scan to View Menu</p>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
                <script>
                    window.onload = () => {
                        setTimeout(() => window.print(), 1000);
                    }
                </script>
            </body>
        </html>
        `);
        printWindow.document.close();
    };

    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
                <Link href="/" className="absolute top-8 left-8 text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2">
                    <ArrowLeft size={20} /> Back
                </Link>
                <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-xl">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-tashi-primary/10 rounded-full text-tashi-primary">
                            <Lock size={32} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Admin Login</h1>
                    <p className="text-gray-500 text-center mb-8 text-sm">Restricted Access Portal</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-tashi-primary transition-colors"
                                placeholder="Enter admin ID"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-tashi-primary transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                        {error && (
                            <div className="bg-red-50 text-red-500 border border-red-200 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-tashi-primary hover:bg-tashi-primary/90 text-white font-bold py-3 rounded-lg transition-all active:scale-95 shadow-md shadow-tashi-primary/20"
                        >
                            Access Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Computed Stats
    const today = new Date().toDateString();
    const todaysOrders = (orders || []).filter(o => new Date(orderCreatedAt(o)).toDateString() === today);
    const todaysRevenue = todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalRevenue = (orders || []).reduce((sum, order) => sum + order.totalAmount, 0);
    const activeOrders = (orders || []).filter(o => o.status !== 'Paid' && o.status !== 'Rejected' && o.status !== 'Cancelled');
    const pastOrders = (orders || []).filter(o => o.status === 'Paid' || o.status === 'Rejected' || o.status === 'Cancelled');

    function orderCreatedAt(o: any) {
        if (!o.createdAt) return new Date();
        try {
            return new Date(o.createdAt);
        } catch {
            return new Date();
        }
    }

    return (
        <div className="min-h-screen pb-24 bg-gray-50 text-gray-900 selection:bg-orange-100 selection:text-orange-900">
            {/* Hidden Audio Element for Reliable Playback */}
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

            {/* Visual Alert Banner */}
            <AnimatePresence>
                {showVisualAlert && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-red-600 text-white overflow-hidden shadow-2xl relative z-[60]"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full animate-pulse">
                                    <Bell size={18} className="fill-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Action Required: New Activity Detected!</p>
                                    <p className="text-[10px] opacity-90 uppercase tracking-widest font-bold">Check orders or service requests</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowVisualAlert(false);
                                    if (audioRef.current) {
                                        audioRef.current.pause();
                                        audioRef.current.currentTime = 0;
                                    }
                                }}
                                className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                            >
                                <Check size={14} /> Dismiss Alert
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navigation Bar - Desktop Only / Minimal Mobile Header */}
            <div className="border-b border-gray-200 p-4 sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold font-serif text-gray-900">Admin Dashboard</h1>
                    </div>

                    {/* Desktop Tab Navigation - Hidden on Mobile */}
                    <div className="hidden md:flex bg-gray-100 p-1 rounded-xl border border-gray-200 text-sm">
                        <TabButton active={activeTab === 'live'} label="Live" icon={<LayoutDashboard size={16} />} onClick={() => handleTabChange('live')} />
                        <TabButton active={activeTab === 'history'} label="History" icon={<History size={16} />} onClick={() => handleTabChange('history')} />
                        <TabButton active={activeTab === 'analytics'} label="Analytics" icon={<BarChart3 size={16} />} onClick={() => handleTabChange('analytics')} />
                        <TabButton active={activeTab === 'reviews'} label="Reviews" icon={<Star size={16} />} onClick={() => handleTabChange('reviews')} />
                        <TabButton active={activeTab === 'gear'} label="Gear" icon={<ShoppingBag size={16} />} onClick={() => handleTabChange('gear')} />
                        <TabButton active={activeTab === 'settings'} label="Admin" icon={<Settings size={16} />} onClick={() => handleTabChange('settings')} />
                        <TabButton active={activeTab === 'media'} label="Media" icon={<ImageIcon size={16} />} onClick={() => handleTabChange('media')} />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle Removed */}
                        <button
                            onClick={toggleSound}
                            className={`p-2 rounded-lg transition-colors border ${soundEnabled ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}
                            title={soundEnabled ? 'Sound Notifications ON' : 'Sound Notifications OFF'}
                        >
                            <div className={soundEnabled ? 'animate-pulse' : ''}>
                                {soundEnabled ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0" /><path d="M18.63 13A17.89 17.89 0 0 1 18 8" /><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" /><path d="M18 8a6 6 0 0 0-9.33-5" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                )}
                            </div>
                        </button>
                        <DbStatusIndicator />
                        {/* ... (Kitchen View and Logout) */}
                        <Link
                            href="/staff/dashboard"
                            className="hidden md:block bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors text-xs font-bold border border-blue-600/50"
                        >
                            Kitchen View
                        </Link>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to logout?')) {
                                    logout();
                                }
                            }}
                            className="p-2 bg-red-900/20 text-red-500 border border-red-900/50 rounded-lg hover:bg-red-900/40 transition-colors"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200 md:hidden px-2 py-2 pb-safe shadow-lg">
                <div className="grid grid-cols-7 gap-1">
                    <MobileTabButton active={activeTab === 'live'} label="Live" icon={<LayoutDashboard size={20} />} onClick={() => handleTabChange('live')} />
                    <MobileTabButton active={activeTab === 'history'} label="History" icon={<History size={20} />} onClick={() => handleTabChange('history')} />
                    <MobileTabButton active={activeTab === 'analytics'} label="Stats" icon={<BarChart3 size={20} />} onClick={() => handleTabChange('analytics')} />
                    <MobileTabButton active={activeTab === 'reviews'} label="Review" icon={<Star size={20} />} onClick={() => handleTabChange('reviews')} />
                    <MobileTabButton active={activeTab === 'gear'} label="Gear" icon={<ShoppingBag size={20} />} onClick={() => handleTabChange('gear')} />
                    <MobileTabButton active={activeTab === 'settings'} label="Admin" icon={<Settings size={20} />} onClick={() => handleTabChange('settings')} />
                    <MobileTabButton active={activeTab === 'media'} label="Media" icon={<ImageIcon size={20} />} onClick={() => handleTabChange('media')} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Traffic Stats Button - Floating or Header? Header is crowded. Let's put a banner or a card in Live view? */}
                {/* User asked for a BUTTON on admin portal. */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setShowScanStats(true)}
                        className="bg-blue-600/20 text-blue-400 border border-blue-600/50 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-600/30 transition-colors"
                    >
                        <Users size={20} />
                        View Scan Traffic
                    </button>
                </div>

                {showScanStats && <ScanStatsModal stats={scanStats} onClose={() => setShowScanStats(false)} />}

                <AnimatePresence mode="wait">
                    {/* LIVE DASHBOARD VIEW */}
                    {activeTab === 'live' && (
                        <motion.div
                            key="live"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Dashboard Header Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                                <StatCard
                                    title="Today's Revenue"
                                    value={`₹${todaysRevenue.toLocaleString()}`}
                                    icon={<DollarSign className="text-green-500" size={24} />}
                                    subtext={`${todaysOrders.length} orders today`}
                                />
                                <StatCard
                                    title="Active Orders"
                                    value={activeOrders.length.toString()}
                                    icon={<ShoppingBag className="text-blue-500" size={24} />}
                                    subtext="Pending fulfillment"
                                />
                                <StatCard
                                    title="Service Requests"
                                    value={notifications.filter(n => n.status === 'pending').length.toString()}
                                    icon={<Bell className="text-orange-500" size={24} />}
                                    subtext="Pending calls/bills"
                                />
                                <StatCard
                                    title="Total Tables"
                                    value={tables.length.toString()}
                                    icon={<Users className="text-purple-500" size={24} />}
                                    subtext="Registered units"
                                />
                            </div>

                            {/* Main Live Content */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Left Side: Live Orders (2/3 width on desktop) */}
                                <div className="xl:col-span-2 space-y-6">
                                    <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                Live Orders
                                            </h2>
                                            <div className="flex gap-2">
                                                {/* Filter buttons could go here */}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {activeOrders.length === 0 ? (
                                                <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                    <div className="mb-4 text-gray-300 flex justify-center"><ShoppingBag size={48} /></div>
                                                    <p className="text-gray-500 font-medium">No active orders right now.</p>
                                                    <p className="text-xs text-gray-400 mt-1">New orders will appear here automatically.</p>
                                                </div>
                                            ) : (
                                                activeOrders.sort((a, b) => new Date(orderCreatedAt(b)).getTime() - new Date(orderCreatedAt(a)).getTime()).map(order => (
                                                    <AdminOrderCard key={order.id} order={order} />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Active Service Requests (1/3 width) */}
                                <div className="space-y-6">
                                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm h-full">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-lg font-bold text-gray-900 font-serif flex items-center gap-2">
                                                <Bell size={20} className="text-orange-500" />
                                                Service Alerts
                                            </h2>
                                            {notifications.filter(n => n.status === 'pending').length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Resolve all pending service requests?')) {
                                                            notifications.filter(n => n.status === 'pending').forEach(n => useStore.getState().resolveNotification(n.id));
                                                        }
                                                    }}
                                                    className="text-xs text-tashi-primary hover:underline font-bold"
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {notifications.filter(n => n.status === 'pending').length === 0 ? (
                                                <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                    <p className="text-gray-400 text-xs font-medium">No service alerts</p>
                                                </div>
                                            ) : (
                                                notifications
                                                    .filter(n => n.status === 'pending')
                                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                    .map(notif => (
                                                        <motion.div
                                                            key={notif.id}
                                                            layout
                                                            initial={{ x: 20, opacity: 0 }}
                                                            animate={{ x: 0, opacity: 1 }}
                                                            className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between"
                                                        >
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-gray-900">{tables.find(t => t.id === notif.tableId)?.name || notif.tableId}</span>
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${notif.type === 'call_staff' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                                        {notif.type === 'call_staff' ? 'Service' : 'Bill'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-gray-500 mt-1 font-mono">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => useStore.getState().resolveNotification(notif.id)}
                                                                className="p-2 bg-white text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm border border-orange-200"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                        </motion.div>
                                                    ))
                                            )}
                                        </div>

                                        <div className="mt-8">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                <button onClick={handlePrintAllQRs} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium text-gray-700 border border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <Printer size={18} className="text-gray-400" />
                                                        Print All Table QRs
                                                    </div>
                                                    <ArrowRight size={14} className="text-gray-300" />
                                                </button>
                                                <button onClick={() => updateMenuAppearance(menuAppearance === 'grid' ? 'list' : 'grid')} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium text-gray-700 border border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <Grid size={18} className="text-gray-400" />
                                                        Switch Menu Layout
                                                    </div>
                                                    <ArrowRight size={14} className="text-gray-300" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 font-serif">Order History</h2>
                                <div className="relative w-full md:w-96">
                                    <input
                                        type="text"
                                        placeholder="Search by ID, table, or items..."
                                        value={historySearch}
                                        onChange={(e) => setHistorySearch(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-xl py-2 px-4 pl-10 text-sm focus:outline-none focus:border-tashi-primary transition-colors shadow-sm"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                    {historySearch && (
                                        <button onClick={() => setHistorySearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-500">
                                        <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-700 border-b border-gray-200 tracking-wider">
                                            <tr>
                                                <th className="p-4">Order ID</th>
                                                <th className="p-4">Date & Time</th>
                                                <th className="p-4">Table</th>
                                                <th className="p-4">Items</th>
                                                <th className="p-4 text-right">Total</th>
                                                <th className="p-4 text-center">Status</th>
                                                <th className="p-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 italic">
                                            {pastOrders.filter(order => {
                                                const searchStr = `${order.id} ${order.tableId} ${order.items.map(i => i.name).join(' ')}`.toLowerCase();
                                                return searchStr.includes(historySearch.toLowerCase());
                                            }).length === 0 ? (
                                                <tr><td colSpan={7} className="p-12 text-center text-gray-400 font-medium">No orders matching your search.</td></tr>
                                            ) : (
                                                pastOrders
                                                    .filter(order => {
                                                        const searchStr = `${order.id} ${order.tableId} ${order.items.map(i => i.name).join(' ')}`.toLowerCase();
                                                        return searchStr.includes(historySearch.toLowerCase());
                                                    })
                                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                    .map(order => (
                                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="p-4 font-mono text-gray-900">#{order.id.slice(0, 6)}</td>
                                                            <td className="p-4">{new Date(order.createdAt).toLocaleString()}</td>
                                                            <td className="p-4">{tables.find(t => t.id === order.tableId)?.name || order.tableId}</td>
                                                            <td className="p-4">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                                                            <td className="p-4 text-right font-bold text-tashi-accent">₹{order.totalAmount}</td>
                                                            <td className="p-4 text-center">
                                                                <StatusBadge status={order.status} />
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <button
                                                                    onClick={async () => {
                                                                        if (confirm('Permanently delete this order record?')) {
                                                                            await useStore.getState().deleteOrder(order.id);
                                                                        }
                                                                    }}
                                                                    className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors"
                                                                    title="Delete Order Record"
                                                                >
                                                                    <Trash size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ANALYTICS VIEW */}
                    {activeTab === 'analytics' && (
                        <AnalyticsView orders={orders} menu={menu} />
                    )}

                    {/* MEDIA GALLERY VIEW */}
                    {activeTab === 'media' && (
                        <motion.div
                            key="media"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Media Gallery</h2>
                                    <p className="text-gray-500 text-sm">Upload and manage photos for your menu and updates.</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        const url = prompt("Paste the image URL here:");
                                        if (url) {
                                            const name = prompt("Give this image a name (optional):") || 'Saved Image';
                                            // Directly save to firestore "gallery" equivalent
                                            // We need a store function for this or just hack it here, but store is cleaner.
                                            // Since we haven't exposed 'addMedia' helper, I'll assume we can call the firestore methods or mock 'upload' for now,
                                            // BUT wait, we modified 'uploadImage' to SAVE if flag is true.
                                            // However, 'uploadImage' expects a FILE.
                                            // We should add a new store method `addMediaLink`.
                                            // For now, let's just inline the addDoc call since we have imports elsewhere or just add method to store quickly.
                                            // Actually I can't easily add method to store without reading it again.

                                            // Let's us use the 'uploadImage' but we can't because it takes File.
                                            // I will instruct user I will add `addMediaItem` to store first.
                                            // WAIT - I can just use `addDoc` if I import it? No, imports are not top level here.
                                            // I will just modify the label to be a button that calls a new Store method I will create in next step.

                                            await useStore.getState().addMediaItem(url, name);
                                        }
                                    }}
                                    className="bg-tashi-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors font-bold shadow-lg"
                                >
                                    <Plus size={20} /> Save New Link
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {media?.length === 0 ? (
                                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-300 rounded-xl">
                                        <p className="text-gray-500 mb-2">No photos in gallery yet.</p>
                                        <p className="text-xs text-gray-600">Upload photos to use them in your app.</p>
                                    </div>
                                ) : (
                                    media?.map((item) => {
                                        const isUsed = isImageUsed(item.url);
                                        return (
                                            <div key={item.id} className={`group relative bg-gray-50 rounded-lg overflow-hidden border transition-all ${isUsed ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-gray-200'}`}>
                                                <div className="aspect-square relative">
                                                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                                    {isUsed ? (
                                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-10 flex items-center gap-1">
                                                            <span>✓</span> IN USE
                                                        </div>
                                                    ) : (
                                                        <div className="absolute top-2 right-2 bg-gray-500/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                                                            Unused
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(item.url);
                                                            alert('URL Copied!');
                                                        }}
                                                        className="bg-white text-black text-xs font-bold px-3 py-2 rounded full-width hover:bg-gray-200"
                                                    >
                                                        Copy URL
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (isUsed) {
                                                                if (!confirm('⚠️ WARNING: This image is currently USED in your menu!\n\nDeleting it might break the menu image.\n\nAre you sure?')) return;
                                                            } else {
                                                                if (!confirm('Delete this image reference?')) return;
                                                            }
                                                            await useStore.getState().deleteMedia(item.id);
                                                        }}
                                                        className={`border p-2 rounded hover:text-white transition-colors ${isUsed ? 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500' : 'bg-white/10 text-white border-white/20 hover:bg-red-500 hover:border-red-500'}`}
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1">
                                                    <p className="text-[10px] text-gray-400 truncate">{item.name}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Local Gallery (Restored) */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mt-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Local Gallery ({localGallery.length} files)</h3>
                                    <span className="text-xs text-gray-500">Available in public folders</span>
                                </div>

                                {localGallery.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                                        <p className="text-gray-500">No local images found.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {localGallery.map((file, idx) => {
                                            const isUsed = isImageUsed(file.path);
                                            return (
                                                <div key={idx} className={`bg-white rounded-lg border shadow-sm overflow-hidden group relative transition-all ${isUsed ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-gray-200 opacity-80 hover:opacity-100'}`}>
                                                    <div className="aspect-square bg-gray-100 relative">
                                                        <img
                                                            src={file.path}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {isUsed ? (
                                                            <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-10 flex items-center gap-1">
                                                                <span>✓</span> IN USE
                                                            </div>
                                                        ) : (
                                                            <div className="absolute top-2 right-2 bg-gray-500/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                                                                Unused
                                                            </div>
                                                        )}

                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 items-center justify-center p-4">
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(file.path);
                                                                    alert('Path copied: ' + file.path);
                                                                }}
                                                                className="bg-white text-black font-bold uppercase text-xs px-4 py-2 rounded-lg hover:bg-gray-200 transform scale-90 group-hover:scale-100 transition-all w-full"
                                                            >
                                                                Copy Path
                                                            </button>
                                                            {!isUsed && (
                                                                <button
                                                                    onClick={() => handleDeleteLocal(file.path)}
                                                                    className="bg-red-500 text-white font-bold uppercase text-xs px-4 py-2 rounded-lg hover:bg-red-600 transform scale-90 group-hover:scale-100 transition-all w-full flex items-center justify-center gap-2"
                                                                >
                                                                    <Trash size={14} /> Delete
                                                                </button>
                                                            )}
                                                            {isUsed && (
                                                                <p className="text-green-300 text-[10px] font-bold text-center">In Use</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="p-2">
                                                        <p className="text-[10px] text-gray-900 truncate" title={file.name}>{file.name}</p>
                                                        <p className="text-[9px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* STORAGE MANAGER VIEW */}
                    {false && ( // Deprecated Storage View
                        <motion.div
                            key="storage"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="bg-neutral-800 rounded-xl border border-white/5 p-6"
                        >
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">Storage Manager</h2>
                                <p className="text-gray-400 text-sm">View all image URLs currently used in your menu items. To delete images from Firebase Storage, use the Firebase Console.</p>
                            </div>

                            <div className="bg-neutral-900 rounded-xl p-6 border border-white/5 mb-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">How to Delete Firebase Storage Files:</h3>
                                <ol className="space-y-2 text-sm text-gray-300">
                                    <li className="flex gap-3">
                                        <span className="text-tashi-accent font-bold">1.</span>
                                        <span>Go to <a href="https://console.firebase.google.com" target="_blank" className="text-blue-400 hover:underline">Firebase Console</a> and sign in</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-tashi-accent font-bold">2.</span>
                                        <span>Select your project: <span className="text-white font-mono bg-black/40 px-2 py-0.5 rounded">charged-satellite-zimpad</span></span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-tashi-accent font-bold">3.</span>
                                        <span>Click <span className="text-white font-bold">"Build"</span> → <span className="text-white font-bold">"Storage"</span> in the left sidebar</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-tashi-accent font-bold">4.</span>
                                        <span>Browse the <span className="text-white font-mono">uploads/</span> folder to see all your images</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-tashi-accent font-bold">5.</span>
                                        <span>Select unwanted images and click the <span className="text-red-400">trash icon</span> to delete</span>
                                    </li>
                                </ol>
                            </div>

                            <div className="bg-neutral-900 rounded-xl p-6 border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white">Images Currently Used in Menu ({menu.filter(m => m.image).length} items with images)</h3>
                                    <span className="text-xs text-gray-500">✓ = In Use, Safe to Keep</span>
                                </div>

                                {menu.filter(m => m.image).length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                                        <p className="text-gray-500">No menu items have images yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {menu.filter(m => m.image).map((item) => (
                                            <div key={item.id} className="bg-black/40 rounded-lg border border-white/5 overflow-hidden">
                                                <div className="aspect-square bg-neutral-900 relative">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23666"%3E%E2%9C%96%3C/text%3E%3C/svg%3E';
                                                        }}
                                                    />
                                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                                        <span>✓</span> IN USE
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <p className="font-bold text-white text-sm mb-1">{item.name}</p>
                                                    <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                                                    <div className="bg-black/40 rounded p-2">
                                                        <p className="text-[10px] text-gray-400 font-mono break-all">{item.image}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(item.image || '');
                                                            alert('URL copied!');
                                                        }}
                                                        className="mt-2 w-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 rounded transition-colors"
                                                    >
                                                        Copy URL
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Local Gallery Section */}
                            <div className="bg-neutral-900 rounded-xl p-6 border border-white/5 mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white">Local Gallery ({localGallery.length} files)</h3>
                                    <span className="text-xs text-gray-500">Files found in public folders (gallery, uploads, placeholders)</span>
                                </div>

                                {localGallery.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                                        <p className="text-gray-500">No local images found.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {localGallery.map((file, idx) => (
                                            <div key={idx} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden group relative">
                                                <div className="aspect-square bg-gray-100 relative">
                                                    <img
                                                        src={file.path}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(file.path);
                                                                alert('Path copied: ' + file.path);
                                                            }}
                                                            className="bg-white text-black font-bold uppercase text-xs px-4 py-2 rounded-lg hover:bg-gray-200 transform scale-90 group-hover:scale-100 transition-all"
                                                        >
                                                            Copy Path
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-2">
                                                    <p className="text-[10px] text-gray-400 truncate" title={file.name}>{file.name}</p>
                                                    <p className="text-[9px] text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* REVIEWS VIEW (New) */}
                    {activeTab === 'reviews' && (
                        <ReviewsView />
                    )}

                    {/* GEAR MANAGEMENT VIEW (New) */}
                    {activeTab === 'gear' && (
                        <GearManagementView />
                    )}

                    {/* ADMIN MANAGEMENT VIEW */}
                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-12"
                        >
                            {/* NEW: Admin Quick Overview Navigation */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button
                                    onClick={() => {
                                        const el = document.getElementById('appearance-settings');
                                        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="bg-purple-100 hover:bg-purple-200 p-4 rounded-2xl border border-purple-200 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <div className="p-3 bg-purple-600 text-white rounded-xl shadow-lg ring-4 ring-purple-100 group-hover:scale-110 transition-transform">
                                        <Sparkles size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-black uppercase tracking-wider">Appearance</span>
                                </button>

                                <button
                                    onClick={() => handleTabChange('gear')}
                                    className="bg-orange-100 hover:bg-orange-200 p-4 rounded-2xl border border-orange-200 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <div className="p-3 bg-orange-600 text-white rounded-xl shadow-lg ring-4 ring-orange-100 group-hover:scale-110 transition-transform">
                                        <ShoppingBag size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-black uppercase tracking-wider">Local Wear</span>
                                </button>

                                <button
                                    onClick={() => {
                                        const el = document.getElementById('table-management');
                                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }}
                                    className="bg-blue-100 hover:bg-blue-200 p-4 rounded-2xl border border-blue-200 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg ring-4 ring-blue-100 group-hover:scale-110 transition-transform">
                                        <Grid size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-black uppercase tracking-wider">Tables</span>
                                </button>

                                <button
                                    onClick={() => {
                                        const el = document.getElementById('menu-management');
                                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }}
                                    className="bg-green-100 hover:bg-green-200 p-4 rounded-2xl border border-green-200 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <div className="p-3 bg-green-600 text-white rounded-xl shadow-lg ring-4 ring-green-100 group-hover:scale-110 transition-transform">
                                        <BookOpen size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-black uppercase tracking-wider">Menu Items</span>
                                </button>

                                <button
                                    onClick={() => {
                                        const el = document.getElementById('valley-updates-management');
                                        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="bg-sky-100 hover:bg-sky-200 p-4 rounded-2xl border border-sky-200 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <div className="p-3 bg-sky-600 text-white rounded-xl shadow-lg ring-4 ring-sky-100 group-hover:scale-110 transition-transform">
                                        <Newspaper size={24} />
                                    </div>
                                    <span className="text-xs font-bold text-black uppercase tracking-wider">Updates</span>
                                </button>
                            </div>
                            {/* App Sharing & QR */}
                            <div className="bg-gradient-to-br from-orange-100 to-white border border-tashi-accent/30 rounded-2xl p-8 shadow-sm">
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="bg-white p-4 rounded-xl shadow-lg shadow-orange-100 border border-orange-100">
                                        <QRCodeSVG
                                            value="https://tashizomcafe.in"
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                            id="app-home-qr"
                                        />
                                    </div>
                                    <div className="flex-1 text-center md:text-left space-y-4">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Share TashiZom App</h2>
                                            <p className="text-gray-600">
                                                Scan to open the home page immediately. Share this link with guests to let them access the menu from anywhere.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                            <button
                                                onClick={async () => {
                                                    const shareData = {
                                                        title: 'TashiZom | Digital Dining',
                                                        text: 'Check out the TashiZom menu and order food instantly!',
                                                        url: 'https://tashizomcafe.in'
                                                    };
                                                    if (navigator.share) {
                                                        try {
                                                            await navigator.share(shareData);
                                                        } catch (err) {
                                                            console.error('Share failed:', err);
                                                        }
                                                    } else {
                                                        navigator.clipboard.writeText('https://tashizomcafe.in');
                                                        alert('Link copied to clipboard!');
                                                    }
                                                }}
                                                className="bg-tashi-accent hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-yellow-500/20"
                                            >
                                                <Share2 size={20} />
                                                Share App Link
                                            </button>

                                            <button
                                                onClick={() => {
                                                    const svg = document.getElementById('app-home-qr');
                                                    if (svg) {
                                                        const svgData = new XMLSerializer().serializeToString(svg);
                                                        const canvas = document.createElement('canvas');
                                                        const ctx = canvas.getContext('2d');
                                                        const img = new Image();
                                                        img.onload = () => {
                                                            canvas.width = img.width;
                                                            canvas.height = img.height;
                                                            if (ctx) {
                                                                ctx.fillStyle = 'white';
                                                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                                                ctx.drawImage(img, 0, 0);
                                                                const pngFile = canvas.toDataURL('image/png');
                                                                const downloadLink = document.createElement('a');
                                                                downloadLink.download = 'tashizom-app-qr.png';
                                                                downloadLink.href = pngFile;
                                                                downloadLink.click();
                                                            }
                                                        };
                                                        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                                                    }
                                                }}
                                                className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl flex items-center gap-2 border border-gray-200 shadow-sm"
                                            >
                                                <Download size={20} />
                                                Download QR
                                            </button>
                                        </div>
                                        <p className="text-xs text-orange-500 font-mono">https://tashizomcafe.in</p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Appearance Settings (New) */}
                            <div id="appearance-settings" className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm scroll-mt-24">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <span className="p-2 bg-purple-100 rounded-lg text-purple-600"><Sparkles size={20} /></span>
                                            Menu Appearance Styling
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-1">Customize fonts and colors for your customer-facing menu. Changes are live instantly.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Category Headers */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-2">Category Headers</h3>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Font Size</label>
                                            <select
                                                value={menuAppearance.categoryFontSize}
                                                onChange={(e) => updateMenuAppearance({ categoryFontSize: e.target.value })}
                                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:border-tashi-primary outline-none"
                                            >
                                                <option value="1rem">Normal (1rem)</option>
                                                <option value="1.25rem">Large (1.25rem)</option>
                                                <option value="1.5rem">Extra Large (1.5rem)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Text Color</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={menuAppearance.categoryColor}
                                                    onChange={(e) => updateMenuAppearance({ categoryColor: e.target.value })}
                                                    className="bg-white h-8 w-8 rounded cursor-pointer border border-gray-300"
                                                />
                                                <span className="text-xs text-gray-500 uppercase">{menuAppearance.categoryColor}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Item Titles */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-2">Item Names</h3>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Font Size</label>
                                            <select
                                                value={menuAppearance.itemNameFontSize}
                                                onChange={(e) => updateMenuAppearance({ itemNameFontSize: e.target.value })}
                                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:border-tashi-primary outline-none"
                                            >
                                                <option value="0.9rem">Compact (0.9rem)</option>
                                                <option value="1rem">Standard (1rem)</option>
                                                <option value="1.1rem">Large (1.1rem)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Text Color</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={menuAppearance.itemNameColor}
                                                    onChange={(e) => updateMenuAppearance({ itemNameColor: e.target.value })}
                                                    className="bg-white h-8 w-8 rounded cursor-pointer border border-gray-300"
                                                />
                                                <span className="text-xs text-gray-500 uppercase">{menuAppearance.itemNameColor}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Accent */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-2">Accents & Prices</h3>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Accent Color</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={menuAppearance.accentColor}
                                                    onChange={(e) => updateMenuAppearance({ accentColor: e.target.value })}
                                                    className="bg-white h-8 w-8 rounded cursor-pointer border border-gray-300"
                                                />
                                                <span className="text-xs text-gray-500 uppercase">{menuAppearance.accentColor}</span>
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <button
                                                onClick={() => updateMenuAppearance({
                                                    categoryFontSize: '1.25rem',
                                                    categoryColor: '#FFFFFF',
                                                    itemNameFontSize: '1rem',
                                                    itemNameColor: '#E5E5E5',
                                                    accentColor: '#DAA520'
                                                })}
                                                className="w-full bg-white hover:bg-gray-100 text-xs font-bold py-2 rounded text-gray-600 border border-gray-300 transition-colors"
                                            >
                                                Reset to Default
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Preview Section */}
                                <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 shadow-inner">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Live Style Preview (Customer View)
                                    </h3>
                                    <div className="space-y-4">
                                        <h2 style={{ fontSize: menuAppearance.categoryFontSize, color: menuAppearance.categoryColor }} className="font-serif border-b border-white/5 pb-2 transition-all">
                                            Signature Starters
                                        </h2>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 style={{ fontSize: menuAppearance.itemNameFontSize, color: menuAppearance.itemNameColor }} className="font-bold transition-all">
                                                    Tibetan Butter Tea
                                                </h3>
                                                <p className="text-xs text-gray-500 max-w-[200px]">Hand-churned with local butter and Himalayan salt.</p>
                                            </div>
                                            <span style={{ color: menuAppearance.accentColor }} className="font-bold text-sm">
                                                ₹120
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/5 flex gap-2 overflow-x-auto pb-2">
                                        {['Breakfast', 'Lunch', 'Dinner'].map(cat => (
                                            <div key={cat} className="px-3 py-1 rounded-full text-[10px] uppercase font-bold border" style={{ borderColor: `${menuAppearance.accentColor}40`, color: menuAppearance.accentColor }}>
                                                {cat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <p className="text-xs text-gray-500 italic">
                                    <strong>💡 Tip:</strong> These styles apply to ALL devices instantly.
                                </p>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Saved to Cloud
                                </div>
                            </div>

                            {/* Valley Updates Management */}
                            <div id="valley-updates-management" className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 font-serif">Valley Updates</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(valleyUpdates || []).map((update, idx) => (
                                            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                                                <div className="flex justify-between items-center mb-2">
                                                    <input
                                                        defaultValue={update.title}
                                                        onBlur={(e) => {
                                                            const newUpdates = [...useStore.getState().valleyUpdates];
                                                            newUpdates[idx].title = e.target.value;
                                                            useStore.getState().saveValleyUpdates(newUpdates);
                                                        }}
                                                        className="bg-transparent text-gray-900 font-bold text-sm w-full focus:outline-none focus:border-b border-tashi-accent"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newUpdates = useStore.getState().valleyUpdates.filter((_, i) => i !== idx);
                                                            useStore.getState().saveValleyUpdates(newUpdates);
                                                        }}
                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex gap-2 mb-2">
                                                    <select
                                                        defaultValue={update.statusColor}
                                                        onChange={(e) => {
                                                            const newUpdates = [...useStore.getState().valleyUpdates];
                                                            newUpdates[idx].statusColor = e.target.value;
                                                            useStore.getState().saveValleyUpdates(newUpdates);
                                                        }}
                                                        className="bg-white text-xs text-gray-600 rounded p-1 border border-gray-300"
                                                    >
                                                        <option value="green">Green (Good)</option>
                                                        <option value="blue">Blue (Info)</option>
                                                        <option value="red">Red (Alert)</option>
                                                    </select>
                                                    <input
                                                        defaultValue={update.status}
                                                        onBlur={(e) => {
                                                            const newUpdates = [...useStore.getState().valleyUpdates];
                                                            newUpdates[idx].status = e.target.value;
                                                            useStore.getState().saveValleyUpdates(newUpdates);
                                                        }}
                                                        className="bg-transparent text-xs text-gray-500 w-full focus:outline-none focus:border-b border-tashi-accent text-right"
                                                    />
                                                </div>
                                                <textarea
                                                    defaultValue={update.description}
                                                    onBlur={(e) => {
                                                        const newUpdates = [...useStore.getState().valleyUpdates];
                                                        newUpdates[idx].description = e.target.value;
                                                        useStore.getState().saveValleyUpdates(newUpdates);
                                                    }}
                                                    className="w-full bg-transparent text-xs text-gray-600 focus:outline-none border border-transparent focus:border-gray-300 rounded p-1 resize-none h-16"
                                                />
                                                {/* Media Inputs */}
                                                <div className="flex gap-2 items-center border-t border-gray-200 pt-2">
                                                    <select
                                                        defaultValue={update.mediaType || 'image'}
                                                        onChange={(e) => {
                                                            const newUpdates = [...useStore.getState().valleyUpdates];
                                                            newUpdates[idx].mediaType = e.target.value as any;
                                                            useStore.getState().saveValleyUpdates(newUpdates);
                                                        }}
                                                        className="bg-white text-[10px] text-gray-600 rounded p-1 border border-gray-300 w-20"
                                                    >
                                                        <option value="image">Image</option>
                                                        <option value="video">Video</option>
                                                    </select>
                                                    <div className="flex-1">
                                                        <input
                                                            placeholder="Paste Media Link (URL)..."
                                                            defaultValue={update.mediaUrl || ''}
                                                            onBlur={(e) => {
                                                                const newUpdates = [...useStore.getState().valleyUpdates];
                                                                newUpdates[idx].mediaUrl = e.target.value;
                                                                useStore.getState().saveValleyUpdates(newUpdates);
                                                            }}
                                                            className="bg-transparent text-[10px] text-blue-600 w-full focus:outline-none focus:border-b border-blue-300"
                                                        />
                                                    </div>
                                                </div>
                                                {/* Media Preview */}
                                                {update.mediaUrl && (
                                                    <div className="w-full h-32 rounded bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 mt-2">
                                                        {update.mediaType === 'video' ? (
                                                            <video src={update.mediaUrl} controls className="h-full max-w-full" />
                                                        ) : (
                                                            <img src={update.mediaUrl} className="h-full object-cover" alt="Preview" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Add New Button */}

                                        <button
                                            onClick={() => {
                                                const currentUpdates = useStore.getState().valleyUpdates || [];
                                                const newUpdate = {
                                                    id: Math.random().toString(36).substr(7),
                                                    title: 'New Update',
                                                    status: 'Create',
                                                    statusColor: 'blue',
                                                    description: 'Description here...',
                                                    mediaType: 'image',
                                                    mediaUrl: ''
                                                };
                                                useStore.getState().saveValleyUpdates([...currentUpdates, newUpdate]);
                                            }}
                                            className="bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-900 transition-colors min-h-[160px]"
                                        >
                                            <div className="p-2 bg-white rounded-full"><Plus size={20} /></div>
                                            <span className="text-sm font-bold">Add Update</span>
                                        </button>
                                    </div>
                                </div>
                            </div>


                            {/* Landing Page Contextual Photos */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><ImageIcon size={24} /></div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Landing Page Story Photos</h2>
                                        <p className="text-sm text-gray-500">Manage photos for the sections on the home page (Location, Climate, Map, Heritage).</p>
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    {/* Section: Prime Location */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <MapPin size={16} className="text-amber-500" /> Prime Location Photo Gallery (Real Place)
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {(landingPhotos?.location || []).map((url: string, idx: number) => (
                                                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newUrls = (landingPhotos.location || []).filter((_, i) => i !== idx);
                                                            updateLandingPhotos('location', newUrls);
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-amber-500 hover:bg-amber-50 cursor-pointer transition-all text-gray-400 hover:text-amber-600">
                                                <Plus size={24} />
                                                <span className="text-[10px] font-bold uppercase">Upload</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            try {
                                                                const url = await uploadImage(file);
                                                                updateLandingPhotos('location', [...(landingPhotos.location || []), url]);
                                                            } catch (err) { alert("Upload failed"); }
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Section: Hard Winter Conditions */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <CloudSnow size={16} className="text-blue-500" /> Winter Hardships & Survival Stories
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {(landingPhotos?.climate || []).map((url: string, idx: number) => (
                                                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newUrls = (landingPhotos.climate || []).filter((_, i) => i !== idx);
                                                            updateLandingPhotos('climate', newUrls);
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all text-gray-400 hover:text-blue-600">
                                                <Plus size={24} />
                                                <span className="text-[10px] font-bold uppercase">Upload</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            try {
                                                                const url = await uploadImage(file);
                                                                updateLandingPhotos('climate', [...(landingPhotos.climate || []), url]);
                                                            } catch (err) { alert("Upload failed"); }
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Section: Custom Gateway Map */}
                                    <div className="pt-12 border-t border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <MapPin size={16} className="text-amber-500" /> Gateway Map
                                        </h3>
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            {landingPhotos?.customMap ? (
                                                <div className="relative group w-full md:w-80 aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                                                    <img src={landingPhotos.customMap} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateLandingPhotos('customMap', '')}
                                                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-full md:w-80 aspect-video rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-amber-500 hover:bg-amber-50 cursor-pointer transition-all text-gray-400">
                                                    <Plus size={32} />
                                                    <span className="text-xs font-black uppercase tracking-widest">Upload Map</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                try {
                                                                    const url = await uploadImage(file);
                                                                    updateLandingPhotos('customMap', url);
                                                                } catch (err) { alert("Upload failed"); }
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                            <div className="flex-1 text-sm text-gray-500 italic">
                                                Upload your hand-drawn map to create a personal connection with travelers.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Registration Document */}
                                    <div className="pt-12 border-t border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Clock size={16} className="text-amber-600" /> Historical Legacy
                                        </h3>
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            {landingPhotos?.registrationDoc ? (
                                                <div className="relative group w-full md:w-64 aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm" style={{ height: '320px' }}>
                                                    <img src={landingPhotos.registrationDoc} alt="" className="w-full h-full object-contain" />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateLandingPhotos('registrationDoc', '')}
                                                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-full md:w-64 aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all text-gray-400" style={{ height: '320px' }}>
                                                    <Plus size={32} />
                                                    <span className="text-xs font-black uppercase tracking-widest px-8 text-center">Upload Heritage Photo</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                try {
                                                                    const url = await uploadImage(file);
                                                                    updateLandingPhotos('registrationDoc', url);
                                                                } catch (err) { alert("Upload failed"); }
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                            <div className="flex-1 text-sm text-gray-500 italic">
                                                Upload your 1998 hotel registration photo to build trust and authenticity.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Geo Settings */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Geo-Restriction Settings</h2>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-gray-600 mb-2">Allowed Radius (km)</label>
                                        <p className="text-xs text-gray-500 mb-4">Maximum distance allowed for customers to place orders.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <input
                                                id="geo-radius-input"
                                                type="number"
                                                defaultValue={useStore.getState().geoRadius || 5}
                                                className="bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 font-mono text-lg w-32 focus:outline-none focus:border-tashi-accent"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">km</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const input = document.getElementById('geo-radius-input') as HTMLInputElement;
                                                if (input) {
                                                    const val = parseFloat(input.value);
                                                    if (!isNaN(val) && val > 0) {
                                                        useStore.getState().updateSettings({ geoRadius: val });
                                                        alert("Geo-radius updated successfully!");
                                                    } else {
                                                        alert("Please enter a valid number greater than 0.");
                                                    }
                                                }
                                            }}
                                            className="bg-tashi-accent text-tashi-dark font-bold px-4 py-3 rounded-lg hover:bg-yellow-400 transition-colors"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Call Staff Radius Settings */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Call Staff Geofencing</h2>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-gray-600 mb-2">Call Staff Radius (meters)</label>
                                        <p className="text-xs text-gray-500 mb-4">Maximum distance allowed for customers to use the "Call Staff" button. Beyond this, they'll see a direct phone number to call.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <input
                                                id="call-staff-radius-input"
                                                type="number"
                                                defaultValue={useStore.getState().callStaffRadius || 200}
                                                className="bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 font-mono text-lg w-32 focus:outline-none focus:border-tashi-accent"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">m</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const input = document.getElementById('call-staff-radius-input') as HTMLInputElement;
                                                if (input) {
                                                    const val = parseFloat(input.value);
                                                    if (!isNaN(val) && val > 0) {
                                                        useStore.getState().updateSettings({ callStaffRadius: val });
                                                        alert("Call Staff radius updated successfully!");
                                                    } else {
                                                        alert("Please enter a valid number greater than 0.");
                                                    }
                                                }
                                            }}
                                            className="bg-tashi-accent text-tashi-dark font-bold px-4 py-3 rounded-lg hover:bg-yellow-400 transition-colors"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Settings */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
                                <p className="text-sm text-gray-500 mb-6">Update your homestay contact details that appear in the customer menu.</p>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            defaultValue={useStore.getState().contactInfo.phone}
                                            onBlur={(e) => {
                                                const val = e.target.value.trim();
                                                if (val) {
                                                    useStore.getState().updateContactSettings({
                                                        ...useStore.getState().contactInfo,
                                                        phone: val
                                                    });
                                                }
                                            }}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:border-tashi-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2">Owner Phone (Alternate)</label>
                                        <input
                                            type="tel"
                                            defaultValue={useStore.getState().contactInfo.secondaryPhone}
                                            onBlur={(e) => {
                                                const val = e.target.value.trim();
                                                // Allow empty string to clear it
                                                useStore.getState().updateContactSettings({
                                                    ...useStore.getState().contactInfo,
                                                    secondaryPhone: val
                                                });
                                            }}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:border-tashi-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2">WhatsApp Number</label>
                                        <input
                                            type="tel"
                                            defaultValue={useStore.getState().contactInfo.whatsapp}
                                            onBlur={(e) => {
                                                const val = e.target.value.trim();
                                                if (val) {
                                                    useStore.getState().updateContactSettings({
                                                        ...useStore.getState().contactInfo,
                                                        whatsapp: val
                                                    });
                                                }
                                            }}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:border-tashi-accent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +91 for India)</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-2">Google Maps Location</label>
                                        <input
                                            type="text"
                                            defaultValue={useStore.getState().contactInfo.mapsLocation}
                                            onBlur={(e) => {
                                                const val = e.target.value.trim();
                                                if (val) {
                                                    useStore.getState().updateContactSettings({
                                                        ...useStore.getState().contactInfo,
                                                        mapsLocation: val
                                                    });
                                                }
                                            }}
                                            placeholder="TashiZom+Resort or Coordinates"
                                            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:border-tashi-accent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Enter your business name or exact location (use + for spaces)</p>
                                    </div>
                                </div>
                            </div>



                            {/* DANGER ZONE */}
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-red-900 mb-6 flex items-center gap-2">
                                    <div className="p-2 bg-red-200 rounded-full"><Trash size={20} /></div>
                                    Danger Zone
                                </h2>
                                <p className="text-sm text-red-700 mb-6">
                                    These actions are irreversible. Use with caution.
                                </p>
                                <button
                                    onClick={() => useStore.getState().clearAllData_Dangerous()}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Trash size={24} />
                                    DELETE ALL ORDERS & DATA
                                </button>
                                <p className="text-xs text-red-500 mt-2 text-center">
                                    Clears: Orders, Reviews, Notifications, Scan History
                                </p>
                            </div>

                            {/* Table Management */}
                            <div id="table-management" className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Table Management</h2>
                                    <button
                                        onClick={handlePrintAllQRs}
                                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition-colors text-xs sm:text-sm"
                                    >
                                        <Printer size={16} /> Print All QRs (A4)
                                    </button>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            const form = e.target as HTMLFormElement;
                                            const nameInput = form.elements.namedItem('tableName') as HTMLInputElement;
                                            const name = nameInput.value;

                                            if (name.trim()) {
                                                try {
                                                    await useStore.getState().addTable(name);
                                                    nameInput.value = '';
                                                } catch (err: any) {
                                                    alert("Failed to add table: " + err.message);
                                                }
                                            }
                                        }}
                                        className="flex gap-4"
                                    >
                                        <input
                                            name="tableName"
                                            required
                                            placeholder="New Table Name (e.g. Roof Top 1)"
                                            className="flex-1 bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:border-tashi-accent"
                                        />
                                        <button type="submit" className="bg-tashi-accent text-tashi-dark font-bold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors">
                                            Add
                                        </button>
                                    </form>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                                    {tables.map((table) => (
                                        <div key={table.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col gap-4 group shadow-sm hover:border-gray-300">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-900 font-medium">{table.name}</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { const n = prompt('New name:', table.name); if (n) useStore.getState().updateTable(table.id, n); }} className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded hover:bg-gray-200">Edit</button>
                                                    <button onClick={() => { if (confirm('Delete?')) useStore.getState().removeTable(table.id); }} className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded hover:bg-red-500/20">Del</button>
                                                </div>
                                            </div>
                                            <div className="bg-white p-2 rounded flex items-center justify-center">
                                                <QRCodeSVG value={`${HOST_URL}/scan?tableId=${table.id}`} size={120} />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const printWindow = window.open('', '_blank');
                                                    printWindow?.document.write(`<html><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h1 style="font-size:32px;margin-bottom:20px;">${table.name}</h1><img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${HOST_URL}/scan?tableId=${table.id}`)}" style="width:300px;height:300px;" /><p style="margin-top:20px;color:#666;">Scan to View Menu</p></body></html>`);
                                                    printWindow?.document.close();
                                                    printWindow?.print();
                                                }}
                                                className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                                            >
                                                Print QR
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Menu Management */}
                            <div id="menu-management" className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Menu Management</h2>
                                    <button
                                        onClick={() => {
                                            const printWindow = window.open('', '_blank');
                                            if (!printWindow) return;

                                            // 1. Define Category Mappings (DB -> Display)
                                            const CATEGORY_MAPPING: Record<string, string> = {
                                                'Hot Beverages': 'Tea & Coffee',
                                                'Tea & Coffee': 'Tea & Coffee',
                                                'Omelettes': 'Omelets & Egg Dishes',
                                                'Omelets & Egg Dishes': 'Omelets & Egg Dishes',
                                                'Indian Bread': 'Indian Tawa/Tandoori Roti',
                                                'Indian Breads': 'Indian Tawa/Tandoori Roti',
                                                'Indian Tawa/Tandoori Roti': 'Indian Tawa/Tandoori Roti',
                                                'Snacks': 'Snacks & Starters',
                                                'Snacks & Starters': 'Snacks & Starters',
                                                'Chinese Course': 'Chinese',
                                                'Chinese': 'Chinese',
                                                'Italian Course': 'Pizza & Pasta',
                                                'Pizza': 'Pizza & Pasta',
                                                'Pizza & Pasta': 'Pizza & Pasta',
                                                'Salads': 'Soups & Salads',
                                                'Soups': 'Soups & Salads',
                                                'Soups & Salads': 'Soups & Salads',
                                                'Vegetable & Dishes': 'Main Course (Vegetarian)',
                                                'Main Course (Vegetarian)': 'Main Course (Vegetarian)',
                                                'Non-Veg': 'Main Course (Non-Vegetarian)',
                                                'Main Course (Non-Vegetarian)': 'Main Course (Non-Vegetarian)',
                                                'Rice, Pulao, Biryani': 'Rice & Biryani',
                                                'Rice & Biryani': 'Rice & Biryani',
                                                'Toasts': 'Toasts',
                                                'Cereals': 'Cereals',
                                                'Pancakes': 'Pancakes',
                                                'Sandwiches': 'Sandwiches',
                                                'Desserts': 'Desserts',
                                                'Cold Beverages & Shakes': 'Cold Beverages & Shakes',
                                                'Breakfast': 'Breakfast'
                                            };

                                            const PREFERRED_ORDER = [
                                                'Breakfast',
                                                'Tea & Coffee',
                                                'Toasts',
                                                'Cereals',
                                                'Omelets & Egg Dishes',
                                                'Main Course (Vegetarian)',
                                                'Main Course (Non-Vegetarian)',
                                                'Indian Tawa/Tandoori Roti',
                                                'Snacks & Starters',
                                                'Chinese',
                                                'Pancakes',
                                                'Pizza & Pasta',
                                                'Rice & Biryani',
                                                'Sandwiches',
                                                'Desserts',
                                                'Soups & Salads',
                                                'Cold Beverages & Shakes'
                                            ];

                                            // 2. Group Items by Category
                                            const groupedMenu: Record<string, any[]> = {};

                                            // Initialize preferred groups
                                            PREFERRED_ORDER.forEach(c => groupedMenu[c] = []);

                                            menu.forEach(item => {
                                                const rawCat = item.category?.trim();
                                                let displayCat = CATEGORY_MAPPING[rawCat] || rawCat;

                                                // Clean Description
                                                if (item.description) {
                                                    const desc = item.description.toLowerCase();
                                                    if (desc.includes('delicious') && desc.includes('item')) {
                                                        item.description = '';
                                                    }
                                                }

                                                // Fallback fuzzy match if exact match not found
                                                if (!groupedMenu[displayCat]) {
                                                    const fuzzy = PREFERRED_ORDER.find(p => p.includes(displayCat) || displayCat.includes(p));
                                                    if (fuzzy) displayCat = fuzzy;
                                                    else {
                                                        if (!groupedMenu[displayCat]) groupedMenu[displayCat] = [];
                                                    }
                                                }
                                                groupedMenu[displayCat].push(item);
                                            });

                                            // Sort items within categories with strictly correct 0 handling
                                            Object.keys(groupedMenu).forEach(key => {
                                                groupedMenu[key].sort((a, b) => {
                                                    const orderA = (a.sortOrder !== undefined && a.sortOrder !== null) ? a.sortOrder : 999;
                                                    const orderB = (b.sortOrder !== undefined && b.sortOrder !== null) ? b.sortOrder : 999;
                                                    return orderA - orderB;
                                                });
                                            });

                                            printWindow.document.write(`
                                                <html>
                                                <head>
                                                    <title>TashiZom Menu</title>
                                                    <style>
                                                        @page { size: A4; margin: 15mm; }
                                                        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; color: #000; font-size: 13px; line-height: 1.5; }
                                                        h1 { text-align: center; font-size: 28px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
                                                        .subtitle { text-align: center; font-size: 12px; color: #444; margin-bottom: 25px; letter-spacing: 3px; text-transform: uppercase; }
                                                        
                                                        .category-section { margin-bottom: 25px; break-inside: auto; }
                                                        .category-title { 
                                                            font-size: 18px; font-weight: 800; border-bottom: 2px solid #000; 
                                                            padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; 
                                                            letter-spacing: 1px; page-break-after: avoid; 
                                                        }

                                                        table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
                                                        thead { display: table-header-group; }
                                                        tr { break-inside: avoid; page-break-inside: avoid; }
                                                        
                                                        td { border-bottom: 1px solid #ddd; padding: 8px 4px; vertical-align: top; }
                                                        th { text-align: left; border-bottom: 2px solid #666; padding: 6px 4px; font-size: 11px; text-transform: uppercase; background: #fff; font-weight: bold; }
                                                        
                                                        .price { font-weight: bold; text-align: right; white-space: nowrap; font-size: 14px; }
                                                        .desc { font-size: 11px; color: #555; font-style: italic; margin-top: 2px; }
                                                        .item-name { font-weight: bold; font-size: 14px; }
                                                        
                                                        .veg { color: green; font-weight: bold; font-size: 10px; border: 1px solid green; padding: 1px 3px; border-radius: 3px; }
                                                        .non-veg { color: red; font-weight: bold; font-size: 10px; border: 1px solid red; padding: 1px 3px; border-radius: 3px; }
                                                    </style>
                                                </head>
                                                <body>
                                                    <h1>TashiZom</h1>
                                                    <p class="subtitle">KIBBER • SPITI VALLEY</p>
                                                    
                                                    ${PREFERRED_ORDER.map(cat => {
                                                const items = groupedMenu[cat];
                                                if (!items || items.length === 0) return '';

                                                const HIDE_TYPE_FOR = [
                                                    'Tea & Coffee',
                                                    'Cold Beverages & Shakes',
                                                    'Indian Tawa/Tandoori Roti',
                                                    'Cereals',
                                                    'Toasts'
                                                ];
                                                const hideType = HIDE_TYPE_FOR.includes(cat);

                                                return `
                                                        <div class="category-section">
                                                            <div class="category-title">${cat}</div>
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th style="width: ${hideType ? '85%' : '50%'}">Item</th>
                                                                        ${!hideType ? '<th style="width: 15%; text-align: center;">Type</th>' : ''}
                                                                        <th style="width: 15%; text-align: right;">Price</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    ${items.map(item => `
                                                                        <tr>
                                                                            <td>
                                                                                <div class="item-name">${item.name}</div>
                                                                                <div class="desc">${item.description || ''}</div>
                                                                            </td>
                                                                            ${!hideType ? `
                                                                            <td style="text-align: center;">
                                                                                <span class="${item.isVegetarian ? 'veg' : 'non-veg'}">
                                                                                    ${item.isVegetarian ? 'VEG' : 'NON-VEG'}
                                                                                </span>
                                                                            </td>` : ''}
                                                                            <td class="price">₹${item.price}</td>
                                                                        </tr>
                                                                    `).join('')}
                                                                </tbody>
                                                            </table>
                                                        </div>`;
                                            }).join('')}

                                                    ${Object.keys(groupedMenu).filter(k => !PREFERRED_ORDER.includes(k) && groupedMenu[k].length > 0).map(cat => {
                                                const hideType = ['Tea & Coffee', 'Cold Beverages & Shakes'].includes(cat);
                                                return `
                                                        <div class="category-section">
                                                            <div class="category-title">${cat}</div>
                                                             <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th style="width: ${hideType ? '85%' : '50%'}">Item</th>
                                                                        ${!hideType ? '<th style="width: 15%; text-align: center;">Type</th>' : ''}
                                                                        <th style="width: 15%; text-align: right;">Price</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    ${groupedMenu[cat].map(item => `
                                                                        <tr>
                                                                            <td>
                                                                                <div class="item-name">${item.name}</div>
                                                                                <div class="desc">${item.description || ''}</div>
                                                                            </td>
                                                                            ${!hideType ? `
                                                                            <td style="text-align: center;">
                                                                                <span class="${item.isVegetarian ? 'veg' : 'non-veg'}">
                                                                                    ${item.isVegetarian ? 'VEG' : 'NON-VEG'}
                                                                                </span>
                                                                            </td>` : ''}
                                                                            <td class="price">₹${item.price}</td>
                                                                        </tr>
                                                                    `).join('')}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    `}).join('')}

                                                    <script>
                                                        window.onload = function() { setTimeout(function(){ window.print(); }, 500); }
                                                    </script>
                                                </body>
                                                </html>
                                            `);
                                            printWindow.document.close();
                                        }}
                                        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors text-xs sm:text-sm border border-gray-300 shadow-sm"
                                    >
                                        <Printer size={16} /> Print Full Menu
                                    </button>
                                </div>

                                {/* Category Management */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Manage Categories</h3>
                                            <p className="text-xs text-gray-500 mt-1">Categories are created automatically when you add an item to them.</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const cat = prompt("Enter name for new category:");
                                                if (cat) {
                                                    const form = document.querySelector('form') as HTMLFormElement; // refined selector if needed
                                                    if (form) {
                                                        const catInput = form.elements.namedItem('category') as HTMLInputElement;
                                                        const nameInput = form.elements.namedItem('name') as HTMLInputElement;
                                                        if (catInput) catInput.value = cat;
                                                        if (nameInput) nameInput.focus();
                                                        alert(`Category "${cat}" selected! Now add the first item below to create it.`);
                                                        form.scrollIntoView({ behavior: 'smooth' });
                                                    }
                                                }
                                            }}
                                            className="text-xs bg-tashi-accent text-tashi-dark font-bold px-3 py-2 rounded hover:bg-yellow-400 flex items-center gap-2"
                                        >
                                            <Plus size={14} /> Create Category
                                        </button>
                                    </div>
                                    <div className="mb-4">
                                        <SortableCategoryList
                                            categories={(Array.from(new Set(menu.map(i => i.category))) as string[]).sort((a, b) => {
                                                const idxA = categoryOrder.indexOf(a);
                                                const idxB = categoryOrder.indexOf(b);
                                                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                                                if (idxA !== -1) return -1;
                                                if (idxB !== -1) return 1;
                                                return a.localeCompare(b);
                                            })}
                                            onReorder={(newOrder) => {
                                                useStore.getState().updateCategoryOrder(newOrder);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Add Item</h3>
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            const form = e.target as HTMLFormElement;
                                            const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;

                                            try {
                                                if (submitBtn) {
                                                    submitBtn.disabled = true;
                                                    submitBtn.textContent = 'Adding...';
                                                }

                                                const formData = new FormData(form);
                                                const priceRaw = formData.get('price');
                                                const price = priceRaw ? Number(priceRaw) : 0;

                                                // Handle Empty Image URL
                                                // Handle Image URL - ONLY add if present
                                                const rawImage = formData.get('image') as string;
                                                const image = rawImage && rawImage.trim() !== '' ? rawImage.trim() : null;

                                                const newItem: any = {
                                                    name: (formData.get('name') as string) || 'Unnamed Item',
                                                    description: (formData.get('description') as string) || '',
                                                    price: price,
                                                    category: (formData.get('category') as any) || 'Main Course',
                                                    isVegetarian: formData.get('isVegetarian') === 'on',
                                                    isSpicy: formData.get('isSpicy') === 'on',
                                                    isChefSpecial: formData.get('isChefSpecial') === 'on',
                                                    available: true
                                                };

                                                if (image) {
                                                    newItem.image = image;
                                                }


                                                await useStore.getState().addMenuItem(newItem);

                                                form.reset();
                                                alert("Item added successfully!");
                                            } catch (err: any) {
                                                console.error("Add item failed:", err);
                                                alert("Failed to add item. Error: " + err.message);
                                            } finally {
                                                if (submitBtn) {
                                                    submitBtn.disabled = false;
                                                    submitBtn.textContent = 'Add Item';
                                                }
                                            }
                                        }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                                    >
                                        <input name="name" required placeholder="Name" className="bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-tashi-accent outline-none" />
                                        <input name="price" type="number" required placeholder="Price" className="bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-tashi-accent outline-none" />
                                        <input list="category-list" name="category" required placeholder="Category" className="bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-tashi-accent outline-none" />
                                        <datalist id="category-list">
                                            {Array.from(new Set(menu.map(i => i.category))).map(c => (
                                                <option key={c} value={c} />
                                            ))}
                                            <option value="Soups & Salads" />
                                            <option value="Snacks & Starters" />
                                            <option value="Main Course (Vegetarian)" />
                                            <option value="Main Course (Non-Vegetarian)" />
                                            <option value="Rice & Biryani" />
                                            <option value="Indian Breads" />
                                            <option value="Chinese" />
                                            <option value="Pizza & Pasta" />
                                            <option value="Beverages & Shakes" />
                                            <option value="Desserts" />
                                        </datalist>
                                        <div className="flex gap-4 items-center">
                                            <label className="flex items-center gap-2 text-gray-700 text-sm"><input name="isVegetarian" type="checkbox" className="accent-green-500" /> Veg</label>
                                            <label className="flex items-center gap-2 text-gray-700 text-sm"><input name="isSpicy" type="checkbox" className="accent-red-500" /> Spicy</label>
                                            <label className="flex items-center gap-2 text-gray-700 text-sm"><input name="isChefSpecial" type="checkbox" className="accent-yellow-500" /> Chef's Special</label>
                                        </div>
                                        <div className="md:col-span-3">
                                            <div className="flex gap-2">
                                                <input name="image" id="add-item-image-url" placeholder="Paste Image Link (URL)..." className="flex-1 bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-tashi-accent outline-none" />
                                                <label className="cursor-pointer bg-white hover:bg-gray-100 text-gray-600 rounded-lg px-4 flex items-center justify-center transition-colors border border-gray-300">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                if (confirm(`Upload ${file.name}?`)) {
                                                                    try {
                                                                        const url = await useStore.getState().uploadImage(file, true);
                                                                        const input = document.getElementById('add-item-image-url') as HTMLInputElement;
                                                                        if (input) input.value = url;
                                                                    } catch (err) {
                                                                        alert('Upload failed');
                                                                        console.error(err);
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <Upload size={20} />
                                                </label>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1">Paste a link or click the icon to upload.</p>
                                        </div>
                                        <input name="description" required placeholder="Description" className="md:col-span-4 bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-tashi-accent outline-none" />
                                        <button type="submit" className="md:col-span-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg">Add Item</button>
                                    </form>
                                </div>

                                {/* Search and Filter Section */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="🔍 Search menu items by name..."
                                            value={menuSearchQuery}
                                            onChange={(e) => setMenuSearchQuery(e.target.value)}
                                            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 pl-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-tashi-accent transition-colors"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                                        {menuSearchQuery && (
                                            <button
                                                onClick={() => setMenuSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Category Filter Tabs */}
                                    <div className="flex flex-wrap gap-2">
                                        {['All', ...Array.from(new Set(menu.map(i => i.category))).sort()].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setMenuCategoryFilter(cat)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${menuCategoryFilter === cat
                                                    ? 'bg-tashi-accent text-tashi-dark shadow-lg'
                                                    : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                                                    }`}
                                            >
                                                {cat}
                                                {cat !== 'All' && (
                                                    <span className="ml-2 text-xs opacity-60">
                                                        ({menu.filter(i => i.category === cat).length})
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Results Count */}
                                    <div className="text-sm text-gray-400 flex items-center justify-between">
                                        <span>
                                            Showing {menu.filter(item => {
                                                const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase());
                                                const matchesCategory = menuCategoryFilter === 'All' || item.category === menuCategoryFilter;
                                                return matchesSearch && matchesCategory;
                                            }).length} of {menu.length} items
                                        </span>
                                        {(menuSearchQuery || menuCategoryFilter !== 'All') && (
                                            <button
                                                onClick={() => {
                                                    setMenuSearchQuery('');
                                                    setMenuCategoryFilter('All');
                                                }}
                                                className="text-xs text-tashi-accent hover:text-yellow-400 font-bold"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Menu Items List - Drag and Drop */}
                                <SortableMenuList
                                    items={menu
                                        .filter(item => {
                                            const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase());
                                            const matchesCategory = menuCategoryFilter === 'All' || item.category === menuCategoryFilter;
                                            return matchesSearch && matchesCategory;
                                        })
                                        .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))}
                                    onReorder={(newItems) => {
                                        useStore.getState().reorderMenuItems(newItems);
                                    }}
                                    onEdit={setEditingItem}
                                />

                                {/* GALLERY PICKER MODAL */}
                                {
                                    showGalleryPicker && (
                                        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                                            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                                                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                                    <h3 className="font-bold text-gray-800">Select Image</h3>
                                                    <button onClick={() => setShowGalleryPicker(false)} className="p-2 hover:bg-gray-200 rounded-full">
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                                <div className="flex-1 overflow-auto p-6 space-y-8">
                                                    {/* Local Gallery */}
                                                    <section>
                                                        <h4 className="font-bold text-gray-500 uppercase text-xs mb-4 sticky top-0 bg-white z-10 py-2">Local Gallery</h4>
                                                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                                            {localGallery.map((file, idx) => (
                                                                <div
                                                                    key={`local-${idx}`}
                                                                    className="group relative aspect-square border-2 border-transparent hover:border-tashi-primary rounded-lg overflow-hidden bg-gray-100 text-left transition-all"
                                                                >
                                                                    <img src={file.path} alt={file.name} className="w-full h-full object-cover" />

                                                                    {/* Select Overlay */}
                                                                    <div
                                                                        onClick={() => {
                                                                            const input = document.getElementById('edit-item-image-url') as HTMLInputElement;
                                                                            if (input) {
                                                                                input.value = file.path;
                                                                                const event = new Event('input', { bubbles: true });
                                                                                input.dispatchEvent(event);
                                                                            }
                                                                            setShowGalleryPicker(false);
                                                                        }}
                                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                                                                    >
                                                                        Select
                                                                    </div>

                                                                    {/* Delete Button */}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteLocal(file.path);
                                                                        }}
                                                                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20"
                                                                        title="Delete File"
                                                                    >
                                                                        <Trash size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </section>

                                                    {/* Firebase Gallery */}
                                                    <section>
                                                        <h4 className="font-bold text-gray-500 uppercase text-xs mb-4 sticky top-0 bg-white z-10 py-2">Uploaded Media</h4>
                                                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                                            {media?.map((item) => (
                                                                <button
                                                                    key={item.id}
                                                                    onClick={() => {
                                                                        const input = document.getElementById('edit-item-image-url') as HTMLInputElement;
                                                                        if (input) {
                                                                            input.value = item.url;
                                                                            const event = new Event('input', { bubbles: true });
                                                                            input.dispatchEvent(event);
                                                                        }
                                                                        setShowGalleryPicker(false);
                                                                    }}
                                                                    className="group relative aspect-square border-2 border-transparent hover:border-tashi-primary rounded-lg overflow-hidden bg-gray-100 text-left transition-all"
                                                                >
                                                                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                                                        Select
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </section>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div >

                            {/* EDIT ITEM MODAL */}
                            {
                                editingItem && (
                                    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                                        <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
                                            <button
                                                onClick={() => setEditingItem(null)}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={24} />
                                            </button>

                                            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Item</h2>

                                            <form
                                                onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    const form = e.target as HTMLFormElement;
                                                    const formData = new FormData(form);

                                                    const updates: any = {
                                                        name: formData.get('name'),
                                                        price: Number(formData.get('price')),
                                                        category: formData.get('category'),
                                                        description: formData.get('description'),
                                                        image: formData.get('image'),
                                                        isVegetarian: formData.get('isVegetarian') === 'on',
                                                        isSpicy: formData.get('isSpicy') === 'on',
                                                        isChefSpecial: formData.get('isChefSpecial') === 'on',
                                                    };

                                                    await useStore.getState().updateMenuItem(editingItem.id, updates);
                                                    setEditingItem(null);
                                                    alert('Item updated successfully!');
                                                }}
                                                className="space-y-4"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Name</label>
                                                        <input name="name" defaultValue={editingItem.name} required className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-tashi-accent outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Price</label>
                                                        <input name="price" type="number" defaultValue={editingItem.price} required className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-tashi-accent outline-none" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Category</label>
                                                    <input list="category-list-edit" name="category" defaultValue={editingItem.category} required className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-tashi-accent outline-none" />
                                                    <datalist id="category-list-edit">
                                                        {Array.from(new Set(menu.map(i => i.category))).map(c => (
                                                            <option key={c} value={c} />
                                                        ))}
                                                    </datalist>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Image URL</label>
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex gap-2">
                                                            <div className="flex-1 relative">
                                                                <input
                                                                    name="image"
                                                                    id="edit-item-image-url"
                                                                    defaultValue={editingItem.image}
                                                                    placeholder="Paste URL or Select..."
                                                                    className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-tashi-accent outline-none pr-10"
                                                                    onChange={(e) => {
                                                                        // Update preview state locally if possible, or just rely on the img tag using the input value if we controlled it.
                                                                        // Since it's uncontrolled, we use a simple ref-like approach for preview.
                                                                        const img = document.getElementById('edit-item-preview') as HTMLImageElement;
                                                                        if (img) img.src = e.target.value;
                                                                    }}
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowGalleryPicker(true)}
                                                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 rounded-lg font-bold text-sm border border-gray-300 transition-colors flex items-center gap-2"
                                                            >
                                                                <ImageIcon size={16} /> Gallery
                                                            </button>
                                                            <label className="cursor-pointer bg-white hover:bg-gray-100 text-gray-600 rounded-lg px-4 flex items-center justify-center transition-colors border border-gray-300">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            if (confirm(`Upload ${file.name}?`)) {
                                                                                try {
                                                                                    const url = await useStore.getState().uploadImage(file, true);
                                                                                    const input = document.getElementById('edit-item-image-url') as HTMLInputElement;
                                                                                    const img = document.getElementById('edit-item-preview') as HTMLImageElement;
                                                                                    if (input) {
                                                                                        input.value = url;
                                                                                        // Dispatch input event for any listeners
                                                                                        input.dispatchEvent(new Event('input', { bubbles: true }));
                                                                                    }
                                                                                    if (img) img.src = url;
                                                                                } catch (err) {
                                                                                    alert('Upload failed');
                                                                                    console.error(err);
                                                                                }
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                                <Upload size={20} />
                                                            </label>
                                                        </div>

                                                        {/* Image Preview */}
                                                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 flex items-center gap-4">
                                                            <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden relative border border-gray-300 shrink-0">
                                                                <img
                                                                    id="edit-item-preview"
                                                                    src={editingItem.image || '/images/placeholders/default.png'}
                                                                    alt="Preview"
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                                        (e.target as HTMLImageElement).parentElement!.classList.add('bg-red-50');
                                                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-red-400 text-xs flex items-center justify-center h-full w-full">Error</span>';
                                                                    }}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                Current Preview. <span className="text-gray-400">(If blank, URL is invalid)</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                                    <textarea name="description" defaultValue={editingItem.description} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-tashi-accent outline-none min-h-[80px]" />
                                                </div>

                                                <div className="flex gap-6 p-2 bg-white/5 rounded-lg">
                                                    <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                                                        <input name="isVegetarian" type="checkbox" defaultChecked={editingItem.isVegetarian} className="w-5 h-5 accent-green-500" />
                                                        <span>Vegetarian</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                                                        <input name="isSpicy" type="checkbox" defaultChecked={editingItem.isSpicy} className="w-5 h-5 accent-red-500" />
                                                        <span>Spicy</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                                                        <input name="isChefSpecial" type="checkbox" defaultChecked={editingItem.isChefSpecial} className="w-5 h-5 accent-yellow-500" />
                                                        <span>Chef's Special</span>
                                                    </label>
                                                </div>

                                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                                    <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">Cancel</button>
                                                    <button type="submit" className="px-6 py-2 rounded-lg bg-tashi-primary hover:bg-red-600 text-white font-bold transition-colors shadow-lg shadow-red-500/20">Save Changes</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )
                            }
                        </motion.div >
                    )
                    }
                </AnimatePresence >
            </div >
        </div >
    );
}

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

function GearManagementView() {
    const { gearItems, addGearItem, updateGearItem, removeGearItem, reorderGearItems } = useStore();
    const [isAdding, setIsAdding] = useState(false);
    const [editingGear, setEditingGear] = useState<any>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const itemData = {
            name: formData.get('name') as string,
            price: parseFloat(formData.get('price') as string),
            badge: formData.get('badge') as string,
            available: formData.get('available') === 'on',
            items: [
                {
                    url: formData.get('img0_url') as string || '/images/placeholders/gear-product.png',
                    label: 'Product View',
                    details: formData.get('img0_details') as string || 'Hand-knitted in Kibber'
                },
                {
                    url: formData.get('img1_url') as string || '/images/placeholders/gear-lifestyle-1.png',
                    label: formData.get('img1_label') as string || 'Lifestyle View',
                    details: 'Worn by local artisan',
                    worn: true
                },
                {
                    url: formData.get('img2_url') as string || '/images/placeholders/gear-lifestyle-2.png',
                    label: formData.get('img2_label') as string || 'Fashion Shot',
                    details: 'Premium Spitian Wool',
                    worn: true
                }
            ]
        };

        if (editingGear) {
            await updateGearItem(editingGear.id, itemData);
            setEditingGear(null);
        } else {
            await addGearItem(itemData);
            setIsAdding(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-serif">Cold Weather Gears</h2>
                    <p className="text-gray-500 text-sm">Manage items in the 'Cold Weather Gear' carousel</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-tashi-primary hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
                >
                    <Plus size={20} /> Add Item
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gearItems.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                        <div className="aspect-[4/5] bg-gray-100 relative">
                            <img src={item.items[0]?.url} className="w-full h-full object-cover" alt={item.name} />
                            {!item.available && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                    <span className="bg-red-500 text-white font-bold py-1 px-4 rounded-full text-sm">OUT OF STOCK</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <span className="bg-tashi-accent text-tashi-dark text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                                    {item.badge}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                <span className="text-tashi-primary font-bold">₹{item.price}</span>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setEditingGear(item)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Pencil size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => { if (confirm('Delete this gear item?')) removeGearItem(item.id); }}
                                    className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {gearItems.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-300 rounded-2xl">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No gear items yet.</p>
                        <button onClick={() => setIsAdding(true)} className="text-tashi-primary font-bold mt-2">Add your first item</button>
                    </div>
                )}
            </div>

            {/* ADD/EDIT MODAL */}
            {(isAdding || editingGear) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => { setIsAdding(false); setEditingGear(null); }}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="relative bg-white border border-gray-200 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                        <form onSubmit={handleSave} className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 font-serif">
                                    {editingGear ? 'Edit Gear Item' : 'Add New Local Gear'}
                                </h2>
                                <button type="button" onClick={() => { setIsAdding(false); setEditingGear(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                                        <input name="name" required defaultValue={editingGear?.name} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-tashi-accent outline-none" placeholder="e.g. Spitian Ear Warmer" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Price (₹)</label>
                                        <input name="price" type="number" required defaultValue={editingGear?.price} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-tashi-accent outline-none" placeholder="e.g. 450" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Badge / Material</label>
                                        <input name="badge" defaultValue={editingGear?.badge} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-tashi-accent outline-none" placeholder="e.g. 100% Pure Wool" />
                                    </div>
                                    <div className="flex items-center gap-2 pt-6">
                                        <input name="available" type="checkbox" defaultChecked={editingGear ? editingGear.available : true} className="w-6 h-6 accent-green-500" />
                                        <span className="font-bold text-gray-700">In Stock</span>
                                    </div>
                                </div>

                                <div className="space-y-4 border-t border-gray-100 pt-6">
                                    <h3 className="font-bold text-gray-900">Carousel Frames (3 Recommended)</h3>

                                    {/* Frame 1: Product */}
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Frame 1 (Product Shot)</span>
                                        </div>
                                        <input name="img0_url" defaultValue={editingGear?.items[0]?.url} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-tashi-accent outline-none" placeholder="Image URL (Clean background preferred)" />
                                        <input name="img0_details" defaultValue={editingGear?.items[0]?.details} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-tashi-accent outline-none" placeholder="Details (e.g. Hand-knitted in Kibber)" />
                                    </div>

                                    {/* Frame 2: Lifestyle 1 */}
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Frame 2 (Lifestyle - Man)</span>
                                            <input name="img1_label" defaultValue={editingGear?.items[1]?.label || 'Local Man Lifestyle'} className="bg-transparent text-right text-xs font-bold text-tashi-primary focus:outline-none" placeholder="Label" />
                                        </div>
                                        <input name="img1_url" defaultValue={editingGear?.items[1]?.url} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-tashi-accent outline-none" placeholder="Image URL (Man facing left)" />
                                    </div>

                                    {/* Frame 3: Lifestyle 2 */}
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Frame 3 (Lifestyle - Lady)</span>
                                            <input name="img2_label" defaultValue={editingGear?.items[2]?.label || 'Local Lady Lifestyle'} className="bg-transparent text-right text-xs font-bold text-tashi-primary focus:outline-none" placeholder="Label" />
                                        </div>
                                        <input name="img2_url" defaultValue={editingGear?.items[2]?.url} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-tashi-accent outline-none" placeholder="Image URL (Fashion shot)" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => { setIsAdding(false); setEditingGear(null); }} className="px-6 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">Cancel</button>
                                <button type="submit" className="px-8 py-2 rounded-xl bg-tashi-primary text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                                    {editingGear ? 'Update Item' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}

function ReviewsView() {
    const reviews = useStore((state) => state.reviews);
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Google Maps Link Card */}
                <div className="bg-gradient-to-br from-blue-900/40 to-black p-8 rounded-3xl border border-blue-500/30 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500 rounded-xl text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Google Maps Reviews</h2>
                        </div>
                        <p className="text-blue-200 mb-8 max-w-sm">
                            Manage and view your public reputation directly on Google Maps. All historical reviews are available there.
                        </p>
                        <a
                            href="https://www.google.com/maps/place/Tashizom/@32.2276,77.9975,17z" // Approximate location or search query
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                            Open Google Maps Profile <ArrowRight size={18} />
                        </a>
                    </div>
                </div>

                {/* Internal Rating Stats */}
                <div className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col justify-center items-center shadow-sm">
                    <h3 className="text-gray-500 font-medium uppercase tracking-widest mb-2">In-App Customer Rating</h3>
                    <div className="text-7xl font-bold text-gray-900 mb-2">{averageRating}</div>
                    <div className="flex gap-1 text-yellow-400 mb-4">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={24} fill={s <= Math.round(Number(averageRating)) ? "currentColor" : "none"} strokeWidth={s <= Math.round(Number(averageRating)) ? 0 : 2} />
                        ))}
                    </div>
                    <p className="text-gray-500 text-sm">Based on {reviews.length} feedback submissions</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Feedback</h3>
                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No in-app reviews yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((review) => (
                            <div key={review.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{review.customerName}</h4>
                                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-0.5 text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}



function StatCard({ title, value, icon, subtext }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between hover:border-gray-300 transition-colors shadow-sm">
            <div>
                <p className="text-gray-500 text-sm mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
                {icon}
            </div>
        </div>
    );
}

// Minimal Trash Icon
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>;

// Analytics Component
function AnalyticsView({ orders, menu }: { orders: Order[], menu: any[] }) {
    // 1. Top Selling Items
    const itemCounts: Record<string, number> = {};
    orders.forEach(o => {
        o.items.forEach(i => {
            itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
        });
    });

    const topItems = Object.entries(itemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // 2. Hourly Sales (Simple approximation)
    const hours = Array(24).fill(0);
    orders.forEach(o => {
        const h = new Date(o.createdAt).getHours();
        hours[h] += o.totalAmount;
    });

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
                        const max = Math.max(...hours, 1);
                        const height = (val / max) * 100;
                        if (idx < 10 || idx > 23) return null; // Show 10 AM to 11 PM range approx
                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                <div
                                    className="w-full bg-blue-500/50 hover:bg-blue-500 transition-all rounded-t"
                                    style={{ height: `${height}%` }}
                                />
                                <span className="text-[10px] text-gray-400 font-mono">{idx}h</span>
                                <div className="opacity-0 group-hover:opacity-100 absolute -mt-8 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none">
                                    ₹{val}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Customer Feedback</h3>
                {useStore.getState().reviews.length === 0 ? (
                    <p className="text-gray-500 italic">No reviews yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {useStore.getState().reviews.slice(0, 6).map((review) => (
                            <div key={review.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900">{review.customerName}</span>
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-500 text-sm italic">"{review.comment}"</p>
                                <p className="text-xs text-gray-400 mt-2 text-right">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Custom KOT Printing Logic (Mobile-friendly, stays on screen)
const handlePrintKOT = (order: any) => {
    const printWindow = window.open('', '_blank', 'width=500,height=800');
    if (!printWindow) return;

    const tables = useStore.getState().tables;
    const matchedTable = tables.find((t: any) => t.id === order.tableId || t.name === order.tableId);
    const tableName = matchedTable ? matchedTable.name : 'Remote Order';

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>KOT #${order.id.slice(0, 6)}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: 'Arial', 'Helvetica', sans-serif; 
                    background: #f5f5f5;
                    color: #000;
                    font-size: 16px;
                    line-height: 1.6;
                    padding: 0;
                    margin: 0;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    background: white;
                    min-height: 100vh;
                    padding: 0;
                }
                .content {
                    padding: 20px;
                    padding-bottom: 100px; /* Space for fixed buttons */
                }
                .header { 
                    text-align: center; 
                    background: #ff6b00;
                    color: white;
                    padding: 20px; 
                    margin-bottom: 20px;
                }
                .header h2 { 
                    font-size: 16px; 
                    font-weight: 600;
                    margin-bottom: 8px;
                    letter-spacing: 2px;
                }
                .header h1 { 
                    font-size: 32px; 
                    font-weight: 900;
                    margin: 0;
                }
                .meta { 
                    font-size: 18px; 
                    margin-bottom: 25px; 
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    border: 2px solid #e9ecef;
                }
                .meta-row { 
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px dashed #dee2e6;
                }
                .meta-row:last-child {
                    border-bottom: none;
                }
                .meta-label { 
                    font-weight: 700; 
                    color: #495057;
                }
                .meta-value {
                    font-weight: 600;
                    color: #212529;
                }
                .section-title {
                    font-size: 20px;
                    font-weight: 800;
                    margin: 25px 0 15px;
                    padding-bottom: 10px;
                    border-bottom: 3px solid #ff6b00;
                    color: #212529;
                }
                .items { 
                    margin: 20px 0;
                }
                .item { 
                    display: flex; 
                    align-items: center;
                    padding: 15px; 
                    margin-bottom: 10px;
                    background: #fff;
                    border: 2px solid #e9ecef;
                    border-radius: 10px;
                    font-size: 18px;
                }
                .item-qty { 
                    background: #ff6b00;
                    color: white;
                    font-size: 22px; 
                    font-weight: 900; 
                    min-width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    margin-right: 15px;
                    flex-shrink: 0;
                }
                .item-name {
                    font-size: 20px;
                    font-weight: 600;
                    color: #212529;
                    flex: 1;
                }
                .summary { 
                    margin-top: 30px; 
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    border: 2px solid #ff6b00;
                    text-align: center;
                }
                .summary-item {
                    font-size: 18px;
                    font-weight: 700;
                    padding: 8px 0;
                    color: #495057;
                }
                .button-container {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    padding: 15px;
                    box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
                    display: flex;
                    gap: 10px;
                    max-width: 500px;
                    margin: 0 auto;
                    z-index: 1000;
                }
                .btn {
                    flex: 1;
                    padding: 16px;
                    border: none;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-print {
                    background: #ff6b00;
                    color: white;
                }
                .btn-close {
                    background: #6c757d;
                    color: white;
                }
                .btn:active {
                    transform: scale(0.98);
                }

                @media print {
                    body { background: white; }
                    .button-container { display: none; }
                    .content { padding-bottom: 20px; }
                    .container { background: white; }
                }

                @media (max-width: 480px) {
                    .header h1 { font-size: 28px; }
                    .item { font-size: 16px; }
                    .item-name { font-size: 18px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <div class="header">
                        <h2>KITCHEN ORDER TICKET</h2>
                        <h1>KOT #${order.id.slice(0, 6)}</h1>
                    </div>
                    
                    <div class="meta">
                        <div class="meta-row">
                            <span class="meta-label">TABLE:</span>
                            <span class="meta-value">${tableName}</span>
                        </div>
                        ${order.customerName ? `
                        <div class="meta-row">
                            <span class="meta-label">CUSTOMER:</span>
                            <span class="meta-value">${order.customerName}</span>
                        </div>` : ''}
                        ${order.customerPhone ? `
                        <div class="meta-row">
                            <span class="meta-label">PHONE:</span>
                            <span class="meta-value">${order.customerPhone}</span>
                        </div>` : ''}
                        <div class="meta-row">
                            <span class="meta-label">TIME:</span>
                            <span class="meta-value">${new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">DATE:</span>
                            <span class="meta-value">${new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                    </div>
                    
                    <h3 class="section-title">🍽️ ORDER ITEMS</h3>
                    <div class="items">
                        ${order.items.map((item: any) => `
                            <div class="item">
                                <div class="item-qty">${item.quantity}x</div><div class="item-name">${item.name}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="summary">
                        <div class="summary-item">Total Items: ${order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)}</div>
                        <div class="summary-item" style="color: #212529; font-size: 16px; margin-top: 10px;">
                            Printed: ${new Date().toLocaleTimeString('en-IN')}
                        </div>
                    </div>
                </div>

                <div class="button-container">
                    <button class="btn btn-print" onclick="window.print()">
                        🖨️ PRINT KOT
                    </button>
                    <button class="btn btn-close" onclick="window.close()">
                        ✖️ CLOSE
                    </button>
                </div>
            </div>
        </body>
    </html>
    `);
    printWindow.document.close();
};

const handlePrintBill = (order: any) => {
    const printWindow = window.open('', '_blank', 'width=500,height=900');
    if (!printWindow) return;

    const tables = useStore.getState().tables;
    const matchedTable = tables.find((t: any) => t.id === order.tableId || t.name === order.tableId);
    const tableName = matchedTable ? matchedTable.name : 'Remote Order';
    const contactInfo = useStore.getState().contactInfo;

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>Bill #${order.id.slice(0, 6)}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: 'Arial', 'Helvetica', sans-serif; 
                    background: #f5f5f5;
                    color: #000;
                    font-size: 16px;
                    padding: 0;
                    margin: 0;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    background: white;
                    min-height: 100vh;
                    padding: 0;
                }
                .content {
                    padding: 20px;
                    padding-bottom: 100px; /* Space for fixed buttons */
                }
                .header { 
                    text-align: center; 
                    background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
                    color: white;
                    padding: 25px 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .header h1 { 
                    font-size: 28px; 
                    font-weight: 900;
                    margin-bottom: 5px;
                    letter-spacing: 1px;
                }
                .header .subtitle {
                    font-size: 14px;
                    opacity: 0.95;
                    margin-bottom: 8px;
                }
                .header .location {
                    font-size: 13px;
                    opacity: 0.9;
                    font-style: italic;
                }
                .bill-tag {
                    background: white;
                    color: #DAA520;
                    display: inline-block;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 800;
                    margin-top: 12px;
                    font-size: 16px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .bill-info { 
                    margin: 20px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    border: 2px solid #e9ecef;
                }
                .bill-info-row { 
                    display: flex; 
                    justify-content: space-between; 
                    padding: 8px 0;
                    border-bottom: 1px dashed #dee2e6;
                }
                .bill-info-row:last-child {
                    border-bottom: none;
                }
                .bill-info-row strong {
                    color: #495057;
                    font-weight: 700;
                }
                .bill-info-row span {
                    color: #212529;
                    font-weight: 600;
                }
                .section-title {
                    font-size: 20px;
                    font-weight: 800;
                    margin: 25px 0 15px;
                    padding-bottom: 10px;
                    border-bottom: 3px solid #DAA520;
                    color: #212529;
                }
                .items { margin: 20px 0; }
                .items table { 
                    width: 100%; 
                    border-collapse: collapse;
                }
                .items th { 
                    background: #DAA520;
                    color: white;
                    padding: 12px 8px; 
                    text-align: left; 
                    font-size: 14px;
                    font-weight: 700;
                }
                .items th:nth-child(2),
                .items th:nth-child(3),
                .items th:nth-child(4) {
                    text-align: right;
                }
                .items td { 
                    padding: 12px 8px; 
                    border-bottom: 1px solid #e9ecef;
                    font-size: 15px;
                }
                .items td:nth-child(2),
                .items td:nth-child(3),
                .items td:nth-child(4) {
                    text-align: right;
                }
                .items tr:last-child td {
                    border-bottom: none;
                }
                .total-section { 
                    margin-top: 25px; 
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    border: 2px solid #DAA520;
                }
                .total-row { 
                    display: flex; 
                    justify-content: space-between; 
                    padding: 8px 0;
                    font-size: 16px;
                }
                .total-row.grand { 
                    font-size: 24px; 
                    font-weight: 900; 
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 2px dashed #DAA520;
                    color: #DAA520;
                }
                .footer { 
                    text-align: center; 
                    margin-top: 30px; 
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 12px;
                }
                .footer p {
                    font-size: 15px;
                    color: #495057;
                    margin: 5px 0;
                }
                .footer .thank-you {
                    font-size: 18px;
                    font-weight: 700;
                    color: #DAA520;
                    margin-bottom: 10px;
                }
                .footer .contact {
                    font-size: 13px;
                    color: #6c757d;
                    margin-top: 15px;
                }
                .button-container {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    padding: 15px;
                    box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
                    display: flex;
                    gap: 10px;
                    max-width: 500px;
                    margin: 0 auto;
                    z-index: 1000;
                }
                .btn {
                    flex: 1;
                    padding: 16px;
                    border: none;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-print {
                    background: #DAA520;
                    color: white;
                }
                .btn-close {
                    background: #6c757d;
                    color: white;
                }
                .btn:active {
                    transform: scale(0.98);
                }

                @media print {
                    body { background: white; }
                    .button-container { display: none; }
                    .content { padding-bottom: 20px; }
                    .container { background: white; }
                }

                @media (max-width: 480px) {
                    .header h1 { font-size: 24px; }
                    .total-row.grand { font-size: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <div class="header">
                        <h1>TashiZom</h1>
                        <div class="subtitle">Multi-Cuisine Restaurant</div>
                        <div class="location">📍 Kibber, Spiti Valley</div>
                        <div class="bill-tag">BILL #${order.id.slice(0, 6)}</div>
                    </div>
                    
                    <div class="bill-info">
                        <div class="bill-info-row">
                            <strong>Table:</strong>
                            <span>${tableName}</span>
                        </div>
                        ${order.customerName ? `
                        <div class="bill-info-row">
                            <strong>Customer:</strong>
                            <span>${order.customerName}</span>
                        </div>` : ''}
                        ${order.customerPhone ? `
                        <div class="bill-info-row">
                            <strong>Phone:</strong>
                            <span>${order.customerPhone}</span>
                        </div>` : ''}
                        <div class="bill-info-row">
                            <strong>Date:</strong>
                            <span>${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div class="bill-info-row">
                            <strong>Time:</strong>
                            <span>${new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div >
                    </div >
                    
                    <h3 class="section-title">📋 ORDER DETAILS</h3>
                    <div class="items">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map((item: any) => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>₹${item.price}</td>
                                        <td><strong>₹${item.price * item.quantity}</strong></td>
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
                        <p class="thank-you">🙏 Thank you for dining with us!</p>
                        <p>We hope to serve you again soon</p>
                        <p class="contact">📞 ${contactInfo?.phone || '+91 9876543210'}</p>
                        <p style="margin-top: 20px; font-size: 12px; color: #adb5bd;">
                            Generated: ${new Date().toLocaleString('en-IN')}
                        </p>
                    </div>
                </div >

    <div class="button-container">
        <button class="btn btn-print" onclick="window.print()">
            🖨️ PRINT BILL
        </button>
        <button class="btn btn-close" onclick="window.close()">
            ✖️ CLOSE
        </button>
    </div>
            </div >
        </body >
    </html >
    `);
    printWindow.document.close();
};

const DbStatusIndicator = () => {
    const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const check = async () => {
            try {
                // Try simple read operation (Checking Menu is public-safe)
                const q = query(collection(db, 'menu'), limit(1));
                await getDocs(q);
                setStatus('connected');
            } catch (e: any) {
                console.error("Health check failed", e);
                setStatus('error'); // Only show error if basic read fails
                setMsg(e.message);
            }
        };
        check();
    }, []);

    if (status === 'connected') return <div className="text-green-500 text-xs font-bold flex items-center gap-1">● DB Online</div>;
    if (status === 'error') return <div title={msg} className="text-red-500 text-xs font-bold flex items-center gap-1 cursor-help">● DB Error</div>;
    return <div className="text-yellow-500 text-xs font-bold flex items-center gap-1">● Checking DB...</div>;
};


function AdminOrderCard({ order }: { order: any }) {
    const tables = useStore((state) => state.tables);
    const updateOrderStatus = useStore((state) => state.updateOrderStatus);

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between mb-2">
                <div>
                    <h4 className="font-bold text-gray-900 text-lg">{tables.find(t => t.id === order.tableId)?.name || order.tableId}</h4>
                    {(order.customerName || order.customerPhone) && (
                        <p className="text-xs text-tashi-primary font-mono">
                            {order.customerName} {order.customerPhone && `• ${order.customerPhone} `}
                        </p>
                    )}
                </div>
                <StatusBadge status={order.status} />
            </div>
            <div className="space-y-1 mb-4 border-t border-gray-100 pt-2 mt-2">
                {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-gray-600 text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>₹{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <button onClick={() => handlePrintKOT(order)} className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded text-sm font-mono">🖨️ KOT</button>
                <button onClick={() => handlePrintBill(order)} className="flex-1 bg-tashi-accent hover:bg-yellow-400 text-tashi-dark font-bold py-2 rounded text-sm font-mono">🧾 Bill</button>
            </div>
            <div className="flex gap-2 mt-2">
                {order.status === 'Pending' && <button onClick={() => updateOrderStatus(order.id, 'Preparing')} className="flex-1 bg-blue-900/50 text-blue-200 py-1 rounded text-xs hover:bg-blue-900/80">Start Cooking</button>}
                {order.status === 'Preparing' && <button onClick={() => updateOrderStatus(order.id, 'Served')} className="flex-1 bg-green-900/50 text-green-200 py-1 rounded text-xs hover:bg-green-900/80">Mark Ready</button>}
                {order.status === 'Served' && <button onClick={() => updateOrderStatus(order.id, 'Paid')} className="flex-1 bg-gray-700 text-gray-300 py-1 rounded text-xs hover:bg-white hover:text-black">Close Order</button>}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors = {
        'Pending': 'bg-yellow-500/20 text-yellow-500',
        'Preparing': 'bg-blue-500/20 text-blue-500',
        'Served': 'bg-green-500/20 text-green-500',
        'Paid': 'bg-gray-500/20 text-gray-500',
    } as any;
    return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-500/20'} `}>{status}</span>;
}

// Drag and Drop Components
function SortableMenuList({ items, onReorder, onEdit }: { items: any[]; onReorder: (items: any[]) => void; onEdit: (item: any) => void }) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [localItems, setLocalItems] = useState(items);

    useEffect(() => {
        setLocalItems(items);
    }, [items]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragEndEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = localItems.findIndex((item) => item.id === active.id);
            const newIndex = localItems.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(localItems, oldIndex, newIndex);
            setLocalItems(newItems);
            onReorder(newItems);
        }

        setActiveId(null);
    };

    if (localItems.length === 0) {
        return (
            <div className="text-center py-12 bg-neutral-800/50 rounded-xl border border-dashed border-white/10">
                <p className="text-gray-500">No menu items found. Add some items or adjust your filters.</p>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {localItems.map((item) => (
                        <SortableMenuItem key={item.id} item={item} onEdit={onEdit} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

function SortableMenuItem({ item, onEdit }: { item: any; onEdit: (item: any) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between bg-white p-3 rounded-lg border ${isDragging ? 'border-tashi-primary shadow-lg' : 'border-gray-200 hover:border-gray-300'} `}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 p-2 -ml-2"
                title="Drag to reorder"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="7" cy="5" r="1.5" />
                    <circle cx="13" cy="5" r="1.5" />
                    <circle cx="7" cy="10" r="1.5" />
                    <circle cx="13" cy="10" r="1.5" />
                    <circle cx="7" cy="15" r="1.5" />
                    <circle cx="13" cy="15" r="1.5" />
                </svg>
            </div>

            {/* Item Info */}
            <div className="flex items-center gap-4 flex-1">
                {item.image && <img src={item.image} className="w-10 h-10 rounded object-cover" />}
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <span className={`w-2 h-2 rounded-full ${item.available !== false ? 'bg-green-500' : 'bg-red-500'} `} />
                        {item.isVegetarian ? <Leaf size={12} className="text-green-500" /> : <Drumstick size={12} className="text-red-500" />}
                    </div>
                    <p className="text-xs text-gray-500">{item.category} • ₹{item.price}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => useStore.getState().updateMenuItem(item.id, { available: !(item.available !== false) })}
                    className={`px-2 py-1 rounded text-xs font-bold ${item.available !== false ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'} `}
                >
                    {item.available !== false ? 'Active' : 'Sold Out'}
                </button>
                <button
                    onClick={() => useStore.getState().updateMenuItem(item.id, { isVegetarian: !item.isVegetarian })}
                    className={`p-1.5 rounded text-xs font-bold flex items-center justify-center ${item.isVegetarian ? 'bg-green-900/50 text-green-400 border border-green-500/50' : 'bg-red-900/50 text-red-400 border border-red-500/50'} `}
                    title={item.isVegetarian ? "Switch to Non-Veg" : "Switch to Veg"}
                >
                    {item.isVegetarian ? <Leaf size={14} /> : <Drumstick size={14} />}
                </button>
                <button
                    onClick={() => useStore.getState().updateMenuItem(item.id, { isChefSpecial: !item.isChefSpecial })}
                    className={`p-1.5 rounded text-xs font-bold flex items-center justify-center border transition-colors ${item.isChefSpecial ? 'bg-yellow-500 text-black border-yellow-400' : 'text-gray-500 border-gray-700 hover:text-yellow-500'} `}
                    title={item.isChefSpecial ? "Remove from Chef's Specials" : "Mark as Chef's Special"}
                >
                    <Star size={14} className={item.isChefSpecial ? "fill-black" : ""} />
                </button>
                <button onClick={() => onEdit(item)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors">
                    <Pencil size={16} />
                </button>
                <button onClick={() => useStore.getState().removeMenuItem(item.id)} className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded transition-colors">
                    <Trash size={16} />
                </button>
            </div>
        </div>
    );
}


function ScanStatsModal({ onClose, stats }: { onClose: () => void; stats: any[] }) {
    const [filter, setFilter] = useState<'all' | 'app' | 'table' | 'unique'>('all');

    const totalScans = stats.length;
    const tableScans = stats.filter(s => s.type === 'table_qr').length;
    const appScans = stats.filter(s => s.type === 'app_qr' || s.type === 'manual').length;

    // Calculate Repeaters Map
    const sessionCounts = stats.reduce((acc, curr) => {
        const id = curr.sessionId || 'unknown';
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Unique Visitors Count
    const uniqueUsers = Object.keys(sessionCounts).filter(k => k !== 'unknown').length;

    // Filter Logic
    let displayedStats = [...stats].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filter === 'app') {
        displayedStats = displayedStats.filter(s => s.type === 'app_qr' || s.type === 'manual');
    } else if (filter === 'table') {
        displayedStats = displayedStats.filter(s => s.type === 'table_qr');
    } else if (filter === 'unique') {
        const seen = new Set();
        displayedStats = displayedStats.filter(s => {
            const id = s.sessionId || 'unknown';
            if (id === 'unknown') return true;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    }

    // Helper to parse UA (Keep existing or simplified)
    const getDeviceInfo = (ua: string) => {
        if (!ua) return 'Unknown';
        if (ua.includes('iPhone')) return 'iPhone';
        if (ua.includes('iPad')) return 'iPad';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('Windows')) return 'Windows PC';
        if (ua.includes('Macintosh')) return 'Mac';
        return 'Other';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl p-6 shadow-2xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-blue-500" /> Visitor Analytics
                    </h2>
                    <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 shrink-0">
                    <button
                        onClick={() => setFilter('all')}
                        className={`p - 4 rounded - xl border transition - all text - left ${filter === 'all' ? 'bg-gray-100 border-gray-400 ring-2 ring-gray-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300'} `}
                    >
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total Visits</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{totalScans}</p>
                    </button>
                    <button
                        onClick={() => setFilter('app')}
                        className={`p - 4 rounded - xl border transition - all text - left ${filter === 'app' ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-200' : 'bg-blue-50 border-blue-100 hover:border-blue-300'} `}
                    >
                        <p className="text-xs text-blue-600 uppercase tracking-wider font-bold">App / Web</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{appScans}</p>
                    </button>
                    <button
                        onClick={() => setFilter('table')}
                        className={`p - 4 rounded - xl border transition - all text - left ${filter === 'table' ? 'bg-green-100 border-green-400 ring-2 ring-green-200' : 'bg-green-50 border-green-100 hover:border-green-300'} `}
                    >
                        <p className="text-xs text-green-600 uppercase tracking-wider font-bold">Table QR</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">{tableScans}</p>
                    </button>
                    <button
                        onClick={() => setFilter('unique')}
                        className={`p - 4 rounded - xl border transition - all text - left ${filter === 'unique' ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-200' : 'bg-purple-50 border-purple-100 hover:border-purple-300'} `}
                    >
                        <p className="text-xs text-purple-600 uppercase tracking-wider font-bold">Unique Visitors</p>
                        <p className="text-3xl font-bold text-purple-600 mt-1">{uniqueUsers}</p>
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 flex-1 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 shrink-0 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-700 uppercase">
                            {filter === 'all' && 'All Visits'}
                            {filter === 'app' && 'App & Web Visits'}
                            {filter === 'table' && 'Table QR Scans'}
                            {filter === 'unique' && 'Unique Visitors (Latest)'}
                        </h3>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md font-mono">{displayedStats.length} Records</span>
                    </div>
                    <div className="overflow-auto flex-1 p-4">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="text-xs text-gray-500 uppercase border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="pb-3 pl-2">Time</th>
                                    <th className="pb-3">IP / Location</th>
                                    <th className="pb-3">Network/ISP</th>
                                    <th className="pb-3">Device / ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {displayedStats.length === 0 ? (
                                    <tr><td colSpan={4} className="py-8 text-center text-gray-500">No records found for this filter.</td></tr>
                                ) : (
                                    displayedStats.slice(0, 100).map((scan, idx) => {
                                        const ipInfo = scan.ipData || {};
                                        const visitCount = (scan.sessionId && sessionCounts[scan.sessionId]) || 0;
                                        const isRepeater = visitCount > 1;

                                        return (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-3 pl-2 text-gray-900 font-mono text-xs whitespace-nowrap align-top">
                                                    {new Date(scan.timestamp).toLocaleString(undefined, {
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                    <div className="text-[10px] text-gray-400 font-normal">{scan.type === 'table_qr' ? `Table ${scan.tableId || '?'} ` : 'Direct Link'}</div>
                                                </td>
                                                <td className="py-3 align-top">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-xs text-blue-600 font-bold">{ipInfo.ip || 'Unknown IP'}</span>
                                                        <span className="text-[10px] text-gray-500">
                                                            {ipInfo.city ? `${ipInfo.city}, ${ipInfo.region} ` : (scan.tableId ? 'Local Scan' : 'N/A')}
                                                            {!scan.isGpsVerified && ipInfo.city === 'Shimla' && (
                                                                <span className="text-amber-600 font-bold ml-1" title="Mobile networks in Spiti often route through Shimla hubs. Actual location is likely Spiti.">
                                                                    (IP Hub Estimate)
                                                                </span>
                                                            )}
                                                        </span>
                                                        {scan.distanceKm !== undefined && scan.distanceKm !== null && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <span className={`text-[9px] font-bold ${scan.isGpsVerified ? 'text-green-600' : 'text-indigo-600'}`}>
                                                                    {scan.distanceKm === 0 ? 'At Restaurant' : `~${scan.distanceKm} km away`}
                                                                </span>
                                                                <span className={`text-[7px] px-1 rounded font-bold uppercase tracking-tighter border ${scan.isGpsVerified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                                    {scan.isGpsVerified ? `Precision GPS (±${Math.round(scan.geoAccuracy || 0)}m)` : 'Estimated IP'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {scan.preciseCoords && (
                                                            <a
                                                                href={`https://www.google.com/maps?q=${scan.preciseCoords.lat},${scan.preciseCoords.lng}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[8px] text-blue-500 hover:underline flex items-center gap-0.5 mt-0.5"
                                                            >
                                                                <MapPin size={8} /> View Precision Location
                                                            </a>
                                                        )}
                                                        {ipInfo.country_name && <span className="text-[9px] text-gray-400 uppercase">{ipInfo.country_name}</span>}
                                                    </div>
                                                </td>
                                                <td className="py-3 align-top">
                                                    <div className="text-xs text-gray-600 max-w-[150px] truncate" title={ipInfo.org}>
                                                        {ipInfo.org || ipInfo.asn || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3 align-top">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="text-xs font-bold text-gray-700">{getDeviceInfo(scan.userAgent)}</span>
                                                        <span className="text-[10px] text-gray-400 max-w-[150px] truncate" title={scan.userAgent}>
                                                            {scan.userAgent.split(')')[0].replace('Mozilla/5.0 (', '')}
                                                        </span>
                                                        {scan.sessionId && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[9px] font-mono text-gray-300">ID: {scan.sessionId.slice(-4)}</span>
                                                                {isRepeater && (
                                                                    <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200">
                                                                        {visitCount}x REPEATER
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}


function SortableCategoryList({ categories, onReorder }: { categories: string[]; onReorder: (newOrder: string[]) => void }) {
    const [localCats, setLocalCats] = useState(categories);

    useEffect(() => {
        setLocalCats(categories);
    }, [categories]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = localCats.indexOf(active.id as string);
            const newIndex = localCats.indexOf(over.id as string);
            const newOrder = arrayMove(localCats, oldIndex, newIndex);
            setLocalCats(newOrder);
            onReorder(newOrder);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localCats} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap gap-3">
                    {localCats.map((cat) => (
                        <SortableCategoryItem key={cat} category={cat} />
                    ))}
                    {localCats.length === 0 && <span className="text-gray-500 text-sm">No items added yet.</span>}
                </div>
            </SortableContext>
        </DndContext>
    );
}

function SortableCategoryItem({ category }: { category: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category });

    // Convert transform to CSS string manually if needed or use CSS.Transform
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const menu = useStore((state) => state.menu);

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors select-none shadow-sm">
            <span className="text-gray-900 font-bold text-sm">{category}</span>
            <button
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag
                onClick={async (e) => {
                    e.stopPropagation();
                    const newName = prompt(`Rename category "${category}" to: `, category);
                    if (!newName || newName === category) return;

                    const itemsToUpdate = menu.filter(i => i.category === category);
                    if (confirm(`This will move ${itemsToUpdate.length} items from "${category}" to "${newName}".Continue ? `)) {
                        for (const item of itemsToUpdate) {
                            await useStore.getState().updateMenuItem(item.id, { category: newName });
                        }
                        alert('Categories updated!');
                    }
                }}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
            >
                Rename
            </button>
        </div>
    );
}

function TabButton({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${active
                ? 'bg-tashi-primary text-white font-bold shadow-lg shadow-tashi-primary/20'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                } `}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function MobileTabButton({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all ${active
                ? 'text-tashi-primary'
                : 'text-gray-400 hover:text-gray-600'
                } `}
        >
            <div className={`p-1 rounded-full ${active ? 'bg-tashi-primary/10' : ''} `}>
                {icon}
            </div>
            <span className="text-[10px] font-bold mt-1">{label}</span>
        </button>
    );
}
