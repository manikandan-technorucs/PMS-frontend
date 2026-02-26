import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export function PageLayout({ children, title, actions }: PageLayoutProps) {
  return (
    <div className="min-h-screen pt-16 transition-[padding] duration-300 ease-in-out page-layout-wrapper">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-4 md:p-8">
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {title && <h1 className="text-[24px] font-semibold page-title">{title}</h1>}
            {actions && <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
