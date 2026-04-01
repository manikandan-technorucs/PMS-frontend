import React, { useState, useCallback } from 'react';
import { DataTable as PrimeDataTable } from 'primereact/datatable';
import { Column as PrimeColumn } from 'primereact/column';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

/** Synced with FastAPI query params — zero client-side processing */
export interface LazyParams {
  first: number;      // row offset
  rows: number;       // page size
  page: number;       // 0-indexed
  sortField?: string;
  sortOrder?: 1 | -1 | null;
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

  // ── Server-Side (Lazy) Mode ──────────────────────────────────
  /**
   * When true, DataTable defers all pagination/sorting to the server.
   * - `data` must already be the current page slice (from TanStack Query).
   * - `totalRecords` must be provided for the paginator to work correctly.
   * - `onLazyLoad` will be called whenever page/sort changes.
   */
  lazy?: boolean;
  totalRecords?: number;
  lazyParams?: LazyParams;
  onLazyLoad?: (params: LazyParams) => void;

  /** @deprecated Use onLazyLoad instead */
  onPageChange?: (first: number, rows: number) => void;
}

// ── Skeleton loader ─────────────────────────────────────────────────────────
function SkeletonRows({ columns, count = 5 }: { columns: number; count?: number }) {
  return (
    <div className="w-full bg-theme-surface">
      <div className="flex gap-4 px-4 py-3 bg-theme-neutral border-b border-theme-border">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1 h-3 bg-theme-muted/20 rounded animate-pulse" />
        ))}
      </div>
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

// ── Main Component ───────────────────────────────────────────────────────────
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  selectable = false,
  onRowClick,
  itemsPerPage = 10,
  hideHeader = false,
  loading = false,
  emptyMessage,
  lazy = false,
  totalRecords,
  lazyParams: externalLazyParams,
  onLazyLoad,
  onPageChange,
}: DataTableProps<T>) {
  // Internal state for non-lazy (client-side) mode
  const [internalFirst, setInternalFirst] = useState(0);
  const [internalRows, setInternalRows] = useState(itemsPerPage);

  // Use external lazyParams if provided, else internal state
  const first = lazy && externalLazyParams ? externalLazyParams.first : internalFirst;
  const rows = lazy && externalLazyParams ? externalLazyParams.rows : internalRows;

  const handlePageChange = useCallback(
    (e: PaginatorPageChangeEvent) => {
      if (lazy && onLazyLoad) {
        const newParams: LazyParams = {
          first: e.first,
          rows: e.rows,
          page: e.page,
          sortField: externalLazyParams?.sortField,
          sortOrder: externalLazyParams?.sortOrder,
        };
        onLazyLoad(newParams);
      } else {
        setInternalFirst(e.first);
        setInternalRows(e.rows);
        onPageChange?.(e.first, e.rows);
      }
    },
    [lazy, onLazyLoad, externalLazyParams, onPageChange],
  );

  const handleSort = useCallback(
    (e: { sortField: string; sortOrder: 1 | -1 }) => {
      if (lazy && onLazyLoad && externalLazyParams) {
        onLazyLoad({
          ...externalLazyParams,
          sortField: e.sortField,
          sortOrder: e.sortOrder,
        });
      }
    },
    [lazy, onLazyLoad, externalLazyParams],
  );

  if (loading) {
    return (
      <div className="card-base shadow-sm overflow-hidden">
        <SkeletonRows columns={columns.length} />
      </div>
    );
  }

  const total = totalRecords ?? data.length;
  const showPaginator = total > rows;

  // In lazy mode → data is already the page slice; in eager mode → slice here
  const visibleData = lazy ? data : data.slice(first, first + rows);

  const tablePt = {
    root: { className: 'w-full text-[13px] border-collapse bg-transparent' },
    headerRow: {
      className: hideHeader
        ? 'hidden'
        : 'bg-transparent border-b border-slate-200 dark:border-slate-700',
    },
    bodyRow: {
      className: `border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors duration-150 ${
        onRowClick
          ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50'
          : 'hover:bg-slate-50/30 dark:hover:bg-slate-800/30'
      }`,
    },
    headerCell: {
      className:
        'px-5 py-3 text-left text-[12px] font-semibold text-slate-500 dark:text-slate-400 bg-transparent border-b border-slate-200 dark:border-slate-700',
    },
    bodyCell: {
      className: 'px-5 py-3.5 text-[13px] text-slate-700 dark:text-slate-300 bg-transparent',
    },
    column: {
      sortIcon: { className: 'w-3 h-3 ml-1 text-theme-muted' },
      sortBadge: { className: 'hidden' },
      headerContent: { className: 'flex items-center gap-1 bg-transparent' },
    },
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <PrimeDataTable
          value={visibleData}
          loading={false}
          onRowClick={(e) => onRowClick?.(e.data as T)}
          onSort={lazy ? (e: any) => handleSort(e) : undefined}
          sortField={lazy ? externalLazyParams?.sortField : undefined}
          sortOrder={lazy ? (externalLazyParams?.sortOrder ?? null) : undefined}
          pt={tablePt}
          emptyMessage={
            emptyMessage || (
              <div className="p-10 text-center text-theme-muted font-medium bg-theme-surface border border-dashed border-theme-border rounded-xl">
                No data found.
              </div>
            )
          }
          responsiveLayout="scroll"
          tableStyle={{ backgroundColor: 'var(--card-bg)' }}
        >
          {selectable && <PrimeColumn selectionMode="multiple" headerStyle={{ width: '3rem' }} />}
          {columns.map((col) => (
            <PrimeColumn
              key={col.key}
              field={col.key}
              header={col.header}
              sortable={col.sortable}
              body={(rowData) =>
                col.render ? col.render(rowData[col.key], rowData) : rowData[col.key]
              }
            />
          ))}
        </PrimeDataTable>
      </div>

      {showPaginator && (
        <Paginator
          first={first}
          rows={rows}
          totalRecords={total}
          rowsPerPageOptions={[10, 20, 50, 100]}
          onPageChange={handlePageChange}
          template="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
          currentPageReportTemplate="Showing {first}–{last} of {totalRecords}"
          className="border-t border-theme-border bg-theme-surface"
        />
      )}
    </div>
  );
}
