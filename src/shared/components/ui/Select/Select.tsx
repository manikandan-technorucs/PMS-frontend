import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-[14px] font-medium form-label-theme">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`h-10 px-3 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed form-control-theme ${error ? 'border-[#DC2626] focus:ring-[#DC2626]' : ''} ${className}`}
          {...props}
        >
          {options
            ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
            : children}
        </select>
        {error && (
          <span className="text-[12px] text-[#DC2626]">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
