import React from 'react';

interface PlanBadgeProps {
  plan: string;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ plan }) => {
  if (plan === 'pro') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary-500 to-purple-500 text-white">
        PRO
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
      Free
    </span>
  );
};
