import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Button } from '@/shared/components/ui/Button/Button';
import { Select } from '@/shared/components/ui/Select/Select';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useToast } from '@/shared/context/ToastContext';
import { timesheetsService } from '@/features/timesheets/services/timesheets.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { FormHeader, FormField, FormCard } from '@/shared/components/ui/Form';

type ViewMode = 'day' | 'week' | 'month';

function getWeekDates(refDate: Date): Date[] {
  const day = refDate.getDay();
  const start = new Date(refDate);
  start.setDate(start.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}
function fmtISO(d: Date) { return d.toISOString().split('T')[0]; }
function fmtNice(s: string) { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

export function TimesheetCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [billingType, setBillingType] = useState<string>('Billable');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dateRange = useMemo(() => {
    if (viewMode === 'day') {
      const s = fmtISO(currentDate);
      return { start: s, end: s };
    }
    if (viewMode === 'week') {
      const wd = getWeekDates(currentDate);
      return { start: fmtISO(wd[0]), end: fmtISO(wd[6]) };
    }
    const s = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const e = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return { start: fmtISO(s), end: fmtISO(e) };
  }, [viewMode, currentDate]);

  const navigate_date = (dir: 'prev' | 'next') => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + (dir === 'next' ? 1 : -1));
    else if (viewMode === 'week') d.setDate(d.getDate() + (dir === 'next' ? 7 : -7));
    else d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
    setCurrentDate(d);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedProject) {
      showToast('error', 'Validation Error', 'Please select a User and a Project');
      return;
    }
    setIsSubmitting(true);
    try {
      const projName = selectedProject.name || 'Project';
      const generatedName = `${projName} - ${fmtNice(dateRange.start)} to ${fmtNice(dateRange.end)}`;
      await timesheetsService.createTimesheet({
        name: generatedName,
        start_date: dateRange.start,
        end_date: dateRange.end,
        project_id: selectedProject.id,
        user_id: selectedUser.id,
        billing_type: billingType,
        approval_status: 'Pending',
        total_hours: 0
      });
      showToast('success', 'Timesheet Created', `Timesheet saved for ${fmtNice(dateRange.start)} to ${fmtNice(dateRange.end)}`);
      navigate('/timesheets');
    } catch (error) {
      console.error(error);
      showToast('error', 'Error', 'Failed to create timesheet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title="Create Timesheet" showBackButton backPath="/timesheets">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={CalendarDays} title="Timesheet Details" subtitle="Select a time period and assign to a project" color="teal" />

        <FormCard
          columns={3}
          footer={{ onCancel: () => navigate('/timesheets'), submitLabel: 'Create Timesheet', submittingLabel: 'Creating...', isSubmitting, isDisabled: !selectedUser || !selectedProject }}
        >
          {/* Time Period Selector — special full-width widget */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="text-[13px] font-semibold text-slate-700 dark:text-gray-300 block mb-2">
              Time Period <span className="text-red-500">*</span>
            </label>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-slate-800/50">
              <div className="flex justify-center mb-4">
                <div className="flex bg-white dark:bg-slate-700 border rounded-lg p-1 shadow-sm">
                  {(['day', 'week', 'month'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setViewMode(mode)}
                      className={`px-4 py-2 text-[13px] font-medium rounded-md capitalize transition-colors ${viewMode === mode ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between bg-white dark:bg-slate-700 border rounded-lg px-4 py-3 shadow-sm">
                <button type="button" onClick={() => navigate_date('prev')} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <span className="text-[15px] font-semibold text-slate-800 dark:text-gray-200">
                  {dateRange.start === dateRange.end ? fmtNice(dateRange.start) : `${fmtNice(dateRange.start)}  →  ${fmtNice(dateRange.end)}`}
                </span>
                <button type="button" onClick={() => navigate_date('next')} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <FormField label="Project" required>
            <ServerSearchDropdown entityType="projects" value={selectedProject} onChange={setSelectedProject} placeholder="Select Project" />
          </FormField>

          <FormField label="User" required>
            <ServerSearchDropdown entityType="users" value={selectedUser} onChange={setSelectedUser} placeholder="Select User" />
          </FormField>

          <FormField label="Billing Type">
            <Select name="billing_type" value={billingType} onChange={(e) => setBillingType(e.target.value)}>
              <option value="Billable">Billable</option>
              <option value="Non-billable">Non-billable</option>
            </Select>
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
