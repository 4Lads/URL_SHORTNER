import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/common';
import { PlanBadge, UsageMeter } from '../components/billing';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useBillingStore } from '../store/billingStore';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  LockClosedIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';

type TabType = 'profile' | 'security' | 'billing' | 'preferences';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useUiStore();
  const {
    currentPlan,
    subscription,
    usage,
    isLoading: billingLoading,
    fetchBillingStatus,
    createCheckoutSession,
    openCustomerPortal,
  } = useBillingStore();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [checkoutCurrency, setCheckoutCurrency] = useState<'usd' | 'inr'>('usd');

  const userPlan = user?.plan || 'free';

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchBillingStatus();
    }
  }, [activeTab, fetchBillingStatus]);

  // Detect locale for default currency
  useEffect(() => {
    try {
      const locale = navigator.language || '';
      if (locale.includes('IN') || locale.includes('in')) {
        setCheckoutCurrency('inr');
      }
    } catch { /* ignore */ }
  }, []);

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: UserCircleIcon },
    { id: 'security' as TabType, label: 'Security', icon: LockClosedIcon },
    { id: 'billing' as TabType, label: 'Billing', icon: CreditCardIcon },
    { id: 'preferences' as TabType, label: 'Preferences', icon: Cog6ToothIcon },
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      toast.error('Password must contain uppercase, lowercase, and number');
      return;
    }

    setIsChangingPassword(true);

    try {
      // TODO: Implement password change endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <nav className="flex gap-8" aria-label="Settings tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    isActive
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pb-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {user?.email || 'User'}
                    </h3>
                    <PlanBadge plan={userPlan} />
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Account created on {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Account Information
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Email Address
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-900 dark:text-white font-mono">
                    {user?.email || 'Not available'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    User ID
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-900 dark:text-white font-mono">
                    {user?.id || 'Not available'}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Change Password
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <Input
                  type="password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
                <Input
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  helperText="At least 8 characters with uppercase, lowercase, and number"
                  required
                />
                <Input
                  type="password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  loading={isChangingPassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                </Button>
              </form>
            </Card>

            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Security Recommendations
              </h3>
              <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  <span>Use a strong, unique password</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  <span>Change your password regularly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  <span>Never share your password with anyone</span>
                </li>
              </ul>
            </Card>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Current Plan
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlanBadge plan={userPlan} />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white capitalize">
                      {userPlan} Plan
                    </p>
                    {subscription && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {subscription.cancelAtPeriodEnd
                          ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                          : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                </div>
                {userPlan === 'pro' ? (
                  <Button
                    variant="outline"
                    onClick={() => openCustomerPortal()}
                    loading={billingLoading}
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      value={checkoutCurrency}
                      onChange={(e) => setCheckoutCurrency(e.target.value as 'usd' | 'inr')}
                      className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
                    >
                      <option value="usd">USD ($19/mo)</option>
                      <option value="inr">INR (Rs.1,499/mo)</option>
                    </select>
                    <Button
                      variant="primary"
                      onClick={() => createCheckoutSession(checkoutCurrency)}
                      loading={billingLoading}
                    >
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Usage */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Usage This Month
              </h3>
              {usage ? (
                <div className="space-y-4 max-w-md">
                  <UsageMeter
                    used={usage.linksCreated}
                    limit={usage.linksLimit}
                    label="Links created"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Period: {new Date(usage.periodStart).toLocaleDateString()} - {new Date(usage.periodEnd).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Loading usage data...
                </p>
              )}
            </Card>

            {/* Plan Features */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Plan Features
              </h3>
              <div className="space-y-3">
                {currentPlan && (
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Links per month</dt>
                      <dd className="font-medium text-neutral-900 dark:text-white">{currentPlan.maxLinksPerMonth}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Analytics retention</dt>
                      <dd className="font-medium text-neutral-900 dark:text-white">{currentPlan.analyticsRetentionDays} days</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">CSV export</dt>
                      <dd className="font-medium text-neutral-900 dark:text-white">{currentPlan.csvExport ? 'Yes' : 'No'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">Custom QR codes</dt>
                      <dd className="font-medium text-neutral-900 dark:text-white">{currentPlan.customQrCodes ? 'Yes' : 'No'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600 dark:text-neutral-400">API rate limit</dt>
                      <dd className="font-medium text-neutral-900 dark:text-white">{currentPlan.apiRateLimit}/hr</dd>
                    </div>
                  </dl>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Appearance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Theme</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Choose your preferred color theme
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="relative inline-flex h-12 w-24 items-center rounded-full bg-neutral-200 dark:bg-neutral-700 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-600"
                  >
                    <span
                      className={`inline-flex h-10 w-10 transform items-center justify-center rounded-full bg-white dark:bg-neutral-900 shadow-lg transition-transform ${
                        theme === 'dark' ? 'translate-x-12' : 'translate-x-1'
                      }`}
                    >
                      {theme === 'dark' ? (
                        <MoonIcon className="h-5 w-5 text-primary-500" />
                      ) : (
                        <SunIcon className="h-5 w-5 text-amber-500" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Default Settings
              </h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Default URL Expiration
                  </label>
                  <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="never">Never expire</option>
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                    <option value="90d">90 days</option>
                    <option value="1y">1 year</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
