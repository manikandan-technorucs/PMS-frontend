import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';
import { format, parseISO, isPast, isValid } from 'date-fns';
import { Project } from '@/features/projects/api/projects.api';
import { statusStr } from '@/utils/statusHelpers';

interface ProjectListTableProps {
    projects: Project[];
    loading?: boolean;
}

const TEAL = 'hsl(160 60% 45%)';


const STATUS_MAP: Record<string, { bg: string; color: string; dot: string }> = {
    // lowercase legacy
    'active':      { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
    'on hold':     { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
    'planning':    { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
    'completed':   { bg: '#f0fdf4', color: '#166534', dot: '#4ade80' },
    'cancelled':   { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    'closed':      { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
    'in progress': { bg: '#ede9fe', color: '#5b21b6', dot: '#8b5cf6' },
    // MasterLookup label-case values
    'Active':      { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
    'On Hold':     { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
    'Planning':    { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
    'Completed':   { bg: '#f0fdf4', color: '#166534', dot: '#4ade80' },
    'Cancelled':   { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    'Closed':      { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
    'In Progress': { bg: '#ede9fe', color: '#5b21b6', dot: '#8b5cf6' },
    'Not Started': { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
    'At Risk':     { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
    'Delayed':     { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    'Draft':       { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' },
};

const PRIORITY_MAP: Record<string, { bg: string; color: string }> = {
    // lowercase legacy
    'critical': { bg: '#fee2e2', color: '#ef4444' },
    'high':     { bg: '#ffedd5', color: '#f97316' },
    'medium':   { bg: '#fef9c3', color: '#854d0e' },
    'low':      { bg: '#f0fdf4', color: '#166534' },
    // MasterLookup label-case values
    'Critical': { bg: '#fee2e2', color: '#ef4444' },
    'High':     { bg: '#ffedd5', color: '#f97316' },
    'Medium':   { bg: '#fef9c3', color: '#854d0e' },
    'Low':      { bg: '#f0fdf4', color: '#166534' },
};

function PriorityBadge({ priority }: { priority: string }) {
    const key = (priority || '').toLowerCase();
    const cfg = PRIORITY_MAP[key] || { bg: '#f3f4f6', color: '#374151' };
    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
        >
            {priority || '—'}
        </span>
    );
}


function StatusBadge({ status }: { status: string }) {
    const key = (status || '').toLowerCase();
    const cfg = STATUS_MAP[key] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' };
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
            style={{ background: cfg.bg, color: cfg.color }}
        >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
            {status || '—'}
        </span>
    );
}

function OwnerAvatar({ owner }: { owner?: any }) {
    if (!owner) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
    const initials = `${owner.first_name?.[0] ?? ''}${owner.last_name?.[0] ?? ''}`.toUpperCase();
    const name = `${owner.first_name ?? ''} ${owner.last_name ?? ''}`.trim();
    return (
        <div className="flex items-center gap-2">
            <Avatar
                label={initials || '?'}
                size="normal"
                shape="circle"
                style={{
                    width: 26, height: 26, fontSize: 10, fontWeight: 700,
                    background: 'linear-gradient(135deg,#0CD1C3,#6366f1)', color: '#fff',
                    flexShrink: 0,
                }}
            />
            <span className="text-[12px] font-medium truncate max-w-[110px]"
                  style={{ color: 'var(--text-primary)' }}>
                {name}
            </span>
        </div>
    );
}

function CountBadge({ count, total, color }: { count: number; total?: number; color: string }) {
    if (total != null && total > 0) {
        const pct = Math.round((count / total) * 100);
        return (
            <div className="flex items-center gap-2 min-w-[80px]">
                <span className="text-[12px] font-bold tabular-nums w-5 text-right"
                      style={{ color }}>
                    {count}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                         style={{ width: `${pct}%`, background: color }} />
                </div>
            </div>
        );
    }
    return (
        <span className="text-[12px] font-semibold tabular-nums" style={{ color: count > 0 ? color : 'var(--text-muted)' }}>
            {count}
        </span>
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
                <span className="text-[12px] font-semibold"
                      style={{ color: overdue ? '#ef4444' : 'var(--text-primary)' }}>
                    {format(d, 'MM.dd.yyyy')}
                </span>
                {overdue && (
                    <span className="block text-[10px] font-bold" style={{ color: '#ef4444' }}>
                        ({Math.abs(diffDays)} days overdue)
                    </span>
                )}
                {!overdue && diffDays >= 0 && diffDays <= 7 && (
                    <span className="block text-[10px] font-bold" style={{ color: '#f59e0b' }}>
                        ({diffDays}d left)
                    </span>
                )}
            </div>
        );
    } catch {
        return <span style={{ fontSize: 12 }}>{date}</span>;
    }
}

export function ProjectListTable({ projects, loading }: ProjectListTableProps) {
    const navigate = useNavigate();

    return (
        <div className="w-full h-full overflow-auto">
            <DataTable
                value={projects}
                loading={loading}
                dataKey="id"
                showGridlines
                stripedRows
                resizableColumns
                columnResizeMode="fit"
                scrollable
                scrollHeight="flex"
                size="small"
                onRowClick={(e) => navigate(`/projects/${(e.data as any).id}`)}
                rowClassName={() => 'cursor-pointer hover:bg-teal-50/40 dark:hover:bg-teal-900/10 transition-colors'}
                emptyMessage={
                    <div className="flex flex-col items-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
                        <span className="text-4xl">📁</span>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No projects found</p>
                    </div>
                }
                pt={{
                    header:       { className: 'pms-dt-header' },
                    headerRow:    { className: 'pms-dt-header-row' },
                    bodyRow:      { className: 'pms-dt-row' },
                    column:       { bodyCell: { className: 'pms-dt-cell' }, headerCell: { className: 'pms-dt-head-cell' } },
                }}
                style={{ fontSize: 13 }}
            >
                {}
                <Column
                    field="public_id"
                    header="ID"
                    sortable
                    style={{ width: '90px', minWidth: '80px' }}
                    body={(r) => (
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: `${TEAL}18`, color: TEAL }}>
                            {r.public_id || `PRJ-${r.id}`}
                        </span>
                    )}
                />

                {}
                <Column
                    field="project_name"
                    header="Project Name"
                    sortable
                    filter
                    filterPlaceholder="Search..."
                    style={{ minWidth: '200px' }}
                    body={(r) => (
                        <div>
                            <p className="text-[13px] font-semibold truncate max-w-[280px]"
                               style={{ color: TEAL }}>
                                {r.project_name || r.name}
                            </p>
                            {r.client_name && (
                                <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                                    {r.client_name}
                                </p>
                            )}
                        </div>
                    )}
                />

                {}
                <Column
                    field="completion_percentage"
                    header="%"
                    sortable
                    style={{ width: '80px', minWidth: '60px' }}
                    body={(r) => {
                        const pct = r.completion_percentage ?? 0;
                        return (
                            <span className="text-[12px] font-bold tabular-nums"
                                  style={{ color: pct >= 100 ? '#22c55e' : 'var(--text-primary)' }}>
                                {pct}%
                            </span>
                        );
                    }}
                />

                {}
                <Column
                    field="owner"
                    header="Owner"
                    style={{ minWidth: '150px' }}
                    body={(r) => <OwnerAvatar owner={r.owner || r.project_manager} />}
                />

                {}
                <Column
                    field="status"
                    header="Status"
                    sortable
                    filter
                    style={{ width: '130px', minWidth: '110px' }}
                    body={(r) => {
                        // status_master (MasterLookupResponse) has .label
                        // status property on model returns {id, label, value, color}
                        const label =
                            r.status_master?.label ||
                            (r.status && typeof r.status === 'object' ? r.status.label : null) ||
                            (typeof r.status === 'string' ? r.status : null) ||
                            '—';
                        return <StatusBadge status={label} />;
                    }}
                />

                <Column
                    field="priority"
                    header="Priority"
                    sortable
                    filter
                    style={{ width: '110px', minWidth: '90px' }}
                    body={(r) => {
                        // priority_master (MasterLookupResponse) has .label
                        const label =
                            r.priority_master?.label ||
                            (r.priority && typeof r.priority === 'object' ? r.priority.label : null) ||
                            (typeof r.priority === 'string' ? r.priority : null) ||
                            '—';
                        return <PriorityBadge priority={label} />;
                    }}
                />


                {}
                <Column
                    header="Tasks"
                    style={{ width: '110px', minWidth: '100px' }}
                    body={(r) => {
                        return <CountBadge count={r.task_count || 0} color={TEAL} />;
                    }}
                />

                {}
                <Column
                    header="Milestones"
                    style={{ width: '100px', minWidth: '90px' }}
                    body={(r) => {
                        return <CountBadge count={r.milestone_count || 0} color="#8b5cf6" />;
                    }}
                />

                {}
                <Column
                    header="Bugs"
                    style={{ width: '80px', minWidth: '70px' }}
                    body={(r) => {
                        return <CountBadge count={r.issue_count || 0} color="#ef4444" />;
                    }}
                />

                {}
                <Column
                    field="expected_start_date"
                    header="Start Date"
                    sortable
                    style={{ width: '120px', minWidth: '110px' }}
                    body={(r) => <DateCell date={r.expected_start_date || r.start_date} />}
                />

                {}
                <Column
                    field="expected_end_date"
                    header="End Date"
                    sortable
                    style={{ width: '130px', minWidth: '110px' }}
                    body={(r) => <DateCell date={r.expected_end_date || r.end_date} warnIfPast />}
                />

                {}
                <Column
                    field="tags"
                    header="Tags"
                    style={{ minWidth: '100px' }}
                    body={(r) => {
                        if (!r.tags) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No tags</span>;
                        return (
                            <div className="flex flex-wrap gap-1">
                                {String(r.tags).split(',').slice(0, 3).map((t: string, i: number) => (
                                    <span key={i}
                                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                          style={{ background: '#e0f2fe', color: '#0369a1' }}>
                                        {t.trim()}
                                    </span>
                                ))}
                            </div>
                        );
                    }}
                />
            </DataTable>
        </div>
    );
}
