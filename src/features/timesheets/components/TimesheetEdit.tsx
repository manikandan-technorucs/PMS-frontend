import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Select } from '@/components/ui/Select/Select';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useToast } from '@/providers/ToastContext';
import { timesheetsService } from '@/features/timesheets/services/timesheets.api';
import { usersService, User } from '@/features/users/services/users.api';
import { projectsService, Project } from '@/features/projects/services/projects.api';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';

type ViewMode = 'day' | 'week' | 'month';

function getWeekDates(refDate: Date): Date[] {
  const day = refDate.getDay();
  const start = new Date(refDate);
  start.setDate(start.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
}
function fmtISO(d: Date) { return d.toISOString().split('T')[0]; }
function fmtNice(s: string) { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

export function TimesheetEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [billingType, setBillingType] = useState<string>('Billable');
  const [approvalStatus, setApprovalStatus] = useState<string>('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, projectsData, tsData] = await Promise.all([
          usersService.getUsers(), projectsService.getProjects(), timesheetsService.getTimesheet(Number(id))
        ]);
        setUsers(usersData); setProjects(projectsData);
        if (tsData) {
          setSelectedUserId(tsData.user_id.toString());
          setSelectedProjectId(tsData.project_id.toString());
          setBillingType(tsData.billing_type || 'Billable');
          setApprovalStatus(tsData.approval_status || 'Pending');
          if (tsData.start_date) setCurrentDate(new Date(tsData.start_date));
        }
      } catch (err) { console.error(err); showToast('error', 'Error', 'Failed to load timesheet'); }
      finally { setIsLoading(false); }
    };
    loadData();
  }, [id]);

  const dateRange = useMemo(() => {
    if (viewMode === 'day') { const s = fmtISO(currentDate); return { start: s, end: s }; }
    if (viewMode === 'week') { const wd = getWeekDates(currentDate); return { start: fmtISO(wd[0]), end: fmtISO(wd[6]) }; }
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
    if (!selectedUserId || !selectedProjectId) { showToast('error', 'Validation Error', 'Please select a User and a Project'); return; }
    setIsSubmitting(true);
    try {
      const projName = projects.find(p => p.id.toString() === selectedProjectId)?.name || 'Project';
      const generatedName = `${projName} - ${fmtNice(dateRange.start)} to ${fmtNice(dateRange.end)}`;
      await timesheetsService.updateTimesheet(Number(id), {
        name: generatedName, start_date: dateRange.start, end_date: dateRange.end,
        project_id: parseInt(selectedProjectId), user_id: parseInt(selectedUserId),
        billing_type: billingType, approval_status: approvalStatus
      });
      showToast('success', 'Timesheet Updated', `Timesheet saved for ${fmtNice(dateRange.start)} to ${fmtNice(dateRange.end)}`);
      navigate('/timesheets');
    } catch (error) { console.error(error); showToast('error', 'Error', 'Failed to update timesheet'); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <PageLayout title="Edit Timesheet" showBackButton backPath="/timesheets">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={CalendarDays} title="Edit Timesheet" subtitle="Update your timesheet period and details" color="teal" />

        <FormCard columns={3} footer={{ onCancel: () => navigate('/timesheets'), submitLabel: 'Update Timesheet', submittingLabel: 'Updating...', isSubmitting, isDisabled: !selectedUserId || !selectedProjectId }}>
          {/* Time Period Selector */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="text-[13px] font-bold text-theme-secondary uppercase tracking-wider block mb-2">Time Period <span className="text-red-500">*</span></label>
            <div className="border border-theme-border rounded-lg p-4 bg-theme-neutralShadow">
              <div className="flex justify-center mb-4">
                <div className="flex bg-theme-surface border border-theme-border rounded-lg p-1 shadow-sm">
                  {(['day', 'week', 'month'] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => setViewMode(mode)}
                      className={`px-4 py-2 text-[13px] font-medium rounded-md capitalize transition-colors ${viewMode === mode ? 'bg-brand-teal-50 dark:bg-brand-teal-900/30 text-brand-teal-700 dark:text-brand-teal-400 ring-1 ring-brand-teal-500/20' : 'text-theme-muted hover:text-theme-primary'}`}>
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between bg-theme-surface border border-theme-border rounded-lg px-4 py-3 shadow-sm">
                <button type="button" onClick={() => navigate_date('prev')} className="p-1 hover:bg-theme-neutral rounded transition-colors"><ChevronLeft className="w-5 h-5 text-theme-muted" /></button>
                <span className="text-[15px] font-bold text-theme-primary">
                  {dateRange.start === dateRange.end ? fmtNice(dateRange.start) : `${fmtNice(dateRange.start)}  →  ${fmtNice(dateRange.end)}`}
                </span>
                <button type="button" onClick={() => navigate_date('next')} className="p-1 hover:bg-theme-neutral rounded transition-colors"><ChevronRight className="w-5 h-5 text-theme-muted" /></button>
              </div>
            </div>
          </div>

          <FormField label="Project" required>
            <Select name="project" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              <option value="">Select a Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </FormField>

          <FormField label="User" required>
            <Select name="user" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              <option value="">Select User</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
            </Select>
          </FormField>

          <FormField label="Billing Type">
            <Select name="billing_type" value={billingType} onChange={(e) => setBillingType(e.target.value)}>
              <option value="Billable">Billable</option>
              <option value="Non-billable">Non-billable</option>
            </Select>
          </FormField>

          <FormField label="Approval Status">
            <Select name="approval_status" value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
