'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Utensils, CheckCircle2, Trash2, Printer, Share2, Receipt, Check, Phone, ChevronDown, ChevronRight
} from 'lucide-react';
import { useStore, Order, OrderStatus } from '@/lib/store';
import {
    handlePrintKOT, handlePrintBill, handleShareKOT, handleShareBill
} from '@/app/admin/utils/printHelpers';

interface StaffOrderCardProps {
    order: Order;
    onUpdateStatus: (status: OrderStatus) => void;
    onDelete?: () => void;
    isNew: boolean;
    isPreparing: boolean;
    isReady: boolean;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    onConfirmPayment?: () => void;
}

export default function StaffOrderCard({
    order,
    onUpdateStatus,
    onDelete,
    isNew,
    isPreparing,
    isReady,
    isExpanded,
    onToggleExpand,
    onConfirmPayment
}: StaffOrderCardProps) {
    const tables = useStore((state) => state.tables);
    const updateOrderTable = useStore((state) => state.updateOrderTable);

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
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
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
                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={`tel:${order.customerPhone}`}
                                                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                                                >
                                                    {order.customerPhone}
                                                </a>
                                                {isTableOrder && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // We'll trigger this via a custom event or a shared state if needed, 
                                                            // but for now let's assume StaffShell can handle it if we add a hook here.
                                                            // Actually, let's keep it simple and just use the useWebRTC hook directly if possible.
                                                            window.dispatchEvent(new CustomEvent('initiate-staff-call', {
                                                                detail: { tableId: matchedTable.name, customerName: order.customerName || 'Guest' }
                                                            }));
                                                        }}
                                                        className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-green-600 transition-colors"
                                                    >
                                                        <Phone size={12} /> CALL TABLE
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Payment Confirmation */}
                            {order.paymentStatus === 'Pending' && (
                                <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200 animate-pulse">
                                    <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                                        <CheckCircle2 size={18} /> Verify Payment
                                    </h4>
                                    <p className="text-sm text-yellow-700 mb-3">
                                        Customer claims to have paid via UPI. Please verify and confirm to proceed.
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onConfirmPayment) onConfirmPayment();
                                        }}
                                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check size={20} /> Confirm Payment Received
                                    </button>
                                </div>
                            )}

                            {/* Table Assignment for Remote Orders */}
                            {(order.tableId === 'REQUEST' || order.tableId === 'Remote') && (
                                <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                                    <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                                        <Utensils size={16} /> Assign Table
                                    </h4>
                                    <p className="text-xs text-orange-700 mb-3">
                                        Customer has arrived? Assign them a table to start service.
                                    </p>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 bg-white border border-orange-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5 outline-none"
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                if (e.target.value) {
                                                    updateOrderTable(order.id, e.target.value);
                                                }
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Choose a table...</option>
                                            {tables.map((table: any) => (
                                                <option key={table.id} value={table.id}>
                                                    {table.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 p-4 bg-gray-50 rounded-xl">
                                {(order.items || []).map((item: any, idx: number) => (
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
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold text-sm transition-colors"
                                >
                                    <Share2 size={16} /> Share Bill
                                </button>
                            </div>

                            {/* Status Actions */}
                            <div className="flex gap-2">
                                {isNew && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateStatus('Preparing');
                                            handlePrintKOT(order, true);
                                        }}
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
