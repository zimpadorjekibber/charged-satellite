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

interface AppState {
    tables: Table[];
    menu: MenuItem[];
    orders: Order[];
    notifications: Notification[];
    cart: OrderItem[];
    currentTableId: string | null;
    currentUser: User | null;
    reviews: Review[];
    valleyUpdates: any[];
    geoRadius: number;

    initialize: () => void; // Changed from Promise<void> to void as listeners are sync setup

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

    placeOrder: (customerName: string, tableId?: string) => Promise<void>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;

    addNotification: (tableId: string, type: 'call_staff' | 'bill_request') => void;
    resolveNotification: (notificationId: string) => void;
    cancelNotification: (tableId: string, type: string) => void;

    addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;

    saveValleyUpdates: (updates: any[]) => Promise<void>;

    login: (username: string, password: string) => Promise<boolean>;
    updateSettings: (settings: any) => Promise<void>;

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
            currentUser: null,
            reviews: [],
            valleyUpdates: [],
            geoRadius: 5,

            initialize: () => {
                // Real-time Listeners

                // Menu
                onSnapshot(collection(db, 'menu'), (snap) => {
                    const menu = snap.docs.map(d => ({ id: d.id, ...d.data() })) as MenuItem[];
                    set({ menu });
                });

                // Tables
                onSnapshot(collection(db, 'tables'), (snap) => {
                    const tables = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Table[];
                    set({ tables: tables.sort((a, b) => a.name.localeCompare(b.name)) });
                });

                // Orders
                const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
                onSnapshot(ordersQuery, (snap) => {
                    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
                    set({ orders });
                });

                // Notifications
                const notifQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
                onSnapshot(notifQuery, (snap) => {
                    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Notification[];
                    set({ notifications });
                });

                // Reviews
                const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
                onSnapshot(reviewsQuery, (snap) => {
                    const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
                    set({ reviews });
                });

                // Settings (GeoRadius)
                onSnapshot(doc(db, 'settings', 'global'), (doc) => {
                    if (doc.exists()) {
                        set({ geoRadius: doc.data().geoRadius || 5 });
                    }
                });

                // Valley Updates
                onSnapshot(doc(db, 'settings', 'updates'), (doc) => {
                    if (doc.exists()) {
                        set({ valleyUpdates: doc.data().list || [] });
                    }
                });
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

            placeOrder: async (customerName, tableId) => {
                const state = get();
                const activeTableId = tableId || state.currentTableId;
                if (state.cart.length === 0 || !activeTableId) return;
                const total = state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

                const orderData = {
                    tableId: activeTableId,
                    customerName,
                    items: state.cart,
                    totalAmount: total,
                    status: 'Pending',
                    createdAt: new Date().toISOString()
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

            login: async (username, password) => {
                // Mock Auth for simplicity as requested 'quick fix'
                // In real app, use Firebase Auth
                if (username === 'admin' && password === 'admin123') {
                    set({ currentUser: { id: 'admin', name: 'Admin User', username: 'admin', role: 'admin' } });
                    return true;
                }
                if (username === 'staff' && password === 'staff123') {
                    set({ currentUser: { id: 'staff', name: 'Staff User', username: 'staff', role: 'staff' } });
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
            }),
        }
    )
);
