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

