import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common';
import { useAuth } from '../../hooks/useAuth';

export const Hero: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 gradient-mesh -z-10" />

      {/* Floating Orbs for Extra Visual Interest */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float-delayed" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Lightning-fast URL shortening ⚡
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up animation-delay-100">
          <span className="gradient-text">Shorten URLs.</span>
          <br />
          <span className="text-neutral-900 dark:text-neutral-100">
            Track Everything.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
          Create short, memorable links with powerful analytics.
          Perfect for marketing campaigns, social media, and link management.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up animation-delay-300">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="xl" variant="primary">
                Go to Dashboard →
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button size="xl" variant="primary">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="xl" variant="ghost">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
              1M+
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              URLs Shortened
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
              100K+
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Active Users
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
              99.9%
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Uptime
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-neutral-400 dark:border-neutral-600 flex items-start justify-center p-2">
          <div className="w-1 h-3 rounded-full bg-neutral-400 dark:bg-neutral-600 animate-scroll-indicator" />
        </div>
      </div>
    </section>
  );
};
