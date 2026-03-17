import React from 'react';
import { Calendar } from 'primereact/calendar';
import { cn } from '@/shared/utils/cn';

const SharedCalendar = ({
    value = new Date(),
    onChange,
    disableFuture = false,
    placeholder = 'Select Date',
    className,
    ...props
}) => {
    const maxDate = disableFuture ? new Date() : null;

    return (
        <div className={cn("w-full flex flex-col", className)}>
            <Calendar
                {...props}
                value={value}
                onChange={(e) => onChange(e.value)}
                maxDate={maxDate}
                placeholder={placeholder}
                showIcon
                className="w-full"
                inputClassName="w-full text-sm border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-[0.75rem] shadow-sm py-2 px-3 bg-white dark:bg-slate-950"
                panelClassName="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-lg mt-1"
            />
            <style jsx="true">{`
                .p-datepicker {
                    border-radius: 0.75rem !important;
                }
                .p-datepicker table td > span.p-highlight {
                    background: #14b8a6 !important;
                    color: white;
                }
                .p-calendar .p-datepicker-trigger {
                    background: transparent;
                    border: none;
                    color: #14b8a6;
                }
            `}</style>
        </div>
    );
};

export default SharedCalendar;
