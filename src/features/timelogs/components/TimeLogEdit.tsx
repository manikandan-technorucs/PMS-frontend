import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Input } from '@/shared/components/ui/Input/Input';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { useToast } from '@/shared/context/ToastContext';
import { timelogsService } from '@/features/timelogs/services/timelogs.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { FormHeader, FormField, FormCard } from '@/shared/components/ui/Form';
import { Clock } from 'lucide-react';

export function TimeLogEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    project_id: null as any, task_id: null as any, issue_id: null as any,
    date: null as any, hours: '', description: '',
  });

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const logData = await timelogsService.getTimelog(parseInt(id!, 10));
        if (logData) {
          setFormData({
            project_id: logData.project || null, task_id: logData.task || null,
            issue_id: logData.issue || null, date: logData.date ? new Date(logData.date) : null,
            hours: logData.hours ? logData.hours.toString() : '', description: logData.description || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
        showToast('error', 'Error', 'Failed to load time log details');
      } finally { setLoading(false); }
    };
    if (id) fetchAll();
  }, [id]);

  const handleWorkItemChange = (val: any) => {
    if (!val) { setFormData(prev => ({ ...prev, task_id: null, issue_id: null })); return; }
    if (val.type === 'task') setFormData(prev => ({ ...prev, task_id: val, issue_id: null }));
    else if (val.type === 'issue') setFormData(prev => ({ ...prev, task_id: null, issue_id: val }));
    else setFormData(prev => ({ ...prev, task_id: val, issue_id: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await timelogsService.updateTimelog(parseInt(id!, 10), {
        project_id: extractId(formData.project_id), task_id: extractId(formData.task_id),
        issue_id: extractId(formData.issue_id),
        date: formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : formData.date,
        hours: parseFloat(formData.hours), description: formData.description || null,
      });
      showToast('success', 'Time Log Updated', 'Your time entry has been successfully updated.');
      navigate(-1);
    } catch (error: any) {
      console.error('Failed to update time log', error);
      showToast('error', 'Update Failed', 'An error occurred while updating the time log.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const currentWorkItem = formData.task_id || formData.issue_id;

  return (
    <PageLayout title="Edit Time Log" showBackButton>
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={Clock} title="Edit Time Entry" subtitle="Update your time log details" color="amber" />
        <FormCard columns={3} footer={{ onCancel: () => navigate(-1), submitLabel: 'Save Changes', submittingLabel: 'Saving...', isSubmitting: submitting }}>
          <FormField label="Project">
            <ServerSearchDropdown entityType="projects" value={formData.project_id} onChange={v => setFormData({...formData, project_id: v, task_id: null, issue_id: null})} placeholder="Select Project" />
          </FormField>
          <FormField label="Task / Issue">
            <ServerSearchDropdown
              entityType="search/work-items" customSearchPath="/search/work-items" value={currentWorkItem}
              onChange={handleWorkItemChange} placeholder={formData.project_id ? "Search Tasks or Issues..." : "Select a project first"}
              disabled={!formData.project_id} filters={formData.project_id ? { project_id: extractId(formData.project_id) } : {}} field="name"
              itemTemplate={(item) => (
                <div className="flex flex-col gap-0.5 py-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${item.type === 'issue' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>{item.type}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{item.public_id}</span>
                </div>
              )}
            />
          </FormField>
          <FormField label="Date" required>
            <SharedCalendar value={formData.date} onChange={v => setFormData({...formData, date: v})} />
          </FormField>
          <FormField label="Hours" required>
            <Input name="hours" type="number" step="0.1" min="0.1" value={formData.hours} onChange={handleChange} required placeholder="e.g. 4.5" className="h-10" />
          </FormField>
          <div>{/* spacer */}</div>
          <div>{/* spacer */}</div>
          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Describe the work done..." />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
