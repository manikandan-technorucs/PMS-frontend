import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[14px] font-medium form-label-theme">
          {label}
        </label>
      )}
      <textarea
        className={`min-h-[100px] p-3 rounded-[6px] text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed resize-y form-control-theme ${error ? 'border-[#DC2626] focus:ring-[#DC2626]' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[12px] text-[#DC2626]">{error}</span>
      )}
    </div>
  );
}
