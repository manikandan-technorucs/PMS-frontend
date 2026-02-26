import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { ArrowLeft } from 'lucide-react';

export function TaskEdit() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: 'Design homepage mockup',
    project: 'PRJ-001',
    assignee: 'user3',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-02-25',
    estimatedHours: '24',
    description: 'Create comprehensive mockups for the new homepage including desktop, tablet, and mobile views.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/tasks/${taskId}`);
  };

  return (
    <PageLayout 
      title={`Edit Task ${taskId}`}
      actions={
        <Button variant="outline" onClick={() => navigate(`/tasks/${taskId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Task
        </Button>
      }
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <Input
                label="Task Title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <Select
              label="Project"
              options={[
                { value: 'PRJ-001', label: 'Enterprise Portal Redesign' },
                { value: 'PRJ-002', label: 'Mobile App Development' },
                { value: 'PRJ-003', label: 'API Integration Platform' },
              ]}
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            />

            <Select
              label="Assignee"
              options={[
                { value: 'user1', label: 'Sarah Johnson' },
                { value: 'user2', label: 'Michael Chen' },
                { value: 'user3', label: 'Emily Rodriguez' },
              ]}
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            />

            <Select
              label="Status"
              options={[
                { value: 'Pending', label: 'Pending' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Blocked', label: 'Blocked' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />

            <Select
              label="Priority"
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' },
              ]}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            />

            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />

            <Input
              label="Estimated Hours"
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
            />

            <div className="col-span-2">
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
