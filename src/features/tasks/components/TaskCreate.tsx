import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntity } from '@/hooks/useEntity';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';
import { ClipboardList } from 'lucide-react';

export function TaskCreate() {
  const navigate = useNavigate();
  const { create, loading } = useEntity('tasks');

  const [formData, setFormData] = useState({
    title: '',
    project_id: null as any,
    assignee_email: null as any,
    task_list_id: null as any,
    status_id: null as any,
    priority_id: null as any,
    start_date: new Date(),
    end_date: null as any,
    estimated_hours: '',
    description: '',
  });

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);
  const extractEmail = (val: any) => (val && typeof val === 'object' ? val.email : val);

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        ...formData,
        project_id: extractId(formData.project_id),
        assignee_email: extractEmail(formData.assignee_email),
        task_list_id: extractId(formData.task_list_id),
        status_id: extractId(formData.status_id),
        priority_id: extractId(formData.priority_id),
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        start_date: formData.start_date?.toISOString().split('T')[0],
        end_date: formData.end_date ? (formData.end_date instanceof Date ? formData.end_date.toISOString().split('T')[0] : formData.end_date) : null,
        progress: 0
      };
      await create(payload);
      navigate('/tasks');
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));

  return (
    <PageLayout title="Create New Task" showBackButton backPath="/tasks">
      <form onSubmit={handleSave} className="max-w-[1200px] mx-auto">
        <FormHeader icon={ClipboardList} title="Task Details" subtitle="Fill in the details below to create a new task" color="blue" />

        <FormCard
          columns={3}
          footer={{ onCancel: () => navigate('/tasks'), submitLabel: 'Create Task', submittingLabel: 'Creating...', isSubmitting: loading, isDisabled: !formData.title.trim() }}
        >
          <FormField label="Task Title" required className="md:col-span-2 lg:col-span-3">
            <Input name="title" value={formData.title} onChange={handleChange} required placeholder="Enter task title" className="h-10" />
          </FormField>

          <FormField label="Project">
            <ServerSearchDropdown entityType="projects" value={formData.project_id} onChange={v => set('project_id', v)} placeholder="Select Project" />
          </FormField>

          <FormField label="Assignee">
            <ServerSearchDropdown entityType="users" value={formData.assignee_email} onChange={v => set('assignee_email', v)} placeholder="Select Assignee" />
          </FormField>

          <FormField label="Task List">
            <ServerSearchDropdown
              entityType="tasklists"
              value={formData.task_list_id}
              onChange={v => set('task_list_id', v)}
              placeholder="Select Task List"
              disabled={!formData.project_id}
              filters={formData.project_id ? { project_id: extractId(formData.project_id) } : {}}
            />
          </FormField>

          <FormField label="Status">
            <ServerSearchDropdown entityType="masters/statuses" value={formData.status_id} onChange={v => set('status_id', v)} placeholder="Select Status" />
          </FormField>

          <FormField label="Priority">
            <ServerSearchDropdown entityType="masters/priorities" value={formData.priority_id} onChange={v => set('priority_id', v)} placeholder="Select Priority" />
          </FormField>

          <FormField label="Estimated Hours">
            <Input name="estimated_hours" type="number" value={formData.estimated_hours} onChange={handleChange} placeholder="e.g. 10" className="h-10" />
          </FormField>

          <FormField label="Start Date">
            <SharedCalendar value={formData.start_date} onChange={v => set('start_date', v)} />
          </FormField>

          <FormField label="End Date">
            <SharedCalendar value={formData.end_date} onChange={v => set('end_date', v)} />
          </FormField>

          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Detailed description of the task" />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
