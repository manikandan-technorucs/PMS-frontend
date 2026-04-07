import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/providers/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { TextInput } from '@/components/forms/TextInput';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { Trash2, ClipboardEdit } from 'lucide-react';
import { tasksService } from '@/features/tasks/api/tasks.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { GraphUserMultiSelect } from '@/features/projects/components/ui/GraphUserMultiSelect';
import SharedCalendar from '@/components/core/SharedCalendar';
import { FilteredStatusSelect } from '@/components/core/FilteredStatusSelect';
import { FormHeader, FormField, FormCard } from '@/components/forms/Form';

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
  start_date: z.date().optional().nullable(),
  end_date: z.date().optional().nullable(),
  description: z.string().optional().nullable()
});

type TaskFormData = z.infer<typeof taskSchema>;

export function TaskEditView() {
  const { showToast } = useToast();
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [taskPublicId, setTaskPublicId] = useState('');

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      assignees: [],
      owners: [],
      progress: 0
    }
  });

  const watchProjectId = watch('project_id');
  const watchTitle = watch('title');

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);
  const extractEmail = (val: any) => (val && typeof val === 'object' ? val.email : val);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!taskId) return;
        const task: any = await tasksService.getTask(parseInt(taskId, 10));
        setTaskPublicId(task.public_id || `TSK-${task.id}`);
        
        reset({
          title: task.title || '',
          description: task.description || '',
          project_id: task.project || null,
          task_list_id: task.task_list || null,
          status_id: task.status || null,
          priority_id: task.priority || null,
          assignees: task.assignees || [],
          owners: task.owners || [],
          start_date: task.start_date ? new Date(task.start_date) : null,
          end_date: task.end_date ? new Date(task.end_date) : null,
          estimated_hours: task.estimated_hours?.toString() || '',
          actual_hours: task.actual_hours?.toString() || '',
          progress: task.progress?.toString() || '0'
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

  if (loading) return <PageSpinner fullPage label="Loading task data" />;

  return (
    <PageLayout
      title={`Edit Task ${taskPublicId}`}
      showBackButton backPath={`/tasks/${taskId}`}
      actions={<Button variant="danger" type="button" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete Task</Button>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[1200px] mx-auto">
        <FormHeader icon={ClipboardEdit} title="Edit Task" subtitle={`Editing task ${taskPublicId}`} color="blue" />
        
        <FormCard 
          columns={3} 
          footer={{ 
            onCancel: () => navigate(`/tasks/${taskId}`), 
            submitLabel: 'Save Changes', 
            submittingLabel: 'Saving...', 
            isSubmitting: submitting,
            isDisabled: !watchTitle?.trim()
          }}
        >
          <FormField label="Task Title" required error={errors.title?.message} className="md:col-span-2 lg:col-span-3">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextInput {...field} required placeholder="Enter task title" className="h-10 w-full" />
              )}
            />
          </FormField>

          <FormField label="Project" error={errors.project_id?.message}>
            <Controller
              name="project_id"
              control={control}
              render={({ field }) => (
                <ServerSearchDropdown 
                  entityType="projects" 
                  value={field.value} 
                  onChange={(v) => { field.onChange(v); setValue('task_list_id', null); }} 
                  placeholder="Select Project" 
                />
              )}
            />
          </FormField>

          <FormField label="Assignees (Graph Search)" error={errors.assignees?.message}>
            <Controller
              name="assignees"
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

          <FormField label="Owners (Graph Search)" error={errors.owners?.message}>
            <Controller
              name="owners"
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

          <FormField label="Task List" error={errors.task_list_id?.message}>
            <div className="flex gap-2 w-full">
              <div className="flex-1">
                <Controller
                  name="task_list_id"
                  control={control}
                  render={({ field }) => (
                    <ServerSearchDropdown 
                      entityType="tasklists" 
                      value={field.value} 
                      onChange={field.onChange} 
                      placeholder="Select Task List" 
                      filters={watchProjectId ? { project_id: extractId(watchProjectId) } : {}} 
                      disabled={!watchProjectId} 
                    />
                  )}
                />
              </div>
            </div>
          </FormField>

          <FormField label="Status" error={errors.status_id?.message}>
            <Controller
              name="status_id"
              control={control}
              render={({ field }) => (
                <FilteredStatusSelect module="tasks" value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          <FormField label="Priority" error={errors.priority_id?.message}>
            <Controller
              name="priority_id"
              control={control}
              render={({ field }) => (
                <ServerSearchDropdown entityType="masters/priorities" value={field.value} onChange={field.onChange} placeholder="Select Priority" />
              )}
            />
          </FormField>

          <FormField label="Estimated Hours" error={errors.estimated_hours?.message}>
            <Controller
              name="estimated_hours"
              control={control}
              render={({ field }) => (
                 <TextInput {...field} type="number" step="0.1" min="0" placeholder="e.g. 10.5" className="h-10 w-full" />
              )}
            />
          </FormField>

          <FormField label="Actual Hours" error={errors.actual_hours?.message}>
            <Controller
               name="actual_hours"
               control={control}
               render={({ field }) => (
                 <TextInput {...field} type="number" step="0.5" min="0" placeholder="e.g. 8.5" className="h-10 w-full" />
               )}
            />
          </FormField>

          <FormField label="Start Date" error={errors.start_date?.message}>
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <SharedCalendar value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          <FormField label="End Date" error={errors.end_date?.message}>
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <SharedCalendar value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          <FormField label="Progress (%)" error={errors.progress?.message}>
            <Controller
              name="progress"
              control={control}
              render={({ field }) => (
                <TextInput {...field} type="number" min="0" max="100" className="h-10 w-full" />
              )}
            />
          </FormField>

          <FormField label="Description" className="md:col-span-2 lg:col-span-3" error={errors.description?.message}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextAreaInput {...field} rows={3} placeholder="Enter task description" />
              )}
            />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
