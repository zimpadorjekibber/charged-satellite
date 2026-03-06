'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Phone, X, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';

export default function CustomerCallListener() {
    const currentTableId = useStore((state) => state.currentTableId);
    const tables = useStore((state) => state.tables);
    const [incomingCall, setIncomingCall] = useState<any | null>(null);
    const ringtoneRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    // Get table name for display
    const tableName = tables.find(t => t.id === currentTableId)?.name || currentTableId;

    const {
        callStatus,
        remoteStream,
        answerCall,
        endCall,
        currentCallId
    } = useWebRTC(currentTableId);

    // Initial setup for Audio Elements
    useEffect(() => {
        ringtoneRef.current = new Audio('/kitchen-bell.mp3');
        ringtoneRef.current.loop = true;

        if (remoteStream && remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch(console.error);
        }
    }, [remoteStream]);


    // Listen for new incoming calls targeting THIS table
    useEffect(() => {
        if (!currentTableId) return;

        const q = query(
            collection(db, 'calls'),
            where('status', '==', 'ringing'),
            where('tableId', '==', tableName) // Staff uses table name when calling back
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const docData = change.doc.data();

                if (change.type === 'added') {
                    // New incoming call from staff!
                    setIncomingCall({ id: change.doc.id, ...docData });
                    if (ringtoneRef.current) ringtoneRef.current.play().catch(e => console.error("Ringtone blocked autoplay", e));

                    // Vibrate
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                        navigator.vibrate([200, 100, 200, 100, 200]);
                    }
                }
                if (change.type === 'removed') {
                    setIncomingCall((prev: any) => (prev?.id === change.doc.id ? null : prev));
                    if (ringtoneRef.current) ringtoneRef.current.pause();
                }
                if (change.type === 'modified') {
                    if (docData.status === 'ended' || docData.status === 'rejected') {
                        setIncomingCall((prev: any) => (prev?.id === change.doc.id ? null : prev));
                        if (ringtoneRef.current) ringtoneRef.current.pause();
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [currentTableId, tableName]);

    // Handle Call Status changes
    useEffect(() => {
        if (callStatus === 'connected' || callStatus === 'ended') {
            if (ringtoneRef.current) {
                ringtoneRef.current.pause();
                ringtoneRef.current.currentTime = 0;
            }
        }
        if (callStatus === 'ended') {
            setIncomingCall(null);
        }
    }, [callStatus]);


    const handleAccept = async () => {
        if (!incomingCall) return;
        if (ringtoneRef.current) ringtoneRef.current.pause();
        await answerCall(incomingCall.id);
    };

    const handleReject = async () => {
        if (!incomingCall) return;
        if (ringtoneRef.current) ringtoneRef.current.pause();
        await endCall(incomingCall.id);
        setIncomingCall(null);
    };

    const isCallActive = !!incomingCall || (callStatus === 'connected' && currentCallId);

    return (
        <>
            {/* Hidden Audio Element for Remote Stream */}
            <audio ref={remoteAudioRef} autoPlay />

            <AnimatePresence>
                {isCallActive && (
                    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 touch-none">

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="text-center flex flex-col items-center space-y-8 max-w-sm w-full"
                        >
                            {/* Staff Avatar Animation */}
                            <div className="relative">
                                {callStatus !== 'connected' && (
                                    <div className="absolute inset-0 bg-tashi-accent/30 rounded-full animate-ping" />
                                )}
                                <div className="relative w-32 h-32 bg-gradient-to-br from-neutral-800 to-black rounded-full border-4 border-tashi-accent shadow-[0_0_30px_rgba(218,165,32,0.3)] flex items-center justify-center text-tashi-accent z-10">
                                    <PhoneCall size={50} className={callStatus === 'connected' ? 'text-green-400' : 'animate-pulse'} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold text-white font-serif">
                                    Staff Calling...
                                </h2>
                                <p className="text-gray-400 font-medium tracking-wide">Voice Assistance Request</p>

                                <div className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10">
                                    {callStatus === 'connected' ? (
                                        <>
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-green-400 font-black text-xs uppercase tracking-widest">Live Connection</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-2.5 h-2.5 rounded-full bg-tashi-accent animate-ping" />
                                            <span className="text-tashi-accent font-black text-xs uppercase tracking-widest">Incoming...</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-8 pt-4 w-full justify-center">
                                {callStatus !== 'connected' && incomingCall && (
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleAccept}
                                        className="flex-1 max-w-[140px] flex flex-col items-center gap-3 bg-green-600 text-white p-5 rounded-3xl shadow-xl border border-green-500/50"
                                    >
                                        <div className="bg-white/20 p-3 rounded-full">
                                            <Phone size={28} />
                                        </div>
                                        <span className="font-bold text-xs uppercase tracking-widest">Accept</span>
                                    </motion.button>
                                )}

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleReject}
                                    className="flex-1 max-w-[140px] flex flex-col items-center gap-3 bg-red-600 text-white p-5 rounded-3xl shadow-xl border border-red-500/50"
                                >
                                    <div className="bg-white/20 p-3 rounded-full">
                                        <X size={28} />
                                    </div>
                                    <span className="font-bold text-xs uppercase tracking-widest">
                                        {callStatus === 'connected' ? 'End' : 'Decline'}
                                    </span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
