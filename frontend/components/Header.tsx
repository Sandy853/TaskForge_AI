// TaskForge_AI/frontend/components/Header.tsx

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('User'); // Default to 'User'
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUsername = localStorage.getItem('username');
    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    } else {
      setIsAuthenticated(false);
      setUsername('User');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username'); // <-- ADD THIS LINE
    setIsAuthenticated(false);
    setIsDropdownOpen(false);
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface text-on-surface shadow-lg">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary">
          TaskForge AI
        </Link>

        <div className="relative">
          {isAuthenticated ? (
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <span className="text-sm hidden sm:block">{username}</span> {/* <-- DYNAMIC USERNAME */}
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-on-primary font-bold">
                {username ? username.charAt(0).toUpperCase() : 'U'}
              </div>
            </button>
          ) : (
            <Link href="/login" className="text-primary hover:underline">
              Log In
            </Link>
          )}

          {isAuthenticated && isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg py-1 z-50">
              <Link href="/my-plan" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">
                My AI Plan
              </Link>
              <Link href="/schedule" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">
                Schedule & Deadlines
              </Link>
              <Link href="/analytics" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">
                Productivity Analytics
              </Link>
              <hr className="border-gray-700 my-1" />
              <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}