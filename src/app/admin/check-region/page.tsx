'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export default function CheckRegionPage() {
    const [checking, setChecking] = useState(true);
    const [result, setResult] = useState<any>({});
    const [secret, setSecret] = useState('');
    const [authorized, setAuthorized] = useState(false);

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (secret === 'tashizom-secure-setup-2025') {
            setAuthorized(true);
            checkRegion();
        } else {
            alert('Invalid secret');
        }
    };

    const checkRegion = async () => {
        setChecking(true);
        const info: any = {
            projectId: 'charged-satellite-zimpad',
            firestoreHost: db.app.options.authDomain,
            timestamp: new Date().toISOString()
        };

        // Measure latency by doing a simple query
        const start = performance.now();
        try {
            const q = query(collection(db, 'tables'), limit(1));
            await getDocs(q);
            const end = performance.now();
            info.latency = Math.round(end - start);
        } catch (error) {
            info.latency = 'Error';
            info.error = String(error);
        }

        // Estimate region based on latency (rough estimate)
        let estimatedRegion = 'Unknown';
        if (info.latency < 150) {
            estimatedRegion = '🇮🇳 Likely India/Asia region (GOOD!)';
        } else if (info.latency < 300) {
            estimatedRegion = '🇸🇬 Likely Singapore/Asia region (Acceptable)';
        } else if (info.latency > 300) {
            estimatedRegion = '🇺🇸 Likely US/Europe region (NEEDS OPTIMIZATION!)';
        }
        info.estimatedRegion = estimatedRegion;

        setResult(info);
        setChecking(false);
    };

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-4">Check Firebase Region</h1>
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                                Setup Secret
                            </label>
                            <input
                                type="password"
                                className="w-full border p-2 rounded"
                                value={secret}
                                onChange={e => setSecret(e.target.value)}
                                placeholder="Enter the setup secret code"
                            />
                        </div>
                        <button className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700">
                            Check Region
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">🌍 Firebase Region Check</h1>

                {checking ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Testing connection latency...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Latency Test Results</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-semibold">Database Latency:</span>
                                    <span className={`text-2xl font-bold ${result.latency < 150 ? 'text-green-600' :
                                            result.latency < 300 ? 'text-yellow-600' :
                                                'text-red-600'
                                        }`}>
                                        {result.latency}ms
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-semibold">Estimated Region:</span>
                                    <span className="text-lg">{result.estimatedRegion}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-semibold">Project ID:</span>
                                    <span className="font-mono text-sm">{result.projectId}</span>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-xl shadow-lg p-6 ${result.latency < 150 ? 'bg-green-50 border-2 border-green-200' :
                                result.latency < 300 ? 'bg-yellow-50 border-2 border-yellow-200' :
                                    'bg-red-50 border-2 border-red-200'
                            }`}>
                            <h2 className="text-xl font-bold mb-3">
                                {result.latency < 150 ? '✅ Excellent!' :
                                    result.latency < 300 ? '⚠️ Acceptable' :
                                        '❌ Needs Optimization'}
                            </h2>
                            <div className="space-y-2 text-sm">
                                {result.latency < 150 && (
                                    <>
                                        <p>Your Firebase database appears to be in India or nearby Asia region.</p>
                                        <p className="font-semibold">Performance is OPTIMAL for Indian customers! 🎉</p>
                                    </>
                                )}
                                {result.latency >= 150 && result.latency < 300 && (
                                    <>
                                        <p>Your Firebase database might be in Singapore or nearby region.</p>
                                        <p className="font-semibold">Performance is acceptable, but could be better if moved to India region.</p>
                                    </>
                                )}
                                {result.latency >= 300 && (
                                    <>
                                        <p className="text-red-700 font-semibold">⚠️ Your database appears to be in US or Europe region!</p>
                                        <p>This means every customer request travels:</p>
                                        <p className="font-mono text-xs bg-white p-2 rounded my-2">
                                            India → USA → India (≈{result.latency}ms delay)
                                        </p>
                                        <p className="font-semibold">RECOMMENDATION: Migrate to India region for 4-6x faster performance!</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                            <h2 className="font-bold text-blue-900 mb-3">📍 How to Find Exact Region in Firebase Console:</h2>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                                <li>Visit: <a href="https://console.firebase.google.com" target="_blank" className="underline">Firebase Console</a></li>
                                <li>Click on your project: <span className="font-mono bg-white px-2 py-1 rounded">charged-satellite-zimpad</span></li>
                                <li>In left sidebar, click <strong>"Firestore Database"</strong></li>
                                <li>Look for a small text that says location (e.g., "nam5 (us-central)" or "asia-south1")</li>
                                <li>Alternatively, click on Settings ⚙️ → Project Settings → look under "Default GCP resource location"</li>
                            </ol>
                        </div>

                        <button
                            onClick={checkRegion}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
                        >
                            🔄 Test Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
