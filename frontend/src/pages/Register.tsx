import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';

export const Register: React.FC = () => {
  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Create your account
      </h2>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        Start shortening URLs in seconds
      </p>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
