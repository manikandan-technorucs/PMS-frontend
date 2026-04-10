import React from 'react';
import { PMSDataTable } from '@/components/data-display/PMSDataTable';
import { ProgressBar } from 'primereact/progressbar';
import { Task } from '@/api/services/tasks.service';

interface TaskListTableProps {
  tasks: Task[];
  onRowClick: (task: Task) => void;
  projectId?: number;
  
  timelogs?: any[];
  loading?: boolean;
}

const taskColumns = [
    { field: 'public_id' as const, header: 'ID', sortable: true, filterable: true, width: '110px' },
    { field: 'task_name' as const, header: 'Task Name', sortable: true, filterable: true },
    { field: 'project' as const, header: 'Project', body: (r: any) => r.project?.name ?? '—' },
    { field: 'associated_team' as const, header: 'Associated Team', body: (r: any) => r.team_name ?? '—' },
    { field: 'owner' as const, header: 'Owner', body: (r: any) => r.single_owner ? `${r.single_owner.first_name} ${r.single_owner.last_name}` : '—' },
    { field: 'status' as const, header: 'Status', sortable: true, filterable: true, body: (r: any) => r.status ?? '—' },
    { field: 'tags' as const, header: 'Tags', body: (r: any) => r.tags ?? '—' },
    { field: 'start_date' as const, header: 'Start Date', sortable: true },
    { field: 'due_date' as const, header: 'Due Date', sortable: true },
    { field: 'duration' as const, header: 'Duration', body: (r: any) => r.duration ? `${r.duration}d` : '—' },
    { field: 'priority' as const, header: 'Priority', sortable: true, filterable: true, body: (r: any) => r.priority ?? '—' },
    { field: 'created_by' as const, header: 'Created By', body: (r: any) => r.creator ? `${r.creator.first_name} ${r.creator.last_name}` : '—' },
    { field: 'completion_percentage' as const, header: 'Completion %', body: (r: any) => (
        <div className="flex items-center gap-2" style={{ minWidth: 100 }}>
            <span className="text-xs font-bold w-8">{r.completion_percentage ?? 0}%</span>
            <ProgressBar value={r.completion_percentage ?? 0} showValue={false} style={{ height: '6px', flex: 1 }} />
        </div>
    )},
    { field: 'completion_date' as const, header: 'Completion Date', sortable: true },
    { field: 'work_hours' as const, header: 'Work Hours (P)', sortable: true, body: (r: any) => r.work_hours ?? 0 },
    { field: 'timelog_total' as const, header: 'Timelog Total (T)', sortable: true, body: (r: any) => r.timelog_total ?? 0 },
    { field: 'difference' as const, header: 'Difference (P-T)', sortable: true, body: (r: any) => {
        const d = r.difference ?? 0;
        return <span className={`font-bold text-sm ${d < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{d}</span>;
    }},
    { field: 'billing_type' as const, header: 'Billing Type', body: (r: any) => r.billing_type ?? '—' },
];

export function TaskListTable({ tasks, onRowClick, loading }: TaskListTableProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-[var(--shadow-premium)] overflow-hidden relative">
      <PMSDataTable
        columns={taskColumns}
        data={tasks}
        dataKey="id"
        filterDisplay="menu"
        loading={loading}
        onRowClick={(r: any) => onRowClick(r as Task)}
        emptyMessage="No tasks found."
      />
    </div>
  );
}

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
    <div className="flex-1 flex flex-col min-h-0 h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-[var(--shadow-premium)] overflow-hidden relative">
      <DataTable
        columns={columns}
        data={tasks}
        selectable
        onRowClick={onRowClick}
        loading={loading}
        itemsPerPage={15}
      />
    </div>
  );
}
