'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import menuData from '../../../../menu-data.json';

export default function BulkImportPage() {
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [success, setSuccess] = useState(0);
    const [errors, setErrors] = useState<string[]>([]);
    const [completed, setCompleted] = useState(false);

    const addMenuItem = useStore((state) => state.addMenuItem);

    const handleBulkImport = async () => {
        setImporting(true);
        setProgress(0);
        setSuccess(0);
        setErrors([]);
        setCompleted(false);

        const items = menuData.menuItems;
        const total = items.length;

        for (let i = 0; i < total; i++) {
            try {
                const item = items[i];
                await addMenuItem({
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    isVegetarian: item.isVegetarian,
                    available: item.available,
                });

                setSuccess(prev => prev + 1);
                setProgress(Math.round(((i + 1) / total) * 100));
            } catch (error: any) {
                setErrors(prev => [...prev, `${items[i].name}: ${error.message}`]);
            }
        }

        setImporting(false);
        setCompleted(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-tashi-darker via-tashi-dark to-black p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="text-tashi-accent hover:text-tashi-accent/80">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-4xl font-bold text-white font-serif">Bulk Menu Import</h1>
                </div>

                {/* Info Card */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Ready to Import</h2>
                    <div className="space-y-2 text-gray-300">
                        <p className="text-lg">📋 <strong className="text-tashi-accent">{menuData.menuItems.length}</strong> menu items ready</p>
                        <p className="text-lg">📂 <strong className="text-tashi-accent">17</strong> categories</p>
                        <p className="text-sm text-gray-400 mt-4">
                            This will import all menu items from the prepared data file into your Firebase database.
                            Each item will be added one by one with full details including name, description, price, category, and vegetarian status.
                        </p>
                    </div>
                </div>

                {/* Import Button */}
                {!importing && !completed && (
                    <button
                        onClick={handleBulkImport}
                        className="w-full bg-tashi-accent hover:bg-tashi-accent/90 text-black font-bold py-4 px-8 rounded-xl text-xl transition-all shadow-lg hover:shadow-tashi-accent/50"
                    >
                        🚀 Start Bulk Import
                    </button>
                )}

                {/* Progress Bar */}
                {importing && (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-white mb-4">Importing...</h3>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-6 mb-4 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-tashi-accent to-tashi-primary h-full transition-all duration-300 flex items-center justify-center text-black font-bold text-sm"
                                style={{ width: `${progress}%` }}
                            >
                                {progress}%
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                                <div className="text-3xl font-bold text-green-400">{success}</div>
                                <div className="text-sm text-gray-300">Imported</div>
                            </div>
                            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                                <div className="text-3xl font-bold text-red-400">{errors.length}</div>
                                <div className="text-sm text-gray-300">Errors</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Completion Message */}
                {completed && (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-3xl font-bold text-white mb-2">Import Complete!</h3>
                            <p className="text-gray-300">All menu items have been processed</p>
                        </div>

                        {/* Final Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center">
                                <div className="text-4xl font-bold text-green-400">{success}</div>
                                <div className="text-sm text-gray-300">Successfully Imported</div>
                            </div>
                            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-center">
                                <div className="text-4xl font-bold text-red-400">{errors.length}</div>
                                <div className="text-sm text-gray-300">Failed</div>
                            </div>
                        </div>

                        {/* Error List */}
                        {errors.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                                <h4 className="text-red-400 font-bold mb-2">Errors:</h4>
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {errors.map((error, i) => (
                                        <p key={i} className="text-sm text-red-300">• {error}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <Link
                                href="/admin"
                                className="flex-1 bg-tashi-accent hover:bg-tashi-accent/90 text-black font-bold py-3 px-6 rounded-xl text-center transition-all"
                            >
                                ← Back to Admin
                            </Link>
                            <Link
                                href="/customer/menu"
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl text-center transition-all border border-white/20"
                            >
                                View Menu →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
