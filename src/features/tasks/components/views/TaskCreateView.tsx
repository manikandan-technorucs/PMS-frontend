import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/providers/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useTaskActions } from '@/features/tasks/hooks/useTaskActions';
import { useTaskListActions } from '@/features/tasklists/hooks/useTaskListActions';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { FilteredStatusSelect } from '@/components/core/FilteredStatusSelect';
import { GraphUserMultiSelect } from '@/features/projects/components/ui/GraphUserMultiSelect';
import SharedCalendar from '@/components/core/SharedCalendar';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { TextInput } from '@/components/forms/TextInput';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { FormHeader, FormField, FormCard } from '@/components/forms/Form';
import { ClipboardList, Plus } from 'lucide-react';
import { Dropdown } from 'primereact/dropdown';

const BILLING_TYPES = ['Billable', 'Non-Billable', 'Internal'];

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
  billing_type: z.string().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  description: z.string().optional()
});

type TaskFormData = z.infer<typeof taskSchema>;

export function TaskCreateView() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { createTask } = useTaskActions();
  const { createTaskList: addTaskList } = useTaskListActions();
  
  const [newTaskListName, setNewTaskListName] = useState('');
  const [showTaskListInput, setShowTaskListInput] = useState(false);
  const [creatingTaskList, setCreatingTaskList] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      billing_type: 'Billable',
      assignees: [],
      owners: [],
      start_date: new Date()
    }
  });

  const watchProjectId = watch('project_id');
  const watchTitle = watch('title');

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

  const handleCreateTaskList = async () => {
    if (!newTaskListName.trim() || !watchProjectId) return;
    setCreatingTaskList(true);
    try {
      const result = await addTaskList.mutateAsync({
        name: newTaskListName.trim(),
        project_id: extractId(watchProjectId),
      });
      setValue('task_list_id', result.id);
      setNewTaskListName('');
      setShowTaskListInput(false);
    } catch (err) {
      console.error('Failed to create task list:', err);
    } finally {
      setCreatingTaskList(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        project_id: extractId(data.project_id),
        task_list_id: extractId(data.task_list_id),
        status_id: extractId(data.status_id),
        priority_id: extractId(data.priority_id),
        owner_emails: data.owners.map((o: any) => o.mail || o.email || null).filter(Boolean),
        assignee_emails: data.assignees.map((a: any) => a.mail || a.email || null).filter(Boolean),
        estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours as string) : null,
        actual_hours: data.actual_hours ? parseFloat(data.actual_hours as string) : null,
        start_date: data.start_date?.toISOString().split('T')[0],
        end_date: data.end_date ? data.end_date.toISOString().split('T')[0] : null,
        billing_type: data.billing_type,
        progress: 0,
      };
      
      await createTask.mutateAsync(payload);
      showToast('success', 'Task Created', 'The task has been created successfully.');
      navigate('/tasks');
    } catch (err: any) {
      console.error('Failed to create task:', err);
      showToast('error', 'Creation Failed', err?.response?.data?.detail || 'An error occurred while creating the task.');
    }
  };

  return (
    <PageLayout title="Create New Task" showBackButton backPath="/tasks">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[1200px] mx-auto">
        <FormHeader icon={ClipboardList} title="Task Details" subtitle="Fill in the details below to create a new task" color="blue" />

        <FormCard
          columns={3}
          footer={{ 
            onCancel: () => navigate('/tasks'), 
            submitLabel: 'Create Task', 
            submittingLabel: 'Creating...', 
            isSubmitting: createTask.isPending, 
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

          <FormField label="Task List" error={errors.task_list_id?.message}>
            {showTaskListInput ? (
              <div className="flex gap-2 w-full">
                <TextInput
                  value={newTaskListName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskListName(e.target.value)}
                  placeholder="New task list name..."
                  className="h-10 flex-1"
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTaskList(); } }}
                  autoFocus
                />
                <button type="button" onClick={handleCreateTaskList} disabled={creatingTaskList || !newTaskListName.trim()}
                  className="px-3 py-1.5 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50">
                  {creatingTaskList ? '...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowTaskListInput(false)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            ) : (
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
                        disabled={!watchProjectId}
                        filters={watchProjectId ? { project_id: extractId(watchProjectId) } : {}}
                      />
                    )}
                  />
                </div>
                <button
                  type="button"
                  disabled={!watchProjectId}
                  onClick={() => setShowTaskListInput(true)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-teal-500 text-teal-600 rounded text-xs hover:bg-teal-50 disabled:opacity-40"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
            )}
          </FormField>

          <FormField label="Owners (Graph Search)" className="lg:col-span-1" error={errors.owners?.message}>
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
                <TextInput {...field} type="number" placeholder="e.g. 10" className="h-10 w-full" />
              )}
            />
          </FormField>

          <FormField label="Actual Hours" error={errors.actual_hours?.message}>
            <Controller
              name="actual_hours"
              control={control}
              render={({ field }) => (
                <TextInput {...field} type="number" step="0.5" min="0" placeholder="e.g. 10.5" className="h-10 w-full" />
              )}
            />
          </FormField>

          <FormField label="Billing Type" error={errors.billing_type?.message}>
            <Controller
              name="billing_type"
              control={control}
              render={({ field }) => (
                <Dropdown 
                  value={field.value} 
                  options={BILLING_TYPES} 
                  onChange={(e) => field.onChange(e.value)} 
                  className="w-full h-10 flex items-center"
                  pt={{ root: { className: 'w-full h-10 border border-slate-200 rounded-lg' } }}
                />
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

          <FormField label="Description" className="md:col-span-2 lg:col-span-3" error={errors.description?.message}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextAreaInput {...field} rows={3} placeholder="Detailed description of the task" />
              )}
            />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
