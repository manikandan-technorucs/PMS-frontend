import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
  const baseStyles = 'inline-flex w-full sm:w-auto items-center justify-center font-medium transition-colors rounded-[6px] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, { className: string; themeClass?: string }> = {
    primary: {
      className: 'bg-[#14b8a6] text-white hover:bg-[#0d9488]',
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
      className: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
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
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
