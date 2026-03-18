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
    <div className={`card-base ${className}`}>
      {sectionTitle && (
        <div className="px-5 py-3 border-b border-theme-border">
          <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-wide">{sectionTitle}</h3>
        </div>
      )}
      <div className="p-5">
        <div className={`grid ${COL_MAP[columns] || COL_MAP[3]} gap-x-5 gap-y-4`}>
          {children}
        </div>
      </div>
      {footer && (
        <div className="px-5 py-3 border-t border-theme-border bg-theme-neutral rounded-b-xl flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={footer.onCancel} className="text-theme-secondary hover:text-theme-primary">
            {footer.cancelLabel || 'Cancel'}
          </Button>
          <Button type="submit" disabled={footer.isDisabled || footer.isSubmitting} className="bg-brand-teal-600 hover:bg-brand-teal-700 text-white border-brand-teal-600 rounded-lg">
            {footer.isSubmitting ? (footer.submittingLabel || 'Saving...') : (footer.submitLabel || 'Save')}
          </Button>
        </div>
      )}
    </div>
  );
}
