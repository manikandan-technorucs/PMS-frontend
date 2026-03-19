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
                className="w-full p-calendar-w-btn"
                inputClassName="w-full text-sm py-2 px-3"
                panelClassName="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-lg mt-1"
            />
        </div>
    );
};

export default SharedCalendar;
