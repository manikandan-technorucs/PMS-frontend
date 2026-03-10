import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
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
        <span className="font-medium text-[#374151] hover:text-[#059669] transition-colors">{rowData.name}</span>
    );

    const projectTemplate = (rowData: Timesheet) => (
        <span className="text-[#374151]">{rowData.project?.name || '—'}</span>
    );

    const periodTemplate = (rowData: Timesheet) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap text-[#374151]">
            <Clock className="w-3 h-3 text-[#6B7280]" />
            {fmtNiceDate(rowData.start_date)} to {fmtNiceDate(rowData.end_date)}
        </div>
    );

    const userTemplate = (rowData: Timesheet) => {
        if (!rowData.user) return '—';
        return (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold text-[10px]">
                    {rowData.user.first_name[0]}{rowData.user.last_name[0]}
                </div>
                <span className="text-[#374151]">{rowData.user.first_name} {rowData.user.last_name}</span>
            </div>
        );
    };

    const statusTemplate = (rowData: Timesheet) => {
        const status = rowData.approval_status || 'Pending';
        const styles = status === 'Approved' ? 'bg-[#D1FAE5] text-[#065F46]' :
            status === 'Rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                'bg-[#FEF3C7] text-[#92400E]';
        return (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${styles}`}>
                {status}
            </span>
        );
    };

    // Global CSS variables config using PrimeReact pass-through (PT)
    const tablePt = {
        root: { className: 'w-full text-[13px] border-collapse' },
        headerRow: { className: 'bg-[#F9FAFB] border-b text-[#4B5563]' },
        bodyRow: { className: 'hover:bg-[#F9FAFB]/60 cursor-pointer transition-colors border-b last:border-0' }
    };

    return (
        <PageLayout
            title="Timesheets"
            isFullHeight
            actions={
                <Button onClick={() => navigate('/timesheets/create')}>
                    <Plus className="w-4 h-4 mr-2" /> Create Timesheet
                </Button>
            }
        >
            <div className="h-full flex flex-col overflow-hidden space-y-4">
                {/* Filter Bar */}
                <div className="bg-white border rounded-[6px] p-3 shadow-sm space-y-3 flex-shrink-0">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex bg-[#F3F4F6] rounded-[6px] p-1">
                            {([['all', 'All'], ['week', 'Weekly'], ['month', 'Monthly'], ['range', 'Custom Range']] as const).map(([mode, label]) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode as ViewMode)}
                                    className={`px-4 py-1.5 text-[13px] font-medium rounded-[4px] transition-colors ${viewMode === mode
                                        ? 'bg-white text-[#059669] shadow-sm'
                                        : 'text-[#6B7280] hover:text-[#374151]'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {(viewMode === 'week' || viewMode === 'month') && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => navigateDate('prev')} className="p-1.5 hover:bg-gray-100 rounded-[4px] border">
                                    <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
                                </button>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px]">
                                    <Calendar className="w-3.5 h-3.5 text-[#059669]" />
                                    <span className="text-[13px] font-medium text-[#059669]">{dateRangeLabel}</span>
                                </div>
                                <button onClick={() => navigateDate('next')} className="p-1.5 hover:bg-gray-100 rounded-[4px] border">
                                    <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                                </button>
                            </div>
                        )}
                    </div>

                    {viewMode === 'range' && (
                        <div className="flex items-center gap-3 pt-2 border-t">
                            <label className="text-[13px] text-[#6B7280]">From:</label>
                            <input
                                type="date"
                                value={rangeStart}
                                onChange={e => setRangeStart(e.target.value)}
                                className="px-3 py-1.5 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                            />
                            <label className="text-[13px] text-[#6B7280]">To:</label>
                            <input
                                type="date"
                                value={rangeEnd}
                                onChange={e => setRangeEnd(e.target.value)}
                                className="px-3 py-1.5 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                            />
                        </div>
                    )}
                </div>

                {filteredTimesheets.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px] text-[13px] flex-shrink-0">
                        <span className="text-[#6B7280]">Showing <span className="font-bold text-[#1F2937]">{filteredTimesheets.length}</span> timesheet(s)</span>
                        <span className="text-[#6B7280]">Total Hours: <span className="font-bold text-[#059669]">{filteredTimesheets.reduce((s, ts) => s + Number(ts.total_hours || 0), 0).toFixed(2)}h</span></span>
                    </div>
                )}

                {/* PrimeReact DataTable Component Integrated */}
                <div className="flex-1 overflow-auto bg-white rounded-lg border shadow-sm">
                    <DataTable
                        paginator
                        rows={10}
                        rowsPerPageOptions={[10, 25, 50]}
                        value={filteredTimesheets}
                        loading={isLoading}
                        emptyMessage={
                            <div className="flex flex-col items-center justify-center py-10">
                                <Clock className="w-10 h-10 mx-auto text-[#D1D5DB] mb-3" />
                                <p className="text-[#6B7280] text-[14px]">
                                    {viewMode === 'all' ? 'No Timesheets found' : `No Timesheets found for ${dateRangeLabel}`}
                                </p>
                            </div>
                        }
                        onRowClick={(e) => navigate(`/timesheets/${e.data.id}`)}
                        pt={tablePt}
                        className="overflow-hidden"
                    >
                        <Column field="name" header="Timesheet Name" body={nameTemplate} headerClassName="text-left px-4 py-3 font-semibold text-[#4B5563]" bodyClassName="px-4 py-3" />
                        <Column field="project.name" header="Project" body={projectTemplate} headerClassName="text-left px-4 py-3 font-semibold text-[#4B5563]" bodyClassName="px-4 py-3" />
                        <Column header="Time Period" body={periodTemplate} headerClassName="text-left px-4 py-3 font-semibold text-[#4B5563]" bodyClassName="px-4 py-3" />
                        <Column header="Log Users" body={userTemplate} headerClassName="text-left px-4 py-3 font-semibold text-[#4B5563]" bodyClassName="px-4 py-3" />
                        <Column field="billing_type" header="Billing Type" headerClassName="text-left px-4 py-3 font-semibold text-[#4B5563]" bodyClassName="px-4 py-3 text-[#374151]" />
                        <Column field="total_hours" header="Total Hours" headerClassName="text-right px-4 py-3 font-semibold text-[#4B5563]" bodyClassName="px-4 py-3 text-right font-medium text-[#374151]" body={(rowData) => `${Number(rowData.total_hours).toFixed(2)}h`} />
                        <Column field="approval_status" header="Approval Status" headerClassName="text-center px-4 py-3 font-semibold text-[#4B5563]" bodyClassName="px-4 py-3 text-center" body={statusTemplate} />
                    </DataTable>
                </div>
            </div>
        </PageLayout>
    );
}
