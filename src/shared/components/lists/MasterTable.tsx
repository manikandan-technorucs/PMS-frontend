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
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 border-b rounded-t-[0.75rem]">
        <h2 className="text-xl font-semibold text-theme-primary mb-4 md:mb-0">{title}</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <span className="p-input-icon-left w-full sm:w-auto">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Global Search..."
              className="w-full sm:w-64 rounded-[0.75rem] form-control-theme"
            />
          </span>
          {onExport && (
            <Button
              label="Export"
              icon="pi pi-download"
              outlined
              onClick={onExport}
              className="rounded-[0.75rem] btn-outline-theme border-teal-600 text-teal-600 hover:bg-teal-50"
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
    <div className="card card-base rounded-[0.75rem] overflow-hidden">
      <DataTable
        value={isLoading ? Array.from({ length: 5 }) : data}
        paginator={!isLoading}
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        globalFilter={globalFilter}
        header={renderHeader()}
        emptyMessage="No records found."
        className="w-full text-sm text-theme-primary"
        rowClassName={() => `table-body-row ${onRowClick && !isLoading ? 'cursor-pointer' : ''}`}
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
            className="p-4 table-body-cell"
            headerClassName="table-header-cell p-4 border-b"
          />
        ))}
      </DataTable>
    </div>
  );
};
