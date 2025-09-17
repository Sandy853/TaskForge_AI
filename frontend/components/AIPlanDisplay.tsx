// TaskForge_AI/frontend/components/AIPlanDisplay.tsx

'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/app/api';

interface Task {
  description: string;
  category: 'Health' | 'Study' | 'Work' | 'Personal' | 'Emotional';
  is_completed: boolean;
  deadline?: string | null;
}

interface AIPlan {
  daily_schedule: Task[];
  summary: string;
}

interface AIPlanDisplayProps {
  plan: AIPlan;
}

const categoryColors = {
  Health: 'bg-green-500',
  Study: 'bg-blue-500',
  Work: 'bg-orange-500',
  Personal: 'bg-purple-500',
  Emotional: 'bg-pink-500',
};

const AIPlanDisplay: FC<AIPlanDisplayProps> = ({ plan }) => {
  const [currentPlan, setCurrentPlan] = useState<AIPlan>(plan);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newDeadline, setNewDeadline] = useState<string>('');
  const router = useRouter();

  const handleTaskToggle = async (index: number) => {
    // Optimistically update the UI first for a better user experience
    const updatedSchedule = [...currentPlan.daily_schedule];
    updatedSchedule[index].is_completed = !updatedSchedule[index].is_completed;
    const newPlanState = { ...currentPlan, daily_schedule: updatedSchedule };
    setCurrentPlan(newPlanState);

    try {
      const response = await authFetch('http://localhost:8000/tasks/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlanState),
      });

      if (!response) {
        return; // authFetch handled the redirect
      }

      if (!response.ok) {
        setCurrentPlan(currentPlan);
        alert('Failed to save task. Please try again.');
        console.error('Failed to save task:', response.statusText);
      }
    } catch (error) {
      setCurrentPlan(currentPlan);
      alert('Failed to save task. Please check the backend server.');
      console.error("Error saving task:", error);
    }
  };

  const handleSaveDeadline = async (index: number) => {
    const updatedSchedule = [...currentPlan.daily_schedule];
    updatedSchedule[index].deadline = newDeadline || null;
    const newPlanState = { ...currentPlan, daily_schedule: updatedSchedule };

    setCurrentPlan(newPlanState);
    setEditingIndex(null);
    setNewDeadline('');

    try {
      const response = await authFetch('http://localhost:8000/tasks/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlanState),
      });

      if (!response) {
        return;
      }

      if (!response.ok) {
        alert('Failed to save deadline. Please try again.');
        console.error('Failed to save deadline:', response.statusText);
      }
    } catch (error) {
      alert('Failed to save deadline. Please check the backend server.');
      console.error("Error saving deadline:", error);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-surface rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-primary">Your Daily Plan</h2>
      <p className="text-gray-300 mb-6 italic">&quot;{currentPlan.summary}&quot;</p>
      <div className="space-y-4">
        {currentPlan.daily_schedule.map((task, index) => (
          <div key={index} className="bg-background rounded-md p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start space-x-4">
                <div className={`w-3 h-3 rounded-full mt-1 ${categoryColors[task.category]}`} />
                <div>
                  <p className={`text-base ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
                    {task.description}
                  </p>
                  <span className="text-xs text-gray-400">{task.category}</span>
                  {task.deadline && (
                    <span className="text-xs text-red-400 ml-2">
                      Deadline: {task.deadline}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {editingIndex === index ? (
                <>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="bg-gray-700 text-gray-200 border border-gray-600 rounded-md p-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button onClick={() => handleSaveDeadline(index)} className="text-primary text-sm font-bold">
                    Save
                  </button>
                  <button onClick={() => { setEditingIndex(null); setNewDeadline(''); }} className="text-gray-500 text-sm">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditingIndex(index); setNewDeadline(task.deadline || ''); }} className="text-gray-400 hover:text-primary transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-3.832 3.832l-9.117 9.117a1 1 0 00-.293.707v3h3a1 0 00.707-.293l9.117-9.117-2.828-2.828z" />
                    </svg>
                  </button>
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => handleTaskToggle(index)}
                    className="form-checkbox h-5 w-5 text-primary rounded border-primary bg-background checked:bg-primary checked:border-transparent focus:ring-primary focus:ring-2"
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIPlanDisplay;