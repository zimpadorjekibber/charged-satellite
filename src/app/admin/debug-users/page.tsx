'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function DebugUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [secret, setSecret] = useState('');
    const [authorized, setAuthorized] = useState(false);

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (secret === 'tashizom-secure-setup-2025') {
            setAuthorized(true);
            loadUsers();
        } else {
            alert('Invalid secret');
        }
    };

    const loadUsers = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersList);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-4">Debug Users</h1>
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
                            Access Debug Panel
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">User Accounts Debug</h1>

                {loading ? (
                    <p>Loading users...</p>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-mono">{user.email}</td>
                                            <td className="px-6 py-4 text-sm">{user.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-mono">{user.id}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h2 className="font-bold text-yellow-800 mb-2">Important Notes:</h2>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                        <li>When logging in, if you enter just a username (e.g., "staff2"), the system automatically appends "@tashizomcafe.in"</li>
                        <li>Make sure the email addresses above match what you're trying to log in with</li>
                        <li>If they don't match, you'll get "Invalid credentials"</li>
                        <li>Use the full email address when logging in, OR ensure users were created with @tashizomcafe.in</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
