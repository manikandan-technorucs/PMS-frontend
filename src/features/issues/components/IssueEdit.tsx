import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { ArrowLeft, Trash2 } from 'lucide-react';

import { issuesService } from '@/features/issues/services/issues.api';
import { projectsService } from '@/features/projects/services/projects.api';
import { usersService } from '@/features/users/services/users.api';
import { mastersService, MasterResponse } from '@/shared/services/masters.api';

export function IssueEdit() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [issuePublicId, setIssuePublicId] = useState('');

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
        if (!issueId) return;

        const [u, p, s, pr, issue] = await Promise.all([
          usersService.getUsers(0, 100),
          projectsService.getProjects(0, 100),
          mastersService.getStatuses(),
          mastersService.getPriorities(),
          issuesService.getIssue(parseInt(issueId, 10))
        ]);
        setUsers(u);
        setProjects(p);
        setStatuses(s);
        setPriorities(pr);

        setIssuePublicId(issue.public_id);
        setFormData({
          title: issue.title || '',
          project_id: issue.project_id?.toString() || '',
          reporter_id: issue.reporter_id?.toString() || '',
          assignee_id: issue.assignee_id?.toString() || '',
          status_id: issue.status_id?.toString() || '',
          priority_id: issue.priority_id?.toString() || '',
          start_date: issue.start_date || '',
          end_date: issue.end_date || '',
          estimated_hours: issue.estimated_hours?.toString() || '',
          description: issue.description || '',
        });
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [issueId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueId) return;

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

      await issuesService.updateIssue(parseInt(issueId, 10), payload);
      navigate(`/issues/${issueId}`);
    } catch (error: any) {
      console.error('Failed to update issue:', error);
      alert(error.response?.data?.detail || 'Failed to update issue');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        if (issueId) {
          await issuesService.deleteIssue(parseInt(issueId, 10));
          navigate('/issues');
        }
      } catch (error) {
        console.error('Failed to delete issue:', error);
        alert('Failed to delete issue');
      }
    }
  };

  if (loading) return <div className="p-8"><p>Loading issue data...</p></div>;

  return (
    <PageLayout
      title={`Edit Issue ${issuePublicId}`}
      actions={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="danger" type="button" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Issue
          </Button>
          <Button variant="outline" onClick={() => navigate(`/issues/${issueId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Issue
          </Button>
        </div>
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
            <Button type="button" variant="outline" onClick={() => navigate(`/issues/${issueId}`)}>
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
