import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[14px] font-medium text-[#1F2937]">
          {label}
        </label>
      )}
      <textarea
        className={`min-h-[100px] p-3 rounded-[6px] border border-[#E5E7EB] bg-white text-[14px] text-[#1F2937]
          placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent
          disabled:bg-[#F8FAF9] disabled:cursor-not-allowed resize-y ${error ? 'border-[#DC2626] focus:ring-[#DC2626]' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[12px] text-[#DC2626]">{error}</span>
      )}
    </div>
  );
}
