import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from 'primereact/avatar';
import { ProgressBar } from 'primereact/progressbar';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { EntityDetailTemplate } from '@/components/layout/EntityDetailTemplate';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { DetailViewSkeleton } from '@/components/feedback/Skeleton/DetailViewSkeleton';
import { Button } from '@/components/forms/Button';
import { useTask } from '@/features/tasks/hooks/useTasks';
import { timelogsService } from '@/api/services/timelogs.service';
import { format, parseISO, isValid } from 'date-fns';
import {
    Edit, CheckSquare, Calendar, Clock, Hash, FolderKanban,
    User2, Tag, Timer, Layers, AlertCircle, TrendingUp, Users
} from 'lucide-react';

const TEAL = 'hsl(160 60% 45%)';

const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
function fmtHHMM(h: number) { const hh = Math.floor(h); const mm = Math.round((h - hh) * 60); return `${pad(hh)}:${pad(mm)}`; }
function fmtDate(raw?: string | null) {
    if (!raw) return '—';
    try { const d = parseISO(raw); return isValid(d) ? format(d, 'MMM d, yyyy') : raw; } catch { return raw; }
}

import { PropRow, StatusBadge, PriorityBadge, PersonAvatar } from '@/components/core/DetailWidgets';

function formatHHMM(h: number) { const hh = Math.floor(h); const mm = Math.round((h - hh) * 60); return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`; }

export function TaskDetailView() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate   = useNavigate();
    const [searchParams] = useSearchParams();
    const id = parseInt(taskId ?? '0', 10);
    const activeTab = searchParams.get('tab') || 'Overview';

    const { data: task, isLoading } = useTask(id);
    const { data: timelogs = [] } = useQuery({
        queryKey: ['timelogs-task', id],
        queryFn:  () => timelogsService.getTimelogs(0, 2000),
        enabled: !!id,
    });

    if (isLoading) return <PageLayout><DetailViewSkeleton /></PageLayout>;
    if (!task)     return <PageSpinner fullPage label="Task not found" />;

    const taskTimelogs = (timelogs as any[]).filter(l => l.task_id === id);
    const actualHours  = taskTimelogs.reduce((s, l) => s + Number(l.daily_log_hours ?? l.hours ?? 0), 0);
    const estimated    = Number((task as any).work_hours ?? task.estimated_hours ?? 0);
    const diff         = estimated - actualHours;
    const pct          = task.completion_percentage ?? 0;

    const backPath = task.project_id ? `/projects/${task.project_id}?tab=Tasks` : '/tasks';
    const projectName = task.project?.project_name ?? task.project?.name ?? 'Independent Task';

    return (
        <PageLayout showBackButton backPath={backPath} isFullHeight>
            <EntityDetailTemplate
                title={task.task_name}
                subtitle={projectName}
                icon={<CheckSquare size={20} />}
                color="cyan"
                badge={<StatusBadge status={(task as any).status_master ?? task.status} />}
                actions={
                    <Button
                        variant="gradient" size="sm" icon={<Edit size={14} />}
                        onClick={() => navigate(`/tasks/${taskId}/edit`)}
                    >
                        Edit
                    </Button>
                }
                stats={[
                    { label: 'Planned (P)', value: `${estimated.toFixed(1)}h`, color: TEAL, icon: <Layers size={14} /> },
                    { label: 'Actual (T)',  value: `${actualHours.toFixed(1)}h`, color: '#8b5cf6', icon: <Clock size={14} /> },
                    { label: 'Difference',  value: `${diff.toFixed(1)}h`, color: diff < 0 ? '#ef4444' : '#22c55e', icon: <TrendingUp size={14} /> },
                    { label: 'Completion',   value: `${pct}%`, color: '#f59e0b', icon: <Timer size={14} /> },
                ]}
                tabs={[
                    { label: 'Overview' },
                    { label: 'Time Logs' }
                ]}
            >
                <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
                    {}
                    <div className="flex-1 space-y-6">
                        {activeTab === 'Overview' && (
                            <>
                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4">
                                        Description
                                    </h3>
                                    {task.description ? (
                                        <div className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                            {task.description}
                                        </div>
                                    ) : (
                                        <p className="text-sm italic text-slate-400">No description provided.</p>
                                    )}
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4">
                                        Progress Tracking
                                    </h3>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[13px] font-semibold">Overall Completion</span>
                                        <span className="text-[14px] font-bold" style={{ color: TEAL }}>{pct}%</span>
                                    </div>
                                    <ProgressBar value={pct} showValue={false} style={{ height: '8px' }} color={TEAL} />
                                </div>
                            </>
                        )}

                        {activeTab === 'Time Logs' && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <h3 className="text-[14px] font-bold flex items-center gap-2">
                                        <Clock size={16} /> Time Log Entries
                                    </h3>
                                    <span className="text-[13px] font-bold px-3 py-1 rounded-full" style={{ background: `${TEAL}12`, color: TEAL }}>
                                        Total: {actualHours.toFixed(2)}h
                                    </span>
                                </div>
                                {taskTimelogs.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400">
                                        <Clock size={40} className="mx-auto mb-3 opacity-20" />
                                        <p>No time logs yet for this task.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-[13px]">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                                    <th className="text-left px-6 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Date</th>
                                                    <th className="text-left px-6 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">User</th>
                                                    <th className="text-left px-6 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Hours</th>
                                                    <th className="text-left px-6 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                                {taskTimelogs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-6 py-4 font-medium">{fmtDate(log.date)}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar label={log.user?.first_name?.[0]} size="small" shape="circle" />
                                                                <span>{log.user?.first_name} {log.user?.last_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-bold" style={{ color: TEAL }}>{Number(log.daily_log_hours ?? log.hours ?? 0).toFixed(2)}h</td>
                                                        <td className="px-6 py-4 text-slate-500 italic">{log.description || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {}
                    <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4 px-1">
                                Task Properties
                            </h3>
                            
                            <PropRow icon={<Hash size={13} />} label="Task ID">
                                <span className="font-mono">{task.public_id}</span>
                            </PropRow>

                            <PropRow icon={<TrendingUp size={13} />} label="Priority">
                                <PriorityBadge priority={(task as any).priority_master ?? task.priority} />
                            </PropRow>

                            <PropRow icon={<User2 size={13} />} label="Primary Assigned To">
                                <PersonAvatar person={(task as any).single_owner ?? task.assignee} />
                            </PropRow>

                            <PropRow icon={<Users size={13} />} label="Created By">
                                <PersonAvatar person={(task as any).creator} />
                            </PropRow>

                            <PropRow icon={<Calendar size={13} />} label="Duration Plan">
                                <div className="flex flex-col gap-1">
                                    <div className="text-[12px] flex justify-between">
                                        <span className="text-slate-400">Start:</span>
                                        <span>{fmtDate(task.start_date)}</span>
                                    </div>
                                    <div className="text-[12px] flex justify-between">
                                        <span className="text-slate-400">Due:</span>
                                        <span>{fmtDate(task.due_date ?? (task as any).end_date)}</span>
                                    </div>
                                </div>
                            </PropRow>

                            {task.milestone && (
                                <PropRow icon={<Layers size={13} />} label="Milestone">
                                    {(task.milestone as any).milestone_name ?? (task.milestone as any).name}
                                </PropRow>
                            )}

                            <PropRow icon={<Tag size={13} />} label="Tags / Labels">
                                {task.tags ? (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {task.tags.split(',').map((t: string, i: number) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold">
                                                {t.trim()}
                                            </span>
                                        ))}
                                    </div>
                                ) : '—'}
                            </PropRow>

                            <PropRow icon={<Timer size={13} />} label="Billing Type">
                                <span className={task.billing_type === 'Non-Billable' ? 'text-red-400' : 'text-emerald-500'}>
                                    {task.billing_type || 'Billable'}
                                </span>
                            </PropRow>

                            <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                                <Button
                                    variant="outline"
                                    className="w-full text-[12px] font-bold h-9"
                                    onClick={() => navigate(`/tasks/${taskId}/edit`)}
                                >
                                    <Edit size={12} className="mr-2" /> Modify Properties
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </EntityDetailTemplate>
        </PageLayout>
    );
}
