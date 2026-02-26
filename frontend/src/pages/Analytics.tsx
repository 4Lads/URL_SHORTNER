import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsService, AnalyticsData } from '../services/analytics.service';
import { LoadingSpinner, Card, Button } from '../components/common';
import { ClicksChart } from '../components/analytics/ClicksChart';
import { DeviceChart } from '../components/analytics/DeviceChart';
import { BrowserChart } from '../components/analytics/BrowserChart';
import { useAuth } from '../hooks/useAuth';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CursorArrowRaysIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

type TimeRange = '7d' | '30d' | '90d' | 'all';

export const Analytics = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userPlan = user?.plan || 'free';
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!id) {
      // Redirect to dashboard if no URL ID provided
      navigate('/dashboard');
      return;
    }
    fetchAnalytics();
  }, [id, timeRange, navigate]);

  const fetchAnalytics = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const response = await analyticsService.getAnalytics(id, { range: timeRange });
      setAnalytics(response.data);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!id) return;

    setIsExporting(true);
    try {
      const blob = await analyticsService.exportAnalytics(id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${analytics?.shortCode || id}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Analytics exported successfully');
    } catch (error: any) {
      console.error('Failed to export analytics:', error);
      const errorCode = error.response?.data?.error?.code;
      if (errorCode === 'FEATURE_LOCKED') {
        toast.error('CSV export is a Pro feature. Upgrade to unlock!', { duration: 5000 });
        navigate('/pricing');
        return;
      }
      toast.error('Failed to export analytics');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">No analytics data available</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const timeRanges: { value: TimeRange; label: string; proOnly?: boolean }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days', proOnly: true },
    { value: 'all', label: 'All time', proOnly: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              /{analytics.shortCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-1">
            {timeRanges.map((range) => {
              const isLocked = range.proOnly && userPlan === 'free';
              return (
                <button
                  key={range.value}
                  onClick={() => {
                    if (isLocked) {
                      toast.error('Upgrade to Pro for extended analytics', { duration: 3000 });
                      return;
                    }
                    setTimeRange(range.value);
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    timeRange === range.value
                      ? 'bg-primary-500 text-white'
                      : isLocked
                        ? 'text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {range.label}
                  {isLocked && <LockClosedIcon className="w-3 h-3" />}
                </button>
              );
            })}
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
            size="md"
          >
            {userPlan === 'free' ? (
              <LockClosedIcon className="w-4 h-4 mr-2" />
            ) : (
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Summary Stats - Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Clicks */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl opacity-50 group-hover:opacity-100" />
          <Card variant="glass" className="relative p-6 border border-primary-200/50 dark:border-primary-500/30 hover:border-primary-300 dark:hover:border-primary-400 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/30">
                    <CursorArrowRaysIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                    Total Clicks
                  </span>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent mt-2">
                  {analytics.summary.totalClicks.toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  All-time performance
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Unique Visitors */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl opacity-50 group-hover:opacity-100" />
          <Card variant="glass" className="relative p-6 border border-teal-200/50 dark:border-teal-500/30 hover:border-teal-300 dark:hover:border-teal-400 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg shadow-teal-500/30">
                    <UserGroupIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    Unique Visitors
                  </span>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent mt-2">
                  {analytics.summary.uniqueVisitors.toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {((analytics.summary.uniqueVisitors / Math.max(analytics.summary.totalClicks, 1)) * 100).toFixed(0)}% of total clicks
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Avg Clicks/Day */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl blur-xl transition-all duration-300 group-hover:blur-2xl opacity-50 group-hover:opacity-100" />
          <Card variant="glass" className="relative p-6 border border-purple-200/50 dark:border-purple-500/30 hover:border-purple-300 dark:hover:border-purple-400 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Avg. per Day
                  </span>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent mt-2">
                  {analytics.summary.avgClicksPerDay.toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  Daily engagement rate
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Clicks Over Time Chart - Enhanced */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Card variant="glass" className="relative p-6 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-primary-300/50 dark:hover:border-primary-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Clicks Over Time
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Traffic trends for selected period
                </p>
              </div>
            </div>
          </div>
          <ClicksChart data={analytics.clicksOverTime} />
        </Card>
      </div>

      {/* Device & Browser Stats - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Chart */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Card variant="glass" className="relative p-6 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-teal-300/50 dark:hover:border-teal-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Device Breakdown
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Visitor device preferences
                </p>
              </div>
            </div>
            <DeviceChart data={analytics.deviceStats} />
          </Card>
        </div>

        {/* Browser Chart */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Card variant="glass" className="relative p-6 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-orange-300/50 dark:hover:border-orange-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Browser Distribution
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Top browsers used
                </p>
              </div>
            </div>
            <BrowserChart data={analytics.browserStats} />
          </Card>
        </div>
      </div>

      {/* Top Countries Table - Enhanced */}
      {analytics.countryStats.length > 0 && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Card variant="glass" className="relative p-6 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-emerald-300/50 dark:hover:border-emerald-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Geographic Distribution
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Top locations by traffic
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-4 px-4 text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.countryStats.map((stat, index) => {
                    const percentage = ((stat.clicks / analytics.summary.totalClicks) * 100).toFixed(1);
                    return (
                      <tr
                        key={index}
                        className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                              {stat.country}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm font-bold text-neutral-900 dark:text-white">
                            {stat.clicks.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-32 h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 min-w-[3rem] text-right">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
