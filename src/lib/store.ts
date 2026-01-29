import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from './firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    setDoc,
    getDoc,
    getDocs
} from 'firebase/firestore';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// Safe Date Utility forFirestore Timestamps, ISO strings, etc.
export const getValidDate = (dateInput: any): Date | null => {
    if (!dateInput) return null;
    try {
        if (typeof dateInput.toDate === 'function') return dateInput.toDate();
        const d = new Date(dateInput);
        return isFinite(d.getTime()) ? d : null;
    } catch (e) {
        return null;
    }
};

export type Category = string;
export type UserRole = 'admin' | 'staff';
export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Paid' | 'Rejected' | 'Cancelled';

export interface User {
    id: string;
    serialNumber?: string;
    name: string;
    username: string;
    role: UserRole;
}

export interface Table {
    id: string;
    name: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: Category;
    image?: string;
    isVegetarian: boolean;
    isSpicy?: boolean;
    available: boolean;
    sortOrder?: number; // For drag-and-drop ordering
    isChefSpecial?: boolean; // New: Highlight as Chef's Special
}

export interface OrderItem {
    menuItemId: string;
    quantity: number;
    name: string;
    price: number;
}

export interface Order {
    id: string;
    tableId: string;
    items: OrderItem[];
    status: OrderStatus;
    totalAmount: number;
    createdAt: string; // Firestore stores dates as timestamps, we convert to string/date in app usually, simplified to string for ISO
    acceptedAt?: string;
    customerName?: string;
    customerPhone?: string;
    sessionId?: string; // New field for tracking unique customer sessions
    paymentStatus?: 'Pending' | 'Confirmed' | 'None'; // New: Track payment verification status for remote orders
}

export interface Notification {
    id: string;
    tableId: string;
    type: 'call_staff' | 'bill_request';
    status: 'pending' | 'resolved';
    createdAt: string;
    customerName?: string;
    customerPhone?: string;
    sessionId?: string;
}

export interface Review {
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface ValleyUpdate {
    title: string;
    description: string;
    status: string;
    statusColor: string;
    mediaUrl?: string; // New field for Image/Video URL
    mediaType?: 'image' | 'video'; // New field for type
}

export interface GearImage {
    url: string;
    label: string;
    details?: string;
    worn?: boolean;
}

export interface GearItem {
    id: string;
    name: string;
    price: number;
    badge: string;
    available: boolean;
    items: GearImage[];
    sortOrder?: number;
}

export interface MenuAppearance {
    categoryFontSize: string;
    categoryColor: string;
    itemNameFontSize: string;
    itemNameColor: string;
    accentColor: string;
}

export interface ContactSettings {
    phone: string;
    secondaryPhone?: string;
    whatsapp: string;
    mapsLocation: string;
}

export interface MediaItem {
    id: string;
    url: string;
    name: string;
    createdAt: string;
}

interface AppState {
    tables: Table[];
    menu: MenuItem[];
    orders: Order[];
    notifications: Notification[];
    cart: OrderItem[];
    currentTableId: string | null;
    sessionId: string | null; // Unique session for the device
    currentUser: User | null;
    reviews: Review[];
    valleyUpdates: ValleyUpdate[];
    media: MediaItem[]; // New media gallery
    geoRadius: number;
    callStaffRadius: number; // Geofence radius for Call Staff feature (in meters)
    contactInfo: ContactSettings;
    categoryOrder: string[]; // New: For custom category ordering
    gearItems: GearItem[]; // New: For local gear e-commerce
    menuAppearance: MenuAppearance; // New: For visual customization
    landingPhotos: {
        location: string[];
        climate: string[];
        customMap?: string;
        registrationDoc?: string;
    };


    isListening: boolean;
    unsubscribers: (() => void)[];
    initialize: () => void;
    cleanup: () => void;

    setTableId: (id: string | null) => void;
    addTable: (name: string) => Promise<void>;
    updateTable: (id: string, name: string) => void;
    removeTable: (id: string) => void;

    addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
    updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
    removeMenuItem: (id: string) => void;
    reorderMenuItems: (items: MenuItem[]) => Promise<void>;



    // New: Reorder categories
    updateCategoryOrder: (order: string[]) => Promise<void>;

    addToCart: (item: MenuItem) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;

    placeOrder: (customerName: string, customerPhone: string, tableId?: string, paymentStatus?: 'Pending' | 'Confirmed' | 'None') => Promise<void>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    confirmPayment: (orderId: string) => Promise<void>; // New action
    updateOrderTable: (orderId: string, tableId: string) => Promise<void>;
    deleteOrder: (orderId: string) => Promise<void>;

    addNotification: (tableId: string, type: 'call_staff' | 'bill_request', details?: { customerName?: string, customerPhone?: string, sessionId?: string }) => void;
    resolveNotification: (notificationId: string) => void;
    cancelNotification: (tableId: string, type: 'call_staff' | 'bill_request') => Promise<void>;

    addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;

    saveValleyUpdates: (updates: any[]) => Promise<void>;

    // New: Local Gear Management
    addGearItem: (item: Omit<GearItem, 'id'>) => Promise<void>;
    updateGearItem: (id: string, updates: Partial<GearItem>) => Promise<void>;
    removeGearItem: (id: string) => Promise<void>;
    reorderGearItems: (items: GearItem[]) => Promise<void>;
    updateMenuAppearance: (updates: Partial<MenuAppearance>) => Promise<void>;

    login: (username: string, password: string) => Promise<boolean>;
    updateLandingPhotos: (section: 'location' | 'climate' | 'customMap' | 'registrationDoc', data: string[] | string) => Promise<void>;
    updateSettings: (settings: any) => Promise<void>;
    updateContactSettings: (contact: ContactSettings) => Promise<void>;
    uploadImage: (file: File, saveToGallery?: boolean) => Promise<string>;
    addMediaItem: (url: string, name: string) => Promise<void>;
    deleteMedia: (id: string) => Promise<void>;

    recordScan: (type: 'table_qr' | 'app_qr' | 'manual', details?: any, geo?: { lat: number, lng: number, accuracy?: number }) => Promise<void>;
    fetchScanStats: () => Promise<any[]>;
    clearAllData_Dangerous: () => Promise<void>;


    customerDetails: { name: string; phone: string; } | null;
    setCustomerDetails: (details: { name: string; phone: string; }) => void;

    logout: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            tables: [],
            menu: [],
            orders: [],
            notifications: [],
            cart: [],
            currentTableId: null,
            sessionId: null,
            currentUser: null,
            reviews: [],
            valleyUpdates: [],
            media: [],
            isListening: false,
            unsubscribers: [],
            geoRadius: 5,
            callStaffRadius: 200, // Default: 200 meters (increased from 50 to handle GPS drift)
            categoryOrder: [], // Initial empty state
            gearItems: [], // Initial empty state
            menuAppearance: {
                categoryFontSize: '1.25rem',
                categoryColor: '#000000',
                itemNameFontSize: '1rem',
                itemNameColor: '#1A1A1A',
                accentColor: '#DAA520'
            },
            landingPhotos: { location: [], climate: [], customMap: '', registrationDoc: '' },
            customerDetails: null,
            contactInfo: {
                phone: '+919876543210',
                secondaryPhone: '+919418612295',
                whatsapp: '+919876543210',
                mapsLocation: '32.329112,78.0080953'
            },

            initialize: () => {
                const state = get();
                if (state.isListening) return;
                set({ isListening: true });

                // Generate Session ID if missing (persisted automatically)
                if (!state.sessionId) {
                    set({ sessionId: Math.random().toString(36).substring(2) + Date.now().toString(36) });
                }

                const unsubscribers: (() => void)[] = [];

                // Real-time Listeners

                // Menu
                unsubscribers.push(onSnapshot(collection(db, 'menu'), (snap) => {
                    const menu = snap.docs.map(d => ({ id: d.id, ...d.data() })) as MenuItem[];
                    set({ menu });
                }));

                unsubscribers.push(onSnapshot(collection(db, 'gear'), (snap) => {
                    const gearItems = snap.docs.map(d => ({ id: d.id, ...d.data() })) as GearItem[];
                    set({ gearItems: gearItems.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) });
                }));

                // Menu Appearance
                unsubscribers.push(onSnapshot(doc(db, 'settings', 'menu-appearance'), (snap) => {
                    if (snap.exists()) {
                        set({ menuAppearance: { ...get().menuAppearance, ...snap.data() } });
                    }
                }));

                // Tables
                unsubscribers.push(onSnapshot(collection(db, 'tables'), (snap) => {
                    const tables = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Table[];
                    set({ tables: tables.sort((a, b) => a.name.localeCompare(b.name)) });
                }));

                // Orders
                const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
                unsubscribers.push(onSnapshot(ordersQuery, (snap) => {
                    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
                    set({ orders });

                    // AUTOMATIC CLEANUP LOGIC
                    // 1. Unattended Pending Orders (> 10 mins)
                    // 2. Previous Day Orders
                    // SAFETY: Only allow Staff/Admin to perform cleanup to avoid spamming from customer devices
                    const state = get();
                    const isStaffOrAdmin = state.currentUser?.role === 'admin' || state.currentUser?.role === 'staff';

                    if (isStaffOrAdmin) {
                        const now = new Date();
                        const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
                        const todayStart = new Date(now.setHours(0, 0, 0, 0));

                        orders.forEach(async (order) => {
                            const orderDate = new Date(order.createdAt);

                            // Condition 1: Pending > 10 mins
                            if (order.status === 'Pending' && orderDate < tenMinsAgo) {
                                try {
                                    await deleteDoc(doc(db, 'orders', order.id));
                                } catch (e) { /* Cleanup failed silently in production */ }
                            }

                            // Condition 2: Old Orders (Previous Days) -> ARCHIVE
                            if (orderDate < todayStart) {
                                if (order.status === 'Paid' || order.status === 'Rejected') {
                                    try {
                                        await setDoc(doc(db, 'archived_orders', order.id), order);
                                        await deleteDoc(doc(db, 'orders', order.id));
                                    } catch (err) {
                                        // Silent fail
                                    }
                                }
                            }
                        });
                    }
                }));

                // Notifications
                const notifQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
                unsubscribers.push(onSnapshot(notifQuery, (snap) => {
                    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Notification[];
                    set({ notifications });
                }, (error) => {
                    // Silent fail for permissions
                }));

                // Reviews
                const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
                unsubscribers.push(onSnapshot(reviewsQuery, (snap) => {
                    const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
                    set({ reviews });
                }));

                // Media Gallery
                const mediaQuery = query(collection(db, 'settings', 'media', 'library'), orderBy('createdAt', 'desc'));
                unsubscribers.push(onSnapshot(mediaQuery, (snap) => {
                    const media = snap.docs.map(d => ({ id: d.id, ...d.data() })) as MediaItem[];
                    set({ media });
                }));

                // Updates & Global Settings
                unsubscribers.push(onSnapshot(doc(db, 'settings', 'global'), (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        set({
                            geoRadius: data.geoRadius ?? get().geoRadius ?? 5,
                            callStaffRadius: data.callStaffRadius ?? get().callStaffRadius ?? 200, // Load Call Staff radius
                            categoryOrder: data.categoryOrder || [] // Load category order
                        });
                    }
                }));
                unsubscribers.push(onSnapshot(doc(db, 'settings', 'valley_updates'), (doc) => {
                    if (doc.exists()) {
                        set({ valleyUpdates: doc.data().updates || [] });
                    }
                }));

                // Contact Settings
                unsubscribers.push(onSnapshot(doc(db, 'settings', 'contact'), (doc) => {
                    if (doc.exists()) {
                        set({ contactInfo: doc.data() as ContactSettings });
                    }
                }));

                // Landing Page Photos
                unsubscribers.push(onSnapshot(doc(db, 'settings', 'landing_photos'), (doc) => {
                    if (doc.exists()) {
                        set({ landingPhotos: doc.data() as any });
                    }
                }));

                set({ isListening: true, unsubscribers });

                // AUTH LISTENER
                const authUnsub = onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        try {
                            // Fetch Role from Firestore
                            const userDoc = await getDoc(doc(db, 'users', user.uid));
                            if (userDoc.exists()) {
                                const userData = userDoc.data();
                                set({
                                    currentUser: {
                                        id: user.uid,
                                        name: userData.name || user.email?.split('@')[0] || 'User',
                                        username: user.email || '',
                                        role: userData.role
                                    }
                                });
                            } else {
                                // User exists in Auth but not in DB (e.g. freshly created)
                                // We don't set currentUser yet, or set as 'guest'
                                set({ currentUser: null });
                            }
                        } catch (e) {
                            console.error('Auth Profile Fetch Error', e);
                            set({ currentUser: null });
                        }
                    } else {
                        set({ currentUser: null });
                    }
                });
                // We don't strictly need to track this unsubscriber as it persists, 
                // but good practice if we had a full unmount. 
                // However, Zustand store is usually permanent.
            },

            cleanup: () => {
                const { unsubscribers } = get();
                unsubscribers.forEach(unsub => unsub());
                set({ isListening: false, unsubscribers: [] });
            },

            setTableId: (id) => set({ currentTableId: id }),

            addTable: async (name) => {
                await addDoc(collection(db, 'tables'), { name });
            },
            updateTable: async (id, name) => {
                await updateDoc(doc(db, 'tables', id), { name });
            },
            removeTable: async (id) => {
                await deleteDoc(doc(db, 'tables', id));
            },

            addMenuItem: async (item) => {
                await addDoc(collection(db, 'menu'), item);
            },
            updateMenuItem: async (id, updates) => {
                await updateDoc(doc(db, 'menu', id), updates);
            },
            removeMenuItem: async (id) => {
                await deleteDoc(doc(db, 'menu', id));
            },
            reorderMenuItems: async (items) => {
                // Batch update sortOrder for all items
                const batch = items.map((item, index) =>
                    updateDoc(doc(db, 'menu', item.id), { sortOrder: index })
                );
                await Promise.all(batch);
            },

            updateCategoryOrder: async (order) => {
                await setDoc(doc(db, 'settings', 'global'), { categoryOrder: order }, { merge: true });
                set({ categoryOrder: order });
            },

            addToCart: (item) => set((state) => {
                const existing = state.cart.find((i) => i.menuItemId === item.id);
                if (existing) {
                    return {
                        cart: state.cart.map((i) =>
                            i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                    };
                }
                return {
                    cart: [...state.cart, { menuItemId: item.id, quantity: 1, name: item.name, price: item.price }],
                };
            }),
            removeFromCart: (itemId) => set((state) => {
                const existing = state.cart.find((i) => i.menuItemId === itemId);
                if (existing && existing.quantity > 1) {
                    // Decrease quantity by 1
                    return {
                        cart: state.cart.map((i) =>
                            i.menuItemId === itemId ? { ...i, quantity: i.quantity - 1 } : i
                        ),
                    };
                }
                // Remove item completely if quantity is 1 or less
                return {
                    cart: state.cart.filter((i) => i.menuItemId !== itemId),
                };
            }),
            clearCart: () => set({ cart: [] }),

            placeOrder: async (customerName, customerPhone, tableId, paymentStatus = 'None') => {
                const state = get();
                // If no specific table is set, default to 'REQUEST' (Remote/Takeaway)
                const activeTableId = tableId || state.currentTableId || 'REQUEST';

                if (state.cart.length === 0) return;
                const total = state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

                const orderData = {
                    tableId: activeTableId,
                    customerName,
                    customerPhone,
                    items: state.cart,
                    totalAmount: total,
                    status: 'Pending',
                    createdAt: new Date().toISOString(),
                    sessionId: state.sessionId || 'legacy', // Attach session ID
                    paymentStatus // Save payment status
                };

                await addDoc(collection(db, 'orders'), orderData);
                set({ cart: [] }); // Clear cart locally immediately (optimistic)
            },

            updateOrderStatus: async (orderId, status) => {
                const updates: any = { status };
                if (status === 'Preparing') {
                    // Check if already has acceptedAt to avoid overwriting
                    const orderState = get().orders.find(o => o.id === orderId);

                    // For remote orders (tableId = 'REQUEST'), do NOT set acceptedAt yet.
                    // Instead, we might set a 'preparingAt' timestamp if needed, but the main 'acceptedAt' 
                    // that triggers the 30min timer should happen when the table is ASSIGNED.
                    // However, if the business wants to start cooking immediately, maybe we DO set it?
                    // User requirement: "starts 30 minutes countdown itself not leaving staff to assign table Number"
                    // Implication: Don't start the countdown (which relies on acceptedAt/createdAt) until table assigned?
                    // actually, the countdown UI uses `acceptedAt || createdAt`. 
                    // If we want to DELAY the countdown, we should ensure `acceptedAt` is ONLY set when a real table is assigned.

                    const isRemote = orderState?.tableId === 'REQUEST' || orderState?.tableId === 'Remote';

                    if (orderState && !orderState.acceptedAt && !isRemote) {
                        updates.acceptedAt = new Date().toISOString();
                    }
                }
                await updateDoc(doc(db, 'orders', orderId), updates);
            },

            confirmPayment: async (orderId) => {
                await updateDoc(doc(db, 'orders', orderId), { paymentStatus: 'Confirmed' });
            },

            updateOrderTable: async (orderId, tableId) => {
                const orderRef = doc(db, 'orders', orderId);

                // Use local state for faster check
                const currentOrder = get().orders.find(o => o.id === orderId);
                const isRemote = currentOrder?.tableId === 'REQUEST' || currentOrder?.tableId === 'Remote';
                const isNowTable = tableId !== 'REQUEST' && tableId !== 'Remote';

                const updates: any = { tableId };

                // If moving from REQUEST/Remote to Real Table, set AcceptedAt
                if (isRemote && isNowTable) {
                    updates.acceptedAt = new Date().toISOString();
                }

                await updateDoc(orderRef, updates);
            },

            deleteOrder: async (orderId) => {
                await deleteDoc(doc(db, 'orders', orderId));
            },


            addNotification: async (tableId, type, details) => {
                // PREVENT DUPLICATES: Check if there's already a pending notification for this session
                const state = get();
                const existingNotification = state.notifications.find(
                    n => n.sessionId === details?.sessionId &&
                        n.type === type &&
                        n.status === 'pending'
                );

                if (existingNotification) {
                    return; // Don't create duplicate
                }

                // OPTIMISTIC UPDATE: Add notification to local state IMMEDIATELY
                const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const optimisticNotification = {
                    id: tempId,
                    tableId,
                    type,
                    status: 'pending' as const,
                    createdAt: new Date().toISOString(),
                    customerName: details?.customerName,
                    customerPhone: details?.customerPhone,
                    sessionId: details?.sessionId
                };

                // Update local state FIRST (instant feedback)
                set((state) => ({
                    notifications: [optimisticNotification, ...state.notifications]
                }));

                try {
                    // Then sync to Firebase in background
                    const docRef = await addDoc(collection(db, 'notifications'), {
                        tableId,
                        type,
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        customerName: details?.customerName,
                        customerPhone: details?.customerPhone,
                        sessionId: details?.sessionId
                    });

                    // Replace temp notification with real one
                    set((state) => ({
                        notifications: state.notifications.map(n =>
                            n.id === tempId ? { ...n, id: docRef.id } : n
                        )
                    }));
                } catch (error) {
                    console.error("Failed to add notification to Firebase:", error);
                    // Remove optimistic update on failure
                    set((state) => ({
                        notifications: state.notifications.filter(n => n.id !== tempId)
                    }));
                    throw error;
                }
            },


            recordScan: async (type: 'table_qr' | 'app_qr' | 'manual', details: any = {}, geo?: { lat: number, lng: number, accuracy?: number }) => {
                try {
                    const state = get();

                    // DE-DUPLICATION: Don't record same scan type for same session within 1 minute
                    const now = Date.now();
                    const lastScanKey = `last_scan_${type}_${details.tableId || 'direct'}`;
                    const lastScanTime = (window as any)[lastScanKey] || 0;
                    if (now - lastScanTime < 60000) return;
                    (window as any)[lastScanKey] = now;

                    let ipData: any = {};
                    let distanceKm: number | null = null;
                    let isGpsVerified = !!geo;

                    const fetchIp = async () => {
                        try {
                            const r1 = await fetch('https://ipapi.co/json/');
                            if (r1.ok) return await r1.json();
                        } catch (e) { }
                        try {
                            const r2 = await fetch('https://ipwho.is/');
                            if (r2.ok) return await r2.json();
                        } catch (e) { }
                        return {};
                    };

                    try {
                        ipData = await fetchIp();
                        const targetLoc = state.contactInfo?.mapsLocation;
                        if (targetLoc) {
                            const [targetLat, targetLng] = targetLoc.split(',').map(s => parseFloat(s.trim()));
                            const currentLat = geo?.lat ?? ipData.latitude;
                            const currentLng = geo?.lng ?? ipData.longitude;

                            if (currentLat && currentLng && !isNaN(targetLat) && !isNaN(targetLng)) {
                                const toRad = (v: number) => v * Math.PI / 180;
                                const R = 6371;
                                const dLat = toRad(targetLat - currentLat);
                                const dLon = toRad(targetLng - currentLng);
                                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                    Math.cos(toRad(currentLat)) * Math.cos(toRad(targetLat)) *
                                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                distanceKm = Math.round(R * c);
                            }
                        }
                    } catch (err) { }

                    await addDoc(collection(db, 'analytics_scans'), {
                        type,
                        ...details,
                        sessionId: state.sessionId,
                        ipData,
                        distanceKm,
                        isGpsVerified,
                        geoAccuracy: geo?.accuracy,
                        preciseCoords: geo ? { lat: geo.lat, lng: geo.lng } : null,
                        timestamp: new Date().toISOString(),
                        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
                    });

                } catch (e) {
                    console.error("Failed to record scan", e);
                }
            },

            fetchScanStats: async () => {
                try {
                    const q = query(collection(db, 'analytics_scans'));
                    const snapshot = await getDocs(q);
                    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                } catch (e) {
                    console.error("Failed to fetch stats", e);
                    return [];
                }
            },

            resolveNotification: async (notificationId) => {
                await updateDoc(doc(db, 'notifications', notificationId), { status: 'resolved' });
            },

            cancelNotification: async (tableId, type) => {
                // Find the notification first? 
                // In firestore, we normally need the ID.
                // But for this specific logic, we'll just query efficiently or find it in local state to get ID
                const state = get();
                const notif = state.notifications.find(n => n.tableId === tableId && n.type === type && n.status === 'pending');
                if (notif) {
                    await updateDoc(doc(db, 'notifications', notif.id), { status: 'resolved' });
                }
            },

            setCustomerDetails: (details: { name: string; phone: string }) => set({ customerDetails: details }),


            addReview: async (review) => {
                await addDoc(collection(db, 'reviews'), {
                    ...review,
                    createdAt: new Date().toISOString()
                });
            },

            saveValleyUpdates: async (updates) => {
                const settingsRef = doc(db, 'settings', 'valley_updates');
                await setDoc(settingsRef, { updates: updates.map(u => ({ ...u, id: Math.random().toString(36).substring(7) })) });
                set({ valleyUpdates: updates });
            },

            // LOCAL GEAR MANAGEMENT
            addGearItem: async (item) => {
                await addDoc(collection(db, 'gear'), {
                    ...item,
                    sortOrder: get().gearItems.length
                });
            },

            updateGearItem: async (id, updates) => {
                await updateDoc(doc(db, 'gear', id), updates);
            },

            removeGearItem: async (id) => {
                await deleteDoc(doc(db, 'gear', id));
            },

            reorderGearItems: async (items) => {
                const batch = items.map((item, idx) => ({
                    id: item.id,
                    sortOrder: idx
                }));

                for (const item of batch) {
                    await updateDoc(doc(db, 'gear', item.id), { sortOrder: item.sortOrder });
                }
            },

            updateMenuAppearance: async (updates) => {
                await setDoc(doc(db, 'settings', 'menu-appearance'), updates, { merge: true });
            },

            updateSettings: async (settings) => {
                await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
            },

            updateLandingPhotos: async (section, data) => {
                const photosRef = doc(db, 'settings', 'landing_photos');
                const current = get().landingPhotos;
                const updated = { ...current, [section]: data };
                await setDoc(photosRef, updated, { merge: true });
                set({ landingPhotos: updated });
            },

            updateContactSettings: async (contact: ContactSettings) => {
                await setDoc(doc(db, 'settings', 'contact'), contact);
            },

            uploadImage: async (file: File, saveToGallery = false) => {
                // Client-side compression
                const compressImage = async (file: File): Promise<Blob | File> => {
                    if (!file.type.startsWith('image/')) return file;
                    if (file.size < 200 * 1024) return file;

                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = (event) => {
                            const img = new Image();
                            img.src = event.target?.result as string;
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                let width = img.width;
                                let height = img.height;
                                const MAX_DIM = 1200;
                                if (width > height) {
                                    if (width > MAX_DIM) {
                                        height *= MAX_DIM / width;
                                        width = MAX_DIM;
                                    }
                                } else {
                                    if (height > MAX_DIM) {
                                        width *= MAX_DIM / height;
                                        height = MAX_DIM;
                                    }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx?.drawImage(img, 0, 0, width, height);
                                canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.8);
                            };
                        };
                        reader.onerror = () => resolve(file);
                    });
                };

                const compressedFile = await compressImage(file);
                const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                const { storage } = await import('./firebase');

                const fileRef = ref(storage, `uploads/${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}.jpg`);
                await uploadBytes(fileRef, compressedFile);
                const url = await getDownloadURL(fileRef);

                if (saveToGallery) {
                    await addDoc(collection(db, 'settings', 'media', 'library'), {
                        url,
                        name: file.name,
                        createdAt: new Date().toISOString()
                    });
                }
                return url;
            },

            addMediaItem: async (url: string, name: string) => {
                await addDoc(collection(db, 'settings', 'media', 'library'), {
                    url,
                    name,
                    createdAt: new Date().toISOString()
                });
            },

            deleteMedia: async (id: string) => {
                await deleteDoc(doc(db, 'settings', 'media', 'library', id));
            },

            clearAllData_Dangerous: async () => {
                const CONFIRM = prompt("TYPE 'DELETE' TO CONFIRM CLEARING ALL ORDERS, REVIEWS & NOTIFICATIONS:");
                if (CONFIRM !== 'DELETE') return;

                const collections = ['orders', 'notifications', 'reviews', 'analytics_scans'];

                for (const colName of collections) {
                    const q = query(collection(db, colName));
                    const snapshot = await getDocs(q);
                    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, colName, d.id)));
                    await Promise.all(deletePromises);
                }

                alert("ALL DATA CLEARED SUCCESSFULLY.");
                window.location.reload();
            },

            login: async (usernameOrEmail, password) => {
                try {
                    // Auto-append domain if simple username provided
                    const email = usernameOrEmail.includes('@')
                        ? usernameOrEmail
                        : `${usernameOrEmail}@tashizomcafe.in`;

                    const cred = await signInWithEmailAndPassword(auth, email, password);

                    // Fetch role immediately to ensure UI has correct state
                    const user = cred.user;
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        set({
                            currentUser: {
                                id: user.uid,
                                name: userData.name || user.email?.split('@')[0] || 'User',
                                username: user.email || '',
                                role: userData.role
                            }
                        });
                        return true;
                    } else {
                        // Fallback if no role found (e.g. init page user)
                        set({ currentUser: null });
                        console.error("User has no role assigned");
                        return false;
                    }
                } catch (error) {
                    console.error("Login failed", error);
                    return false;
                }
            },

            logout: async () => {
                await signOut(auth);
                set({ currentUser: null });
            },
        }),
        {
            name: 'tashizom-storage',
            partialize: (state) => ({
                currentTableId: state.currentTableId,
                cart: state.cart,
                currentUser: state.currentUser,
                sessionId: state.sessionId, // Persist Session ID across reloads
                geoRadius: state.geoRadius,
                callStaffRadius: state.callStaffRadius,
                contactInfo: state.contactInfo,
            }),
        }
    )
);
