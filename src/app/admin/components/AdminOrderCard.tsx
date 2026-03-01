'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Printer } from 'lucide-react';
import { useStore, Order, OrderItem, Table } from '@/lib/store';
import StatusBadge from './StatusBadge';

import { handlePrintKOT, handlePrintBill } from '../utils/printHelpers';

export default function AdminOrderCard({ order }: { order: Order }) {
    const tables = useStore((state) => state.tables);
    const updateOrderStatus = useStore((state) => state.updateOrderStatus);

    const tableName = tables.find((t: Table) => t.id === order.tableId)?.name || order.tableId;
    const itemsCount = order.items.reduce((sum: number, i: OrderItem) => sum + i.quantity, 0);

    return (
        <motion.div
            layout
            key={order.id}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
        >
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-lg font-black text-gray-900 shadow-sm">
                        {tableName?.toString().replace('Table ', '')}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">{tableName}</h3>
                            <StatusBadge status={order.status} />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                            <Clock size={10} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {itemsCount} ITEMS
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-gray-900">₹{order.totalAmount}</p>
                    <p className="text-[8px] font-bold text-gray-400 tracking-widest">TOTAL AMOUNT</p>
                </div>
            </div>

            <div className="p-4 flex-1 space-y-3">
                {order.items.map((item: OrderItem, idx: number) => (
                    <div key={idx} className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="bg-gray-100 text-gray-900 font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-md border border-gray-200">{item.quantity}x</span>
                                <h4 className="text-xs font-bold text-gray-800 leading-tight">{item.name}</h4>
                            </div>
                            {item.notes && <p className="text-[10px] text-orange-500 font-medium ml-7 mt-1">“ {item.notes} ”</p>}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">₹{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-50/30 grid grid-cols-2 gap-2 border-t border-gray-50">
                <button
                    onClick={() => {
                        const nextStatus = order.status === 'Pending' ? 'Preparing' :
                            order.status === 'Preparing' ? 'Served' : 'Paid';
                        updateOrderStatus(order.id, nextStatus as any);
                    }}
                    className="col-span-1 bg-gray-900 hover:bg-black text-white text-[10px] font-black py-2.5 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                >
                    {order.status === 'Pending' ? 'ACCEPT ORDER' : order.status === 'Preparing' ? 'SERVE' : 'MARK PAID'}
                </button>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('print-kot', { detail: order }))}
                        className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl flex items-center justify-center transition-all"
                        title="Print KOT"
                    >
                        <Printer size={16} />
                    </button>
                    <button
                        onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                        className="bg-white hover:bg-red-50 text-red-500 border border-gray-100 rounded-xl flex items-center justify-center transition-all"
                        title="Cancel Order"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
