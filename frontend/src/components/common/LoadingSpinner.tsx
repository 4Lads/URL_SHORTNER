import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'primary' | 'secondary' | 'white' | 'neutral';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const colorStyles: Record<SpinnerColor, string> = {
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  white: 'text-white',
  neutral: 'text-neutral-600 dark:text-neutral-400',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  label,
}) => {
  const computedClassName = `
    ${sizeStyles[size]}
    ${colorStyles[color]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg
        className={`animate-spin ${computedClassName}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="status"
        aria-label={label || 'Loading'}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>

      {label && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {label}
        </p>
      )}
    </div>
  );
};

LoadingSpinner.displayName = 'LoadingSpinner';


// Full-page loading component
export interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
      <LoadingSpinner size="lg" label={message} />
    </div>
  );
};

LoadingOverlay.displayName = 'LoadingOverlay';
