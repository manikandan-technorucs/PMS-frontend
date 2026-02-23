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
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-[6px] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#059669] text-white hover:bg-[#047857]',
    secondary: 'bg-[#F8FAFA] text-[#1F2937] hover:bg-[#E5E7EB]',
    outline: 'border border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F8FAFA]',
    ghost: 'text-[#1F2937] hover:bg-[#F8FAFA]',
    danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
  };

  const sizes = {
    sm: 'h-8 px-3 text-[12px]',
    md: 'h-10 px-4 text-[14px]',
    lg: 'h-12 px-6 text-[14px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
