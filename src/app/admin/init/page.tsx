'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function InitUserPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'staff'>('staff');
    const [secret, setSecret] = useState('');
    const [status, setStatus] = useState('');

    const handleInit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Processing...');

        if (secret !== 'tashizom-secure-setup-2025') {
            setStatus('Error: Invalid Setup Secret');
            return;
        }

        try {
            // 1. Try to Login first, if fails, Register
            let user;
            try {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                user = cred.user;
                setStatus('Logged in existing user...');
            } catch (loginErr) {
                // If login fails, try create
                try {
                    const cred = await createUserWithEmailAndPassword(auth, email, password);
                    user = cred.user;
                    setStatus('Created new user...');
                } catch (createErr: any) {
                    throw new Error('Failed to login or register: ' + createErr.message);
                }
            }

            if (!user) throw new Error('No user found');

            // 2. Set Role in Firestore explicitly
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                role: role,
                name: email.split('@')[0], // Simple name derived from email
                createdAt: new Date().toISOString()
            });

            setStatus(`Success! User ${email} assigned role: ${role}`);

        } catch (err: any) {
            console.error(err);
            setStatus('Error: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Initialize User Role</h1>
                <p className="text-sm text-gray-500 mb-6">Use this hidden utility to create accounts or assign roles to existing accounts.</p>

                <form onSubmit={handleInit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Setup Secret</label>
                        <input
                            type="password"
                            className="w-full border p-2 rounded"
                            value={secret}
                            onChange={e => setSecret(e.target.value)}
                            placeholder="Enter the setup secret code"
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full border p-2 rounded"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@tashizom.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full border p-2 rounded"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Strong password"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Role</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={role}
                            onChange={(e: any) => setRole(e.target.value)}
                        >
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700">
                        Initialize User
                    </button>

                    {status && (
                        <div className={`p-4 rounded text-sm ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {status}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
