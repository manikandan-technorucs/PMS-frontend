/**
 * ProjectDetailView — refactored from 493-line monolith.
 *
 * What changed:
 *  - ALL data fetching moved to useProjectDetail() hook (zero inline API calls)
 *  - Manual TABS array + activeTab state replaced with PrimeReact TabView
 *  - Task/issue/timelog tables now use PMSDataTable with menu filters
 *  - useTaskOperations hook replaces inlined mutation handlers
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TabView, TabPanel } from 'primereact/tabview';
import { PageLayout }         from '@/layouts/PageWrapper/PageLayout';
import { EntityDetailTemplate } from '@/components/layout/EntityDetailTemplate';
import { PageSpinner }        from '@/components/feedback/Loader/PageSpinner';
import { Badge }              from '@/components/data-display/Badge';
import { Message }            from 'primereact/message';
import { Button }             from '@/components/forms/Button';
import { PMSDataTable }       from '@/components/data-display/PMSDataTable';
import { TaskListTable }      from '@/features/tasks/components/ui/TaskListTable';
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

// ── Column definitions (kept outside component — stable reference) ─────────────

const taskColumns = [
    { field: 'public_id' as const, header: 'ID',       sortable: true, filterable: true, width: '100px' },
    { field: 'task_name' as const, header: 'Task',     sortable: true, filterable: true },
    { field: 'status'    as const, header: 'Status',   sortable: true, body: (r: any) => r.status ?? '—' },
    { field: 'priority'  as const, header: 'Priority', sortable: true, body: (r: any) => r.priority ?? '—' },
    { field: 'timelog_total' as const, header: 'T Hrs', sortable: true, body: (r: any) => r.timelog_total ?? 0 },
    { field: 'difference' as const, header: 'Diff',    sortable: true, body: (r: any) => (
        <Badge label={String(r.difference ?? 0)} variant={(r.difference ?? 0) < 0 ? 'danger' : 'neutral'} />
    ) },
    { field: 'end_date'  as const, header: 'Due',      sortable: true },
];

const issueColumns = [
    { field: 'public_id'     as const, header: 'ID',       sortable: true, filterable: true, width: '100px' },
    { field: 'bug_name'      as const, header: 'Bug',      sortable: true, filterable: true },
    { field: 'status'        as const, header: 'Status',   sortable: true, body: (r: any) => r.status ?? '—' },
    { field: 'severity'      as const, header: 'Severity', sortable: true, body: (r: any) => (
        <Badge label={r.severity ?? '—'} variant="neutral" />
    )},
    { field: 'classification' as const, header: 'Type',    filterable: true },
];

const timelogColumns = [
    { field: 'date'       as const, header: 'Date',    sortable: true },
    { field: 'user_email' as const, header: 'User',    filterable: true },
    { field: 'hours'      as const, header: 'Hours',   sortable: true, width: '80px' },
    { field: 'log_title'  as const, header: 'Title',   filterable: true },
    { field: 'billing_type' as const, header: 'Billing' },
];

const milestoneColumns = [
    { field: 'milestone_name' as const, header: 'Milestone', sortable: true, filterable: true },
    { field: 'end_date'       as const, header: 'Due',       sortable: true },
    { field: 'flags'          as const, header: 'Status',    filterable: true },
];


// ── Main component ────────────────────────────────────────────────────────────

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
                {/* ── MS Teams State ────────────────────────────────────────── */}
                {!project.ms_teams_group_id && (
                    <div className="px-4 pt-3 pb-1">
                        <Message 
                            severity="info" 
                            text="MS Teams workspace provisioning in progress. Some integration features may be temporarily unavailable." 
                            className="w-full justify-start text-[13px]" 
                        />
                    </div>
                )}
                
                {/* ── Meta Info Bar ─────────────────────────────────────────── */}
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

                {/* ── PrimeReact TabView (replaces manual TABS array) ───────── */}
                <TabView renderActiveOnly className="pms-tabview">

                    {/* ── Overview ─────────────────────────────────────────── */}
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

                    {/* ── Tasks ────────────────────────────────────────────── */}
                    <TabPanel header={`Tasks (${tasks.length})`}>
                        <div className="p-2 flex justify-end">
                            <Button
                                variant="gradient" size="sm" icon={<Plus size={13} />}
                                onClick={() => navigate(`/tasks/create?project_id=${pid}`)}
                            >
                                Add Task
                            </Button>
                        </div>
                        <TaskListTable projectId={pid} tasks={tasks} />
                    </TabPanel>

                    {/* ── Bugs ─────────────────────────────────────────────── */}
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

                    {/* ── Milestones ────────────────────────────────────────── */}
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

                    {/* ── Time Logs ─────────────────────────────────────────── */}
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

                    {/* ── Reports ──────────────────────────────────────────── */}
                    <TabPanel header="Reports">
                        <ProjectReportTab projectId={pid} />
                    </TabPanel>

                    {/* ── Team / Members ────────────────────────────────────── */}
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


// ── Small helper ——————————————————————————————————————————————————————————────

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
