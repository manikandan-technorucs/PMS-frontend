import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { FolderKanban, Briefcase, User2, AlignLeft, Settings, Database, Clock, Users, Tag, Building2, Layers, Copy } from 'lucide-react';
import { projectsService } from '@/features/projects/api/projects.api';
import { useProjectActions } from '@/features/projects/hooks/useProjectActions';
import { GraphUserAutocomplete } from '../ui/GraphUserAutocomplete';
import { GraphUserMultiSelect } from '../ui/GraphUserMultiSelect';
import { FieldLabel, FieldError, SectionDivider, PremiumFormHeader, inputCls } from '@/components/forms/ModernForm';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/providers/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Checkbox } from 'primereact/checkbox';
import { ServerLookupDropdown } from '@/components/core/ServerLookupDropdown';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { useCloneProjectToTemplate } from '../../hooks/useTemplates';

const STATUS_OPTIONS = [
  'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Closed'
].map(s => ({ label: s, value: s }));

const PRIORITY_OPTIONS = [
  'Critical', 'High', 'Medium', 'Low'
].map(p => ({ label: p, value: p }));

const projectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  description: z.string().trim().optional().nullable(),
  client: z.string().trim().min(1, 'Client name is required'),
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
  delivery_head: z.any().refine((val) => val !== null && val !== '', { message: 'Delivery Head is required' }),
  user_ids: z.any().optional(),
}).superRefine((data, ctx) => {
    if (data.start_date && data.end_date) {
        if (new Date(data.end_date) < new Date(data.start_date)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date must be after start date", path: ["end_date"] });
        }
    }
    if (data.actual_start_date && data.actual_end_date) {
        if (new Date(data.actual_end_date) < new Date(data.actual_start_date)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Actual end date must be after actual start date", path: ["actual_end_date"] });
        }
    }
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

export function ProjectEditView() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { showToast } = useToast();
  const { updateProject, deleteProject } = useProjectActions();

  const [loading, setLoading] = useState(true);
  const [projectPublicId, setProjectPublicId] = useState('');

  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [cloneMilestones, setCloneMilestones] = useState(false);
  const cloneToTemplate = useCloneProjectToTemplate();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    clearErrors,
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
      delivery_head: null,
      user_ids: [],
    },
  });

  const projectName = watch('name');
  const debouncedName = useDebounce(projectName, 500);

  useEffect(() => {
    if (debouncedName?.trim()) {
      projectsService.checkName(debouncedName.trim(), Number(projectId)).then(exists => {
        if (exists) {
          setError('name', { type: 'manual', message: 'A project with this name already exists' });
        } else {
          if (errors.name?.type === 'manual') {
            clearErrors('name');
          }
        }
      }).catch(console.error);
    }
  }, [debouncedName, projectId, setError, clearErrors, errors.name?.type]);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const project = await projectsService.getProject(Number(projectId));
      setProjectPublicId(project.public_id);

      const pm = project.project_manager;
      const managerForForm = pm
        ? { id: String(pm.id), displayName: pm.display_name || pm.full_name || pm.email || '', mail: pm.email || null }
        : null;

      const dh = project.delivery_head;
      const dhForForm = dh
        ? { id: String(dh.id), displayName: dh.display_name || dh.full_name || dh.email || '', mail: dh.email || null }
        : null;

      reset({
        name: project.project_name ?? '',
        description: project.description ?? '',
        client: project.client_name ?? '',
        manager_email: managerForForm,
        delivery_head: dhForForm,

        status_id: project.status_master || project.status_id || null,
        priority_id: project.priority_master || project.priority_id || null,

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

    if (!projectId) return;

    try {
      const rawManagerId = (data.manager_email as any)?.id;
      const parsedManagerId = rawManagerId ? Number(rawManagerId) : NaN;
      const managerEmail = (data.manager_email as any)?.mail || null;
      const extractLookupId = (val: any): number | null => {
        if (!val) return null;
        if (typeof val === 'object' && val.id) return Number(val.id);
        const n = Number(val);
        return isNaN(n) ? null : n;
      };

      const payload: any = {

        project_name: data.name,
        description: data.description || null,
        client_name: data.client,
        ...(isNaN(parsedManagerId)
          ? { project_manager_email: managerEmail }
          : { project_manager_id: parsedManagerId }
        ),
        ...( (extractId(data.delivery_head) === null || isNaN(Number(extractId(data.delivery_head))))
          ? { delivery_head_email: (data.delivery_head as any)?.mail || null }
          : { delivery_head_id: Number(extractId(data.delivery_head)) }
        ),
        status_id: extractLookupId(data.status_id),
        priority_id: extractLookupId(data.priority_id),

        is_template: data.is_template,
        is_archived: data.is_archived,
        expected_start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : null,
        expected_end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : null,
        estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
        actual_start_date: data.actual_start_date ? new Date(data.actual_start_date).toISOString().split('T')[0] : null,
        actual_end_date: data.actual_end_date ? new Date(data.actual_end_date).toISOString().split('T')[0] : null,
        actual_hours: data.actual_hours ? parseFloat(data.actual_hours) : null,
        user_emails: (data.user_ids ?? []).map((u: any) => u.mail || u.email || null).filter(Boolean),
      };

      await updateProject.mutateAsync({ id: Number(projectId), data: payload });
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Error', err.response?.data?.detail || 'Failed to update project.');
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    try {
      await deleteProject.mutateAsync(Number(projectId));
      navigate('/projects');
    } catch (err) {
      console.error(err);
      showToast('error', 'Error', 'Failed to delete project.');
    }
  };

  if (loading) return <PageSpinner fullPage label="Loading project data…" />;

  const handleCloneToTemplate = async () => {
    if (!cloneName.trim()) return;
    await cloneToTemplate.mutateAsync({
      projectId: Number(projectId),
      template_name: cloneName.trim(),
      include_milestones: cloneMilestones,
    });
    setShowCloneDialog(false);
  };

  return (
    <>

      <Dialog
        visible={showCloneDialog}
        onHide={() => setShowCloneDialog(false)}
        header={
          <div className="flex items-center gap-2">
            <Copy size={16} style={{ color: 'hsl(160 60% 45%)' }} />
            <span>Save as Template</span>
          </div>
        }
        style={{ width: '420px' }}
        footer={
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCloneDialog(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleCloneToTemplate}
              disabled={!cloneName.trim() || cloneToTemplate.isPending}
            >
              <Copy size={14} />
              {cloneToTemplate.isPending ? 'Saving…' : 'Save Template'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Template Name <span className="text-red-500">*</span>
            </label>
            <InputText
              value={cloneName}
              onChange={e => setCloneName(e.target.value)}
              placeholder={`${projectPublicId} Template`}
              className="w-full"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="clone-milestones"
              checked={cloneMilestones}
              onChange={e => setCloneMilestones(e.checked ?? false)}
            />
            <label htmlFor="clone-milestones" className="text-sm font-medium cursor-pointer" style={{ color: 'var(--text-primary)' }}>
              Include milestone tasks
            </label>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Only task names, descriptions, and estimated hours are copied.
            Assignees, statuses, dates, and comments are excluded.
          </p>
        </div>
      </Dialog>

      <PageLayout
        title="Edit Project" showBackButton backPath={`/projects/${projectId}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => { setCloneName(`${projectPublicId} Template`); setShowCloneDialog(true); }}
              className="!h-9 !px-4"
              title="Save a copy of this project as a reusable template"
            >
              <Copy size={14} /> Save as Template
            </Button>
            <Button variant="danger" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete Project</Button>
          </div>
        }
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

            <div>
              <FieldLabel label="Delivery Head" required icon={<User2 size={11} />} />
              <Controller name="delivery_head" control={control} render={({ field }) => (
                <GraphUserAutocomplete value={field.value} onChange={field.onChange} placeholder="Search for DH…" />
              )} />
              <FieldError message={errors.delivery_head?.message as string} />
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
                <ServerLookupDropdown
                  category="ProjectStatus"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Status"
                />
              )} />
            </div>

            <div>
              <FieldLabel label="Priority" />
              <Controller name="priority_id" control={control} render={({ field }) => (
                <ServerLookupDropdown
                  category="TaskPriority"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Priority"
                />
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
              <FieldError message={errors.end_date?.message as string} />
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
              <FieldError message={errors.actual_end_date?.message as string} />
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
            <Button variant="gradient" type="submit" loading={isSubmitting} disabled={!isValid}>
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </PageLayout>
    </>
  );
}
