import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { Trash2, FolderKanban, Briefcase, User2, AlignLeft, Settings, Database, Clock, Users, Tag, Building2, Layers } from 'lucide-react';
import { projectsService } from '@/features/projects/api/projects.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { GraphUserAutocomplete } from '../ui/GraphUserAutocomplete';
import { GraphUserMultiSelect } from '../ui/GraphUserMultiSelect';
import { FieldLabel, FieldError, SectionDivider, PremiumFormHeader, inputCls } from '@/components/forms/ModernForm';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/providers/ToastContext';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';

const STATUS_OPTIONS = [
    'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Closed'
].map(s => ({ label: s, value: s }));

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
        name: project.project_name ?? '',
        description: project.description ?? '',
        client: project.client_name ?? '',
        manager_email: project.manager || project.project_manager || null,
        status_id: project.status || null,
        priority_id: project.priority || null,
        start_date: project.expected_start_date ? new Date(project.expected_start_date) : null,
        end_date: project.expected_end_date ? new Date(project.expected_end_date) : null,
        estimated_hours: project.estimated_hours?.toString() ?? '',
        actual_start_date: project.actual_start_date ? new Date(project.actual_start_date) : null,
        actual_end_date: project.actual_end_date ? new Date(project.actual_end_date) : null,
        actual_hours: project.actual_hours?.toString() ?? '',
        is_template: project.is_template ?? false,
        is_archived: project.is_archived ?? false,
        user_ids: project.team_members?.map(m => m.user).filter(Boolean) || [],
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
      showToast('success', 'Project Updated', 'The project has been successfully updated.');
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

  if (loading) return <PageSpinner fullPage label="Loading project data…" />;

  return (
    <PageLayout
      title="Edit Project" showBackButton backPath={`/projects/${projectId}`}
      actions={<Button variant="danger" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete Project</Button>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[980px] mx-auto pb-16 px-4">
        
        <PremiumFormHeader 
            icon={FolderKanban} 
            title="Edit Project Details" 
            subtitle={`Modifying ${projectPublicId}`} 
            color="emerald" 
        />

        <div className="rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-premium)' }}>

            <SectionDivider title="Project Information" />

            <div className="md:col-span-2">
                <FieldLabel label="Project Name" required icon={<FolderKanban size={11} />} />
                <InputText {...register('name')} placeholder="Enter project name"
                    className={inputCls(!!errors.name)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <FieldError message={errors.name?.message} />
            </div>

            <div>
                <FieldLabel label="External Sync ID (Project ID)" />
                <InputText value={projectPublicId} disabled
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', cursor: 'not-allowed', opacity: 0.7 }} />
            </div>

            <div>
                <FieldLabel label="Client" required icon={<Briefcase size={11} />} />
                <InputText {...register('client')} placeholder="e.g. Acme Corp"
                    className={inputCls(!!errors.client)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <FieldError message={errors.client?.message} />
            </div>

            <div className="md:col-span-2">
                <FieldLabel label="Description" icon={<AlignLeft size={11} />} />
                <InputTextarea {...register('description')} rows={3}
                    placeholder="Provide a detailed objective or scope…"
                    className={inputCls()} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }} />
            </div>

            <SectionDivider title="Staffing" />

            <div>
                <FieldLabel label="Project Manager" required icon={<User2 size={11} />} />
                <Controller name="manager_email" control={control} render={({ field }) => (
                    <GraphUserAutocomplete value={field.value} onChange={field.onChange} placeholder="Search for PM…" />
                )} />
                <FieldError message={errors.manager_email?.message as string} />
            </div>

            <div className="md:col-span-2">
                <FieldLabel label="Team Members" icon={<Users size={11} />} />
                <Controller name="user_ids" control={control} render={({ field }) => (
                    <GraphUserMultiSelect value={field.value} onChange={field.onChange} placeholder="Search organization users to add…" />
                )} />
            </div>

            <SectionDivider title="Triage & Classification" />

            <div>
                <FieldLabel label="Status" icon={<Tag size={11} />} />
                <Controller name="status_id" control={control} render={({ field }) => (
                    <ServerSearchDropdown 
                        entityType="masters/statuses" 
                        value={field.value} 
                        onChange={field.onChange} 
                        placeholder="Select Status" 
                        allowedValues={['Planning', 'In Progress', 'Completed', 'On Hold', 'Closed', 'Cancelled']}
                    />
                )} />
            </div>

            <div>
                <FieldLabel label="Priority" />
                <Controller name="priority_id" control={control} render={({ field }) => (
                    <ServerSearchDropdown entityType="masters/priorities" value={field.value} onChange={field.onChange} placeholder="Select Priority" />
                )} />
            </div>

            <div className="flex flex-col gap-3 py-1">
                <FieldLabel label="Settings" icon={<Settings size={11} />} />
                <Controller name="is_template" control={control} render={({ field }) => (
                    <div className="flex items-center gap-2">
                        <Checkbox inputId="is_template" checked={field.value} onChange={(e) => field.onChange(e.checked)} />
                        <label htmlFor="is_template" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>Save as Template</label>
                    </div>
                )} />
                <Controller name="is_archived" control={control} render={({ field }) => (
                    <div className="flex items-center gap-2">
                        <Checkbox inputId="is_archived" checked={field.value} onChange={(e) => field.onChange(e.checked)} />
                        <label htmlFor="is_archived" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>Archived</label>
                    </div>
                )} />
            </div>

            <SectionDivider title="Planning (Expected vs Actual)" />

            <div>
                <FieldLabel label="Expected Start Date" icon={<Clock size={11} />} />
                <Controller name="start_date" control={control} render={({ field }) => (
                    <Calendar value={field.value} onChange={(e) => field.onChange(e.value)}
                        dateFormat="dd/mm/yy" showIcon showButtonBar className="w-full"
                        inputClassName="w-full rounded-xl px-3 py-2.5 text-sm" placeholder="DD/MM/YYYY" />
                )} />
            </div>

            <div>
                <FieldLabel label="Expected End Date" icon={<Clock size={11} />} />
                <Controller name="end_date" control={control} render={({ field }) => (
                    <Calendar value={field.value} onChange={(e) => field.onChange(e.value)}
                        dateFormat="dd/mm/yy" showIcon showButtonBar className="w-full"
                        inputClassName="w-full rounded-xl px-3 py-2.5 text-sm" placeholder="DD/MM/YYYY" />
                )} />
            </div>

            <div>
                <FieldLabel label="Estimated Hours" />
                <InputText type="number" step="0.5" min="0" {...register('estimated_hours')}
                    placeholder="e.g. 120" className={inputCls()}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>

            <div>
                <FieldLabel label="Actual Start Date" icon={<Database size={11} />} />
                <Controller name="actual_start_date" control={control} render={({ field }) => (
                    <Calendar value={field.value} onChange={(e) => field.onChange(e.value)}
                        dateFormat="dd/mm/yy" showIcon showButtonBar className="w-full"
                        inputClassName="w-full rounded-xl px-3 py-2.5 text-sm" placeholder="DD/MM/YYYY" />
                )} />
            </div>

            <div>
                <FieldLabel label="Actual End Date" icon={<Database size={11} />} />
                <Controller name="actual_end_date" control={control} render={({ field }) => (
                    <Calendar value={field.value} onChange={(e) => field.onChange(e.value)}
                        dateFormat="dd/mm/yy" showIcon showButtonBar className="w-full"
                        inputClassName="w-full rounded-xl px-3 py-2.5 text-sm" placeholder="DD/MM/YYYY" />
                )} />
            </div>

            <div>
                <FieldLabel label="Actual Hours" />
                <InputText type="number" step="0.5" min="0" {...register('actual_hours')}
                    placeholder="e.g. 95.5" className={inputCls()}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
        </div>

        <div className="flex items-center justify-between pt-5 mt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
            <Button variant="ghost" type="button" onClick={() => navigate(`/projects/${projectId}`)}>Cancel</Button>
            <button type="submit" disabled={isSubmitting || !isValid}
                className="inline-flex items-center justify-center gap-2 font-bold px-6 rounded-lg text-white text-[13px] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ height: '36px', background: 'linear-gradient(135deg, hsl(160 60% 45%), hsl(200 70% 50%))' }}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
        </div>
      </form>
    </PageLayout>
  );
}
