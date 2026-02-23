import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[14px] font-medium text-[#1F2937]">
          {label}
        </label>
      )}
      <input
        className={`h-10 px-3 rounded-[6px] border border-[#E5E7EB] bg-white text-[14px] text-[#1F2937] 
          placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent
          disabled:bg-[#F8FAF9] disabled:cursor-not-allowed ${error ? 'border-[#DC2626] focus:ring-[#DC2626]' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[12px] text-[#DC2626]">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-[12px] text-[#6B7280]">{helperText}</span>
      )}
    </div>
  );
}
