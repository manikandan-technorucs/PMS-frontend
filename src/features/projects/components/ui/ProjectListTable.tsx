import React from 'react';
import { Badge } from '@/components/data-display/Badge';
import { PMSDataTable } from '@/components/data-display/PMSDataTable';
import { Project } from '@/features/projects/api/projects.api';

interface ProjectListTableProps {
  projects: Project[];
  onRowClick: (project: Project) => void;
}

const projectColumns = [
    { field: 'public_id' as const, header: 'ID', sortable: true, filterable: true, width: '100px' },
    { field: 'project_name' as const, header: 'Project Name', sortable: true, filterable: true, body: (r: any) => r.project_name || r.name },
    { field: 'owner' as const, header: 'Owner', body: (r: any) => r.owner ? `${r.owner.first_name} ${r.owner.last_name}` : '—' },
    { field: 'status' as const, header: 'Status', sortable: true, body: (r: any) => r.status?.name ?? '—' },
    { field: 'tasks_count' as const, header: 'Tasks', body: (r: any) => r.tasks?.length ?? 0 },
    { field: 'milestones_count' as const, header: 'Milestones', body: (r: any) => r.milestones?.length ?? 0 },
    { field: 'bugs_count' as const, header: 'Bugs', body: (r: any) => r.issues?.length ?? 0 },
    { field: 'start_date' as const, header: 'Start Date', sortable: true, body: (r: any) => r.expected_start_date ?? r.start_date },
    { field: 'end_date' as const, header: 'End Date', sortable: true, body: (r: any) => r.expected_end_date ?? r.end_date },
    { field: 'tags' as const, header: 'Tags', body: (r: any) => r.tags ?? '—' }
];

export function ProjectListTable({ projects, onRowClick }: ProjectListTableProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-[var(--shadow-premium)] overflow-hidden relative">
      <PMSDataTable
        columns={projectColumns}
        data={projects}
        dataKey="id"
        filterDisplay="menu"
        onRowClick={(r: any) => onRowClick(r as Project)}
        emptyMessage="No projects available."
      />
    </div>
  );
}
