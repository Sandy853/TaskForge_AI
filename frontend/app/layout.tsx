// TaskForge_AI/frontend/app/layout.tsx

import './globals.css';
import type { Metadata } from 'next';
import { Inter, Lato } from 'next/font/google';
import Header from '@/components/Header'; // Import the new Header component

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'], // Added '700' for bold font
  variable: '--font-lato',
});

export const metadata: Metadata = {
  title: 'TaskForge_AI',
  description: 'Your personal AI-powered task planner and scheduler.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lato.variable}`}>
      <body className="bg-background font-lato text-on-background">
        <Header /> {/* Add the Header component here */}
        <main className="pt-20"> {/* Add padding to prevent content from hiding under the fixed header */}
          {children}
        </main>
      </body>
    </html>
  );
}