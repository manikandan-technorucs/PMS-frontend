import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  isFullHeight?: boolean;
  showBackButton?: boolean;
  backPath?: string;
  onBack?: () => void;
}

export function PageLayout({
  children,
  title,
  actions,
  isFullHeight,
  showBackButton,
  backPath,
  onBack
}: PageLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };
  return (
    <div className={`transition-[padding] duration-300 ease-in-out ${isFullHeight ? 'h-[calc(100vh-64px)] flex flex-col overflow-hidden' : 'min-h-[calc(100vh-64px)]'}`}>
      <div className={`max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 w-full ${isFullHeight ? 'flex-1 overflow-hidden flex flex-col min-h-0' : ''}`}>
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button variant="ghost" size="sm" onClick={handleBack} className="p-2 h-auto">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              {title && <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight antialiased page-title">{title}</h1>}
            </div>
            {actions && <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">{actions}</div>}
          </div>
        )}
        <div className={isFullHeight ? 'flex-1 overflow-hidden flex flex-col min-h-0' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
}
