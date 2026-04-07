import { Button } from '@/components/forms/Button';
import { Card } from '@/components/layout/Card';

interface FormCardProps {
  children: React.ReactNode;
  
  sectionTitle?: string;
  
  columns?: 2 | 3 | 4;
  
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
    <Card
      title={sectionTitle}
      className={`border-t-[3px] border-t-[#14b8a6] ${className}`}
      pt={{
        content: { className: 'p-0' }
      }}
    >
      <div className="p-5 md:p-6">
        <div className={`grid ${COL_MAP[columns] || COL_MAP[3]} gap-x-6 gap-y-4`}>
          {children}
        </div>
      </div>
      {footer && (
        <div className="px-6 py-4 flex justify-end gap-3 items-center bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={footer.onCancel}>
            {footer.cancelLabel || 'Cancel'}
          </Button>
          <Button variant="primary" type="submit" disabled={footer.isDisabled || footer.isSubmitting}>
            {footer.isSubmitting ? (footer.submittingLabel || 'Saving...') : (footer.submitLabel || 'Save')}
          </Button>
        </div>
      )}
    </Card>
  );
}
