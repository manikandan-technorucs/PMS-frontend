import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { ArrowLeft } from 'lucide-react';

export function TaskCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    assignee: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '',
    estimatedHours: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    navigate('/tasks');
  };

  return (
    <PageLayout 
      title="Create New Task"
      actions={
        <Button variant="outline" onClick={() => navigate('/tasks')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tasks
        </Button>
      }
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
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
                { value: '', label: 'Select a project' },
                { value: 'PRJ-001', label: 'Enterprise Portal Redesign' },
                { value: 'PRJ-002', label: 'Mobile App Development' },
                { value: 'PRJ-003', label: 'API Integration Platform' },
              ]}
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              required
            />

            <Select
              label="Assignee"
              options={[
                { value: '', label: 'Select assignee' },
                { value: 'user1', label: 'Sarah Johnson' },
                { value: 'user2', label: 'Michael Chen' },
                { value: 'user3', label: 'Emily Rodriguez' },
              ]}
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              required
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
              required
            />

            <Input
              label="Estimated Hours"
              type="number"
              placeholder="Enter estimated hours"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
            />

            <div className="col-span-2">
              <Textarea
                label="Description"
                placeholder="Enter task description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button type="button" variant="outline" onClick={() => navigate('/tasks')}>
              Cancel
            </Button>
            <Button type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </Card>
    </PageLayout>
  );
}
