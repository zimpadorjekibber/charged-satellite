'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';

export default function DbStatusIndicator() {
    const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const check = async () => {
            try {
                // Try simple read operation (Checking Menu is public-safe)
                const q = query(collection(db, 'menu'), limit(1));
                await getDocs(q);
                setStatus('connected');
            } catch (e: any) {
                console.error("Health check failed", e);
                setStatus('error');
                setMsg(e.message);
            }
        };
        check();
    }, []);

    if (status === 'connected') return <div className="text-green-500 text-xs font-bold flex items-center gap-1">● DB Online</div>;
    if (status === 'error') return <div title={msg} className="text-red-500 text-xs font-bold flex items-center gap-1 cursor-help">● DB Error</div>;
    return <div className="text-yellow-500 text-xs font-bold flex items-center gap-1">● Checking DB...</div>;
}
