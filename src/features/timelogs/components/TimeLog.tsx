import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { TableSkeleton } from '@/components/ui/Skeleton/TableSkeleton';
import { Button } from 'primereact/button';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { DataTable } from '@/components/DataTable/DataTable';
import { useToast } from '@/providers/ToastContext';
import { Button as PRButton } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import {
  Plus, Calendar as CalendarIcon, Download, ChevronLeft, ChevronRight, Clock, Filter, Edit, Trash2, ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { timelogsService, TimeLog as ITimeLog } from '@/features/timelogs/services/timelogs.api';
import { exportToCSV } from '@/utils/export';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { ViewToggle } from '@/components/ui/ViewToggle/ViewToggle';
import { TimeLogsKanbanView } from './TimeLogsKanbanView';
import { FilterSidebar } from '@/components/ui/FilterSidebar';
import { useUsers } from '@/hooks/useMasterData';
import { TimeLogDrawerForm } from './TimeLogDrawerForm';

function StatChip({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 dark:border-slate-800" style={{ background: `${color}0A` }}>
      <div className="p-2 rounded-lg" style={{ background: `${color}15`, color }}>{icon}</div>
      <div>
        <p className="text-[20px] font-black leading-none text-slate-800 dark:text-slate-100">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

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

  const groupedEntries = useMemo(() => {
    const groups: Record<string, ITimeLog[]> = {};
    filteredEntries.forEach(entry => {
      const d = entry.date.split('T')[0];
      if (!groups[d]) groups[d] = [];
      groups[d].push(entry);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredEntries]);

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
  const [showDrawer, setShowDrawer] = useState(false);

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
          <Button outlined onClick={() => setShowFilters(true)}>
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <Button outlined onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button outlined onClick={() => navigate('/time-log/weekly-add')} className="shadow-sm">
            <CalendarIcon className="w-4 h-4 mr-2" /> Weekly Add
          </Button>
          <Button onClick={() => setShowDrawer(true)} className="btn-gradient">
            <Plus className="w-4 h-4 mr-2" /> Log Time
          </Button>
        </div>
      }
    >
      <div className="h-full flex flex-col overflow-hidden space-y-4">

        {}
        <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 px-6 py-5 flex-shrink-0 shadow-sm">
          <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">

            <div className="flex flex-wrap items-center gap-3">
              {}
              <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg p-1">
                {(['day', 'week', 'month', 'range'] as ViewMode[]).map(mode => (
                  <PRButton
                    key={mode}
                    label={mode.charAt(0).toUpperCase() + mode.slice(1)}
                    text={viewMode !== mode}
                    onClick={() => setViewMode(mode)}
                    size="small"
                    className={`capitalize !text-[12px] !px-3 !py-1.5 !rounded-md ${viewMode === mode ? 'btn-gradient shadow-sm' : '!text-slate-500'
                      }`}
                  />
                ))}
              </div>

              {}
              {viewMode !== 'range' ? (
                <div className="flex items-center gap-2">
                  <PRButton
                    icon={<ChevronLeft className="w-4 h-4" />}
                    text
                    size="small"
                    onClick={() => navigateDate('prev')}
                    className="!w-8 !h-8 !p-0"
                  />
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-teal-50 dark:bg-brand-teal-900/20 border border-brand-teal-200/50 dark:border-brand-teal-800 rounded-lg text-[13px] font-bold text-brand-teal-700 dark:text-brand-teal-300 min-w-[220px] justify-center">
                    <CalendarIcon className="w-4 h-4 text-brand-teal-500" />
                    {dateRange.start === dateRange.end
                      ? fmtDisplay(dateRange.start)
                      : `${fmtDisplay(dateRange.start)} — ${fmtDisplay(dateRange.end)}`}
                  </div>
                  <PRButton
                    icon={<ChevronRight className="w-4 h-4" />}
                    text
                    size="small"
                    onClick={() => navigateDate('next')}
                    className="!w-8 !h-8 !p-0"
                  />
                  <PRButton
                    label="Today"
                    text
                    size="small"
                    onClick={() => setCurrentDate(fmt(new Date()))}
                    className="!text-[12px] !text-brand-teal-600 ml-2"
                  />
                </div>
              ) : (
                
                <div className="flex items-center gap-3 bg-white/5 border border-theme-border rounded-lg px-3 py-1.5">
                  <span className="text-[12px] text-theme-muted">From:</span>
                  <Calendar
                    value={rangeStart ? new Date(rangeStart) : null}
                    onChange={(e) => setRangeStart(e.value ? fmt(e.value as Date) : '')}
                    dateFormat="yy-mm-dd"
                    placeholder="Start date"
                    className="!border-0 !shadow-none"
                    inputClassName="!bg-transparent !border-0 !outline-none text-[13px] !w-28 !p-0"
                    showIcon={false}
                  />
                  <span className="text-[12px] text-theme-muted ml-2">To:</span>
                  <Calendar
                    value={rangeEnd ? new Date(rangeEnd) : null}
                    onChange={(e) => setRangeEnd(e.value ? fmt(e.value as Date) : '')}
                    dateFormat="yy-mm-dd"
                    placeholder="End date"
                    className="!border-0 !shadow-none"
                    inputClassName="!bg-transparent !border-0 !outline-none text-[13px] !w-28 !p-0"
                    showIcon={false}
                  />
                </div>
              )}
            </div>

            {}
            <div className="flex flex-wrap gap-3">
              <StatChip label="Entries" value={filteredEntries.length} icon={<ClipboardList className="w-4 h-4" />} color="#64748B" />
              <StatChip label="Total Hours" value={`${totalHours.toFixed(2)}h`} icon={<Clock className="w-4 h-4" />} color="#14b8a6" />
            </div>

          </div>
        </div>

        {}
        {viewMode === 'kanban' ? (
          <div className="h-[600px]">
            <TimeLogsKanbanView timelogs={filteredEntries} onUpdate={fetchTimeLogs} />
          </div>
        ) : filteredEntries.length > 0 ? (
          <div className="flex-1 min-h-0 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col">
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
                        <span className="font-medium text-[#14b8a6]">{entry.project?.name || entry.task?.project?.name || 'No Project'}</span>
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
                  render: (val) => <span className="text-[16px] font-bold text-[#14b8a6]">{Number(val).toFixed(2)}h</span>
                },
                {
                  key: 'actions',
                  header: '',
                  render: (_, entry) => (
                    <div className="flex items-center justify-end gap-1">
                      <PRButton
                        icon={<Edit className="w-4 h-4" />}
                        text
                        severity="secondary"
                        onClick={() => navigate(`/time-log/edit/${entry.id}`)}
                        tooltip="Edit"
                        className="!w-8 !h-8 !p-0"
                      />
                      <PRButton
                        icon={<Trash2 className="w-4 h-4" />}
                        text
                        severity="danger"
                        onClick={() => handleDelete(entry.id)}
                        tooltip="Delete"
                        className="!w-8 !h-8 !p-0"
                      />
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
              <Button onClick={() => navigate('/time-log/create')} className="btn-gradient">
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

        {}
        {filteredEntries.length > 0 && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
            <div className="flex gap-8 text-[13px]">
              <div className="flex flex-col">
                <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider">Billable</span>
                <span className="font-bold text-[#14b8a6] text-[16px]">{totalHours.toFixed(2)}h</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider">Non Billable</span>
                <span className="font-bold text-slate-400 text-[16px]">0.00h</span>
              </div>
              <div className="flex items-center gap-3 ml-auto xl:ml-0">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Period Total</span>
                  <span className="text-[18px] font-black text-slate-800 dark:text-slate-100 leading-none mt-1">
                    <span className="text-brand-teal-500">{totalHours.toFixed(1)}</span> h
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[12px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              Count: {filteredEntries.length}
            </span>
          </div>
        )}

      </div>
      <TimeLogDrawerForm 
        visible={showDrawer}
        onHide={() => setShowDrawer(false)}
        onSuccess={fetchTimeLogs}
      />
    </PageLayout>
  );
}
