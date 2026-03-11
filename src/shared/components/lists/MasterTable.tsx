import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';

export interface ColumnSchema {
  field: string;
  header: string;
  body?: (rowData: any) => React.ReactNode;
  sortable?: boolean;
}

export interface MasterTableProps {
  title: string;
  data: any[];
  columns: ColumnSchema[];
  onCreate?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  onRowClick?: (rowData: any) => void;
}

export const MasterTable: React.FC<MasterTableProps> = ({
  title,
  data,
  columns,
  onCreate,
  onExport,
  isLoading = false,
  onRowClick
}) => {
  const [globalFilter, setGlobalFilter] = useState('');

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 rounded-t-[0.75rem]">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-0">{title}</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <span className="p-input-icon-left w-full sm:w-auto">
            <i className="pi pi-search" />
            <InputText 
              value={globalFilter} 
              onChange={(e) => setGlobalFilter(e.target.value)} 
              placeholder="Global Search..." 
              className="w-full sm:w-64 rounded-[0.75rem] dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-teal-500"
            />
          </span>
          {onExport && (
            <Button 
              label="Export" 
              icon="pi pi-download" 
              outlined 
              onClick={onExport} 
              className="rounded-[0.75rem] text-teal-600 border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30"
            />
          )}
          {onCreate && (
            <Button 
              label="Create New" 
              icon="pi pi-plus" 
              onClick={onCreate} 
              className="rounded-[0.75rem] bg-teal-600 border-teal-600 hover:bg-teal-700 text-white"
            />
          )}
        </div>
      </div>
    );
  };

  const statusBodyTemplate = (rowData: any) => {
    const statusStr = typeof rowData.status === 'string' 
      ? rowData.status 
      : rowData.status?.name || '';
      
    const status = statusStr.toLowerCase();
    let severity: 'success' | 'warning' | 'danger' | 'info' | null = null;
    
    switch (status) {
      case 'active':
      case 'completed':
      case 'approved':
        severity = 'success';
        break;
      case 'pending':
      case 'in progress':
      case 'review':
        severity = 'warning';
        break;
      case 'closed':
      case 'rejected':
      case 'inactive':
        severity = 'danger';
        break;
      default:
        severity = 'info';
    }

    return <Tag value={statusStr} severity={severity} className="rounded-[0.75rem] px-3 py-1" />;
  };

  const skeletonBodyTemplate = () => {
    return <Skeleton className="mb-2 rounded-[0.75rem]" height="2rem" />;
  };

  return (
    <div className="card shadow-sm rounded-[0.75rem] bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700">
      <DataTable 
        value={isLoading ? Array.from({ length: 5 }) : data} 
        paginator={!isLoading} 
        rows={10} 
        rowsPerPageOptions={[5, 10, 25, 50]}
        globalFilter={globalFilter} 
        header={renderHeader()} 
        emptyMessage="No records found."
        className="w-full text-sm dark:text-gray-200"
        rowClassName={() => `dark:bg-gray-800 dark:hover:bg-gray-700 ${onRowClick && !isLoading ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onRowClick={(e) => {
          if (onRowClick && !isLoading) {
            onRowClick(e.data);
          }
        }}
      >
        {columns.map((col, index) => (
          <Column
            key={index}
            field={col.field}
            header={col.header}
            sortable={!isLoading && (col.sortable !== false)}
            body={isLoading ? skeletonBodyTemplate : (col.field.toLowerCase() === 'status' && !col.body ? statusBodyTemplate : col.body)}
            className="p-4 border-b border-gray-100 dark:border-gray-700"
            headerClassName="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 font-medium p-4 border-b border-gray-200 dark:border-gray-700"
          />
        ))}
      </DataTable>
    </div>
  );
};
