import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { EntityDetailTemplate } from '@/components/layout/EntityDetailTemplate';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { Message } from 'primereact/message';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import { Button } from '@/components/forms/Button';
import { PMSDataTable } from '@/components/data-display/PMSDataTable';
import { ProjectReportTab } from '@/features/projects/components/ui/ProjectReportTab';
import { ProjectDashboardTab } from '@/features/projects/components/ui/ProjectDashboardTab';
import { ProjectDocumentsTab } from '@/features/projects/components/ui/ProjectDocumentsTab';
import { TaskListTable } from '@/features/tasks/components/ui/TaskListTable';
import { GraphUserMultiSelect } from '@/features/projects/components/ui/GraphUserMultiSelect';
import { useToast } from '@/providers/ToastContext';
import { useProjectDetail } from '@/features/projects/hooks/useProjectDetail';
import { useProjectActions } from '@/features/projects/hooks/useProjectActions';
import { tasklistsService, TaskList } from '@/api/services/tasklists.service';
import {
    Edit, Archive, Users, Plus, RefreshCw,
    Calendar, Building2, Hash, Timer, Tag as TagIcon,
    Briefcase, UserCircle, Target, Clock, AlertCircle, CheckSquare, Layers
} from 'lucide-react';

import { ProgressBar } from 'primereact/progressbar';

const TEAL = 'hsl(160 60% 45%)';
const TEAL_DIM = 'hsl(160 60% 45% / 0.12)';

const MasterBadge = ({ master }: { master?: { label: string; color?: string } | null }) => {
    if (!master) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{
                background: master.color ? `${master.color}22` : TEAL_DIM,
                color: master.color ?? TEAL,
                border: `1px solid ${master.color ?? TEAL}44`,
            }}
        >
            {master.label}
        </span>
    );
};

import { PropRow } from '@/components/data-display/PropRow';

const taskColumns = [
    { field: 'public_id' as const, header: 'ID', sortable: true, filterable: true, width: '90px' },
    { field: 'task_name' as const, header: 'Task Name', sortable: true, filterable: true },
    { field: 'owners' as const, header: 'Owner', body: (r: any) => r.owners?.length > 0 ? `${r.owners[0].first_name} ${r.owners[0].last_name}` : '—' },
    { field: 'status_master' as const, header: 'Status', sortable: true, body: (r: any) => <MasterBadge master={r.status_master} /> },
    { field: 'priority_master' as const, header: 'Priority', sortable: true, body: (r: any) => <MasterBadge master={r.priority_master} /> },
    {
        field: 'completion_percentage' as const, header: 'Comp %', body: (r: any) => (
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold w-8" style={{ color: TEAL }}>{r.completion_percentage ?? 0}%</span>
                <ProgressBar value={r.completion_percentage ?? 0} showValue={false} style={{ height: '5px', flex: 1 }} color={TEAL} />
            </div>
        )
    },
    { field: 'start_date' as const, header: 'Start Date', sortable: true },
    { field: 'due_date' as const, header: 'Due Date', sortable: true },
    { field: 'work_hours' as const, header: 'Est (P)', body: (r: any) => `${Number(r.work_hours ?? 0).toFixed(1)}h` },
    {
        field: 'timelog_total' as const, header: 'Log (T)', body: (r: any) =>
            <span style={{ color: TEAL, fontWeight: 600 }}>{Number(r.cached_timelog_total ?? 0).toFixed(1)}h</span>
    },
    {
        field: 'difference' as const, header: 'Diff', body: (r: any) => {
            const diff = Number(r.work_hours ?? 0) - Number(r.cached_timelog_total ?? 0);
            return <span style={{ color: diff < 0 ? '#ef4444' : '#64748b' }} className="font-mono text-xs">{diff.toFixed(1)}h</span>
        }
    },
    { field: 'billing_type' as const, header: 'Billing' },
];

const issueColumns = [
    { field: 'public_id' as const, header: 'ID', sortable: true, width: '90px' },
    { field: 'bug_name' as const, header: 'Bug Name', sortable: true, filterable: true },
    { field: 'status_master' as const, header: 'Status', body: (r: any) => <MasterBadge master={r.status_master} /> },
    { field: 'severity_master' as const, header: 'Severity', body: (r: any) => <MasterBadge master={r.severity_master} /> },
    { field: 'assignees' as const, header: 'Assignee', body: (r: any) => r.assignees?.length > 0 ? `${r.assignees[0].first_name} ${r.assignees[0].last_name}` : '—' },
    { field: 'reporter' as const, header: 'Reporter', body: (r: any) => r.reporter ? `${r.reporter.first_name} ${r.reporter.last_name}` : '—' },
    { field: 'due_date' as const, header: 'Target Date', sortable: true },
    { field: 'classification_master' as const, header: 'Classification', body: (r: any) => <MasterBadge master={r.classification_master} /> },
];

const milestoneColumns = [
    { field: 'milestone_name' as const, header: 'Milestone Name', sortable: true, filterable: true },
    { field: 'status_master' as const, header: 'Status', filterable: true, body: (r: any) => <MasterBadge master={r.status_master} /> },
    { field: 'completion_percentage' as const, header: '%', body: (r: any) => `${r.completion_percentage ?? 0}%` },
    { field: 'owner' as const, header: 'Owner', body: (r: any) => r.owner ? `${r.owner.first_name} ${r.owner.last_name}` : '—' },
    { field: 'start_date' as const, header: 'Start Date', sortable: true },
    { field: 'end_date' as const, header: 'End Date', sortable: true },
    { field: 'task_count' as const, header: 'Tasks' },
    { field: 'issue_count' as const, header: 'Bugs' }
];

const timelogColumns = [
    { field: 'date', header: 'Date', body: (r: any) => new Date(r.date).toLocaleDateString('en-GB') },
    { field: 'user', header: 'User', body: (r: any) => `${r.user?.first_name} ${r.user?.last_name}` },
    { field: 'hours', header: 'Hours', body: (r: any) => <span className="font-bold" style={{ color: TEAL }}>{r.hours}h</span> },
    { field: 'log_title', header: 'Title' },
    { field: 'billing_type', header: 'Billing' },
    { field: 'notes', header: 'Notes', body: (r: any) => <span className="italic text-xs text-muted">{r.description || r.notes}</span> }
];

export function ProjectDetailView() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showToast } = useToast();
    const pid = Number(projectId);
    const activeTab = searchParams.get('tab') || 'Dashboard';
    const [taskLists, setTaskLists] = useState<TaskList[]>([]);

    const { project, tasks, issues, timelogs, milestones, isLoading, refetchAll } =
        useProjectDetail(pid);

    const { updateProject, assignUser, removeUser } = useProjectActions();

    const handleArchive = async () => {
        await updateProject.mutateAsync({ id: pid, data: { is_archived: !project?.is_archived } });
        showToast('success', project?.is_archived ? 'Unarchived' : 'Archived', `Project ${project?.is_archived ? 'restored' : 'archived'}.`);
    };

    useEffect(() => {
        tasklistsService.getTaskLists()
            .then(setTaskLists)
            .catch(console.error);
    }, []);

    if (isLoading) return <PageSpinner fullPage />;
    if (!project) return <div className="p-8 text-center text-muted">Project not found.</div>;

    const tabs = [
        { label: 'Dashboard' },
        { label: 'Bugs' },
        { label: 'Tasks' },
        { label: 'Reports' },
        { label: 'Documents' },
        { label: 'Milestones' },
        { label: 'Timesheet' },
        { label: 'Users' }
    ];

    return (
        <PageLayout title={project.project_name} showBackButton backPath="/projects" isFullHeight>
            <EntityDetailTemplate
                title={project.project_name}
                subtitle={`${project.account_name} › ${project.customer_name}`}
                icon={<Briefcase size={20} />}
                color="emerald"
                badge={<MasterBadge master={project.status_master || (typeof project.status === 'string' ? { label: project.status } : project.status as any)} />}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} onClick={refetchAll} />
                        <Button variant="outline" size="sm" icon={<Archive size={14} />} onClick={handleArchive}>
                            {project.is_archived ? 'Unarchive' : 'Archive'}
                        </Button>
                        <Button variant="gradient" size="sm" icon={<Edit size={14} />} onClick={() => navigate(`/projects/${pid}/edit`)}>
                            Edit
                        </Button>
                    </div>
                }
                stats={[
                    { label: 'Tasks', value: project.task_count, color: TEAL, icon: <CheckSquare size={14} /> },
                    { label: 'Planning', value: tasks.filter(t => (t.status_master?.label || t.status_master?.name || '').toLowerCase() === 'planning').length, color: '#f59e0b', icon: <Clock size={14} /> },
                    { label: 'Bugs', value: project.issue_count, color: '#ef4444', icon: <AlertCircle size={14} /> },
                    { label: 'Logged', value: `${Number(project.actual_hours ?? 0).toFixed(1)}h`, color: '#8b5cf6', icon: <Clock size={14} /> },
                ]}
                tabs={tabs}
            >
                <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
                    { }
                    <div className="flex-1 min-w-0 space-y-6">
                        {!project.ms_teams_group_id && (
                            <Message
                                severity="info"
                                text="MS Teams workspace provisioning in progress."
                                className="w-full justify-start text-[13px] rounded-xl"
                            />
                        )}

                        {activeTab === 'Dashboard' && (
                            <ProjectDashboardTab project={project} tasks={tasks} issues={issues} timelogs={timelogs} milestones={milestones} />
                        )}

                        {activeTab === 'Bugs' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="text-sm font-bold">Reported Bugs ({issues.length})</h3>
                                    <Button variant="gradient" size="xs" icon={<Plus size={13} />} onClick={() => navigate(`/issues/create?project_id=${pid}`)}>New Bug</Button>
                                </div>
                                <PMSDataTable
                                    columns={issueColumns}
                                    data={issues}
                                    dataKey="id"
                                    filterDisplay="menu"
                                    onRowClick={(r) => navigate(`/issues/${r.id}`)}
                                />
                            </div>
                        )}

                        {activeTab === 'Tasks' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                    <h3 className="text-sm font-bold">Project Tasks ({tasks.length})</h3>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" size="xs" onClick={() => navigate(`/tasklists/create?project_id=${pid}`)} className="!px-3"><Layers size={13} className="mr-1.5" /> Add Task List</Button>
                                        <Button variant="gradient" size="xs" onClick={() => navigate(`/tasks/create?project_id=${pid}`)} className="!px-3"><Plus size={13} className="mr-1.5" /> Add Task</Button>
                                    </div>
                                </div>
                                <TaskListTable
                                    tasks={tasks}
                                    taskLists={taskLists}
                                    timelogs={timelogs}
                                    groupBy="tasklist"
                                    onRowClick={(r: any) => navigate(`/tasks/${r.id}`)}
                                />
                            </div>
                        )}

                        {activeTab === 'Reports' && (
                            <ProjectReportTab projectId={pid} project={project} tasks={tasks} timelogs={timelogs} issues={issues} />
                        )}

                        {activeTab === 'Documents' && (
                            <ProjectDocumentsTab projectId={pid} />
                        )}

                        {activeTab === 'Milestones' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                                <PMSDataTable
                                    columns={milestoneColumns}
                                    data={milestones}
                                    dataKey="id"
                                    filterDisplay="menu"
                                    onRowClick={(r: any) => navigate(`/milestones/${r.id}`)}
                                />
                            </div>
                        )}

                        {activeTab === 'Timesheet' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                                <PMSDataTable
                                    columns={timelogColumns}
                                    data={timelogs}
                                    dataKey="id"
                                    filterDisplay="menu"
                                />
                            </div>
                        )}

                        {activeTab === 'Users' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm min-h-[400px]">
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                        <Users size={16} /> Manage Project Team
                                    </h3>
                                    <GraphUserMultiSelect
                                        value={[]}
                                        onChange={(users: any[]) => {
                                            users.forEach(u => assignUser.mutate({
                                                projectId: pid,
                                                payload: { user_email: u.mail || u.email, project_profile: 'Member' }
                                            }));
                                        }}
                                        placeholder="Search organization users..."
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {project.team_members?.map(m => (
                                        <div key={m.user_id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    label={(m.user?.first_name?.[0] || '?').toUpperCase()}
                                                    shape="circle"
                                                    style={{ background: 'linear-gradient(135deg,#0CD1C3,#6366f1)', color: '#fff', fontSize: '12px', fontWeight: 700 }}
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate">{m.user?.first_name} {m.user?.last_name}</p>
                                                    <div className="flex gap-1.5 items-center mt-0.5">
                                                        <Tag value={m.project_profile} severity="info" rounded className="text-[9px] px-1.5 h-4" />
                                                        {m.is_owner && <Tag value="Owner" severity="warning" rounded className="text-[9px] px-1.5 h-4" />}
                                                    </div>
                                                </div>
                                            </div>
                                            {!m.is_owner && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeUser.mutate({ projectId: pid, userId: m.user_id })}
                                                    className="text-red-400 hover:text-red-500 hover:bg-red-50"
                                                >
                                                    ✕
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    { }
                    <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4 px-1">Detailed Info</h3>

                            <PropRow icon={<Hash size={13} />} label="Sync ID">
                                <span className="font-mono">{project.project_id_sync}</span>
                            </PropRow>

                            <PropRow icon={<Building2 size={13} />} label="Customer Account">
                                <span className="truncate">{project.customer_name}</span>
                            </PropRow>

                            <PropRow icon={<UserCircle size={13} />} label="Manager">
                                {project.project_manager ? `${project.project_manager.first_name} ${project.project_manager.last_name}` : '—'}
                            </PropRow>

                            <PropRow icon={<Target size={13} />} label="Delivery Head">
                                {project.delivery_head ? `${project.delivery_head.first_name} ${project.delivery_head.last_name}` : '—'}
                            </PropRow>

                            <PropRow icon={<Calendar size={13} />} label="Timeline">
                                <div className="flex flex-col gap-1.5 mt-1">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-400">Target Start:</span>
                                        <span className="font-semibold">{project.expected_start_date || '—'}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-400">Target End:</span>
                                        <span className="font-semibold">{project.expected_end_date || '—'}</span>
                                    </div>
                                </div>
                            </PropRow>

                            <PropRow icon={<Timer size={13} />} label="Effort Log">
                                <div className="flex flex-col gap-1.5 mt-1">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-400">Budgeted (P):</span>
                                        <span className="font-bold">{project.estimated_hours}h</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-400">Actual (T):</span>
                                        <span className="font-bold text-brand-teal-500">{project.actual_hours}h</span>
                                    </div>
                                    <ProgressBar
                                        value={Math.min(100, (Number(project.actual_hours) / (Number(project.estimated_hours) || 1)) * 100)}
                                        showValue={false}
                                        style={{ height: '4px' }}
                                        color={TEAL}
                                    />
                                </div>
                            </PropRow>

                            <PropRow icon={<AlertCircle size={13} />} label="Priority">
                                <MasterBadge master={project.priority_master || (typeof project.priority === 'string' ? { label: project.priority } : project.priority as any)} />
                            </PropRow>

                            <PropRow icon={<TagIcon size={13} />} label="Category">

                                {project.project_type || 'General'}
                            </PropRow>

                            <PropRow icon={<Briefcase size={13} />} label="Billing">
                                {project.billing_model}
                            </PropRow>

                            <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                                <Button
                                    variant="outline"
                                    className="w-full text-[12px] font-bold h-9"
                                    onClick={() => navigate(`/projects/${pid}/edit`)}
                                >
                                    <Edit size={12} className="mr-2" /> Modify details
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </EntityDetailTemplate>
        </PageLayout>
    );
}
