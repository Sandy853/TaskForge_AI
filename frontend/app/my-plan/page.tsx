// TaskForge_AI/frontend/app/my-plan/page.tsx

'use client';

import { Metadata } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AIPlanDisplay from '@/components/AIPlanDisplay';
import { authFetch } from '@/app/api';

// Define the data models to ensure type safety
interface Task {
  description: string;
  category: 'Health' | 'Study' | 'Work' | 'Personal' | 'Emotional';
  is_completed: boolean;
}

interface AIPlan {
  daily_schedule: Task[];
  summary: string;
}

// We'll move the metadata to a parent layout or a shared file
// for client components if we need to set it dynamically.
// For now, let's remove it from this file to avoid conflicts.

export default function MyAIPlanPage() {
  const [plan, setPlan] = useState<AIPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      const res = await authFetch('http://localhost:8000/tasks/load');

      if (!res || res.status === 401) {
        router.push('/login');
        return;
      }
      
      if (res.status === 204) {
        setPlan(null);
        setLoading(false);
        return;
      }

      const data: AIPlan = await res.json();
      setPlan(data);
      setLoading(false);
    };

    fetchPlan();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <p className="text-lg text-gray-400">Loading your plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">You have no plan yet!</h1>
        <p className="text-gray-400">Go to the dashboard to create your first plan.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <AIPlanDisplay plan={plan} />
    </div>
  );
}