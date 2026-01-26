'use client';

import { useStore, Category, MenuItem, Table, Order, getValidDate } from '../../../lib/store';
import { Plus, Minus, Bell, Newspaper, Leaf, Drumstick, Phone, X, Info, MessageCircle, MapPin, Sparkles, Navigation, Star, Send, ChevronLeft, ChevronRight, UtensilsCrossed, Utensils, Loader2, ShoppingBag, PlayCircle, Share2, ArrowLeft } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef, memo } from 'react';
import LocalMapGuide from '../components/LocalMapGuide';
import { getCurrentPosition, parseCoordinates, calculateDistanceKm } from '../../../lib/location';
import { sendTelegramAlert } from '../../../lib/telegram';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const GearItemCard = ({ name, price, items, badge, available }: { name: string, price: number, items: { url: string, label: string, details?: string, worn?: boolean }[], badge: string, available?: boolean }) => {
    const [currentIdx, setCurrentIdx] = useState(0);

    return (
        <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full">
            <div className="h-48 relative overflow-hidden group" onClick={() => setCurrentIdx((currentIdx + 1) % items.length)}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIdx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        <img
                            src={items[currentIdx].url}
                            alt={name}
                            className={`w-full h-full object-cover ${!available ? 'grayscale opacity-50' : ''}`}
                        />

                        {/* Out of Stock Overlay */}
                        {!available && (
                            <div className="absolute inset-0 flex items-center justify-center p-2">
                                <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-2xl border border-white/20 uppercase tracking-widest rotate-[-12deg]">
                                    Out of Stock
                                </span>
                            </div>
                        )}

                        {/* Overlay Details for Product Shot */}
                        {!items[currentIdx].worn && items[currentIdx].details && (
                            <div className="absolute inset-0 bg-white/40 flex flex-col justify-end p-2">
                                <span className="text-[9px] font-bold text-black bg-tashi-accent/80 px-1.5 py-0.5 rounded w-fit mb-1 backdrop-blur-sm">
                                    {items[currentIdx].details}
                                </span>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <div className="bg-white/60 backdrop-blur-md text-black text-[9px] font-bold px-2 py-0.5 rounded-full border border-black/10 w-fit">
                        {badge}
                    </div>
                </div>

                <div className="absolute top-2 right-2 bg-white/40 backdrop-blur-md text-black text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-black/10 uppercase tracking-tighter">
                    {items[currentIdx].label}
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {items.map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIdx ? 'bg-tashi-accent w-4' : 'bg-black/30'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-black font-bold text-[13px] mb-1 line-clamp-1">{name}</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-tashi-accent font-bold font-serif">&#8377;{price}</span>
                        <button className="text-[10px] bg-black/5 hover:bg-black/10 text-gray-600 px-2.5 py-1 rounded-full border border-black/10 transition-colors">
                            Enquire
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HELPER COMPONENTS (Hoisted) ---

const MiniOrderTimer = memo(function MiniOrderTimer() {
    const orders = useStore((state: any) => state.orders);
    const currentTableId = useStore((state: any) => state.currentTableId);
    const sessionId = useStore((state: any) => state.sessionId);

    // Find the latest active order for THIS session
    const activeOrder = orders
        .filter((o: Order) =>
            o.sessionId === sessionId &&
            (o.status === 'Pending' || o.status === 'Preparing')
        )
        .sort((a: any, b: any) => {
            const dateA = getValidDate(a.createdAt)?.getTime() || 0;
            const dateB = getValidDate(b.createdAt)?.getTime() || 0;
            return dateB - dateA;
        })[0];

    if (!activeOrder) return null;

    return (
        <Link href="/customer/status">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed bottom-24 right-6 z-[100] bg-black/80 backdrop-blur-md text-white px-4 py-3 rounded-full border border-white/10 shadow-lg flex items-center gap-3"
            >
                <div className={`w-2 h-2 rounded-full ${activeOrder.status === 'Pending' ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`} />
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {activeOrder.status === 'Pending' ? 'Waiting...' : 'Cooking'}
                    </span>
                    <MiniTimerDisplay startTime={activeOrder.acceptedAt || activeOrder.createdAt} />
                </div>
            </motion.div>
        </Link>
    );
});

function MiniTimerDisplay({ startTime }: { startTime: Date | string | any }) {
    const [timeLeft, setTimeLeft] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted) return;
        const interval = setInterval(() => {
            try {
                const date = getValidDate(startTime);
                if (!date) return;
                const start = date.getTime();
                const now = new Date().getTime();
                // Estimate 30 mins
                const end = start + 30 * 60 * 1000;
                const diff = Math.max(0, end - now);
                setTimeLeft(diff);
            } catch (err) {
                console.error("MiniTimer update error:", err);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime, mounted]);

    const mins = Math.floor((timeLeft / 1000 / 60) % 60);
    const secs = Math.floor((timeLeft / 1000) % 60);

    return (
        <span className="font-mono font-bold text-sm">
            {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </span>
    );
}

const ChefsSpecialSection = memo(function ChefsSpecialSection({
    items,
    addToCart,
    removeFromCart,
    getQuantity,
    setSelectedItem
}: {
    items: MenuItem[],
    addToCart: (item: MenuItem) => void,
    removeFromCart: (id: string) => void,
    getQuantity: (id: string) => number,
    setSelectedItem: (item: MenuItem) => void
}) {
    const menuAppearance = useStore((state: any) => state.menuAppearance);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (items.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [items.length]);

    if (items.length === 0) return null;

    return (
        <section className="mb-8 mt-4">
            <div className="flex items-center gap-2 mb-4 px-4 sticky top-[60px] z-30">
                <Sparkles style={{ color: menuAppearance.accentColor }} className="animate-pulse" size={24} />
                <h2 className="text-xl font-bold font-serif uppercase tracking-widest animate-pulse" style={{ color: menuAppearance.accentColor, filter: `drop-shadow(0 0 8px ${menuAppearance.accentColor}80)` }}>
                    Chef's Specials
                </h2>
                <div className="h-[1px] flex-1" style={{ background: `linear-gradient(to right, ${menuAppearance.accentColor}80, transparent)` }} />
            </div>

            {/* Fixed Height Container for Zero Layout Shift */}
            <div className="relative h-[150px] mx-4 mb-2">
                {items.map((item, index) => {
                    const isActive = index === currentIndex;
                    return (
                        <div
                            key={item.id}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
                        >
                            <div className="relative group h-full">
                                {/* Flashing Border Effect */}
                                <div className="absolute -inset-[2px] rounded-2xl opacity-75 blur-sm animate-pulse" style={{ background: `linear-gradient(to right, ${menuAppearance.accentColor}, #FFFFFF, ${menuAppearance.accentColor})` }} />

                                <div
                                    className="relative bg-white rounded-2xl overflow-hidden h-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] group"
                                    style={{ borderColor: `${menuAppearance.accentColor}4d`, borderWidth: '1px' }}
                                    onClick={() => isActive && setSelectedItem(item)}
                                >
                                    {/* Full Background Image */}
                                    <div className="absolute inset-0 z-0">
                                        {item.image ? (
                                            <>
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                {/* Gradient Overlay for Legibility */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-xs uppercase">No Image</div>
                                        )}
                                    </div>

                                    {/* Floating Badges */}
                                    <div className="absolute top-3 left-3 z-20 flex gap-2">
                                        <div className="text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg" style={{ backgroundColor: menuAppearance.accentColor }}>
                                            CHEF'S SPECIAL
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full backdrop-blur-md border ${item.isVegetarian ? 'border-green-500/50 text-green-400 bg-green-500/20' : 'border-red-500/50 text-red-400 bg-red-500/20'}`}>
                                            {item.isVegetarian ? 'Veg' : 'Non-Veg'}
                                        </span>
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-0 z-20 p-4 flex flex-col justify-end">
                                        <div className="flex justify-between items-end gap-2">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white text-xl leading-tight mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                                    {item.name}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl font-serif font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ color: menuAppearance.accentColor }}>
                                                        &#8377;{item.price}
                                                    </span>
                                                    {item.isSpicy && (
                                                        <span className="text-[10px] font-bold text-red-400 drop-shadow-md flex items-center gap-0.5">
                                                            🌶️ Spicy
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div onClick={(e) => e.stopPropagation()} className="mb-0.5">
                                                {getQuantity(item.id) === 0 ? (
                                                    <button
                                                        onClick={() => isActive && addToCart(item)}
                                                        disabled={item.available === false}
                                                        className="text-black px-6 py-2 rounded-xl text-xs font-black hover:opacity-90 transition-all hover:scale-105 shadow-xl active:scale-95"
                                                        style={{ backgroundColor: menuAppearance.accentColor }}
                                                    >
                                                        ADD
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl border border-white/20 h-10 shadow-2xl">
                                                        <button onClick={() => isActive && removeFromCart(item.id)} className="px-3 h-full text-white hover:bg-white/10 rounded-l-xl font-bold text-xl">-</button>
                                                        <span className="px-2 text-base font-black text-white min-w-[30px] text-center">{getQuantity(item.id)}</span>
                                                        <button onClick={() => isActive && addToCart(item)} className="px-3 h-full text-white hover:bg-white/10 rounded-r-xl font-bold text-xl">+</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Indicator dots - Static Layout */}
            {items.length > 1 && (
                <div className="flex justify-center gap-1.5 pb-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-1.5 rounded-full transition-all ${index === currentIndex
                                ? 'w-6'
                                : 'w-1.5 bg-gray-600 hover:bg-gray-500'
                                }`}
                            style={index === currentIndex ? { backgroundColor: menuAppearance.accentColor } : {}}
                        />
                    ))}
                </div>
            )}
        </section>
    );
});

function MenuItemCard({ item, quantity, onAdd, onRemove, onSelect }: { item: MenuItem; quantity: number; onAdd: () => void; onRemove: () => void; onSelect: () => void }) {
    const menuAppearance = useStore((state: any) => state.menuAppearance);
    const isAvailable = item.available !== false;

    return (
        <motion.div
            variants={itemVariants}
            whileTap={isAvailable ? { scale: 0.98 } : {}}
            className={`glass-card rounded-2xl p-3 flex gap-4 overflow-hidden relative group ${!isAvailable ? 'opacity-60 grayscale' : ''}`}
            onClick={onSelect}
        >
            {/* Dynamic Background Glow for selected items */}
            {quantity > 0 && isAvailable && (
                <div className="absolute inset-0 bg-tashi-primary/10 pointer-events-none" />
            )}

            {/* Image Placeholder with Gradient */}
            <div className="w-32 h-32 bg-gray-200 rounded-xl flex-shrink-0 relative overflow-hidden border border-black/5 cursor-pointer">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            ((e.target as HTMLImageElement).nextSibling as HTMLElement).style.display = 'flex';
                        }}
                    />
                ) : null}

                {/* Fallback "Image" - Hidden if image loads successfully */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-gray-600 p-2 bg-gradient-to-br from-gray-800 to-black ${item.image ? 'hidden' : 'flex'}`}>
                    <span className="text-[10px] text-center uppercase tracking-widest font-bold opacity-50">TashiZom</span>
                </div>

                {/* Veg/Non-Veg Indicator (Icons) */}
                {/* Veg/Non-Veg Indicator (Icons) */}
                <div className={`absolute top-2 left-2 z-10 p-1.5 rounded-full shadow-lg border backdrop-blur-md ${item.isVegetarian
                    ? 'bg-green-600 border-green-400'
                    : 'bg-red-600 border-red-400'
                    }`}>
                    {item.isVegetarian ? (
                        <Leaf size={14} className="text-white fill-white" />
                    ) : (
                        <Drumstick size={14} className="text-white fill-white" />
                    )}
                </div>

                {/* Availability Badge */}
                {!isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                        <span className="text-red-500 font-bold text-xs uppercase border-2 border-red-500 px-2 py-1 -rotate-12 bg-black/50 backdrop-blur-sm rounded">Sold Out</span>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between py-1">
                <div onClick={(e) => { e.stopPropagation(); onSelect(); }} className="cursor-pointer">
                    <h3 className="font-bold leading-tight mb-1" style={{ fontSize: menuAppearance.itemNameFontSize, color: menuAppearance.itemNameColor }}>{item.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.description}</p>
                    {/* Status Text */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                            {isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3" onClick={(e) => e.stopPropagation()}>
                    <span className="font-serif text-xl" style={{ color: menuAppearance.accentColor }}>&#8377;{item.price}</span>

                    {quantity === 0 ? (
                        <motion.button
                            whileHover={isAvailable ? { scale: 1.1 } : {}}
                            whileTap={isAvailable ? { scale: 0.9 } : {}}
                            onClick={isAvailable ? onAdd : undefined}
                            disabled={!isAvailable}
                            style={isAvailable ? { color: menuAppearance.accentColor, borderColor: `${menuAppearance.accentColor}4D` } : {}}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-dashed ${isAvailable
                                ? 'bg-white/5 cursor-pointer'
                                : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                }`}
                        >
                            <Plus size={20} />
                        </motion.button>
                    ) : (
                        <div className="flex items-center rounded-full px-1 py-1 shadow-lg" style={{ backgroundColor: menuAppearance.accentColor, boxShadow: `0 4px 12px ${menuAppearance.accentColor}4D` }}>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={onRemove}
                                className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/40"
                            >
                                <Minus size={16} />
                            </motion.button>
                            <span className="px-3 text-sm font-bold" style={{ color: parseInt(menuAppearance.accentColor.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff' }}>x{quantity}</span>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={onAdd}
                                className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/40"
                            >
                                <Plus size={16} />
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function MenuItemListRow({ item, quantity, onAdd, onRemove, onSelect }: { item: MenuItem; quantity: number; onAdd: () => void; onRemove: () => void; onSelect: () => void }) {
    const menuAppearance = useStore((state: any) => state.menuAppearance);
    const isAvailable = item.available !== false;

    return (
        <motion.div
            variants={itemVariants}
            whileTap={isAvailable ? { scale: 0.98 } : {}}
            className={`glass-card rounded-xl p-4 flex items-center gap-4 cursor-pointer ${!isAvailable ? 'opacity-60' : ''}`}
            onClick={onSelect}
        >
            {/* Veg/Non-Veg small indicator */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${item.isVegetarian
                ? 'bg-green-600 border-green-400'
                : 'bg-red-600 border-red-400'
                }`}>
                {item.isVegetarian ? (
                    <Leaf size={14} className="text-white fill-white" />
                ) : (
                    <Drumstick size={14} className="text-white fill-white" />
                )}
            </div>

            {/* Name and Price */}
            <div className="flex-1">
                <h3 className="font-bold leading-tight" style={{ fontSize: menuAppearance.itemNameFontSize, color: menuAppearance.itemNameColor }}>{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="font-serif text-lg" style={{ color: menuAppearance.accentColor }}>&#8377;{item.price}</span>
                    {!isAvailable && (
                        <span className="text-red-400 text-xs font-bold uppercase">Unavailable</span>
                    )}
                </div>
            </div>

            {/* Add button */}
            <div onClick={(e) => e.stopPropagation()}>
                {quantity === 0 ? (
                    <motion.button
                        whileHover={isAvailable ? { scale: 1.1 } : {}}
                        whileTap={isAvailable ? { scale: 0.9 } : {}}
                        onClick={isAvailable ? onAdd : undefined}
                        disabled={!isAvailable}
                        style={isAvailable ? { color: menuAppearance.accentColor, borderColor: `${menuAppearance.accentColor}4D` } : {}}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${isAvailable
                            ? 'bg-white/5 cursor-pointer'
                            : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                            }`}
                    >
                        <Plus size={18} />
                    </motion.button>
                ) : (
                    <div className="flex items-center bg-tashi-primary rounded-full px-1 py-1 shadow-lg shadow-tashi-primary/30">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={onRemove}
                            className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/40"
                        >
                            <Minus size={16} />
                        </motion.button>
                        <span className="px-3 text-sm font-bold text-white">x{quantity}</span>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={onAdd}
                            className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white hover:bg-black/40"
                        >
                            <Plus size={16} />
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function MenuPage() {
    const menu = useStore((state: any) => state.menu);
    const gearItems = useStore((state: any) => state.gearItems);
    const tables = useStore((state: any) => state.tables); // Added for table name lookup
    const cart = useStore((state: any) => state.cart);
    const orders = useStore((state: any) => state.orders); // Added
    const sessionId = useStore((state: any) => state.sessionId); // Added
    const addToCart = useStore((state: any) => state.addToCart);
    const removeFromCart = useStore((state: any) => state.removeFromCart);
    const [isCancelling, setIsCancelling] = useState(false);
    const currentTableId = useStore((state: any) => state.currentTableId);
    const setTableId = useStore((state: any) => state.setTableId);
    const notifications = useStore((state: any) => state.notifications);
    const addNotification = useStore((state: any) => state.addNotification);
    const cancelNotification = useStore((state: any) => state.cancelNotification);
    const resolveNotification = useStore((state: any) => state.resolveNotification);
    const valleyUpdates = useStore((state: any) => state.valleyUpdates);
    const contactInfo = useStore((state: any) => state.contactInfo);
    const categoryOrder = useStore((state: any) => state.categoryOrder);
    const menuAppearance = useStore((state: any) => state.menuAppearance);
    const addReview = useStore((state: any) => state.addReview);

    // Dynamic Categories derived from Menu
    const allCategories = Array.from(new Set(menu.map((item: any) => item.category))) as string[];

    // Define a preferred order for standard categories
    const PREFERRED_ORDER = [
        'Soups & Salads',
        'Snacks & Starters',
        'Main Course (Vegetarian)',
        'Main Course (Non-Vegetarian)',
        'Rice & Biryani',
        'Indian Breads',
        'Chinese',
        'Pizza & Pasta',
        'Desserts',
        'Tea & Coffee',
        'Cold Beverages & Shakes'
    ];

    // Seasonal filtering: Hide cold beverages in winter (Oct-Apr), show only in summer (May-Sep)
    const isSummerSeason = () => {
        if (typeof window === 'undefined') return true; // Always true during SSR
        const month = new Date().getMonth(); // 0 = January, 11 = December
        // May = 4, June = 5, July = 6, August = 7, September = 8
        return month >= 4 && month <= 8;
    };

    // Summer-only categories
    const SUMMER_ONLY_CATEGORIES = ['Cold Beverages & Shakes', 'Cold Beverages', 'Shakes', 'Cold Drinks'];

    // Filter categories based on season (safe for SSR - always show all during SSR)
    const seasonalCategories = allCategories.filter(category => {
        // During SSR, show all categories to prevent hydration mismatch
        if (typeof window === 'undefined') return true;

        // If it's a summer-only category, only show during summer
        if (SUMMER_ONLY_CATEGORIES.some(summerCat =>
            category.toLowerCase().includes(summerCat.toLowerCase())
        )) {
            return isSummerSeason();
        }
        // Show all other categories year-round
        return true;
    });

    // Sort categories: Custom Admin Order -> Preferred -> Alphabetical
    const CATEGORIES = [...seasonalCategories].sort((a, b) => {
        // 1. Check Custom Admin Order
        const aCustom = categoryOrder.indexOf(a);
        const bCustom = categoryOrder.indexOf(b);

        if (aCustom !== -1 && bCustom !== -1) return aCustom - bCustom;
        if (aCustom !== -1) return -1;
        if (bCustom !== -1) return 1;

        // 2. Fallback to Hardcoded Preferred Order
        const aIndex = PREFERRED_ORDER.findIndex(p => a.toLowerCase() === p.toLowerCase());
        const bIndex = PREFERRED_ORDER.findIndex(p => b.toLowerCase() === p.toLowerCase());

        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;

        return a.localeCompare(b);
    });

    // Time-based default category
    const getDefaultCategory = (): Category => {
        if (typeof window === 'undefined') return 'Starters'; // Safe SSR default
        const hour = new Date().getHours();

        // Helper to find actual category name (case-insensitive)
        const findCat = (keywords: string[]) => {
            for (const keyword of keywords) {
                const match = CATEGORIES.find(c => c.toLowerCase().includes(keyword.toLowerCase()));
                if (match) return match;
            }
            return undefined;
        };

        const lunchDinnerOptions = findCat(['main course', 'main', 'indian', 'chinese', 'thali', 'rice', 'dinner', 'lunch']);
        const starterOptions = findCat(['starter', 'snack', 'tandoor', 'appetizer']);
        // Updated Breakfast/Morning options to prioritize Tea/Coffee
        const breakfastOption = findCat(['breakfast', 'morning', 'paratha', 'toast', 'tea', 'coffee']);
        const beverageOption = findCat(['beverage', 'drink']);

        // NIGHT / EVENING / AFTERNOON (12 PM onwards)
        if (hour >= 12) {
            if (lunchDinnerOptions) return lunchDinnerOptions;
            if (starterOptions) return starterOptions;
        }

        // MORNING (5 AM - 12 PM)
        if (hour >= 5 && hour < 12) {
            // Prioritize Tea & Coffee specifically for 9 AM request if available
            const teaCoffee = findCat(['tea', 'coffee']);
            if (teaCoffee) return teaCoffee;

            if (breakfastOption) return breakfastOption;
            if (beverageOption) return beverageOption;
        }

        // LATE NIGHT (12 AM - 5 AM)
        if (hour < 5) {
            if (starterOptions) return starterOptions;
            if (beverageOption) return beverageOption;
        }

        // Final Fallbacks
        return lunchDinnerOptions || starterOptions || CATEGORIES[0] || 'Starters';
    };

    // Initialize with safe fallback to prevent hydration mismatch
    const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0] || 'Starters');

    // Helper to detect and format YouTube URLs
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [selectedItemContext, setSelectedItemContext] = useState<MenuItem[]>([]);
    const [filterType, setFilterType] = useState<'all' | 'veg' | 'non-veg'>('all');

    // Set time-based default category after mount to avoid hydration errors
    useEffect(() => {
        const defaultCat = getDefaultCategory();
        if (defaultCat && defaultCat !== activeCategory) {
            setActiveCategory(defaultCat);
        }
    }, []); // Run once on mount

    // Ref for category scroll container
    const categoryScrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll the category bar when activeCategory changes
    useEffect(() => {
        if (activeCategory && categoryScrollContainerRef.current) {
            const activeBtn = document.getElementById(`tab-${activeCategory}`);
            if (activeBtn) {
                const container = categoryScrollContainerRef.current;
                // Calculate position to center the button
                const scrollLeft = activeBtn.offsetLeft - (container.clientWidth / 2) + (activeBtn.clientWidth / 2);
                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }
    }, [activeCategory]);

    const handleSelectItem = (item: MenuItem, context: MenuItem[]) => {
        setSelectedItem(item);
        setSelectedItemContext(context);
    };

    const handleNextItem = () => {
        if (!selectedItem || selectedItemContext.length === 0) return;
        const currentIndex = selectedItemContext.findIndex(i => i.id === selectedItem.id);
        const nextIndex = (currentIndex + 1) % selectedItemContext.length;
        setSelectedItem(selectedItemContext[nextIndex]);
    };

    const handlePrevItem = () => {
        if (!selectedItem || selectedItemContext.length === 0) return;
        const currentIndex = selectedItemContext.findIndex(i => i.id === selectedItem.id);
        const prevIndex = (currentIndex - 1 + selectedItemContext.length) % selectedItemContext.length;
        setSelectedItem(selectedItemContext[prevIndex]);
    };

    const [showContactInfo, setShowContactInfo] = useState(false);
    const [showNavigationModal, setShowNavigationModal] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showMoreInfoModal, setShowMoreInfoModal] = useState(false); // NEW: Toggle for 'More Info' modal
    const [mapAutoPlay, setMapAutoPlay] = useState(false); // New State for Map Mode
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isLocating, setIsLocating] = useState(false); // New loading state for Call Staff
    const [showTableSelector, setShowTableSelector] = useState(false);
    const [callSuccessToast, setCallSuccessToast] = useState(false); // Success feedback for Call Staff
    const [lastCallTime, setLastCallTime] = useState<number>(0); // Track last call timestamp

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewName, setReviewName] = useState('');
    const [fullScreenMedia, setFullScreenMedia] = useState<{ url: string; type: 'video' | 'image'; title?: string } | null>(null);

    // Winter Notification Logic
    const [showWinterNote, setShowWinterNote] = useState(false);

    useEffect(() => {
        const checkWinterWarning = async () => {
            const now = new Date();
            const month = now.getMonth(); // 0 = Jan, 11 = Dec
            // Winter: Nov (10) - Apr (3)
            const isWinter = month >= 10 || month <= 3;

            if (isWinter) {
                // Check if already dismissed
                const dismissed = sessionStorage.getItem('winterNoteDismissed');
                if (dismissed) return;

                // 1. Check Indoor (Table Assigned)
                // Must have a valid table ID that is not 'REQUEST' (Walk-in) or 'Remote' (Home delivery)
                const isIndoor = currentTableId && currentTableId !== 'REQUEST' && currentTableId !== 'Remote';

                if (!isIndoor) return;

                // 2. Check Geofence
                const storeCoords = parseCoordinates(contactInfo.mapsLocation);
                if (!storeCoords) return;

                const callStaffRadius = useStore.getState().callStaffRadius || 50;

                try {
                    const pos = await getCurrentPosition();
                    const userLat = pos.coords.latitude;
                    const userLon = pos.coords.longitude;
                    const distanceKm = calculateDistanceKm(userLat, userLon, storeCoords.lat, storeCoords.lon);
                    const distanceMeters = distanceKm * 1000;


                    if (distanceMeters <= callStaffRadius) {
                        setShowWinterNote(true);
                    }
                } catch (e) {
                    console.warn("Location check failed for Winter Warning. Skipping display.", e);
                }
            }
        };

        checkWinterWarning();
    }, [currentTableId, contactInfo.mapsLocation]);

    const dismissWinterNote = () => {
        setShowWinterNote(false);
        sessionStorage.setItem('winterNoteDismissed', 'true');
    };

    // Scroll Spy & Navigation Logic
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px', // Activate when section is near top/center
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveCategory(entry.target.id as Category);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        CATEGORIES.forEach((cat) => {
            const element = document.getElementById(cat);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [CATEGORIES, dataLoaded]); // Re-attach when categories load

    const scrollToCategory = (cat: string) => {
        setActiveCategory(cat);
        const element = document.getElementById(cat);
        if (element) {
            // Offset for fixed header (approx 120px)
            const y = element.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    // FIX: Force switch to correct category when data loads or time mismatch detected
    useEffect(() => {
        if (CATEGORIES.length > 0 && !dataLoaded) {
            const correctCategory = getDefaultCategory();
            // Initial scroll to default category
            setTimeout(() => {
                scrollToCategory(correctCategory);
            }, 500);
            setDataLoaded(true);
        }
    }, [CATEGORIES, dataLoaded]);

    // NEW: Monitor active orders to sync Table ID if assigned by staff
    useEffect(() => {
        if (!sessionId || !orders.length) return;

        // Find the most recent active order for this session
        const activeOrder = orders.find((o: Order) =>
            o.sessionId === sessionId &&
            ['Pending', 'Preparing', 'Ready', 'Served'].includes(o.status)
        );

        if (activeOrder && activeOrder.tableId) {
            const isRealTable = activeOrder.tableId !== 'REQUEST' && activeOrder.tableId !== 'Remote';

            // If we have a real table assigned and it differs from our local state
            if (isRealTable && activeOrder.tableId !== currentTableId) {
                setTableId(activeOrder.tableId);

                // Optional: We could trigger a notification here
                // addNotification(activeOrder.tableId, 'info', { message: 'Table Assigned!' });
            }
        }
    }, [orders, sessionId, currentTableId, setTableId]);


    const getQuantity = (id: string) => {
        return cart.find((i: any) => i.menuItemId === id)?.quantity || 0;
    };

    // Check if there is already a pending call for this table
    // Calculate effective table ID (handles Remote/Request cases)
    const myOrders = orders.filter((o: Order) => o.sessionId === sessionId);
    const lastOrder = myOrders[0];
    const callTableId = currentTableId || lastOrder?.tableId || 'REQUEST';

    // Check if there is already a pending call for this table
    const pendingCallNotification = notifications.find((n: any) =>
        n.tableId === callTableId &&
        n.type === 'call_staff' &&
        n.status === 'pending' &&
        (callTableId !== 'REQUEST' && callTableId !== 'Remote' || n.sessionId === sessionId)
    );

    const hasPendingCall = !!pendingCallNotification;

    // Check for active order (Expanded definition)
    const hasActiveOrder = orders.some((o: Order) =>
        o.sessionId === sessionId &&
        ['Pending', 'Preparing', 'Ready', 'Served'].includes(o.status)
    );

    // Local state for "Calling" visual/audio feedback
    const [isCalling, setIsCalling] = useState(false);
    const [callErrorToast, setCallErrorToast] = useState(false); // New Error Toast
    const callSoundRef = useRef<HTMLAudioElement | null>(null);

    // Initialize Audio
    // Initialize Audio removed - handled by JSX <audio> ref logic
    // This ensures better compatibility with mobile browsers


    // Stop ringing if notification is resolved remotely by staff
    useEffect(() => {
        if (!hasPendingCall && isCalling) {
            setIsCalling(false);
            if (callSoundRef.current) {
                callSoundRef.current.pause();
                callSoundRef.current.currentTime = 0;
            }
        }
    }, [hasPendingCall, isCalling]);

    // Continuous Vibration when Calling
    useEffect(() => {
        let interval: any;
        if (isCalling) {
            // Initial vibration
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }

            // Loop vibration every 2 seconds
            interval = setInterval(() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate([200, 100, 200]);
                }
            }, 2000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isCalling]);

    const handleCallStaff = async () => {
        const myOrders = orders.filter((o: Order) => o.sessionId === sessionId);
        const callLastOrder = myOrders[0];

        // If already calling, allow "Cut Call" - This cancels the notification on BOTH sides
        if (isCalling) {
            // Stop local audio and visual feedback
            if (callSoundRef.current) {
                callSoundRef.current.pause();
                callSoundRef.current.currentTime = 0;
            }
            setIsCalling(false);

            // Cancel the server-side notification so staff's phone stops ringing too
            const tableIdToUse = currentTableId || callLastOrder?.tableId || 'REQUEST';

            if (pendingCallNotification) {
                resolveNotification(pendingCallNotification.id);
            } else if (hasPendingCall && tableIdToUse) {
                cancelNotification(tableIdToUse, 'call_staff');
            }
            return;
        }

        // COOLDOWN CHECK: Prevent multiple rapid clicks
        const now = Date.now();
        const COOLDOWN_MS = 10000; // 10 seconds
        if (now - lastCallTime < COOLDOWN_MS) {
            const remainingSeconds = Math.ceil((COOLDOWN_MS - (now - lastCallTime)) / 1000);
            alert(`Please wait ${remainingSeconds} seconds before calling again.\n\nYour previous call is still active.`);
            return;
        }

        // If already calling, this is a "Cut Call" action
        if (isCalling) {
            setIsCancelling(true);
            try {
                // Find the active call notification for this session
                let activeCall = notifications.find(
                    (n: any) => n.sessionId === sessionId && n.type === 'call_staff' && n.status === 'pending'
                );

                // Fallback: Check by tableId if session match fails (e.g. strict session mismatch)
                if (!activeCall && (currentTableId || callLastOrder?.tableId)) {
                    const checkTableId = currentTableId || callLastOrder?.tableId;
                    activeCall = notifications.find(
                        (n: any) => n.tableId === checkTableId && n.type === 'call_staff' && n.status === 'pending'
                    );
                }

                if (activeCall && !activeCall.id.startsWith('temp_')) {
                    console.log("Cancelling Call with ID:", activeCall.id);
                    await resolveNotification(activeCall.id);
                } else {
                    // Fallback to table-based cancellation if ID is temp or not found
                    const tableIdToUse = currentTableId || callLastOrder?.tableId || 'REQUEST';
                    console.log("Cancelling Call by Table ID:", tableIdToUse);
                    await cancelNotification(tableIdToUse, 'call_staff');
                }

                setIsCalling(false);
                if (callSoundRef.current) {
                    callSoundRef.current.pause();
                }
            } catch (e) {
                console.error("Failed to cancel call:", e);
                // Force UI reset anyway
                setIsCalling(false);
            } finally {
                setIsCancelling(false);
                if (callSoundRef.current) {
                    callSoundRef.current.pause();
                }
            }
            return;
        }

        // GEOFENCE CHECK: Only allow in-app "Call Staff" if within configured radius
        // Enforce minimum 200m to handle GPS drift in valley
        const configuredRadius = useStore.getState().callStaffRadius || 200;
        const callStaffRadius = Math.max(configuredRadius, 200);

        setIsLocating(true); // START LOADING

        // Safety timeout: If everything hangs, reset button after 8 seconds
        setTimeout(() => setIsLocating(false), 8000);

        try {
            // Static import used above - no network request needed here
            const storeCoords = parseCoordinates(contactInfo.mapsLocation);

            if (storeCoords) {
                try {
                    const pos = await getCurrentPosition();
                    const userLat = pos.coords.latitude;
                    const userLon = pos.coords.longitude;
                    const distanceKm = calculateDistanceKm(userLat, userLon, storeCoords.lat, storeCoords.lon);
                    const distanceMeters = distanceKm * 1000;


                    if (distanceMeters > callStaffRadius) {
                        // Customer is too far - show phone number for direct call
                        const phoneNumber = contactInfo.phone || contactInfo.secondaryPhone;
                        if (confirm(`You appear to be ${distanceMeters.toFixed(0)}m away (Limit: ${callStaffRadius}m).\n\nGPS can sometimes be inaccurate in the valley.\n\nIf you are at the homestay, please try moving slightly or call us directly.`)) {
                            window.location.href = `tel:${phoneNumber}`;
                        }
                        setIsLocating(false);
                        return;
                    }
                } catch (locError) {
                    console.error("Geolocation Error for Call Staff:", locError);
                    // Fallback: If location check fails (weak signal/timeout), 
                    // we AUTOMATICALLY allow the call to proceed.
                    // This avoids blocking the user if 'confirm' dialogs are disabled/ignored on device.
                }
            }
        } catch (err) {
            console.error("Location module error:", err);
        } finally {
            setIsLocating(false); // STOP LOADING
        }

        // If we reach here, customer is within 50m - proceed with in-app notification
        // Play feedback sound for customer
        // Assuming playCallSound is defined elsewhere or replaced by direct audio control
        if (callSoundRef.current) {
            callSoundRef.current.play().catch(e => console.error("Audio play failed", e));
        }
        setIsCalling(true);

        // Find recent customer details from previous orders
        const myOrdersForCall = orders.filter((o: Order) => o.sessionId === sessionId);
        const lastOrderForCall = myOrdersForCall[0]; // Orders are sorted desc

        // Use currentTableId if available, otherwise fallback to last order's table
        const effectiveTableId = currentTableId || lastOrder?.tableId;

        // Allow calling even without table (use 'REQUEST' for walk-ins)
        const finalTableId = effectiveTableId || 'REQUEST';

        try {
            // Trigger Telegram Alert IMMEDIATELY (Fire and Forget)
            const customerName = lastOrder?.customerName || 'Guest';
            // execute async without awaiting to prevent blocking
            sendTelegramAlert(`🔔 <b>STAFF CALLED!</b>\n\n🆔 Table: <b>${finalTableId}</b>\n👤 Customer: ${customerName}\n🕒 Time: ${new Date().toLocaleTimeString()}`).catch(err => console.error("TG Error:", err));

            console.log("Adding notification for:", finalTableId);
            addNotification(finalTableId, 'call_staff', {
                customerName: lastOrderForCall?.customerName || 'Guest',
                customerPhone: lastOrderForCall?.customerPhone || '',
                sessionId: sessionId || undefined
            });

            // SUCCESS FEEDBACK
            setLastCallTime(Date.now()); // Update cooldown timer
            setCallSuccessToast(true);
            setTimeout(() => setCallSuccessToast(false), 3500); // Hide toast after 3.5 seconds
        } catch (e) {
            console.error("Failed to call staff:", e);
            setCallErrorToast(true); // Show error toast instead of alert
            setTimeout(() => setCallErrorToast(false), 4000);
            setIsCalling(false);
            if (callSoundRef.current) {
                callSoundRef.current.pause();
            }
        }
    };

    return (
        <div className="pb-32 pointer-events-auto min-h-[100dvh] relative bg-white">
            {/* Minimal Sticky Header */}
            <div className="sticky top-0 z-[150] bg-white/80 backdrop-blur-xl border-b border-black/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="font-bold font-serif text-lg text-black leading-none">TashiZom</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Kibber, Spiti</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowMoreInfoModal(true)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-black shadow-sm"
                        aria-label="More Info"
                    >
                        <Info size={20} />
                    </button>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: 'TashiZom Menu',
                                    text: 'Check out the delicious menu at TashiZom, Kibber!',
                                    url: window.location.href
                                });
                            } else {
                                alert("Link copied to clipboard!");
                                navigator.clipboard.writeText(window.location.href);
                            }
                        }}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors text-tashi-accent"
                    >
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            <div className="px-4">
                {/* Winter Water Conservation Alert - MODAL */}
                <AnimatePresence>
                    {showWinterNote && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
                            >
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="p-4 bg-red-500/10 rounded-full animate-pulse">
                                        <Sparkles className="text-red-400" size={32} />
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-red-200 mb-2">Winter Notice</h3>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            Freezing temperatures make fetching water extremely difficult. <br /><br />
                                            <span className="text-red-300 font-bold border-b border-red-500/30 pb-0.5">Please use bucket water sparingly.</span>
                                        </p>
                                    </div>

                                    <button
                                        onClick={dismissWinterNote}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-900/50 active:scale-95 mt-2"
                                    >
                                        I Understand
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hidden Audio Element for Call Feedback */}
                <audio ref={callSoundRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" loop preload="auto" />

                {/* Success Toast for Call Staff */}
                <AnimatePresence>
                    {callSuccessToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
                        >
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-green-500/50 border border-green-400/30 flex items-center gap-3 backdrop-blur-xl">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <Phone className="animate-pulse" size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">Staff Notified! ✓</p>
                                    <p className="text-sm text-green-100">Someone will be with you shortly</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Toast for Call Staff */}
                <AnimatePresence>
                    {callErrorToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
                        >
                            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-red-500/50 border border-red-400/30 flex items-center gap-3 backdrop-blur-xl">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold">!</span>
                                </div>
                                <div>
                                    <p className="font-bold text-lg">Call Failed</p>
                                    <p className="text-sm text-red-100">Please call directly using the 'Contact' button.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Action Bar - Horizontal */}
                <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-md border-t border-black/10 pointer-events-auto">
                    <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-around gap-2">
                        {hasActiveOrder && (
                            <Link href="/customer/status">
                                <button
                                    className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-600/30 shadow-[0_0_15px_rgba(255,165,0,0.3)] active:scale-95 transition-transform"
                                >
                                    <UtensilsCrossed size={24} />
                                    <span className="text-[10px] uppercase tracking-wider font-bold">
                                        Status
                                    </span>
                                </button>
                            </Link>
                        )}
                        {/* Call Staff Button */}
                        <motion.button
                            onClick={handleCallStaff}
                            disabled={isLocating || isCancelling}
                            animate={isCalling ? {
                                x: [-4, 4, -4, 4, 0],
                                transition: {
                                    repeat: Infinity,
                                    duration: 0.4,
                                    repeatDelay: 1
                                }
                            } : {}}
                            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl active:scale-95 transition-transform ${isCalling
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                                : isCancelling
                                    ? 'bg-gray-700 text-gray-300 cursor-wait'
                                    : isLocating
                                        ? 'bg-gray-100 text-gray-500 cursor-wait'
                                        : 'bg-gray-100 text-black hover:bg-gray-200 border border-black/10'
                                }`}
                        >
                            {isLocating ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : isCancelling ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : isCalling ? (
                                <X size={24} />
                            ) : (
                                <Phone size={24} />
                            )}
                            <span className="text-[10px] uppercase tracking-wider font-bold">
                                {isLocating ? 'Locating...' : isCancelling ? 'Cancelling...' : isCalling ? 'Cut Call' : 'Call Staff'}
                            </span>
                        </motion.button>

                        {/* Contact Button */}
                        <button
                            onClick={() => setShowContactInfo(true)}
                            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 border border-blue-400/30 shadow-lg shadow-blue-500/40 active:scale-95 transition-transform"
                        >
                            <Info size={24} />
                            <span className="text-[10px] uppercase tracking-wider font-bold">
                                Contact
                            </span>
                        </button>

                        {/* Navigate/Location Button */}
                        <button
                            onClick={() => setShowNavigationModal(true)}
                            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl bg-gray-100 text-black hover:bg-gray-200 border border-black/10 active:scale-95 transition-transform"
                        >
                            <Navigation size={24} />
                            <span className="text-[10px] uppercase tracking-wider font-bold">
                                Direction
                            </span>
                        </button>


                    </div>
                </div>

                {/* Mini Timer for Active Orders - Commented out as component is missing */}
                {/* <MiniOrderTimer /> */}

                {/* Top Toolbar: Map Icon & Filters */}
                <div className="px-1 mt-6 mb-2 flex justify-between items-center">
                    {/* Local Map Shortcut */}
                    {/* Review Shortcut */}
                    <button
                        onClick={() => setShowReviewModal(true)}
                        className="ml-1 bg-white border border-black/10 rounded-lg p-2 hover:bg-black/5 transition-colors shadow-lg shadow-black/5"
                        style={{ color: menuAppearance.accentColor }}
                        aria-label="Write a Review"
                    >
                        <Star size={18} fill={menuAppearance.accentColor} />
                    </button>

                    <div className="bg-white border border-black/10 rounded-lg p-1 flex gap-1">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'all' ? 'bg-black/10 text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterType('veg')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${filterType === 'veg' ? 'bg-green-600 text-white shadow-lg shadow-green-900' : 'text-green-500 hover:bg-green-500/10'}`}
                        >
                            <Leaf size={10} className={filterType === 'veg' ? 'fill-white' : 'fill-green-500/30'} /> Veg
                        </button>
                        <button
                            onClick={() => setFilterType('non-veg')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${filterType === 'non-veg' ? 'bg-red-600 text-white shadow-lg shadow-red-900' : 'text-red-500 hover:bg-red-500/10'}`}
                        >
                            <Drumstick size={10} className={filterType === 'non-veg' ? 'fill-white' : 'fill-red-500/30'} /> Non-Veg
                        </button>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-md -mx-4 px-4 border-b border-black/5 pt-2 pb-4">
                    <div ref={categoryScrollContainerRef} className="flex overflow-x-auto gap-3 hide-scrollbar snap-x">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                id={`tab-${cat}`}
                                onClick={() => scrollToCategory(cat)}
                                className={`relative whitespace-nowrap px-8 py-3 rounded-full text-base font-bold transition-all duration-300 snap-center ${activeCategory === cat
                                    ? 'text-black scale-105'
                                    : 'bg-black/5 text-gray-500 hover:bg-black/10'
                                    }`}
                            >
                                {activeCategory === cat && (
                                    <div
                                        className="absolute inset-0 rounded-full shadow-lg"
                                        style={{ backgroundColor: menuAppearance.accentColor, boxShadow: `0 0 15px ${menuAppearance.accentColor}66` }}
                                    />
                                )}
                                <span className="relative z-10" style={{ fontSize: menuAppearance.categoryFontSize, color: activeCategory === cat ? (parseInt(menuAppearance.accentColor.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff') : menuAppearance.categoryColor }}>{cat}</span>
                            </button>
                        ))}
                        {CATEGORIES.length === 0 && (
                            <div className="px-4 py-2 text-gray-500 text-sm italic">Loading categories...</div>
                        )}
                    </div>
                </div>

                {/* Current Table Indicator - Only show if Table ID is set but not 'REQUEST' */}
                {currentTableId && currentTableId !== 'REQUEST' && currentTableId !== 'Remote' && (
                    <div className="mx-4 mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                <Utensils size={18} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">Ordering for</p>
                                <p className="text-white font-bold text-lg">Table {tables.find((t: any) => t.id === currentTableId)?.name || currentTableId}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowTableSelector(true)}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-gray-400 transition-colors"
                        >
                            Change
                        </button>
                    </div>
                )}

                {/* Chef's Special Section */}
                {(() => {
                    const chefSpecialItems = menu.filter((item: MenuItem) => item.isChefSpecial && (filterType === 'all' || (filterType === 'veg' ? item.isVegetarian : !item.isVegetarian)));
                    if (chefSpecialItems.length === 0) return null;
                    return (
                        <ChefsSpecialSection
                            items={chefSpecialItems}
                            addToCart={addToCart}
                            removeFromCart={removeFromCart}
                            getQuantity={getQuantity}
                            setSelectedItem={(item) => handleSelectItem(item, chefSpecialItems)}
                        />
                    );
                })()}

                {/* Menu Grid - CONTINUOUS SCROLL */}
                <div className="mt-6 space-y-12">
                    {CATEGORIES.map((cat) => {
                        // Filter items for this category based on filterType
                        const categoryItems = menu
                            .filter((item: MenuItem) => {
                                if (item.category !== cat) return false;
                                if (filterType === 'veg') return item.isVegetarian;
                                if (filterType === 'non-veg') return !item.isVegetarian;
                                return true;
                            })
                            .sort((a: MenuItem, b: MenuItem) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)); // Sort by admin-defined order

                        if (categoryItems.length === 0) return null;

                        return (
                            <section key={cat} id={cat} className="scroll-mt-32">
                                {/* Typewriter Header */}
                                <div className="flex items-center gap-4 mb-6 sticky top-[130px] z-30 py-2 bg-gradient-to-b from-white via-white/95 to-transparent backdrop-blur-sm -mx-2 px-2">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-black/10" />
                                    <h2 className="font-bold font-serif uppercase tracking-widest text-shadow-glow" style={{ fontSize: menuAppearance.categoryFontSize, color: menuAppearance.categoryColor }}>
                                        {cat}
                                    </h2>
                                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-black/10" />
                                </div>

                                {/* Items WITH images - Display as cards */}
                                {categoryItems.filter((item: MenuItem) => item.image).length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                        {categoryItems.filter((item: MenuItem) => item.image).map((item: MenuItem) => (
                                            <MenuItemCard
                                                key={item.id}
                                                item={item}
                                                quantity={getQuantity(item.id)}
                                                onAdd={() => addToCart(item)}
                                                onRemove={() => removeFromCart(item.id)}
                                                onSelect={() => handleSelectItem(item, categoryItems)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Items WITHOUT images - Display as compact list */}
                                {categoryItems.filter((item: MenuItem) => !item.image).length > 0 && (
                                    <div className="space-y-2">
                                        {categoryItems.filter((item: MenuItem) => !item.image).map((item: MenuItem) => (
                                            <MenuItemListRow
                                                key={item.id}
                                                item={item}
                                                quantity={getQuantity(item.id)}
                                                onAdd={() => addToCart(item)}
                                                onRemove={() => removeFromCart(item.id)}
                                                onSelect={() => handleSelectItem(item, categoryItems)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        );
                    })}

                    {/* Empty State if EVERYTHING is filtered out */}
                    {menu.length > 0 && CATEGORIES.every(cat =>
                        menu.filter((i: MenuItem) => i.category === cat &&
                            (filterType === 'veg' ? i.isVegetarian : filterType === 'non-veg' ? !i.isVegetarian : true)
                        ).length === 0) && (
                            <div className="text-center py-20 text-gray-500 italic">
                                No items match your filter.
                            </div>
                        )}

                    {/* End of Menu Indicator */}
                    <div className="h-24 flex flex-col items-center justify-center text-gray-600 space-y-2 opacity-50">
                        <div className="w-16 h-[1px] bg-white/20" />
                        <p className="text-xs font-mono uppercase">End of Menu</p>
                    </div>

                    {/* Item Details Modal */}
                    <AnimatePresence>
                        {selectedItem && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[200] bg-white/90 backdrop-blur-md flex items-center justify-center p-4"
                                onClick={() => setSelectedItem(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className="bg-white border border-black/10 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={(e, { offset, velocity }) => {
                                        const swipeThreshold = 50;
                                        if (offset.x > swipeThreshold) {
                                            handlePrevItem();
                                        } else if (offset.x < -swipeThreshold) {
                                            handleNextItem();
                                        }
                                    }}
                                >
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="absolute top-4 right-4 z-[20] w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white"
                                    >
                                        <X size={20} />
                                    </button>

                                    {selectedItemContext.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePrevItem(); }}
                                                className="absolute top-1/2 left-2 z-[20] w-10 h-10 bg-black/30 hover:bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors -translate-y-1/2"
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleNextItem(); }}
                                                className="absolute top-1/2 right-2 z-[20] w-10 h-10 bg-black/30 hover:bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors -translate-y-1/2"
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                        </>
                                    )}

                                    <div className="h-64 w-full relative">
                                        {selectedItem.image ? (
                                            <img key={selectedItem.image} src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-600 font-bold text-xl uppercase tracking-widest">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 z-[10]">
                                            <div className={`px-3 py-1.5 rounded-full shadow-lg border backdrop-blur-md flex items-center gap-2 ${selectedItem.isVegetarian
                                                ? 'bg-green-600/90 border-green-400'
                                                : 'bg-red-600/90 border-red-400'
                                                }`}>
                                                {selectedItem.isVegetarian ? (
                                                    <>
                                                        <Leaf size={16} className="text-white fill-white" />
                                                        <span className="text-xs text-white font-bold uppercase">Veg</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Drumstick size={16} className="text-white fill-white" />
                                                        <span className="text-xs text-white font-bold uppercase">Non-Veg</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-black mb-2 font-serif">{selectedItem.name}</h2>
                                            <p className="text-gray-600 leading-relaxed">{selectedItem.description}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-black/10">
                                            <span className="text-3xl font-serif text-tashi-accent">&#8377;{selectedItem.price}</span>

                                            <div className="flex items-center gap-4">
                                                {getQuantity(selectedItem.id) > 0 && (
                                                    <span className="font-bold text-white bg-tashi-primary px-3 py-1 rounded-full">
                                                        in cart: {getQuantity(selectedItem.id)}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        addToCart(selectedItem);
                                                    }}
                                                    disabled={selectedItem.available === false}
                                                    className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    <Plus size={18} /> Add to Order
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* NEW: More Info Modal containing Updates & Gears */}
                <AnimatePresence>
                    {showMoreInfoModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-0"
                            onClick={() => setShowMoreInfoModal(false)}
                        >
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="bg-white rounded-t-3xl w-full h-[90vh] absolute bottom-0 flex flex-col overflow-hidden shadow-2xl"
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="p-5 border-b border-black/5 flex items-center justify-between bg-white z-10 sticky top-0">
                                    <div>
                                        <h3 className="text-xl font-bold font-serif text-black">Valley Essentials</h3>
                                        <p className="text-xs text-gray-400">Updates & Local Gear</p>
                                    </div>
                                    <button
                                        onClick={() => setShowMoreInfoModal(false)}
                                        className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-8">

                                    {/* 1. Valley Updates Section (Moved here) */}
                                    {valleyUpdates.length > 0 && (
                                        <section>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="p-1.5 bg-tashi-accent/20 rounded-lg text-tashi-accent">
                                                    <Newspaper size={20} />
                                                </div>
                                                <h2 className="text-lg font-bold font-serif text-black tracking-tight" style={{ color: menuAppearance.accentColor }}>
                                                    Valley Updates
                                                </h2>
                                            </div>

                                            <div className="bg-black/5 p-4 rounded-xl border-l-2 border-tashi-accent/50">
                                                <ul className="space-y-3">
                                                    {valleyUpdates.map((update: any, idx: number) => (
                                                        <li key={idx} className="flex gap-3 group">
                                                            <div className="flex-shrink-0 mt-1.5">
                                                                <div className={`w-2 h-2 rounded-full ${update.statusColor === 'green' ? 'bg-green-500' : update.statusColor === 'blue' ? 'bg-blue-500' : update.statusColor === 'red' ? 'bg-red-500' : 'bg-tashi-accent'}`} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="font-semibold text-sm text-black">{update.title}</span>
                                                                    {update.description && (
                                                                        <span className="text-xs text-gray-500 leading-relaxed">{update.description}</span>
                                                                    )}

                                                                    {update.mediaUrl && (
                                                                        <div
                                                                            className="mt-2 rounded-lg overflow-hidden border border-black/10 bg-black cursor-pointer group/media relative h-32 w-full"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setFullScreenMedia({
                                                                                    url: update.mediaUrl!,
                                                                                    type: update.mediaType === 'video' ? 'video' : 'image',
                                                                                    title: update.title
                                                                                });
                                                                            }}
                                                                        >
                                                                            {update.mediaType === 'video' ? (
                                                                                <div className="w-full h-full bg-black flex items-center justify-center">
                                                                                    <PlayCircle className="text-white opacity-50" />
                                                                                    <video src={update.mediaUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                                                                </div>
                                                                            ) : (
                                                                                <img src={update.mediaUrl} alt={update.title} className="w-full h-full object-cover" />
                                                                            )}
                                                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity">
                                                                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                                                                                    {update.mediaType === 'video' ? <PlayCircle size={20} /> : <Info size={20} />}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <p className="text-[10px] text-gray-400 text-center mt-3 italic">Updated: {new Date().toLocaleDateString()}</p>
                                            </div>
                                        </section>
                                    )}

                                    {/* 2. Cold Weather Gears Section (Moved here) */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 bg-orange-500/20 rounded-lg text-orange-400">
                                                <ShoppingBag size={20} />
                                            </div>
                                            <h2 className="text-lg font-bold font-serif text-black tracking-tight">
                                                Cold Weather Gears <span className="text-orange-400 text-xs font-sans font-normal ml-1">By Locals</span>
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {gearItems?.map((item: any) => (
                                                <GearItemCard
                                                    key={item.id}
                                                    name={item.name}
                                                    price={item.price}
                                                    items={item.items}
                                                    badge={item.badge}
                                                    available={item.available}
                                                />
                                            ))}
                                        </div>

                                        <div className="mt-4 p-3 bg-orange-500/5 rounded-xl border border-orange-500/10 text-center">
                                            <p className="text-[10px] text-gray-400 leading-relaxed italic">
                                                Hand-knitted by local Spiti women. Ask staff for purchase.
                                            </p>
                                        </div>
                                    </section>

                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table Selection Modal */}
                <AnimatePresence>
                    {showTableSelector && (
                        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowTableSelector(false)}>
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white border border-black/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="text-center mb-4">
                                    <h3 className="text-xl font-bold text-black font-serif">Select Your Table</h3>
                                    <p className="text-gray-500 text-sm">Tap your table number to switch</p>
                                </div>

                                <div className="grid grid-cols-3 gap-3 overflow-y-auto p-1 custom-scrollbar">
                                    {tables.map((table: any) => (
                                        <button
                                            key={table.id}
                                            onClick={() => {
                                                setTableId(table.id);
                                                setShowTableSelector(false);
                                                // Reload page to ensure clean state for the new table session
                                                setTimeout(() => window.location.reload(), 100);
                                            }}
                                            className={`p-3 rounded-xl border font-bold text-lg transition-all ${currentTableId === table.id
                                                ? 'text-black'
                                                : 'bg-black/5 text-gray-500 border-black/10 hover:bg-black/10'
                                                }`}
                                            style={currentTableId === table.id ? { backgroundColor: menuAppearance.accentColor, borderColor: menuAppearance.accentColor } : {}}
                                        >
                                            {table.name}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowTableSelector(false)}
                                    className="mt-4 w-full py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 hover:text-black transition-colors text-sm uppercase tracking-wide"
                                >
                                    Cancel
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Navigation Selection Modal */}
                <AnimatePresence>
                    {showNavigationModal && (
                        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowNavigationModal(false)}>
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white border border-black/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-6"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-black font-serif mb-2">Direction</h3>
                                    <p className="text-gray-400 text-sm">Choose your wayfinding method</p>
                                </div>

                                <div className="space-y-4">
                                    {/* Option 1: Google Maps */}
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${contactInfo.mapsLocation}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 bg-black/5 p-4 rounded-2xl hover:bg-black/10 transition-colors border border-black/5 group"
                                    >
                                        <div className="bg-blue-500/20 p-3 rounded-full text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Reach Us</p>
                                            <p className="text-xs text-gray-500">Live GPS Directions</p>
                                        </div>
                                    </a>

                                    {/* Option 2: Local Map Loop (Interactive) */}
                                    <button
                                        onClick={() => {
                                            setMapAutoPlay(false);
                                            setShowNavigationModal(false);
                                            setTimeout(() => setShowMap(true), 200);
                                        }}
                                        className="w-full flex items-center gap-4 bg-black/5 p-4 rounded-2xl hover:bg-black/10 transition-colors border border-black/5 group text-left"
                                    >
                                        <div className="p-3 rounded-full transition-colors bg-gray-200 text-gray-600 group-hover:bg-gray-300">
                                            <Navigation size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Tourist Loop Map</p>
                                            <p className="text-xs text-gray-500">Interactive Schematic Guide</p>
                                        </div>
                                    </button>


                                </div>

                                <button
                                    onClick={() => setShowNavigationModal(false)}
                                    className="w-full py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 hover:text-black transition-colors text-sm uppercase tracking-wide"
                                >
                                    Cancel
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {showMap && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-4"
                            onClick={() => setShowMap(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 30 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 30 }}
                                className="bg-white border-0 md:border md:border-tashi-accent/20 rounded-none md:rounded-3xl w-full max-w-4xl overflow-hidden relative shadow-2xl flex flex-col h-[100dvh] md:h-auto md:max-h-[90vh]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
                                    <h3 className="text-xl font-bold text-tashi-accent font-serif pl-2">Local Guide Map</h3>
                                    <button
                                        onClick={() => setShowMap(false)}
                                        className="w-10 h-10 bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center text-black transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-hidden bg-black/5 p-0 relative flex flex-col">
                                    <LocalMapGuide autoPlay={mapAutoPlay} />
                                </div>

                                <div className="p-4 bg-black/20 text-center border-t border-white/5 hidden md:block">
                                    <p className="text-gray-400 text-xs">
                                        The road connects Chicham Bridge & TashiZom directly. No need to go back!
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>



                {/* More Info Modal */}
                <AnimatePresence>
                    {showMoreInfoModal && (
                        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowMoreInfoModal(false)}>
                            <div className="bg-white border border-black/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-black font-serif">More Info</h3>
                                        <p className="text-sm text-gray-500">About TashiZom</p>
                                    </div>
                                    <button onClick={() => setShowMoreInfoModal(false)} className="bg-black/10 p-1 rounded-full text-black hover:bg-black/20"><X size={20} /></button>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                                        <p className="text-sm text-gray-700"><strong>Opening Hours:</strong> 8:00 AM - 10:00 PM</p>
                                        <p className="text-sm text-gray-700"><strong>Location:</strong> Near Chicham Bridge, Kibber</p>
                                        <p className="text-sm text-gray-700"><strong>Cuisine:</strong> Multi-Cuisine (Indian, Chinese, Tibetan, Pizza)</p>
                                    </div>
                                    <div className="text-xs text-gray-500 text-center pt-2">
                                        Designed & Powered by <span className="font-bold text-tashi-accent">Antigravity</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Contact Info Modal */}
                {
                    showContactInfo && (
                        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowContactInfo(false)}>
                            <div className="bg-white border border-black/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-black font-serif">Contact Us</h3>
                                        <p className="text-sm text-gray-500">We are here to help!</p>
                                    </div>
                                    <button onClick={() => setShowContactInfo(false)} className="bg-black/10 p-1 rounded-full text-black hover:bg-black/20"><X size={20} /></button>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-4 bg-black/5 p-4 rounded-xl hover:bg-black/10 transition-colors border border-black/5 group">
                                        <div className="bg-green-500/20 p-3 rounded-full text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">Call Staffs</p>
                                            <p className="text-xs text-gray-500">{contactInfo.phone}</p>
                                        </div>
                                    </a>

                                    {contactInfo.secondaryPhone && (
                                        <a href={`tel:${contactInfo.secondaryPhone}`} className="flex items-center gap-4 bg-black/5 p-4 rounded-xl hover:bg-black/10 transition-colors border border-black/5 group">
                                            <div className="bg-green-500/20 p-3 rounded-full text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                                <Phone size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">Call Owner</p>
                                                <p className="text-xs text-gray-500">{contactInfo.secondaryPhone}</p>
                                            </div>
                                        </a>
                                    )}

                                    <a href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" className="flex items-center gap-4 bg-black/5 p-4 rounded-xl hover:bg-black/10 transition-colors border border-black/5 group">
                                        <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                            <MessageCircle size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">WhatsApp</p>
                                            <p className="text-xs text-gray-500">Chat with us</p>
                                        </div>
                                    </a>



                                    {/* Removed Duplicate WhatsApp Button */}


                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Review Modal */}
                <AnimatePresence>
                    {showReviewModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                            onClick={() => setShowReviewModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white border border-black/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-black font-serif">Rate Us</h3>
                                        <p className="text-sm text-gray-500">Tell us about your experience</p>
                                    </div>
                                    <button onClick={() => setShowReviewModal(false)} className="bg-black/10 p-1 rounded-full text-black hover:bg-black/20"><X size={20} /></button>
                                </div>

                                <div className="space-y-4 pt-2">
                                    {/* Stars */}
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setReviewRating(star)}
                                                className={`p-1 transition-all ${reviewRating >= star ? 'text-tashi-accent scale-110' : 'text-gray-600'}`}
                                            >
                                                <Star size={32} fill={reviewRating >= star ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Inputs */}
                                    <input
                                        type="text"
                                        placeholder="Your Name (Optional)"
                                        value={reviewName}
                                        onChange={(e) => setReviewName(e.target.value)}
                                        className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-black placeholder:text-gray-500 focus:outline-none focus:border-tashi-accent/50"
                                    />

                                    <textarea
                                        placeholder="Share your feedback..."
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-black placeholder:text-gray-500 focus:outline-none focus:border-tashi-accent/50 min-h-[100px] resize-none"
                                    />

                                    <button
                                        onClick={() => {
                                            addReview({
                                                customerName: reviewName || 'Guest',
                                                rating: reviewRating,
                                                comment: reviewComment
                                            });
                                            setShowReviewModal(false);
                                            setReviewComment('');
                                            setReviewRating(5);
                                            setReviewName('');
                                        }}
                                        disabled={!reviewComment.trim()}
                                        className="w-full bg-tashi-accent text-tashi-dark font-bold py-3 rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Send size={18} />
                                        Submit Review
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Full Screen Media Overlay (Plays inside app) */}
                <AnimatePresence>
                    {fullScreenMedia && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center touch-none"
                        >
                            {/* Header with Title and Close */}
                            <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                                <div className="flex-1">
                                    <h4 className="text-white font-serif font-bold text-lg">{fullScreenMedia.title || 'Valley Update'}</h4>
                                    <p className="text-gray-400 text-[10px] uppercase tracking-widest">TashiZom Newsroom</p>
                                </div>
                                <button
                                    onClick={() => setFullScreenMedia(null)}
                                    className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all transform hover:rotate-90"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content Container */}
                            <motion.div
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="w-full h-full flex items-center justify-center p-2"
                            >
                                {fullScreenMedia.type === 'video' ? (
                                    (() => {
                                        const youtubeId = getYouTubeId(fullScreenMedia.url);
                                        if (youtubeId) {
                                            return (
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                                                    className="w-full aspect-video max-w-4xl shadow-2xl rounded-xl border border-white/5"
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                />
                                            );
                                        }
                                        return (
                                            <video
                                                src={fullScreenMedia.url}
                                                controls
                                                autoPlay
                                                playsInline
                                                className="w-full max-h-[85vh] object-contain shadow-2xl rounded-xl"
                                            />
                                        );
                                    })()
                                ) : (
                                    <img
                                        src={fullScreenMedia.url}
                                        alt="Full screen view"
                                        className="w-full max-h-[85vh] object-contain shadow-2xl rounded-xl"
                                    />
                                )}
                            </motion.div>

                            {/* Backdrop Blur Helper */}
                            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                                <p className="text-gray-500 text-[10px] uppercase">Scroll to exit or use the back button</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* PREMIUM ITEM DETAIL MODAL */}
                <AnimatePresence>
                    {selectedItem && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center pointer-events-auto"
                            onClick={() => setSelectedItem(null)}
                        >
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="w-full md:max-w-xl h-[85vh] md:h-auto md:max-h-[90vh] bg-white rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-all"
                                >
                                    <X size={24} />
                                </button>

                                {/* Image Hero Section */}
                                <div className="h-64 md:h-72 bg-gray-100 relative shrink-0">
                                    {selectedItem.image ? (
                                        <img
                                            src={selectedItem.image}
                                            alt={selectedItem.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex flex-col items-center justify-center text-white/20">
                                            <span className="text-4xl font-serif font-bold opacity-30">TashiZom</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />

                                    {/* Navigation Arrows (if context exists) */}
                                    {selectedItemContext.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePrevItem(); }}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-all active:scale-95"
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleNextItem(); }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-all active:scale-95"
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Content Scrollable Area */}
                                <div className="flex-1 overflow-y-auto px-6 pt-2 pb-24">
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-2xl font-black font-serif text-gray-900 leading-tight">
                                            {selectedItem.name}
                                        </h2>
                                        <div className={`p-1.5 rounded-full border ${selectedItem.isVegetarian ? 'border-green-500' : 'border-red-500'}`}>
                                            <div className={`w-2 h-2 rounded-full ${selectedItem.isVegetarian ? 'bg-green-500' : 'bg-red-500'}`} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-2xl font-bold" style={{ color: menuAppearance.accentColor }}>
                                            ₹{selectedItem.price}
                                        </span>
                                        {selectedItem.available === false && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded-full border border-red-200">
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        {selectedItem.description || "A delicious preparation made with fresh ingredients and authentic spices from the valley."}
                                    </p>

                                    {/* Additional Info / Tags Placeholder */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {selectedItem.isChefSpecial && (
                                            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200 flex items-center gap-1">
                                                <Star size={12} className="fill-amber-800" /> Chef's Special
                                            </span>
                                        )}
                                        {selectedItem.isSpicy && (
                                            <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
                                                🌶️ Spicy
                                            </span>
                                        )}
                                    </div>

                                </div>

                                {/* Sticky Bottom Action Bar */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center gap-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                                    {getQuantity(selectedItem.id) > 0 ? (
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <div className="flex items-center bg-gray-100 rounded-xl h-14 px-2 ring-1 ring-black/5 flex-1 max-w-[140px] justify-between">
                                                <button
                                                    onClick={() => removeFromCart(selectedItem.id)}
                                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-lg transition-all"
                                                >
                                                    <Minus size={20} />
                                                </button>
                                                <span className="font-bold text-xl text-gray-900">{getQuantity(selectedItem.id)}</span>
                                                <button
                                                    onClick={() => addToCart(selectedItem)}
                                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-white rounded-lg transition-all"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setSelectedItem(null)}
                                                className="flex-1 bg-black text-white h-14 rounded-xl font-bold shadow-xl active:scale-95 transition-all text-sm uppercase tracking-wider"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (selectedItem.available !== false) {
                                                    addToCart(selectedItem);
                                                }
                                            }}
                                            disabled={selectedItem.available === false}
                                            className={`w-full h-14 rounded-xl font-bold shadow-xl active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 ${selectedItem.available === false
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'text-white'
                                                }`}
                                            style={selectedItem.available !== false ? { backgroundColor: menuAppearance.accentColor } : {}}
                                        >
                                            {selectedItem.available === false ? 'Currently Unavailable' : 'Add to Order'}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating "View Cart" Button - Only visible if Cart has items */}
                <AnimatePresence>
                    {cart.length > 0 && !selectedItem && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-24 left-4 right-4 z-[140] pointer-events-auto"
                        >
                            <Link href="/customer/cart">
                                <button className="w-full bg-black text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 active:scale-95 transition-transform" style={{ boxShadow: `0 10px 30px -10px ${menuAppearance.accentColor}66` }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                                            {cart.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-sm">View Your Order</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{cart.length} items added</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pr-2">
                                        <span className="font-bold text-lg" style={{ color: menuAppearance.accentColor }}>
                                            ₹{cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)}
                                        </span>
                                        <ChevronRight size={18} className="text-gray-500" />
                                    </div>
                                </button>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}
