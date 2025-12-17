
'use client';

import { useStore, Order } from '../../../lib/store';
import { CheckCircle2, Circle, Clock, ChefHat, Utensils, Star, Send, Timer } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function OrderStatusPage() {
    const orders = useStore((state: any) => state.orders);
    const currentTableId = useStore((state: any) => state.currentTableId);
    const sessionId = useStore((state: any) => state.sessionId);
    const router = useRouter();

    // Track which orders we've already seen as paid to avoid duplicate redirects
    const processedPaidOrders = useRef<Set<string>>(new Set());

    // Filter orders: Match Session ID primarily
    const myOrders = orders.filter((o: any) =>
        (o.sessionId === sessionId) &&
        o.status !== 'Rejected' &&
        o.status !== 'Paid'
    );

    // Find recently paid orders for this session
    const myPaidOrders = orders.filter((o: any) =>
        (o.sessionId === sessionId) &&
        o.status === 'Paid'
    );

    // Polling to keep orders updated
    const initialize = useStore((state) => state.initialize);
    useEffect(() => {
        const interval = setInterval(() => {
            initialize(); // fetch latest orders from backend
        }, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [initialize]);

    // Auto-redirect to feedback page when an order is marked as Paid
    // Auto-redirect to feedback page when an order is marked as Paid
    // FIX: Only redirect if there are NO active orders remaining. 
    // This prevents interrupting the user if they have one completed order but another one still coming.
    useEffect(() => {
        if (myPaidOrders.length > 0 && myOrders.length === 0) {
            // Find the most recent paid order that we haven't processed yet
            const latestPaidOrder = myPaidOrders
                .filter((o: any) => !processedPaidOrders.current.has(o.id))
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

            if (latestPaidOrder) {
                // Mark this order as processed
                processedPaidOrders.current.add(latestPaidOrder.id);

                // Redirect to feedback page with order details
                const params = new URLSearchParams({
                    orderId: latestPaidOrder.id,
                    customerName: latestPaidOrder.customerName || '',
                    customerPhone: latestPaidOrder.customerPhone || ''
                });

                router.push(`/customer/feedback?${params.toString()}`);
            }
        }
    }, [myPaidOrders, myOrders.length, router]);


    if (myOrders.length === 0) {
        if (myPaidOrders.length > 0) {
            const latestPaid = myPaidOrders[0];
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                    >
                        <CheckCircle2 size={48} className="text-white" />
                    </motion.div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Order Completed!</h2>
                        <p className="text-gray-400">We hope you enjoyed your meal.</p>
                    </div>

                    <div className="w-full max-w-sm bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                        <p className="text-sm text-gray-300 mb-4">How was your experience?</p>
                        <button
                            onClick={() => {
                                const params = new URLSearchParams({
                                    orderId: latestPaid.id,
                                    customerName: latestPaid.customerName || '',
                                    customerPhone: latestPaid.customerPhone || ''
                                });
                                router.push(`/customer/feedback?${params.toString()}`);
                            }}
                            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <Star size={20} className="fill-black" />
                            Leave a Review
                        </button>
                    </div>

                    <Link href="/customer/menu" className="text-gray-500 hover:text-white text-sm mt-4">
                        Back to Menu
                    </Link>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Clock size={40} className="text-gray-600" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">No Active Orders</h2>
                <p className="text-gray-400 mb-6">
                    {currentTableId ? "Hungry? Order something delicious!" : "Scan a QR code or browse the menu to order."}
                </p>
                <Link href="/customer/menu" className="px-8 py-3 bg-tashi-accent text-tashi-dark font-bold rounded-xl shadow-lg shadow-yellow-500/20 hover:scale-105 transition-transform">
                    View Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-8 pb-24">
            <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
                <ChefHat className="text-tashi-accent" /> Track Order
            </h2>

            <div className="space-y-6">
                {myOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order: any) => (
                    <OrderTracker key={order.id} order={order} isRemote={order.tableId === 'REQUEST'} />
                ))}
            </div>

            <div className="flex justify-center mt-8">
                <Link href="/customer/menu" className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-center py-4 rounded-xl text-white font-bold transition-all">
                    Back To Menu
                </Link>
            </div>
        </div>
    );
}

function OrderTracker({ order, isRemote }: { order: Order; isRemote: boolean }) {
    const addReview = useStore((state: any) => state.addReview);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    // Review State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const steps = [
        { status: 'Pending', icon: Clock, label: 'Received' },
        { status: 'Preparing', icon: ChefHat, label: 'Cooking' },
        { status: 'Served', icon: Utensils, label: 'Served' },
    ];

    const getCurrentStep = (status: string) => {
        if (status === 'Pending') return 0;
        if (status === 'Preparing') return 1;
        if (status === 'Served' || status === 'Paid') return 2;
        return 0;
    };

    const currentStepIndex = getCurrentStep(order.status);
    const isCompleted = order.status === 'Served' || order.status === 'Paid';

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        addReview({
            customerName: order.customerName || 'Guest',
            rating,
            comment,
        });
        setReviewSubmitted(true);
    };

    return (
        <div className="glass-card p-6 rounded-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <span className="text-gray-400 text-sm font-mono">#{order.id.slice(0, 6)}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {order.status}
                </span>
            </div>

            {/* Countdown Timer */}
            {!isCompleted && (
                <CountdownTimer order={order} isRemote={isRemote} />
            )}

            {/* Progress Bar */}
            <div className="relative flex justify-between items-center mb-8 px-2 mt-6">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 -translate-y-1/2 rounded-full" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-tashi-accent -z-10 -translate-y-1/2 transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, idx) => {
                    const isActive = idx <= currentStepIndex;
                    const Icon = step.icon;
                    return (
                        <div key={step.label} className="flex flex-col items-center gap-2 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isActive ? 'bg-tashi-accent border-tashi-accent text-tashi-dark shadow-[0_0_10px_rgba(218,165,32,0.4)]' : 'bg-neutral-900 border-neutral-700 text-gray-600'}`}>
                                <Icon size={14} />
                            </div>
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-tashi-accent' : 'text-gray-600'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="space-y-2 mb-6">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-300">
                        <span><b className="text-white">{item.quantity}x</b> {item.name}</span>
                        <span>₹{item.price * item.quantity}</span>
                    </div>
                ))}
                <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-white text-lg">
                    <span>Total</span>
                    <span className="text-tashi-accent">₹{order.totalAmount}</span>
                </div>
            </div>

            {/* Review Section - Only if Completed and not reviewed yet */}
            <AnimatePresence>
                {isCompleted && !reviewSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t border-white/10 pt-4"
                    >
                        <h4 className="text-sm font-bold text-white mb-3 text-center">How was your food?</h4>
                        <form onSubmit={handleReviewSubmit} className="space-y-3">
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                                    >
                                        <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Any comments? (Optional)"
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-tashi-accent resize-none h-20"
                            />
                            <button
                                type="submit"
                                disabled={rating === 0}
                                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Send size={14} /> Submit Review
                            </button>
                        </form>
                    </motion.div>
                )}
                {reviewSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center"
                    >
                        <p className="text-green-400 font-bold text-sm">Thank you for your feedback!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}



function CountdownTimer({ order, isRemote }: { order: Order; isRemote: boolean }) {
    // Countdown Timer logic update
    const startTimeStr = order.acceptedAt; // Only use acceptedAt for the timer start
    const [elapsedMs, setElapsedMs] = useState(0);

    // If it's a remote order and hasn't been accepted (table assigned), show waiting state
    // If it's a remote order and hasn't been accepted (table assigned), show waiting state
    if (isRemote) {
        if (order.paymentStatus === 'Pending') {
            return (
                <div className="flex flex-col items-center justify-center p-6 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mb-4 animate-pulse">
                    <p className="text-yellow-500 font-bold text-lg uppercase tracking-widest text-center">Verifying Payment</p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                        Please wait while we confirm your transaction...
                    </p>
                </div>
            );
        }

        if (order.paymentStatus === 'Confirmed' && !order.acceptedAt) {
            return (
                <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 rounded-lg border border-green-500/20 mb-4">
                    <p className="text-green-500 font-bold text-lg uppercase tracking-widest text-center">Payment Confirmed</p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                        Your order is confirmed! Staff will assign your table shortly.
                    </p>
                </div>
            );
        }

        if (!order.acceptedAt) {
            return (
                <div className="flex flex-col items-center justify-center p-6 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-4 animate-pulse">
                    <p className="text-blue-400 font-bold text-lg uppercase tracking-widest text-center">Order Received</p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                        Waiting for table assignment to start cooking.
                    </p>
                </div>
            );
        }
    }

    // Fallback for immediate orders (if somehow acceptedAt is missing but it's not remote, or legacy)
    // We can default to createdAt as a failsafe, but for the new logic we prefer explicit acceptance.
    const effectiveStart = startTimeStr || order.createdAt;

    useEffect(() => {
        const update = () => {
            if (!effectiveStart) return;
            const created = new Date(effectiveStart).getTime();
            if (isNaN(created)) return; // Safety check
            const now = new Date().getTime();
            setElapsedMs(Math.max(0, now - created));
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [effectiveStart]);

    // ... (Keep existing Pending/Rejected checks if they are above this)

    if (order.status === 'Pending') {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mb-4 animate-pulse">
                <p className="text-yellow-500 font-bold text-lg uppercase tracking-widest text-center">Waiting Confirmation</p>
                <p className="text-xs text-gray-400 text-center mt-1">Kitchen is reviewing your order...</p>
            </div>
        );
    }
    if (order.status === 'Rejected') {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-red-900/20 rounded-lg border border-red-500/20 mb-4">
                <p className="text-red-500 font-bold text-lg uppercase tracking-widest text-center">Order Rejected</p>
                <p className="text-xs text-gray-400 text-center mt-1">We cannot fulfill this order right now. Please check with staff.</p>
            </div>
        );
    }

    // ... (rest of the timer phase logic remains the same)


    const elapsedMinutes = elapsedMs / 1000 / 60;

    let displayMs = 0;
    let totalPhaseDurationMin = 30;
    let phaseLabel = "Estimated Prep Time";
    let isWarning = false;
    let isCritical = false;
    let isFree = false;

    // Logic: 0-30 (30m), 30-50 (20m), 50-60 (10m), 60-65 (5m), >65 (Free)
    if (elapsedMinutes < 30) {
        // Phase 1: 0-30
        displayMs = (30 * 60 * 1000) - elapsedMs;
        totalPhaseDurationMin = 30;
        phaseLabel = "Estimated Prep Time";
    } else if (elapsedMinutes < 50) {
        // Phase 2: 30-50 (Duration 20m)
        // We want to count down from 20. 
        // elapsedMs is e.g. 31 mins. 
        // End target is 50 mins.
        displayMs = (50 * 60 * 1000) - elapsedMs;
        totalPhaseDurationMin = 20;
        phaseLabel = "Slight Delay... Processing";
        isWarning = true;
    } else if (elapsedMinutes < 60) {
        // Phase 3: 50-60 (Duration 10m)
        displayMs = (60 * 60 * 1000) - elapsedMs;
        totalPhaseDurationMin = 10;
        phaseLabel = "Almost Ready...";
        isWarning = true;
    } else if (elapsedMinutes < 65) {
        // Phase 4: 60-65 (Duration 5m)
        displayMs = (65 * 60 * 1000) - elapsedMs;
        totalPhaseDurationMin = 5;
        phaseLabel = "Final Touches...";
        isWarning = true;
        isCritical = true; // Blink text
    } else {
        // Phase 5: > 65 (Previously Free Food)
        // Now just show generic delay message
        displayMs = 0;
        totalPhaseDurationMin = 1;
        phaseLabel = "Running Late - Please ask staff";
        isWarning = true;
        isCritical = true;
    }

    /* REMOVED FREE FOOD BLOCK */

    const minutes = Math.floor((displayMs / 1000 / 60) % 60);
    const seconds = Math.floor((displayMs / 1000) % 60);

    // Calculate progress (starts full, goes to empty for current phase)
    // Avoid division by zero
    const durationMs = totalPhaseDurationMin * 60 * 1000;
    const progressPercent = durationMs > 0 ? Math.min(100, Math.max(0, (displayMs / durationMs) * 100)) : 0;

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-lg border border-white/5 mb-4">
            <div className={`flex items-end gap-1 font-mono leading-none ${isCritical ? 'animate-pulse text-red-500' : ''}`}>
                <div className="text-3xl font-bold text-white">
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
            </div>
            <p className={`text-[10px] uppercase font-bold mt-2 tracking-widest ${isWarning ? 'text-red-400' : 'text-gray-500'} ${isCritical ? 'animate-pulse' : ''}`}>
                {phaseLabel}
            </p>
            <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                <motion.div
                    className={`h-full ${isWarning ? 'bg-red-500' : 'bg-blue-500'}`}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ ease: "linear", duration: 1 }}
                />
            </div>
        </div>
    );
}
