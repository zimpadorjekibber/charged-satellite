'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getCurrentPosition, parseCoordinates, calculateDistanceKm } from '@/lib/location';

export function VoiceAssistant() {
    const [isConnected, setIsConnected] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    const [checkingLocation, setCheckingLocation] = useState(true);

    // Read admin settings from store
    const aiAssistantEnabled = useStore((state) => state.aiAssistantEnabled);
    const aiAssistantMinDistanceKm = useStore((state) => state.aiAssistantMinDistanceKm);
    const contactInfo = useStore((state) => state.contactInfo);

    // Check geofencing on mount and when settings change
    useEffect(() => {
        if (!aiAssistantEnabled) {
            setShouldShow(false);
            setCheckingLocation(false);
            return;
        }

        let cancelled = false;

        const checkDistance = async () => {
            try {
                setCheckingLocation(true);
                const storeCoords = parseCoordinates(contactInfo.mapsLocation);
                if (!storeCoords) {
                    // If no restaurant coordinates, show the assistant by default
                    if (!cancelled) setShouldShow(true);
                    return;
                }

                const position = await getCurrentPosition();
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                const distanceKm = calculateDistanceKm(userLat, userLon, storeCoords.lat, storeCoords.lon);

                if (!cancelled) {
                    // Only show if user is FARTHER than the minimum distance
                    setShouldShow(distanceKm >= aiAssistantMinDistanceKm);
                }
            } catch (error) {
                // If location access fails, show the assistant (benefit of the doubt for remote users)
                console.warn('VoiceAssistant: Could not get location, showing by default.', error);
                if (!cancelled) setShouldShow(true);
            } finally {
                if (!cancelled) setCheckingLocation(false);
            }
        };

        checkDistance();

        return () => { cancelled = true; };
    }, [aiAssistantEnabled, aiAssistantMinDistanceKm, contactInfo.mapsLocation]);

    const conversation = useConversation({
        onConnect: () => {
            console.log('Connected to ElevenLabs AI');
            setIsConnected(true);
        },
        onDisconnect: () => {
            console.log('Disconnected from ElevenLabs AI');
            setIsConnected(false);
        },
        onMessage: (message) => {
            console.log('Message from AI:', message);
        },
        onError: (error) => {
            console.error('ElevenLabs Auth/Connection Error:', error);
            setIsConnected(false);
        }
    });

    const startConversation = useCallback(async () => {
        try {
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // Start the conversation with your Agent ID
            await conversation.startSession({
                agentId: 'agent_4101kjp5w2mwevdv1gsn7jd40f07',
            });
        } catch (error) {
            console.error('Failed to start conversation:', error);
            alert('Aawaz ki permission (Microphone access) zaruri hai.');
        }
    }, [conversation]);

    const stopConversation = useCallback(async () => {
        await conversation.endSession();
    }, [conversation]);

    // Don't render anything if disabled, still checking, or user is too close
    if (!aiAssistantEnabled || checkingLocation || !shouldShow) {
        return null;
    }

    return (
        <div className="fixed bottom-24 right-4 z-[9999] flex flex-col items-end gap-2">
            {/* Status indicator bubble */}
            {isConnected && (
                <div className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-2 mb-1 animate-pulse shadow-lg">
                    {conversation.isSpeaking ? (
                        <>
                            <div className="flex items-center gap-1">
                                <span className="w-1 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-amber-400">Agent Bol Rahi Hai</span>
                        </>
                    ) : (
                        <>
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-400">Listening...</span>
                        </>
                    )}
                </div>
            )}

            {/* Main Button */}
            <button
                onClick={isConnected ? stopConversation : startConversation}
                disabled={conversation.status === 'connecting'}
                className={`
                    group relative flex items-center justify-center p-3 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.3)] 
                    transition-all duration-300 active:scale-95 border-2
                    ${isConnected
                        ? 'bg-red-500 hover:bg-red-600 border-red-400'
                        : 'bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 border-amber-300'
                    }
                `}
            >
                {/* Ripple Effect when not connected */}
                {!isConnected && (
                    <div className="absolute inset-0 rounded-full border border-amber-500/50 animate-ping opacity-50 pointer-events-none" />
                )}

                {conversation.status === 'connecting' ? (
                    <Loader2 size={24} className="text-white animate-spin" />
                ) : isConnected ? (
                    <Square size={24} className="text-white fill-white" />
                ) : (
                    <Mic size={24} className="text-tashi-dark group-hover:scale-110 transition-transform" />
                )}

                {/* Badge text on button hover */}
                {!isConnected && conversation.status !== 'connecting' && (
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/90 text-amber-500 font-medium text-xs whitespace-nowrap px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 tracking-wide">
                        Talk to Tashi (AI Assistant)
                    </div>
                )}
            </button>
        </div>
    );
}
