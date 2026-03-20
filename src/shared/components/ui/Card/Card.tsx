import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
  accentColor?: string; // Optional color string or tailwind class
  id?: string;
  subtitle?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', title, actions, accentColor = 'bg-brand-teal-500', id, subtitle, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col relative ${className}`}
    >
      {/* Accent Border (Incident Card Style) */}
      <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${accentColor}`} />

      {(title || actions || id) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/50">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-3">
              {id && <span className="font-mono text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-tighter">{id}</span>}
              {title && <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>}
            </div>
            {subtitle && <p className="text-[12px] text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {actions}
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
