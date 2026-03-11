import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export function Card({ children, className = '', title, actions }: CardProps) {
  return (
    <div
      className={`rounded-[6px] card-base ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 card-header-border">
          {title && <h3 className="text-[16px] font-semibold text-theme-primary">{title}</h3>}
          {actions}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
