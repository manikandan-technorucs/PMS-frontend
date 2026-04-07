import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { TextInput } from '@/components/forms/TextInput';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { CheckboxInput } from '@/components/forms/CheckboxInput';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { GraphUserAutocomplete } from '../ui/GraphUserAutocomplete';
import { GraphUserMultiSelect } from '../ui/GraphUserMultiSelect';
import SharedCalendar from '@/components/core/SharedCalendar';
import { useToast } from '@/providers/ToastContext';
import { useProjectActions } from '../../hooks/useProjectActions';
import { FormHeader, FormField, FormCard } from '@/components/forms/Form';
import { FolderKanban } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  client: z.string().min(1, 'Client name is required'),
  manager_email: z.any().refine((val) => val !== null && val !== '', { message: 'Project Manager is required' }),
  status_id: z.any().optional(),
  priority_id: z.any().optional(),
  is_template: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  estimated_hours: z.any().optional(),
  actual_hours: z.any().optional(),
  start_date: z.any().refine((val) => val !== null && val !== '', { message: 'Expected Start Date is required' }),
  end_date: z.any().refine((val) => val !== null && val !== '', { message: 'Expected End Date is required' }),
  actual_start_date: z.any().optional(),
  actual_end_date: z.any().optional(),
  user_ids: z.any().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

export function ProjectCreateView() {
  const navigate = useNavigate();
  const { createProject } = useProjectActions();
  const isSubmitting = createProject.isPending;
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      client: '',
      manager_email: null,
      status_id: null,
      priority_id: null,
      is_template: false,
      is_archived: false,
      estimated_hours: '',
      actual_hours: '',
      start_date: new Date(),
      end_date: null,
      actual_start_date: null,
      actual_end_date: null,
      user_ids: [],
    },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    if (data.end_date && new Date(data.end_date) < new Date(data.start_date)) {
      showToast('error', 'Validation Error', 'End date must be after start date');
      return;
    }
    
    try {
      const payload: any = {
        name: data.name,
        description: data.description || null,
        client: data.client,
        manager_email: data.manager_email?.mail || data.manager_email?.email || data.manager_email || null,
        status_id: extractId(data.status_id) || null,
        priority_id: extractId(data.priority_id) || null,
        is_template: data.is_template,
        is_archived: data.is_archived,
        start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : null,
        end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : null,
        estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
        actual_start_date: data.actual_start_date ? new Date(data.actual_start_date).toISOString().split('T')[0] : null,
        actual_end_date: data.actual_end_date ? new Date(data.actual_end_date).toISOString().split('T')[0] : null,
        actual_hours: data.actual_hours ? parseFloat(data.actual_hours) : null,
        user_emails: data.user_ids?.map((u: any) => u.mail || u.email || null).filter(Boolean),
      };
      await createProject.mutateAsync(payload);
      navigate('/projects');
    } catch (err: any) {
      console.error('Failed to create project', err);
    }
  };

  return (
    <PageLayout title="Create New Project" showBackButton backPath="/projects">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[1200px] mx-auto">
        <FormHeader icon={FolderKanban} title="Project Details" subtitle="Fill in the details below to create a new project" color="emerald" />

        <FormCard
          columns={3}
          footer={{ onCancel: () => navigate('/projects'), submitLabel: 'Create Project', submittingLabel: 'Creating...', isSubmitting, isDisabled: !isValid }}
        >
          <FormField label="Project Name" required>
            <TextInput {...register('name')} error={errors.name?.message} placeholder="e.g. Acme Redesign" className="h-10" />
          </FormField>
          <FormField label="Client" required>
            <TextInput {...register('client')} error={errors.client?.message} placeholder="Client name" className="h-10" />
          </FormField>

          <FormField label="Project Manager" required>
            <Controller
              name="manager_email"
              control={control}
              render={({ field }) => (
                <>
                  <GraphUserAutocomplete value={field.value} onChange={field.onChange} placeholder="Search manager..." />
                  {errors.manager_email && <span className="text-red-500 text-xs">{errors.manager_email.message as string}</span>}
                </>
              )}
            />
          </FormField>

          <FormField label="Team Members (Graph Search)" className="md:col-span-2 lg:col-span-3">
            <Controller
              name="user_ids"
              control={control}
              render={({ field }) => (
                <GraphUserMultiSelect value={field.value} onChange={field.onChange} placeholder="Search organization users..." />
              )}
            />
          </FormField>

          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <TextAreaInput {...register('description')} rows={2} placeholder="Brief project description..." />
          </FormField>

          <FormField label="Status">
            <Controller
              name="status_id"
              control={control}
              render={({ field }) => (
                <ServerSearchDropdown 
                  entityType="masters/statuses" 
                  value={field.value} 
                  onChange={field.onChange} 
                  placeholder="Select status" 
                  allowedValues={['Planning', 'In Progress', 'Completed', 'On Hold', 'Closed', 'Cancelled']}
                />
              )}
            />
          </FormField>

          <FormField label="Priority">
            <Controller
              name="priority_id"
              control={control}
              render={({ field }) => (
                <ServerSearchDropdown entityType="masters/priorities" value={field.value} onChange={field.onChange} placeholder="Select priority" />
              )}
            />
          </FormField>

          <FormField label="Estimated Hours">
            <TextInput type="number" step="0.5" min="0" {...register('estimated_hours')} className="h-10" placeholder="0" />
          </FormField>

          <FormField label="Expected Start Date" required>
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <>
                  <SharedCalendar value={field.value} onChange={field.onChange} />
                  {errors.start_date && <span className="text-red-500 text-xs">{errors.start_date.message as string}</span>}
                </>
              )}
            />
          </FormField>

          <FormField label="Expected End Date" required>
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <>
                  <SharedCalendar value={field.value} onChange={field.onChange} />
                  {errors.end_date && <span className="text-red-500 text-xs">{errors.end_date.message as string}</span>}
                </>
              )}
            />
          </FormField>
          
          <FormField label="Actual Hours">
            <TextInput type="number" step="0.5" min="0" {...register('actual_hours')} className="h-10" placeholder="0" />
          </FormField>

          <FormField label="Actual Start Date">
            <Controller
              name="actual_start_date"
              control={control}
              render={({ field }) => (
                <SharedCalendar value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          <FormField label="Actual End Date">
            <Controller
              name="actual_end_date"
              control={control}
              render={({ field }) => (
                <SharedCalendar value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          <div className="flex items-end gap-5 pb-1 md:col-span-2 lg:col-span-3">
            <Controller
              name="is_template"
              control={control}
              render={({ field }) => (
                <CheckboxInput id="is_template" label="Save as Template" checked={field.value} onChange={(e: any) => field.onChange(e.target.checked)} />
              )}
            />
            <Controller
              name="is_archived"
              control={control}
              render={({ field }) => (
                <CheckboxInput id="is_archived" label="Mark as Archived" checked={field.value} onChange={(e: any) => field.onChange(e.target.checked)} />
              )}
            />
          </div>
        </FormCard>
      </form>
    </PageLayout>
  );
}
