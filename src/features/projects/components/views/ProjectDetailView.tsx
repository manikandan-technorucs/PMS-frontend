

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TabView, TabPanel } from 'primereact/tabview';
import { PageLayout }         from '@/layouts/PageWrapper/PageLayout';
import { EntityDetailTemplate } from '@/components/layout/EntityDetailTemplate';
import { PageSpinner }        from '@/components/feedback/Loader/PageSpinner';
import { Badge }              from '@/components/data-display/Badge';
import { Message }            from 'primereact/message';
import { Avatar }             from 'primereact/avatar';
import { Tag }                from 'primereact/tag';
import { Tooltip }            from 'primereact/tooltip';
import { Button }             from '@/components/forms/Button';
import { PMSDataTable }       from '@/components/data-display/PMSDataTable';
import { ProjectReportTab }   from '@/features/projects/components/ui/ProjectReportTab';
import { GraphUserMultiSelect } from '@/features/projects/components/ui/GraphUserMultiSelect';
import { useToast }           from '@/providers/ToastContext';
import { useProjectDetail }   from '@/features/projects/hooks/useProjectDetail';
import { useProjectActions }  from '@/features/projects/hooks/useProjectActions';
import { useTaskOperations }  from '@/features/projects/hooks/useTaskOperations';
import {
    Edit, Archive, Users, Plus, RefreshCw,
    Calendar, Building2, Hash, Timer, Tag,
} from 'lucide-react';

import { ProgressBar }          from 'primereact/progressbar';

const taskColumns = [
    { field: 'public_id' as const, header: 'ID', sortable: true, filterable: true, width: '100px' },
    { field: 'task_name' as const, header: 'Task Name', sortable: true, filterable: true },
    { field: 'project' as const, header: 'Project', body: (r: any) => r.project?.name ?? '—' },
    { field: 'associated_team' as const, header: 'Associated Team', body: (r: any) => r.team_name ?? '—' },
    { field: 'owner' as const, header: 'Owner', body: (r: any) => r.owner ? `${r.owner.first_name} ${r.owner.last_name}` : '—' },
    { field: 'status' as const, header: 'Status', sortable: true, body: (r: any) => r.status ?? '—' },
    { field: 'tags' as const, header: 'Tags', body: (r: any) => r.tags ?? '—' },
    { field: 'start_date' as const, header: 'Start Date', sortable: true },
    { field: 'end_date' as const, header: 'Due Date', sortable: true },
    { field: 'duration' as const, header: 'Duration' },
    { field: 'priority' as const, header: 'Priority', sortable: true, body: (r: any) => r.priority ?? '—' },
    { field: 'created_by' as const, header: 'Created By', body: (r: any) => r.creator ? `${r.creator.first_name} ${r.creator.last_name}` : '—' },
    { field: 'completion_percentage' as const, header: 'Completion Percentage', body: (r: any) => (
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold w-8">{r.completion_percentage ?? 0}%</span>
            <ProgressBar value={r.completion_percentage ?? 0} showValue={false} style={{ height: '6px', flex: 1 }} />
        </div>
    )},
    { field: 'completion_date' as const, header: 'Completion Date' },
    { field: 'work_hours' as const, header: 'Work Hours (P)', sortable: true, body: (r: any) => r.work_hours ?? 0 },
    { field: 'timelog_total' as const, header: 'Timelog Total (T)', sortable: true, body: (r: any) => r.timelog_total ?? 0 },
    { field: 'difference' as const, header: 'Difference( P - T )', sortable: true, body: (r: any) => (
        <>
            <span className={`font-bold ${((r.difference ?? 0) < 0) ? 'text-red-500' : 'text-emerald-500'}`} data-pr-tooltip={`Planned: ${r.work_hours ?? 0}, Logged: ${r.timelog_total ?? 0}`}>
                {r.difference ?? 0}
            </span>
            <Tooltip target=".p-datatable-tbody > tr > td > span" />
        </>
    ) },
    { field: 'billing_type' as const, header: 'Billing Type' }
];

const issueColumns = [
    { field: 'public_id' as const, header: 'ID', sortable: true, filterable: true, width: '100px' },
    { field: 'bug_name' as const, header: 'Bug Name', sortable: true, filterable: true },
    { field: 'project' as const, header: 'Project', body: (r: any) => r.project?.name ?? '—' },
    { field: 'reporter' as const, header: 'Reporter', body: (r: any) => r.reporter ? `${r.reporter.first_name} ${r.reporter.last_name}` : '—' },
    { field: 'created_time' as const, header: 'Created Time', body: (r: any) => r.created_at ? new Date(r.created_at).toLocaleDateString() : '—' },
    { field: 'associated_team' as const, header: 'Associated Team', body: (r: any) => r.team?.name ?? '—' },
    { field: 'assignee' as const, header: 'Assignee', body: (r: any) => r.assignee ? `${r.assignee.first_name} ${r.assignee.last_name}` : '—' },
    { field: 'tags' as const, header: 'Tags', body: (r: any) => r.tags ?? '—' },
    { field: 'last_closed_time' as const, header: 'Last Closed Time' },
    { field: 'last_modified_time' as const, header: 'Last Modified Time', body: (r: any) => r.updated_at ? new Date(r.updated_at).toLocaleDateString() : '—' },
    { field: 'due_date' as const, header: 'Due Date', sortable: true },
    { field: 'status' as const, header: 'Status', sortable: true, body: (r: any) => r.status ?? '—' },
    { field: 'severity' as const, header: 'Severity', sortable: true, body: (r: any) => (
        <Badge label={r.severity ?? '—'} variant="neutral" />
    )},
    { field: 'module' as const, header: 'Module', body: (r: any) => r.module ?? '—' },
    { field: 'classification' as const, header: 'Classification', filterable: true },
    { field: 'reproducible_flag' as const, header: 'Reproducible Flag', body: (r: any) => r.reproducible_flag ? 'Yes' : 'No' }
];

const milestoneColumns = [
    { field: 'milestone_name' as const, header: 'Milestone Name', sortable: true, filterable: true },
    { field: 'project' as const, header: 'Project', body: (r: any) => r.project?.name ?? '—' },
    { field: 'completion_percentage' as const, header: '%', body: (r: any) => r.completion_percentage ? `${r.completion_percentage}%` : '0%' },
    { field: 'status' as const, header: 'Status', filterable: true },
    { field: 'owner' as const, header: 'Owner', body: (r: any) => r.owner ? `${r.owner.first_name} ${r.owner.last_name}` : '—' },
    { field: 'start_date' as const, header: 'Start Date', sortable: true },
    { field: 'end_date' as const, header: 'End Date', sortable: true },
    { field: 'tasks_count' as const, header: 'Tasks' },
    { field: 'bugs_count' as const, header: 'Bugs' }
];

const timelogColumns = [
    { field: 'public_id' as const, header: 'ID', sortable: true, width: '100px' },
    { field: 'log_title' as const, header: 'Log Title', filterable: true },
    { field: 'daily_log_hours' as const, header: 'Daily Log Hours', sortable: true },
    { field: 'time_period' as const, header: 'Time Period' },
    { field: 'user' as const, header: 'User', body: (r: any) => r.user ? `${r.user.first_name} ${r.user.last_name}` : '—' },
    { field: 'billing_type' as const, header: 'Billing Type' },
    { field: 'notes' as const, header: 'Notes' },
    { field: 'created_by' as const, header: 'Created By' }
];

const PORTAL_PROFILE_COLORS: Record<string, 'danger' | 'info' | 'success' | 'warning'> = {
    Admin: 'danger',
    Developer: 'info',
    User: 'success',
};

const userColumns = [
    { field: 'user_name' as const, header: 'User Name', body: (r: any) => {
        const fn = r.first_name ?? r.user?.first_name ?? '?';
        const ln = r.last_name  ?? r.user?.last_name  ?? '';
        return (
            <div className="flex items-center gap-2">
                <Avatar
                    label={`${fn[0]}${ln[0] ?? ''}`.toUpperCase()}
                    size="normal"
                    style={{ background: 'linear-gradient(135deg,#0CD1C3,#6366f1)', color: '#fff', fontWeight: 700, fontSize: 11 }}
                    shape="circle"
                />
                <span className="font-semibold text-sm">{fn} {ln}</span>
            </div>
        );
    }},
    { field: 'email' as const, header: 'Email ID', body: (r: any) => r.email ?? r.user?.email ?? '—' },
    { field: 'role' as const, header: 'Role', body: (r: any) => r.role?.name ?? '—' },
    { field: 'project_profile' as const, header: 'Project Profile', body: (r: any) => r.project_profile ?? '—' },
    { field: 'portal_profile' as const, header: 'Portal Profile', body: (r: any) => {
        const profile = r.portal_profile ?? '—';
        const severity = PORTAL_PROFILE_COLORS[profile] ?? 'warning';
        return <Tag value={profile} severity={severity} rounded />;
    }},
    { field: 'invitation_status' as const, header: 'Invitation Status', body: (r: any) => r.invitation_status ?? '—' }
];

export function ProjectDetailView() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate       = useNavigate();
    const { showToast }  = useToast();
    const pid            = Number(projectId);

    const { project, tasks, issues, timelogs, milestones, isLoading, refetchAll } =
        useProjectDetail(pid);

    const { updateProject, deleteProject } = useProjectActions();
    const { createTask } = useTaskOperations(pid);

    const handleArchive = async () => {
        await updateProject.mutateAsync({ id: pid, data: { is_archived: !project?.is_archived } });
        showToast('success', project?.is_archived ? 'Unarchived' : 'Archived', `Project ${project?.is_archived ? 'restored' : 'archived'}.`);
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this project? This cannot be undone.')) return;
        await deleteProject.mutateAsync(pid);
        navigate('/projects');
    };

    if (isLoading) return <PageSpinner fullPage />;
    if (!project)  return <div className="p-8 text-center text-muted">Project not found.</div>;

    const actions = (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost" size="sm" icon={<RefreshCw size={14} />}
                onClick={refetchAll}
                title="Refresh all data"
            />
            <Button
                variant="ghost" size="sm" icon={<Archive size={14} />}
                onClick={handleArchive}
            >
                {project.is_archived ? 'Unarchive' : 'Archive'}
            </Button>
            <Button
                variant="gradient" size="sm" icon={<Edit size={14} />}
                onClick={() => navigate(`/projects/${pid}/edit`)}
            >
                Edit
            </Button>
        </div>
    );

    return (
        <PageLayout title={project.project_name} showBackButton backPath="/projects">
            <EntityDetailTemplate
                title={project.project_name}
                subtitle={`${project.account_name} › ${project.customer_name}`}
                badge={project.status}
                actions={actions}
                stats={[
                    { label: 'Tasks',      value: tasks.length },
                    { label: 'Bugs',       value: issues.length },
                    { label: 'Hours',      value: String(project.actual_hours ?? 0) },
                    { label: 'Members',    value: project.users ? project.users.length : 0 },
                ]}
            >
                {}
                {!project.ms_teams_group_id && (
                    <div className="px-4 pt-3 pb-1">
                        <Message 
                            severity="info" 
                            text="MS Teams workspace provisioning in progress. Some integration features may be temporarily unavailable." 
                            className="w-full justify-start text-[13px]" 
                        />
                    </div>
                )}
                
                {}
                <div className="flex flex-wrap gap-4 px-1 py-3 mb-2 text-sm text-muted border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="flex items-center gap-1.5">
                        <Hash size={13} /><span className="font-mono">{project.project_id_sync}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Building2 size={13} />{project.account_name}
                    </span>
                    {project.start_date && (
                        <span className="flex items-center gap-1.5">
                            <Calendar size={13} />{project.start_date} → {project.end_date ?? '?'}
                        </span>
                    )}
                    {project.estimated_hours && (
                        <span className="flex items-center gap-1.5">
                            <Timer size={13} />{project.estimated_hours}h estimated
                        </span>
                    )}
                    {project.priority && (
                        <span className="flex items-center gap-1.5">
                            <Tag size={13} />{project.priority}
                        </span>
                    )}
                </div>

                {}
                <TabView renderActiveOnly className="pms-tabview">

                    {}
                    <TabPanel header="Overview">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            <InfoRow label="Project ID"     value={project.public_id} />
                            <InfoRow label="Account"        value={project.account_name} />
                            <InfoRow label="Customer"       value={project.customer_name} />
                            <InfoRow label="Sync ID"        value={project.project_id_sync} mono />
                            <InfoRow label="Billing Model"  value={project.billing_model} />
                            <InfoRow label="Project Type"   value={project.project_type} />
                            <InfoRow label="Manager"        value={project.project_manager ? `${project.project_manager.first_name} ${project.project_manager.last_name}` : '—'} />
                            <InfoRow label="Owner"          value={project.owner ? `${project.owner.first_name} ${project.owner.last_name}` : '—'} />
                            <InfoRow label="Delivery Head"  value={project.delivery_head ? `${project.delivery_head.first_name} ${project.delivery_head.last_name}` : '—'} />
                            <InfoRow label="Client"         value={project.client_name ?? '—'} />
                            <InfoRow label="Start Date"     value={project.expected_start_date ?? '—'} />
                            <InfoRow label="End Date"       value={project.expected_end_date ?? '—'} />
                            <InfoRow label="Est. Hours"     value={String(project.estimated_hours ?? '—')} />
                            <InfoRow label="Actual Hours"   value={String(project.actual_hours ?? '—')} />
                        </div>
                        {project.description && (
                            <p className="px-4 pb-4 text-sm text-muted">{project.description}</p>
                        )}
                    </TabPanel>

                    {}
                    <TabPanel header={`Tasks (${tasks.length})`}>
                        <div className="p-2 flex justify-end">
                            <Button
                                variant="gradient" size="sm" icon={<Plus size={13} />}
                                onClick={() => navigate(`/tasks/create?project_id=${pid}`)}
                            >
                                Add Task
                            </Button>
                        </div>
                        <PMSDataTable
                            columns={taskColumns}
                            data={tasks}
                            dataKey="id"
                            filterDisplay="menu"
                            onRowClick={(r) => navigate(`/tasks/${r.id}`)}
                            emptyMessage="No tasks scheduled."
                        />
                    </TabPanel>

                    {}
                    <TabPanel header={`Bugs (${issues.length})`}>
                        <div className="p-2 flex justify-end">
                            <Button
                                variant="gradient" size="sm" icon={<Plus size={13} />}
                                onClick={() => navigate(`/issues/create?project_id=${pid}`)}
                            >
                                Add Bug
                            </Button>
                        </div>
                        <PMSDataTable
                            columns={issueColumns}
                            data={issues}
                            dataKey="id"
                            filterDisplay="menu"
                            onRowClick={(r) => navigate(`/issues/${r.id}`)}
                            emptyMessage="No bugs reported."
                        />
                    </TabPanel>

                    {}
                    <TabPanel header={`Milestones (${milestones.length})`}>
                        <PMSDataTable
                            columns={milestoneColumns}
                            data={milestones}
                            dataKey="id"
                            filterDisplay="row"
                            onRowClick={(r: any) => navigate(`/milestones/${r.id}`)}
                            emptyMessage="No milestones set."
                        />
                    </TabPanel>

                    {}
                    <TabPanel header={`Time Logs (${timelogs.length})`}>
                        <PMSDataTable
                            columns={timelogColumns}
                            data={timelogs}
                            dataKey="id"
                            filterDisplay="menu"
                            emptyMessage="No time logs recorded."
                            forceVirtual={timelogs.length > 50}
                        />
                    </TabPanel>

                    {}
                    <TabPanel header="Reports">
                        <ProjectReportTab projectId={pid} />
                    </TabPanel>

                    {}
                    <TabPanel header={`Team (${project.users.length})`}>
                        <div className="p-4">
                            <div className="mb-4">
                                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Users size={14} />Add Members
                                </p>
                                <GraphUserMultiSelect
                                    value={[]}
                                    onChange={(users: any[]) => {
                                        users.forEach((u) =>
                                            useProjectActions().assignUser.mutate({
                                                projectId: pid,
                                                payload: { user_id: u.id, user_email: u.mail || u.email, display_name: u.displayName },
                                            })
                                        );
                                    }}
                                    placeholder="Search organization users..."
                                />
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                                {project.users.map((u) => (
                                    <div
                                        key={u.id}
                                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
                                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                                    >
                                        <span>{u.first_name} {u.last_name} <span className="text-muted ml-2">{u.email}</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabPanel>

                </TabView>
            </EntityDetailTemplate>
        </PageLayout>
    );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
            <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}
                  style={{ color: 'var(--text-primary)' }}>
                {value}
            </span>
        </div>
    );
}
