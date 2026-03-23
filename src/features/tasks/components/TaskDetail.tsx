import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { ArrowLeft, Edit, Clock } from 'lucide-react';
import { tasksService, Task } from '@/features/tasks/services/tasks.api';
import { timelogsService, TimeLog } from '@/features/timelogs/services/timelogs.api';

export function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [actualHours, setActualHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const parsedId = parseInt(taskId as string, 10);
      const [data, logs] = await Promise.all([
        tasksService.getTask(parsedId),
        timelogsService.getTimelogs(0, 2000)
      ]);
      setTask(data);

      const taskLogs = logs.filter(l => l.task_id === parsedId);
      setActualHours(taskLogs.reduce((sum, l) => sum + l.hours, 0));
    } catch (error) {
      console.error('Failed to fetch task detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8"><p>Loading task details...</p></div>;
  if (!task) return <div className="p-8"><p>Task not found.</p></div>;

  return (
    <PageLayout
      title={task.title}
      actions={
        <>
          <Button variant="outline" onClick={() => navigate('/tasks')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </Button>
          <Button onClick={() => navigate(`/tasks/${taskId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Task
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card title="Task Details">
            <div className="space-y-4">
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Description</p>
                <p className="text-[14px] text-[#1F2937]">{task.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Project</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{task.project?.name || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Task ID</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{task.public_id}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Task Information">
            <div className="space-y-4">
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Assignee</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-[#14b8a6] rounded-full flex items-center justify-center">
                    <span className="text-white text-[12px] font-medium">{task.assignee ? task.assignee.first_name[0] : '?'}</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#1F2937]">
                    {task.assignee ? `${task.assignee.first_name} ${task.assignee.last_name}` : 'Unassigned'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Status</p>
                <StatusBadge status={task.status?.name || 'Unknown'} variant="status" />
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Priority</p>
                <StatusBadge status={task.priority?.name || 'Unknown'} variant="priority" />
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Due Date</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{task.due_date || 'None'}</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#EEF2FF] rounded-[6px]">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#4F46E5] shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-0.5">Time Logged</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[16px] font-semibold text-[#1F2937]">{actualHours.toFixed(1)}h</span>
                    <span className="text-[12px] text-[#6B7280]">/ {task.estimated_hours || 0}h effort</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-2">Progress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#14b8a6] rounded-full" style={{ width: `${task.progress || 0}%` }} />
                  </div>
                  <span className="text-[14px] font-medium text-[#1F2937]">{task.progress || 0}%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
