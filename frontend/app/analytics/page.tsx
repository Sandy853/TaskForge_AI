// TaskForge_AI/frontend/app/analytics/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from 'recharts';
import { authFetch } from '@/app/api';

// Pie Chart colors for each category
const COLORS = ['#BB86FC', '#03DAC6', '#FF6B6B', '#1E88E5', '#9C27B0'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const res = await authFetch('http://localhost:8000/analytics');

      if (!res || res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      const processedData = Object.keys(data.data).map((key) => ({
        name: key,
        value: data.data[key],
      }));

      setAnalyticsData(processedData);
      setLoading(false);
    };

    fetchAnalytics();
  }, [router]);

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  if (!analyticsData || analyticsData.length === 0) {
    return <div className="p-8 text-center">No completed tasks to analyze yet!</div>;
  }

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-primary">Productivity Analytics</h1>
      <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-2xl text-center">
        <h2 className="text-xl font-semibold mb-4 text-on-surface">Completed Tasks by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analyticsData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {analyticsData.map((_entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}