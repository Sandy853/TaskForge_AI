// TaskForge_AI/frontend/app/signup/page.tsx

import { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Sign Up | TaskForge AI',
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <AuthForm type="signup" />
    </div>
  );
}