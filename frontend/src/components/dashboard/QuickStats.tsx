import React from 'react';
import { Card } from '../common';
import {
  LinkIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useUrlStore } from '../../store/urlStore';

interface QuickStatsProps {
  className?: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ className = '' }) => {
  const { urls, isLoading } = useUrlStore();

  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + (url.clickCount || 0), 0);
  const activeUrls = urls.filter((url) => url.isActive).length;
  const avgClicksPerUrl = totalUrls > 0 ? totalClicks / totalUrls : 0;

  const statCards = [
    {
      label: 'Total Links',
      value: totalUrls,
      icon: LinkIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Total Clicks',
      value: totalClicks.toLocaleString(),
      icon: CursorArrowRaysIcon,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      label: 'Avg Clicks/Link',
      value: avgClicksPerUrl.toFixed(1),
      icon: ChartBarIcon,
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
    },
    {
      label: 'Active Links',
      value: activeUrls,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
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
