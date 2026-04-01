import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/auth/AuthProvider';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';
import { Clock } from 'lucide-react';

const BILLING_TYPES = ['Billable', 'Non-Billable', 'Internal'];

export function TimeLogCreate() {
  const navigate = useNavigate();
  const { post, isSubmitting } = useApi();
  const { user } = useAuth();

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

  const [form, setForm] = useState({
    project_id: null as any,
    task_id: null as any,
    issue_id: null as any,
    date: new Date(),
    hours: '1.0',
    billing_type: 'Billable',
    log_title: '',
    description: '',
    general_log: false,
  });

  const set = (field: string, val: any) => setForm(prev => ({ ...prev, [field]: val }));

  const handleWorkItemChange = (val: any) => {
    if (!val) {
      set('task_id', null);
      set('issue_id', null);
      return;
    }
    if (val.type === 'issue') {
      setForm(prev => ({ ...prev, task_id: null, issue_id: val }));
    } else {
      setForm(prev => ({ ...prev, task_id: val, issue_id: null }));
    }
  };

  const isFormValid = !!(form.project_id && form.date && form.hours);

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) return;
    try {
      await post('/timelogs/', {
        project_id: extractId(form.project_id),
        task_id: extractId(form.task_id),
        issue_id: extractId(form.issue_id),
        user_email: user?.email || '',
        date: form.date instanceof Date ? form.date.toISOString().split('T')[0] : form.date,
        hours: parseFloat(form.hours),
        billing_type: form.billing_type,
        log_title: form.log_title || null,
        description: form.description || null,
        general_log: form.general_log,
      }, 'Time logged successfully!');
      navigate('/time-log');
    } catch (err) {
      console.error('Failed to log time:', err);
    }
  };

  return (
    <PageLayout title="Log Time" showBackButton backPath="/time-log">
      <form onSubmit={handleSave} className="max-w-[1200px] mx-auto">
        <FormHeader icon={Clock} title="Time Entry Details" subtitle="Record your work hours against a project, task, or issue" color="amber" />

        <FormCard
          columns={3}
          footer={{ onCancel: () => navigate('/time-log'), submitLabel: 'Log Time', submittingLabel: 'Saving...', isSubmitting, isDisabled: !isFormValid }}
        >
          {/* ── Project (required) ── */}
          <FormField label="Project" required>
            <ServerSearchDropdown
              entityType="projects"
              value={form.project_id}
              onChange={v => setForm(prev => ({ ...prev, project_id: v, task_id: null, issue_id: null }))}
              placeholder="Select Project"
            />
          </FormField>

          {/* ── Task / Bug ── */}
          <FormField label="Task / Bug">
            <ServerSearchDropdown
              entityType="search/work-items"
              customSearchPath="/search/work-items"
              value={form.task_id || form.issue_id}
              onChange={handleWorkItemChange}
              placeholder={form.project_id ? 'Search Tasks or Issues...' : 'Select a project first'}
              disabled={!form.project_id}
              filters={form.project_id ? { project_id: extractId(form.project_id) } : {}}
              field="name"
              itemTemplate={(item) => (
                <div className="flex flex-col gap-0.5 py-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      item.type === 'issue' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{item.public_id}</span>
                </div>
              )}
            />
          </FormField>

          {/* ── Date (required) ── */}
          <FormField label="Date" required>
            <SharedCalendar value={form.date} onChange={v => set('date', v)} />
          </FormField>

          {/* ── Hours ── */}
          <FormField label="Hours Logged" required>
            <Input
              name="hours" type="number" step="0.25" min="0.25" max="24"
              value={form.hours}
              onChange={e => set('hours', e.target.value)}
              placeholder="e.g. 2.5"
              className="h-10"
            />
          </FormField>

          {/* ── Billing Type ── */}
          <FormField label="Billing Type" required>
            <Select name="billing_type" value={form.billing_type} onChange={e => set('billing_type', e.target.value)}>
              {BILLING_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </Select>
          </FormField>

          {/* ── User (auto) ── */}
          <FormField label="User (auto — current user)">
            <Input
              value={user?.email || 'Not logged in'}
              readOnly
              className="h-10 bg-theme-neutral/30 text-theme-secondary"
            />
          </FormField>

          {/* ── Log Title ── */}
          <FormField label="Log Title" className="md:col-span-2">
            <Input
              name="log_title"
              value={form.log_title}
              onChange={e => set('log_title', e.target.value)}
              placeholder="Short description of work done..."
              className="h-10"
            />
          </FormField>

          {/* ── General Log toggle ── */}
          <FormField label="General Log">
            <label className="flex items-center gap-3 h-10 cursor-pointer select-none">
              <div
                onClick={() => set('general_log', !form.general_log)}
                className={`relative w-11 h-6 rounded-full transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  form.general_log ? 'bg-brand-teal-500' : 'bg-theme-border'
                }`}
              >
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-200 shadow-sm ${
                  form.general_log ? 'left-5' : 'left-0.5'
                }`} />
              </div>
              <span className="text-[13px] font-medium text-theme-secondary">
                {form.general_log ? 'General log (not linked to task/issue)' : 'Linked to task / issue'}
              </span>
            </label>
          </FormField>

          {/* ── Notes ── */}
          <FormField label="Notes" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Detailed notes about the work done..." />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
