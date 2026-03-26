import React from 'react';
import { DataTable, DataTableFilterEvent, DataTablePageEvent, DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';

export interface LazyLoadEvent {
    first: number;
    rows: number;
    page: number;
    sortField?: string;
    sortOrder?: 1 | 0 | -1 | undefined | null;
    globalFilter?: string | null;
    filters?: Record<string, any>;
}

export interface ColumnSchema {
  field: string;
  header: string;
  body?: (rowData: any) => React.ReactNode;
  sortable?: boolean;
}

export interface MasterTableProps {
  title: string;
  data: any[];
  totalRecords: number;
  columns: ColumnSchema[];
  lazyParams: LazyLoadEvent;
  onLazyLoad: (event: LazyLoadEvent) => void;
  loading?: boolean;
  onCreate?: () => void;
  onExport?: () => void;
  onRowClick?: (rowData: any) => void;
  actions?: (rowData: any) => React.ReactNode; // Permission-based actions
  hideSearch?: boolean; // Prop to optionally hide the global search
}

export const MasterTable: React.FC<MasterTableProps> = ({
  title,
  data,
  totalRecords,
  columns,
  lazyParams,
  onLazyLoad,
  loading = false,
  onCreate,
  onExport,
  onRowClick,
  actions,
  hideSearch = false
}) => {

  const onPage = (event: DataTablePageEvent) => {
      onLazyLoad({ ...lazyParams, first: event.first, rows: event.rows, page: event.page || 0 });
  };

  const onSort = (event: DataTableSortEvent) => {
      onLazyLoad({ ...lazyParams, sortField: event.sortField, sortOrder: event.sortOrder });
  };

  const onFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
      onLazyLoad({ ...lazyParams, globalFilter: e.target.value, first: 0, page: 0 });
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 border-b border-theme-border rounded-t-[0.75rem]">
        <h2 className="text-xl font-semibold text-theme-primary mb-4 md:mb-0">{title}</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {!hideSearch && (
            <span className="p-input-icon-left w-full sm:w-auto">
              <i className="pi pi-search" />
              <InputText
                value={lazyParams.globalFilter || ''}
                onChange={onFilter}
                placeholder="Global Search..."
                className="w-full sm:w-64 rounded-[0.75rem] form-control-theme"
              />
            </span>
          )}
          {onExport && (
            <Button
              label="Export"
              icon="pi pi-download"
              outlined
              onClick={onExport}
              className="rounded-[0.75rem] btn-outline-theme border-brand-teal-600 text-brand-teal-600 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-900/20"
            />
          )}
          {onCreate && (
            <Button
              label="Create New"
              icon="pi pi-plus"
              onClick={onCreate}
              className="rounded-[0.75rem] bg-brand-teal-600 border-brand-teal-600 hover:bg-brand-teal-700 text-white"
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
        value={loading ? Array.from({ length: lazyParams.rows || 5 }).map((_, i) => ({ id: `skeleton-${i}` })) : data}
        lazy
        dataKey="id"
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        onPage={onPage}
        onSort={onSort}
        sortField={lazyParams.sortField}
        sortOrder={lazyParams.sortOrder}
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Showing {first}–{last} of {totalRecords}"
        paginatorClassName="flex flex-wrap items-center gap-1 px-4 py-3 bg-theme-surface border-t border-theme-border text-[12px] font-bold text-theme-muted"
        header={renderHeader()}
        emptyMessage="No records found."
        className="w-full text-sm text-theme-primary"
        rowClassName={(data) => `table-body-row ${onRowClick && !loading ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''}`}
        onRowClick={(e) => {
          if (onRowClick && !loading) {
            onRowClick(e.data);
          }
        }}
      >
        {columns.map((col, index) => (
          <Column
            key={index}
            field={col.field}
            header={col.header}
            sortable={col.sortable !== false}
            body={loading ? skeletonBodyTemplate : (col.field.toLowerCase() === 'status' && !col.body ? statusBodyTemplate : col.body)}
            className="p-4 table-body-cell"
            headerClassName="table-header-cell p-4 border-b border-theme-border bg-theme-secondary text-theme-muted font-bold tracking-wider uppercase text-xs"
          />
        ))}
        {actions && !loading && (
           <Column body={actions} className="p-4 table-body-cell w-24" />
        )}
      </DataTable>
    </div>
  );
};
