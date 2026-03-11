import React from 'react';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';

export interface StandardFormLayoutProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  children: React.ReactNode;
  isSaving?: boolean;
  isLoading?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}

export const StandardFormLayout: React.FC<StandardFormLayoutProps> = ({
  title,
  onSubmit,
  onCancel,
  children,
  isSaving = false,
  isLoading = false,
  saveLabel = 'Save',
  cancelLabel = 'Cancel'
}) => {
  return (
    <div className="max-w-4xl mx-auto w-full bg-white dark:bg-gray-800 rounded-[0.75rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col min-h-[400px]">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        {isLoading ? (
          <Skeleton width="30%" height="2rem" className="rounded-[0.75rem]" />
        ) : (
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h2>
        )}
      </div>
      
      <form onSubmit={onSubmit} className="flex-1 flex flex-col">
        <div className="p-6 flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton width="40%" className="rounded-[0.75rem]" />
                  <Skeleton height="3rem" className="rounded-[0.75rem] w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {children}
            </div>
          )}
        </div>
        
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 rounded-b-[0.75rem]">
          <Button 
            type="button" 
            label={cancelLabel} 
            icon="pi pi-times" 
            outlined 
            onClick={onCancel} 
            disabled={isSaving || isLoading}
            className="rounded-[0.75rem] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          />
          <Button 
            type="submit" 
            label={saveLabel} 
            icon="pi pi-check" 
            loading={isSaving} 
            disabled={isLoading}
            className="rounded-[0.75rem] bg-teal-600 border-teal-600 hover:bg-teal-700 text-white"
          />
        </div>
      </form>
    </div>
  );
};
