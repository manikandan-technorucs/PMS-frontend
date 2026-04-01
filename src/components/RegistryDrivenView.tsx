import React, { useState, useEffect } from 'react';
import { useEntity } from '@/hooks/useEntity';
import { Button } from 'primereact/button';

interface RegistryDrivenViewProps {
  moduleConfig: {
    entity: string;
    columns: any[];
    title: string;
    searchable?: boolean;
  };
  onRowClick?: (row: any) => void;
  actions?: React.ReactNode;
}

export function RegistryDrivenView({ moduleConfig, onRowClick, actions }: RegistryDrivenViewProps) {
  const { getAll, loading } = useEntity(moduleConfig.entity);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{moduleConfig.title}</h1>
          <p className="text-slate-500 text-sm">Manage your {moduleConfig.title.toLowerCase()} data efficiently.</p>
        </div>
        <div className="flex gap-3">
           {actions}
           <Button unstyled 
             onClick={() => getAll()}
             className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
             title="Refresh Data"
           >
             <i className="pi pi-refresh" />
           </Button>
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
         {loading ? (
             <div className="p-20 text-center text-slate-400">Loading {moduleConfig.title}...</div>
         ) : (
             <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 m-4 rounded-xl">
                MasterTable implementation for {moduleConfig.entity}
             </div>
         )}
      </div>
    </div>
  );
}
