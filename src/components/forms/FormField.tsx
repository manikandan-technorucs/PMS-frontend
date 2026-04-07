import React from 'react';

export interface FormFieldProps {
  /** The visible label text */
  label: string;
  /** Wires htmlFor on the label — must match the id on the child input */
  htmlFor?: string;
  /** Appends a "Required" badge next to the label */
  required?: boolean;
  /** The input component (TextInput / DropdownSelect / TextAreaInput / etc.) */
  children: React.ReactNode;
  /** Additional classes on the outer wrapper */
  className?: string;
  /** Subtle grey hint shown below the input when there is no error */
  hint?: string;
  /**
   * Zod/RHF error — accepts a raw string or a FieldError object.
   * Renders the .message property if it is an object.
   */
  error?: string | { message?: string } | null;
}

/**
 * FormField — standardized label + input + error/hint shell.
 * All form inputs MUST be wrapped in this component.
 *
 * Usage:
 *   <FormField label="Full Name" htmlFor="name" required error={errors.name}>
 *     <TextInput id="name" {...register('name')} isInvalid={!!errors.name} />
 *   </FormField>
 */
export function FormField({
  label,
  htmlFor,
  required,
  children,
  className = '',
  hint,
  error,
}: FormFieldProps) {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error?.message ?? 'Invalid value';

  return (
    <div
      className={`group flex flex-col gap-1 transition-colors duration-200 ${className}`}
    >
      {/* ── Label row ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-semibold text-slate-700 dark:text-gray-200
            group-focus-within:text-brand-teal-600
            dark:group-focus-within:text-brand-teal-400
            transition-colors cursor-default"
        >
          {label}
        </label>

        {required && (
          <span
            className="text-[10px] font-bold uppercase tracking-wider
              text-red-500 bg-red-50 dark:bg-red-500/10
              px-1.5 py-0.5 rounded shadow-sm"
          >
            Required
          </span>
        )}
      </div>

      {/* ── Input slot ─────────────────────────────────────────────────── */}
      <div className="relative">{children}</div>

      {/* ── Hint / Error ───────────────────────────────────────────────── */}
      {hint && !error && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {hint}
        </p>
      )}
      {error && (
        <p className="text-[11px] font-semibold text-red-500 mt-0.5 flex items-center gap-1">
          <svg
            className="w-3 h-3 flex-shrink-0"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="6" opacity="0.15" />
            <path
              d="M6 3v4M6 8.5v.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
