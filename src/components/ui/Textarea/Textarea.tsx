import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[13px] font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`min-h-[120px] p-3.5 rounded-[var(--radius-sm)] border border-slate-200 text-[14px] text-slate-700 placeholder:text-slate-400 
            focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 
            resize-y transition-all duration-200 
            ${error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && (
          <span className="text-[12px] text-red-600 flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="6" opacity="0.15" /><path d="M6 3v4M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            {error}
          </span>
        )}
        {helperText && !error && (
          <span className="text-[12px] text-slate-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
