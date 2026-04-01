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
      className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col relative ${className}`}
      style={{ backgroundColor: 'var(--card-bg)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--card-border)' }}
    >
      {}
      <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${accentColor}`} />

      {(title || actions || id) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-3">
              {id && <span className="font-mono text-[11px] font-bold text-theme-muted tracking-tighter">{id}</span>}
              {title && <h3 className="text-[15px] font-bold text-theme-primary tracking-tight">{title}</h3>}
            </div>
            {subtitle && <p className="text-[12px] text-theme-secondary">{subtitle}</p>}
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
