// TaskForge_AI/frontend/components/TaskInputTabs.tsx

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AIPlanDisplay from './AIPlanDisplay';
import { authFetch } from '@/app/api';

const tabs = [
  { id: 'text', name: 'Text' },
  { id: 'file', name: 'File' },
  { id: 'voice', name: 'Voice' },
];

interface Task {
  description: string;
  category: 'Health' | 'Study' | 'Work' | 'Personal' | 'Emotional';
  is_completed: boolean;
}

interface AIPlan {
  daily_schedule: Task[];
  summary: string;
}

export default function TaskInputTabs() {
  const [activeTab, setActiveTab] = useState('text');
  const [taskInput, setTaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [plan, setPlan] = useState<AIPlan | null>(null);
  const router = useRouter();

  const handleGeneratePlan = async () => {
    if (!taskInput.trim()) {
      setMessage('Please enter your tasks.');
      return;
    }

    setPlan(null);
    setLoading(true);
    setMessage('Generating plan...');

    try {
      const response = await authFetch('http://localhost:8000/tasks/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: taskInput }),
      });

      if (!response) {
        return; // authFetch handled the redirect
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: AIPlan = await response.json();
      setPlan(data);
      setMessage('');
    } catch (error) {
      console.error("Error submitting tasks:", error);
      setMessage('Error: Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (plan) {
    return <AIPlanDisplay plan={plan} />;
  }

  return (
    <div className="w-full max-w-2xl bg-surface rounded-lg shadow-xl p-6">
      <div className="flex border-b border-primary/20 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`py-2 px-4 text-sm font-medium focus:outline-none transition-colors duration-200 ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'text' && (
          <div className="space-y-4">
            <textarea
              className="w-full h-32 p-4 text-sm bg-background border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none placeholder-gray-500"
              placeholder="Enter your tasks here, e.g., 'Finish React project, Read chapter 5 of book, Go for a run, Schedule dentist appointment...'"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
            ></textarea>
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <span className="text-sm text-gray-400 min-h-[1.5rem]">{message}</span>
              <button
                onClick={handleGeneratePlan}
                disabled={loading}
                className={`font-bold py-2 px-6 rounded-md transition-colors duration-200 ${
                  loading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-on-primary hover:bg-primary/80'
                }`}
              >
                {loading ? 'Processing...' : 'Generate Plan'}
              </button>
            </div>
          </div>
        )}
        {activeTab === 'file' && (
          <div className="h-32 flex items-center justify-center text-gray-400 border border-dashed border-gray-600 rounded-md">
            File upload UI (Coming Soon)
          </div>
        )}
        {activeTab === 'voice' && (
          <div className="h-32 flex items-center justify-center text-gray-400 border border-dashed border-gray-600 rounded-md">
            Voice transcription UI (Coming Soon)
          </div>
        )}
      </div>
    </div>
  );
}