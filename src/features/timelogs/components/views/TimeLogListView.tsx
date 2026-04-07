import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { StatCardProps } from '@/components/data-display/StatCard';
import { Plus, Download, Clock as ClockIcon, TrendingUp, DollarSign, BarChart3, Grid } from 'lucide-react';
import { TimeLogTable } from '../ui/TimeLogTable';
import { timelogsService } from '../../api/timelogs.api';
import { useTimelogActions } from '../../hooks/useTimelogActions';
import { useToast } from '@/providers/ToastContext';
import { exportToCSV } from '@/utils/export';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';
import SharedCalendar from '@/components/core/SharedCalendar';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');

function fmtHHMM(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${pad(h)}:${pad(m)}`;
}

export function TimeLogListView() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [dateRangeMode, setDateRangeMode] = useState<'today' | 'week' | 'month' | 'range'>('month');
  const [customRange, setCustomRange] = useState<Date[] | null>(null);

  const { data: timeEntries = [], isLoading, refetch } = useQuery({
    queryKey: ['timelogs'],
    queryFn:  () => timelogsService.getTimelogs(0, 2000),
  });

  const { deleteTimelog } = useTimelogActions();

  const selectedRange = useMemo(() => {
    const now = new Date();
    if (dateRangeMode === 'today') return { start: startOfDay(now), end: endOfDay(now) };
    if (dateRangeMode === 'week')  return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    if (dateRangeMode === 'month') return { start: startOfMonth(now), end: endOfMonth(now) };
    if (dateRangeMode === 'range' && customRange?.[0] && customRange?.[1]) {
       return { start: startOfDay(customRange[0]), end: endOfDay(customRange[1]) };
    }
    return { start: startOfMonth(now), end: endOfMonth(now) }; // Default
  }, [dateRangeMode, customRange]);

  const filteredEntries = useMemo(() => {
     return timeEntries.filter((e) => {
        if (!e.date) return false;
        const entryDate = new Date(e.date);
        return isWithinInterval(entryDate, { start: selectedRange.start, end: selectedRange.end });
     });
  }, [timeEntries, selectedRange]);

  const stats = useMemo(() => {
    const total    = filteredEntries.reduce((s, e) => s + Number(e.hours ?? 0), 0);
    const billable = filteredEntries.filter((e) => e.billing_type === 'Billable').reduce((s, e) => s + Number(e.hours ?? 0), 0);
    const nonBill  = total - billable;
    return { total, billable, nonBill, count: filteredEntries.length };
  }, [filteredEntries]);

  const statsProps: StatCardProps[] = useMemo(() => {
     if (isLoading) return [];
     return [
       { label: 'Total Hours',  value: fmtHHMM(stats.total),    icon: <ClockIcon size={18} strokeWidth={2} />,   accentVariant: 'teal',   change: `${stats.count} entries` },
       { label: 'Billable',     value: fmtHHMM(stats.billable), icon: <DollarSign size={18} strokeWidth={2} />,  accentVariant: 'violet' },
       { label: 'Non-Billable', value: fmtHHMM(stats.nonBill),  icon: <TrendingUp size={18} strokeWidth={2} />,  accentVariant: 'amber' },
       { label: 'Entries',      value: String(stats.count),     icon: <BarChart3 size={18} strokeWidth={2} />,   accentVariant: 'teal' },
     ];
  }, [stats, isLoading]);

  const handleDelete = async (id: number) => {
    try {
      await deleteTimelog.mutateAsync(id);
      showToast('success', 'Deleted', 'Time log removed.');
      refetch();
    } catch {
      showToast('error', 'Error', 'Failed to delete time log.');
    }
  };

  const handleExport = () => {
    const exportData = filteredEntries.map((e) => ({
      ID:          e.id,
      'Log Title': e.log_title || e.task?.title || 'N/A',
      Date:        e.date?.split('T')[0] || '',
      Project:     e.project?.name || e.task?.project?.name || 'N/A',
      Task:        e.task?.title || 'N/A',
      User:        e.user ? `${e.user.first_name} ${e.user.last_name}` : 'Unknown',
      Hours:       Number(e.hours).toFixed(2),
      'HH:MM':     fmtHHMM(Number(e.hours)),
      Billing:     e.billing_type || 'Billable',
      Notes:       e.description || '',
    }));
    exportToCSV(exportData, 'timelogs_report.csv');
  };

  return (
    <EntityPageTemplate
      title="Time Logs"
      stats={statsProps}
      
      
            headerActions={
         <Button variant="primary" size="md" onClick={() => navigate('/time-log/add')}>
            <Plus size={16} className="mr-2" /> Log Time
         </Button>
      }
      utilityBarExtra={
         <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
               {(['today', 'week', 'month', 'range'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setDateRangeMode(m)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                      dateRangeMode === m 
                      ? 'bg-white dark:bg-slate-700 text-brand-teal-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {m}
                  </button>
               ))}
            </div>

            {dateRangeMode === 'range' && (
               <div className="w-56">
                  <SharedCalendar
                    selectionMode="range"
                    value={customRange as any}
                    onChange={(v: any) => setCustomRange(v)}
                    placeholder="Custom Range"
                    className="!w-full h-9"
                  />
               </div>
            )}

            <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
               <CalendarIcon size={12} className="text-brand-teal-500" />
               {format(selectedRange.start, 'dd MMM')} – {format(selectedRange.end, 'dd MMM')}
            </div>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

            <Button variant="secondary" size="md" onClick={() => navigate('/time-log/weekly-add')} className="rounded-xl">
               <Grid size={15} className="mr-2" /> Weekly Matrix
            </Button>
            <Button variant="secondary" size="md" onClick={handleExport} className="rounded-xl">
               <Download size={15} className="mr-2" /> Export CSV
            </Button>
         </div>
      }
    >
      {filteredEntries.length > 0 ? (
         <div className="h-full overflow-auto">
            <TimeLogTable timelogs={filteredEntries} onDelete={handleDelete} />
         </div>
      ) : (
         <div className="flex flex-col items-center justify-center py-20 text-center h-full bg-slate-50 dark:bg-slate-900/50">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-brand-teal-50 dark:bg-brand-teal-900/20 border border-brand-teal-100 dark:border-brand-teal-800/50">
               <ClockIcon className="w-7 h-7 text-brand-teal-500" />
            </div>
            <p className="text-[15px] font-bold mb-1 text-slate-800 dark:text-slate-200">
               No time logs yet
            </p>
            <p className="text-[13px] mb-6 text-slate-500">
               Start tracking time on your tasks and projects.
            </p>
            <Button variant="primary" size="md" onClick={() => navigate('/time-log/add')}>
               <Plus className="w-4 h-4 mr-2" /> Add Time Log
            </Button>
         </div>
      )}
    </EntityPageTemplate>
  );
}
