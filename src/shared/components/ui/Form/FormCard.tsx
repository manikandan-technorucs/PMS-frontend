import React from 'react';
import { Button } from '@/shared/components/ui/Button/Button';

interface FormCardProps {
  children: React.ReactNode;
  /** Optional section title shown in a small header bar */
  sectionTitle?: string;
  /** Grid columns: 2 | 3 | 4, default 3 */
  columns?: 2 | 3 | 4;
  /** Footer buttons config */
  footer?: {
    cancelLabel?: string;
    submitLabel?: string;
    submittingLabel?: string;
    onCancel: () => void;
    isSubmitting?: boolean;
    isDisabled?: boolean;
  };
  className?: string;
}

const COL_MAP: Record<number, string> = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

export function FormCard({ children, sectionTitle, columns = 3, footer, className = '' }: FormCardProps) {
  return (
    <div className={`rounded-lg shadow-sm overflow-hidden border-t-[3px] border-t-[#14b8a6] ${className}`} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
      {sectionTitle && (
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="text-[13px] font-bold text-theme-primary uppercase tracking-wider">{sectionTitle}</h3>
        </div>
      )}
      <div className="p-5 md:p-6">
        <div className={`grid ${COL_MAP[columns] || COL_MAP[3]} gap-x-6 gap-y-6`}>
          {children}
        </div>
      </div>
      {footer && (
        <div className="px-6 py-4 flex justify-end gap-3 items-center" style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <Button variant="outline" type="button" onClick={footer.onCancel}>
            {footer.cancelLabel || 'Cancel'}
          </Button>
          <Button type="submit" disabled={footer.isDisabled || footer.isSubmitting}>
            {footer.isSubmitting ? (footer.submittingLabel || 'Saving...') : (footer.submitLabel || 'Save')}
          </Button>
        </div>
      )}
    </div>
  );
}
