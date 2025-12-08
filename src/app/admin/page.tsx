
'use client';

import Link from 'next/link';
import { ArrowLeft, DollarSign, TrendingUp, Users, Lock, LogOut, History, BarChart3, LayoutDashboard, Settings, Leaf, Drumstick, Star, ArrowRight, Plus } from 'lucide-react';
import { useStore, Order } from '@/lib/store';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
    const orders = useStore((state) => state.orders);
    const tables = useStore((state) => state.tables);
    const menu = useStore((state) => state.menu);
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

    const [activeTab, setActiveTab] = useState<'live' | 'history' | 'analytics' | 'reviews' | 'settings'>('live');

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
                setError('Invalid credentials');
            }
        } catch (err) {
            console.error(err);
            setError('Login error occurred');
        }
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
    const activeOrders = (orders || []).filter(o => o.status !== 'Paid');
    const pastOrders = (orders || []).filter(o => o.status === 'Paid');

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
                    </div>

                    <div className="flex items-center gap-4">
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
                                                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-bold">PAID</span>
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
                                                    description: 'Description here...'
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
                                                type="number"
                                                defaultValue={useStore.getState().geoRadius || 5}
                                                onBlur={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (!isNaN(val) && val > 0) {
                                                        useStore.getState().updateSettings({ geoRadius: val });
                                                    }
                                                }}
                                                className="bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white font-mono text-lg w-32 focus:outline-none focus:border-tashi-accent"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">km</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table Management */}
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
                                <h2 className="text-xl font-bold text-white mb-6">Table Management</h2>
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
                                <h2 className="text-xl font-bold text-white mb-6">Menu Management</h2>
                                <div className="bg-black/20 p-6 rounded-xl border border-white/5 mb-8">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Add Item</h3>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const form = e.target as HTMLFormElement;
                                            const formData = new FormData(form);
                                            useStore.getState().addMenuItem({
                                                name: formData.get('name') as string,
                                                description: formData.get('description') as string,
                                                price: Number(formData.get('price')),
                                                category: formData.get('category') as any,
                                                isVegetarian: formData.get('isVegetarian') === 'on',
                                                isSpicy: formData.get('isSpicy') === 'on',
                                                image: formData.get('image') as string || undefined,
                                                available: true // Default to true
                                            });
                                            form.reset();
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
                                            <option value="Starters" />
                                            <option value="Main Course" />
                                            <option value="Beverages" />
                                            <option value="Dessert" />
                                        </datalist>
                                        <div className="flex gap-4 items-center">
                                            <label className="flex items-center gap-2 text-white text-sm"><input name="isVegetarian" type="checkbox" className="accent-green-500" /> Veg</label>
                                            <label className="flex items-center gap-2 text-white text-sm"><input name="isSpicy" type="checkbox" className="accent-red-500" /> Spicy</label>
                                        </div>
                                        <input name="image" placeholder="Image URL" className="md:col-span-3 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-tashi-accent outline-none" />
                                        <input name="description" required placeholder="Description" className="md:col-span-4 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-tashi-accent outline-none" />
                                        <button type="submit" className="md:col-span-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg">Add Item</button>
                                    </form>
                                </div>

                                <div className="space-y-2">
                                    {menu.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between bg-neutral-800 p-3 rounded-lg border border-white/5 hover:border-white/10">
                                            <div className="flex items-center gap-4">
                                                {item.image && <img src={item.image} className="w-10 h-10 rounded object-cover" />}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-white">{item.name}</p>
                                                        {/* Status Indicators */}
                                                        <span className={`w-2 h-2 rounded-full ${item.available !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        {item.isVegetarian ? <Leaf size={12} className="text-green-500" /> : <Drumstick size={12} className="text-red-500" />}
                                                    </div>
                                                    <p className="text-xs text-gray-500">{item.category} • ₹{item.price}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Toggles */}
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
                                                <button onClick={() => useStore.getState().removeMenuItem(item.id)} className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded transition-colors"><TrashIcon /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}

// ... (Other components: TabButton, StatCard, TrashIcon can remain, but I'll add ReviewsView)

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
const handlePrintKOT = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
            <html>
            <head>
                <style>
                    body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; background: #fff; }
                    @media print { .no-print { display: none; } }
                    .btn { display: block; width: 100%; padding: 10px; margin-top: 10px; text-align: center; border: none; cursor: pointer; font-weight: bold; }
                    .btn-print { bg-black; color: white; background: #000; }
                    .btn-close { background: #eee; color: #333; }
                </style>
            </head>
            <body>
                <div style="text-align:center;border-bottom:2px dashed #000;padding-bottom:10px;"><h2>KOT</h2><h3>${order.tableId}</h3></div>
                <p>Order #${order.id.slice(0, 6)}<br>${new Date().toLocaleString()}</p>
                ${order.items.map((i: any) => `<div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span><b>${i.quantity}x</b> ${i.name}</span></div>`).join('')}
                
                <div class="no-print" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
                    <button class="btn btn-print" onclick="window.print()">Print Ticket</button>
                    <button class="btn btn-close" onclick="window.close()">Close Window</button>
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
                <style>
                    body { font-family: sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; background: #fff; }
                    @media print { .no-print { display: none; } }
                    .btn { display: block; width: 100%; padding: 10px; margin-top: 10px; text-align: center; border: none; cursor: pointer; font-weight: bold; }
                    .btn-print { bg-black; color: white; background: #000; }
                    .btn-close { background: #eee; color: #333; }
                </style>
            </head>
            <body>
                <div style="text-align:center;border-bottom:1px solid #ccc;padding-bottom:10px;"><h2>TashiZom</h2><p>Bill #${order.id.slice(0, 6)}</p></div>
                <div style="margin:20px 0;">
                    ${order.items.map((i: any) => `<div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span>${i.quantity}x ${i.name}</span><span>₹${i.price * i.quantity}</span></div>`).join('')}
                </div>
                <div style="border-top:1px solid #000;padding-top:10px;">
                    <div style="display:flex;justify-content:space-between;font-weight:bold;margin-top:10px;"><span>Total</span><span>₹${total.toFixed(2)}</span></div>
                </div>

                <div class="no-print" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
                    <button class="btn btn-print" onclick="window.print()">Print Bill</button>
                    <button class="btn btn-close" onclick="window.close()">Close Window</button>
                </div>
            </body>
            </html>
            `);
    printWindow.document.close();
};

function AdminOrderCard({ order }: { order: any }) {
    const tables = useStore((state) => state.tables);
    const updateOrderStatus = useStore((state) => state.updateOrderStatus);

    return (
        <div className="bg-neutral-800 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between mb-4">
                <h4 className="font-bold text-white text-lg">{tables.find(t => t.id === order.tableId)?.name || order.tableId}</h4>
                <StatusBadge status={order.status} />
            </div>
            <div className="space-y-1 mb-4">
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
