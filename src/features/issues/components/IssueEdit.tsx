import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { Trash2, AlertTriangle } from 'lucide-react';
import { issuesService } from '@/features/issues/services/issues.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { FormHeader, FormField, FormCard } from '@/shared/components/ui/Form';

export function IssueEdit() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [issuePublicId, setIssuePublicId] = useState('');

  const [formData, setFormData] = useState({
    title: '', project_id: null as any, reporter_id: null as any, assignee_id: null as any,
    status_id: null as any, priority_id: null as any, start_date: null as any, end_date: null as any,
    estimated_hours: '', description: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!issueId) return;
        const issue = await issuesService.getIssue(parseInt(issueId, 10));
        setIssuePublicId(issue.public_id);
        setFormData({
          title: issue.title || '', project_id: issue.project || null, reporter_id: issue.reporter || null,
          assignee_id: issue.assignee || null, status_id: issue.status || null, priority_id: issue.priority || null,
          start_date: issue.start_date ? new Date(issue.start_date) : null, end_date: issue.end_date ? new Date(issue.end_date) : null,
          estimated_hours: issue.estimated_hours?.toString() || '', description: issue.description || '',
        });
      } catch (error) { console.error('Failed to fetch data', error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [issueId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));
  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueId) return;
    setSubmitting(true);
    try {
      const payload: any = { ...formData };
      ['project_id', 'reporter_id', 'assignee_id', 'status_id', 'priority_id'].forEach(key => { payload[key] = extractId(payload[key]); });
      if (payload.description === '') payload.description = null;
      ['start_date', 'end_date'].forEach(key => {
        if (payload[key] instanceof Date) payload[key] = payload[key].toISOString().split('T')[0];
        else if (!payload[key]) payload[key] = null;
      });
      payload.estimated_hours = payload.estimated_hours === '' ? null : parseFloat(payload.estimated_hours);
      await issuesService.updateIssue(parseInt(issueId, 10), payload);
      navigate(`/issues/${issueId}`);
    } catch (error: any) {
      console.error('Failed to update issue:', error);
      alert(error.response?.data?.detail || 'Failed to update issue');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try { if (issueId) { await issuesService.deleteIssue(parseInt(issueId, 10)); navigate('/issues'); } }
      catch (error) { console.error('Failed to delete issue:', error); alert('Failed to delete issue'); }
    }
  };

  if (loading) return <div className="p-8"><p>Loading issue data...</p></div>;

  return (
    <PageLayout
      title={`Edit Issue ${issuePublicId}`}
      showBackButton backPath={`/issues/${issueId}`}
      actions={<Button variant="danger" type="button" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete Issue</Button>}
    >
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={AlertTriangle} title="Edit Issue" subtitle={`Editing issue ${issuePublicId}`} color="rose" />
        <FormCard columns={3} footer={{ onCancel: () => navigate(`/issues/${issueId}`), submitLabel: 'Save Changes', submittingLabel: 'Saving...', isSubmitting: submitting }}>
          <FormField label="Issue Title" required className="md:col-span-2 lg:col-span-3">
            <Input name="title" value={formData.title} onChange={handleChange} required placeholder="Brief description of the issue" className="h-10" />
          </FormField>
          <FormField label="Project">
            <ServerSearchDropdown entityType="projects" value={formData.project_id} onChange={v => set('project_id', v)} placeholder="Select Project" />
          </FormField>
          <FormField label="Reporter">
            <ServerSearchDropdown entityType="users" value={formData.reporter_id} onChange={v => set('reporter_id', v)} placeholder="Select Reporter" />
          </FormField>
          <FormField label="Assignee">
            <ServerSearchDropdown entityType="users" value={formData.assignee_id} onChange={v => set('assignee_id', v)} placeholder="Select Assignee" />
          </FormField>
          <FormField label="Status">
            <ServerSearchDropdown entityType="masters/statuses" value={formData.status_id} onChange={v => set('status_id', v)} placeholder="Select Status" />
          </FormField>
          <FormField label="Severity / Priority">
            <ServerSearchDropdown entityType="masters/priorities" value={formData.priority_id} onChange={v => set('priority_id', v)} placeholder="Select Priority" />
          </FormField>
          <FormField label="Estimated Hours">
            <Input name="estimated_hours" type="number" step="0.1" min="0" value={formData.estimated_hours} onChange={handleChange} placeholder="e.g. 10.5" className="h-10" />
          </FormField>
          <FormField label="Start Date">
            <SharedCalendar value={formData.start_date} onChange={v => set('start_date', v)} />
          </FormField>
          <FormField label="End Date">
            <SharedCalendar value={formData.end_date} onChange={v => set('end_date', v)} />
          </FormField>
          <div>{/* Grid spacer */}</div>
          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Detailed description of the issue" />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
