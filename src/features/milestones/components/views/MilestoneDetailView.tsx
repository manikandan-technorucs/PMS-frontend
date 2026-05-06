import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { EntityDetailTemplate } from '@/components/layout/EntityDetailTemplate';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { Button } from '@/components/forms/Button';
import { useMilestone } from '@/features/milestones/hooks/useMilestone';
import { format, parseISO, isValid } from 'date-fns';
import { Edit, Milestone as MilestoneIcon, Calendar, Target, Clock, Hash, Tag, Layers, TrendingUp } from 'lucide-react';
import { PropRow } from '@/components/data-display/PropRow';
import { ProgressBar } from 'primereact/progressbar';

const TEAL = 'hsl(160 60% 45%)';

function fmtDate(raw?: string | null) {
    if (!raw) return '—';
    try {
        const d = parseISO(raw);
        return isValid(d) ? format(d, 'MMM d, yyyy') : raw;
    } catch { return raw; }
}

export function MilestoneDetailView() {
    const { milestoneId } = useParams<{ milestoneId: string }>();
    const navigate = useNavigate();
    const id = parseInt(milestoneId ?? '0', 10);

    const { data: milestone, isLoading } = useMilestone(id);

    if (isLoading) return <PageSpinner fullPage label="Loading milestone..." />;
    if (!milestone) return <PageLayout><div className="p-8 text-center text-muted">Milestone not found.</div></PageLayout>;

    const pct = milestone.completion_percentage ?? 0;
    const projectName = milestone.project?.project_name ?? milestone.project?.name ?? 'Independent Project';

    return (
        <PageLayout showBackButton backPath="/milestones" isFullHeight>
            <EntityDetailTemplate
                title={milestone.milestone_name}
                subtitle={projectName}
                icon={<MilestoneIcon size={20} />}
                color="violet"
                actions={
                    <Button
                        variant="gradient" size="sm" icon={<Edit size={14} />}
                        onClick={() => navigate(`/milestones/${milestoneId}/edit`)}
                    >
                        Edit
                    </Button>
                }
                stats={[
                    { label: 'Completion', value: `${pct}%`, color: TEAL, icon: <TrendingUp size={14} /> },
                    { label: 'Tasks', value: milestone.task_count ?? 0, color: '#8b5cf6', icon: <Layers size={14} /> },
                    { label: 'Bugs', value: milestone.issue_count ?? 0, color: '#ef4444', icon: <Hash size={14} /> },
                    { label: 'Status', value: milestone.status || 'Active', color: '#f59e0b', icon: <Target size={14} /> },
                ]}
                tabs={[
                    { label: 'Overview' }
                ]}
            >
                <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
                    <div className="flex-1 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4">
                                Description
                            </h3>
                            {milestone.description ? (
                                <div className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {milestone.description}
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
                                <span className="text-[13px] font-semibold">Milestone Completion</span>
                                <span className="text-[14px] font-bold" style={{ color: TEAL }}>{pct}%</span>
                            </div>
                            <ProgressBar value={pct} showValue={false} style={{ height: '8px' }} color={TEAL} />
                        </div>
                    </div>

                    <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4 px-1">
                                Milestone Properties
                            </h3>

                            <PropRow icon={<Hash size={13} />} label="Milestone ID">
                                <span className="font-mono">{milestone.public_id}</span>
                            </PropRow>

                            <PropRow icon={<Target size={13} />} label="Status">
                                <span className="text-[12px] font-bold" style={{ color: TEAL }}>{milestone.status || 'Active'}</span>
                            </PropRow>

                            <PropRow icon={<Clock size={13} />} label="Timeline">
                                <div className="flex flex-col gap-1">
                                    <div className="text-[12px] flex justify-between">
                                        <span className="text-slate-400">Start:</span>
                                        <span>{fmtDate(milestone.start_date)}</span>
                                    </div>
                                    <div className="text-[12px] flex justify-between">
                                        <span className="text-slate-400">End:</span>
                                        <span>{fmtDate(milestone.end_date)}</span>
                                    </div>
                                </div>
                            </PropRow>

                            <PropRow icon={<Tag size={13} />} label="Tags">
                                {milestone.tags ? (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {milestone.tags.split(',').map((t: string, i: number) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold">
                                                {t.trim()}
                                            </span>
                                        ))}
                                    </div>
                                ) : '—'}
                            </PropRow>

                            <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                                <Button
                                    variant="outline"
                                    className="w-full text-[12px] font-bold h-9"
                                    onClick={() => navigate(`/milestones/${milestoneId}/edit`)}
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
