import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/context/ToastContext';
import {
  Plus, Calendar,
  Download, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { timelogsService, TimeLog as ITimeLog } from '@/services/timelogs';
import { exportToCSV } from '@/utils/export';

function getWeekRange(dateStr: string): { start: string; end: string; weekNum: number; days: Date[] } {
  const date = new Date(dateStr);
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day); // Sunday (Zoho format usually starts Sun or Mon, let's use Sunday based on mockup)
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Saturday

  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const weekNum = Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    weekNum,
    days
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface MatrixRow {
  key: string;
  user: any;
  task: any;
  project: any;
  hours: Record<string, number>;
  total: number;
}

export function TimeLog() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeEntries, setTimeEntries] = useState<ITimeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeLogs();
  }, []);

  const fetchTimeLogs = async () => {
    try {
      const data = await timelogsService.getTimelogs(0, 1000);
      setTimeEntries(data);
    } catch (error) {
      console.error('Failed to fetch timelogs:', error);
      showToast('error', 'Error', 'Failed to fetch timelogs');
    } finally {
      setLoading(false);
    }
  };

  const currentWeek = useMemo(() => getWeekRange(currentDate), [currentDate]);

  // Filter entries based on the current week range
  const weekEntries = useMemo(() => {
    return timeEntries.filter(entry => {
      const eDate = entry.date.split('T')[0];
      return eDate >= currentWeek.start && eDate <= currentWeek.end;
    });
  }, [currentWeek, timeEntries]);

  // Transform flat entries into matrix rows
  const matrixRows = useMemo(() => {
    const rowMap = new Map<string, MatrixRow>();

    weekEntries.forEach(entry => {
      const uId = entry.user_id;
      const tId = entry.task_id;
      const key = `${uId}-${tId}`;

      const eDate = entry.date.split('T')[0];

      if (!rowMap.has(key)) {
        rowMap.set(key, {
          key,
          user: entry.user,
          task: entry.task,
          project: entry.task?.project,
          hours: {},
          total: 0
        });
      }

      const row = rowMap.get(key)!;
      row.hours[eDate] = (row.hours[eDate] || 0) + entry.hours;
      row.total += entry.hours;
    });

    return Array.from(rowMap.values());
  }, [weekEntries]);

  const handleExport = () => {
    const exportData = matrixRows.map(row => {
      const exportRow: any = {
        'Project': row.project?.name || 'Unknown',
        'User': row.user ? `${row.user.first_name} ${row.user.last_name}` : 'Unknown',
        'Task': row.task?.title || 'Unknown',
      };

      currentWeek.days.forEach(day => {
        const dateStr = day.toISOString().split('T')[0];
        const dayLabel = day.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit' }).toUpperCase();
        exportRow[dayLabel] = row.hours[dateStr] ? row.hours[dateStr].toFixed(2) : '0.00';
      });

      exportRow['Total'] = row.total.toFixed(2);
      return exportRow;
    });

    exportToCSV(exportData, 'timesheet_matrix.csv');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // Calculate Column Totals
  const colTotals: Record<string, number> = {};
  let masterTotal = 0;

  currentWeek.days.forEach(day => {
    const dateStr = day.toISOString().split('T')[0];
    let sum = 0;
    matrixRows.forEach(row => {
      sum += (row.hours[dateStr] || 0);
    });
    colTotals[dateStr] = sum;
    masterTotal += sum;
  });

  return (
    <PageLayout
      title="Timesheet"
      actions={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Matrix
          </Button>
          <Button onClick={() => navigate('/time-log/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Log Time
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* Top Controls matching Zoho */}
        <div className="bg-white p-4 border-b border-[#E5E7EB] flex items-center justify-between rounded-t-[6px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#F3F4F6] rounded-[6px] border border-[#E5E7EB]">
              <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-[#E5E7EB] rounded-l-[6px] transition-colors">
                <ChevronLeft className="w-4 h-4 text-[#4B5563]" />
              </button>
              <div className="px-4 py-1.5 flex items-center gap-2 border-x border-[#E5E7EB] bg-white text-[13px] font-semibold text-[#059669]">
                <Calendar className="w-4 h-4" />
                {`${formatDate(currentWeek.start)} to ${formatDate(currentWeek.end)}`}
              </div>
              <button onClick={() => navigateDate('next')} className="p-2 hover:bg-[#E5E7EB] rounded-r-[6px] transition-colors">
                <ChevronRight className="w-4 h-4 text-[#4B5563]" />
              </button>
            </div>

            <button onClick={goToToday} className="text-[13px] font-medium text-[#4B5563] hover:text-[#059669] transition-colors">
              Today
            </button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="text-[13px]">mani</Button>
            <Button variant="outline" className="text-[13px]">Projects (1)</Button>
            <Button variant="outline" className="text-[13px]">Log Users (1)</Button>
            <Button variant="outline" className="text-[13px] text-blue-600 border-blue-200 bg-blue-50">Billing Type: Billable</Button>
          </div>
        </div>

        {/* Matrix Table */}
        <Card>
          <div className="overflow-x-auto -mx-4 -mb-4">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold">
                  <th className="p-3 font-medium uppercase tracking-wider text-[11px] min-w-[200px]">Project</th>
                  <th className="p-3 font-medium uppercase tracking-wider text-[11px] min-w-[150px]">User</th>
                  <th className="p-3 font-medium uppercase tracking-wider text-[11px] min-w-[200px]">Task/Issues</th>
                  {currentWeek.days.map((day, idx) => (
                    <th key={idx} className="p-3 font-medium uppercase tracking-wider text-[11px] text-center w-[80px]">
                      {day.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit' })}
                    </th>
                  ))}
                  <th className="p-3 font-medium uppercase tracking-wider text-[11px] text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {matrixRows.length > 0 ? matrixRows.map(row => (
                  <tr key={row.key} className="hover:bg-[#F9FAFB]/50 transition-colors">
                    <td className="p-3 border-r border-[#E5E7EB]/50">
                      <span className="text-[#374151] font-medium">{row.project?.name || 'Unassigned'}</span>
                    </td>
                    <td className="p-3 border-r border-[#E5E7EB]/50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center font-bold text-[10px]">
                          {row.user?.first_name?.[0] || 'U'}
                        </div>
                        <span className="text-[#374151]">{row.user ? `${row.user.first_name} ${row.user.last_name}` : 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-3 border-r border-[#E5E7EB]/50">
                      <span className="text-[#374151]">{row.task?.title || 'General'}</span>
                    </td>

                    {currentWeek.days.map((day, idx) => {
                      const dStr = day.toISOString().split('T')[0];
                      const hrs = row.hours[dStr];
                      return (
                        <td key={idx} className="p-2 border-r border-[#E5E7EB]/50 text-center">
                          <div className="w-full h-8 bg-[#F3F4F6] rounded-[4px] flex items-center justify-center text-[#4B5563]">
                            {hrs ? hrs.toFixed(2) : ''}
                          </div>
                        </td>
                      );
                    })}

                    <td className="p-3 text-right font-semibold text-[#059669]">
                      {row.total.toFixed(2)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-[#6B7280]">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-[#F3F4F6] rounded-[12px] flex items-center justify-center mb-4">
                          <Calendar className="w-6 h-6 text-[#9CA3AF]" />
                        </div>
                        <p className="font-medium text-[15px] mb-1">No items available</p>
                        <p className="text-[13px]">Get started by adding or creating items using the options above.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Total Row */}
                <tr className="bg-[#F9FAFB] font-semibold text-[#1F2937]">
                  <td colSpan={3} className="p-3 text-right border-r border-[#E5E7EB]/50">
                    <Button variant="ghost" size="sm" className="text-[#059669] -ml-2 mr-auto flex items-center">
                      <Plus className="w-4 h-4 mr-1" /> Add Row
                    </Button>
                  </td>
                  {currentWeek.days.map((day, idx) => {
                    const dStr = day.toISOString().split('T')[0];
                    const tot = colTotals[dStr];
                    return (
                      <td key={idx} className="p-3 border-r border-[#E5E7EB]/50 text-center text-[#3B82F6]">
                        {tot > 0 ? tot.toFixed(2) : ''}
                      </td>
                    );
                  })}
                  <td className="p-3 text-right text-[#3B82F6]">
                    {masterTotal > 0 ? masterTotal.toFixed(2) : '00:00'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-[#E5E7EB]">
          <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">Save as Draft</Button>
          <Button variant="outline" className="text-[#2563EB] border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE]">Send for Approval</Button>
          <Button variant="ghost" className="text-[#6B7280] hover:bg-[#F3F4F6] border border-[#E5E7EB] bg-white">Cancel</Button>
        </div>

      </div>
    </PageLayout>
  );
}
