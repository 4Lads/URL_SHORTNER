import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-md hover:shadow-lg hover:shadow-primary-500/30 disabled:bg-primary-300 disabled:hover:shadow-none',
  secondary:
    'bg-secondary-600 hover:bg-secondary-700 active:bg-secondary-800 text-white shadow-md hover:shadow-lg hover:shadow-secondary-500/30 disabled:bg-secondary-300 disabled:hover:shadow-none',
  ghost:
    'bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-neutral-700 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:text-neutral-200 disabled:bg-transparent disabled:text-neutral-400',
  danger:
    'bg-error hover:bg-error-dark active:bg-red-700 text-white shadow-md hover:shadow-lg hover:shadow-error/30 disabled:bg-error-light disabled:hover:shadow-none',
  outline:
    'bg-transparent hover:bg-neutral-50 active:bg-neutral-100 text-primary-600 border-2 border-primary-600 hover:border-primary-700 active:border-primary-800 dark:hover:bg-neutral-900 dark:active:bg-neutral-800 disabled:border-neutral-300 disabled:text-neutral-400',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs rounded-md',
  sm: 'px-3 py-2 text-sm rounded-md',
  md: 'px-4 py-2.5 text-base rounded-lg',
  lg: 'px-5 py-3 text-lg rounded-lg',
  xl: 'px-6 py-3.5 text-xl rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60';

    const widthStyles = fullWidth ? 'w-full' : '';

    const computedClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${widthStyles}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <button
        ref={ref}
        className={computedClassName}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
        )}

        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2 flex items-center">{icon}</span>
        )}

        <span>{children}</span>

        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2 flex items-center">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
