// TaskForge_AI/frontend/components/AuthForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuthFormProps {
    type: 'login' | 'signup';
}

export default function AuthForm({ type }: AuthFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const url = type === 'signup' ? 'http://localhost:8000/users/signup' : 'http://localhost:8000/users/login';
        const body = type === 'signup'
            ? JSON.stringify({ username, password })
            : new URLSearchParams({ username, password });

        const headers = type === 'signup'
            ? { 'Content-Type': 'application/json' }
            : { 'Content-Type': 'application/x-www-form-urlencoded' };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body,
            });

            if (response.ok) {
                if (type === 'signup') {
                    setMessage('Signup successful! Please log in.');
                    setUsername('');
                    setPassword('');
                    setTimeout(() => router.push('/login'), 2000);
                } else {
                    const data = await response.json();
                    // Store the JWT and username in local storage
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('username', data.username); // <-- ADD THIS LINE
                    setMessage('Login successful! Redirecting to dashboard...');
                    router.push('/');
                }
            } else {
                const errorData = await response.json();
                setMessage(errorData.detail || 'An error occurred.');
            }
        } catch (error) {
            setMessage('Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-center text-on-surface">
                {type === 'signup' ? 'Sign Up' : 'Log In'}
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full mt-1 p-2 bg-background border border-gray-700 rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full mt-1 p-2 bg-background border border-gray-700 rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-on-primary font-bold py-2 px-4 rounded-md hover:bg-primary/80 transition-colors duration-200"
                >
                    {loading ? 'Processing...' : (type === 'signup' ? 'Sign Up' : 'Log In')}
                </button>
                {message && <p className="mt-4 text-center text-sm">{message}</p>}
            </div>
            <div className="mt-4 text-center text-sm text-gray-400">
                {type === 'signup' ? (
                    <>Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link></>
                ) : (
                    <>Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link></>
                )}
            </div>
        </form>
    );
}