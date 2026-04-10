import React from 'react';
import { Issue } from '../../api/issues.api';
import { PMSDataTable } from '@/components/data-display/PMSDataTable';
import { Badge } from '@/components/data-display/Badge';

interface IssueListTableProps {
  issues: Issue[];
  onRowClick: (issue: Issue) => void;
  
  timelogs?: any[];
  totalRecords?: number;
  lazyParams?: any;
  onLazyLoad?: (params: any) => void;
}

const issueColumns = [
    { field: 'public_id' as const, header: 'ID', sortable: true, filterable: true, width: '110px' },
    { field: 'bug_name' as const, header: 'Bug Name', sortable: true, filterable: true },
    { field: 'project' as const, header: 'Project', filterable: true, body: (r: any) => r.project?.name ?? '—' },
    { field: 'reporter' as const, header: 'Reporter', body: (r: any) => r.reporter ? `${r.reporter.first_name} ${r.reporter.last_name}` : '—' },
    { field: 'created_at' as const, header: 'Created Time', sortable: true, body: (r: any) => r.created_at ? new Date(r.created_at).toLocaleDateString() : '—' },
    { field: 'associated_team' as const, header: 'Associated Team', body: (r: any) => r.team?.name ?? '—' },
    { field: 'assignee' as const, header: 'Assignee', filterable: true, body: (r: any) => r.assignee ? `${r.assignee.first_name} ${r.assignee.last_name}` : '—' },
    { field: 'tags' as const, header: 'Tags', body: (r: any) => r.tags ?? '—' },
    { field: 'last_closed_time' as const, header: 'Last Closed Time', body: (r: any) => r.last_closed_time ? new Date(r.last_closed_time).toLocaleString() : '—' },
    { field: 'last_modified_time' as const, header: 'Last Modified Time', body: (r: any) => r.updated_at ? new Date(r.updated_at).toLocaleDateString() : '—' },
    { field: 'due_date' as const, header: 'Due Date', sortable: true },
    { field: 'status' as const, header: 'Status', sortable: true, filterable: true, body: (r: any) => r.status ?? '—' },
    { field: 'severity' as const, header: 'Severity', sortable: true, body: (r: any) => (
        <Badge label={r.severity ?? '—'} variant="neutral" />
    )},
    { field: 'module' as const, header: 'Module', body: (r: any) => r.module ?? '—' },
    { field: 'classification' as const, header: 'Classification', filterable: true },
    { field: 'reproducible_flag' as const, header: 'Reproducible Flag', body: (r: any) => r.reproducible_flag ? 'Yes' : 'No' },
];

export function IssueListTable({ issues, onRowClick }: IssueListTableProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-[var(--shadow-premium)] overflow-hidden relative">
      <PMSDataTable
        columns={issueColumns}
        data={issues}
        dataKey="id"
        filterDisplay="menu"
        onRowClick={(r: any) => onRowClick(r as Issue)}
        emptyMessage="No bugs reported."
      />
    </div>
  );
}

