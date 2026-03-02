import React, { useRef } from 'react';
import { MultiSelect as PrimeMultiSelect, MultiSelectProps as PrimeMultiSelectProps } from 'primereact/multiselect';
import { ChevronDown } from 'lucide-react';

interface MultiSelectProps extends PrimeMultiSelectProps {
    label?: string;
    error?: string;
    helperText?: string;
}

export function MultiSelect({ label, error, helperText, className = '', ...props }: MultiSelectProps) {
    return (
        <div className="flex flex-col gap-1 w-full relative">
            {label && (
                <label className="text-[14px] font-medium form-label-theme">
                    {label}
                </label>
            )}
            <PrimeMultiSelect
                appendTo="self"
                className={`w-full min-h-[40px] rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent form-control-theme flex items-center ${error ? 'border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#CBD5E1] dark:border-[#334155]'} ${className}`}
                panelClassName="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] shadow-lg rounded-md mt-1 z-50 absolute w-full"
                {...props}
            />
            {helperText && !error && (
                <span className="text-[12px] text-[#6B7280]">{helperText}</span>
            )}
            {error && (
                <span className="text-[12px] text-[#DC2626]">{error}</span>
            )}
        </div>
    );
}
