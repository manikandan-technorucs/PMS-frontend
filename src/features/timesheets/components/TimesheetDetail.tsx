import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from 'primereact/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, X, CheckCircle, XCircle } from 'lucide-react';
import { timesheetsService, Timesheet } from '@/features/timesheets/services/timesheets.api';
import { timelogsService, TimeLog } from '@/features/timelogs/services/timelogs.api';
import { tasksService } from '@/features/tasks/services/tasks.api';
import { useToast } from '@/providers/ToastContext';
import { useAuth } from '@/auth/AuthProvider';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';

type ViewMode = 'day' | 'week' | 'month';

function fmtISO(d: Date) { return d.toISOString().split('T')[0]; }
function fmtNice(s: string) { return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtDay(s: string) { const d = new Date(s + 'T00:00:00'); return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(); }
function fmtDayNum(s: string) { return String(new Date(s + 'T00:00:00').getDate()).padStart(2, '0'); }

function getDatesForRange(viewMode: ViewMode, refDate: Date): string[] {
    if (viewMode === 'day') return [fmtISO(refDate)];
    if (viewMode === 'week') {
        const day = refDate.getDay();
        const start = new Date(refDate);
        start.setDate(start.getDate() - day);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return fmtISO(d);
        });
    }
    // month
    const start = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    const end = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
    const dates: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(fmtISO(new Date(d)));
    }
    return dates;
}

interface GridRow {
    rowId: string;
    taskId: number | null;
    taskName: string;
    hours: Record<string, number>; // date -> hours
    existingLogIds: Record<string, number>; // date -> timelog.id (for updates)
}

export function TimesheetDetail() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { showToast } = useToast();
    const { user } = useAuth();

    const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [rows, setRows] = useState<GridRow[]>([]);
    const [projectTasks, setProjectTasks] = useState<any[]>([]);
    const [showAddRow, setShowAddRow] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [customTaskName, setCustomTaskName] = useState('');

    useEffect(() => { fetchData(); }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const ts = await timesheetsService.getTimesheet(Number(id));
            setTimesheet(ts);
            if (ts.start_date) setCurrentDate(new Date(ts.start_date + 'T00:00:00'));

            // Load tasks for the project
            try {
                const tasksRes = await tasksService.getTasks(0, 500, ts.project_id);
                setProjectTasks(tasksRes);
            } catch { setProjectTasks([]); }

            // Load existing time logs for this project/user in the timesheet date window
            const logs = await timelogsService.getTimelogs(0, 2000, ts.project_id);
            const filteredLogs = logs.filter(l =>
                l.user_id === ts.user_id &&
                l.date >= ts.start_date &&
                l.date <= ts.end_date
            );

            // Group logs into rows by task/description
            const rowMap: Record<string, GridRow> = {};
            filteredLogs.forEach(l => {
                const key = l.task_id ? `task-${l.task_id}` : `desc-${l.description || 'general'}`;
                if (!rowMap[key]) {
                    rowMap[key] = {
                        rowId: key,
                        taskId: l.task_id || null,
                        taskName: l.task?.title || l.description || 'General',
                        hours: {},
                        existingLogIds: {}
                    };
                }
                const dateKey = l.date?.split('T')[0] || l.date;
                rowMap[key].hours[dateKey] = (rowMap[key].hours[dateKey] || 0) + l.hours;
                rowMap[key].existingLogIds[dateKey] = l.id;
            });

            setRows(Object.values(rowMap));
        } catch (error) {
            console.error(error);
            showToast('error', 'Error', 'Failed to load timesheet details');
        } finally {
            setLoading(false);
        }
    };

    const dates = useMemo(() => getDatesForRange(viewMode, currentDate), [viewMode, currentDate]);
    const dateRangeLabel = dates.length === 1
        ? fmtNice(dates[0])
        : `${fmtNice(dates[0])} to ${fmtNice(dates[dates.length - 1])}`;

    const navigateDate = (dir: 'prev' | 'next') => {
        const d = new Date(currentDate);
        if (viewMode === 'day') d.setDate(d.getDate() + (dir === 'next' ? 1 : -1));
        else if (viewMode === 'week') d.setDate(d.getDate() + (dir === 'next' ? 7 : -7));
        else d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
        setCurrentDate(d);
    };

    const updateCellHours = useCallback((rowId: string, dateKey: string, value: string) => {
        const numVal = parseFloat(value) || 0;
        setRows(prev => prev.map(r =>
            r.rowId === rowId
                ? { ...r, hours: { ...r.hours, [dateKey]: numVal } }
                : r
        ));
    }, []);

    const addRow = () => {
        if (!selectedTask && !customTaskName.trim()) {
            showToast('error', 'Error', 'Please select a task or enter a description');
            return;
        }
        const newRow: GridRow = {
            rowId: `new-${Date.now()}`,
            taskId: selectedTask ? selectedTask.id : null,
            taskName: selectedTask ? selectedTask.title || selectedTask.name : customTaskName,
            hours: {},
            existingLogIds: {}
        };
        setRows(prev => [...prev, newRow]);
        setShowAddRow(false);
        setSelectedTask(null);
        setCustomTaskName('');
    };

    const removeRow = (rowId: string) => {
        setRows(prev => prev.filter(r => r.rowId !== rowId));
    };

    const dailyTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        dates.forEach(d => {
            totals[d] = rows.reduce((sum, r) => sum + (r.hours[d] || 0), 0);
        });
        return totals;
    }, [rows, dates]);

    const grandTotal = useMemo(() =>
        Object.values(dailyTotals).reduce((s, v) => s + v, 0)
        , [dailyTotals]);

    const getRowTotal = (row: GridRow) =>
        dates.reduce((sum, d) => sum + (row.hours[d] || 0), 0);

    const handleSave = async (submitForApproval = false) => {
        if (!timesheet) return;
        setSaving(true);
        try {
            // For each row, for each date with hours > 0, create or update a timelog
            for (const row of rows) {
                for (const dateKey of Object.keys(row.hours)) {
                    const h = row.hours[dateKey];
                    if (h <= 0) continue;

                    const existingId = row.existingLogIds[dateKey];
                    const payload = {
                        user_id: timesheet.user_id,
                        project_id: timesheet.project_id,
                        task_id: row.taskId || undefined,
                        date: dateKey,
                        hours: h,
                        description: row.taskId ? undefined : row.taskName,
                        timesheet_id: timesheet.id,
                        billing_type: timesheet.billing_type,
                    };

                    if (existingId) {
                        await timelogsService.updateTimelog(existingId, payload);
                    } else {
                        const created = await timelogsService.createTimelog(payload);
                        row.existingLogIds[dateKey] = created.id;
                    }
                }
            }

            // Update timesheet total_hours and status
            const updated = await timesheetsService.updateTimesheet(timesheet.id, {
                total_hours: grandTotal,
                approval_status: submitForApproval ? 'Pending' : timesheet.approval_status
            });
            setTimesheet(updated);

            showToast('success', submitForApproval ? 'Sent for Approval' : 'Saved', 'Timesheet hours saved successfully');
            if (submitForApproval) navigate('/timesheets');
        } catch (error) {
            console.error(error);
            showToast('error', 'Error', 'Failed to save timesheet hours');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!timesheet) return;
        setSaving(true);
        try {
            const updated = await timesheetsService.updateTimesheet(timesheet.id, {
                approval_status: newStatus
            });
            setTimesheet(updated);
            showToast('success', 'Status Updated', `Timesheet ${newStatus.toLowerCase()} successfully`);
        } catch (error) {
            console.error(error);
            showToast('error', 'Error', `Failed to ${newStatus.toLowerCase()} timesheet`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-[#6B7280]">Loading timesheet...</div>;
    if (!timesheet) return <div className="p-8 text-center text-[#6B7280]">Timesheet not found</div>;

    return (
        <PageLayout
            title={timesheet.name}
            actions={
                <div className="flex items-center gap-3">
                    {timesheet.approval_status === 'Pending' && (user?.role?.name === 'Super Admin' || user?.role?.name === 'Manager') && (
                        <>
                            <Button
                                className="btn-gradient"
                                onClick={() => handleUpdateStatus('Approved')}
                                disabled={saving}
                                icon={<CheckCircle className="w-4 h-4 mr-2" />}
                                label="Approve"
                            />
                            <Button
                                severity="danger"
                                outlined
                                onClick={() => handleUpdateStatus('Rejected')}
                                disabled={saving}
                                icon={<XCircle className="w-4 h-4 mr-2" />}
                                label="Reject"
                            />
                        </>
                    )}
                    <Button outlined onClick={() => navigate('/timesheets')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Header Bar: Date range + meta info */}
                <div className="card-base rounded-[6px] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* View Mode Switcher */}
                        <div className="flex bg-[#F3F4F6] rounded-[6px] p-1">
                            {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
                                <Button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    text={viewMode !== mode}
                                    className={`!px-3 !py-1.5 !text-[12px] capitalize ${viewMode === mode ? 'btn-gradient !shadow-sm' : ''}`}
                                    label={mode}
                                />
                            ))}
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-1.5">
                            <Button 
                                icon={<ChevronLeft className="w-4 h-4" />} 
                                onClick={() => navigateDate('prev')} 
                                outlined 
                                className="!p-1.5 !w-8 !h-8" 
                            />
                            <span className="text-[13px] font-semibold text-brand-teal-600 min-w-[180px] text-center">{dateRangeLabel}</span>
                            <Button 
                                icon={<ChevronRight className="w-4 h-4" />} 
                                onClick={() => navigateDate('next')} 
                                outlined 
                                className="!p-1.5 !w-8 !h-8" 
                            />
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-3 border-l pl-3 text-[12px] text-[#6B7280]">
                            <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${timesheet.approval_status === 'Approved' ? 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]' :
                                timesheet.approval_status === 'Rejected' ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]' :
                                    timesheet.approval_status === 'Pending' ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' :
                                        'bg-[#F3F4F6] text-[#374151] border-[#D1D5DB]'
                                }`}>
                                {timesheet.approval_status || 'Draft'}
                            </div>
                            {timesheet.user && (
                                <div className="flex items-center gap-1.5 border rounded-[4px] px-2 py-1 bg-[#F9FAFB]">
                                    <div className="w-5 h-5 rounded-full bg-[#f0fdfa] text-[#14b8a6] flex items-center justify-center font-bold text-[9px]">
                                        {timesheet.user.first_name?.[0]}{timesheet.user.last_name?.[0]}
                                    </div>
                                    <span className="text-[12px] text-[#374151]">Log Users (1)</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <span>Billing Type:</span>
                                <span className="font-medium text-[#14b8a6]">{timesheet.billing_type}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timesheet Grid */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[13px] border-collapse">
                            <thead>
                                <tr className="border-b bg-[#F9FAFB]">
                                    <th className="text-left px-3 py-2.5 font-semibold text-[#6B7280] min-w-[130px] sticky left-0 bg-[#F9FAFB] z-10">USER</th>
                                    <th className="text-left px-3 py-2.5 font-semibold text-[#6B7280] min-w-[180px] sticky left-[130px] bg-[#F9FAFB] z-10">TASK/ISSUES</th>
                                    {dates.map(date => {
                                        const isWeekend = [0, 6].includes(new Date(date + 'T00:00:00').getDay());
                                        return (
                                            <th key={date} className={`text-center px-1 py-2.5 font-semibold text-[#6B7280] min-w-[65px] text-[11px] uppercase ${isWeekend ? 'bg-[#F3F4F6]' : ''}`}>
                                                <div>{fmtDay(date)}</div>
                                                <div className="text-[10px]">{fmtDayNum(date)}</div>
                                            </th>
                                        );
                                    })}
                                    <th className="text-right px-3 py-2.5 font-semibold text-[#6B7280] min-w-[70px]">TOTAL</th>
                                    <th className="w-8 px-1"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(row => (
                                    <tr key={row.rowId} className="border-b hover:bg-[#FAFBFC] group">
                                        <td className="px-3 py-3 sticky left-0 bg-white z-10 group-hover:bg-[#FAFBFC]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-[#f0fdfa] text-[#14b8a6] flex items-center justify-center font-bold text-[10px]">
                                                    {timesheet.user?.first_name?.[0]}{timesheet.user?.last_name?.[0]}
                                                </div>
                                                <span className="text-[#374151] font-medium text-[12px] truncate max-w-[80px]">{timesheet.user?.first_name} {timesheet.user?.last_name?.[0]}.</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 border-l border-r sticky left-[130px] bg-white z-10 group-hover:bg-[#FAFBFC]">
                                            <div className="flex items-center gap-1.5 px-2 py-1.5 border border-dashed rounded text-[12px] text-[#374151] bg-gray-50/50">
                                                <span className="truncate">{row.taskName}</span>
                                            </div>
                                        </td>
                                        {dates.map(date => {
                                            const h = row.hours[date] || 0;
                                            const isWeekend = [0, 6].includes(new Date(date + 'T00:00:00').getDay());
                                            return (
                                                <td key={date} className={`text-center px-1 py-2 border-r ${isWeekend ? 'bg-[#F9FAFB]/50' : ''}`}>
                                                    <input
                                                        type="text"
                                                        className="w-14 text-center border border-transparent hover:border-[#D1D5DB] focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]/30 rounded py-1 text-[13px] outline-none transition-colors bg-transparent"
                                                        placeholder="—"
                                                        value={h > 0 ? h.toFixed(2) : ''}
                                                        onChange={e => updateCellHours(row.rowId, date, e.target.value)}
                                                    />
                                                </td>
                                            );
                                        })}
                                        <td className="text-right px-3 py-3 font-semibold text-[#1F2937]">
                                            {getRowTotal(row) > 0 ? getRowTotal(row).toFixed(2) : '—'}
                                        </td>
                                        <td className="px-1 py-3">
                                            <Button 
                                                text 
                                                severity="danger" 
                                                icon={<X className="w-3.5 h-3.5" />} 
                                                onClick={() => removeRow(row.rowId)} 
                                                className="opacity-0 group-hover:opacity-100 !p-1" 
                                            />
                                        </td>
                                    </tr>
                                ))}

                                {/* Add Row */}
                                <tr className="border-b">
                                    <td colSpan={2} className="px-3 py-3 border-r sticky left-0 bg-white z-10">
                                        {showAddRow ? (
                                            <div className="flex flex-col gap-2">
                                                <ServerSearchDropdown 
                                                    entityType="tasks"
                                                    value={selectedTask}
                                                    onChange={v => { setSelectedTask(v); setCustomTaskName(''); }}
                                                    filters={{ project_id: timesheet.project_id }}
                                                    placeholder="Select task..."
                                                    field="title"
                                                />
                                                {!selectedTask && (
                                                    <input
                                                        placeholder="Or type a description..."
                                                        value={customTaskName}
                                                        onChange={e => setCustomTaskName(e.target.value)}
                                                        className="w-full h-8 border rounded-[4px] px-2 text-[12px] focus:ring-1 focus:ring-[#14b8a6] outline-none"
                                                    />
                                                )}
                                                <div className="flex gap-2">
                                                    <Button label="Add" onClick={addRow} className="btn-gradient !px-3 !py-1 !text-[11px]" />
                                                    <Button label="Cancel" outlined onClick={() => setShowAddRow(false)} className="!px-3 !py-1 !text-[11px]" />
                                                </div>
                                            </div>
                                        ) : (
                                            <Button 
                                                text 
                                                onClick={() => setShowAddRow(true)} 
                                                icon={<Plus className="w-4 h-4 mr-1" />} 
                                                label="Add Row"
                                                className="!text-[13px] !text-brand-teal-600 font-medium hover:underline"
                                            />
                                        )}
                                    </td>
                                    {dates.map(date => (
                                        <td key={date} className={`text-center px-1 py-3 font-semibold border-r ${[0, 6].includes(new Date(date + 'T00:00:00').getDay()) ? 'bg-[#F9FAFB]/50' : ''}`}>
                                            {dailyTotals[date] > 0 ? <span className="text-theme-primary">{dailyTotals[date].toFixed(2)}</span> : <span className="text-transparent">—</span>}
                                        </td>
                                    ))}
                                    <td className="text-right px-3 py-3 font-bold text-brand-teal-600 text-[14px]">
                                        {grandTotal.toFixed(2)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t flex items-center justify-start gap-4 bg-gray-50/50">
                        <Button onClick={() => handleSave(false)} disabled={saving} className="btn-gradient min-w-[120px]">
                            {saving ? 'Saving...' : 'Save as Draft'}
                        </Button>
                        {timesheet.approval_status === 'Draft' && (
                            <Button
                                outlined
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                label="Send for Approval"
                            />
                        )}
                        {(user?.role?.name === 'Super Admin' || user?.role?.name === 'Manager') && timesheet.approval_status === 'Pending' && (
                            <>
                                <div className="h-6 w-px bg-gray-300 mx-1" />
                                <Button
                                    className="btn-gradient"
                                    onClick={() => handleUpdateStatus('Approved')}
                                    disabled={saving}
                                    icon={<CheckCircle className="w-4 h-4 mr-2" />}
                                    label="Approve"
                                />
                                <Button
                                    severity="danger"
                                    outlined
                                    onClick={() => handleUpdateStatus('Rejected')}
                                    disabled={saving}
                                    icon={<XCircle className="w-4 h-4 mr-2" />}
                                    label="Reject"
                                />
                            </>
                        )}
                        <Button outlined onClick={() => navigate('/timesheets')} label="Cancel" />
                    </div>
                </Card>
            </div>
        </PageLayout>
    );
}
