import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, onSnapshot, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

interface IceCandidateData {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
}

export const useWebRTC = (tableName: string | null) => {
    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [currentCallId, setCurrentCallId] = useState<string | null>(null);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const candidatesUnsubRef = useRef<(() => void) | null>(null);

    // Configuration for STUN servers
    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    const cleanup = useCallback(async () => {
        // Stop all local tracks (turn off microphone)
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
        localStreamRef.current = null;

        // Close peer connection
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }

        // Unsubscribe from Firestore listeners
        if (unsubscribeRef.current) unsubscribeRef.current();
        if (candidatesUnsubRef.current) candidatesUnsubRef.current();

        // Delete the call document if we were part of it
        if (currentCallId) {
            try {
                await deleteDoc(doc(db, 'calls', currentCallId));
            } catch (err) {
                console.error("Failed to delete call document:", err);
            }
        }

        setRemoteStream(null);
        setCallStatus('idle');
        setCurrentCallId(null);
    }, [currentCallId]);

    const initPeerConnection = useCallback(() => {
        if (pcRef.current) pcRef.current.close();
        pcRef.current = new RTCPeerConnection(servers);

        pcRef.current.ontrack = (event) => {
            console.log("Got remote track");
            const newStream = new MediaStream();
            event.streams[0].getTracks().forEach((track) => {
                newStream.addTrack(track);
            });
            setRemoteStream(newStream);
            setCallStatus('connected');
        };

        return pcRef.current;
    }, []);

    const getLocalAudioStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error("Microphone access denied or error:", err);
            alert("Microphone access is required for voice calling.");
            throw err;
        }
    }, []);

    // ----------------------------------------------------
    // CALLER: Start a call
    // ----------------------------------------------------
    const startCall = useCallback(async (tableId: string, customerName: string) => {
        setCallStatus('calling');
        const callDoc = doc(collection(db, 'calls'));
        const callId = callDoc.id;
        setCurrentCallId(callId);

        try {
            const stream = await getLocalAudioStream();
            const pc = initPeerConnection();

            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            const offerCandidatesCollection = collection(callDoc, 'offerCandidates');
            const answerCandidatesCollection = collection(callDoc, 'answerCandidates');

            // Save our ICE candidates
            pc.onicecandidate = async (event) => {
                if (event.candidate) {
                    await setDoc(doc(offerCandidatesCollection), event.candidate.toJSON());
                }
            };

            // Create Offer
            const offerDescription = await pc.createOffer();
            await pc.setLocalDescription(offerDescription);

            const offer = {
                sdp: offerDescription.sdp,
                type: offerDescription.type,
            };

            await setDoc(callDoc, {
                offer,
                tableId,
                customerName,
                status: 'ringing', // Notify staff
                timestamp: new Date().toISOString()
            });

            // Listen for Answer
            unsubscribeRef.current = onSnapshot(callDoc, (snapshot) => {
                const data = snapshot.data();
                if (!pc.currentRemoteDescription && data?.answer) {
                    const answerDescription = new RTCSessionDescription(data.answer);
                    pc.setRemoteDescription(answerDescription);
                }
                if (data?.status === 'ended' || data?.status === 'rejected') {
                    cleanup();
                }
            });

            // Listen for remote ICE candidates
            candidatesUnsubRef.current = onSnapshot(answerCandidatesCollection, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const candidate = new RTCIceCandidate(change.doc.data() as IceCandidateData);
                        pc.addIceCandidate(candidate);
                    }
                });
            });

        } catch (err) {
            console.error("Failed to start call:", err);
            cleanup();
        }
    }, [cleanup, getLocalAudioStream, initPeerConnection]);


    // ----------------------------------------------------
    // RECEIVER: Answer a call
    // ----------------------------------------------------
    const answerCall = useCallback(async (callId: string) => {
        setCurrentCallId(callId);
        const callDoc = doc(db, 'calls', callId);

        try {
            const stream = await getLocalAudioStream();
            const pc = initPeerConnection();

            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            const offerCandidatesCollection = collection(callDoc, 'offerCandidates');
            const answerCandidatesCollection = collection(callDoc, 'answerCandidates');

            // Save our ICE candidates
            pc.onicecandidate = async (event) => {
                if (event.candidate) {
                    await setDoc(doc(answerCandidatesCollection), event.candidate.toJSON());
                }
            };

            const callData = (await getDoc(callDoc)).data();
            if (!callData?.offer) {
                throw new Error("No offer found in call document.");
            }

            const offerDescription = new RTCSessionDescription(callData.offer);
            await pc.setRemoteDescription(offerDescription);

            const answerDescription = await pc.createAnswer();
            await pc.setLocalDescription(answerDescription);

            const answer = {
                type: answerDescription.type,
                sdp: answerDescription.sdp,
            };

            await updateDoc(callDoc, {
                answer,
                status: 'connected'
            });
            setCallStatus('connected');

            // Listen for remote ICE candidates
            candidatesUnsubRef.current = onSnapshot(offerCandidatesCollection, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const candidate = new RTCIceCandidate(change.doc.data() as IceCandidateData);
                        pc.addIceCandidate(candidate);
                    }
                });
            });

            // Listen if caller ends
            unsubscribeRef.current = onSnapshot(callDoc, (snapshot) => {
                const data = snapshot.data();
                if (!snapshot.exists() || data?.status === 'ended') {
                    cleanup();
                }
            });

        } catch (err) {
            console.error("Failed to answer call:", err);
            cleanup();
        }
    }, [cleanup, getLocalAudioStream, initPeerConnection]);

    // ----------------------------------------------------
    // End/Reject a call
    // ----------------------------------------------------
    const endCall = useCallback(async (callId?: string) => {
        const targetId = callId || currentCallId;
        if (targetId) {
            try {
                await updateDoc(doc(db, 'calls', targetId), { status: 'ended' });
            } catch (e) {
                console.error("Error setting ended state", e);
            }
        }
        cleanup();
    }, [currentCallId, cleanup]);

    // Optional: Global listener logic could go here if we wanted the hook to also *listen* 
    // for incoming calls, but it's cleaner to separate that into the Staff Component.

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        callStatus,
        remoteStream,
        localStream,
        startCall,
        answerCall,
        endCall,
        currentCallId
    };
};
