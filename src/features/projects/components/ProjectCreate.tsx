import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Input } from '@/shared/components/ui/Input/Input';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { Checkbox } from '@/shared/components/ui/Checkbox/Checkbox';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { useToast } from '@/shared/context/ToastContext';
import { useApi } from '@/shared/hooks/useApi';
import { useForm } from '@/shared/hooks/useForm';
import { FormHeader, FormField, FormCard } from '@/shared/components/ui/Form';
import { FolderKanban } from 'lucide-react';

export function ProjectCreate() {
  const navigate = useNavigate();
  const { post, isSubmitting } = useApi();
  const { showToast } = useToast();

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

  const { form, setValues, handleInputChange, isFormValid } = useForm({
    initialValues: {
      name: '',
      description: '',
      client: '',
      manager_id: null as any,
      status_id: null as any,
      priority_id: null as any,
      dept_id: null as any,
      team_id: null as any,
      group_id: null as any,
      is_template: false,
      is_archived: false,
      estimated_hours: '',
      start_date: new Date(),
      end_date: null as any,
    },
    requiredFields: ['name', 'client', 'manager_id', 'start_date']
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
      showToast('error', 'Validation Error', 'End date must be after start date');
      return;
    }
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        client: form.client,
        manager_id: extractId(form.manager_id),
        status_id: extractId(form.status_id) || null,
        priority_id: extractId(form.priority_id) || null,
        dept_id: extractId(form.dept_id) || null,
        team_id: extractId(form.team_id) || null,
        group_id: extractId(form.group_id) || null,
        is_template: form.is_template,
        is_archived: form.is_archived,
        start_date: form.start_date ? new Date(form.start_date).toISOString().split('T')[0] : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString().split('T')[0] : null,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
      };
      await post('/projects/', payload, 'Project created successfully!');
      navigate('/projects');
    } catch (err: any) {
      console.error('Failed to create project', err);
    }
  };

  const set = (field: string, val: any) => setValues(prev => ({ ...prev, [field]: val }));

  return (
    <PageLayout title="Create New Project" showBackButton backPath="/projects">
      <form onSubmit={onSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={FolderKanban} title="Project Details" subtitle="Fill in the details below to create a new project" color="emerald" />

        <FormCard
          columns={3}
          footer={{ onCancel: () => navigate('/projects'), submitLabel: 'Create Project', submittingLabel: 'Creating...', isSubmitting, isDisabled: !isFormValid }}
        >
          <FormField label="Project Name" required>
            <Input name="name" value={form.name} onChange={handleInputChange} placeholder="e.g. Acme Redesign" className="h-10" />
          </FormField>
          <FormField label="Client" required>
            <Input name="client" value={form.client} onChange={handleInputChange} placeholder="Client name" className="h-10" />
          </FormField>
          <FormField label="Project Manager" required>
            <ServerSearchDropdown entityType="users" value={form.manager_id} onChange={v => set('manager_id', v)} placeholder="Select manager" />
          </FormField>

          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={form.description} onChange={handleInputChange} rows={2} placeholder="Brief project description..." />
          </FormField>

          <FormField label="Status">
            <ServerSearchDropdown entityType="masters/statuses" value={form.status_id} onChange={v => set('status_id', v)} placeholder="Select status" />
          </FormField>
          <FormField label="Priority">
            <ServerSearchDropdown entityType="masters/priorities" value={form.priority_id} onChange={v => set('priority_id', v)} placeholder="Select priority" />
          </FormField>
          <FormField label="Estimated Hours">
            <Input type="number" step="0.5" min="0" name="estimated_hours" value={form.estimated_hours} onChange={handleInputChange} className="h-10" placeholder="0" />
          </FormField>

          <FormField label="Start Date" required>
            <SharedCalendar value={form.start_date} onChange={d => set('start_date', d)} />
          </FormField>
          <FormField label="End Date">
            <SharedCalendar value={form.end_date} onChange={d => set('end_date', d)} />
          </FormField>
          <FormField label="Department">
            <ServerSearchDropdown entityType="departments" value={form.dept_id} onChange={v => set('dept_id', v)} placeholder="Select department" />
          </FormField>

          <FormField label="Team">
            <ServerSearchDropdown entityType="teams" value={form.team_id} onChange={v => set('team_id', v)} placeholder="Select team" />
          </FormField>
          <FormField label="Project Group">
            <ServerSearchDropdown entityType="project-groups" value={form.group_id} onChange={v => set('group_id', v)} placeholder="Select group" />
          </FormField>
          <div className="flex items-end gap-5 pb-1">
            <Checkbox id="is_template" label="Save as Template" checked={form.is_template} onChange={(e: any) => set('is_template', e.target.checked)} />
            <Checkbox id="is_archived" label="Mark as Archived" checked={form.is_archived} onChange={(e: any) => set('is_archived', e.target.checked)} />
          </div>
        </FormCard>
      </form>
    </PageLayout>
  );
}