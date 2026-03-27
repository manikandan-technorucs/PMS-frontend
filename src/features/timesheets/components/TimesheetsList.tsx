import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/DataTable/DataTable';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from 'primereact/button';
import { Calendar as CalendarPicker } from 'primereact/calendar';
import { Plus, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTimesheets } from '@/features/timesheets/hooks/useTimesheets';
import { Timesheet } from '@/features/timesheets/services/timesheets.api';

function fmtNiceDate(s: string) { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtISO(d: Date) { return d.toISOString().split('T')[0]; }

type ViewMode = 'all' | 'week' | 'month' | 'range';

export function TimesheetsList() {
    const navigate = useNavigate();
    const { data: timesheets = [], isLoading } = useTimesheets();

    // Date range filter state
    const [viewMode, setViewMode] = useState<ViewMode>('all');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [rangeStart, setRangeStart] = useState(fmtISO(new Date()));
    const [rangeEnd, setRangeEnd] = useState(fmtISO(new Date()));

    const dateRange = useMemo(() => {
        if (viewMode === 'all') return null;
        if (viewMode === 'week') {
            const d = new Date(currentDate);
            const day = d.getDay();
            const start = new Date(d); start.setDate(d.getDate() - day);
            const end = new Date(start); end.setDate(start.getDate() + 6);
            return { start: fmtISO(start), end: fmtISO(end) };
        }
        if (viewMode === 'month') {
            const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            return { start: fmtISO(start), end: fmtISO(end) };
        }
        return { start: rangeStart, end: rangeEnd };
    }, [viewMode, currentDate, rangeStart, rangeEnd]);

    const navigateDate = (dir: 'prev' | 'next') => {
        const d = new Date(currentDate);
        if (viewMode === 'week') d.setDate(d.getDate() + (dir === 'next' ? 7 : -7));
        else if (viewMode === 'month') d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
        setCurrentDate(d);
    };

    const filteredTimesheets = useMemo(() => {
        if (!dateRange) return timesheets;
        return timesheets.filter(ts => {
            return ts.start_date <= dateRange.end && ts.end_date >= dateRange.start;
        });
    }, [timesheets, dateRange]);

    const dateRangeLabel = useMemo(() => {
        if (!dateRange) return 'All Timesheets';
        return `${fmtNiceDate(dateRange.start)} — ${fmtNiceDate(dateRange.end)}`;
    }, [dateRange]);

    // PrimeReact Column Body Templates to maintain exact Figma styles
    const nameTemplate = (rowData: Timesheet) => (
        <span className="font-medium text-theme-primary hover:text-brand-teal-500 transition-colors">{rowData.name}</span>
    );

    const projectTemplate = (rowData: Timesheet) => (
        <span className="text-theme-secondary">{rowData.project?.name || '—'}</span>
    );

    const periodTemplate = (rowData: Timesheet) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap text-theme-secondary">
            <Clock className="w-3 h-3 text-theme-muted" />
            {fmtNiceDate(rowData.start_date)} to {fmtNiceDate(rowData.end_date)}
        </div>
    );

    const userTemplate = (rowData: Timesheet) => {
        if (!rowData.user) return '—';
        return (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-teal-50 text-brand-teal-600 flex items-center justify-center font-bold text-[10px]">
                    {rowData.user.first_name[0]}{rowData.user.last_name[0]}
                </div>
                <span className="text-theme-secondary">{rowData.user.first_name} {rowData.user.last_name}</span>
            </div>
        );
    };

    const statusTemplate = (rowData: Timesheet) => {
        const status = rowData.approval_status || 'Pending';
        const styles = status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
            status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-amber-100 text-amber-800';
        return (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${styles}`}>
                {status}
            </span>
        );
    };

    // Global CSS variables config using PrimeReact pass-through (PT)
    const tablePt = {
        root: { className: 'w-full text-[13px] border-collapse' },
        headerRow: { className: 'bg-theme-neutral border-b text-theme-secondary' },
        bodyRow: { className: 'hover:bg-theme-neutral/60 cursor-pointer transition-colors border-b last:border-0' }
    };

    return (
        <PageLayout
            title="Timesheets"
            isFullHeight
            actions={
                <Button onClick={() => navigate('/timesheets/create')} className="btn-gradient">
                    <Plus className="w-4 h-4 mr-2" /> Create Timesheet
                </Button>
            }
        >
            <div className="h-full flex flex-col overflow-hidden space-y-4">
                {/* Filter Bar */}
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-3 shadow-sm space-y-3 flex-shrink-0">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex bg-slate-100/50 dark:bg-slate-800/50 rounded-lg p-1 gap-1">
                            {([['all', 'All'], ['week', 'Weekly'], ['month', 'Monthly'], ['range', 'Custom Range']] as const).map(([mode, label]) => (
                                <Button
                                    key={mode}
                                    label={label}
                                    text={viewMode !== mode}
                                    onClick={() => setViewMode(mode as ViewMode)}
                                    size="small"
                                    className={`!text-[13px] !px-4 !py-1.5 !rounded-md ${
                                        viewMode === mode
                                            ? 'btn-gradient shadow-sm'
                                            : '!text-slate-500 hover:!text-slate-800 dark:hover:!text-slate-200'
                                    }`}
                                />
                            ))}
                        </div>

                        {(viewMode === 'week' || viewMode === 'month') && (
                            <div className="flex items-center gap-2">
                                <Button
                                    icon={<ChevronLeft className="w-4 h-4 text-theme-muted" />}
                                    text
                                    className="!p-1.5 hover:!bg-theme-neutral !border !border-theme-border !w-8 !h-8"
                                    onClick={() => navigateDate('prev')}
                                />
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal-50 border border-brand-teal-200 rounded-md h-8">
                                    <Calendar className="w-3.5 h-3.5 text-brand-teal-500" />
                                    <span className="text-[13px] font-medium text-brand-teal-600">{dateRangeLabel}</span>
                                </div>
                                <Button
                                    icon={<ChevronRight className="w-4 h-4 text-theme-muted" />}
                                    text
                                    className="!p-1.5 hover:!bg-theme-neutral !border !border-theme-border !w-8 !h-8"
                                    onClick={() => navigateDate('next')}
                                />
                            </div>
                        )}
                    </div>

                    {viewMode === 'range' && (
                        <div className="flex items-center gap-3 pt-2 border-t">
                            <label className="text-[13px] text-theme-muted">From:</label>
                            <CalendarPicker
                                value={rangeStart ? new Date(rangeStart) : null}
                                onChange={(e) => setRangeStart(e.value ? fmtISO(e.value as Date) : '')}
                                dateFormat="yy-mm-dd"
                                className="!border-0 !shadow-none"
                                inputClassName="px-3 py-1.5 border border-theme-border rounded-md text-[13px] bg-theme-surface text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-teal-500/30 !w-32"
                                showIcon={false}
                            />
                            <label className="text-[13px] text-theme-muted ml-2">To:</label>
                            <CalendarPicker
                                value={rangeEnd ? new Date(rangeEnd) : null}
                                onChange={(e) => setRangeEnd(e.value ? fmtISO(e.value as Date) : '')}
                                dateFormat="yy-mm-dd"
                                className="!border-0 !shadow-none"
                                inputClassName="px-3 py-1.5 border border-theme-border rounded-md text-[13px] bg-theme-surface text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-teal-500/30 !w-32"
                                showIcon={false}
                            />
                        </div>
                    )}
                </div>

                {filteredTimesheets.length > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-brand-teal-50/50 dark:bg-brand-teal-900/20 backdrop-blur-sm text-[13px] flex-shrink-0">
                        <span className="text-slate-600 dark:text-slate-400">Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredTimesheets.length}</span> timesheet(s)</span>
                        <span className="text-slate-600 dark:text-slate-400">Total Hours: <span className="font-bold text-brand-teal-600">{filteredTimesheets.reduce((s, ts) => s + Number(ts.total_hours || 0), 0).toFixed(2)}h</span></span>
                    </div>
                )}

                <div className="flex-1 overflow-auto rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm flex flex-col">
                    <DataTable
                        columns={[
                            { key: 'name', header: 'Timesheet Name', render: (_, r) => nameTemplate(r) },
                            { key: 'project', header: 'Project', render: (_, r) => projectTemplate(r) },
                            { key: 'period', header: 'Time Period', render: (_, r) => periodTemplate(r) },
                            { key: 'user', header: 'Log Users', render: (_, r) => userTemplate(r) },
                            { key: 'billing_type', header: 'Billing Type', render: (val) => <span className="text-theme-secondary">{String(val)}</span> },
                            { key: 'total_hours', header: 'Total Hours', render: (val) => <span className="font-medium text-theme-secondary text-right block">{Number(val).toFixed(2)}h</span> },
                            { key: 'approval_status', header: 'Approval Status', render: (_, r) => statusTemplate(r) },
                        ]}
                        data={filteredTimesheets}
                        loading={isLoading}
                        itemsPerPage={10}
                        onRowClick={(r) => navigate(`/timesheets/${r.id}`)}
                        emptyMessage={
                            <div className="flex flex-col items-center justify-center py-10">
                                <Clock className="w-10 h-10 mx-auto text-[#D1D5DB] mb-3" />
                                <p className="text-[#6B7280] text-[14px]">
                                    {viewMode === 'all' ? 'No Timesheets found' : `No Timesheets found for ${dateRangeLabel}`}
                                </p>
                            </div>
                        }
                    />
                </div>
            </div>
        </PageLayout>
    );
}
