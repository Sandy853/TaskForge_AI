// TaskForge_AI/frontend/app/page.tsx

import { Metadata } from 'next';
import TaskInputTabs from '@/components/TaskInputTabs';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard | TaskForge AI',
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-8">
      <div className="w-full text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-xl text-gray-400">What do you want to achieve today?</p>
      </div>
      <TaskInputTabs />
    </div>
  );
}