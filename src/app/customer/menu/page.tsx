'use client';

import { useStore, Category, MenuItem } from '@/lib/store';
import { Plus, Bell, Newspaper, Leaf, Drumstick, Phone, X, Info, MessageCircle, MapPin } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';

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

export default function MenuPage() {
    const menu = useStore((state) => state.menu);
    const cart = useStore((state) => state.cart);
    const addToCart = useStore((state) => state.addToCart);
    const currentTableId = useStore((state) => state.currentTableId);
    const notifications = useStore((state) => state.notifications);
    const addNotification = useStore((state) => state.addNotification);
    const cancelNotification = useStore((state) => state.cancelNotification);
    const valleyUpdates = useStore((state) => state.valleyUpdates);
    const contactInfo = useStore((state) => state.contactInfo);

    // Dynamic Categories derived from Menu
    const allCategories = Array.from(new Set(menu.map(item => item.category)));

    // Define a preferred order for standard categories
    const PREFERRED_ORDER = ['Starters', 'Main Course', 'Beverages', 'Dessert'];

    // Sort categories: Preferred ones first, then alphabetical for the rest
    const CATEGORIES = [
        ...PREFERRED_ORDER.filter(c => allCategories.includes(c)),
        ...allCategories.filter(c => !PREFERRED_ORDER.includes(c)).sort()
    ];

    const [activeCategory, setActiveCategory] = useState<Category>('Starters');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'veg' | 'non-veg'>('all');
    const [showAllUpdates, setShowAllUpdates] = useState(false);
    const [showContactInfo, setShowContactInfo] = useState(false);

    // Ensure active category is valid (fallback to first available if current selection is empty/invalid)
    useEffect(() => {
        if (CATEGORIES.length > 0 && !CATEGORIES.includes(activeCategory)) {
            setActiveCategory(CATEGORIES[0]);
        }
    }, [CATEGORIES, activeCategory]);

    const filteredItems = menu.filter((item) => {
        if (item.category !== activeCategory) return false;
        if (filterType === 'veg') return item.isVegetarian;
        if (filterType === 'non-veg') return !item.isVegetarian;
        return true;
    });

    const getQuantity = (id: string) => {
        return cart.find((i) => i.menuItemId === id)?.quantity || 0;
    };

    // Check if there is already a pending call for this table
    const hasPendingCall = notifications.some(n => n.tableId === currentTableId && n.type === 'call_staff' && n.status === 'pending');

    const handleCallStaff = () => {
        if (!currentTableId) return;
        if (hasPendingCall) {
            cancelNotification(currentTableId, 'call_staff');
        } else {
            addNotification(currentTableId, 'call_staff');
        }
    };

    return (
        <div className="pb-24 pointer-events-auto">
            {/* Bottom Action Bar - Horizontal */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-xl border-t border-white/10 pointer-events-auto">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-around gap-2">
                    {/* Call Staff Button */}
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCallStaff}
                        className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${hasPendingCall
                            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
                            : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-white/10'
                            }`}
                    >
                        {hasPendingCall ? <X size={24} /> : <Phone size={24} />}
                        <span className="text-[10px] uppercase tracking-wider font-bold">
                            {hasPendingCall ? 'Cancel' : 'Call Staff'}
                        </span>
                    </motion.button>

                    {/* Contact Button */}
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowContactInfo(true)}
                        className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 border border-blue-400/30 shadow-lg shadow-blue-500/40 transition-all"
                    >
                        <Info size={24} />
                        <span className="text-[10px] uppercase tracking-wider font-bold">
                            Contact
                        </span>
                    </motion.button>

                    {/* Rate Us Button */}
                    <Link href="/customer/feedback">
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 border border-white/10 transition-all"
                        >
                            <Newspaper size={24} />
                            <span className="text-[10px] uppercase tracking-wider font-bold">
                                Rate Us
                            </span>
                        </motion.button>
                    </Link>
                </div>
            </div>

            {/* Mini Timer for Active Orders */}
            <MiniOrderTimer />

            {/* Veg/Non-Veg Toggle Filter */}
            <div className="px-1 mt-6 mb-2 flex justify-end">
                <div className="bg-neutral-900 border border-white/10 rounded-lg p-1 flex gap-1">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType('veg')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${filterType === 'veg' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-500 hover:text-green-400'}`}
                    >
                        <Leaf size={10} /> Veg
                    </button>
                    <button
                        onClick={() => setFilterType('non-veg')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${filterType === 'non-veg' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-500 hover:text-red-400'}`}
                    >
                        <Drumstick size={10} /> Non-Veg
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="sticky top-[60px] z-40 bg-tashi-darker/95 backdrop-blur-md -mx-4 px-4 border-b border-white/5 pt-2 pb-4">
                <div className="flex overflow-x-auto gap-3 hide-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`relative whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeCategory === cat
                                ? 'text-tashi-dark'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {activeCategory === cat && (
                                <motion.div
                                    layoutId="activePill"
                                    className="absolute inset-0 bg-tashi-accent rounded-full shadow-[0_0_15px_rgba(218,165,32,0.4)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{cat}</span>
                        </button>
                    ))}
                    {CATEGORIES.length === 0 && (
                        <div className="px-4 py-2 text-gray-500 text-sm italic">Loading categories...</div>
                    )}
                </div>
            </div>

            {/* Menu Grid */}
            <div className="mt-6">
                <motion.div
                    key={activeCategory}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    {filteredItems.map((item) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            quantity={getQuantity(item.id)}
                            onAdd={() => addToCart(item)}
                            onSelect={() => setSelectedItem(item)}
                        />
                    ))}
                </motion.div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-20 text-gray-500 italic">
                        No items found in {activeCategory}.
                    </div>
                )}

                {/* Item Details Modal */}
                <AnimatePresence>
                    {selectedItem && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                            onClick={() => setSelectedItem(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white"
                                >
                                    <X size={20} />
                                </button>

                                <div className="h-64 w-full relative">
                                    {selectedItem.image ? (
                                        <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                            <span className="text-gray-600 font-bold text-xl uppercase tracking-widest">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-white/10 flex items-center gap-2">
                                            {selectedItem.isVegetarian ? (
                                                <>
                                                    <Leaf size={14} className="text-green-400 fill-green-400/20" />
                                                    <span className="text-xs text-green-400 font-bold uppercase">Veg</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Drumstick size={14} className="text-red-400 fill-red-400/20" />
                                                    <span className="text-xs text-red-400 font-bold uppercase">Non-Veg</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2 font-serif">{selectedItem.name}</h2>
                                        <p className="text-gray-400 leading-relaxed">{selectedItem.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <span className="text-3xl font-serif text-tashi-accent">₹{selectedItem.price}</span>

                                        <div className="flex items-center gap-4">
                                            {getQuantity(selectedItem.id) > 0 && (
                                                <span className="font-bold text-white bg-tashi-primary px-3 py-1 rounded-full">
                                                    in cart: {getQuantity(selectedItem.id)}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => {
                                                    addToCart(selectedItem);
                                                    setSelectedItem(null);
                                                }}
                                                disabled={selectedItem.available === false}
                                                className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

            {/* Local News Section - Animated */}
            {valleyUpdates.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-12 bg-neutral-900/50 rounded-2xl p-6 border border-white/5 mx-1 relative overflow-hidden"
                >
                    {/* Animated background pulse */}
                    <div className="absolute inset-0 bg-gradient-to-r from-tashi-accent/5 via-transparent to-tashi-accent/5 animate-pulse pointer-events-none" />

                    <div className="relative z-10">
                        {/* Header with pulsing LIVE indicator */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-tashi-accent font-serif text-xl font-bold flex items-center gap-2">
                                <Newspaper size={20} className="animate-pulse" /> Valley Updates
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping absolute" />
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Live</span>
                            </div>
                        </div>


                        {/* Consolidated card with all updates as bullets */}
                        <div className="bg-black/40 p-5 rounded-xl border-l-2 border-tashi-accent/50">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-gray-200 font-bold text-base">Latest News & Updates</span>
                                <motion.span
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="bg-tashi-accent/20 text-tashi-accent text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-tashi-accent/30"
                                >
                                    {valleyUpdates.length} New {valleyUpdates.length === 1 ? 'Update' : 'Updates'}
                                </motion.span>
                            </div>

                            {/* Updates as bullet points with staggered animation */}
                            <motion.ul
                                className="space-y-3"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {valleyUpdates.map((update, idx) => (
                                    <motion.li
                                        key={idx}
                                        variants={itemVariants}
                                        className="flex gap-3 group"
                                    >
                                        {/* Colored bullet indicator based on status */}
                                        <div className="flex-shrink-0 mt-1.5">
                                            <motion.div
                                                animate={{ scale: [1, 1.3, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                                                className={`w-2 h-2 rounded-full ${update.statusColor === 'green' ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' :
                                                    update.statusColor === 'blue' ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]' :
                                                        update.statusColor === 'red' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]' :
                                                            'bg-tashi-accent shadow-[0_0_6px_rgba(218,165,32,0.6)]'
                                                    }`}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm text-gray-300 leading-relaxed">
                                                    <span className="font-semibold text-white">{update.title}</span>
                                                    {update.description && (
                                                        <span className="text-gray-400"> — {update.description}</span>
                                                    )}
                                                </p>
                                                {update.status && update.status.toLowerCase() !== 'create' && (
                                                    <span className={`flex-shrink-0 inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${update.statusColor === 'green' ? 'bg-green-500/20 text-green-400' :
                                                        update.statusColor === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                                            update.statusColor === 'red' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {update.status}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Show media if available */}
                                            {update.mediaUrl && (
                                                <div className="mt-2 rounded-lg overflow-hidden border border-white/5 bg-black">
                                                    {update.mediaType === 'video' ? (
                                                        <video src={update.mediaUrl} controls className="w-full max-h-48 object-cover" />
                                                    ) : (
                                                        <img src={update.mediaUrl} alt={update.title} className="w-full max-h-48 object-cover" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </div>

                        <p className="text-[10px] text-gray-600 text-center mt-3 italic">Updated: {new Date().toLocaleDateString()} • Ask staff for details</p>
                    </div>
                </motion.div>
            )}

            {/* Contact Info Modal */}
            {showContactInfo && (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowContactInfo(false)}>
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white font-serif">Contact Us</h3>
                                <p className="text-sm text-gray-400">We are here to help!</p>
                            </div>
                            <button onClick={() => setShowContactInfo(false)} className="bg-white/10 p-1 rounded-full text-white hover:bg-white/20"><X size={20} /></button>
                        </div>

                        <div className="space-y-3 pt-2">
                            <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group">
                                <div className="bg-green-500/20 p-3 rounded-full text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-200">Call Us</p>
                                    <p className="text-xs text-gray-500">{contactInfo.phone}</p>
                                </div>
                            </a>

                            <a href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" className="flex items-center gap-4 bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group">
                                <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-200">WhatsApp</p>
                                    <p className="text-xs text-gray-500">Chat with us</p>
                                </div>
                            </a>

                            <a href={`https://maps.google.com/?q=${contactInfo.mapsLocation}`} target="_blank" className="flex items-center gap-4 bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group">
                                <div className="bg-blue-500/20 p-3 rounded-full text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-200">Get Directions</p>
                                    <p className="text-xs text-gray-500">Locate us on Maps</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



function MenuItemCard({ item, quantity, onAdd, onSelect }: { item: MenuItem; quantity: number; onAdd: () => void; onSelect: () => void }) {
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
            <div className="w-32 h-32 bg-neutral-800 rounded-xl flex-shrink-0 relative overflow-hidden border border-white/5 cursor-pointer">
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
                <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-white/10">
                    {item.isVegetarian ? (
                        <Leaf size={14} className="text-green-400 fill-green-400/20" />
                    ) : (
                        <Drumstick size={14} className="text-red-400 fill-red-400/20" />
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
                    <h3 className="font-bold text-gray-100 text-lg leading-tight mb-1">{item.name}</h3>
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
                    <span className="font-serif text-xl text-tashi-accent">₹{item.price}</span>

                    {quantity === 0 ? (
                        <motion.button
                            whileHover={isAvailable ? { scale: 1.1 } : {}}
                            whileTap={isAvailable ? { scale: 0.9 } : {}}
                            onClick={isAvailable ? onAdd : undefined}
                            disabled={!isAvailable}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-dashed ${isAvailable
                                ? 'bg-white/5 hover:bg-tashi-primary text-tashi-accent hover:text-white border-tashi-accent/30 cursor-pointer'
                                : 'bg-neutral-800 text-gray-600 border-gray-700 cursor-not-allowed'
                                }`}
                        >
                            <Plus size={20} />
                        </motion.button>
                    ) : (
                        <div className="flex items-center bg-tashi-primary rounded-full px-1 py-1 shadow-lg shadow-tashi-primary/30">
                            <span className="px-3 text-sm font-bold text-white">x{quantity}</span>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={onAdd}
                                className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white"
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

function MiniOrderTimer() {
    const orders = useStore((state) => state.orders);
    const currentTableId = useStore((state) => state.currentTableId);
    const sessionId = useStore((state) => state.sessionId);

    // Find the latest active order for THIS session
    const activeOrder = orders
        .filter(o =>
            o.tableId === currentTableId &&
            o.sessionId === sessionId &&
            (o.status === 'Pending' || o.status === 'Preparing')
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

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
}

function MiniTimerDisplay({ startTime }: { startTime: Date | string }) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const start = new Date(startTime).getTime();
            const now = new Date().getTime();
            // Estimate 30 mins
            const end = start + 30 * 60 * 1000;
            const diff = Math.max(0, end - now);
            setTimeLeft(diff);
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const mins = Math.floor((timeLeft / 1000 / 60) % 60);
    const secs = Math.floor((timeLeft / 1000) % 60);

    return (
        <span className="font-mono font-bold text-sm">
            {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </span>
    );
}
