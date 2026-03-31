import React, { useState } from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Checkbox({ label, className = '', checked, defaultChecked, onChange, ...props }: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e);
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={isChecked}
          onChange={handleChange}
          {...props}
        />
        <div
          className={`w-4 h-4 rounded transition-all duration-150 flex items-center justify-center ${isChecked
            ? 'bg-[#14b8a6] border-[#14b8a6] shadow-sm'
            : 'hover:border-[#14b8a6] checkbox-unchecked-theme'
            }`}
        >
          {isChecked && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>
      {label && <span className="text-[14px] select-none text-theme-primary">{label}</span>}
    </label>
  );
}
