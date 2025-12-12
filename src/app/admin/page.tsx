'use client';

import Link from 'next/link';
import { ArrowLeft, DollarSign, TrendingUp, Users, Lock, LogOut, History, BarChart3, LayoutDashboard, Settings, Leaf, Drumstick, Star, ArrowRight, Plus, Trash, Pencil, X, Printer, FolderOpen, Image, Upload } from 'lucide-react';
import { useStore, Order } from '@/lib/store';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
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

export default function AdminDashboard() {
    const orders = useStore((state) => state.orders);
    const tables = useStore((state) => state.tables);
    const menu = useStore((state) => state.menu);
    const categoryOrder = useStore((state) => state.categoryOrder);
    const currentUser = useStore((state) => state.currentUser);
    const login = useStore((state) => state.login);
    const logout = useStore((state) => state.logout);
    const valleyUpdates = useStore((state) => state.valleyUpdates);
    const initialize = useStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    // !! IMPORTANT FOR MOBILE TESTING !!
    const HOST_URL = typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' ? 'http://192.168.1.109:3000' : window.location.origin)
        : '';

    const [activeTab, setActiveTab] = useState<'live' | 'history' | 'analytics' | 'reviews' | 'settings' | 'media' | 'storage'>('live');

    // Auth Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [editingItem, setEditingItem] = useState<any>(null); // State for editing item
    const [menuSearchQuery, setMenuSearchQuery] = useState(''); // Search filter for menu
    const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('All'); // Category filter
    const [localGallery, setLocalGallery] = useState<any[]>([]);

    const fetchGallery = () => {
        fetch('/api/admin/gallery')
            .then(res => res.json())
            .then(data => setLocalGallery(data))
            .catch(err => console.error('Failed to load gallery', err));
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    const handleDeleteLocalImage = async (path: string) => {
        if (!confirm(`Are you sure you want to delete ${path}? This cannot be undone.`)) return;

        try {
            const res = await fetch('/api/admin/gallery', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: path })
            });

            if (res.ok) {
                // Remove from local state immediately
                setLocalGallery(prev => prev.filter(img => img.path !== path));
                alert('File deleted successfully.');
            } else {
                const err = await res.json();
                alert('Error deleting file: ' + err.error);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete file.');
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
            <div className="min-h-screen bg-tashi-darker flex flex-col items-center justify-center p-6">
                <Link href="/" className="absolute top-8 left-8 text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                    <ArrowLeft size={20} /> Back
                </Link>
                <div className="w-full max-w-md bg-white/5 border border-white/5 p-8 rounded-2xl backdrop-blur-xl">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-tashi-primary/20 rounded-full text-tashi-primary">
                            <Lock size={32} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Login</h1>
                    <p className="text-gray-400 text-center mb-8 text-sm">Restricted Access Portal</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tashi-primary transition-colors"
                                placeholder="Enter admin ID"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tashi-primary transition-colors"
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
                            className="w-full bg-tashi-primary hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all active:scale-95"
                        >
                            Access Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Computed Stats
    const totalRevenue = (orders || []).reduce((sum, order) => sum + order.totalAmount, 0);
    const activeOrders = (orders || []).filter(o => o.status !== 'Paid' && o.status !== 'Rejected' && o.status !== 'Cancelled');
    const pastOrders = (orders || []).filter(o => o.status === 'Paid' || o.status === 'Rejected' || o.status === 'Cancelled');

    return (
        <div className="min-h-screen bg-neutral-900 pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-neutral-900 border-b border-white/5 p-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold text-white font-serif hidden md:block">Admin Dashboard</h1>
                    </div>

                    {/* Centered Tab Navigation */}
                    <div className="flex bg-black/30 p-1 rounded-xl border border-white/5 text-sm overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                        <TabButton active={activeTab === 'live'} label="Live" icon={<LayoutDashboard size={16} />} onClick={() => setActiveTab('live')} />
                        <TabButton active={activeTab === 'history'} label="History" icon={<History size={16} />} onClick={() => setActiveTab('history')} />
                        <TabButton active={activeTab === 'analytics'} label="Analytics" icon={<BarChart3 size={16} />} onClick={() => setActiveTab('analytics')} />
                        <TabButton active={activeTab === 'reviews'} label="Reviews" icon={<Star size={16} />} onClick={() => setActiveTab('reviews')} />
                        <TabButton active={activeTab === 'settings'} label="Management" icon={<Settings size={16} />} onClick={() => setActiveTab('settings')} />
                        <TabButton active={activeTab === 'media'} label="Gallery" icon={<LayoutDashboard size={16} />} onClick={() => setActiveTab('media')} />
                        <TabButton active={activeTab === 'storage'} label="Storage" icon={<FolderOpen size={16} />} onClick={() => setActiveTab('storage')} />
                    </div>

                    <div className="flex items-center gap-4">
                        <DbStatusIndicator />
                        {/* ... (Kitchen View and Logout) */}
                        <Link
                            href="/staff/dashboard"
                            className="hidden md:block bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors text-xs font-bold border border-blue-600/50"
                        >
                            Kitchen View
                        </Link>
                        <button
                            onClick={logout}
                            className="p-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900/40 transition-colors"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <AnimatePresence mode="wait">
                    {/* LIVE DASHBOARD VIEW */}
                    {activeTab === 'live' && (
                        // ... (existing live view content)
                        <motion.div
                            key="live"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Active Orders"
                                    value={activeOrders.length.toString()}
                                    icon={<TrendingUp className="text-blue-400" size={24} />}
                                    subtext="Pending fulfillment"
                                />
                                <StatCard
                                    title="Active Tables"
                                    value={tables.length.toString()}
                                    icon={<Users className="text-tashi-accent" size={24} />}
                                    subtext="Registered tables"
                                />
                                <StatCard
                                    title="Total Revenue (All Time)"
                                    value={`₹${totalRevenue.toLocaleString()}`}
                                    icon={<DollarSign className="text-green-400" size={24} />}
                                    subtext={`From ${orders.length} orders`}
                                />
                            </div>

                            <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Live Orders
                                </h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {activeOrders.length === 0 ? (
                                        <div className="col-span-1 lg:col-span-2 text-center py-20 bg-black/20 rounded-xl border border-dashed border-white/10">
                                            <p className="text-gray-500">No active orders right now.</p>
                                        </div>
                                    ) : (
                                        activeOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                                            <AdminOrderCard key={order.id} order={order} />
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ORDER HISTORY VIEW */}
                    {activeTab === 'history' && (
                        // ... (existing history view content)
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>
                            <div className="bg-neutral-800 rounded-xl border border-white/5 overflow-hidden">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-white/5 text-xs uppercase font-bold text-white">
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
                                    <tbody className="divide-y divide-white/5">
                                        {pastOrders.length === 0 ? (
                                            <tr><td colSpan={6} className="p-8 text-center">No past orders found.</td></tr>
                                        ) : (
                                            pastOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                                                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 font-mono text-white">#{order.id.slice(0, 6)}</td>
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
                            className="bg-neutral-800 rounded-xl border border-white/5 p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Media Gallery</h2>
                                    <p className="text-gray-400 text-sm">Upload and manage photos for your menu and updates.</p>
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
                                {useStore.getState().media?.length === 0 ? (
                                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-xl">
                                        <p className="text-gray-500 mb-2">No photos in gallery yet.</p>
                                        <p className="text-xs text-gray-600">Upload photos to use them in your app.</p>
                                    </div>
                                ) : (
                                    useStore.getState().media?.map((item) => (
                                        <div key={item.id} className="group relative bg-black/20 rounded-lg overflow-hidden border border-white/5 aspect-square">
                                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
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
                                                        if (confirm('Delete this image from gallery list? (File remains in storage)')) {
                                                            await useStore.getState().deleteMedia(item.id);
                                                        }
                                                    }}
                                                    className="bg-red-500/20 text-red-400 border border-red-500/50 p-2 rounded hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1">
                                                <p className="text-[10px] text-gray-400 truncate">{item.name}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* STORAGE MANAGER VIEW */}
                    {activeTab === 'storage' && (
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
                                            <div key={idx} className="bg-black/40 rounded-lg border border-white/5 overflow-hidden group relative">
                                                <div className="aspect-square bg-neutral-900 relative">
                                                    <img
                                                        src={file.path}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(file.path);
                                                                alert('Path copied: ' + file.path);
                                                            }}
                                                            className="bg-white text-black font-bold uppercase text-xs px-4 py-2 rounded-lg hover:bg-gray-200 w-full"
                                                        >
                                                            Copy Path
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLocalImage(file.path)}
                                                            className="bg-red-500/20 border border-red-500/50 text-red-500 font-bold uppercase text-xs px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white w-full flex items-center justify-center gap-2"
                                                        >
                                                            <Trash size={14} /> Delete
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

                    {/* SETTINGS (Tables/Menu) VIEW */}
                    {activeTab === 'settings' && (
                        // ... (existing settings content, but ensure it's wrapped)
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-12"
                        >
                            {/* Valley Updates Management */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
                                <h2 className="text-xl font-bold text-white mb-6">Valley Updates</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(valleyUpdates || []).map((update, idx) => (
                                            <div key={idx} className="bg-black/20 p-4 rounded-xl border border-white/5 relative group">
                                                <div className="flex justify-between items-center mb-2">
                                                    <input
                                                        defaultValue={update.title}
                                                        onBlur={(e) => {
                                                            const newUpdates = [...useStore.getState().valleyUpdates];
                                                            newUpdates[idx].title = e.target.value;
                                                            useStore.getState().saveValleyUpdates(newUpdates);
                                                        }}
                                                        className="bg-transparent text-white font-bold text-sm w-full focus:outline-none focus:border-b border-tashi-accent"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newUpdates = useStore.getState().valleyUpdates.filter((_, i) => i !== idx);
                                                            useStore.getState().saveValleyUpdates(newUpdates);
                                                        }}
                                                        className="text-red-500 hover:text-white p-1"
                                                    >
                                                        <TrashIcon />
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
                                                        className="bg-white/5 text-xs text-gray-300 rounded p-1 border border-white/10"
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
                                                        className="bg-transparent text-xs text-gray-400 w-full focus:outline-none focus:border-b border-tashi-accent text-right"
                                                    />
                                                </div>
                                                <textarea
                                                    defaultValue={update.description}
                                                    onBlur={(e) => {
                                                        const newUpdates = [...useStore.getState().valleyUpdates];
                                                        newUpdates[idx].description = e.target.value;
                                                        useStore.getState().saveValleyUpdates(newUpdates);
                                                    }}
                                                    className="w-full bg-transparent text-xs text-gray-500 focus:outline-none border border-transparent focus:border-white/10 rounded p-1 resize-none h-16"
                                                />
                                                {/* Media Inputs */}
                                                <div className="flex gap-2 items-center border-t border-white/5 pt-2">
                                                    <select
                                                        defaultValue={update.mediaType || 'image'}
                                                        onChange={(e) => {
                                                            const newUpdates = [...useStore.getState().valleyUpdates];
                                                            newUpdates[idx].mediaType = e.target.value as any;
                                                            useStore.getState().saveValleyUpdates(newUpdates);
                                                        }}
                                                        className="bg-white/5 text-[10px] text-gray-400 rounded p-1 border border-white/10 w-20"
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
                                                            className="bg-transparent text-[10px] text-blue-400 w-full focus:outline-none focus:border-b border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                                {/* Media Preview */}
                                                {update.mediaUrl && (
                                                    <div className="w-full h-32 rounded bg-black flex items-center justify-center overflow-hidden">
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
                                            className="bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors min-h-[160px]"
                                        >
                                            <div className="p-2 bg-white/5 rounded-full"><Plus size={20} /></div>
                                            <span className="text-sm font-bold">Add Update</span>
                                        </button>
                                    </div>
                                </div>
                            </div>



                            {/* Geo Settings */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
                                <h2 className="text-xl font-bold text-white mb-6">Geo-Restriction Settings</h2>
                                <div className="bg-black/20 p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Allowed Radius (km)</label>
                                        <p className="text-xs text-gray-500 mb-4">Maximum distance allowed for customers to place orders.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <input
                                                id="geo-radius-input"
                                                type="number"
                                                defaultValue={useStore.getState().geoRadius || 5}
                                                className="bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white font-mono text-lg w-32 focus:outline-none focus:border-tashi-accent"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">km</span>
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

                            {/* Contact Settings */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
                                <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
                                <p className="text-sm text-gray-400 mb-6">Update your restaurant contact details that appear in the customer menu.</p>
                                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Phone Number</label>
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
                                            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-tashi-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Owner Phone (Alternate)</label>
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
                                            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-tashi-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">WhatsApp Number</label>
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
                                            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-tashi-accent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +91 for India)</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Google Maps Location</label>
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
                                            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-tashi-accent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Enter your business name or exact location (use + for spaces)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Table Management */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Table Management</h2>
                                    <button
                                        onClick={handlePrintAllQRs}
                                        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors text-xs sm:text-sm"
                                    >
                                        <Printer size={16} /> Print All QRs (A4)
                                    </button>
                                </div>
                                <div className="bg-black/20 p-6 rounded-xl border border-white/5 mb-8">
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
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tashi-accent"
                                        />
                                        <button type="submit" className="bg-tashi-accent text-tashi-dark font-bold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors">
                                            Add
                                        </button>
                                    </form>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                                    {tables.map((table) => (
                                        <div key={table.id} className="bg-neutral-800 p-4 rounded-xl border border-white/5 flex flex-col gap-4 group">
                                            <div className="flex justify-between items-center">
                                                <span className="text-white font-medium">{table.name}</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { const n = prompt('New name:', table.name); if (n) useStore.getState().updateTable(table.id, n); }} className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20">Edit</button>
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
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-white">Menu Management</h2>
                                    <button
                                        onClick={() => {
                                            const printWindow = window.open('', '_blank');
                                            if (!printWindow) return;

                                            // Group Items by Category
                                            const groupedMenu: Record<string, any[]> = {};
                                            // Sort categories by custom order if available
                                            const sortedCategories = [...Array.from(new Set(menu.map(i => i.category)))].sort((a, b) => {
                                                const idxA = categoryOrder.indexOf(a);
                                                const idxB = categoryOrder.indexOf(b);
                                                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                                                // If one is in order list and other isn't, prioritize the one in list?
                                                // Or just put ordered ones first.
                                                if (idxA !== -1) return -1;
                                                if (idxB !== -1) return 1;
                                                return a.localeCompare(b);
                                            });

                                            sortedCategories.forEach(cat => {
                                                groupedMenu[cat] = menu.filter(i => i.category === cat).sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
                                            });

                                            printWindow.document.write(`
                                                <html>
                                                <head>
                                                    <title>TashiZom Menu</title>
                                                    <style>
                                                        @page { size: A4; margin: 20mm; }
                                                        body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; color: #000; }
                                                        h1 { text-align: center; font-size: 32px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
                                                        .subtitle { text-align: center; font-size: 12px; color: #444; margin-bottom: 30px; letter-spacing: 4px; text-transform: uppercase; }
                                                        .category-section { margin-bottom: 25px; break-inside: avoid; page-break-inside: avoid; }
                                                        .category-title { 
                                                            font-size: 18px; 
                                                            font-weight: bold; 
                                                            border-bottom: 1px solid #000; 
                                                            padding-bottom: 2px; 
                                                            margin-bottom: 10px; 
                                                            text-transform: uppercase;
                                                            display: inline-block;
                                                            letter-spacing: 1px;
                                                        }
                                                        .item-row { display: flex; justify-content: space-between; margin-bottom: 8px; align-items: baseline; }
                                                        .item-info { flex: 1; margin-right: 20px; }
                                                        .item-name { font-weight: bold; font-size: 14px; margin-bottom: 1px; }
                                                        .item-desc { font-size: 11px; color: #444; font-style: italic; }
                                                        .item-price { font-weight: bold; font-size: 14px; white-space: nowrap; }
                                                    </style>
                                                </head>
                                                <body>
                                                    <h1>TashiZom</h1>
                                                    <p class="subtitle">KIBBER • SPITI VALLEY</p>
                                                    
                                                    ${Object.entries(groupedMenu).map(([category, items]) => `
                                                        <div class="category-section">
                                                            <div class="category-title">${category}</div>
                                                            ${items.map(item => `
                                                                <div class="item-row">
                                                                    <div class="item-info">
                                                                        <div class="item-name">${item.name} ${item.isVegetarian ? '🌱' : ''} ${item.isSpicy ? '🌶️' : ''}</div>
                                                                        ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
                                                                    </div>
                                                                    <div class="item-price">₹${item.price}</div>
                                                                </div>
                                                            `).join('')}
                                                        </div>
                                                    `).join('')}

                                                    <script>
                                                        window.onload = function() { window.print(); }
                                                    </script>
                                                </body>
                                                </html>
                                            `);
                                            printWindow.document.close();
                                        }}
                                        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors text-xs sm:text-sm"
                                    >
                                        <Printer size={16} /> Print Full Menu
                                    </button>
                                </div>

                                {/* Category Management */}
                                <div className="bg-neutral-900 border border-white/5 rounded-xl p-6 mb-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Manage Categories</h3>
                                            <p className="text-xs text-gray-600 mt-1">Categories are created automatically when you add an item to them.</p>
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

                                <div className="bg-black/20 p-6 rounded-xl border border-white/5 mb-8">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Add Item</h3>
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
                                                    available: true
                                                };

                                                if (image) {
                                                    newItem.image = image;
                                                }

                                                console.log("Attempting to add item:", newItem); // Debug Log

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
                                        <input name="name" required placeholder="Name" className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-tashi-accent outline-none" />
                                        <input name="price" type="number" required placeholder="Price" className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-tashi-accent outline-none" />
                                        <input list="category-list" name="category" required placeholder="Category" className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-tashi-accent outline-none" />
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
                                            <label className="flex items-center gap-2 text-white text-sm"><input name="isVegetarian" type="checkbox" className="accent-green-500" /> Veg</label>
                                            <label className="flex items-center gap-2 text-white text-sm"><input name="isSpicy" type="checkbox" className="accent-red-500" /> Spicy</label>
                                        </div>
                                        <div className="md:col-span-3">
                                            <div className="flex gap-2">
                                                <input name="image" id="add-item-image-url" placeholder="Paste Image Link (URL)..." className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-tashi-accent outline-none" />
                                                <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 flex items-center justify-center transition-colors border border-white/5">
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
                                        <input name="description" required placeholder="Description" className="md:col-span-4 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-tashi-accent outline-none" />
                                        <button type="submit" className="md:col-span-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg">Add Item</button>
                                    </form>
                                </div>

                                {/* Search and Filter Section */}
                                <div className="bg-neutral-900 border border-white/5 rounded-xl p-6 mb-6 space-y-4">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="🔍 Search menu items by name..."
                                            value={menuSearchQuery}
                                            onChange={(e) => setMenuSearchQuery(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-tashi-accent transition-colors"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔍</span>
                                        {menuSearchQuery && (
                                            <button
                                                onClick={() => setMenuSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
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

                                {/* EDIT ITEM MODAL */}
                                {editingItem && (
                                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                                        <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
                                            <button
                                                onClick={() => setEditingItem(null)}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                            >
                                                <X size={24} />
                                            </button>

                                            <h2 className="text-xl font-bold text-white mb-6">Edit Item</h2>

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
                                                    };

                                                    await useStore.getState().updateMenuItem(editingItem.id, updates);
                                                    setEditingItem(null);
                                                    alert('Item updated successfully!');
                                                }}
                                                className="space-y-4"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                                        <input name="name" defaultValue={editingItem.name} required className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-tashi-accent outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price</label>
                                                        <input name="price" type="number" defaultValue={editingItem.price} required className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-tashi-accent outline-none" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                                    <input list="category-list-edit" name="category" defaultValue={editingItem.category} required className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-tashi-accent outline-none" />
                                                    <datalist id="category-list-edit">
                                                        {Array.from(new Set(menu.map(i => i.category))).map(c => (
                                                            <option key={c} value={c} />
                                                        ))}
                                                    </datalist>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                                                    <div className="flex gap-2">
                                                        <input name="image" id="edit-item-image-url" defaultValue={editingItem.image} placeholder="Paste new image URL or upload" className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-tashi-accent outline-none" />
                                                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 flex items-center justify-center transition-colors border border-white/5">
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
                                                    <p className="text-[10px] text-yellow-500/70 mt-1">💡 Paste a link or click upload icon to pick a file.</p>
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
                                                </div>

                                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                                    <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">Cancel</button>
                                                    <button type="submit" className="px-6 py-2 rounded-lg bg-tashi-primary hover:bg-red-600 text-white font-bold transition-colors shadow-lg shadow-red-500/20">Save Changes</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

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
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 flex flex-col justify-center items-center">
                    <h3 className="text-gray-400 font-medium uppercase tracking-widest mb-2">In-App Customer Rating</h3>
                    <div className="text-7xl font-bold text-white mb-2">{averageRating}</div>
                    <div className="flex gap-1 text-yellow-400 mb-4">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={24} fill={s <= Math.round(Number(averageRating)) ? "currentColor" : "none"} strokeWidth={s <= Math.round(Number(averageRating)) ? 0 : 2} />
                        ))}
                    </div>
                    <p className="text-gray-500 text-sm">Based on {reviews.length} feedback submissions</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Recent Feedback</h3>
                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No in-app reviews yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((review) => (
                            <div key={review.id} className="bg-neutral-800 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-white">{review.customerName}</h4>
                                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-0.5 text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function TabButton({ active, label, icon, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${active ? 'bg-white text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

function StatCard({ title, value, icon, subtext }: any) {
    return (
        <div className="bg-neutral-800 p-6 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
            <div>
                <p className="text-gray-400 text-sm mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white">{value}</h3>
                {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
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
            <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Top Selling Items</h3>
                <div className="space-y-4">
                    {topItems.map(([name, count], idx) => (
                        <div key={name} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-tashi-accent font-bold text-tashi-dark flex items-center justify-center">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-white font-medium">{name}</span>
                                    <span className="text-gray-400 text-sm">{count} sold</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-tashi-accent" style={{ width: `${(count / topItems[0][1]) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {topItems.length === 0 && <p className="text-gray-500">Not enough data yet.</p>}
                </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Revenue / Hour</h3>
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
                                <span className="text-[10px] text-gray-500 font-mono">{idx}h</span>
                                <div className="opacity-0 group-hover:opacity-100 absolute -mt-8 bg-black text-white text-xs px-2 py-1 rounded pointer-events-none">
                                    ₹{val}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="md:col-span-2 bg-white/5 border border-white/5 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Recent Customer Feedback</h3>
                {useStore.getState().reviews.length === 0 ? (
                    <p className="text-gray-500 italic">No reviews yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {useStore.getState().reviews.slice(0, 6).map((review) => (
                            <div key={review.id} className="bg-neutral-800 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-white">{review.customerName}</span>
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm italic">"{review.comment}"</p>
                                <p className="text-xs text-gray-600 mt-2 text-right">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Duplicated Printing Logic for reliability
// Custom KOT Printing Logic (Matching Staff Dashboard for mobile readability)
const handlePrintKOT = (order: any) => {
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
                    min-height: 100vh; /* Ensure full height */
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
                    flex: 1; /* Pushes actions to bottom if content is short, or flows normally */
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
                    <strong>Time:</strong> ${new Date().toLocaleTimeString()}<br>
                    <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
                    ${order.customerName ? `<strong>Guest:</strong> ${order.customerName}<br>` : ''}
                    ${order.customerPhone ? `<strong>Phone:</strong> ${order.customerPhone}` : ''}
                </div>
                <div class="items">
                    ${order.items.map((i: any) => `
                        <div class="item">
                            <span class="qty">${i.quantity}</span>
                            <span>${i.name}</span>
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

const handlePrintBill = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const total = order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

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
                    ${order.items.map((i: any) => `
                        <div class="item">
                            <span class="item-name">${i.quantity} x ${i.name}</span>
                            <span>₹${(i.price * i.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="totals">
                    <div class="row grand"><span>TOTAL</span><span>₹${total.toFixed(2)}</span></div>
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

const DbStatusIndicator = () => {
    const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const check = async () => {
            try {
                // Try writing a dummy doc
                const { collection, addDoc, deleteDoc } = await import('firebase/firestore');
                const { db } = await import('@/lib/firebase');
                const ref = await addDoc(collection(db, '_health'), { t: Date.now() });
                await deleteDoc(ref);
                setStatus('connected');
            } catch (e: any) {
                console.error(e);
                setStatus('error');
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
        <div className="bg-neutral-800 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between mb-2">
                <div>
                    <h4 className="font-bold text-white text-lg">{tables.find(t => t.id === order.tableId)?.name || order.tableId}</h4>
                    {(order.customerName || order.customerPhone) && (
                        <p className="text-xs text-tashi-accent font-mono">
                            {order.customerName} {order.customerPhone && `• ${order.customerPhone}`}
                        </p>
                    )}
                </div>
                <StatusBadge status={order.status} />
            </div>
            <div className="space-y-1 mb-4 border-t border-white/5 pt-2 mt-2">
                {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-gray-300 text-sm">
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
    return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-500/20'}`}>{status}</span>;
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
            className={`flex items-center justify-between bg-neutral-800 p-3 rounded-lg border ${isDragging ? 'border-tashi-accent shadow-lg shadow-tashi-accent/20' : 'border-white/5 hover:border-white/10'
                }`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-white p-2 -ml-2"
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
                        <p className="font-bold text-white">{item.name}</p>
                        <span className={`w-2 h-2 rounded-full ${item.available !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                        {item.isVegetarian ? <Leaf size={12} className="text-green-500" /> : <Drumstick size={12} className="text-red-500" />}
                    </div>
                    <p className="text-xs text-gray-500">{item.category} • ₹{item.price}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => useStore.getState().updateMenuItem(item.id, { available: !(item.available !== false) })}
                    className={`px-2 py-1 rounded text-xs font-bold ${item.available !== false ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                >
                    {item.available !== false ? 'Active' : 'Sold Out'}
                </button>
                <button
                    onClick={() => useStore.getState().updateMenuItem(item.id, { isVegetarian: !item.isVegetarian })}
                    className={`p-1.5 rounded text-xs font-bold flex items-center justify-center ${item.isVegetarian ? 'bg-green-900/50 text-green-400 border border-green-500/50' : 'bg-red-900/50 text-red-400 border border-red-500/50'}`}
                    title={item.isVegetarian ? "Switch to Non-Veg" : "Switch to Veg"}
                >
                    {item.isVegetarian ? <Leaf size={14} /> : <Drumstick size={14} />}
                </button>
                <button onClick={() => onEdit(item)} className="text-blue-400 hover:text-white hover:bg-blue-500/20 p-2 rounded transition-colors">
                    <Pencil size={16} />
                </button>
                <button onClick={() => useStore.getState().removeMenuItem(item.id)} className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded transition-colors">
                    <Trash size={16} />
                </button>
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
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-neutral-700 transition-colors select-none">
            <span className="text-white font-bold text-sm">{category}</span>
            <button
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag
                onClick={async (e) => {
                    e.stopPropagation();
                    const newName = prompt(`Rename category "${category}" to:`, category);
                    if (!newName || newName === category) return;

                    const itemsToUpdate = menu.filter(i => i.category === category);
                    if (confirm(`This will move ${itemsToUpdate.length} items from "${category}" to "${newName}". Continue?`)) {
                        for (const item of itemsToUpdate) {
                            await useStore.getState().updateMenuItem(item.id, { category: newName });
                        }
                        alert('Categories updated!');
                    }
                }}
                className="text-xs text-blue-400 hover:text-white px-2 py-1 bg-blue-500/10 hover:bg-blue-500 rounded transition-colors"
            >
                Rename
            </button>
        </div>
    );
}
