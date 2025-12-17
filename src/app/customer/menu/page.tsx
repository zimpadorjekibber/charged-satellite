'use client';

import { useStore, Category, MenuItem, Table, Order } from '../../../lib/store';
import { Plus, Minus, Bell, Newspaper, Leaf, Drumstick, Phone, X, Info, MessageCircle, MapPin, Sparkles, Navigation, Star, Send, ChevronLeft, ChevronRight, UtensilsCrossed, Utensils, Loader2 } from 'lucide-react';

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

export default function MenuPage() {
    const menu = useStore((state: any) => state.menu);
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

    const [showAllUpdates, setShowAllUpdates] = useState(false); // Controls Valley Updates expansion
    const [showContactInfo, setShowContactInfo] = useState(false);
    const [showNavigationModal, setShowNavigationModal] = useState(false);
    const [showMap, setShowMap] = useState(false);
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

    // Winter Notification Logic
    const [showWinterNote, setShowWinterNote] = useState(false);

    useEffect(() => {
        const now = new Date();
        const month = now.getMonth(); // 0 = Jan, 11 = Dec
        // Nov (10), Dec(11), Jan(0), Feb(1), Mar(2), Apr(3)
        // If current month is >= 10 OR <= 3, it's Winter in Spiti.
        const isWinter = month >= 10 || month <= 3;

        if (isWinter) {
            // Check if already dismissed in this session
            const dismissed = sessionStorage.getItem('winterNoteDismissed');
            if (!dismissed) {
                setShowWinterNote(true);
            }
        }
    }, []);

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
        const activeOrder = orders.find(o =>
            o.sessionId === sessionId &&
            ['Pending', 'Preparing', 'Ready', 'Served'].includes(o.status)
        );

        if (activeOrder && activeOrder.tableId) {
            const isRealTable = activeOrder.tableId !== 'REQUEST' && activeOrder.tableId !== 'Remote';

            // If we have a real table assigned and it differs from our local state
            if (isRealTable && activeOrder.tableId !== currentTableId) {
                console.log('Syncing assigned table:', activeOrder.tableId);
                setTableId(activeOrder.tableId);

                // Optional: We could trigger a notification here
                // addNotification(activeOrder.tableId, 'info', { message: 'Table Assigned!' });
            }
        }
    }, [orders, sessionId, currentTableId, setTableId]);


    const getQuantity = (id: string) => {
        return cart.find((i) => i.menuItemId === id)?.quantity || 0;
    };

    // Check if there is already a pending call for this table
    // Calculate effective table ID (handles Remote/Request cases)
    const myOrders = orders.filter((o: Order) => o.sessionId === sessionId);
    const lastOrder = myOrders[0];
    const callTableId = currentTableId || lastOrder?.tableId || 'REQUEST';

    // Check if there is already a pending call for this table
    const pendingCallNotification = notifications.find(n =>
        n.tableId === callTableId &&
        n.type === 'call_staff' &&
        n.status === 'pending' &&
        (callTableId !== 'REQUEST' || n.sessionId === sessionId)
    );
    const hasPendingCall = !!pendingCallNotification;

    // Check for active order (Expanded definition)
    const hasActiveOrder = orders.some(o =>
        o.sessionId === sessionId &&
        ['Pending', 'Preparing', 'Ready', 'Served'].includes(o.status)
    );

    // Local state for "Calling" visual/audio feedback
    const [isCalling, setIsCalling] = useState(false);
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
        let interval: NodeJS.Timeout;
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
        // If already calling, allow "Cut Call" - This cancels the notification on BOTH sides
        if (isCalling) {
            // Stop local audio and visual feedback
            if (callSoundRef.current) {
                callSoundRef.current.pause();
                callSoundRef.current.currentTime = 0;
            }
            setIsCalling(false);

            // Cancel the server-side notification so staff's phone stops ringing too
            const myOrders = orders.filter(o => o.sessionId === sessionId);
            const lastOrder = myOrders[0];
            const tableIdToUse = currentTableId || lastOrder?.tableId || 'REQUEST';

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
                if (!activeCall && (currentTableId || lastOrder?.tableId)) {
                    const checkTableId = currentTableId || lastOrder?.tableId;
                    activeCall = notifications.find(
                        (n: any) => n.tableId === checkTableId && n.type === 'call_staff' && n.status === 'pending'
                    );
                }

                if (activeCall && !activeCall.id.startsWith('temp_')) {
                    console.log("Cancelling Call with ID:", activeCall.id);
                    await resolveNotification(activeCall.id);
                } else {
                    // Fallback to table-based cancellation if ID is temp or not found
                    const tableIdToUse = currentTableId || lastOrder?.tableId || 'REQUEST';
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
        const callStaffRadius = useStore.getState().callStaffRadius || 50; // Get from settings, default 50m

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

                    console.log(`Call Staff Geofence: Distance = ${distanceMeters.toFixed(0)}m, Limit = ${callStaffRadius}m`);

                    if (distanceMeters > callStaffRadius) {
                        // Customer is too far - show phone number for direct call
                        const phoneNumber = contactInfo.phone || contactInfo.secondaryPhone;
                        if (confirm(`You are ${distanceMeters.toFixed(0)}m away from the restaurant.\n\nThe "Call Staff" feature is only available when you're at the restaurant (within ${callStaffRadius}m).\n\nWould you like to call us directly at ${phoneNumber}?`)) {
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
        const myOrders = orders.filter(o => o.sessionId === sessionId);
        const lastOrder = myOrders[0]; // Orders are sorted desc

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
                customerName: lastOrder?.customerName || 'Guest',
                customerPhone: lastOrder?.customerPhone || '',
                sessionId: sessionId || undefined
            });

            // SUCCESS FEEDBACK
            setLastCallTime(Date.now()); // Update cooldown timer
            setCallSuccessToast(true);
            setTimeout(() => setCallSuccessToast(false), 3500); // Hide toast after 3.5 seconds
        } catch (e) {
            console.error("Failed to call staff:", e);
            alert("Failed to send notification. Please try calling the number directly.");
            setIsCalling(false);
            if (callSoundRef.current) {
                callSoundRef.current.pause();
            }
        }
    };

    return (
        <div className="pb-32 pointer-events-auto min-h-[100dvh] relative">
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
                            className="bg-neutral-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
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

            {/* Bottom Action Bar - Horizontal */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-md border-t border-white/10 pointer-events-auto">
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
                                    ? 'bg-neutral-800 text-gray-400 cursor-wait'
                                    : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-white/10'
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
                        className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 border border-white/10 active:scale-95 transition-transform"
                    >
                        <Navigation size={24} />
                        <span className="text-[10px] uppercase tracking-wider font-bold">
                            Navigate
                        </span>
                    </button>
                </div>
            </div>

            {/* Mini Timer for Active Orders */}
            <MiniOrderTimer />

            {/* Top Toolbar: Map Icon & Filters */}
            <div className="px-1 mt-6 mb-2 flex justify-between items-center">
                {/* Local Map Shortcut */}
                {/* Review Shortcut */}
                <button
                    onClick={() => setShowReviewModal(true)}
                    className="ml-1 bg-neutral-900 border border-white/10 rounded-lg p-2 text-tashi-accent hover:bg-white/10 transition-colors shadow-lg shadow-black/20"
                    aria-label="Write a Review"
                >
                    <Star size={18} />
                </button>

                <div className="bg-neutral-900 border border-white/10 rounded-lg p-1 flex gap-1">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
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
            <div className="sticky top-[60px] z-40 bg-tashi-darker/95 backdrop-blur-md -mx-4 px-4 border-b border-white/5 pt-2 pb-4">
                <div ref={categoryScrollContainerRef} className="flex overflow-x-auto gap-3 hide-scrollbar snap-x">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            id={`tab-${cat}`}
                            onClick={() => scrollToCategory(cat)}
                            className={`relative whitespace-nowrap px-8 py-3 rounded-full text-base font-bold transition-all duration-300 snap-center ${activeCategory === cat
                                ? 'text-tashi-dark scale-105'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {activeCategory === cat && (
                                <div
                                    className="absolute inset-0 bg-tashi-accent rounded-full shadow-[0_0_15px_rgba(218,165,32,0.4)]"
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

            {/* Current Table Indicator - Only show if Table ID is set but not 'REQUEST' */}
            {currentTableId && currentTableId !== 'REQUEST' && currentTableId !== 'Remote' && (
                <div className="mx-4 mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                            <Utensils size={18} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">Ordering for</p>
                            <p className="text-white font-bold text-lg">Table {tables.find(t => t.id === currentTableId)?.name || currentTableId}</p>
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
                const chefSpecialItems = menu.filter(item => item.isChefSpecial && (filterType === 'all' || (filterType === 'veg' ? item.isVegetarian : !item.isVegetarian)));
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
                        .filter((item) => {
                            if (item.category !== cat) return false;
                            if (filterType === 'veg') return item.isVegetarian;
                            if (filterType === 'non-veg') return !item.isVegetarian;
                            return true;
                        })
                        .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)); // Sort by admin-defined order

                    if (categoryItems.length === 0) return null;

                    return (
                        <section key={cat} id={cat} className="scroll-mt-32">
                            {/* Typewriter Header */}
                            <div className="flex items-center gap-4 mb-6 sticky top-[130px] z-30 py-2 bg-gradient-to-b from-black via-black/90 to-transparent backdrop-blur-sm -mx-2 px-2">
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
                                <h2 className="text-xl font-bold font-serif text-tashi-accent uppercase tracking-widest text-shadow-glow">
                                    {cat}
                                </h2>
                                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
                            </div>

                            {/* Items WITH images - Display as cards */}
                            {categoryItems.filter(item => item.image).length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                    {categoryItems.filter(item => item.image).map((item) => (
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
                            {categoryItems.filter(item => !item.image).length > 0 && (
                                <div className="space-y-2">
                                    {categoryItems.filter(item => !item.image).map((item) => (
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
                    menu.filter(i => i.category === cat &&
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
                            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                            onClick={() => setSelectedItem(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl"
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
                                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
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
                                        <h2 className="text-2xl font-bold text-white mb-2 font-serif">{selectedItem.name}</h2>
                                        <p className="text-gray-400 leading-relaxed">{selectedItem.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
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

            {/* Valley Updates - Collapsible Bottom Sheet */}
            {
                valleyUpdates.length > 0 && (
                    <div className="mt-8 mx-1 mb-6">
                        <motion.div
                            initial={false}
                            animate={{ height: showAllUpdates ? 'auto' : '60px' }}
                            className={`bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden relative transition-all duration-300 ${showAllUpdates ? 'shadow-2xl ring-1 ring-tashi-accent/30' : 'hover:bg-neutral-900'
                                }`}
                            onClick={() => setShowAllUpdates(!showAllUpdates)}
                        >
                            {/* Header (Always Visible) */}
                            <div className="absolute top-0 left-0 right-0 h-[60px] flex items-center justify-between px-6 cursor-pointer z-10">
                                <h3 className="text-tashi-accent font-serif text-lg font-bold flex items-center gap-2">
                                    <Newspaper size={18} className={showAllUpdates ? '' : 'animate-pulse'} />
                                    Valley Updates
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${showAllUpdates ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'}`}>
                                        {showAllUpdates ? 'Close' : `${valleyUpdates.length} NEW`}
                                    </span>
                                    {showAllUpdates ? <Minus size={16} className="text-gray-400" /> : <Plus size={16} className="text-gray-400" />}
                                </div>
                            </div>

                            {/* Expandable Content */}
                            <div className="pt-[70px] px-6 pb-6">
                                {/* Consolidated card with all updates as bullets */}
                                <div className="bg-black/40 p-5 rounded-xl border-l-2 border-tashi-accent/50">
                                    <motion.ul
                                        className="space-y-3"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate={showAllUpdates ? "show" : "hidden"}
                                    >
                                        {valleyUpdates.map((update, idx) => (
                                            <motion.li
                                                key={idx}
                                                variants={itemVariants}
                                                className="flex gap-3 group"
                                            >
                                                {/* Colored bullet indicator based on status */}
                                                <div className="flex-shrink-0 mt-1.5">
                                                    <div
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
                                                                <span className="text-gray-400"> - {update.description}</span>
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
                                                                (() => {
                                                                    // Helper to detect and format YouTube URLs
                                                                    const getYouTubeId = (url: string) => {
                                                                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                                                        const match = url.match(regExp);
                                                                        return (match && match[2].length === 11) ? match[2] : null;
                                                                    };
                                                                    const youtubeId = getYouTubeId(update.mediaUrl || '');

                                                                    if (youtubeId) {
                                                                        return (
                                                                            <iframe
                                                                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                                                                className="w-full aspect-video"
                                                                                title="YouTube video player"
                                                                                frameBorder="0"
                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                                allowFullScreen
                                                                            />
                                                                        );
                                                                    }
                                                                    // Fallback for direct MP4 files
                                                                    return <video src={update.mediaUrl} controls className="w-full max-h-48 object-cover" />;
                                                                })()
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
                    </div>
                )
            }
            {/* Table Selection Modal */}
            <AnimatePresence>
                {showTableSelector && (
                    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowTableSelector(false)}>
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-bold text-white font-serif">Select Your Table</h3>
                                <p className="text-gray-400 text-sm">Tap your table number to switch</p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 overflow-y-auto p-1 custom-scrollbar">
                                {tables.map((table) => (
                                    <button
                                        key={table.id}
                                        onClick={() => {
                                            setTableId(table.id);
                                            setShowTableSelector(false);
                                            // Reload page to ensure clean state for the new table session
                                            setTimeout(() => window.location.reload(), 100);
                                        }}
                                        className={`p-3 rounded-xl border font-bold text-lg transition-all ${currentTableId === table.id
                                            ? 'bg-tashi-accent text-black border-tashi-accent'
                                            : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        {table.name}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowTableSelector(false)}
                                className="mt-4 w-full py-3 rounded-xl bg-neutral-800 text-gray-400 font-bold hover:bg-neutral-700 hover:text-white transition-colors text-sm uppercase tracking-wide"
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
                            className="bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white font-serif mb-2">Navigate</h3>
                                <p className="text-gray-400 text-sm">Choose your wayfinding method</p>
                            </div>

                            <div className="space-y-4">
                                {/* Option 1: Google Maps */}
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${contactInfo.mapsLocation}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors border border-white/5 group"
                                >
                                    <div className="bg-blue-500/20 p-3 rounded-full text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-200">Google Maps</p>
                                        <p className="text-xs text-gray-500">Live GPS Directions</p>
                                    </div>
                                </a>

                                {/* Option 2: Local Map Loop */}
                                <button
                                    onClick={() => {
                                        setShowNavigationModal(false);
                                        setTimeout(() => setShowMap(true), 200); // Small delay for smooth transition
                                    }}
                                    className="w-full flex items-center gap-4 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors border border-white/5 group text-left"
                                >
                                    <div className="bg-tashi-accent/20 p-3 rounded-full text-tashi-accent group-hover:bg-tashi-accent group-hover:text-black transition-colors">
                                        <Navigation size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-200">Tourist Loop Map</p>
                                        <p className="text-xs text-gray-500">Local Schematic Guide (No U-Turn)</p>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowNavigationModal(false)}
                                className="w-full py-3 rounded-xl bg-neutral-800 text-gray-400 font-bold hover:bg-neutral-700 hover:text-white transition-colors text-sm uppercase tracking-wide"
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
                        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setShowMap(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-neutral-900 border border-tashi-accent/20 rounded-3xl w-full max-w-4xl overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
                                <h3 className="text-xl font-bold text-tashi-accent font-serif pl-2">Local Guide Map</h3>
                                <button
                                    onClick={() => setShowMap(false)}
                                    className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
                                <LocalMapGuide />
                            </div>

                            <div className="p-4 bg-black/20 text-center border-t border-white/5">
                                <p className="text-gray-400 text-xs">
                                    The road connects Chicham Bridge & TashiZom directly. No need to go back!
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contact Info Modal */}
            {
                showContactInfo && (
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
                                        <p className="font-bold text-gray-200">Call Staffs</p>
                                        <p className="text-xs text-gray-500">{contactInfo.phone}</p>
                                    </div>
                                </a>

                                {contactInfo.secondaryPhone && (
                                    <a href={`tel:${contactInfo.secondaryPhone}`} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group">
                                        <div className="bg-green-500/20 p-3 rounded-full text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-200">Call Owner</p>
                                            <p className="text-xs text-gray-500">{contactInfo.secondaryPhone}</p>
                                        </div>
                                    </a>
                                )}

                                <a href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" className="flex items-center gap-4 bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group">
                                    <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-200">WhatsApp</p>
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
                            className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white font-serif">Rate Us</h3>
                                    <p className="text-sm text-gray-400">Tell us about your experience</p>
                                </div>
                                <button onClick={() => setShowReviewModal(false)} className="bg-white/10 p-1 rounded-full text-white hover:bg-white/20"><X size={20} /></button>
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
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-tashi-accent/50"
                                />

                                <textarea
                                    placeholder="Share your feedback..."
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-tashi-accent/50 min-h-[100px] resize-none"
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
        </div >
    );
}



function MenuItemCard({ item, quantity, onAdd, onRemove, onSelect }: { item: MenuItem; quantity: number; onAdd: () => void; onRemove: () => void; onSelect: () => void }) {
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
                    <span className="font-serif text-xl text-tashi-accent">&#8377;{item.price}</span>

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
            </div>
        </motion.div>
    );
}

function MenuItemListRow({ item, quantity, onAdd, onRemove, onSelect }: { item: MenuItem; quantity: number; onAdd: () => void; onRemove: () => void; onSelect: () => void }) {
    const isAvailable = item.available !== false;

    return (
        <motion.div
            variants={itemVariants}
            whileTap={isAvailable ? { scale: 0.98 } : {}}
            className={`glass-card rounded-xl p-4 flex items-center gap-4 cursor-pointer ${!isAvailable ? 'opacity-60' : ''}`}
            onClick={onSelect}
        >
            {/* Veg/Non-Veg small indicator */}
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
                <h3 className="font-bold text-gray-100 text-base leading-tight">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="font-serif text-lg text-tashi-accent">&#8377;{item.price}</span>
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
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${isAvailable
                            ? 'bg-tashi-primary/20 hover:bg-tashi-primary text-tashi-accent hover:text-white border-tashi-accent/30 cursor-pointer'
                            : 'bg-neutral-800 text-gray-600 border-gray-700 cursor-not-allowed'
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

const MiniOrderTimer = memo(function MiniOrderTimer() {
    const orders = useStore((state: any) => state.orders);
    const currentTableId = useStore((state: any) => state.currentTableId);
    const sessionId = useStore((state: any) => state.sessionId);

    // Find the latest active order for THIS session
    // FIX: Rely on sessionId primarily so logic persists even if tableId changes by staff
    const activeOrder = orders
        .filter(o =>
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
});

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
                <Sparkles className="text-tashi-accent animate-pulse" size={24} />
                <h2 className="text-xl font-bold font-serif text-tashi-accent uppercase tracking-widest animate-pulse drop-shadow-[0_0_8px_rgba(218,165,32,0.5)]">
                    Chef's Specials
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-tashi-accent/50 to-transparent" />
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
                                <div className="absolute -inset-[2px] bg-gradient-to-r from-tashi-accent via-yellow-200 to-tashi-accent rounded-2xl opacity-75 blur-sm animate-pulse" />

                                <div
                                    className="relative bg-neutral-900 border border-tashi-accent/50 rounded-2xl overflow-hidden p-3 flex gap-4 h-full shadow-xl"
                                    onClick={() => isActive && setSelectedItem(item)}
                                >
                                    {/* Image */}
                                    <div className="w-24 h-full flex-shrink-0 bg-black rounded-xl overflow-hidden relative border border-white/5">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold text-xs uppercase text-center p-1">No Image</div>
                                        )}
                                        <div className="absolute top-0 right-0 bg-tashi-accent text-black text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg animate-pulse">
                                            SPECIAL
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="font-bold text-white text-base leading-tight mb-1 line-clamp-1">{item.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${item.isVegetarian ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                                                    {item.isVegetarian ? 'Veg' : 'Non-Veg'}
                                                </span>
                                                {item.isSpicy && (
                                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-red-500/30 text-red-400 bg-red-500/10">
                                                        Spicy
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-serif text-tashi-accent font-bold">&#8377;{item.price}</span>

                                            <div onClick={(e) => e.stopPropagation()}>
                                                {getQuantity(item.id) === 0 ? (
                                                    <button
                                                        onClick={() => isActive && addToCart(item)}
                                                        disabled={item.available === false}
                                                        className="bg-tashi-accent text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
                                                    >
                                                        ADD
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center bg-neutral-800 rounded-lg border border-white/20 h-8">
                                                        <button onClick={() => isActive && removeFromCart(item.id)} className="px-2.5 h-full text-white hover:bg-white/10 rounded-l-lg font-bold text-lg">-</button>
                                                        <span className="px-2 text-sm font-bold text-white min-w-[20px] text-center">{getQuantity(item.id)}</span>
                                                        <button onClick={() => isActive && addToCart(item)} className="px-2.5 h-full text-white hover:bg-white/10 rounded-r-lg font-bold text-lg">+</button>
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
                                ? 'w-6 bg-tashi-accent'
                                : 'w-1.5 bg-gray-600 hover:bg-gray-500'
                                }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
});
