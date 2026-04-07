import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { TextInput } from '@/components/forms/TextInput';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { CheckboxInput } from '@/components/forms/CheckboxInput';
import { Trash2, FolderKanban } from 'lucide-react';
import { projectsService } from '@/features/projects/api/projects.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { GraphUserAutocomplete } from '../ui/GraphUserAutocomplete';
import { GraphUserMultiSelect } from '../ui/GraphUserMultiSelect';
import SharedCalendar from '@/components/core/SharedCalendar';
import { FormHeader, FormField, FormCard } from '@/components/forms/Form';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/providers/ToastContext';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional().nullable(),
  client: z.string().min(1, 'Client name is required'),
  manager_email: z.any().refine((val) => val !== null && val !== '', { message: 'Project Manager is required' }),
  status_id: z.any().optional().nullable(),
  priority_id: z.any().optional().nullable(),
  is_template: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  estimated_hours: z.any().optional().nullable(),
  actual_hours: z.any().optional().nullable(),
  start_date: z.any().optional().nullable(),
  end_date: z.any().optional().nullable(),
  actual_start_date: z.any().optional().nullable(),
  actual_end_date: z.any().optional().nullable(),
  user_ids: z.any().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

export function ProjectEditView() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [projectPublicId, setProjectPublicId] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isSubmitting },
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
      start_date: null,
      end_date: null,
      actual_start_date: null,
      actual_end_date: null,
      user_ids: [],
    },
  });

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const project = await projectsService.getProject(Number(projectId));
      setProjectPublicId(project.public_id);
      
      reset({
        name: project.name ?? '',
        description: project.description ?? '',
        client: project.client ?? '',
        manager_email: project.manager || project.manager_email || null,
        status_id: project.status || null,
        priority_id: project.priority || null,
        start_date: project.start_date ? new Date(project.start_date) : null,
        end_date: project.end_date ? new Date(project.end_date) : null,
        estimated_hours: project.estimated_hours?.toString() ?? '',
        actual_start_date: project.actual_start_date ? new Date(project.actual_start_date) : null,
        actual_end_date: project.actual_end_date ? new Date(project.actual_end_date) : null,
        actual_hours: project.actual_hours?.toString() ?? '',
        is_template: project.is_template ?? false,
        is_archived: project.is_archived ?? false,
        user_ids: project.users || [],
      });
    } catch (err) {
      console.error(err);
      showToast('error', 'Error', 'Failed to load project data.');
    } finally {
      setLoading(false);
    }
  }, [projectId, reset, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onSubmit = async (data: ProjectFormValues) => {
    if (!projectId) return;
    
    if (data.end_date && data.start_date && new Date(data.end_date) < new Date(data.start_date)) {
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
      
      await projectsService.updateProject(Number(projectId), payload);
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Error', err.response?.data?.detail || 'Failed to update project.');
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    try {
      await projectsService.deleteProject(Number(projectId));
      navigate('/projects');
      showToast('success', 'Project Deleted', `Successfully deleted project ${projectPublicId}`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Error', 'Failed to delete project.');
    }
  };

  if (loading) return <div className="p-8 text-gray-600">Loading project...</div>;

  return (
    <PageLayout
      title={`Edit Project ${projectPublicId}`} showBackButton
      actions={<Button variant="danger" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[1200px] mx-auto">
        <FormHeader icon={FolderKanban} title="Edit Project" subtitle={`Editing project ${projectPublicId}`} color="emerald" />

        <FormCard
          columns={3}
          footer={{ onCancel: () => navigate(-1), submitLabel: 'Save Changes', submittingLabel: 'Saving...', isSubmitting, isDisabled: !isValid }}
        >
          <FormField label="Project Name" required>
            <TextInput {...register('name')} error={errors.name?.message} className="h-10" />
          </FormField>
          <FormField label="Project ID">
            <TextInput value={projectPublicId} disabled className="h-10 bg-gray-100" />
          </FormField>
          <FormField label="Client" required>
            <TextInput {...register('client')} error={errors.client?.message} className="h-10" />
          </FormField>

          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <TextAreaInput {...register('description')} rows={2} />
          </FormField>

          <FormField label="Manager" required>
            <Controller
              name="manager_email"
              control={control}
              render={({ field }) => (
                <>
                  <GraphUserAutocomplete value={field.value} onChange={field.onChange} placeholder="Search Manager..." />
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
                <GraphUserMultiSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Search organization users..."
                />
              )}
            />
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
                  placeholder="Select Status" 
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
                <ServerSearchDropdown entityType="masters/priorities" value={field.value} onChange={field.onChange} placeholder="Select Priority" />
              )}
            />
          </FormField>

          <FormField label="Expected Start Date">
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <SharedCalendar value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
          <FormField label="Expected End Date">
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <SharedCalendar value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
          <FormField label="Estimated Hours">
            <TextInput type="number" {...register('estimated_hours')} step="0.5" min="0" className="h-10" />
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
          <FormField label="Actual Hours">
            <TextInput type="number" {...register('actual_hours')} step="0.5" min="0" className="h-10" />
          </FormField>

          <div className="flex items-end gap-5 pb-1 md:col-span-2 lg:col-span-3">
            <Controller
              name="is_template"
              control={control}
              render={({ field }) => (
                <CheckboxInput label="Save as Template" checked={field.value} onChange={(e: any) => field.onChange(e.target.checked)} />
              )}
            />
            <Controller
              name="is_archived"
              control={control}
              render={({ field }) => (
                <CheckboxInput label="Archived" checked={field.value} onChange={(e: any) => field.onChange(e.target.checked)} />
              )}
            />
          </div>
        </FormCard>
      </form>
    </PageLayout>
  );
}
