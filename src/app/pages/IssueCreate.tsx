import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { ArrowLeft } from 'lucide-react';

export function IssueCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    assignee: '',
    status: 'Open',
    severity: 'Medium',
    description: '',
    stepsToReproduce: '',
    environment: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/issues');
  };

  return (
    <PageLayout 
      title="Report New Issue"
      actions={
        <Button variant="outline" onClick={() => navigate('/issues')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Issues
        </Button>
      }
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <Input
                label="Issue Title"
                placeholder="Brief description of the issue"
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
            />

            <Select
              label="Status"
              options={[
                { value: 'Open', label: 'Open' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Closed', label: 'Closed' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />

            <Select
              label="Severity"
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' },
              ]}
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            />

            <div className="col-span-2">
              <Textarea
                label="Description"
                placeholder="Detailed description of the issue"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="col-span-2">
              <Textarea
                label="Steps to Reproduce"
                placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
                value={formData.stepsToReproduce}
                onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                rows={4}
              />
            </div>

            <div className="col-span-2">
              <Input
                label="Environment"
                placeholder="e.g., Production - Web v2.0"
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button type="button" variant="outline" onClick={() => navigate('/issues')}>
              Cancel
            </Button>
            <Button type="submit">
              Create Issue
            </Button>
          </div>
        </form>
      </Card>
    </PageLayout>
  );
}
