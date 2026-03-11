import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { TableSkeleton } from '@/shared/components/ui/Skeleton/TableSkeleton';
import { Button } from '@/shared/components/ui/Button/Button';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { DataTable } from '@/shared/components/lists/DataTable/DataTable';
import { useToast } from '@/shared/context/ToastContext';
import {
  Plus, Calendar, Download, ChevronLeft, ChevronRight, Clock, Filter, Edit, Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { timelogsService, TimeLog as ITimeLog } from '@/features/timelogs/services/timelogs.api';
import { exportToCSV } from '@/shared/utils/export';
import { ConfirmDialog } from '@/shared/components/modals/ConfirmDialog/ConfirmDialog';
import { ViewToggle } from '@/shared/components/ui/ViewToggle/ViewToggle';
import { TimeLogsKanbanView } from './TimeLogsKanbanView';
import { FilterSidebar } from '@/shared/components/ui/FilterSidebar';
import { useUsers, useStatuses, usePriorities } from '@/shared/hooks/useMasterData';

type ViewMode = 'day' | 'week' | 'month' | 'range' | 'kanban';

function getWeekRange(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: fmt(start), end: fmt(end) };
}

function getMonthRange(dateStr: string) {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: fmt(start), end: fmt(end) };
}

function fmt(d: Date) {
  return d.toISOString().split('T')[0];
}

function fmtDisplay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TimeLog() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(fmt(new Date()));
  const [rangeStart, setRangeStart] = useState(fmt(new Date()));
  const [rangeEnd, setRangeEnd] = useState(fmt(new Date()));
  const [timeEntries, setTimeEntries] = useState<ITimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const { data: allUsers = [] } = useUsers();

  const filterGroups = [
    {
      id: 'userId',
      label: 'User',
      options: allUsers.map(u => ({ label: `${u.first_name} ${u.last_name}`, value: u.id.toString() }))
    }
  ];

  const handleFilterChange = (groupId: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[groupId] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [groupId]: updated };
    });
  };

  const filteredBySearch = useMemo(() => {
    return timeEntries.filter(entry => {
      const userMatch = !selectedFilters.userId?.length || selectedFilters.userId.includes(entry.user_id?.toString() || '');
      return userMatch;
    });
  }, [timeEntries, selectedFilters]);

  useEffect(() => {
    fetchTimeLogs();
  }, []);

  const fetchTimeLogs = async () => {
    try {
      const data = await timelogsService.getTimelogs(0, 2000);
      setTimeEntries(data);
    } catch (error) {
      console.error('Failed to fetch timelogs:', error);
      showToast('error', 'Error', 'Failed to fetch timelogs');
    } finally {
      setLoading(false);
    }
  };

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === 'day') return { start: currentDate, end: currentDate };
    if (viewMode === 'week') return getWeekRange(currentDate);
    if (viewMode === 'month') return getMonthRange(currentDate);
    return { start: rangeStart, end: rangeEnd };
  }, [viewMode, currentDate, rangeStart, rangeEnd]);

  const filteredEntries = useMemo(() => {
    return filteredBySearch.filter(entry => {
      const eDate = entry.date.split('T')[0];
      return eDate >= dateRange.start && eDate <= dateRange.end;
    });
  }, [dateRange, filteredBySearch]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: Record<string, ITimeLog[]> = {};
    filteredEntries.forEach(entry => {
      const d = entry.date.split('T')[0];
      if (!groups[d]) groups[d] = [];
      groups[d].push(entry);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredEntries]);

  // Totals
  const totalHours = filteredEntries.reduce((s, e) => s + e.hours, 0);

  const handleExport = () => {
    const exportData = filteredEntries.map(e => ({
      'ID': e.id,
      'Date': e.date.split('T')[0],
      'Project': e.project?.name || e.task?.project?.name || 'N/A',
      'Task': e.task?.title || 'N/A',
      'User': e.user ? `${e.user.first_name} ${e.user.last_name}` : 'Unknown',
      'Hours': e.hours.toFixed(2),
      'Description': e.description || '',
    }));
    exportToCSV(exportData, 'timelogs_report.csv');
    showToast('success', 'Exported', 'Time logs exported successfully');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    if (viewMode === 'day') date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    else if (viewMode === 'week') date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
    else if (viewMode === 'month') date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(fmt(date));
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const handleDelete = async (id: number) => {
    try {
      await timelogsService.deleteTimelog(id);
      setTimeEntries(prev => prev.filter(e => e.id !== id));
      showToast('success', 'Deleted', 'Time log deleted');
    } catch {
      showToast('error', 'Error', 'Failed to delete');
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  if (loading) return (
    <PageLayout title="Time Logs" isFullHeight>
      <div className="space-y-4">
        <TableSkeleton rows={8} columns={5} />
      </div>
    </PageLayout>
  );

  return (
    <PageLayout
      title="Time Logs"
      isFullHeight
      actions={
        <div className="flex items-center gap-3">
          <ViewToggle view={viewMode === 'kanban' ? 'kanban' : 'list'} onViewChange={(v) => setViewMode(v === 'kanban' ? 'kanban' : 'week')} />
          <Button variant="outline" onClick={() => setShowFilters(true)}>
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => navigate('/time-log/create')}>
            <Plus className="w-4 h-4 mr-2" /> Add Time Log
          </Button>
        </div>
      }
    >
      <div className="h-full flex flex-col overflow-hidden space-y-4">

        {/* View Mode & Date Navigation */}
        <div className="bg-white border rounded-[6px] p-3 flex flex-wrap items-center justify-between gap-3">
          {/* View mode tabs */}
          <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-[6px] p-1">
            {(['day', 'week', 'month', 'range'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-[4px] transition-all capitalize
                  ${viewMode === mode ? 'bg-white text-[#059669] shadow-sm' : 'text-[#6B7280] hover:text-[#374151]'}`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Date navigation (not shown for range mode) */}
          {viewMode !== 'range' ? (
            <div className="flex items-center gap-2">
              <button onClick={() => navigateDate('prev')} className="p-1.5 rounded hover:bg-gray-100">
                <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFB] border rounded-[6px] text-[13px] font-medium text-[#374151] min-w-[220px] justify-center">
                <Calendar className="w-4 h-4 text-[#059669]" />
                {dateRange.start === dateRange.end
                  ? fmtDisplay(dateRange.start)
                  : `${fmtDisplay(dateRange.start)} — ${fmtDisplay(dateRange.end)}`}
              </div>
              <button onClick={() => navigateDate('next')} className="p-1.5 rounded hover:bg-gray-100">
                <ChevronRight className="w-4 h-4 text-[#6B7280]" />
              </button>
              <button
                onClick={() => setCurrentDate(fmt(new Date()))}
                className="text-[12px] font-medium text-[#059669] hover:underline ml-2"
              >
                Today
              </button>
            </div>
          ) : (
            /* Range date pickers */
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-[#6B7280]">From:</label>
              <input
                type="date"
                value={rangeStart}
                onChange={e => setRangeStart(e.target.value)}
                className="border rounded-[6px] px-2 py-1.5 text-[13px]"
              />
              <label className="text-[12px] text-[#6B7280]">To:</label>
              <input
                type="date"
                value={rangeEnd}
                onChange={e => setRangeEnd(e.target.value)}
                className="border rounded-[6px] px-2 py-1.5 text-[13px]"
              />
            </div>
          )}

          {/* Summary */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[13px]">
              <Clock className="w-4 h-4 text-[#059669]" />
              <span className="text-[#6B7280]">Total:</span>
              <span className="font-bold text-[#1F2937]">{totalHours.toFixed(2)}h</span>
            </div>
            <span className="text-[12px] text-[#6B7280]">
              {filteredEntries.length} entries
            </span>
          </div>
        </div>

        {/* Grouped Time Log Entries */}
        {viewMode === 'kanban' ? (
          <div className="h-[600px]">
            <TimeLogsKanbanView timelogs={filteredEntries} onUpdate={fetchTimeLogs} />
          </div>
        ) : filteredEntries.length > 0 ? (
          <div className="flex-1 min-h-0 bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col">
            <DataTable
              columns={[
                {
                  key: 'date',
                  header: 'Date',
                  sortable: true,
                  render: (val) => fmtDisplay(val as string)
                },
                {
                  key: 'description',
                  header: 'Description',
                  sortable: true,
                  render: (_, entry) => (
                    <div>
                      <p className="text-[14px] font-medium text-[#1F2937]">
                        {entry.task?.title || entry.issue?.title || entry.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[#6B7280]">
                        <span className="font-medium text-[#059669]">{entry.project?.name || entry.task?.project?.name || 'No Project'}</span>
                        {entry.description && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-[300px]">{entry.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'user',
                  header: 'User',
                  render: (_, entry) => entry.user ? `${entry.user.first_name} ${entry.user.last_name}` : 'Unknown'
                },
                {
                  key: 'hours',
                  header: 'Hours',
                  sortable: true,
                  render: (val) => <span className="text-[16px] font-bold text-[#059669]">{Number(val).toFixed(2)}h</span>
                },
                {
                  key: 'actions',
                  header: '',
                  render: (_, entry) => (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/time-log/edit/${entry.id}`)}
                        className="p-1.5 text-[#6B7280] hover:text-[#059669] hover:bg-[#ECFDF5] rounded transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                }
              ]}
              data={filteredEntries}
              itemsPerPage={10}
            />
          </div>
        ) : (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-[#F3F4F6] rounded-[12px] flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-[#9CA3AF]" />
              </div>
              <p className="text-[15px] font-medium text-[#374151] mb-1">No time logs found</p>
              <p className="text-[13px] text-[#6B7280] mb-4">No entries found for the selected date range.</p>
              <Button onClick={() => navigate('/time-log/create')}>
                <Plus className="w-4 h-4 mr-2" /> Add Time Log
              </Button>
            </div>
          </Card>
        )}

        <FilterSidebar
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          groups={filterGroups}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClear={() => setSelectedFilters({})}
        />

        {/* Bottom summary bar */}
        {filteredEntries.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px]">
            <div className="flex gap-6 text-[13px]">
              <div>
                <span className="text-[#6B7280]">Billable: </span>
                <span className="font-semibold text-[#059669]">{totalHours.toFixed(2)}h</span>
              </div>
              <div>
                <span className="text-[#6B7280]">Non Billable: </span>
                <span className="font-semibold text-[#6B7280]">0.00h</span>
              </div>
              <div>
                <span className="text-[#6B7280]">Total: </span>
                <span className="font-bold text-[#1F2937]">{totalHours.toFixed(2)}h</span>
              </div>
            </div>
            <span className="text-[12px] text-[#6B7280]">Total Count: {filteredEntries.length}</span>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
