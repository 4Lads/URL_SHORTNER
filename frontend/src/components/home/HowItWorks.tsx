import React from 'react';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: JSX.Element;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Paste Your URL',
    description: 'Simply paste any long URL into our shortener. Add a custom alias to make it memorable.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Get Short Link',
    description: 'Instantly receive a shortened URL. Copy it with one click and share anywhere you want.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Track Performance',
    description: 'Monitor clicks, analyze traffic sources, and gain insights with real-time analytics dashboard.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 rounded-full bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 text-sm font-medium mb-4">
            How It Works
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Shorten links in
            <span className="gradient-text"> three simple steps</span>
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Get started in seconds. No credit card required.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connection Lines (Desktop Only) */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-300 via-secondary-300 to-accent-300 dark:from-primary-700 dark:via-secondary-700 dark:to-accent-700" />

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Step Number Badge */}
              <div className="relative mb-6">
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full blur-xl opacity-30 animate-pulse-soft" />

                {/* Main Circle */}
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-xl">
                  {step.icon}
                </div>

                {/* Step Number (Top Right) */}
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 flex items-center justify-center text-sm font-bold shadow-lg">
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                {step.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xs">
                {step.description}
              </p>

              {/* Arrow (Not on Last Step, Desktop Only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute -right-6 top-10 text-neutral-300 dark:text-neutral-700">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
            Join thousands of users managing their links smarter
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300"
            >
              View Features
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
