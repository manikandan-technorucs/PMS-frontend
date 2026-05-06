import React, { useMemo, useState, useEffect } from 'react';
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
    groupBy?: 'none' | 'project' | 'tasklist';
    onTaskListRenamed?: () => void;
    taskLists?: any[];
    canRename?: boolean;
    onValueChange?: (data: Task[]) => void;
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
            <span className="text-[12px] font-medium truncate max-w-[120px]"
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

import { tasklistsService } from '@/api/services/tasklists.service';
import { useToast } from '@/providers/ToastContext';
import { InputText } from 'primereact/inputtext';
import { Pencil, Trash2 } from 'lucide-react';
import { useDeleteTask } from '@/features/tasks/hooks/useTasks';
import { confirmDialog } from 'primereact/confirmdialog';
import { Tooltip } from 'primereact/tooltip';

export function TaskListTable({ tasks, onRowClick, loading, groupBy, onTaskListRenamed, taskLists, canRename, onValueChange }: TaskListTableProps) {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { mutate: deleteTask } = useDeleteTask();
    const [expandedGroups, setExpandedGroups] = useState<any[]>([]);
    const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const sortedTasks = useMemo(() => {
        if (!groupBy || groupBy === 'none') {
            return [...tasks];
        }
        let processedTasks = [...tasks].map(t => {
            let groupName: string;
            let groupId: number | null = null;
            if (groupBy === 'project') {
                groupName = (t as any).project?.project_name || 'Independent Tasks';
                groupId = (t as any).project?.id || null;
            } else {
                const rawTlId = (t as any).task_list_id || (t as any).task_list?.id || (t as any).task_list;
                const tlId = typeof rawTlId === 'object' ? rawTlId?.id : Number(rawTlId);
                const foundTl = taskLists?.find(tl => tl.id === tlId);
                groupName = foundTl?.name || (t as any).task_list?.name || 'General';
                groupId = isNaN(tlId) ? null : tlId;
            }
            return { ...t, _group: groupName, _groupId: groupId };
        });

        // Only show groups that have at least one task
        return processedTasks.sort((a: any, b: any) => {
            if (a._group === 'General' && b._group !== 'General') return 1;
            if (a._group !== 'General' && b._group === 'General') return -1;
            
            const nameCmp = a._group.localeCompare(b._group);
            if (nameCmp !== 0) return nameCmp;
            
            // If same name, sort by ID to keep groups contiguous
            return (a._groupId || 0) - (b._groupId || 0);
        });
    }, [tasks, groupBy, taskLists]);

    useEffect(() => {
        const grouped = !!(groupBy && groupBy !== 'none');
        if (!grouped) { setExpandedGroups([]); return; }
        const seen = new Set<string>();
        const firstRows: any[] = [];
        sortedTasks.forEach((t: any) => {
            const key = t._group;
            if (key && !seen.has(key)) { seen.add(key); firstRows.push(t); }
        });
        setExpandedGroups(firstRows);
    }, [sortedTasks, groupBy]);

    const handleRowClick = (e: any) => {
        const task = e.data as Task;
        if (task._isDummy) return; // Prevent navigation for empty group placeholders
        if (onRowClick) onRowClick(task);
        else navigate(`/tasks/${task.id}`);
    };

    const headerTemplate = (data: any) => {
        const groupName = data._group ?? 'General';
        const groupId = data._groupId;
        const groupTasks = sortedTasks.filter((t: any) => t._group === groupName);
        const isEditing = groupBy === 'tasklist' && editingGroupId === groupId && groupId !== null;

        const handleRename = async () => {
            if (!editingValue.trim() || editingValue === groupName) {
                setEditingGroupId(null);
                return;
            }
            setIsSaving(true);
            try {
                await tasklistsService.updateTaskList(groupId, { name: editingValue.trim() });
                showToast('success', 'Renamed', 'Task list name updated successfully.');
                if (onTaskListRenamed) onTaskListRenamed();
                setEditingGroupId(null);
            } catch (err) {
                showToast('error', 'Error', 'Failed to rename task list.');
            } finally {
                setIsSaving(false);
            }
        };

        return (
            <div className="inline-flex items-center gap-2 py-1 select-none">
                {isEditing ? (
                    <InputText 
                        value={editingValue} 
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename();
                            if (e.key === 'Escape') setEditingGroupId(null);
                        }}
                        autoFocus
                        className="text-[12px] h-7 px-2 py-0 font-bold"
                        style={{ width: '180px' }}
                        disabled={isSaving}
                    />
                ) : (
                    <span 
                        className={`text-[12px] font-bold tracking-wide truncate ${canRename && groupBy === 'tasklist' && groupId !== null ? 'cursor-pointer hover:text-brand-teal-600 transition-colors' : ''}`}
                        style={{ color: 'var(--text-primary)', maxWidth: '250px' }}
                        onDoubleClick={() => {
                            if (canRename && groupBy === 'tasklist' && groupId !== null) {
                                setEditingGroupId(groupId);
                                setEditingValue(groupName);
                            }
                        }}
                        title={groupName + (canRename && groupBy === 'tasklist' && groupId !== null ? " (Double click to rename)" : "")}
                    >
                        {groupName}
                    </span>
                )}
            </div>
        );
    };

    const isGrouped = !!(groupBy && groupBy !== 'none');

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
                onValueChange={(e) => onValueChange?.(e as Task[])}
                scrollHeight="flex"
                size="small"
                {...(isGrouped ? {
                    rowGroupMode: 'subheader' as const,
                    groupRowsBy: '_groupId',
                    expandableRowGroups: true,
                    expandedRows: expandedGroups,
                    onRowToggle: (e: any) => setExpandedGroups(e.data),
                    rowGroupHeaderTemplate: headerTemplate,
                    sortMode: 'single' as const,
                    sortField: '_groupId',
                    sortOrder: 1 as const,
                } : {})}
                onRowClick={handleRowClick}
                rowClassName={(r) => r._isDummy ? 'bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 italic opacity-70' : 'cursor-pointer hover:bg-teal-50/40 dark:hover:bg-teal-900/10 transition-colors'}
                emptyMessage={
                    <div className="flex flex-col items-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
                        <span className="text-4xl">✅</span>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No tasks found</p>
                    </div>
                }
                pt={{
                    header: { className: 'pms-dt-header' },
                    headerRow: { className: 'pms-dt-header-row' },
                    bodyRow: { className: 'pms-dt-row' },
                    column: { bodyCell: { className: 'pms-dt-cell' }, headerCell: { className: 'pms-dt-head-cell' } },
                    rowGroupHeader: { 
                        className: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 py-0 h-10 border-b border-slate-100 dark:border-slate-800' 
                    },
                    rowGroupToggler: { 
                        className: 'w-8 h-8 p-0 mr-1 shadow-none hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-full transition-all' 
                    },
                }}
                className="pms-datatable"
                style={{ fontSize: 13 }}
            >
                { }
                <Column
                    field="public_id"
                    header="ID"
                    sortable
                    style={{ width: '90px', minWidth: '80px' }}
                    body={(r) => {
                        if (r._isDummy) return null;
                        return (
                            <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded"
                                style={{ background: `${TEAL}18`, color: TEAL }}>
                                {r.public_id ?? `TSK-${r.id}`}
                            </span>
                        );
                    }}
                />

                { }
                <Column
                    field="task_name"
                    header="Task Name"
                    sortable
                    filter
                    filterPlaceholder="Search..."
                    style={{ minWidth: '200px' }}
                    body={(r) => {
                        if (r._isDummy) {
                            return <span className="text-[12px] italic text-slate-400">No tasks in this list</span>;
                        }
                        return (
                            <span className="text-[13px] font-semibold block truncate max-w-[200px] sm:max-w-[300px]"
                                style={{ color: 'var(--text-primary)' }}
                                title={r.task_name}>
                                {r.task_name}
                            </span>
                        );
                    }}
                />

                { }
                <Column
                    field="duration"
                    header="Duration"
                    sortable
                    style={{ width: '90px', minWidth: '80px' }}
                    body={(r) => {
                        if (r._isDummy) return null;
                        return (
                            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                                {r.duration ? `${r.duration}d` : '—'}
                            </span>
                        );
                    }}
                />

                { }
                <Column
                    field="priority"
                    header="Priority"
                    sortable
                    style={{ width: '100px', minWidth: '90px' }}
                    body={(r) => r._isDummy ? null : <PriorityBadge priority={r.priority_master ?? r.priority} />}
                />

                { }
                <Column
                    field="single_owner"
                    header="Owner"
                    style={{ minWidth: '140px' }}
                    body={(r) => r._isDummy ? null : <OwnerCell owner={r.single_owner ?? r.creator} />}
                />

                { }
                <Column
                    field="status"
                    header="Status"
                    sortable
                    style={{ width: '120px', minWidth: '110px' }}
                    body={(r) => r._isDummy ? null : <StatusCell status={r.status_master ?? r.status} />}
                />

                { }
                <Column
                    field="tags"
                    header="Tags"
                    style={{ minWidth: '100px' }}
                    body={(r) => {
                        if (r._isDummy) return null;
                        if (!r.tags) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
                        return (
                            <div className="flex flex-wrap gap-1 max-w-[120px] overflow-hidden whitespace-nowrap">
                                {String(r.tags).split(',').slice(0, 2).map((t: string, i: number) => (
                                    <span key={i} className="text-[10px] font-semibold px-1.5 py-0.5 rounded truncate max-w-[50px]"
                                        style={{ background: '#e0f2fe', color: '#0369a1' }}
                                        title={t.trim()}>
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
                    body={(r) => r._isDummy ? null : <DateCell date={r.start_date} />}
                />

                <Column
                    field="due_date"
                    header="Due Date"
                    sortable
                    style={{ width: '110px', minWidth: '100px' }}
                    body={(r) => r._isDummy ? null : <DateCell date={r.due_date ?? r.end_date} warn />}
                />

                <Column
                    field="completion_percentage"
                    header="Completion %"
                    sortable
                    style={{ width: '130px', minWidth: '120px' }}
                    body={(r) => {
                        if (r._isDummy) return null;
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
                    body={(r) => {
                        if (r._isDummy) return null;
                        return (
                            <span className="text-[12px] font-semibold tabular-nums"
                                style={{ color: 'var(--text-primary)' }}>
                                {Number(r.estimated_hours ?? 0).toFixed(1)}h
                            </span>
                        );
                    }}
                />

                <Column
                    field="cached_timelog_total"
                    header="Timelog (T)"
                    sortable
                    style={{ width: '95px', minWidth: '85px' }}
                    body={(r) => {
                        if (r._isDummy) return null;
                        return (
                            <span className="text-[12px] font-semibold tabular-nums" style={{ color: TEAL }}>
                                {Number(r.cached_timelog_total || r.timelog_total || r.work_hours || 0).toFixed(1)}h
                            </span>
                        );
                    }}
                />

                <Column
                    field="difference"
                    header="Diff (P-T)"
                    sortable
                    style={{ width: '90px', minWidth: '80px' }}
                    body={(r) => {
                        if (r._isDummy) return null;
                        return (
                            <DiffCell
                                workHours={r.estimated_hours}
                                timelogTotal={r.cached_timelog_total || r.timelog_total || r.work_hours}
                            />
                        );
                    }}
                />

                <Column
                    field="billing_type"
                    header="Billing Type"
                    style={{ width: '100px', minWidth: '90px' }}
                    body={(r) => {
                        if (r._isDummy) return null;
                        return (
                            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                                {r.billing_type ?? '—'}
                            </span>
                        );
                    }}
                />

                <Column
                    header="Actions"
                    style={{ width: '80px', minWidth: '80px', textAlign: 'center' }}
                    body={(r) => {
                        if (r._isDummy) return null;
                        return (
                            <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => navigate(`/tasks/${r.id}/edit`)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-teal-600 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-900/20 transition-all"
                                    title="Edit Task"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => {
                                        confirmDialog({
                                            message: `Are you sure you want to delete task "${r.task_name}"?`,
                                            header: 'Confirm Deletion',
                                            icon: 'pi pi-exclamation-triangle',
                                            acceptClassName: 'p-button-danger',
                                            accept: () => {
                                                deleteTask(r.id, {
                                                    onSuccess: () => showToast('success', 'Deleted', 'Task deleted successfully'),
                                                    onError: () => showToast('error', 'Error', 'Failed to delete task')
                                                });
                                            }
                                        });
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                    title="Delete Task"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    }}
                />
            </DataTable>
        </div>
    );
}
