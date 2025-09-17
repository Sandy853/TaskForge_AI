// TaskForge_AI/frontend/app/login/page.tsx

import { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Log In | TaskForge AI',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <AuthForm type="login" />
    </div>
  );
}