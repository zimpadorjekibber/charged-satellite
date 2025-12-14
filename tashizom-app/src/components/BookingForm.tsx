"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Calendar, Users } from "lucide-react";

export default function BookingForm({ className }: { className?: string }) {
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Thank you for your request! We will contact you shortly via WhatsApp/Phone to confirm availability and discuss the advance payment.");
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Check In</label>
                    <div className="relative">
                        <input
                            type="date"
                            required
                            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none"
                            onChange={(e) => setCheckIn(e.target.value)}
                        />
                        <Calendar size={14} className="absolute left-3 top-3 text-stone-400" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Check Out</label>
                    <div className="relative">
                        <input
                            type="date"
                            required
                            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none"
                            onChange={(e) => setCheckOut(e.target.value)}
                        />
                        <Calendar size={14} className="absolute left-3 top-3 text-stone-400" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Guests</label>
                <div className="relative">
                    <select
                        className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none bg-white appearance-none"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                    >
                        {[1, 2, 3, 4, 5, 6].map(n => (
                            <option key={n} value={n}>{n} Guests</option>
                        ))}
                    </select>
                    <Users size={14} className="absolute left-3 top-3 text-stone-400" />
                </div>
            </div>

            <div className="space-y-2 pt-2">
                <input
                    type="text"
                    placeholder="Your Name"
                    required
                    className="w-full px-4 py-2 border border-stone-200 rounded text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none"
                />
                <input
                    type="tel"
                    placeholder="Phone Number (for WhatsApp)"
                    required
                    className="w-full px-4 py-2 border border-stone-200 rounded text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none"
                />
            </div>

            <Button type="submit" className="w-full py-3">Request Booking</Button>
            <p className="text-[10px] text-center text-stone-400">
                We will contact you to collect the advance payment via UPI.
            </p>
        </form>
    );
}
