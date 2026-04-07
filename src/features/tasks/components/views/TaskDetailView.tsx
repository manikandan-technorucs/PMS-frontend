import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { Badge } from '@/components/data-display/Badge';
import { Card } from '@/components/layout/Card';
import { DataTable } from '@/components/data-display/DataTable';
import { PersonRow } from '@/components/data-display/PersonRow';
import { EmptyState } from '@/components/data-display/EmptyState';
import { StatCardProps } from '@/components/data-display/StatCard';
import { EntityDetailTemplate } from '@/components/layout/EntityDetailTemplate';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { DetailViewSkeleton } from '@/components/feedback/Skeleton/DetailViewSkeleton';
import { ArrowLeft, Edit, CheckCircle, Hash, FolderKanban, Calendar, Clock, Layers, AlertCircle, TrendingUp, History } from 'lucide-react';
import { useTask } from '@/features/tasks/hooks/useTasks';
import { timelogsService } from '@/api/services/timelogs.service';

const TABS = [{ label: 'Overview' }, { label: 'Time Logs' }];

export function TaskDetailView() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'Overview';

    const id = parseInt(taskId ?? '0', 10);

    const { data: task, isLoading } = useTask(id);

    const { data: timelogs = [] } = useQuery({
        queryKey: ['timelogs-task', id],
        queryFn: () => timelogsService.getTimelogs(0, 2000),
        enabled: !!id,
    });

    const taskTimelogs = (timelogs as any[]).filter((l) => l.task_id === id);
    const actualHours = taskTimelogs.reduce((sum, l) => sum + (l.hours ?? 0), 0);

    if (isLoading) return (
        <PageLayout>
            <DetailViewSkeleton />
        </PageLayout>
    );

    if (!task) return <PageSpinner fullPage label="Task not found" />;

    const progressPercent = task.progress ?? 0;
    const estimatedHours = task.estimated_hours ?? 0;
    const timeUtilization = estimatedHours > 0 
        ? Math.min(100, Math.round((actualHours / estimatedHours) * 100)) 
        : 0;

    const metadataNodes = [
        <span key="id" className="flex items-center gap-1.5"><Hash className="w-4 h-4 opacity-70" /> {task.public_id || `TSK-${task.id}`}</span>,
        <span key="project" className="flex items-center gap-1.5"><FolderKanban className="w-4 h-4 opacity-70" /> {task.project?.name || 'General Task'}</span>,
        <span key="due" className="flex items-center gap-1.5"><Calendar className="w-4 h-4 opacity-70" /> Due {task.due_date || 'No deadline'}</span>
    ];

    const statsProps: StatCardProps[] = [
        { label: 'Hours Logged', value: `${actualHours.toFixed(1)}h`, icon: <Clock size={18} strokeWidth={2}/>, accentVariant: 'teal' },
        { label: 'Estimate', value: `${estimatedHours}h`, icon: <Layers size={18} strokeWidth={2}/>, accentVariant: 'violet' },
        { label: 'Priority', value: task.priority?.name || 'Normal', icon: <AlertCircle size={18} strokeWidth={2}/>, accentVariant: 'amber' },
        { label: 'Progress', value: `${progressPercent}%`, icon: <TrendingUp size={18} strokeWidth={2}/>, accentVariant: 'teal' },
    ];

    return (
        <PageLayout
            title={task.title}
            subtitle={task.public_id || `TSK-${task.id}`}
            isFullHeight
            showBackButton
            backPath={task.project_id ? `/projects/${task.project_id}?tab=Tasks` : '/tasks'}
            actions={
                <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" onClick={() => navigate(`/tasks/${taskId}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Task
                    </Button>
                </div>
            }
        >
            <EntityDetailTemplate
                title={task.title}
                icon={<CheckCircle className="w-6 h-6 text-slate-900" />}
                badges={[<Badge key="status" value={task.status?.name || 'Pending'} variant="status" />]}
                metadata={metadataNodes}
                progressPercent={progressPercent}
                users={task.assignee ? [task.assignee] : []}
                tabs={TABS}
                stats={statsProps}
            >
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {}
                        <div className="lg:col-span-8 space-y-6">
                            <Card glass={true} className="flex flex-col p-0">
                                <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50">
                                    <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Description</h3>
                                </div>
                                <div className="p-6">
                                    {task.description ? (
                                        <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                            {task.description}
                                        </p>
                                    ) : (
                                        <EmptyState 
                                            icon={<Layers className="w-8 h-8 text-slate-300 dark:text-slate-600" />} 
                                            title="No descriptive details" 
                                            description="This task currently has no added description." 
                                        />
                                    )}
                                </div>
                            </Card>
                        </div>

                        {}
                        <div className="lg:col-span-4 space-y-6">
                            <Card glass={true} className="p-0">
                                <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50">
                                    <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Resource Assignment</h3>
                                </div>
                                <div className="p-5">
                                    <PersonRow
                                        label="Assignee"
                                        firstName={task.assignee?.first_name}
                                        lastName={task.assignee?.last_name}
                                        fallback="Unassigned"
                                    />
                                </div>
                            </Card>

                            <Card glass={true} className="p-0">
                                <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50">
                                    <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Time Utilization</h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Burn Rate</span>
                                            <span className="text-[13px] font-black text-slate-800 dark:text-slate-200">{timeUtilization}%</span>
                                        </div>
                                        <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 overflow-hidden border border-slate-200/20">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${timeUtilization > 100 ? 'bg-rose-500' : 'bg-brand-teal-500'}`}
                                                style={{ width: `${Math.min(100, timeUtilization)}%` }} 
                                            />
                                        </div>
                                        <p className="mt-3 text-[12px] font-medium text-slate-500 flex justify-between">
                                            <span>Logged: <b>{actualHours.toFixed(1)}h</b></span>
                                            <span>Planned: <b>{estimatedHours}h</b></span>
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-400">Time Status</p>
                                            <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                                                {timeUtilization > 100 ? 'Over estimated time' : 'Within budget'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card glass={true} className="p-0">
                                <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50">
                                    <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Task Metadata</h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    {[
                                        { icon: <Calendar className="w-4 h-4 text-slate-400" />, label: 'Start Date', value: task.start_date || 'Not set' },
                                        { icon: <Calendar className="w-4 h-4 text-slate-400" />, label: 'Due Date', value: task.due_date || 'Not set' },
                                        { icon: <Hash className="w-4 h-4 text-slate-400" />, label: 'Public ID', value: task.public_id || `TSK-${task.id}` },
                                    ].map(({ icon, label, value }) => (
                                        <div key={label} className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/30">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                                {icon}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{label}</p>
                                                <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'Time Logs' && (
                    <Card glass={true} className="p-0">
                        <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-brand-teal-500" />
                                <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Recent Time Logs</h3>
                            </div>
                        </div>
                        <div className="p-0">
                            {taskTimelogs.length > 0 ? (
                                <DataTable
                                    data={taskTimelogs}
                                    columns={[
                                        { key: 'date', header: 'Date', render: (val) => <span className="font-bold text-slate-700 dark:text-slate-300">{new Date(val as string).toLocaleDateString()}</span> },
                                        { key: 'user', header: 'User', render: (val) => <PersonRow firstName={val?.first_name} lastName={val?.last_name} label="" /> },
                                        { key: 'hours', header: 'Time', render: (val) => <span className="font-black text-brand-teal-600">{Number(val).toFixed(2)}h</span> },
                                        { key: 'notes', header: 'Notes', render: (val) => <span className="text-slate-500 truncate max-w-xs block">{val as string || '-'}</span> },
                                    ]}
                                    itemsPerPage={10}
                                />
                            ) : (
                                <EmptyState 
                                    icon={<Clock className="w-10 h-10 text-slate-200" />} 
                                    title="No time logged" 
                                    description="No time has been logged for this task yet." 
                                />
                            )}
                        </div>
                    </Card>
                )}
            </EntityDetailTemplate>
        </PageLayout>
    );
}
