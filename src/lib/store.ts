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
    getDoc
} from 'firebase/firestore';

export type Category = string;
export type UserRole = 'admin' | 'staff';
export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Paid' | 'Rejected';

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
}

export interface Notification {
    id: string;
    tableId: string;
    type: 'call_staff' | 'bill_request';
    status: 'pending' | 'resolved';
    createdAt: string;
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

export interface ContactSettings {
    phone: string;
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
    contactInfo: ContactSettings;


    isListening: boolean;
    unsubscribers: (() => void)[];
    initialize: () => void;
    cleanup: () => void;

    setTableId: (id: string) => void;
    addTable: (name: string) => Promise<void>;
    updateTable: (id: string, name: string) => void;
    removeTable: (id: string) => void;

    addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
    updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
    removeMenuItem: (id: string) => void;

    addToCart: (item: MenuItem) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;

    placeOrder: (customerName: string, customerPhone: string, tableId?: string) => Promise<void>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;

    addNotification: (tableId: string, type: 'call_staff' | 'bill_request') => void;
    resolveNotification: (notificationId: string) => void;
    cancelNotification: (tableId: string, type: string) => void;

    addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;

    saveValleyUpdates: (updates: any[]) => Promise<void>;

    login: (username: string, password: string) => Promise<boolean>;
    updateSettings: (settings: any) => Promise<void>;
    updateContactSettings: (contact: ContactSettings) => Promise<void>;
    uploadImage: (file: File, saveToGallery?: boolean) => Promise<string>;
    addMediaItem: (url: string, name: string) => Promise<void>;
    deleteMedia: (id: string) => Promise<void>;

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
            contactInfo: {
                phone: '+919876543210',
                whatsapp: '+919876543210',
                mapsLocation: 'TashiZom+Resort'
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
                    const now = new Date();
                    const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
                    const todayStart = new Date(now.setHours(0, 0, 0, 0));

                    orders.forEach(async (order) => {
                        const orderDate = new Date(order.createdAt);

                        // Condition 1: Pending > 10 mins
                        if (order.status === 'Pending' && orderDate < tenMinsAgo) {
                            console.log('Auto-deleting abandoned order:', order.id);
                            await deleteDoc(doc(db, 'orders', order.id));
                        }

                        // Condition 2: Old Orders (Previous Days) -> ARCHIVE
                        // We keep orders from today in active view. Yesterday and older go to archive.
                        // EXCEPT 'Pending' ones that are old (they are just abandoned junk, so we skip archiving them or archive them as abandoned? User wants total sales, so only Paid/Served matters really, but let's archive everything for safety).
                        if (orderDate < todayStart) {
                            // Only archive if it was at least Accepted (Preparing/Served/Paid) OR if user really wants EVERYTHING.
                            // Let's archive ALL valid orders to be safe.
                            console.log('Archiving old order:', order.id);
                            try {
                                await setDoc(doc(db, 'archived_orders', order.id), order);
                                await deleteDoc(doc(db, 'orders', order.id));
                            } catch (err) {
                                console.error("Failed to archive/delete", err);
                            }
                        }
                    });
                }));

                // Notifications
                const notifQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
                unsubscribers.push(onSnapshot(notifQuery, (snap) => {
                    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Notification[];
                    set({ notifications });
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
                        set({ geoRadius: doc.data().geoRadius || 5 });
                    }
                }));
                unsubscribers.push(onSnapshot(doc(db, 'settings', 'updates'), (doc) => {
                    if (doc.exists()) {
                        set({ valleyUpdates: doc.data().list || [] });
                    }
                }));

                // Contact Settings
                unsubscribers.push(onSnapshot(doc(db, 'settings', 'contact'), (doc) => {
                    if (doc.exists()) {
                        set({ contactInfo: doc.data() as ContactSettings });
                    }
                }));

                set({ isListening: true, unsubscribers });
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
            removeFromCart: (itemId) => set((state) => ({
                cart: state.cart.filter((i) => i.menuItemId !== itemId),
            })),
            clearCart: () => set({ cart: [] }),

            placeOrder: async (customerName, customerPhone, tableId) => {
                const state = get();
                const activeTableId = tableId || state.currentTableId;
                if (state.cart.length === 0 || !activeTableId) return;
                const total = state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

                const orderData = {
                    tableId: activeTableId,
                    customerName,
                    customerPhone,
                    items: state.cart,
                    totalAmount: total,
                    status: 'Pending',
                    createdAt: new Date().toISOString(),
                    sessionId: state.sessionId || 'legacy'// Attach session ID
                };

                await addDoc(collection(db, 'orders'), orderData);
                set({ cart: [] }); // Clear cart locally immediately (optimistic)
            },

            updateOrderStatus: async (orderId, status) => {
                const updates: any = { status };
                if (status === 'Preparing') {
                    // Check if already has acceptedAt to avoid overwriting
                    const orderStr = get().orders.find(o => o.id === orderId);
                    if (orderStr && !orderStr.acceptedAt) {
                        updates.acceptedAt = new Date().toISOString();
                    }
                }
                await updateDoc(doc(db, 'orders', orderId), updates);
            },

            addNotification: async (tableId, type) => {
                await addDoc(collection(db, 'notifications'), {
                    tableId,
                    type,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                });
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

            addReview: async (review) => {
                await addDoc(collection(db, 'reviews'), {
                    ...review,
                    createdAt: new Date().toISOString()
                });
            },

            saveValleyUpdates: async (updates) => {
                // We store this as a single doc for simplicity
                await setDoc(doc(db, 'settings', 'updates'), { list: updates });
            },

            updateSettings: async (settings) => {
                await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
            },

            updateContactSettings: async (contact: ContactSettings) => {
                await setDoc(doc(db, 'settings', 'contact'), contact);
            },

            uploadImage: async (file: File, saveToGallery = false) => {
                // Dynamic import to avoid SSR issues with some firebase modules if any
                const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
                const { storage } = await import('./firebase');

                const fileRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
                await uploadBytes(fileRef, file);
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

            login: async (username, password) => {
                // Mock Auth for simplicity as requested 'quick fix'
                // In real app, use Firebase Auth
                // Admin Login
                if (username === 'admin' && password === 'tashizomcafe@123') {
                    set({ currentUser: { id: 'admin', name: 'Admin User', username: 'admin', role: 'admin' } });
                    return true;
                }

                // Staff Logins (Multiple)
                const validStaff = ['staff', 'staff1', 'staff2', 'staff3'];
                if (validStaff.includes(username) && password === 'staff123') {
                    set({ currentUser: { id: username, name: `Staff Member (${username})`, username: username, role: 'staff' } });
                    return true;
                }

                return false;
            },

            logout: () => set({ currentUser: null }),
        }),
        {
            name: 'tashizom-storage',
            partialize: (state) => ({
                currentTableId: state.currentTableId,
                cart: state.cart,
                currentUser: state.currentUser,
                sessionId: state.sessionId, // Persist Session ID across reloads
            }),
        }
    )
);
