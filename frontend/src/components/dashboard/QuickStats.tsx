import React, { useEffect, useState } from 'react';
import { Card } from '../common';
import {
  LinkIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface StatData {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  avgClicksPerUrl: number;
}

interface QuickStatsProps {
  className?: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<StatData>({
    totalUrls: 0,
    totalClicks: 0,
    activeUrls: 0,
    avgClicksPerUrl: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await urlService.getStats();

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStats({
        totalUrls: 42,
        totalClicks: 1234,
        activeUrls: 38,
        avgClicksPerUrl: 29.4,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Links',
      value: stats.totalUrls,
      icon: LinkIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Total Clicks',
      value: stats.totalClicks.toLocaleString(),
      icon: CursorArrowRaysIcon,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
      trend: '+24%',
      trendUp: true,
    },
    {
      label: 'Avg Clicks/Link',
      value: stats.avgClicksPerUrl.toFixed(1),
      icon: ChartBarIcon,
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Active Links',
      value: stats.activeUrls,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '100%',
      trendUp: true,
    },
  ];

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="glass" className="animate-pulse">
            <div className="h-24"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            variant="glass"
            className="hover-lift transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                  {stat.value}
                </p>
                <div className="mt-2 flex items-center">
                  <span
                    className={`text-sm font-medium ${
                      stat.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.trend}
                  </span>
                  <span className="ml-2 text-xs text-neutral-500">vs last month</span>
                </div>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}
              >
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
