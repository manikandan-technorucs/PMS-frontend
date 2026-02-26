import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { ArrowLeft, Edit } from 'lucide-react';

export function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const task = {
    id: taskId,
    title: 'Design homepage mockup',
    project: 'Enterprise Portal Redesign',
    assignee: 'Emily Rodriguez',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-02-25',
    progress: 70,
    description: 'Create comprehensive mockups for the new homepage including desktop, tablet, and mobile views. Focus on modern design principles and accessibility.',
    createdBy: 'Sarah Johnson',
    createdDate: '2026-02-10',
    estimatedHours: 24,
    loggedHours: 16,
  };

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
                <p className="text-[14px] text-[#1F2937]">{task.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Project</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{task.project}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Task ID</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{task.id}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Created By</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{task.createdBy}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Created Date</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{task.createdDate}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Time Tracking">
            <div className="space-y-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <span className="text-[14px] text-[#6B7280]">Time Progress</span>
                  <span className="text-[14px] font-medium text-[#1F2937]">{task.loggedHours}h / {task.estimatedHours}h</span>
                </div>
                <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#059669] rounded-full" 
                    style={{ width: `${(task.loggedHours / task.estimatedHours) * 100}%` }} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Estimated Hours</p>
                  <p className="text-[20px] font-semibold text-[#1F2937]">{task.estimatedHours}h</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Logged Hours</p>
                  <p className="text-[20px] font-semibold text-[#1F2937]">{task.loggedHours}h</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-1">Remaining Hours</p>
                  <p className="text-[20px] font-semibold text-[#1F2937]">{task.estimatedHours - task.loggedHours}h</p>
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
                  <div className="w-8 h-8 bg-[#059669] rounded-full flex items-center justify-center">
                    <span className="text-white text-[12px] font-medium">{task.assignee[0]}</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#1F2937]">{task.assignee}</span>
                </div>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Status</p>
                <StatusBadge status={task.status} variant="status" />
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Priority</p>
                <StatusBadge status={task.priority} variant="priority" />
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Due Date</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{task.dueDate}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-2">Progress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#059669] rounded-full" style={{ width: `${task.progress}%` }} />
                  </div>
                  <span className="text-[14px] font-medium text-[#1F2937]">{task.progress}%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
