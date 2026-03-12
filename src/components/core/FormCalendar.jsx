import React from 'react';
import { Calendar } from 'primereact/calendar';
import { cn } from '@/shared/utils/cn';

const FormCalendar = ({ 
    value, 
    onChange, 
    disableFuture = false, 
    placeholder = 'Select Date',
    className,
    ...props 
}) => {
    const maxDate = disableFuture ? new Date() : null;

    return (
        <div className={cn("w-full flex flex-col gap-2", className)}>
            <Calendar
                {...props}
                value={value}
                onChange={(e) => onChange(e.value)}
                maxDate={maxDate}
                placeholder={placeholder}
                showIcon
                className="w-full"
                inputClassName="w-full text-[13px] border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                panelClassName="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl overflow-hidden mt-1 p-2"
            />
            <style jsx="true">{`
                /* Premium Overrides for PrimeReact Calendar */
                .p-datepicker {
                    padding: 0.5rem;
                    border: 1px solid #1e293b !important;
                }
                .p-datepicker table td > span {
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    font-size: 0.75rem;
                }
                .p-datepicker table td > span.p-highlight {
                    background: #2563eb !important;
                    color: white;
                }
                .p-calendar .p-button {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                }
                .p-calendar .p-button:hover {
                    color: #2563eb;
                }
            `}</style>
        </div>
    );
};

export default FormCalendar;
