// TaskForge_AI/frontend/app/schedule/page.tsx
'use client';

import { Metadata } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/app/api';

// export const metadata: Metadata = {
//   title: 'Schedule & Deadlines | TaskForge AI',
// };

// Define the data models to ensure type safety
interface Task {
  description: string;
  category: 'Health' | 'Study' | 'Work' | 'Personal' | 'Emotional';
  is_completed: boolean;
  deadline?: string | null;
}

interface AIPlan {
  daily_schedule: Task[];
  summary: string;
  date: string;
}

export default function SchedulePage() {
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
          <p className="text-lg text-gray-400">Loading schedule...</p>
        </div>
      );
    }
  
    if (!plan || plan.daily_schedule.length === 0) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">No tasks with deadlines yet!</h1>
          <p className="text-gray-400">Add a new task with a deadline from the dashboard.</p>
        </div>
      );
    }
  
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Schedule & Deadlines</h1>
        <div className="bg-surface rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">Your Scheduled Tasks</h2>
          <div className="space-y-4">
            {plan.daily_schedule.map((task, index) => (
              <div key={index} className="bg-background rounded-md p-4 flex justify-between items-center">
                <div>
                  <p className={`text-base font-medium ${task.is_completed ? 'line-through text-gray-500' : ''}`}>{task.description}</p>
                  <div className="text-xs text-gray-400 mt-1">
                    <span>Category: {task.category}</span>
                    {task.deadline && (
                      <span className="ml-4 font-bold text-red-400">
                        Deadline: {task.deadline}
                      </span>
                    )}
                  </div>
                </div>
                {task.is_completed && <span className="text-sm text-green-500">Completed!</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }