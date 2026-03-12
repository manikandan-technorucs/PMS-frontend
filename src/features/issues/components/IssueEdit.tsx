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
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';

export function IssueEdit() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [issuePublicId, setIssuePublicId] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    project_id: null as any,
    reporter_id: null as any,
    assignee_id: null as any,
    status_id: null as any,
    priority_id: null as any,
    start_date: null as any,
    end_date: null as any,
    estimated_hours: '',
    description: '',
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!issueId) return;

        const issue = await issuesService.getIssue(parseInt(issueId, 10));

        setIssuePublicId(issue.public_id);
        setFormData({
          title: issue.title || '',
          project_id: issue.project || null,
          reporter_id: issue.reporter || null,
          assignee_id: issue.assignee || null,
          status_id: issue.status || null,
          priority_id: issue.priority || null,
          start_date: issue.start_date ? new Date(issue.start_date) : null,
          end_date: issue.end_date ? new Date(issue.end_date) : null,
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

      const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

      // Convert relations to integers
      ['project_id', 'reporter_id', 'assignee_id', 'status_id', 'priority_id'].forEach(key => {
          payload[key] = extractId(payload[key]);
      });

      // Clear empty strings
      if (payload.description === '') payload.description = null;

      // Convert dates to null if empty
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
      showBackButton
      backPath={`/issues/${issueId}`}
      actions={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="danger" type="button" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Issue
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
              <ServerSearchDropdown 
                entityType="projects" 
                value={formData.project_id} 
                onChange={v => setFormData({...formData, project_id: v})} 
                placeholder="Select Project" 
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Reporter
              </label>
              <ServerSearchDropdown 
                entityType="users" 
                value={formData.reporter_id} 
                onChange={v => setFormData({...formData, reporter_id: v})} 
                placeholder="Select Reporter" 
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
                Severity / Priority
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
