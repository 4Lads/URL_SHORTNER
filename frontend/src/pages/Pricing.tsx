import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/common';
import { Header } from '../components/layout/Header';
import { useAuth } from '../hooks/useAuth';
import { useBillingStore } from '../store/billingStore';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { plans, fetchPlans, createCheckoutSession, isLoading } = useBillingStore();
  const [currency, setCurrency] = useState<'usd' | 'inr'>('usd');

  useEffect(() => {
    fetchPlans();
    // Detect locale for default currency
    try {
      const locale = navigator.language || '';
      if (locale.includes('IN') || locale.includes('in')) {
        setCurrency('inr');
      }
    } catch { /* ignore */ }
  }, [fetchPlans]);

  const freePlan = plans.find((p) => p.name === 'free');
  const proPlan = plans.find((p) => p.name === 'pro');

  const formatPrice = (cents: number, curr: 'usd' | 'inr') => {
    if (cents === 0) return 'Free';
    const amount = cents / 100;
    if (curr === 'usd') return `$${amount}`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      navigate('/register?plan=pro');
      return;
    }
    await createCheckoutSession(currency);
  };

  const features = [
    { name: 'Links per month', free: freePlan?.maxLinksPerMonth ?? 25, pro: proPlan?.maxLinksPerMonth ?? 1000 },
    { name: 'Analytics retention', free: `${freePlan?.analyticsRetentionDays ?? 7} days`, pro: `${proPlan?.analyticsRetentionDays ?? 90} days` },
    { name: 'CSV export', free: false, pro: true },
    { name: 'Custom QR codes', free: false, pro: true },
    { name: 'Password-protected links', free: false, pro: true },
    { name: 'API rate limit', free: `${freePlan?.apiRateLimit ?? 10}/hr`, pro: `${proPlan?.apiRateLimit ?? 100}/hr` },
  ];

  const userPlan = (user as any)?.plan || 'free';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Start for free, upgrade when you need more power. No hidden fees.
          </p>

          {/* Currency Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setCurrency('usd')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currency === 'usd'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('inr')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currency === 'inr'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
              }`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Plan */}
          <Card variant="glass" className="p-8 border border-neutral-200 dark:border-neutral-700">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Free</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Perfect for getting started
              </p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-neutral-900 dark:text-white">Free</span>
              <span className="text-neutral-500 dark:text-neutral-400 ml-2">forever</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                {freePlan?.maxLinksPerMonth ?? 25} links per month
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                {freePlan?.analyticsRetentionDays ?? 7}-day analytics
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                Basic QR codes
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-500">
                <XMarkIcon className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                CSV export
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-500">
                <XMarkIcon className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                Password-protected links
              </li>
            </ul>
            {isAuthenticated && userPlan === 'free' ? (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            ) : !isAuthenticated ? (
              <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Downgrade via Billing
              </Button>
            )}
          </Card>

          {/* Pro Plan */}
          <div className="relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <span className="px-4 py-1 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-purple-500 rounded-full shadow-lg">
                MOST POPULAR
              </span>
            </div>
            <Card variant="glass" className="p-8 border-2 border-primary-500 dark:border-primary-400 relative">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Pro</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  For power users and businesses
                </p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                  {formatPrice(
                    currency === 'usd'
                      ? (proPlan?.priceUsdCents ?? 1900)
                      : (proPlan?.priceInrCents ?? 149900),
                    currency
                  )}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                  <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  {proPlan?.maxLinksPerMonth ?? 1000} links per month
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                  <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  {proPlan?.analyticsRetentionDays ?? 90}-day analytics
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                  <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Custom QR codes
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                  <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  CSV export
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                  <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Password-protected links
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                  <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  Priority support
                </li>
              </ul>
              {isAuthenticated && userPlan === 'pro' ? (
                <Button variant="primary" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleUpgrade}
                  loading={isLoading}
                >
                  Upgrade to Pro
                </Button>
              )}
            </Card>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white text-center mb-8">
            Feature Comparison
          </h2>
          <Card variant="glass" className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                    Feature
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                    Free
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-primary-600 dark:text-primary-400">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={index}
                    className="border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                  >
                    <td className="py-4 px-6 text-sm text-neutral-700 dark:text-neutral-300">
                      {feature.name}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-neutral-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {feature.free}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.pro === 'boolean' ? (
                        feature.pro ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-neutral-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {feature.pro}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
};
