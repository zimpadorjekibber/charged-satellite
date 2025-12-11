
'use client';

import { useStore } from '@/lib/store';
import { Trash2, ArrowRight, ShoppingBag, Utensils } from 'lucide-react';
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

    // Calculate Total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const grandTotal = total;

    const currentTableId = useStore((state) => state.currentTableId);

    const handlePlaceOrder = async () => {
        let tableId = currentTableId;

        // 1. Table ID Check
        if (!tableId) {
            const manualId = window.prompt("We couldn't detect your Table Number. Please enter it (e.g., 't1' or '1'):");
            if (manualId && manualId.trim()) {
                tableId = manualId.trim();
                useStore.getState().setTableId(tableId);
            } else {
                alert("Table Number is required to place an order.");
                return;
            }
        }

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
                    // Dynamic import to avoid SSR issues with navigator if any (though 'use client' handles it, explicit import of logic is fine)
                    const { getCurrentPosition, parseCoordinates, calculateDistanceKm } = await import('@/lib/location');

                    const storeCoords = parseCoordinates(contactInfo.mapsLocation); // "Lat,Lon"

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
                    // If user denies permission or browser error
                    if (locError instanceof Error && (locError.message.includes('permission') || locError.code === 1)) { // 1 is PERMISSION_DENIED
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
            if (!state.currentTableId) {
                useStore.getState().setTableId(tableId);
            }

            await placeOrder(customerName, customerPhone, tableId);

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
        </div>
    );
}
