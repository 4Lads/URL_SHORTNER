import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';

export const Login: React.FC = () => {
  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Welcome back
      </h2>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        Sign in to your account to continue
      </p>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Sign up for free
        </Link>
      </p>
    </div>
  );
};
