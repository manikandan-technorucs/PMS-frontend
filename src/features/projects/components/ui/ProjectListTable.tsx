import React from 'react';
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable';
import { Badge } from '@/components/data-display/Badge';
import { FolderKanban, Calendar } from 'lucide-react';
import { Card } from '@/components/layout/Card';
import { Project } from '@/features/projects/api/projects.api';

interface ProjectListTableProps {
  projects: Project[];
  onRowClick: (project: Project) => void;
}

export function ProjectListTable({ projects, onRowClick }: ProjectListTableProps) {
  const columns: DataTableColumn<Project>[] = [
    {
      key: 'public_id',
      header: 'ID',
      sortable: true,
      render: (_, row) => (
        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg font-bold">
          {row.public_id || `PRJ-${row.id}`}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Project Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0 border border-teal-100 dark:border-teal-800/40">
            <FolderKanban className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-[14px] text-slate-800 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
              {row.name}
            </p>
            {row.client && <p className="text-[11px] text-slate-400 font-medium">{row.client}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, row) => <Badge value={row.status?.name || 'Unknown'} variant="status" />,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (_, row) => <Badge value={row.priority?.name || 'Unknown'} variant="priority" />,
    },
    {
      key: 'manager',
      header: 'Manager',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.manager ? (
            <>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-[9px] font-black text-white flex-shrink-0">
                {row.manager.first_name?.[0]}
                {row.manager.last_name?.[0]}
              </div>
              <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                {row.manager.first_name} {row.manager.last_name}
              </span>
            </>
          ) : (
            <span className="text-slate-400 text-[13px] italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'start_date',
      header: 'Start',
      render: (_, row) => (
        <div className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-400">
          <Calendar className="w-3 h-3 opacity-50" />
          {row.start_date || '—'}
        </div>
      ),
    },
    {
      key: 'end_date',
      header: 'Deadline',
      render: (_, row) => {
        if (!row.end_date) return <span className="text-slate-400 text-[12px]">—</span>;
        const diff = new Date(row.end_date).getTime() - Date.now();
        const days = Math.ceil(diff / 86400000);
        const overdue = days < 0;
        return (
          <div className="flex flex-col">
            <span className="text-[12px] text-slate-700 dark:text-slate-300 font-semibold">{row.end_date}</span>
            <span className={`text-[11px] font-bold ${overdue ? 'text-red-500' : 'text-teal-600'}`}>
              {overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <Card noPadding hoverEffect={false}>
      <DataTable
        columns={columns}
        data={projects}
        selectable
        onRowClick={onRowClick}
        itemsPerPage={12}
      />
    </Card>
  );
}
