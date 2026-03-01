'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Bell, DollarSign, Users, ChevronRight, Clock, MapPin, Printer, Check } from 'lucide-react';
import { Order, Table } from '@/lib/store';
import AdminOrderCard from './AdminOrderCard'; // We'll extract this next or keep it in same file for now

import StatCard from './StatCard';
import { useStore } from '@/lib/store';

interface OrdersTabProps {
    orders: Order[];
    notifications: any[];
    tables: Table[];
    showHistoryOnly?: boolean;
}

export default function OrdersTab({
    orders,
    notifications,
    tables,
    showHistoryOnly = false
}: OrdersTabProps) {
    const resolveNotification = useStore((state) => state.resolveNotification);
    const cancelNotification = useStore((state) => state.cancelNotification);

    const orderCreatedAt = (o: any) => o.createdAt ? new Date(o.createdAt) : new Date();
    const today = new Date().toDateString();

    const todaysOrders = (orders || []).filter(o => new Date(orderCreatedAt(o)).toDateString() === today);
    const todaysRevenue = todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const activeOrders = (orders || []).filter(o =>
        o.status !== 'Paid' && o.status !== 'Rejected' && o.status !== 'Cancelled'
    );
    const pastOrders = (orders || []).filter(o =>
        o.status === 'Paid' || o.status === 'Rejected' || o.status === 'Cancelled'
    );

    const displayedOrders = showHistoryOnly ? pastOrders : activeOrders;

    return (
        <motion.div
            key={showHistoryOnly ? "history" : "live"}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
        >
            {/* Dashboard Header Stats - Only show on Live view */}
            {!showHistoryOnly && (
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
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Side: Orders (2/3 width on desktop) */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
                                {!showHistoryOnly && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                                {showHistoryOnly ? 'Order History' : 'Live Orders'}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {displayedOrders.length === 0 ? (
                                <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <div className="mb-4 text-gray-300 flex justify-center"><ShoppingBag size={48} /></div>
                                    <p className="text-gray-500 font-medium">No {showHistoryOnly ? 'past' : 'active'} orders found.</p>
                                </div>
                            ) : (
                                displayedOrders
                                    .sort((a, b) => new Date(orderCreatedAt(b)).getTime() - new Date(orderCreatedAt(a)).getTime())
                                    .map(order => (
                                        <AdminOrderCard key={order.id} order={order} />
                                    ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Service Requests (Only on Live) */}
                {!showHistoryOnly && (
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden h-fit sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Bell size={20} className="text-orange-500" />
                                    Service Requests
                                </h2>
                                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {notifications.filter(n => n.status === 'pending').length} ACTIVE
                                </span>
                            </div>

                            <div className="space-y-3">
                                {notifications.filter(n => n.status === 'pending').length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-xs text-gray-400 font-medium">Clear for now!</p>
                                    </div>
                                ) : (
                                    notifications
                                        .filter(n => n.status === 'pending')
                                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                        .map((notif) => (
                                            <div key={notif.id} className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 bg-orange-500 text-white rounded-xl shadow-lg ring-4 ring-orange-500/10">
                                                            <Bell size={14} className="animate-bounce" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                                                                {notif.type === 'service' ? 'Service Call' : 'Bill Request'}
                                                            </h4>
                                                            <p className="text-[10px] text-orange-600 font-bold">
                                                                Table: {tables.find((t: any) => t.id === notif.tableId)?.name || notif.tableId || 'Unknown'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold text-gray-400">
                                                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => resolveNotification(notif.id)}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black py-2 rounded-xl shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-1.5"
                                                    >
                                                        <Check size={12} /> ATTENDED
                                                    </button>
                                                    <button
                                                        onClick={() => cancelNotification(notif.tableId, notif.type)}
                                                        className="p-2 bg-white hover:bg-red-50 text-red-400 border border-gray-100 rounded-xl transition-colors"
                                                    >
                                                        <ShoppingBag size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

