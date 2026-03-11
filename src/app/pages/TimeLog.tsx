import React, { useState, useMemo } from 'react';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/Button';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import {
  Plus, Clock, Calendar, CalendarDays, Hash,
  Download, Upload, ChevronLeft, ChevronRight,
  Filter, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TimeEntry {
  id: string;
  user: string;
  project: string;
  task: string;
  date: string;
  hours: number;
  billingType: string;
  status: string;
  description: string;
}

const allTimeEntries: TimeEntry[] = [
  { id: 'TL-001', user: 'Sarah Johnson', project: 'Enterprise Portal Redesign', task: 'Design homepage mockup', date: '2026-02-19', hours: 6.5, billingType: 'Billable', status: 'Approved', description: 'Completed initial mockup designs' },
  { id: 'TL-002', user: 'Michael Chen', project: 'Mobile App Development', task: 'Implement authentication API', date: '2026-02-19', hours: 8.0, billingType: 'Billable', status: 'Approved', description: 'Completed API endpoints and testing' },
  { id: 'TL-003', user: 'Emily Rodriguez', project: 'API Integration Platform', task: 'Database schema optimization', date: '2026-02-18', hours: 5.0, billingType: 'Non-Billable', status: 'Pending', description: 'Optimized queries and indexes' },
  { id: 'TL-004', user: 'David Park', project: 'Cloud Migration Project', task: 'Server setup and configuration', date: '2026-02-18', hours: 7.5, billingType: 'Billable', status: 'Approved', description: 'Configured production servers' },
  { id: 'TL-005', user: 'Lisa Anderson', project: 'Data Analytics Dashboard', task: 'Create data visualization', date: '2026-02-17', hours: 6.0, billingType: 'Billable', status: 'Pending', description: 'Built chart components' },
  { id: 'TL-006', user: 'James Wilson', project: 'Customer Portal v2', task: 'Performance testing', date: '2026-02-17', hours: 4.5, billingType: 'Non-Billable', status: 'Approved', description: 'Load testing and optimization' },
  { id: 'TL-007', user: 'Maria Garcia', project: 'Security Enhancement', task: 'Security audit', date: '2026-02-16', hours: 8.0, billingType: 'Billable', status: 'Approved', description: 'Comprehensive security review' },
  { id: 'TL-008', user: 'Robert Taylor', project: 'Inventory Management', task: 'Bug fixes', date: '2026-02-16', hours: 3.0, billingType: 'Non-Billable', status: 'Rejected', description: 'Fixed export functionality issues' },
  { id: 'TL-009', user: 'Sarah Johnson', project: 'Enterprise Portal Redesign', task: 'Review & feedback', date: '2026-02-15', hours: 4.0, billingType: 'Billable', status: 'Approved', description: 'Client review session' },
  { id: 'TL-010', user: 'Michael Chen', project: 'Mobile App Development', task: 'Sprint planning', date: '2026-02-15', hours: 2.0, billingType: 'Non-Billable', status: 'Approved', description: 'Sprint planning meeting' },
  { id: 'TL-011', user: 'Emily Rodriguez', project: 'API Integration Platform', task: 'API testing', date: '2026-02-10', hours: 7.0, billingType: 'Billable', status: 'Approved', description: 'Integration testing' },
  { id: 'TL-012', user: 'David Park', project: 'Cloud Migration Project', task: 'Documentation', date: '2026-02-05', hours: 5.5, billingType: 'Non-Billable', status: 'Approved', description: 'Technical documentation' },
  { id: 'TL-013', user: 'Lisa Anderson', project: 'Data Analytics Dashboard', task: 'Data pipeline setup', date: '2026-02-03', hours: 8.0, billingType: 'Billable', status: 'Approved', description: 'ETL pipeline configuration' },
  { id: 'TL-014', user: 'James Wilson', project: 'Customer Portal v2', task: 'UI Development', date: '2026-01-28', hours: 6.5, billingType: 'Billable', status: 'Approved', description: 'Frontend development' },
];

function getWeekRange(dateStr: string): { start: string; end: string; weekNum: number } {
  const date = new Date(dateStr);
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day + 1); // Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sunday

  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const weekNum = Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    weekNum,
  };
}

function getMonthRange(dateStr: string): { start: string; end: string } {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMonth(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function TimeLog() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('week');
  const [currentDate, setCurrentDate] = useState('2026-02-19');
  const [customStartDate, setCustomStartDate] = useState('2026-02-10');
  const [customEndDate, setCustomEndDate] = useState('2026-02-19');

  // Calculate the actual date ranges based on selected mode
  const dateFilter = useMemo(() => {
    switch (dateRange) {
      case 'week':
        return getWeekRange(currentDate);
      case 'month':
        return getMonthRange(currentDate);
      case 'custom':
        return { start: customStartDate, end: customEndDate };
    }
  }, [dateRange, currentDate, customStartDate, customEndDate]);

  // Filter entries based on date range
  const filteredEntries = useMemo(() => {
    return allTimeEntries.filter(entry => {
      return entry.date >= dateFilter.start && entry.date <= dateFilter.end;
    });
  }, [dateFilter]);

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    switch (dateRange) {
      case 'week':
        date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'custom':
        // no-op, buttons are hidden
        break;
    }
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setCurrentDate('2026-02-19');
    showToast('info', 'Jumped to Today', 'Showing data for current date');
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'week': {
        const w = getWeekRange(currentDate);
        return `${formatDate(w.start)} – ${formatDate(w.end)} (Week ${w.weekNum})`;
      }
      case 'month':
        return formatMonth(currentDate);
      case 'custom': {
        return `${formatDate(customStartDate)} – ${formatDate(customEndDate)}`;
      }
    }
  };

  const columns: Column<TimeEntry>[] = [
    { key: 'id', header: 'Entry ID', sortable: true },
    { key: 'user', header: 'User', sortable: true },
    { key: 'project', header: 'Project', sortable: true },
    { key: 'task', header: 'Task', sortable: true },
    { key: 'date', header: 'Date', sortable: true },
    {
      key: 'hours',
      header: 'Hours',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center gap-1 font-semibold text-theme-primary">
          <Clock className="w-3.5 h-3.5 text-[#059669]" />
          {value}h
        </span>
      )
    },
    {
      key: 'billingType',
      header: 'Billing',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full ${value === 'Billable'
          ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
          : 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]'
          }`}>
          <DollarSign className="w-3 h-3" />
          {value}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} variant="status" />
    },
    { key: 'description', header: 'Description' },
  ];

  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const billableHours = filteredEntries.filter(e => e.billingType === 'Billable').reduce((sum, e) => sum + e.hours, 0);
  const billablePercent = totalHours > 0 ? ((billableHours / totalHours) * 100) : 0;

  return (
    <PageLayout
      title="Time Log"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => showToast('info', 'Import Started', 'Select a CSV or Excel file to import time entries')}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={() => showToast('success', 'Export Ready', `${filteredEntries.length} entries exported to CSV`)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/time-log/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Log Time
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Date Range Selector */}
        <div className="rounded-[6px] p-4 shadow-sm card-base">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Range Type Tabs */}
              <div className="flex rounded-[8px] p-1 timelog-range-bg border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                {(['week', 'month', 'custom'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setDateRange(type)}
                    className={`px-4 py-1.5 text-[12px] font-semibold rounded-[6px] transition-all capitalize ${dateRange === type
                      ? 'bg-[#059669] text-white shadow-sm'
                      : 'text-theme-secondary hover:text-theme-primary'
                      }`}
                  >
                    {type === 'custom' ? 'Custom Range' : type}
                  </button>
                ))}
              </div>

              {/* Date Navigation */}
              {dateRange === 'custom' ? (
                <div className="flex items-center gap-2 ml-1">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-[34px] px-3 rounded-[6px] border text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] transition-all"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                  />
                  <span className="text-theme-secondary text-[12px] font-semibold tracking-wider uppercase mx-1">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-[34px] px-3 rounded-[6px] border text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] transition-all"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 ml-1">
                  <button
                    onClick={() => navigateDate('prev')}
                    className="p-1.5 hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-theme-secondary" />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] border min-w-[220px] justify-center" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                    <Calendar className="w-4 h-4 text-[#059669]" />
                    <span className="text-[13px] font-semibold text-theme-primary">{getDateRangeLabel()}</span>
                  </div>
                  <button
                    onClick={() => navigateDate('next')}
                    className="p-1.5 hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-theme-secondary" />
                  </button>

                  <button
                    onClick={goToToday}
                    className="px-3 py-1.5 text-[12px] font-medium text-[#059669] rounded-[6px] transition-colors border ml-1"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
                  >
                    Today
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[13px] timelog-entries-info">
              <span className="font-medium">{filteredEntries.length} entries</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label={dateRange === 'custom' ? 'Custom Range' : 'Period'} value={`${totalHours.toFixed(1)}h`} icon={<Clock className="w-5 h-5" />} />
          <StatCard label="Billable Hours" value={`${billableHours.toFixed(1)}h`} icon={<DollarSign className="w-5 h-5" />} />
          <StatCard label="Non-Billable" value={`${(totalHours - billableHours).toFixed(1)}h`} icon={<CalendarDays className="w-5 h-5" />} />
          <StatCard label="Total Entries" value={filteredEntries.length} icon={<Hash className="w-5 h-5" />} />
        </div>

        {/* Summary */}
        <div className="rounded-[6px] p-4 shadow-sm card-base">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#059669]" />
                <span className="text-[13px] text-theme-secondary">Billable: <strong className="text-theme-primary">{billableHours.toFixed(1)}h</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#9CA3AF]" />
                <span className="text-[13px] text-theme-secondary">Non-Billable: <strong className="text-theme-primary">{(totalHours - billableHours).toFixed(1)}h</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                <span className="text-[13px] text-theme-secondary">Total: <strong className="text-theme-primary">{totalHours.toFixed(1)}h</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 w-48 h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#059669] to-[#34D399] rounded-full transition-all duration-500"
                  style={{ width: `${billablePercent}%` }}
                />
              </div>
              <span className="text-[12px] font-semibold text-[#059669]">{billablePercent.toFixed(0)}% billable</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {filteredEntries.length > 0 ? (
          <Card>
            <DataTable
              columns={columns}
              data={filteredEntries}
              selectable
              itemsPerPage={20}
            />
          </Card>
        ) : (
          <Card>
            <div className="py-16 text-center">
              <Clock className="w-12 h-12 mx-auto mb-3 timelog-empty-icon" />
              <p className="text-[16px] font-semibold timelog-empty-title">No time entries found</p>
              <p className="text-[14px] mt-1 timelog-empty-message">No entries match the selected date range. Try adjusting the filter.</p>
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
