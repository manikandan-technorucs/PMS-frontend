import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

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
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  selectable = false,
  onRowClick,
  itemsPerPage = 20
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, idx) => startIndex + idx)));
    }
  };

  const toggleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="table-header-row bg-theme-surface">
              {selectable && (
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded table-checkbox"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-[14px] font-semibold table-header-cell"
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="table-sort-btn"
                      >
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          )
                        ) : (
                          <ArrowUp className="w-4 h-4 opacity-30" />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => {
              const actualIndex = startIndex + rowIndex;
              return (
                <tr
                  key={actualIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors h-12 table-body-row hover:bg-theme-surface ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${
                    selectedRows.has(actualIndex)
                      ? 'bg-theme-surface/50 border-l-2 border-brand-teal-500'
                      : ''
                  }`}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(actualIndex)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectRow(actualIndex);
                        }}
                        className="w-4 h-4 rounded table-checkbox"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-[14px] table-body-cell">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 table-pagination border-t border-theme-border bg-theme-surface">
          <span className="text-[13px] table-pagination-info">
            Showing <span className="font-medium table-pagination-text">{startIndex + 1}</span> to{' '}{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} results
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="!w-auto"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-[14px] table-pagination-text">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="!w-auto"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
