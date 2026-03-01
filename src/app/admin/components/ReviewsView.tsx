'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function ReviewsView() {
    const reviews = useStore((state) => state.reviews);
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Google Maps Link Card */}
                <div className="bg-gradient-to-br from-blue-900/40 to-black p-8 rounded-3xl border border-blue-500/30 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500 rounded-xl text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Google Maps Reviews</h2>
                        </div>
                        <p className="text-blue-200 mb-8 max-w-sm">
                            Manage and view your public reputation directly on Google Maps. All historical reviews are available there.
                        </p>
                        <a
                            href="https://www.google.com/maps/place/Tashizom/@32.2276,77.9975,17z"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                            Open Google Maps Profile <ArrowRight size={18} />
                        </a>
                    </div>
                </div>

                {/* Internal Rating Stats */}
                <div className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col justify-center items-center shadow-sm">
                    <h3 className="text-gray-500 font-medium uppercase tracking-widest mb-2">In-App Customer Rating</h3>
                    <div className="text-7xl font-bold text-gray-900 mb-2">{averageRating}</div>
                    <div className="flex gap-1 text-yellow-400 mb-4">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={24} fill={s <= Math.round(Number(averageRating)) ? "currentColor" : "none"} strokeWidth={s <= Math.round(Number(averageRating)) ? 0 : 2} />
                        ))}
                    </div>
                    <p className="text-gray-500 text-sm">Based on {reviews.length} feedback submissions</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Feedback</h3>
                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No in-app reviews yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((review) => (
                            <div key={review.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{review.customerName}</h4>
                                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-0.5 text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
