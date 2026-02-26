import React from 'react';

interface UsageMeterProps {
  used: number;
  limit: number;
  label: string;
}

export const UsageMeter: React.FC<UsageMeterProps> = ({ used, limit, label }) => {
  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
        <span className={`font-medium ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-neutral-900 dark:text-white'}`}>
          {used} / {limit}
        </span>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
