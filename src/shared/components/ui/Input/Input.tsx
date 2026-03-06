import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-[14px] font-medium form-label-theme">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`h-10 px-3 rounded-[6px] text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed form-control-theme ${error ? 'border-[#DC2626] focus:ring-[#DC2626]' : ''} ${className}`}
          {...props}
        />
        {error && (
          <span className="text-[12px] text-[#DC2626]">{error}</span>
        )}
        {helperText && !error && (
          <span className="text-[12px] form-helper-theme">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
