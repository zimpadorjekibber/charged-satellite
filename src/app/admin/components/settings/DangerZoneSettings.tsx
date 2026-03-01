'use client';

import React from 'react';
import { Trash } from 'lucide-react';
import { useStore } from '@/lib/store';

export function DangerZoneSettings() {
    const clearAllData_Dangerous = useStore((state: any) => state.clearAllData_Dangerous);

    return (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <h2 className="text-xl font-bold text-red-900 mb-1">Danger Zone</h2>
                <p className="text-red-700/70 text-sm">Deleting data is permanent and cannot be undone. Always double check.</p>
            </div>
            <button
                onClick={() => {
                    const pin = prompt("CRITICAL ACTION: Enter Admin PIN to DELETE ALL ORDERS & DATA:");
                    if (pin === '2025') { // Security PIN
                        if (confirm("FINAL WARNING: All analytics, orders, and sessions will be WIPED. Continue?")) {
                            clearAllData_Dangerous();
                            alert("Database wiped. Refreshing...");
                            window.location.reload();
                        }
                    } else if (pin) {
                        alert("Incorrect PIN.");
                    }
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-red-500/20"
            >
                <Trash size={24} />
                DELETE ALL ORDERS & DATA
            </button>
        </div>
    );
}
