'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Phone, X, PhoneCall, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StaffCallListener() {
    const [incomingCall, setIncomingCall] = useState<any | null>(null);
    const ringtoneRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    const {
        callStatus,
        remoteStream,
        answerCall,
        endCall,
        currentCallId
    } = useWebRTC(null);

    // Initial setup for Audio Elements
    useEffect(() => {
        ringtoneRef.current = new Audio('/kitchen-bell.mp3');
        ringtoneRef.current.loop = true;

        if (remoteStream && remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch(console.error);
        }
    }, [remoteStream]);


    // Listen for new incoming calls globally
    useEffect(() => {
        const q = query(
            collection(db, 'calls'),
            where('status', '==', 'ringing')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const docData = change.doc.data();

                if (change.type === 'added') {
                    // New incoming call!
                    setIncomingCall({ id: change.doc.id, ...docData });
                    if (ringtoneRef.current) ringtoneRef.current.play().catch(e => console.error("Ringtone blocked autoplay", e));
                }
                if (change.type === 'removed') {
                    // Caller ended before pickup
                    if (incomingCall?.id === change.doc.id) {
                        setIncomingCall(null);
                        if (ringtoneRef.current) ringtoneRef.current.pause();
                    }
                }
                if (change.type === 'modified') {
                    if (docData.status === 'ended' || docData.status === 'rejected') {
                        setIncomingCall(null);
                        if (ringtoneRef.current) ringtoneRef.current.pause();
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [incomingCall]);

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
                    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 touch-none">

                        {/* Call Status UI */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="text-center flex flex-col items-center space-y-6 max-w-sm w-full"
                        >

                            {/* Avatar / Ringing Animation */}
                            <div className="relative">
                                {callStatus === 'idle' || callStatus === 'ringing' || incomingCall ? (
                                    <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping" />
                                ) : null}
                                <div className="relative w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full border-4 border-gray-800 shadow-2xl flex items-center justify-center text-white z-10">
                                    <PhoneCall size={40} className={callStatus === 'connected' ? 'text-green-400' : 'text-white animate-pulse'} />
                                </div>
                            </div>

                            {/* Text Info */}
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-white font-serif tracking-wide drop-shadow-md">
                                    Table {incomingCall?.tableId || 'Walk-In'}
                                </h2>
                                <p className="text-lg text-gray-300 font-medium">Customer Voice Call</p>

                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10">
                                    {callStatus === 'connected' ? (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                            <span className="text-green-400 font-bold text-sm tracking-widest uppercase">Connected & Live</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                                            <span className="text-yellow-400 font-bold text-sm tracking-widest uppercase">Incoming Call...</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-6 pt-6 w-full justify-center">
                                {callStatus !== 'connected' && incomingCall && (
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleAccept}
                                        className="flex-1 max-w-[140px] flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white p-4 rounded-3xl shadow-[0_10px_20px_rgba(34,197,94,0.3)] border border-green-400/50 transition-all"
                                    >
                                        <div className="bg-white/20 p-3 rounded-full">
                                            <Phone size={28} />
                                        </div>
                                        <span className="font-bold tracking-wider text-sm uppercase text-green-50 drop-shadow-md">Accept</span>
                                    </motion.button>
                                )}

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleReject}
                                    className="flex-1 max-w-[140px] flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white p-4 rounded-3xl shadow-[0_10px_20px_rgba(239,68,68,0.3)] border border-red-400/50 transition-all"
                                >
                                    <div className="bg-white/20 p-3 rounded-full">
                                        <X size={28} />
                                    </div>
                                    <span className="font-bold tracking-wider text-sm uppercase text-red-50 drop-shadow-md">End Call</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

