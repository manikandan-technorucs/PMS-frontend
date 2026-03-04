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
import { projectsService } from '@/features/projects/services/projects.api';
import { tasklistsService, TaskList } from '@/features/tasklists/services/tasklists.api';
import { usersService } from '@/features/users/services/users.api';
import { mastersService, MasterResponse } from '@/shared/services/masters.api';

export function TaskEdit() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    project_id: '',
    assignee_id: '',
    task_list_id: '',
    status_id: '',
    priority_id: '',
    due_date: '',
    start_date: '',
    end_date: '',
    estimated_hours: '',
    description: '',
    progress: '0',
  });

  const [taskPublicId, setTaskPublicId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [statuses, setStatuses] = useState<MasterResponse[]>([]);
  const [priorities, setPriorities] = useState<MasterResponse[]>([]);

  useEffect(() => {
    if (formData.project_id) {
      tasklistsService.getTaskLists(parseInt(formData.project_id)).then(setTaskLists);
    } else {
      setTaskLists([]);
    }
  }, [formData.project_id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!taskId) return;

        const [u, p, s, pr, task] = await Promise.all([
          usersService.getUsers(0, 100),
          projectsService.getProjects(0, 100),
          mastersService.getStatuses(),
          mastersService.getPriorities(),
          tasksService.getTask(parseInt(taskId, 10))
        ]);
        setUsers(u);
        setProjects(p);
        setStatuses(s);
        setPriorities(pr);

        setTaskPublicId(task.public_id);
        setFormData({
          title: task.title || '',
          project_id: task.project_id?.toString() || '',
          assignee_id: task.assignee_id?.toString() || '',
          task_list_id: task.task_list_id?.toString() || '',
          status_id: task.status_id?.toString() || '',
          priority_id: task.priority_id?.toString() || '',
          due_date: task.due_date || '',
          start_date: task.start_date || '',
          end_date: task.end_date || '',
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
        if (payload[key] === '') {
          payload[key] = null;
        } else {
          payload[key] = parseInt(payload[key], 10);
        }
      });

      payload.progress = parseInt(payload.progress, 10);

      // Convert dates to null if empty
      ['due_date', 'start_date', 'end_date'].forEach(key => {
        if (!payload[key]) payload[key] = null;
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
      actions={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="danger" type="button" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Task
          </Button>
          <Button variant="outline" onClick={() => navigate(`/tasks/${taskId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Task
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
              <Select name="project_id" value={formData.project_id} onChange={handleChange}>
                <option value="">Select a project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Assignee
              </label>
              <Select name="assignee_id" value={formData.assignee_id} onChange={handleChange}>
                <option value="">Select assignee</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Task List
              </label>
              <Select name="task_list_id" value={formData.task_list_id} onChange={handleChange} disabled={!formData.project_id}>
                <option value="">Select a task list</option>
                {taskLists.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Start Date
              </label>
              <Input
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                End Date
              </label>
              <Input
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Due Date
              </label>
              <Input
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
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
              <Select name="status_id" value={formData.status_id} onChange={handleChange}>
                <option value="">Select status</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Priority
              </label>
              <Select name="priority_id" value={formData.priority_id} onChange={handleChange}>
                <option value="">Select priority</option>
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
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
