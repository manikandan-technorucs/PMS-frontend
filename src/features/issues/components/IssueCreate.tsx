import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { ArrowLeft } from 'lucide-react';

import { issuesService } from '@/features/issues/services/issues.api';
import { projectsService } from '@/features/projects/services/projects.api';
import { usersService } from '@/features/users/services/users.api';
import { mastersService, MasterResponse } from '@/shared/services/masters.api';

export function IssueCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    project_id: '',
    reporter_id: '',
    assignee_id: '',
    status_id: '',
    priority_id: '',
    start_date: '',
    end_date: '',
    estimated_hours: '',
    description: '',
  });

  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<MasterResponse[]>([]);
  const [priorities, setPriorities] = useState<MasterResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, p, s, pr] = await Promise.all([
          usersService.getUsers(0, 100),
          projectsService.getProjects(0, 100),
          mastersService.getStatuses(),
          mastersService.getPriorities()
        ]);
        setUsers(u);
        setProjects(p);
        setStatuses(s);
        setPriorities(pr);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };

      // Convert relations to integers
      ['project_id', 'reporter_id', 'assignee_id', 'status_id', 'priority_id'].forEach(key => {
        if (payload[key] === '') {
          payload[key] = null;
        } else {
          payload[key] = parseInt(payload[key], 10);
        }
      });

      // Clear empty strings
      if (payload.description === '') payload.description = null;

      // Convert dates to null if empty
      ['start_date', 'end_date'].forEach(key => {
        if (!payload[key]) payload[key] = null;
      });

      // Convert estimated hours
      if (payload.estimated_hours === '') {
        payload.estimated_hours = null;
      } else {
        payload.estimated_hours = parseFloat(payload.estimated_hours);
      }

      await issuesService.createIssue(payload);
      navigate('/issues');
    } catch (error: any) {
      console.error('Failed to create issue:', error);
      alert(error.response?.data?.detail || 'Failed to create issue');
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Issue Title <span className="text-[#DC2626]">*</span>
              </label>
              <Input
                name="title"
                placeholder="Brief description of the issue"
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
                Reporter
              </label>
              <Select name="reporter_id" value={formData.reporter_id} onChange={handleChange}>
                <option value="">Select reporter</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
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
                Severity / Priority
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

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Description
              </label>
              <Textarea
                name="description"
                placeholder="Detailed description of the issue"
                value={formData.description}
                onChange={handleChange}
                rows={6}
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
