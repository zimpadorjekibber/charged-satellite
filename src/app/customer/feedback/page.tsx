'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Star, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeedbackPage() {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [name, setName] = useState(''); // Could prefill if we knew who they were more persistently
    const router = useRouter();
    const addReview = useStore((state) => state.addReview);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        await addReview({
            customerName: name || 'Anonymous Guest',
            rating,
            comment
        });

        router.push('/'); // Or a thank you page
    };

    return (
        <div className="min-h-screen bg-tashi-darker p-8 flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white/5 border border-white/5 backdrop-blur-3xl rounded-3xl p-8"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Rate Your Meal</h1>
                    <p className="text-gray-400">How was your experience at TashiZom?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        size={32}
                                        className={`${(hoveredRating || rating) >= star ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg' : 'text-gray-600'} transition-colors duration-200`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-sm font-medium text-tashi-accent h-5">
                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoveredRating || rating]}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Your Name (Optional)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="E.g. Tenzin"
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-tashi-accent transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Comments</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you liked or how we can improve..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white h-32 resize-none focus:outline-none focus:border-tashi-accent transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={rating === 0}
                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${rating > 0
                                ? 'bg-tashi-accent text-tashi-dark hover:bg-white hover:scale-[1.02]'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Submit Feedback <Send size={20} />
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
