import React from 'react';
import { DataTable as PrimeDataTable } from 'primereact/datatable';
import { Column as PrimeColumn } from 'primereact/column';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  itemsPerPage?: number;
  hideHeader?: boolean;
  loading?: boolean;
  emptyMessage?: React.ReactNode;
}

/* ── Skeleton Rows (CLS prevention) ── */
function SkeletonRows({ columns, count = 5 }: { columns: number; count?: number }) {
  return (
    <div className="w-full bg-theme-surface">
      {/* Skeleton header */}
      <div className="flex gap-4 px-4 py-3 bg-theme-neutral border-b border-theme-border">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1 h-3 bg-theme-muted/20 rounded animate-pulse" />
        ))}
      </div>
      {/* Skeleton body rows */}
      {Array.from({ length: count }).map((_, row) => (
        <div key={row} className="flex gap-4 px-4 py-3.5 border-b border-theme-border last:border-0">
          {Array.from({ length: columns }).map((_, col) => (
            <div
              key={col}
              className="flex-1 h-3.5 bg-theme-neutral rounded animate-pulse"
              style={{ animationDelay: `${(row * columns + col) * 75}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  selectable = false,
  onRowClick,
  itemsPerPage = 10,
  hideHeader = false,
  loading = false,
  emptyMessage
}: DataTableProps<T>) {

  // ── Show skeleton when loading ──
  if (loading) {
    return (
      <div className="card-base shadow-sm overflow-hidden">
        <SkeletonRows columns={columns.length} />
      </div>
    );
  }

  // Pixel-perfect PrimeReact pass-through styling adapted for dark mode
  const tablePt = {
    root: { className: 'w-full text-[13px] border-collapse bg-transparent' },
    headerRow: { className: hideHeader ? 'hidden' : 'bg-transparent border-b border-theme-border' },
    bodyRow: {
      className: `border-b border-theme-border last:border-0 transition-all duration-200 hover:bg-theme-neutral ${onRowClick ? 'cursor-pointer hover:scale-[1.002]' : ''}`
    },
    headerCell: { className: 'px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-theme-muted bg-transparent border-b border-theme-border' },
    bodyCell: { className: 'px-4 py-3.5 text-[13px] text-theme-primary font-medium bg-transparent' },
    column: {
      sortIcon: { className: 'w-3 h-3 ml-1 text-theme-muted' },
      sortBadge: { className: 'hidden' },
      headerContent: { className: 'flex items-center gap-1 bg-transparent' }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="overflow-x-auto flex-1">
        <PrimeDataTable
          value={data}
          paginator={data.length > itemsPerPage}
          rows={itemsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
          loading={false}
          onRowClick={(e) => onRowClick?.(e.data as T)}
          pt={tablePt}
          emptyMessage={emptyMessage || <div className="p-10 text-center text-theme-muted font-medium bg-theme-surface border border-dashed border-theme-border rounded-xl">No data found.</div>}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
          responsiveLayout="scroll"
          className="flex-1"
          tableStyle={{ backgroundColor: 'var(--card-bg)' }}
        >
          {selectable && <PrimeColumn selectionMode="multiple" headerStyle={{ width: '3rem' }} />}

          {columns.map((col) => (
            <PrimeColumn
              key={col.key}
              field={col.key}
              header={col.header}
              sortable={col.sortable}
              body={(rowData) => col.render ? col.render(rowData[col.key], rowData) : rowData[col.key]}
            />
          ))}
        </PrimeDataTable>
      </div>
    </div>
  );
}
