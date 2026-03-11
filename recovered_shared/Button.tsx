import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex w-full sm:w-auto items-center justify-center font-medium transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, { className: string; style?: React.CSSProperties }> = {
    primary: {
      className: 'text-white shadow-sm hover:shadow-md hover:brightness-110',
      style: { background: 'var(--brand-gradient)' },
    },
    secondary: {
      className: 'hover:opacity-80 btn-secondary-theme',
    },
    outline: {
      className: 'hover:opacity-80 btn-outline-theme',
    },
    ghost: {
      className: 'hover:opacity-80 btn-ghost-theme',
    },
    danger: {
      className: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    },
    gradient: {
      className: 'text-white shadow-sm hover:shadow-md hover:brightness-110',
      style: { background: 'var(--brand-gradient)' },
    },
  };

  const sizes = {
    sm: 'h-8 px-3 text-[12px]',
    md: 'h-10 px-4 text-[14px]',
    lg: 'h-12 px-6 text-[14px]',
  };

  const variantConfig = variants[variant];

  return (
    <button
      className={`${baseStyles} ${variantConfig.className} ${sizes[size]} ${className}`}
      style={{ ...variantConfig.style, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
