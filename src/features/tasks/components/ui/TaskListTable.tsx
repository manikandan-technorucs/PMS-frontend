import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import { Avatar } from 'primereact/avatar';
import { format, parseISO, isPast, isValid } from 'date-fns';
import { Task } from '@/api/services/tasks.service';

interface TaskListTableProps {
    tasks: Task[];
    onRowClick?: (task: Task) => void;
    loading?: boolean;
    projectId?: number;
    timelogs?: any[];
    groupBy?: 'project' | 'tasklist' | 'status';
}

const TEAL = 'hsl(160 60% 45%)';

const PRIORITY_CFG: Record<string, { bg: string; color: string; icon: string }> = {
    'critical': { bg: '#fee2e2', color: '#991b1b', icon: '🔴' },
    'high': { bg: '#ffedd5', color: '#9a3412', icon: '🟠' },
    'medium': { bg: '#fef9c3', color: '#854d0e', icon: '🟡' },
    'low': { bg: '#dcfce7', color: '#166534', icon: '🟢' },
    'none': { bg: '#f3f4f6', color: '#6b7280', icon: '⚪' },
};

function PriorityBadge({ priority }: { priority?: any }) {
    const label = String(typeof priority === 'string' ? priority : priority?.label ?? priority?.name ?? 'None');
    const key = label.toLowerCase();
    const cfg = PRIORITY_CFG[key] || PRIORITY_CFG['none'];
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
            style={{ background: cfg.bg, color: cfg.color }}>
            {label}
        </span>
    );
}

function OwnerCell({ owner }: { owner?: any }) {
    if (!owner) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;


    if (typeof owner === 'string') {
        return <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{owner}</span>;
    }

    const firstName = owner.first_name || '';
    const lastName = owner.last_name || '';
    const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
    const name = `${firstName} ${lastName}`.trim() || owner.username || 'User';

    return (
        <div className="flex items-center gap-1.5">
            <Avatar
                label={initials || '?'}
                size="normal"
                shape="circle"
                style={{
                    width: 22, height: 22, fontSize: 9, fontWeight: 700,
                    background: 'linear-gradient(135deg,#0CD1C3,#6366f1)', color: '#fff',
                }}
            />
            <span className="text-[12px] font-medium truncate max-w-[100px]"
                style={{ color: 'var(--text-primary)' }}>
                {name}
            </span>
        </div>
    );
}

function DateCell({ date, warn }: { date?: any; warn?: boolean }) {
    if (!date) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;


    if (typeof date !== 'string') {
        const dStr = date?.toString?.() || String(date);
        return <span style={{ fontSize: 12 }}>{dStr}</span>;
    }

    try {
        const d = parseISO(date);
        if (!isValid(d)) return <span style={{ fontSize: 12 }}>{date}</span>;
        const overdue = warn && isPast(d);
        return (
            <span className="text-[12px] font-semibold tabular-nums"
                style={{ color: overdue ? '#ef4444' : 'var(--text-primary)' }}>
                {format(d, 'MM/dd/yyyy')}
            </span>
        );
    } catch {
        return <span style={{ fontSize: 12 }}>{date}</span>;
    }
}

function StatusCell({ status }: { status?: any }) {
    const label = typeof status === 'string' ? status : status?.label ?? '—';
    const color = typeof status === 'object' ? status?.color : undefined;
    const teal = TEAL;
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{
                background: color ? `${color}22` : `${teal}18`,
                color: color ?? teal,
                border: `1px solid ${color ?? teal}44`,
            }}>
            {label}
        </span>
    );
}

function DiffCell({ workHours, timelogTotal }: { workHours?: number; timelogTotal?: number }) {
    const p = Number(workHours ?? 0);
    const t = Number(timelogTotal ?? 0);
    const diff = p - t;
    const isOver = diff < 0;
    return (
        <span className="text-[12px] font-bold tabular-nums"
            style={{ color: isOver ? '#ef4444' : '#22c55e' }}>
            {isOver ? '−' : '+'}{Math.abs(diff).toFixed(1)}h
        </span>
    );
}

export function TaskListTable({ tasks, onRowClick, loading, groupBy }: TaskListTableProps) {
    const navigate = useNavigate();

    const sortedTasks = useMemo(() => {
        return [...tasks].map(t => {
            let groupName = 'General';
            if (groupBy === 'project') groupName = (t as any).project?.project_name || 'Independent Tasks';
            else if (groupBy === 'status') groupName = t.status_master?.label || t.status?.label || 'Unknown Status';
            else groupName = (t as any).task_list?.name || 'General';
            return { ...t, _group: groupName };
        }).sort((a: any, b: any) => a._group.localeCompare(b._group));
    }, [tasks, groupBy]);

    const handleRowClick = (e: any) => {
        const task = e.data as Task;
        if (onRowClick) onRowClick(task);
        else navigate(`/tasks/${task.id}`);
    };

    const headerTemplate = (data: any) => {
        const groupName = data._group ?? 'General';
        const groupTasks = sortedTasks.filter((t: any) => t._group === groupName);
        const avgPct = groupTasks.length
            ? Math.round(groupTasks.reduce((s: number, t: any) => s + (t.completion_percentage ?? 0), 0) / groupTasks.length)
            : 0;

        return (
            <div className="flex items-center gap-3 py-1">
                <span className="text-[12px] font-bold tracking-wide"
                    style={{ color: 'var(--text-primary)' }}>
                    {groupName}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${TEAL}18`, color: TEAL }}>
                    {groupTasks.length}
                </span>
                <div className="flex items-center gap-1.5 ml-2">
                    <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${avgPct}%`, background: TEAL }} />
                    </div>
                    <span className="text-[11px]" style={{ color: TEAL }}>{avgPct}%</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full overflow-auto">
            <DataTable
                value={sortedTasks}
                loading={loading}
                dataKey="id"
                showGridlines
                stripedRows
                resizableColumns
                columnResizeMode="fit"
                scrollable
                scrollHeight="flex"
                size="small"
                rowGroupMode="subheader"
                groupRowsBy="_group"
                rowGroupHeaderTemplate={headerTemplate}
                sortMode="single"
                sortField="_group"
                sortOrder={1}
                onRowClick={handleRowClick}
                rowClassName={() => 'cursor-pointer hover:bg-teal-50/40 dark:hover:bg-teal-900/10 transition-colors'}
                emptyMessage={
                    <div className="flex flex-col items-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
                        <span className="text-4xl">✅</span>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No tasks found</p>
                    </div>
                }
                style={{ fontSize: 13 }}
            >
                { }
                <Column
                    field="public_id"
                    header="ID"
                    sortable
                    style={{ width: '90px', minWidth: '80px' }}
                    body={(r) => (
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: `${TEAL}18`, color: TEAL }}>
                            {r.public_id ?? `TSK-${r.id}`}
                        </span>
                    )}
                />

                { }
                <Column
                    field="task_name"
                    header="Task Name"
                    sortable
                    filter
                    filterPlaceholder="Search..."
                    style={{ minWidth: '200px' }}
                    body={(r) => (
                        <span className="text-[13px] font-semibold"
                            style={{ color: 'var(--text-primary)' }}>
                            {r.task_name}
                        </span>
                    )}
                />

                { }
                <Column
                    field="duration"
                    header="Duration"
                    sortable
                    style={{ width: '90px', minWidth: '80px' }}
                    body={(r) => (
                        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                            {r.duration ? `${r.duration}d` : '—'}
                        </span>
                    )}
                />

                { }
                <Column
                    field="priority"
                    header="Priority"
                    sortable
                    style={{ width: '100px', minWidth: '90px' }}
                    body={(r) => <PriorityBadge priority={r.priority_master ?? r.priority} />}
                />

                { }
                <Column
                    field="single_owner"
                    header="Owner"
                    style={{ minWidth: '140px' }}
                    body={(r) => <OwnerCell owner={r.single_owner ?? r.creator} />}
                />

                { }
                <Column
                    field="status"
                    header="Status"
                    sortable
                    style={{ width: '120px', minWidth: '110px' }}
                    body={(r) => <StatusCell status={r.status_master ?? r.status} />}
                />

                { }
                <Column
                    field="tags"
                    header="Tags"
                    style={{ minWidth: '100px' }}
                    body={(r) => {
                        if (!r.tags) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
                        return (
                            <div className="flex flex-wrap gap-1">
                                {String(r.tags).split(',').slice(0, 2).map((t: string, i: number) => (
                                    <span key={i} className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                        style={{ background: '#e0f2fe', color: '#0369a1' }}>
                                        {t.trim()}
                                    </span>
                                ))}
                            </div>
                        );
                    }}
                />

                <Column
                    field="start_date"
                    header="Start Date"
                    sortable
                    style={{ width: '110px', minWidth: '100px' }}
                    body={(r) => <DateCell date={r.start_date} />}
                />

                <Column
                    field="due_date"
                    header="Due Date"
                    sortable
                    style={{ width: '110px', minWidth: '100px' }}
                    body={(r) => <DateCell date={r.due_date ?? r.end_date} warn />}
                />

                <Column
                    field="completion_percentage"
                    header="Completion %"
                    sortable
                    style={{ width: '130px', minWidth: '120px' }}
                    body={(r) => {
                        const pct = r.completion_percentage ?? 0;
                        return (
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold tabular-nums w-7 text-right"
                                    style={{ color: TEAL }}>
                                    {pct}%
                                </span>
                                <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                    <div className="h-full rounded-full transition-all"
                                        style={{ width: `${pct}%`, background: TEAL }} />
                                </div>
                            </div>
                        );
                    }}
                />

                <Column
                    field="estimated_hours"
                    header="Work Hours (P)"
                    sortable
                    style={{ width: '105px', minWidth: '95px' }}
                    body={(r) => (
                        <span className="text-[12px] font-semibold tabular-nums"
                            style={{ color: 'var(--text-primary)' }}>
                            {Number(r.estimated_hours ?? 0).toFixed(1)}h
                        </span>
                    )}
                />

                <Column
                    field="cached_timelog_total"
                    header="Timelog (T)"
                    sortable
                    style={{ width: '95px', minWidth: '85px' }}
                    body={(r) => (
                        <span className="text-[12px] font-semibold tabular-nums" style={{ color: TEAL }}>
                            {Number(r.cached_timelog_total || r.timelog_total || r.work_hours || 0).toFixed(1)}h
                        </span>
                    )}
                />

                <Column
                    field="difference"
                    header="Diff (P-T)"
                    sortable
                    style={{ width: '90px', minWidth: '80px' }}
                    body={(r) => (
                        <DiffCell
                            workHours={r.estimated_hours}
                            timelogTotal={r.cached_timelog_total || r.timelog_total || r.work_hours}
                        />
                    )}
                />

                <Column
                    field="billing_type"
                    header="Billing Type"
                    style={{ width: '100px', minWidth: '90px' }}
                    body={(r) => (
                        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                            {r.billing_type ?? '—'}
                        </span>
                    )}
                />
            </DataTable>
        </div>
    );
}
