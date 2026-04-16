import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { 
    Plus, Download, Clock as ClockIcon, TrendingUp, DollarSign, 
    BarChart3, Grid, Calendar as CalendarIcon, 
    Users, User, ChevronLeft, ChevronRight, CalendarDays
} from 'lucide-react';
import { TimeLogTable } from '../ui/TimeLogTable';
import { timelogsService } from '../../api/timelogs.api';
import { useTimelogActions } from '../../hooks/useTimelogActions';
import { TableSkeleton } from '@/components/feedback/Skeleton/TableSkeleton';
import { useToast } from '@/providers/ToastContext';
import { useAuth } from '@/auth/AuthProvider';
import { isTeamLeadOrAbove } from '@/utils/permissions';
import { exportToCSV } from '@/utils/export';
import { 
    startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
    isWithinInterval, format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths
} from 'date-fns';
import SharedCalendar from '@/components/core/SharedCalendar';

const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
function fmtHHMM(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${pad(h)}:${pad(m)}`;
}

export function TimeLogListView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  

  const [dateRangeMode, setDateRangeMode] = useState<'day' | 'week' | 'month' | 'range'>('month');
  const [currentReferenceDate, setCurrentReferenceDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('mine');
  const [customRange, setCustomRange] = useState<Date[] | null>(null);

  const isAdminView = isTeamLeadOrAbove(user?.role?.name);


  const { data: timeEntries = [], isLoading, refetch } = useQuery({
    queryKey: ['timelogs'],
    queryFn:  () => timelogsService.getTimelogs(0, 5000),
  });

  const { deleteTimelog } = useTimelogActions();


  const selectedRange = useMemo(() => {
    const ref = currentReferenceDate;
    if (dateRangeMode === 'day')   return { start: startOfDay(ref), end: endOfDay(ref) };
    if (dateRangeMode === 'week')  return { start: startOfWeek(ref, { weekStartsOn: 1 }), end: endOfWeek(ref, { weekStartsOn: 1 }) };
    if (dateRangeMode === 'month') return { start: startOfMonth(ref), end: endOfMonth(ref) };
    if (dateRangeMode === 'range' && customRange?.[0] && customRange?.[1]) {
       return { start: startOfDay(customRange[0]), end: endOfDay(customRange[1]) };
    }
    return { start: startOfMonth(ref), end: endOfMonth(ref) }; 
  }, [dateRangeMode, currentReferenceDate, customRange]);

  const handleNavigatePeriod = (direction: 'prev' | 'next') => {
    const step = direction === 'next' ? 1 : -1;
    setCurrentReferenceDate(prev => {
        if (dateRangeMode === 'day')   return step > 0 ? addDays(prev, 1) : subDays(prev, 1);
        if (dateRangeMode === 'week')  return step > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1);
        if (dateRangeMode === 'month') return step > 0 ? addMonths(prev, 1) : subMonths(prev, 1);
        return prev;
    });
  };

  const filteredEntries = useMemo(() => {
     let logs = timeEntries.filter((e) => {
        if (!e.date) return false;
        const entryDate = new Date(e.date);
        return isWithinInterval(entryDate, { start: selectedRange.start, end: selectedRange.end });
     });

     if (isAdminView && viewMode === 'mine') {
        logs = logs.filter(l => l.user_id === user?.id);
     } else if (!isAdminView) {
        logs = logs.filter(l => l.user_id === user?.id);
     }

     return logs;
  }, [timeEntries, selectedRange, viewMode, user?.id, isAdminView]);

  const stats = useMemo(() => {
    const total    = filteredEntries.reduce((s, e) => s + Number(e.daily_log_hours ?? 0), 0);
    const billable = filteredEntries.filter((e) => e.billing_type === 'Billable').reduce((s, e) => s + Number(e.daily_log_hours ?? 0), 0);
    const nonBill  = total - billable;
    return { total, billable, nonBill, count: filteredEntries.length };
  }, [filteredEntries]);

  const statsProps = useMemo(() => [
    { label: 'Total Tracked',  value: fmtHHMM(stats.total),    icon: <ClockIcon size={18} />,   accentVariant: 'teal' as const,   change: `${stats.count} entries` },
    { label: 'Billable',     value: fmtHHMM(stats.billable), icon: <DollarSign size={18} />,  accentVariant: 'violet' as const },
    { label: 'Non-Billable', value: fmtHHMM(stats.nonBill),  icon: <TrendingUp size={18} />,  accentVariant: 'amber' as const },
    { label: 'Active Logs',  value: String(stats.count),     icon: <BarChart3 size={18} />,   accentVariant: 'rose' as const },
  ], [stats]);

  const handleExport = () => {
    const exportData = filteredEntries.map((e) => ({
      ID:          e.id,
      'Log Title': e.log_title || e.task?.task_name || 'Untitled',
      Date:        e.date || '',
      Project:     e.project?.project_name || e.task?.project?.project_name || 'N/A',
      User:        e.user ? `${e.user.first_name} ${e.user.last_name}` : 'Unknown',
      Hours:       Number(e.daily_log_hours).toFixed(2),
      Billing:     e.billing_type || 'Billable',
      Notes:       e.notes || '',
    }));
    exportToCSV(exportData, `timelogs_${dateRangeMode}.csv`);
  };

  return (
    <EntityPageTemplate
      title="Time Logs"
      stats={statsProps}
      loading={isLoading}
      headerActions={
        <div className="flex items-center gap-3">
             <button
                onClick={handleExport}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 shadow-sm"
                title="Export CSV"
            >
                <Download size={15} strokeWidth={2.5} />
            </button>
            <button 
                onClick={() => navigate('/time-log/add')}
                className="group relative h-10 px-6 rounded-xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-600 text-white font-bold text-[13px] shadow-lg shadow-brand-teal-500/30 hover:shadow-brand-teal-500/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 overflow-hidden"
            >
                {}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
                
                <div className="relative flex items-center justify-center gap-2.5">
                    <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-white/20 border border-white/30 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                        <Plus size={14} strokeWidth={4} />
                    </div>
                    <span className="tracking-tight italic">Add Time Log</span>
                </div>

                {}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
        </div>
      }
      utilityBarExtra={
         <div className="flex flex-wrap items-center gap-y-3 gap-x-5 w-full">
            {}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner flex-shrink-0">
                {['day', 'week', 'month', 'range'].map((m) => (
                    <button
                        key={m}
                        onClick={() => setDateRangeMode(m as any)}
                        className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${dateRangeMode === m ? 'bg-white dark:bg-slate-700 shadow-md text-brand-teal-500 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {}
            <div className="flex items-center">
                <div className="flex h-9 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm relative">
                    <button 
                        onClick={() => handleNavigatePeriod('prev')}
                        disabled={dateRangeMode === 'range'}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-teal-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                    >
                        <ChevronLeft size={16} strokeWidth={3} />
                    </button>
                    
                    <div className="relative flex items-center">
                        <div className={`px-5 h-full flex items-center gap-2 text-[12px] font-bold text-slate-700 dark:text-slate-200 border-x border-slate-100 dark:border-slate-700 tabular-nums transition-colors ${dateRangeMode === 'range' ? 'hover:text-brand-teal-500 cursor-pointer pr-10' : ''}`}>
                            <CalendarDays size={14} className="text-brand-teal-500" />
                            {dateRangeMode === 'range' && (!customRange || !customRange[0]) ? (
                                <span className="text-slate-400 font-medium tracking-tight">Select Custom Range</span>
                            ) : (
                                <>
                                    {format(selectedRange.start, 'MMM dd, yyyy')}
                                    {dateRangeMode !== 'day' && (
                                        <>
                                            <ChevronRight size={10} className="text-slate-300" />
                                            {format(selectedRange.end, 'MMM dd, yyyy')}
                                        </>
                                    )}
                                </>
                            )}
                            {dateRangeMode === 'range' && <ChevronRight size={12} className="text-slate-300 absolute right-4 rotate-90" />}
                        </div>

                        {}
                        {dateRangeMode === 'range' && (
                            <div className="absolute inset-0 opacity-0 overflow-hidden cursor-pointer">
                                <SharedCalendar
                                    selectionMode="range"
                                    value={customRange as any}
                                    onChange={(v: any) => setCustomRange(v)}
                                    className="!w-full !h-full"
                                />
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => handleNavigatePeriod('next')}
                        disabled={dateRangeMode === 'range'}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-teal-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                    >
                        <ChevronRight size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>

            <div className="flex-1" />

            {}
            <div className="flex items-center gap-4 flex-shrink-0">
                {isAdminView && (
                    <div className="relative flex items-center bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-[200px]">
                        {}
                        <div 
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/50 dark:border-white/5 transition-all duration-300 ease-out z-0 ${viewMode === 'mine' ? 'left-1' : 'left-[calc(50%+1px)]'}`}
                        />
                        
                        <button 
                            onClick={() => setViewMode('mine')}
                            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-1.5 text-[11px] font-black transition-colors duration-300 ${viewMode === 'mine' ? 'text-brand-teal-500' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <User size={13} strokeWidth={2.5} /> My Logs
                        </button>
                        <button 
                            onClick={() => setViewMode('all')}
                            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-1.5 text-[11px] font-black transition-colors duration-300 ${viewMode === 'all' ? 'text-brand-teal-500' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Users size={13} strokeWidth={2.5} /> Team Logs
                        </button>
                    </div>
                )}

                <button
                    onClick={() => navigate('/time-log/weekly-add')}
                    className="flex items-center gap-2 px-4 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800/30 font-black text-[10px] uppercase tracking-widest hover:bg-violet-100 hover:shadow-md active:scale-95 transition-all"
                >
                    <Grid size={14} strokeWidth={2.5} /> Matrix View
                </button>
            </div>
         </div>
      }
    >
      <div className="flex-1 flex flex-col min-h-0 h-full bg-theme-surface rounded-3xl border border-slate-200 dark:border-slate-800 shadow-premium overflow-hidden relative">
        {isLoading ? (
          <div className="p-4 h-full"><TableSkeleton rows={6} columns={8} /></div>
        ) : (
          <TimeLogTable 
              timelogs={filteredEntries} 
            onDelete={async (id) => {
                try {
                  await deleteTimelog.mutateAsync(id);
                  showToast('success', 'Deleted', 'Time log removed.');
                  refetch();
                } catch {
                  showToast('error', 'Error', 'Failed to delete.');
                }
            }} 
            onEdit={(log) => navigate(`/time-log/edit/${log.id}`)}
          />
        )}
      </div>
    </EntityPageTemplate>
  );
}
