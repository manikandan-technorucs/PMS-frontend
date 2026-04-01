import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from 'primereact/button';

interface PageLayoutProps {
  children:       React.ReactNode;
  title?:         string;
  subtitle?:      string;   // optional page-level sub-caption
  actions?:       React.ReactNode;
  isFullHeight?:  boolean;
  showBackButton?: boolean;
  backPath?:      string;
  onBack?:        () => void;
}

export function PageLayout({
  children,
  title,
  subtitle,
  actions,
  isFullHeight,
  showBackButton,
  backPath,
  onBack,
}: PageLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack)           { onBack(); }
    else if (backPath)    { navigate(backPath); }
    else                  { navigate(-1); }
  };

  return (
    <div
      className={`
        transition-[padding] duration-300 ease-in-out
        ${isFullHeight
          ? 'h-[calc(100vh-64px)] flex flex-col overflow-hidden'
          : 'min-h-[calc(100vh-64px)]'
        }
      `}
    >
      <div
        className={`
          max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 w-full
          ${isFullHeight ? 'flex-1 overflow-hidden flex flex-col min-h-0' : ''}
        `}
      >
        {}
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {showBackButton && (
                <Button unstyled                   onClick={handleBack}
                  className="
                    flex-shrink-0 w-8 h-8 flex items-center justify-center
                    rounded-[8px] border transition-all duration-150
                    hover:bg-[var(--bg-hover-neutral)]
                  "
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <ArrowLeft size={16} />
                </Button>
              )}
              {title && (
                <div className="min-w-0">
                  <h1
                    className="text-[20px] sm:text-[22px] font-bold tracking-tight leading-tight truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {title}
                  </h1>
                  {subtitle && (
                    <p
                      className="text-[12.5px] font-medium mt-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
            {actions && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 w-full sm:w-auto flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        )}

        {}
        <div className={isFullHeight ? 'flex-1 overflow-hidden flex flex-col min-h-0' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
}
