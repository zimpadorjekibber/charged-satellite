'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function ReviewModal() {
    const [showModal, setShowModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

    const orders = useStore((state: any) => state.orders);
    const sessionId = useStore((state: any) => state.sessionId);
    const addReview = useStore((state: any) => state.addReview);

    // Use useRef to persist the previous state of orders across renders
    const prevOrdersRef = useRef<Map<string, any>>(new Map());
    const isFirstRun = useRef(true);

    // Check for order completions whenever 'orders' changes
    useEffect(() => {
        const currentMyOrders = orders.filter((o: any) => o.sessionId === sessionId);
        const currentIds = new Set(currentMyOrders.map((o: any) => o.id));

        // Skip detection on initial mount/load
        if (isFirstRun.current) {
            currentMyOrders.forEach((order: any) => {
                prevOrdersRef.current.set(order.id, order);
            });
            isFirstRun.current = false;
            return;
        }

        // Compare with previous state to find removed orders
        const previousOrders = prevOrdersRef.current;
        previousOrders.forEach((order: any, id: string) => {
            if (!currentIds.has(id)) {
                // Order was removed (Completed/Paid/Deleted)
                // Filter out 'Rejected' or 'Cancelled' if you don't want reviews for those
                // For now, we assume removal = Done = Ask for review
                if (order.status !== 'Rejected' && order.status !== 'Cancelled') {
                    console.log("Order completed, triggering review:", id);
                    setCompletedOrderId(id);
                    setShowModal(true);
                }
            }
        });

        // Update ref for next render
        const newMap = new Map();
        currentMyOrders.forEach((order: any) => {
            newMap.set(order.id, order);
        });
        prevOrdersRef.current = newMap;

    }, [orders, sessionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);

        try {
            await addReview({
                customerName: customerName || 'Anonymous',
                rating,
                comment: comment || 'No comment provided',
                orderId: completedOrderId
            });

            // Close modal after successful submission
            setShowModal(false);
            setRating(0);
            setComment('');
            setCustomerName('');
            setCompletedOrderId(null);
        } catch (error) {
            console.error('Failed to submit review:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && e.stopPropagation()}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto flex items-center justify-center">
                                    <Star className="text-white" size={32} fill="white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                How was your experience?
                            </h2>
                            <p className="text-gray-600">
                                Your feedback helps us serve you better
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Star Rating */}
                            <div className="flex flex-col items-center gap-4">
                                <label className="text-sm font-semibold text-gray-700">
                                    Rate your experience
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                size={40}
                                                className={`transition-colors ${star <= (hoverRating || rating)
                                                    ? 'text-orange-500 fill-orange-500'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {rating > 0 && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm font-medium text-orange-600"
                                    >
                                        {rating === 5 && '⭐ Excellent!'}
                                        {rating === 4 && '😊 Great!'}
                                        {rating === 3 && '🙂 Good'}
                                        {rating === 2 && '😕 Could be better'}
                                        {rating === 1 && '😞 Needs improvement'}
                                    </motion.p>
                                )}
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Your Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 bg-white placeholder-gray-400"
                                />
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Your Feedback (Optional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us about your experience..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all text-gray-900 bg-white placeholder-gray-400"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={rating === 0 || isSubmitting}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Submit Review
                                    </>
                                )}
                            </button>

                            {rating === 0 && (
                                <p className="text-center text-sm text-red-500">
                                    Please select a star rating to submit
                                </p>
                            )}
                        </form>

                        {/* "Thank You" message after submission */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                Thank you for dining with us! 🙏
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
