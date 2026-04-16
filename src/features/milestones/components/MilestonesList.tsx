import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Avatar } from 'primereact/avatar';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { StatCardProps } from '@/components/data-display/StatCard';
import { TableSkeleton } from '@/components/feedback/Skeleton/TableSkeleton';
import { Plus, Milestone as MilestoneIcon, CheckCircle, Clock, AlertCircle, Columns, List as ListIcon } from 'lucide-react';
import { milestonesService, Milestone } from '@/features/milestones/api/milestones.api';
import { MilestonesKanbanView } from '@/features/milestones/components/ui/MilestonesKanbanView';
import { format, parseISO, isPast, isValid } from 'date-fns';
import { statusStr, statusName } from '@/utils/statusHelpers';

const TEAL = 'hsl(160 60% 45%)';

const STATUS_MAP: Record<string, { bg: string; color: string; dot: string }> = {
    'active':    { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
    'completed': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
    'overdue':   { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    'on hold':   { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
};

function StatusBadge({ status }: { status?: any }) {
    const key = statusStr(status) || 'active';
    const cfg = STATUS_MAP[key] || STATUS_MAP['active'];
    const displayName = statusName(status) || 'Active';
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{ background: cfg.bg, color: cfg.color }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
            {displayName}
        </span>
    );
}

function OwnerCell({ owner }: { owner?: any }) {
    if (!owner) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
    const initials = `${owner.first_name?.[0] ?? ''}${owner.last_name?.[0] ?? ''}`.toUpperCase();
    const name = `${owner.first_name ?? ''} ${owner.last_name ?? ''}`.trim();
    return (
        <div className="flex items-center gap-1.5">
            <Avatar label={initials || '?'} size="normal" shape="circle"
                style={{ width: 24, height: 24, fontSize: 9, fontWeight: 700,
                    background: 'linear-gradient(135deg,#0CD1C3,#6366f1)', color: '#fff' }} />
            <span className="text-[12px] font-medium truncate max-w-[100px]"
                  style={{ color: 'var(--text-primary)' }}>{name}</span>
        </div>
    );
}

function DateCell({ date, warnIfPast }: { date?: string | null; warnIfPast?: boolean }) {
    if (!date) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
    try {
        const d = parseISO(date);
        if (!isValid(d)) return <span style={{ fontSize: 12 }}>{date}</span>;
        const overdue = warnIfPast && isPast(d);
        const now = new Date();
        const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000);
        return (
            <div>
                <span className="text-[12px] font-semibold tabular-nums"
                      style={{ color: overdue ? '#ef4444' : 'var(--text-primary)' }}>
                    {format(d, 'MM-dd-yyyy')}
                </span>
                {overdue && (
                    <span className="block text-[10px]" style={{ color: '#ef4444' }}>
                        ({Math.abs(diffDays)}d overdue)
                    </span>
                )}
                {!overdue && diffDays >= 0 && diffDays <= 14 && (
                    <span className="block text-[10px]" style={{ color: '#f59e0b' }}>
                        ({diffDays}d left)
                    </span>
                )}
            </div>
        );
    } catch { return <span style={{ fontSize: 12 }}>{date}</span>; }
}

function CountBadge({ count, total, color }: { count: number; total?: number; color: string }) {
    if (count === 0) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No{total != null ? '' : ' tasks'}</span>;
    return (
        <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold tabular-nums" style={{ color }}>{count}</span>
            {total != null && total > 0 && (
                <div className="flex-1 min-w-[40px] h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full"
                         style={{ width: `${Math.round((count / total) * 100)}%`, background: color }} />
                </div>
            )}
        </div>
    );
}

export function MilestonesList() {
    const navigate = useNavigate();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading]       = useState(true);
    const [view, setView]             = useState<'list' | 'kanban'>('list');

    useEffect(() => { fetchMilestones(); }, []);

    const fetchMilestones = async () => {
        try {
            const data = await milestonesService.getMilestones();
            setMilestones(data);
        } catch (err) {
            console.error('Failed to fetch milestones:', err);
        } finally {
            setLoading(false);
        }
    };

    const statsProps: StatCardProps[] = useMemo(() => {
        if (loading) return [];
        const completed = milestones.filter((m: any) => statusStr(m.status) === 'completed').length;
        const active    = milestones.filter((m: any) => statusStr(m.status) === 'active').length;
        const overdue   = milestones.filter((m: any) => {
            if (!m.end_date) return false;
            return isPast(parseISO(m.end_date)) && statusStr(m.status) !== 'completed';
        }).length;
        return [
            { label: 'Total',     value: milestones.length, icon: <MilestoneIcon size={18} strokeWidth={2} />, accentVariant: 'teal' },
            { label: 'Active',    value: active,            icon: <Clock size={18} strokeWidth={2} />,         accentVariant: 'violet' },
            { label: 'Completed', value: completed,         icon: <CheckCircle size={18} strokeWidth={2} />,   accentVariant: 'teal' },
            { label: 'Overdue',   value: overdue,           icon: <AlertCircle size={18} strokeWidth={2} />,   accentVariant: 'amber' },
        ];
    }, [milestones, loading]);

    return (
        <EntityPageTemplate
            title="Milestones"
            stats={statsProps}
            filterGroups={[]}
            selectedFilters={{}}
            onFilterChange={() => { }}
            onClearFilters={() => { }}
            hasActiveFilters={false}
            activeFilterCount={0}
            headerActions={
                <button onClick={() => navigate('/milestones/create')}
                    className="inline-flex items-center justify-center gap-2 font-bold px-4 rounded-lg text-white text-[13px] transition-all bg-teal-500 hover:bg-teal-600 active:scale-[0.98]"
                    style={{ height: '36px', boxShadow: '0 4px 15px rgba(20, 184, 166, 0.25)' }}>
                    <Plus size={15} /> Add Milestone
                </button>
            }
            utilityBarExtra={
                <SegmentedControl
                    value={view}
                    onChange={(v) => setView(v as 'list' | 'kanban')}
                    options={[
                        { label: 'List',   value: 'list',   icon: <ListIcon size={13} strokeWidth={2.5} /> },
                        { label: 'Kanban', value: 'kanban', icon: <Columns  size={13} strokeWidth={2.5} /> },
                    ]}
                />
            }
        >
            {loading ? (
                <div className="p-4"><TableSkeleton rows={6} columns={8} /></div>
            ) : view === 'kanban' ? (
                <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                    <MilestonesKanbanView milestones={milestones as any} onUpdate={fetchMilestones} />
                </div>
            ) : (
                <div className="w-full h-full overflow-auto">
                    <DataTable
                        value={milestones}
                        dataKey="id"
                        showGridlines
                        stripedRows
                        resizableColumns
                        columnResizeMode="fit"
                        scrollable
                        scrollHeight="flex"
                        size="small"
                        rowClassName={() => 'hover:bg-teal-50/40 dark:hover:bg-teal-900/10 transition-colors'}
                        emptyMessage={
                            <div className="flex flex-col items-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
                                <span className="text-4xl">🏁</span>
                                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No milestones yet</p>
                            </div>
                        }
                        style={{ fontSize: 13 }}
                    >
                        {}
                        <Column
                            field="title"
                            header="Milestone Name"
                            sortable filter filterPlaceholder="Search..."
                            style={{ minWidth: '200px' }}
                            body={(r) => (
                                <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {r.milestone_name}
                                </span>
                            )}
                        />

                        {}
                        <Column
                            field="project"
                            header="Project"
                            sortable
                            style={{ minWidth: '140px' }}
                            body={(r) => (
                                <span className="text-[12px] font-medium truncate block max-w-[160px]"
                                      style={{ color: TEAL }}>
                                    {r.project?.name ?? r.project?.project_name ?? '—'}
                                </span>
                            )}
                        />

                        {}
                        <Column
                            field="completion_percentage"
                            header="%"
                            sortable
                            style={{ width: '100px', minWidth: '90px' }}
                            body={(r) => {
                                const pct = r.completion_percentage ?? 0;
                                return (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-bold w-7 tabular-nums"
                                              style={{ color: TEAL }}>{pct}%</span>
                                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                            <div className="h-full rounded-full"
                                                 style={{ width: `${pct}%`, background: TEAL }} />
                                        </div>
                                    </div>
                                );
                            }}
                        />

                        {}
                        <Column
                            field="status"
                            header="Status"
                            sortable
                            style={{ width: '110px', minWidth: '100px' }}
                            body={(r) => <StatusBadge status={r.status} />}
                        />

                        {}
                        <Column
                            field="owner"
                            header="Owner"
                            style={{ minWidth: '140px' }}
                            body={(r) => <OwnerCell owner={r.owner} />}
                        />

                        {}
                        <Column
                            field="start_date"
                            header="Start Date"
                            sortable
                            style={{ width: '115px', minWidth: '105px' }}
                            body={(r) => <DateCell date={r.start_date} />}
                        />

                        {}
                        <Column
                            field="end_date"
                            header="End Date"
                            sortable
                            style={{ width: '125px', minWidth: '115px' }}
                            body={(r) => <DateCell date={r.end_date} warnIfPast />}
                        />

                        {}
                        <Column
                            field="tasks_count"
                            header="Tasks"
                            sortable
                            style={{ width: '100px', minWidth: '90px' }}
                            body={(r) => {
                                return <CountBadge count={r.task_count ?? 0} total={r.task_count ?? 0} color={TEAL} />;
                            }}
                        />

                        {}
                        <Column
                            field="bugs_count"
                            header="Bugs"
                            sortable
                            style={{ width: '80px', minWidth: '70px' }}
                            body={(r) => {
                                return <CountBadge count={r.issue_count ?? 0} color="#ef4444" />;
                            }}
                        />
                    </DataTable>
                </div>
            )}
        </EntityPageTemplate>
    );
}
