import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  isFullHeight?: boolean;
}

export function PageLayout({ children, title, actions, isFullHeight }: PageLayoutProps) {
  return (
    <div className={`pt-16 transition-[padding] duration-300 ease-in-out page-layout-wrapper ${isFullHeight ? 'h-screen flex flex-col overflow-hidden' : 'min-h-screen'}`}>
      <div className={`max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 w-full ${isFullHeight ? 'flex-1 overflow-hidden flex flex-col' : ''}`}>
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
            {title && <h1 className="text-[24px] font-semibold page-title">{title}</h1>}
            {actions && <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">{actions}</div>}
          </div>
        )}
        <div className={isFullHeight ? 'flex-1 overflow-hidden' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
}
