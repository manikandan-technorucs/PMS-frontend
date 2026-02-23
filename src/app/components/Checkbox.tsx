import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Checkbox({ label, className = '', checked, ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          {...props}
        />
        <div className={`w-4 h-4 border rounded transition-colors flex items-center justify-center ${checked
            ? 'bg-[#059669] border-[#059669]'
            : 'border-[#E5E7EB] bg-white'
          }`}>
          {checked && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>
      {label && <span className="text-[14px] text-[#1F2937]">{label}</span>}
    </label>
  );
}
