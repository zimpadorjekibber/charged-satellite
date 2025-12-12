
'use client';

import { useStore } from '@/lib/store';
import { Trash2, ArrowRight, ShoppingBag, Utensils, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
    const cart = useStore((state) => state.cart);
    const removeFromCart = useStore((state) => state.removeFromCart);
    const placeOrder = useStore((state) => state.placeOrder);
    const router = useRouter();

    const [isOrdering, setIsOrdering] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [showTableModal, setShowTableModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [manualTableInput, setManualTableInput] = useState('');

    // Calculate Total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const grandTotal = total;

    const currentTableId = useStore((state) => state.currentTableId);

    const submitOrder = async (finalTableId: string) => {
        // 2. Personal Info Check
        if (!customerName.trim() || !customerPhone.trim()) {
            alert("Please provide your name and phone number to confirm your order.");
            return;
        }

        setIsOrdering(true);

        try {
            // 3. Geofencing Check
            const state = useStore.getState();
            const { contactInfo, geoRadius } = state;

            // Only enforce if coordinates are set in admin settings
            if (contactInfo.mapsLocation && geoRadius > 0) {
                try {
                    const { getCurrentPosition, parseCoordinates, calculateDistanceKm } = await import('@/lib/location');
                    const storeCoords = parseCoordinates(contactInfo.mapsLocation);

                    if (storeCoords) {
                        const pos = await getCurrentPosition();
                        const userLat = pos.coords.latitude;
                        const userLon = pos.coords.longitude;
                        const distance = calculateDistanceKm(userLat, userLon, storeCoords.lat, storeCoords.lon);

                        console.log(`Geofence Check: User at (${userLat}, ${userLon}), Store at (${storeCoords.lat}, ${storeCoords.lon}), Dist: ${distance.toFixed(3)}km, Limit: ${geoRadius}km`);

                        if (distance > geoRadius) {
                            alert(`You are out of our service area. \n\nYour distance: ${distance.toFixed(2)}km\nLimit: ${geoRadius}km\n\nYou can still browse our menu, but we cannot accept orders from your current location.`);
                            setIsOrdering(false);
                            return; // BLOCK ORDER
                        }
                    }
                } catch (locError: any) {
                    console.error("Geolocation Error:", locError);
                    if (locError instanceof Error && (locError.message.includes('permission') || (locError as any).code === 1)) {
                        alert("Location access is required to verify you are within our service area. Please allow location access to place an order.");
                    } else {
                        alert("Could not verify your location. Please ensure location services are enabled.");
                    }
                    setIsOrdering(false);
                    return; // BLOCK ORDER
                }
            }

            // Fake UX delay if desired
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Ensure Table ID matches what acts as source of truth
            if (!state.currentTableId && finalTableId !== 'REQUEST') {
                useStore.getState().setTableId(finalTableId);
            }

            await placeOrder(customerName, customerPhone, finalTableId);

            // Verify order was placed (Cart should be empty)
            if (useStore.getState().cart.length === 0) {
                router.push('/customer/status');
            } else {
                throw new Error("Order creation failed. Cart is still full.");
            }
        } catch (error) {
            console.error("Order Error:", error);
            alert("Something went wrong placing your order. Please try again.");
            setIsOrdering(false);
        }
    };

    const handlePlaceOrder = () => {
        if (!currentTableId) {
            setShowTableModal(true);
        } else {
            submitOrder(currentTableId);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 relative"
                >
                    <ShoppingBag size={40} className="text-gray-500" />
                    <div className="absolute top-0 right-0 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                        <span className="text-red-400 font-bold text-lg">0</span>
                    </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
                <p className="text-gray-400 mb-8 max-w-xs">Looks like you haven't added any delicious food yet.</p>
                <Link
                    href="/customer/menu"
                    className="px-8 py-3 bg-tashi-primary hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                    <Utensils size={18} /> Browse Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto pb-24">
            <h2 className="text-2xl font-bold mb-6 text-white font-serif flex items-center gap-2">
                <ShoppingBag className="text-tashi-accent" /> Your Order
            </h2>

            <div className="space-y-4 mb-8">
                <AnimatePresence>
                    {cart.map((item) => (
                        <motion.div
                            layout
                            key={item.menuItemId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="glass-card p-4 rounded-xl flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-tashi-accent/10 w-12 h-12 rounded-lg flex items-center justify-center text-tashi-accent font-bold text-lg border border-tashi-accent/20">
                                    {item.quantity}x
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">{item.name}</h3>
                                    <p className="text-sm text-gray-400">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.menuItemId)}
                                className="p-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-lg transition-all active:scale-90"
                            >
                                <Trash2 size={20} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Customer Details Form */}
            <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5 space-y-4 mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                    Contact Details <span className="text-xs text-red-500 font-normal">(Required)</span>
                </h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-tashi-accent"
                    />
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-tashi-accent"
                    />
                </div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl space-y-4 shadow-xl"
            >
                <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{total.toFixed(2)}</span>
                </div>

                <div className="h-px bg-white/10" />
                <div className="flex justify-between text-xl font-bold text-white items-end">
                    <span>Grand Total</span>
                    <span className="text-tashi-accent font-mono text-2xl">₹{grandTotal.toFixed(2)}</span>
                </div>

                <button
                    onClick={handlePlaceOrder}
                    disabled={isOrdering}
                    className="w-full mt-4 bg-gradient-to-r from-tashi-primary to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-tashi-primary/20 active:scale-[0.98]"
                >
                    {isOrdering ? (
                        <span className="animate-pulse">Placing Order...</span>
                    ) : (
                        <>Place Order <ArrowRight size={20} /></>
                    )}
                </button>
            </motion.div>


            {/* Table Selection Modal */}
            <AnimatePresence>
                {showTableModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowTableModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="bg-tashi-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-tashi-accent">
                                    <Utensils size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No Table Number?</h3>
                                <p className="text-gray-400 text-sm">
                                    You are ordering without a scanned table QR.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-left">
                                    <p className="text-blue-200 font-bold mb-1 text-sm">Don't worry!</p>
                                    <p className="text-blue-400 text-xs leading-relaxed">
                                        Your order request will be sent directly to our staff. They will assign you a table as soon as you arrive.
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowTableModal(false);
                                        setShowPaymentModal(true);
                                    }}
                                    className="w-full bg-tashi-primary hover:bg-red-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 group"
                                >
                                    Send Request to Staff <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            <button
                                onClick={() => setShowTableModal(false)}
                                className="w-full text-gray-500 text-sm hover:text-white py-2"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Advance Payment Modal for Remote Orders */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                        onClick={() => setShowPaymentModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-neutral-900 border border-tashi-accent/30 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(255,165,0,0.2)] space-y-6 relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tashi-accent to-transparent" />

                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-white mb-1 flex justify-center items-center gap-2">
                                    <span className="text-tashi-accent">50%</span> Advance
                                </h3>
                                <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Payment Required</p>
                            </div>

                            {/* Payment Details & QR */}
                            <div className="space-y-4">
                                <a
                                    href={`upi://pay?pa=8988203683@okbizaxis&pn=Lalit%20Kumar&am=${Math.ceil(grandTotal * 0.5)}&cu=INR`}
                                    className="block bg-white p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center shadow-inner hover:scale-105 transition-transform cursor-pointer relative group"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="/upi-qr.jpg"
                                        alt="Payment QR"
                                        className="w-full h-full object-contain mix-blend-multiply"
                                    />
                                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-black text-xs font-bold bg-white/80 px-2 py-1 rounded-full">Tap to Pay</span>
                                    </div>
                                </a>

                                <div className="text-center bg-white/5 p-3 rounded-xl border border-white/10">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">GPay Number</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <p className="text-xl font-mono font-bold text-white tracking-wider">8988203683</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText('8988203683');
                                            }}
                                            className="text-tashi-accent hover:text-white transition-colors"
                                            title="Copy Number"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                        </button>
                                    </div>
                                    <p className="text-xs text-emerald-400 font-medium mt-1">Lalit Kumar</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm text-gray-400 border-b border-white/10 pb-2">
                                    <span>Total Bill Amount</span>
                                    <span className="font-mono decoration-slate-500">₹{grandTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold text-white bg-white/5 p-3 rounded-lg border border-white/10">
                                    <span className="text-tashi-accent">Pay Now (50%)</span>
                                    <span className="font-mono text-xl">₹{Math.ceil(grandTotal * 0.5)}</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={() => {
                                        submitOrder('REQUEST');
                                        setShowPaymentModal(false);
                                    }}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-900/40 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Check size={20} /> I Have Paid
                                </button>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="w-full text-gray-500 text-sm hover:text-white py-2"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="text-center">
                                <p className="text-[10px] text-gray-500">
                                    Show the payment screenshot to staff upon arrival.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
