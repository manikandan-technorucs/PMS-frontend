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
    <div className="w-full">
      {/* Skeleton header */}
      <div className="flex gap-4 px-4 py-3 bg-slate-50/50 border-b border-slate-100">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1 h-3 bg-slate-200/60 rounded animate-pulse" />
        ))}
      </div>
      {/* Skeleton body rows */}
      {Array.from({ length: count }).map((_, row) => (
        <div key={row} className="flex gap-4 px-4 py-3.5 border-b border-slate-100 last:border-0">
          {Array.from({ length: columns }).map((_, col) => (
            <div
              key={col}
              className="flex-1 h-3.5 bg-slate-100 rounded animate-pulse"
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
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <SkeletonRows columns={columns.length} />
      </div>
    );
  }

  // Pixel-perfect PrimeReact pass-through styling
  const tablePt = {
    root: { className: 'w-full text-[13px] border-collapse' },
    headerRow: { className: hideHeader ? 'hidden' : 'bg-slate-50/50 border-b border-slate-100' },
    bodyRow: {
      className: `border-b border-slate-100 last:border-0 transition-all duration-200 hover:bg-slate-50/50 ${onRowClick ? 'cursor-pointer' : ''}`
    },
    headerCell: { className: 'px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500' },
    bodyCell: { className: 'px-4 py-3.5 text-[13px] text-slate-600 font-normal' },
    column: {
      sortIcon: { className: 'w-3 h-3 ml-1 text-slate-400' },
      sortBadge: { className: 'hidden' },
      headerContent: { className: 'flex items-center gap-1' },
    },
    paginator: {
      root: { className: 'border-t border-slate-100 bg-white px-4 py-3' },
      pages: { className: 'flex items-center gap-1' },
      pageButton: ({ context }: any) => ({
        className: `w-8 h-8 rounded-lg text-[13px] transition-all flex items-center justify-center ${context.active ? 'bg-brand-teal-50 text-brand-teal-600 font-bold ring-1 ring-brand-teal-200' : 'text-slate-500 hover:bg-slate-50'
          }`
      }),
      prevPageButton: { className: 'w-8 h-8 text-slate-400 hover:text-slate-600' },
      nextPageButton: { className: 'w-8 h-8 text-slate-400 hover:text-slate-600' },
      firstPageButton: { className: 'w-8 h-8 text-slate-400 hover:text-slate-600' },
      lastPageButton: { className: 'w-8 h-8 text-slate-400 hover:text-slate-600' },
      rowPerPageDropdown: {
        root: { className: 'border border-slate-200 rounded-lg px-2 py-1 text-[13px] bg-white outline-none focus:ring-1 focus:ring-brand-teal-500' }
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto flex-1">
        <PrimeDataTable
          value={data}
          paginator={data.length > itemsPerPage}
          rows={itemsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
          loading={false}
          onRowClick={(e) => onRowClick?.(e.data as T)}
          pt={tablePt}
          emptyMessage={emptyMessage || <div className="p-10 text-center text-slate-400">No data found.</div>}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
          responsiveLayout="scroll"
          className="flex-1"
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
