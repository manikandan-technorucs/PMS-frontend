import React from 'react';
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable';
import { Badge } from '@/components/data-display/Badge';
import { Calendar, Clock } from 'lucide-react';
import { Card } from '@/components/layout/Card';
import { Task } from '@/api/services/tasks.service';
import { TimeLog } from '@/api/services/timelogs.service';
import { format, differenceInDays, isBefore, startOfToday } from 'date-fns';

interface TaskListTableProps {
  tasks: Task[];
  timelogs?: TimeLog[];
  onRowClick: (task: Task) => void;
  loading?: boolean;
}

export function TaskListTable({ tasks, timelogs = [], onRowClick, loading }: TaskListTableProps) {
  const columns: DataTableColumn<Task>[] = [
    {
      key: 'public_id',
      header: 'ID',
      sortable: true,
      render: (_, row) => (
        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg font-bold shadow-sm whitespace-nowrap">
          {row.public_id || `TSK-${row.id}`}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Task Overview',
      sortable: true,
      render: (_, row) => (
        <div className="flex flex-col py-0.5">
          <p className="font-bold text-[14px] text-slate-800 dark:text-slate-100 group-hover:text-brand-teal-600 transition-colors">
            {row.title}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[250px]">
            {row.project?.name || 'Local Scope Task'}
          </span>
        </div>
      ),
    },
    {
      key: 'assignee',
      header: 'Assigned To',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.assignee ? (
            <>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 border border-white/20">
                {row.assignee.first_name?.[0]}{row.assignee.last_name?.[0]}
              </div>
              <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                {row.assignee.first_name} {row.assignee.last_name}
              </span>
            </>
          ) : (
            <span className="text-slate-300 dark:text-slate-700 text-[12px] italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, row) => <Badge value={row.status?.name || 'Pending'} variant="status" />,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (_, row) => <Badge value={row.priority?.name || 'Normal'} variant="priority" />,
    },
    {
      key: 'hours',
      header: 'Logged',
      render: (_, row) => {
        const actual = timelogs.filter(l => l.task_id === row.id).reduce((s, l) => s + (l.hours || 0), 0);
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-bold text-slate-700 dark:text-slate-200 text-[13px]">{actual.toFixed(1)}h</span>
            <span className="text-slate-400 text-[11px] font-medium">/ {row.estimated_hours || 0}h</span>
          </div>
        );
      },
    },
    {
      key: 'due_date',
      header: 'Deadline',
      sortable: true,
      render: (_, row) => {
        const dateStr = row.due_date || row.end_date;
        if (!dateStr) return <span className="text-slate-400 text-[13px]">—</span>;
        
        let dDate;
        try {
          dDate = new Date(dateStr);
          if (isNaN(dDate.getTime())) throw new Error();
        } catch (e) {
          return <span className="text-slate-400 text-[13px]">{dateStr}</span>;
        }

        const today = startOfToday();
        const isOverdue = isBefore(dDate, today) && row.status?.name !== 'Completed';
        const days = Math.abs(differenceInDays(dDate, today));

        return (
          <div className="flex flex-col leading-tight whitespace-nowrap">
            <span className="text-[12px] text-slate-700 dark:text-slate-300 font-semibold">{format(dDate, 'dd MMM yyyy')}</span>
            <span className={`text-[11px] font-bold ${isOverdue ? 'text-rose-500' : 'text-emerald-600'}`}>
              {isOverdue ? `${days}d overdue` : `${days}d left`}
            </span>
          </div>
        );
      },
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (_, row) => {
        const pct = row.progress || 0;
        return (
          <div className="flex items-center gap-2.5 min-w-[100px]">
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/20">
              <div className="h-full bg-brand-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] font-bold text-slate-500 tabular-nums w-8 text-right">{pct}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <Card noPadding hoverEffect={false} className="border-slate-100 dark:border-slate-800">
      <DataTable
        columns={columns}
        data={tasks}
        selectable
        onRowClick={onRowClick}
        loading={loading}
        itemsPerPage={15}
      />
    </Card>
  );
}
