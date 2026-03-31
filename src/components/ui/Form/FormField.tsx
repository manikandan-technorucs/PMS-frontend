import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  /** Extra Tailwind classes on the wrapper div, e.g. 'col-span-2' */
  className?: string;
  hint?: string;
}

export function FormField({ label, required, children, className = '', hint }: FormFieldProps) {
  return (
    <div className={`group flex flex-col gap-1.5 transition-colors duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-semibold text-slate-700 dark:text-gray-200 group-focus-within:text-brand-teal-600 dark:group-focus-within:text-brand-teal-400 transition-colors">
          {label}
        </label>
        {required && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded shadow-sm">
            Required
          </span>
        )}
      </div>
      <div className="relative">
        {children}
      </div>
      {hint && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
}
