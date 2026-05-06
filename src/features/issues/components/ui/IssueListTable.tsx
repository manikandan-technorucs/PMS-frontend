import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Avatar } from 'primereact/avatar';
import { format, parseISO, isPast, isValid } from 'date-fns';
import { Issue } from '../../api/issues.api';

interface IssueListTableProps {
    issues: Issue[];
    onRowClick?: (issue: Issue) => void;
    loading?: boolean;
    totalRecords?: number;
    lazyParams?: any;
    onLazyLoad?: (params: any) => void;
    timelogs?: any[];
}

const TEAL = 'hsl(160 60% 45%)';

const SEVERITY_CFG: Record<string, { bg: string; color: string }> = {
    'critical':      { bg: '#fee2e2', color: '#991b1b' },
    'blocker':       { bg: '#fee2e2', color: '#991b1b' },
    'show stopper':  { bg: '#fef2f2', color: '#dc2626' },
    'high':          { bg: '#ffedd5', color: '#9a3412' },
    'medium':        { bg: '#fef9c3', color: '#854d0e' },
    'low':           { bg: '#dcfce7', color: '#166534' },
    'normal':        { bg: '#f3f4f6', color: '#374151' },
};

const STATUS_CFG: Record<string, { bg: string; color: string; dot: string }> = {
    'open':           { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    'active':         { bg: '#f0f9ff', color: '#0369a1', dot: '#0ea5e9' },
    'in progress':    { bg: '#ede9fe', color: '#5b21b6', dot: '#8b5cf6' },
    'to be tested':   { bg: '#fdf4ff', color: '#701a75', dot: '#d946ef' },
    'in review':      { bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
    'resolved':       { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
    'closed':         { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' },
    're-opened':      { bg: '#ffedd5', color: '#9a3412', dot: '#f97316' },
    'on hold':        { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
    'cancelled':      { bg: '#f1f5f9', color: '#475569', dot: '#64748b' },
};

function SeverityBadge({ severity }: { severity?: any }) {
    const label = typeof severity === 'string' ? severity : (severity?.label ?? severity?.name ?? 'Normal');
    const key = label.toLowerCase();
    const cfg = SEVERITY_CFG[key] || SEVERITY_CFG['normal'];
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
              style={{ background: cfg.bg, color: cfg.color }}>
            {label}
        </span>
    );
}

function StatusBadge({ status }: { status?: any }) {
    const label = typeof status === 'string' ? status : status?.label ?? '—';
    const color = typeof status === 'object' ? status?.color : undefined;
    const key = label.toLowerCase();
    const cfg = STATUS_CFG[key];
    if (color || cfg) {
        const bg   = color ? `${color}22` : cfg.bg;
        const clr  = color ?? cfg.color;
        const dot  = color ?? cfg.dot;
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: bg, color: clr }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
                {label}
            </span>
        );
    }
    return <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{label}</span>;
}

function PersonCell({ person, label }: { person?: any; label?: string }) {
    if (!person) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
    
    const initials = (person.first_name?.[0] ?? person.displayName?.[0] ?? person.email?.[0] ?? person.mail?.[0] ?? '').toUpperCase();
    const name = person.displayName || [person.first_name, person.last_name].filter(Boolean).join(' ') || person.email || person.mail || 'Unknown';
    
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
            <span className="text-[12px] font-medium truncate max-w-[120px]"
                  style={{ color: 'var(--text-primary)' }}>
                {name}
            </span>
        </div>
    );
}

function DateCell({ date, warn }: { date?: string | null; warn?: boolean }) {
    if (!date) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
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

export function IssueListTable({ issues, onRowClick, loading }: IssueListTableProps) {
    const navigate = useNavigate();

    const handleRowClick = (e: any) => {
        const issue = e.data as Issue;
        if (onRowClick) onRowClick(issue);
        else navigate(`/issues/${issue.id}`);
    };

    return (
        <div className="w-full h-full overflow-auto">
            <DataTable
                value={issues}
                loading={loading}
                dataKey="id"
                showGridlines
                stripedRows
                resizableColumns
                columnResizeMode="fit"
                scrollable
                scrollHeight="flex"
                size="small"
                onRowClick={handleRowClick}
                rowClassName={() => 'cursor-pointer hover:bg-teal-50/40 dark:hover:bg-teal-900/10 transition-colors'}
                emptyMessage={
                    <div className="flex flex-col items-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
                        <span className="text-4xl">🐛</span>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No issues reported</p>
                    </div>
                }
                pt={{
                    header: { className: 'pms-dt-header' },
                    headerRow: { className: 'pms-dt-header-row' },
                    bodyRow: { className: 'pms-dt-row' },
                    column: { bodyCell: { className: 'pms-dt-cell' }, headerCell: { className: 'pms-dt-head-cell' } },
                }}
                className="pms-datatable"
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
                              style={{ background: '#fee2e218', color: '#991b1b' }}>
                            {r.public_id ?? `ISS-${r.id}`}
                        </span>
                    )}
                />

                {}
                <Column
                    field="bug_name"
                    header="Bug Name"
                    sortable
                    filter
                    filterPlaceholder="Search..."
                    style={{ minWidth: '200px' }}
                    body={(r) => (
                        <span className="text-[13px] font-semibold block truncate max-w-[200px] sm:max-w-[300px]"
                              style={{ color: 'var(--text-primary)' }}
                              title={r.bug_name}>
                            {r.bug_name}
                        </span>
                    )}
                />

                {}
                <Column
                    field="reporter"
                    header="Reporter"
                    style={{ minWidth: '140px' }}
                    body={(r) => <PersonCell person={r.reporter} />}
                />

                {}
                <Column
                    field="created_at"
                    header="Created Time"
                    sortable
                    style={{ width: '120px', minWidth: '110px' }}
                    body={(r) => <DateCell date={r.created_at} />}
                />

                {}
                <Column
                    field="status"
                    header="Status"
                    sortable
                    style={{ width: '120px', minWidth: '110px' }}
                    body={(r) => <StatusBadge status={r.status_master ?? r.status} />}
                />

                {}
                <Column
                    field="tags"
                    header="Tags"
                    style={{ minWidth: '100px' }}
                    body={(r) => {
                        if (!r.tags) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
                        return (
                            <div className="flex flex-wrap gap-1 max-w-[120px] overflow-hidden whitespace-nowrap">
                                {String(r.tags).split(',').slice(0, 2).map((t: string, i: number) => (
                                    <span key={i} className="text-[10px] font-semibold px-1.5 py-0.5 rounded truncate max-w-[50px]"
                                          style={{ background: '#f0fdf4', color: '#166534' }}
                                          title={t.trim()}>
                                        {t.trim()}
                                    </span>
                                ))}
                            </div>
                        );
                    }}
                />

                {}
                <Column
                    field="assignee"
                    header="Assignee"
                    style={{ minWidth: '140px' }}
                    body={(r) => <PersonCell person={r.assignees?.[0] ?? r.assignee} />}
                />

                {}
                <Column
                    field="due_date"
                    header="Due Date"
                    sortable
                    style={{ width: '115px', minWidth: '105px' }}
                    body={(r) => <DateCell date={r.due_date} warn />}
                />

                {}
                <Column
                    field="severity"
                    header="Severity"
                    sortable
                    style={{ width: '100px', minWidth: '90px' }}
                    body={(r) => <SeverityBadge severity={r.severity} />}
                />

                {}
                <Column
                    field="project"
                    header="Project"
                    style={{ minWidth: '130px' }}
                    body={(r) => (
                        <span className="text-[12px] font-medium truncate max-w-[180px] block"
                              style={{ color: TEAL }}
                              title={r.project?.name ?? r.project?.project_name ?? ''}>
                            {r.project?.name ?? r.project?.project_name ?? '—'}
                        </span>
                    )}
                />
            </DataTable>
        </div>
    );
}
