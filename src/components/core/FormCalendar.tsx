import React from 'react';
import { Calendar, CalendarChangeEvent } from 'primereact/calendar';
import { cn } from '@/utils/cn';

interface FormCalendarProps {
  value: Date | null | undefined;
  onChange: (value: Date | null | Date[] | undefined) => void;
  disableFuture?: boolean;
  placeholder?: string;
  className?: string;
  [key: string]: any;
}

const FormCalendar: React.FC<FormCalendarProps> = ({
  value,
  onChange,
  disableFuture = false,
  placeholder = 'Select Date',
  className,
  ...props
}) => {
  const maxDate = disableFuture ? new Date() : undefined;

  return (
    <div className={cn('w-full flex flex-col gap-2', className)}>
      <Calendar
        {...props}
        value={value}
        onChange={(e: CalendarChangeEvent) => onChange(e.value)}
        maxDate={maxDate}
        placeholder={placeholder}
        showIcon
        className="w-full p-calendar-w-btn"
        inputClassName="w-full text-[13px] py-2 px-3 text-slate-900 dark:text-slate-100"
        panelClassName="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl overflow-hidden mt-1 p-2"
      />
    </div>
  );
};

export default FormCalendar;
