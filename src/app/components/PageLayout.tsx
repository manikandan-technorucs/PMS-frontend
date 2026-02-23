import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export function PageLayout({ children, title, actions }: PageLayoutProps) {
  return (
    <div className="min-h-screen pt-16 pl-60">
      <div className="max-w-[1440px] mx-auto p-8">
        {(title || actions) && (
          <div className="flex items-center justify-between mb-6">
            {title && <h1 className="text-[24px] font-semibold text-[#1F2937]">{title}</h1>}
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
