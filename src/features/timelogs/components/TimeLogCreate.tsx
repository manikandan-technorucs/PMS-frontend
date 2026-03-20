import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/shared/hooks/useApi';
import { useForm } from '@/shared/hooks/useForm';
import { useAuth } from '@/shared/context/AuthContext';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { FormHeader, FormField, FormCard } from '@/shared/components/ui/Form';
import { Clock } from 'lucide-react';

export function TimeLogCreate() {
  const navigate = useNavigate();
  const { post, isSubmitting } = useApi();
  const { user } = useAuth();

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

  const { form, setValues, handleInputChange, isFormValid } = useForm({
    initialValues: {
      project_id: null as any,
      task_id: null as any,
      issue_id: null as any,
      date: new Date(),
      start_time: '09:00',
      end_time: '10:00',
      hours: '1.0',
      billing_type: 'Billable',
      description: ''
    },
    requiredFields: ['project_id', 'date', 'hours', 'billing_type']
  });

  const handleWorkItemChange = (val: any) => {
    if (!val) {
      setValues(prev => ({ ...prev, task_id: null, issue_id: null }));
      return;
    }
    if (val.type === 'task') {
      setValues(prev => ({ ...prev, task_id: val, issue_id: null }));
    } else if (val.type === 'issue') {
      setValues(prev => ({ ...prev, task_id: null, issue_id: val }));
    } else {
      setValues(prev => ({ ...prev, task_id: val, issue_id: null }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await post('/timelogs/', {
        project_id: extractId(form.project_id),
        task_id: extractId(form.task_id),
        issue_id: extractId(form.issue_id),
        user_email: user?.email || '',
        date: form.date.toISOString().split('T')[0],
        hours: parseFloat(form.hours),
        billing_type: form.billing_type,
        description: form.description || null
      }, 'Time logged successfully!');
      navigate('/time-log');
    } catch (err) {
      console.error('Failed to log time:', err);
    }
  };

  return (
    <PageLayout title="Log Time" showBackButton backPath="/time-log">
      <form onSubmit={handleSave} className="max-w-[1200px] mx-auto">
        <FormHeader icon={Clock} title="Time Entry Details" subtitle="Record your work hours against a project or task" color="amber" />

        <FormCard
          columns={3}
          footer={{ onCancel: () => navigate('/time-log'), submitLabel: 'Log Time', submittingLabel: 'Saving...', isSubmitting, isDisabled: !isFormValid }}
        >
          <FormField label="Project" required>
            <ServerSearchDropdown
              entityType="projects"
              value={form.project_id}
              onChange={v => setValues(prev => ({ ...prev, project_id: v, task_id: null, issue_id: null }))}
              placeholder="Select Project"
            />
          </FormField>

          <FormField label="Task / Issue">
            <ServerSearchDropdown
              entityType="search/work-items"
              customSearchPath="/search/work-items"
              value={form.task_id || form.issue_id}
              onChange={handleWorkItemChange}
              placeholder={form.project_id ? "Search Tasks or Issues..." : "Select a project first"}
              disabled={!form.project_id}
              filters={form.project_id ? { project_id: extractId(form.project_id) } : {}}
              field="name"
              itemTemplate={(item) => (
                <div className="flex flex-col gap-0.5 py-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${item.type === 'issue' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{item.public_id}</span>
                </div>
              )}
            />
          </FormField>

          <FormField label="Date" required>
            <SharedCalendar value={form.date} onChange={v => setValues(prev => ({ ...prev, date: v }))} />
          </FormField>

          <FormField label="Hours" required>
            <Input name="hours" type="number" step="0.1" value={form.hours} onChange={handleInputChange} placeholder="e.g. 1.0" className="h-10" />
          </FormField>

          <FormField label="Start Time">
            <Input name="start_time" type="time" value={form.start_time} onChange={handleInputChange} className="h-10" />
          </FormField>

          <FormField label="End Time">
            <Input name="end_time" type="time" value={form.end_time} onChange={handleInputChange} className="h-10" />
          </FormField>

          <FormField label="Billing Type" required>
            <Select name="billing_type" value={form.billing_type} onChange={handleInputChange}>
              <option value="Billable">Billable</option>
              <option value="Non-Billable">Non-Billable</option>
            </Select>
          </FormField>

          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={form.description} onChange={handleInputChange} rows={2} placeholder="What did you work on?" />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
