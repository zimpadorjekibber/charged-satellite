'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Lock, LogOut, History, BarChart3, LayoutDashboard,
    Settings, Star, Plus, X, Share2, ShoppingBag, Grid,
    Sparkles, Bell, Check, Newspaper, Home, Phone, PlayCircle,
    Music, DollarSign, Users, TrendingUp, ArrowRight, Trash,
    Pencil, Printer, FolderOpen, Image as ImageIcon, Upload,
    Download, Sun, Moon, MapPin, BookOpen, Clock, CloudSnow,
    Snowflake
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Modularized Components
import SettingsTab from './components/SettingsTab';
import OrdersTab from './components/OrdersTab';
import AnalyticsView from './components/AnalyticsView';
import ReviewsView from './components/ReviewsView';
import GearManagementView from './components/GearManagementView';
import StaysManagementView from './components/StaysManagementView';
import ValleyUpdatesView from './components/ValleyUpdatesView';
import StorageManagerView from './components/StorageManagerView';
import DbStatusIndicator from './components/DbStatusIndicator';
import ScanStatsModal from './components/ScanStatsModal';
import StatCard from './components/StatCard';
import TabButton from './components/TabButton';
import MobileTabButton from './components/MobileTabButton';

export type TabType = 'live' | 'history' | 'analytics' | 'reviews' | 'settings' | 'media' | 'storage' | 'gear' | 'stays' | 'valley';

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-gray-400" size={32} /></div>}>
            <AdminDashboard />
        </Suspense>
    );
}

function AdminDashboard() {
    const orders = useStore((state) => state.orders);
    const notifications = useStore((state) => state.notifications);
    const tables = useStore((state) => state.tables);
    const menu = useStore((state) => state.menu);
    const currentUser = useStore((state) => state.currentUser);
    const login = useStore((state) => state.login);
    const logout = useStore((state) => state.logout);
    const initialize = useStore((state) => state.initialize);
    const fetchScanStats = useStore((state) => state.fetchScanStats);

    // Sound Logic
    const [soundEnabled, setSoundEnabled] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const prevOrdersLength = useRef(0);
    const prevNotifLength = useRef(0);
    const [showVisualAlert, setShowVisualAlert] = useState(false);

    // Scan Stats Logic
    const [showScanStats, setShowScanStats] = useState(false);
    const [scanStats, setScanStats] = useState<any[]>([]);

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (showScanStats) {
            fetchScanStats().then(setScanStats);
        }
    }, [showScanStats, fetchScanStats]);

    useEffect(() => {
        const currentPendingOrders = orders.filter(o => o.status === 'Pending').length;
        const currentPendingNotifs = notifications.filter(n => n.status === 'pending').length;

        if (currentPendingOrders > prevOrdersLength.current || currentPendingNotifs > prevNotifLength.current) {
            setShowVisualAlert(true);
            if (soundEnabled && audioRef.current) {
                audioRef.current.loop = true;
                if (audioRef.current.paused) {
                    audioRef.current.play().catch(e => console.error("Sound play failed", e));
                }
            }
        }

        const hasActionsNeeded = currentPendingOrders > 0 || currentPendingNotifs > 0;
        if (soundEnabled && hasActionsNeeded) {
            if (audioRef.current) {
                audioRef.current.loop = true;
                if (audioRef.current.paused) {
                    audioRef.current.play().catch(e => console.error("Ring loop failed", e));
                }
            }
        } else {
            if (audioRef.current) {
                audioRef.current.loop = false;
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            if (!hasActionsNeeded) setShowVisualAlert(false);
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
                    setAudioError('');
                })
                    .catch(e => {
                        console.error("Audio permission denied", e);
                        setAudioError("Please interact with the page (click anywhere) before enabling sound alerts.");
                        setTimeout(() => setAudioError(''), 5000);
                    });
            }
        } else {
            setSoundEnabled(false);
        }
    };

    const [activeTab, setActiveTab] = useState<TabType>('live');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [audioError, setAudioError] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const tab = searchParams.get('tab') as TabType;
        const validTabs: TabType[] = ['live', 'history', 'analytics', 'reviews', 'settings', 'media', 'storage', 'gear', 'stays', 'valley'];
        if (tab && validTabs.includes(tab) && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams, activeTab]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab as TabType);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.push(`/admin?${params.toString()}`, { scroll: false });
    };

    // Auth Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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
                // Check if user exists in auth but missing role
                const user = useStore.getState().currentUser;
                if (!user) {
                    setError('Invalid credentials or Database access error.');
                } else {
                    setError('Invalid credentials');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Login error occurred');
        }
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
                        {error && <div className="bg-red-50 text-red-500 border border-red-200 p-3 rounded-lg text-sm text-center">{error}</div>}
                        <button type="submit" className="w-full bg-tashi-primary hover:bg-tashi-primary/90 text-white font-bold py-3 rounded-lg transition-all active:scale-95 shadow-md shadow-tashi-primary/20">
                            Access Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 bg-gray-50 text-gray-900 selection:bg-orange-100 selection:text-orange-900">
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

            <AnimatePresence>
                {showVisualAlert && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-red-600 text-white overflow-hidden shadow-2xl relative z-[60]">
                        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full animate-pulse"><Bell size={18} className="fill-white" /></div>
                                <div>
                                    <p className="font-bold text-sm">Action Required: New Activity Detected!</p>
                                    <p className="text-[10px] opacity-90 uppercase tracking-widest font-bold">Check orders or service requests</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowVisualAlert(false); if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } }} className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                                <Check size={14} /> Dismiss Alert
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {audioError && (
                <div className="fixed top-20 right-8 bg-black text-white px-6 py-3 rounded-xl shadow-2xl z-50 text-sm font-bold animate-pulse">
                    {audioError}
                </div>
            )}

            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4"><LogOut size={24} /></div>
                        <h3 className="text-xl font-bold mb-2">Ready to Leave?</h3>
                        <p className="text-gray-500 text-sm mb-6">Are you sure you want to log out of the admin panel?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Cancel</button>
                            <button onClick={() => { setShowLogoutConfirm(false); logout(); }} className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 shadow-lg shadow-red-500/20">Log Out</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <div className="border-b border-gray-200 p-4 sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"><ArrowLeft size={20} /></Link>
                        <h1 className="text-xl font-bold font-serif text-gray-900">Admin Dashboard</h1>
                    </div>

                    <div className="hidden lg:flex bg-gray-100 p-1 rounded-xl border border-gray-200 text-sm">
                        {[
                            { id: 'live', label: 'Live', icon: <LayoutDashboard size={18} /> },
                            { id: 'history', label: 'History', icon: <History size={18} /> },
                            { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
                            { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> },
                            { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
                            { id: 'gear', label: 'Gear', icon: <ShoppingBag size={18} /> },
                            { id: 'stays', label: 'Stays', icon: <Home size={18} /> },
                            { id: 'valley', label: 'Valley', icon: <CloudSnow size={18} /> },
                            { id: 'storage', label: 'Library', icon: <FolderOpen size={18} /> }
                        ].map(tab => (
                            <TabButton key={tab.id} active={activeTab === tab.id} label={tab.label} icon={tab.icon} onClick={() => handleTabChange(tab.id)} />
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleSound} className={`p-2 rounded-lg transition-colors border ${soundEnabled ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                            <div className={soundEnabled ? 'animate-pulse' : ''}><Bell size={16} /></div>
                        </button>
                        <DbStatusIndicator />
                        <Link href="/staff/dashboard" className="hidden md:block bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors text-xs font-bold border border-blue-600/50">Kitchen</Link>
                        <button onClick={() => setShowLogoutConfirm(true)} className="p-2 bg-red-900/20 text-red-500 border border-red-900/50 rounded-lg"><LogOut size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 lg:hidden px-4 py-3 pb-safe shadow-2xl overflow-x-auto hide-scrollbar">
                <div className="flex items-center gap-6">
                    <MobileTabButton active={activeTab === 'live'} label="Live" icon={<LayoutDashboard size={22} />} onClick={() => handleTabChange('live')} />
                    <MobileTabButton active={activeTab === 'history'} label="History" icon={<History size={22} />} onClick={() => handleTabChange('history')} />
                    <MobileTabButton active={activeTab === 'analytics'} label="Stats" icon={<BarChart3 size={22} />} onClick={() => handleTabChange('analytics')} />
                    <MobileTabButton active={activeTab === 'settings'} label="Settings" icon={<Settings size={22} />} onClick={() => handleTabChange('settings')} />
                    <MobileTabButton active={activeTab === 'valley'} label="Valley" icon={<CloudSnow size={22} />} onClick={() => handleTabChange('valley')} />
                    <MobileTabButton active={activeTab === 'storage'} label="Library" icon={<FolderOpen size={22} />} onClick={() => handleTabChange('storage')} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
                <div className="flex justify-end mb-4">
                    <button onClick={() => setShowScanStats(true)} className="bg-blue-600/20 text-blue-400 border border-blue-600/50 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-600/30 transition-colors">
                        <Users size={20} /> View Scan Traffic
                    </button>
                </div>

                {showScanStats && <ScanStatsModal stats={scanStats} onClose={() => setShowScanStats(false)} />}

                <AnimatePresence mode="wait">
                    {activeTab === 'live' && (
                        <div key="live" className="space-y-8">
                            <OrdersTab orders={orders} notifications={notifications} tables={tables} showHistoryOnly={false} />
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <OrdersTab orders={orders} notifications={notifications} tables={tables} showHistoryOnly={true} />
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && <AnalyticsView orders={orders} menu={menu} />}
                    {activeTab === 'reviews' && <ReviewsView />}
                    {activeTab === 'gear' && <GearManagementView />}
                    {activeTab === 'stays' && <StaysManagementView />}
                    {activeTab === 'settings' && <SettingsTab onTabChange={handleTabChange} />}
                    {activeTab === 'valley' && <ValleyUpdatesView />}
                    {activeTab === 'storage' && <StorageManagerView />}
                </AnimatePresence>
            </div>
        </div>
    );
}
