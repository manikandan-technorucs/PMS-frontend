import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { Trash2, ClipboardEdit } from 'lucide-react';
import { tasksService } from '@/features/tasks/services/tasks.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { FormHeader, FormField, FormCard } from '@/shared/components/ui/Form';

const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

export function TaskEdit() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', project_id: null as any, assignee_id: null as any, task_list_id: null as any,
    status_id: null as any, priority_id: null as any, start_date: null as any, end_date: null as any,
    estimated_hours: '', description: '', progress: '0',
  });
  const [taskPublicId, setTaskPublicId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!taskId) return;
        const task = await tasksService.getTask(parseInt(taskId, 10));
        setTaskPublicId(task.public_id);
        setFormData({
          title: task.title || '', project_id: task.project || null, assignee_id: task.assignee || null,
          task_list_id: task.task_list || null, status_id: task.status || null, priority_id: task.priority || null,
          start_date: task.start_date ? new Date(task.start_date) : null, end_date: task.end_date ? new Date(task.end_date) : null,
          estimated_hours: task.estimated_hours?.toString() || '', description: task.description || '', progress: task.progress?.toString() || '0',
        });
      } catch (error) { console.error('Failed to fetch data', error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [taskId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId) return;
    setSubmitting(true);
    try {
      const payload: any = { ...formData };
      ['project_id', 'assignee_id', 'task_list_id', 'status_id', 'priority_id'].forEach(key => { payload[key] = extractId(payload[key]); });
      payload.progress = parseInt(payload.progress, 10);
      ['start_date', 'end_date'].forEach(key => {
        if (payload[key] instanceof Date) payload[key] = payload[key].toISOString().split('T')[0];
        else if (!payload[key]) payload[key] = null;
      });
      payload.estimated_hours = payload.estimated_hours === '' ? null : parseFloat(payload.estimated_hours);
      if (payload.description === '') payload.description = null;
      await tasksService.updateTask(parseInt(taskId, 10), payload);
      navigate(`/tasks/${taskId}`);
    } catch (error: any) {
      console.error('Failed to update task:', error);
      alert(error.response?.data?.detail || 'Failed to update task');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try { if (taskId) { await tasksService.deleteTask(parseInt(taskId, 10)); navigate('/tasks'); } }
      catch (error) { console.error('Failed to delete task:', error); alert('Failed to delete task'); }
    }
  };

  if (loading) return <div className="p-8"><p>Loading task data...</p></div>;

  return (
    <PageLayout
      title={`Edit Task ${taskPublicId}`}
      showBackButton backPath={`/tasks/${taskId}`}
      actions={<Button variant="danger" type="button" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete Task</Button>}
    >
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={ClipboardEdit} title="Edit Task" subtitle={`Editing task ${taskPublicId}`} color="blue" />
        <FormCard columns={3} footer={{ onCancel: () => navigate(`/tasks/${taskId}`), submitLabel: 'Save Changes', submittingLabel: 'Saving...', isSubmitting: submitting }}>
          <FormField label="Task Title" required className="md:col-span-2 lg:col-span-3">
            <Input name="title" value={formData.title} onChange={handleChange} required placeholder="Enter task title" className="h-10" />
          </FormField>
          <FormField label="Project">
            <ServerSearchDropdown entityType="projects" value={formData.project_id} onChange={v => set('project_id', v)} placeholder="Select Project" />
          </FormField>
          <FormField label="Assignee">
            <ServerSearchDropdown entityType="users" value={formData.assignee_id} onChange={v => set('assignee_id', v)} placeholder="Select Assignee" />
          </FormField>
          <FormField label="Task List">
            <ServerSearchDropdown entityType="tasklists" value={formData.task_list_id} onChange={v => set('task_list_id', v)} placeholder="Select Task List" filters={formData.project_id ? { project_id: extractId(formData.project_id) } : {}} disabled={!formData.project_id} />
          </FormField>
          <FormField label="Status">
            <ServerSearchDropdown entityType="masters/statuses" value={formData.status_id} onChange={v => set('status_id', v)} placeholder="Select Status" />
          </FormField>
          <FormField label="Priority">
            <ServerSearchDropdown entityType="masters/priorities" value={formData.priority_id} onChange={v => set('priority_id', v)} placeholder="Select Priority" />
          </FormField>
          <FormField label="Estimated Hours">
            <Input name="estimated_hours" type="number" step="0.1" min="0" value={formData.estimated_hours} onChange={handleChange} placeholder="e.g. 10.5" className="h-10" />
          </FormField>
          <FormField label="Start Date">
            <SharedCalendar value={formData.start_date} onChange={v => set('start_date', v)} />
          </FormField>
          <FormField label="End Date">
            <SharedCalendar value={formData.end_date} onChange={v => set('end_date', v)} />
          </FormField>
          <FormField label="Progress (%)">
            <Input name="progress" type="number" min="0" max="100" value={formData.progress} onChange={handleChange} className="h-10" />
          </FormField>
          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Enter task description" />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
