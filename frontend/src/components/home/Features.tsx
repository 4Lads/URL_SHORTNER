import React from 'react';
import { Card } from '../common';

interface Feature {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Sub-100ms redirect times with intelligent caching. Your links load instantly, every time.',
    gradient: 'from-primary-500 to-primary-600',
  },
  {
    icon: '📊',
    title: 'Powerful Analytics',
    description: 'Track clicks, locations, devices, and more. Get insights that help you understand your audience.',
    gradient: 'from-secondary-500 to-secondary-600',
  },
  {
    icon: '🔗',
    title: 'Custom Aliases',
    description: 'Create memorable, branded short links. Make your URLs reflect your brand identity.',
    gradient: 'from-accent-500 to-accent-600',
  },
  {
    icon: '📱',
    title: 'QR Codes',
    description: 'Generate QR codes for every link automatically. Perfect for print materials and offline campaigns.',
    gradient: 'from-primary-600 to-accent-500',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Enterprise-grade security with optional password protection and expiration dates for sensitive links.',
    gradient: 'from-secondary-600 to-primary-500',
  },
  {
    icon: '🌐',
    title: 'Custom Domains',
    description: 'Use your own domain for branded short links. Build trust and recognition with every share.',
    gradient: 'from-accent-600 to-secondary-500',
  },
];

export const Features: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
            Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Everything you need to
            <span className="gradient-text"> manage links</span>
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Professional URL shortening with enterprise-level features.
            Perfect for marketers, developers, and businesses.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card
                variant="default"
                className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-8">
                  {/* Icon with Gradient Background */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 text-3xl transform group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
            Ready to get started?
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            Start for Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};
