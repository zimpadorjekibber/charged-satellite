'use client';

import { useStore } from '../../lib/store';
import { useState, useEffect } from 'react';

export default function DebugPage() {
    const currentUser = useStore(state => state.currentUser);
    const login = useStore(state => state.login);
    const logout = useStore(state => state.logout);

    const [email, setEmail] = useState('tanzintsore@gmail.com');
    const [password, setPassword] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    const runTest = async () => {
        addLog(`Starting test for ${email}...`);
        try {
            await logout();
            addLog('Logged out current user.');

            addLog('Calling store.login()...');
            const result = await login(email, password);

            addLog(`login() returned: ${result}`);

            const curr = useStore.getState().currentUser;
            addLog(`Current store user after login: ${JSON.stringify(curr)}`);

        } catch (e: any) {
            addLog(`ERROR: ${e.message}`);
        }
    };

    return (
        <div style={{ padding: '50px', fontFamily: 'monospace', color: 'black' }}>
            <h1>Auth Debugger</h1>

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ padding: '8px', marginRight: '10px', width: '300px' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ padding: '8px', marginRight: '10px' }}
                />
                <button onClick={runTest} style={{ padding: '8px 16px', cursor: 'pointer' }}>Run Test</button>
            </div>

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', minHeight: '300px' }}>
                <h3>Logs:</h3>
                {logs.map((log, i) => (
                    <div key={i} style={{ marginBottom: '4px' }}>{log}</div>
                ))}
            </div>

            <div style={{ marginTop: '40px' }}>
                <h3>Current Store State:</h3>
                <pre>{JSON.stringify(currentUser, null, 2)}</pre>
            </div>
        </div>
    );
}
