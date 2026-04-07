import React from 'react';
import { Button as PrimeButton } from 'primereact/button';
import type { ButtonProps as PrimeButtonProps } from 'primereact/button';

const SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { height: '32px', padding: '0 12px', fontSize: '12px', borderRadius: 'var(--radius-sm, 6px)', gap: '6px' },
  md: { height: '40px', padding: '0 16px', fontSize: '13px', borderRadius: 'var(--radius-sm, 6px)', gap: '8px' },
  lg: { height: '44px', padding: '0 20px', fontSize: '14px', borderRadius: 'var(--radius-sm, 6px)', gap: '8px' },
};

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PrimeButtonProps, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  unstyled?: boolean;
}


export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', unstyled, style, ...props }, ref) => {

    if (unstyled) {
      return (
        <PrimeButton
          ref={ref as any}
          className={className}
          style={style}
          unstyled
          {...props}
        />
      );
    }

    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      border: 'none',
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      opacity: props.disabled ? 0.6 : 1,
      ...SIZE_STYLES[size],
      ...style,
    };

    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--primary)',
        color: '#ffffff',
        boxShadow: '0 2px 4px rgba(20, 184, 166, 0.2)',
      },
      secondary: {
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
      },
      danger: {
        backgroundColor: 'var(--error)',
        color: '#ffffff',
        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
      }
    };


    const classMapping: Record<ButtonVariant, string> = {
      primary: 'btn-brand-primary text-[#FFFFFF] shadow-sm hover:opacity-90 active:scale-[0.98]',
      secondary: 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 shadow-sm transition-colors',
      ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors',
      danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors'
    };

    return (
      <PrimeButton
        ref={ref as any}
        pt={{
          root: {
            className: [
              'inline-flex items-center justify-center transition-all duration-200 outline-none',
              'focus-visible:ring-2 focus-visible:ring-[var(--primary-ring)]',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]',
              classMapping[variant],
              className,
            ].filter(Boolean).join(' '),
            style: { ...SIZE_STYLES[size], ...style }
          },
          label: {
            className: 'font-semibold leading-none',
          },
          icon: {
            className: 'text-[inherit] leading-none',
          },
          loadingIcon: {
            className: 'animate-spin text-[inherit]',
          },
        }}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
