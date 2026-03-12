import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { ArrowLeft, Trash2 } from 'lucide-react';

import { tasksService } from '@/features/tasks/services/tasks.api';
import { tasklistsService, TaskList } from '@/features/tasklists/services/tasklists.api';
import { MasterResponse } from '@/shared/services/masters.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';

const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

export function TaskEdit() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    project_id: null as any,
    assignee_id: null as any,
    task_list_id: null as any,
    status_id: null as any,
    priority_id: null as any,
    start_date: null as any,
    end_date: null as any,
    estimated_hours: '',
    description: '',
    progress: '0',
  });

  const [taskPublicId, setTaskPublicId] = useState('');

  const [taskLists, setTaskLists] = useState<TaskList[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!taskId) return;

        const task = await tasksService.getTask(parseInt(taskId, 10));

        setTaskPublicId(task.public_id);
        setFormData({
          title: task.title || '',
          project_id: task.project || null,
          assignee_id: task.assignee || null,
          task_list_id: task.task_list || null,
          status_id: task.status || null,
          priority_id: task.priority || null,
          start_date: task.start_date ? new Date(task.start_date) : null,
          end_date: task.end_date ? new Date(task.end_date) : null,
          estimated_hours: task.estimated_hours?.toString() || '',
          description: task.description || '',
          progress: task.progress?.toString() || '0'
        });
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [taskId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId) return;

    try {
      const payload: any = { ...formData };

      // Convert relations to integers
      ['project_id', 'assignee_id', 'task_list_id', 'status_id', 'priority_id'].forEach(key => {
          payload[key] = extractId(payload[key]);
      });

      payload.progress = parseInt(payload.progress, 10);

      ['start_date', 'end_date'].forEach(key => {
        if (payload[key] instanceof Date) {
            payload[key] = payload[key].toISOString().split('T')[0];
        } else if (!payload[key]) {
            payload[key] = null;
        }
      });

      // Convert estimated hours
      if (payload.estimated_hours === '') {
        payload.estimated_hours = null;
      } else {
        payload.estimated_hours = parseFloat(payload.estimated_hours);
      }

      // Clear empty strings
      if (payload.description === '') payload.description = null;

      await tasksService.updateTask(parseInt(taskId, 10), payload);
      navigate(`/tasks/${taskId}`);
    } catch (error: any) {
      console.error('Failed to update task:', error);
      alert(error.response?.data?.detail || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        if (taskId) {
          await tasksService.deleteTask(parseInt(taskId, 10));
          navigate('/tasks');
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task');
      }
    }
  };

  if (loading) return <div className="p-8"><p>Loading task data...</p></div>;

  return (
    <PageLayout
      title={`Edit Task ${taskPublicId}`}
      showBackButton
      backPath={`/tasks/${taskId}`}
      actions={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="danger" type="button" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Task
          </Button>
        </div>
      }
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Task Title <span className="text-[#DC2626]">*</span>
              </label>
              <Input
                name="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Project
              </label>
              <ServerSearchDropdown 
                entityType="projects" 
                value={formData.project_id} 
                onChange={v => setFormData({...formData, project_id: v})} 
                placeholder="Select Project" 
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Assignee
              </label>
              <ServerSearchDropdown 
                entityType="users" 
                value={formData.assignee_id} 
                onChange={v => setFormData({...formData, assignee_id: v})} 
                placeholder="Select Assignee" 
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Task List
              </label>
              <ServerSearchDropdown 
                entityType="tasklists" 
                value={formData.task_list_id} 
                onChange={v => setFormData({...formData, task_list_id: v})} 
                placeholder="Select Task List" 
                filters={formData.project_id ? { project_id: extractId(formData.project_id) } : {}}
                disabled={!formData.project_id}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Start Date
              </label>
              <SharedCalendar 
                value={formData.start_date} 
                onChange={v => setFormData({...formData, start_date: v})} 
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                End Date
              </label>
              <SharedCalendar 
                value={formData.end_date} 
                onChange={v => setFormData({...formData, end_date: v})} 
              />
            </div>



            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Estimated Hours
              </label>
              <Input
                name="estimated_hours"
                type="number"
                step="0.1"
                min="0"
                value={formData.estimated_hours}
                onChange={handleChange}
                placeholder="e.g. 10.5"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Status
              </label>
              <ServerSearchDropdown 
                entityType="masters/statuses" 
                value={formData.status_id} 
                onChange={v => setFormData({...formData, status_id: v})} 
                placeholder="Select Status" 
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Priority
              </label>
              <ServerSearchDropdown 
                entityType="masters/priorities" 
                value={formData.priority_id} 
                onChange={v => setFormData({...formData, priority_id: v})} 
                placeholder="Select Priority" 
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Progress (%)
              </label>
              <Input
                name="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Description
              </label>
              <Textarea
                name="description"
                placeholder="Enter task description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button type="button" variant="outline" onClick={() => navigate(`/tasks/${taskId}`)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </PageLayout>
  );
}
