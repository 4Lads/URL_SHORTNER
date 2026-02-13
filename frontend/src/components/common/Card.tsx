import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'glass' | 'bordered';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-neutral-800 shadow-soft',
  elevated: 'bg-white dark:bg-neutral-800 shadow-lg hover:shadow-xl',
  glass: 'glass dark:glass-dark',
  bordered: 'bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const hoverStyles = 'transition-all duration-200 hover:scale-[1.02] cursor-pointer';

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = false,
  padding = 'md',
  children,
  header,
  footer,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-xl overflow-hidden';

  const computedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${hover ? hoverStyles : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={computedClassName} {...props}>
      {header && (
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          {header}
        </div>
      )}

      <div className={paddingStyles[padding]}>
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.displayName = 'Card';
