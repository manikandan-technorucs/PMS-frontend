import React from 'react';
import { Checkbox as PrimeCheckbox } from 'primereact/checkbox';
import type { CheckboxProps as PrimeCheckboxProps } from 'primereact/checkbox';

export interface CheckboxInputProps extends Omit<PrimeCheckboxProps, 'checked'> {
  /** Label text rendered next to the checkbox */
  label?: string;
  /** Whether the checkbox is checked. Omit for uncontrolled usage. */
  checked?: boolean;
  /** Additional classes on the outer wrapper */
  className?: string;
}

/**
 * CheckboxInput — thin pt-wrapper around PrimeReact Checkbox.
 * This is the ONLY approved replacement for native <TextInput type="checkbox">.
 *
 * Usage (with react-hook-form Controller):
 *   <Controller name="isActive" control={control} render={({ field }) => (
 *     <CheckboxInput
 *       inputId="is-active"
 *       label="Active"
 *       checked={field.value}
 *       onChange={(e) => field.onChange(e.checked)}
 *     />
 *   )} />
 */
export function CheckboxInput({ label, className = '', inputId, checked, ...props }: CheckboxInputProps) {
  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${className}`}
    >
      <PrimeCheckbox
        inputId={inputId}
        checked={checked ?? false}
        pt={{
          box: {
            className: [
              'w-4 h-4 rounded',
              'border border-slate-300 dark:border-slate-600',
              'transition-all duration-150',
            ].join(' '),
          },
          input: {
            className: 'sr-only',
          },
          icon: {
            className: 'text-white text-[10px]',
          },
        }}
        {...props}
      />
      {label && (
        <span className="text-[14px] text-slate-700 dark:text-slate-200">{label}</span>
      )}
    </label>
  );
}
