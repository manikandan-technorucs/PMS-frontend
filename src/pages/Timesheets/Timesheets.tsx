import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { timesheetsService, Timesheet } from '@/services/timesheets';
import { Plus, Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

function fmtNiceDate(s: string) { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtISO(d: Date) { return d.toISOString().split('T')[0]; }

type ViewMode = 'all' | 'week' | 'month' | 'range';

export function Timesheets() {
    const navigate = useNavigate();
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [loading, setLoading] = useState(true);

    // Date range filter state
    const [viewMode, setViewMode] = useState<ViewMode>('all');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [rangeStart, setRangeStart] = useState(fmtISO(new Date()));
    const [rangeEnd, setRangeEnd] = useState(fmtISO(new Date()));

    useEffect(() => {
        fetchTimesheets();
    }, []);

    const fetchTimesheets = async () => {
        setLoading(true);
        try {
            const data = await timesheetsService.getTimesheets();
            setTimesheets(data);
        } catch (error) {
            console.error("Failed to fetch timesheets:", error);
        } finally {
            setLoading(false);
        }
    };

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
            // A timesheet overlaps with the range if ts.start <= range.end AND ts.end >= range.start
            return ts.start_date <= dateRange.end && ts.end_date >= dateRange.start;
        });
    }, [timesheets, dateRange]);

    const dateRangeLabel = useMemo(() => {
        if (!dateRange) return 'All Timesheets';
        return `${fmtNiceDate(dateRange.start)} — ${fmtNiceDate(dateRange.end)}`;
    }, [dateRange]);

    return (
        <PageLayout
            title="Timesheets"
            actions={
                <Button onClick={() => navigate('/timesheets/create')}>
                    <Plus className="w-4 h-4 mr-2" /> Create Timesheet
                </Button>
            }
        >
            <div className="space-y-4">
                {/* Filter Bar */}
                <div className="bg-white border rounded-[6px] p-3 shadow-sm space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        {/* View Mode Tabs */}
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

                        {/* Date Navigation (for week/month) */}
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

                    {/* Custom Range Inputs */}
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

                {/* Summary Bar */}
                {filteredTimesheets.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px] text-[13px]">
                        <span className="text-[#6B7280]">Showing <span className="font-bold text-[#1F2937]">{filteredTimesheets.length}</span> timesheet(s)</span>
                        <span className="text-[#6B7280]">Total Hours: <span className="font-bold text-[#059669]">{filteredTimesheets.reduce((s, ts) => s + Number(ts.total_hours || 0), 0).toFixed(2)}h</span></span>
                    </div>
                )}

                {/* Timesheet Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr className="bg-[#F9FAFB] border-b text-[#4B5563]">
                                    <th className="text-left px-4 py-3 font-semibold">Timesheet Name</th>
                                    <th className="text-left px-4 py-3 font-semibold">Project</th>
                                    <th className="text-left px-4 py-3 font-semibold">Time Period</th>
                                    <th className="text-left px-4 py-3 font-semibold">Log Users</th>
                                    <th className="text-left px-4 py-3 font-semibold">Billing Type</th>
                                    <th className="text-right px-4 py-3 font-semibold">Total Hours</th>
                                    <th className="text-center px-4 py-3 font-semibold">Approval Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr><td colSpan={7} className="text-center py-6 text-[#6B7280]">Loading timesheets...</td></tr>
                                ) : filteredTimesheets.length > 0 ? (
                                    filteredTimesheets.map(ts => (
                                        <tr key={ts.id} className="hover:bg-[#F9FAFB]/60 cursor-pointer transition-colors" onClick={() => navigate(`/timesheets/${ts.id}`)}>
                                            <td className="px-4 py-3 font-medium text-[#374151] hover:text-[#059669] transition-colors">{ts.name}</td>
                                            <td className="px-4 py-3 text-[#374151]">{ts.project?.name || '—'}</td>
                                            <td className="px-4 py-3 text-[#374151] whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3 text-[#6B7280]" />
                                                    {fmtNiceDate(ts.start_date)} to {fmtNiceDate(ts.end_date)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {ts.user ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold text-[10px]">
                                                            {ts.user.first_name[0]}{ts.user.last_name[0]}
                                                        </div>
                                                        <span className="text-[#374151]">{ts.user.first_name} {ts.user.last_name}</span>
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-[#374151]">{ts.billing_type || '—'}</td>
                                            <td className="px-4 py-3 text-right font-medium text-[#374151]">{Number(ts.total_hours).toFixed(2)}h</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${ts.approval_status === 'Approved' ? 'bg-[#D1FAE5] text-[#065F46]' :
                                                    ts.approval_status === 'Rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                                                        'bg-[#FEF3C7] text-[#92400E]'
                                                    }`}>
                                                    {ts.approval_status || 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10">
                                            <Clock className="w-10 h-10 mx-auto text-[#D1D5DB] mb-3" />
                                            <p className="text-[#6B7280] text-[14px]">
                                                {viewMode === 'all' ? 'No Timesheets found' : `No Timesheets found for ${dateRangeLabel}`}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </PageLayout>
    );
}
