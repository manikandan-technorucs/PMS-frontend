import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
}

export function Select({ label, error, options, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[14px] font-medium text-[#1F2937]">
          {label}
        </label>
      )}
      <select
        className={`h-10 px-3 rounded-[6px] border border-[#E5E7EB] bg-white text-[14px] text-[#1F2937]
          focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent
          disabled:bg-[#F8FAF9] disabled:cursor-not-allowed ${error ? 'border-[#DC2626] focus:ring-[#DC2626]' : ''} ${className}`}
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
