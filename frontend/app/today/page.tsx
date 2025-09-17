// TaskForge_AI/frontend/app/today/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/app/api';

interface Task {
  description: string;
  category: 'Health' | 'Study' | 'Work' | 'Personal' | 'Emotional';
  is_completed: boolean;
  deadline?: string | null;
}

const categoryColors = {
  Health: 'bg-green-500',
  Study: 'bg-blue-500',
  Work: 'bg-orange-500',
  Personal: 'bg-purple-500',
  Emotional: 'bg-pink-500',
};

export default function TodaysTasksPage() {
  const [todaysTasks, setTodaysTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTodaysTasks = async () => {
      setLoading(true);
      const res = await authFetch('http://localhost:8000/tasks/today');

      if (!res || res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        const data: Task[] = await res.json();
        setTodaysTasks(data);
      }

      setLoading(false);
    };

    fetchTodaysTasks();
  }, [router]);

  if (loading) {
    return <div className="p-8 text-center">Loading today's tasks...</div>;
  }

  if (!todaysTasks || todaysTasks.length === 0) {
    return <div className="p-8 text-center">You have no tasks with a deadline for today.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Today's Deadlines</h1>
      <div className="bg-surface rounded-lg shadow-xl p-6">
        <div className="space-y-4">
          {todaysTasks.map((task, index) => (
            <div key={index} className="bg-background rounded-md p-4 flex justify-between items-center">
              <div>
                <p className={`text-base font-medium ${task.is_completed ? 'line-through text-gray-500' : ''}`}>{task.description}</p>
                <div className="text-xs text-gray-400 mt-1">
                  <span className={`w-3 h-3 rounded-full mr-2 ${categoryColors[task.category]}`} />
                  <span>{task.category}</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={task.is_completed}
                onChange={() => { /* This page is read-only for now */ }}
                className="form-checkbox h-5 w-5 text-primary rounded border-primary bg-background checked:bg-primary checked:border-transparent focus:ring-primary focus:ring-2"
                disabled
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}