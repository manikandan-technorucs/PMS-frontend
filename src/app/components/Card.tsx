import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export function Card({ children, className = '', title, actions }: CardProps) {
  return (
    <div className={`bg-white border border-[#E5E7EB] rounded-[6px] ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
          {title && <h3 className="text-[16px] font-semibold text-[#1F2937]">{title}</h3>}
          {actions}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
