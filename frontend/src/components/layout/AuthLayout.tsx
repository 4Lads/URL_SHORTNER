import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';

export const AuthLayout: React.FC = () => {
  const { theme, toggleTheme } = useUiStore();

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <span className="text-xl">🌙</span>
            ) : (
              <span className="text-xl">☀️</span>
            )}
          </button>
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-2xl">
            S
          </div>
          <span className="text-2xl font-bold gradient-text">Shortify</span>
        </Link>

        {/* Content (Login/Register Form) */}
        <div className="w-full max-w-md">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-neutral-600 dark:text-neutral-400">
          By continuing, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {/* Right Side - Brand Visual */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-neutral-900">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 gradient-mesh-dark opacity-50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-20 text-white">
          <h2 className="text-5xl font-bold mb-6">
            Shorten URLs.
            <br />
            <span className="gradient-text">Track Everything.</span>
          </h2>

          <p className="text-xl text-neutral-300 mb-12 max-w-md">
            Professional URL shortening with powerful analytics, custom aliases, and QR code generation.
          </p>

          {/* Features */}
          <div className="space-y-6">
            {[
              { icon: '⚡', title: 'Lightning Fast', desc: 'Sub-100ms redirects worldwide' },
              { icon: '📊', title: 'Advanced Analytics', desc: 'Track clicks, devices, and locations' },
              { icon: '🎨', title: 'Custom Branding', desc: 'Use your own domain and aliases' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl glass-dark flex items-center justify-center text-2xl flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-neutral-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
};
