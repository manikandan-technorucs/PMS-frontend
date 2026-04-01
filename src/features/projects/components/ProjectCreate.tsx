import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { GraphUserAutocomplete } from './GraphUserAutocomplete';
import { GraphUserMultiSelect } from './GraphUserMultiSelect';
import SharedCalendar from '@/components/core/SharedCalendar';
import { useToast } from '@/providers/ToastContext';
import { useApi } from '@/hooks/useApi';
import { useForm } from '@/hooks/useForm';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';
import { FolderKanban } from 'lucide-react';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  start_date: z.any().refine((val) => val !== null && val !== '', { message: 'Expected Start Date is required' }),
  end_date: z.any().refine((val) => val !== null && val !== '', { message: 'Expected End Date is required' }),
  estimated_hours: z.any().refine((val) => val !== null && val !== '', { message: 'Expected Hours is required' }),
});

export function ProjectCreate() {
  const navigate = useNavigate();
  const { post, isSubmitting } = useApi();
  const { showToast } = useToast();

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);
  const extractEmail = (val: any) => (val && typeof val === 'object' ? val.email : val);

  const { form, setValues, handleInputChange, isFormValid } = useForm({
    initialValues: {
      name: '',
      description: '',
      client: '',
      manager_email: null as any,
      status_id: null as any,
      priority_id: null as any,
      is_template: false,
      is_archived: false,
      estimated_hours: '',
      actual_hours: '',
      start_date: new Date(),
      end_date: null as any,
      actual_start_date: null as any,
      actual_end_date: null as any,
      user_ids: [] as any[],
    },
    requiredFields: ['name', 'client', 'manager_email', 'start_date', 'end_date']
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const valResult = projectSchema.safeParse(form);
    if (!valResult.success) {
      showToast('error', 'Validation Error', valResult.error.issues[0].message);
      return;
    }

    if (form.end_date && new Date(form.end_date) < new Date(form.start_date)) {
      showToast('error', 'Validation Error', 'End date must be after start date');
      return;
    }
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        client: form.client,
        manager_email: form.manager_email?.mail || form.manager_email?.email || form.manager_email || null,
        status_id: extractId(form.status_id) || null,
        priority_id: extractId(form.priority_id) || null,
        is_template: form.is_template,
        is_archived: form.is_archived,
        start_date: form.start_date ? new Date(form.start_date).toISOString().split('T')[0] : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString().split('T')[0] : null,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
        actual_start_date: form.actual_start_date ? new Date(form.actual_start_date).toISOString().split('T')[0] : null,
        actual_end_date: form.actual_end_date ? new Date(form.actual_end_date).toISOString().split('T')[0] : null,
        actual_hours: form.actual_hours ? parseFloat(form.actual_hours) : null,
        user_emails: form.user_ids?.map((u: any) => u.mail || u.email || null).filter(Boolean),
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
            <GraphUserAutocomplete value={form.manager_email as any} onChange={v => set('manager_email', v)} placeholder="Search manager..." />
          </FormField>

          <FormField label="Team Members (Graph Search)" className="md:col-span-2 lg:col-span-3">
            <GraphUserMultiSelect
              value={form.user_ids as any[]}
              onChange={v => set('user_ids', v)}
              placeholder="Search organization users..."
            />
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

          <FormField label="Expected Start Date" required>
            <SharedCalendar value={form.start_date} onChange={d => set('start_date', d)} />
          </FormField>
          <FormField label="Expected End Date" required>
            <SharedCalendar value={form.end_date} onChange={d => set('end_date', d)} />
          </FormField>
          
          <FormField label="Actual Hours">
            <Input type="number" step="0.5" min="0" name="actual_hours" value={form.actual_hours} onChange={handleInputChange} className="h-10" placeholder="0" />
          </FormField>
          <FormField label="Actual Start Date">
            <SharedCalendar value={form.actual_start_date} onChange={d => set('actual_start_date', d)} />
          </FormField>
          <FormField label="Actual End Date">
            <SharedCalendar value={form.actual_end_date} onChange={d => set('actual_end_date', d)} />
          </FormField>

          <div className="flex items-end gap-5 pb-1 md:col-span-2 lg:col-span-3">
            <Checkbox id="is_template" label="Save as Template" checked={form.is_template} onChange={(e: any) => set('is_template', e.target.checked)} />
            <Checkbox id="is_archived" label="Mark as Archived" checked={form.is_archived} onChange={(e: any) => set('is_archived', e.target.checked)} />
          </div>
        </FormCard>
      </form>
    </PageLayout>
  );
}