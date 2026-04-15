import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/providers/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { Trash2, ClipboardEdit, ClipboardList, Layers, Tag, User2, Users, Calendar as CalIcon, Percent } from 'lucide-react';
import { tasksService } from '@/features/tasks/api/tasks.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { ServerLookupDropdown } from '@/components/core/ServerLookupDropdown';
import { GraphUserMultiSelect } from '@/features/projects/components/ui/GraphUserMultiSelect';
import { FilteredStatusSelect } from '@/components/core/FilteredStatusSelect';
import { FieldLabel, FieldError, SectionDivider, PremiumFormHeader, inputCls } from '@/components/forms/ModernForm';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  project_id: z.any().optional(),
  task_list_id: z.any().optional(),
  status_id: z.any().optional(),
  priority_id: z.any().optional(),
  assignees: z.array(z.any()).optional(),
  owners: z.array(z.any()).optional(),
  estimated_hours: z.string().or(z.number()).optional(),
  actual_hours: z.string().or(z.number()).optional(),
  progress: z.string().or(z.number()).optional(),
  start_date: z.any().optional().nullable(),
  end_date: z.any().optional().nullable(),
  description: z.string().optional().nullable()
});

type TaskFormData = z.infer<typeof taskSchema>;

const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

export function TaskEditView() {
  const { showToast } = useToast();
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [taskPublicId, setTaskPublicId] = useState('');
  const [dbStatusName, setDbStatusName] = useState('');

  const { control, register, handleSubmit, watch, setValue, reset, formState: { errors, isValid } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      assignees: [],
      owners: [],
      progress: 0
    }
  });

  const watchProjectId = watch('project_id');
  const watchAssignees = watch('assignees') || [];
  const watchOwners = watch('owners') || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!taskId) return;
        const task: any = await tasksService.getTask(parseInt(taskId, 10));
        setTaskPublicId(task.public_id || `TSK-${task.id}`);
        setDbStatusName(task.status?.name || task.status || '');
        
        reset({
          title: task.title || '',
          description: task.description || '',
          project_id: task.project_id || task.project || null,
          task_list_id: task.task_list_id || task.task_list || null,
          status_id: task.status_id || task.status || null,
          priority_id: task.priority_id || task.priority || null,
          assignees: task.assignees || [],
          owners: task.owners || [],
          start_date: task.start_date ? new Date(task.start_date) : null,
          end_date: task.due_date ? new Date(task.due_date) : null,
          estimated_hours: task.estimated_hours?.toString() || '',
          actual_hours: task.actual_hours?.toString() || task.work_hours?.toString() || '',
          progress: task.completion_percentage !== undefined ? task.completion_percentage.toString() : '0'
        });
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [taskId, reset]);

  const onSubmit = async (data: any) => {
    if (!taskId) return;
    setSubmitting(true);
    try {
      const payload = {
        title: data.title,
        description: data.description || null,
        project_id: extractId(data.project_id),
        task_list_id: extractId(data.task_list_id),
        status_id: extractId(data.status_id),
        priority_id: extractId(data.priority_id),
        owner_emails: data.owners.map((o: any) => o.mail || o.email || null).filter(Boolean),
        assignee_emails: data.assignees.map((a: any) => a.mail || a.email || null).filter(Boolean),
        estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours as string) : null,
        actual_hours: data.actual_hours ? parseFloat(data.actual_hours as string) : null,
        progress: data.progress ? parseInt(data.progress as string, 10) : 0,
        start_date: data.start_date ? data.start_date.toISOString().split('T')[0] : null,
        end_date: data.end_date ? data.end_date.toISOString().split('T')[0] : null,
      };

      await tasksService.updateTask(parseInt(taskId, 10), payload);
      showToast('success', 'Task Updated', 'The task has been successfully updated.');
      navigate(`/tasks/${taskId}`);
    } catch (error: any) {
      console.error('Failed to update task:', error);
      showToast('error', 'Update Failed', error?.response?.data?.detail || 'An error occurred while updating the task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (taskId) {
        await tasksService.deleteTask(parseInt(taskId, 10));
        showToast('success', 'Task Deleted', 'The task was successfully deleted.');
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      showToast('error', 'Deletion Failed', 'Failed to delete task');
    }
  };

  if (loading) return <PageSpinner fullPage label="Loading task data…" />;

  return (
    <PageLayout
      title="Edit Task"
      showBackButton backPath={`/tasks/${taskId}`}
      actions={<Button variant="danger" type="button" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete Task</Button>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[980px] mx-auto pb-16 px-4">
        
        <PremiumFormHeader 
            icon={ClipboardEdit} 
            title="Edit Task Details" 
            subtitle={`Modifying ${taskPublicId}`} 
            color="cyan" 
        />

        <div className="rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-premium)' }}>

            <SectionDivider title="Task Identification" />

            <div className="lg:col-span-3">
                <FieldLabel label="Task Title" required icon={<ClipboardList size={11} />} />
                <InputText {...register('title')} placeholder="Brief title of the task"
                    className={inputCls(!!errors.title)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <FieldError message={errors.title?.message} />
            </div>

            <div>
                <FieldLabel label="Project" />
                <Controller name="project_id" control={control} render={({ field }) => (
                    <ServerSearchDropdown entityType="projects" value={field.value} onChange={(v) => { field.onChange(v); setValue('task_list_id', null); }} placeholder="Select Project" />
                )} />
            </div>

            <div>
                <FieldLabel label="Task List" icon={<Layers size={11} />} />
                <Controller name="task_list_id" control={control} render={({ field }) => (
                    <ServerSearchDropdown 
                      entityType="tasklists" 
                      value={field.value} 
                      onChange={field.onChange} 
                      placeholder="Select Task List" 
                      filters={watchProjectId ? { project_id: extractId(watchProjectId) } : {}} 
                      disabled={!watchProjectId} 
                    />
                )} />
            </div>

            <div />

            <SectionDivider title="Triage & Status" />

            <div>
                <FieldLabel label="Status" icon={<Tag size={11} />} />
                <Controller name="status_id" control={control} render={({ field }) => (
                    <ServerLookupDropdown category="TaskStatus" value={field.value} onChange={field.onChange} placeholder="Select Status" />
                )} />
            </div>

            <div>
                <FieldLabel label="Priority" />
                <Controller name="priority_id" control={control} render={({ field }) => (
                    <ServerLookupDropdown category="TaskPriority" value={field.value} onChange={field.onChange} placeholder="Select Priority" />
                )} />
            </div>

            <div>
                <FieldLabel label="Progress (%)" icon={<Percent size={11} />} />
                <InputText type="number" min="0" max="100" {...register('progress')}
                    placeholder="0" className={inputCls(!!errors.progress)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <FieldError message={errors.progress?.message} />
            </div>

            <SectionDivider title="Assignment" />

            <div>
                <FieldLabel label="Owners" icon={<User2 size={11} />} />
                <GraphUserMultiSelect value={watchOwners} onChange={(users) => setValue('owners', users, { shouldDirty: true })} placeholder="Search owners…" />
            </div>

            <div>
                <FieldLabel label="Assignees" icon={<Users size={11} />} />
                <GraphUserMultiSelect value={watchAssignees} onChange={(users) => setValue('assignees', users, { shouldDirty: true })} placeholder="Search assignees…" />
            </div>
            
            <div />

            <SectionDivider title="Time & Schedule" />

            <div>
                <FieldLabel label="Start Date" icon={<CalIcon size={11} />} />
                <Controller name="start_date" control={control} render={({ field }) => (
                    <Calendar value={field.value} onChange={(e) => field.onChange(e.value)}
                        dateFormat="dd/mm/yy" showIcon showButtonBar className="w-full"
                        inputClassName="w-full rounded-xl px-3 py-2.5 text-sm" placeholder="DD/MM/YYYY" />
                )} />
            </div>

            <div>
                <FieldLabel label="End Date" icon={<CalIcon size={11} />} />
                <Controller name="end_date" control={control} render={({ field }) => (
                    <Calendar value={field.value} onChange={(e) => field.onChange(e.value)}
                        dateFormat="dd/mm/yy" showIcon showButtonBar className="w-full"
                        inputClassName="w-full rounded-xl px-3 py-2.5 text-sm" placeholder="DD/MM/YYYY" />
                )} />
            </div>

            <div />

            <div>
                <FieldLabel label="Estimated Hours" />
                <InputText type="number" step="0.1" min="0" {...register('estimated_hours')}
                    placeholder="e.g. 4.5" className={inputCls(!!errors.estimated_hours)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>

            <div>
                <FieldLabel label="Actual Hours (Logged)" />
                <InputText type="number" step="0.5" min="0" {...register('actual_hours')}
                    placeholder="e.g. 2.0" className={inputCls(!!errors.actual_hours)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>

            <div />

            <SectionDivider title="Details" />

            <div className="lg:col-span-3">
                <FieldLabel label="Description" />
                <InputTextarea {...register('description')} rows={5}
                    placeholder="Provide a detailed description of this task…"
                    className={inputCls(!!errors.description)} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }} />
            </div>
        </div>

        <div className="flex items-center justify-between pt-5 mt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
            <Button variant="ghost" type="button" onClick={() => navigate(`/tasks/${taskId}`)}>Cancel</Button>
            <Button variant="gradient" type="submit" loading={submitting}>
                {submitting ? 'Saving…' : 'Save Changes'}
            </Button>
        </div>
      </form>
    </PageLayout>
  );
}
