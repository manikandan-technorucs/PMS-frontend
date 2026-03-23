import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { Trash2, FolderKanban } from 'lucide-react';
import { projectsService } from '@/features/projects/services/projects.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';

const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);
const extractEmail = (val: any) => (val && typeof val === 'object' ? val.email : val);

export function ProjectEdit() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectPublicId, setProjectPublicId] = useState('');

  const [formData, setFormData] = useState({
    name: '', description: '', client: '', manager_email: null as any, status_id: null as any,
    priority_id: null as any, start_date: null as any, end_date: null as any, estimated_hours: '',
    dept_id: null as any, team_id: null as any, group_id: null as any,
    is_template: false, is_archived: false,
  });

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true); setError(null);
      const project = await projectsService.getProject(Number(projectId));
      setProjectPublicId(project.public_id);
      setFormData({
        name: project.name ?? '', description: project.description ?? '', client: project.client ?? '',
        manager_email: project.manager || project.manager_email || null, status_id: project.status || null, priority_id: project.priority || null,
        start_date: project.start_date ? new Date(project.start_date) : null, end_date: project.end_date ? new Date(project.end_date) : null,
        estimated_hours: project.estimated_hours?.toString() ?? '', dept_id: project.department || null,
        team_id: project.team || null, group_id: project.group || null,
        is_template: project.is_template ?? false, is_archived: project.is_archived ?? false,
      });
    } catch (err) { console.error(err); setError('Failed to load project data.'); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || submitting) return;
    try {
      setSubmitting(true); setError(null);
      const payload: any = { ...formData };
      ['status_id', 'priority_id', 'dept_id', 'team_id', 'group_id'].forEach(key => { payload[key] = extractId(payload[key]); });
      payload.manager_email = extractEmail(payload.manager_email);
      payload.estimated_hours = formData.estimated_hours ? parseFloat(formData.estimated_hours) : 0;
      ['start_date', 'end_date'].forEach(key => {
        if (payload[key] instanceof Date) payload[key] = payload[key].toISOString().split('T')[0];
        else if (!payload[key]) payload[key] = null;
      });
      ['description', 'client'].forEach(key => { if (!payload[key]) payload[key] = null; });
      await projectsService.updateProject(Number(projectId), payload);
      navigate(`/projects/${projectId}`);
    } catch (err: any) { console.error(err); setError(err.response?.data?.detail || 'Failed to update project.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    if (!window.confirm('Delete this project permanently? This cannot be undone.')) return;
    try { await projectsService.deleteProject(Number(projectId)); navigate('/projects'); }
    catch (err) { console.error(err); setError('Failed to delete project.'); }
  };

  if (loading) return <div className="p-8 text-gray-600">Loading project...</div>;

  return (
    <PageLayout
      title={`Edit Project ${projectPublicId}`} showBackButton
      actions={<Button variant="danger" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
    >
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={FolderKanban} title="Edit Project" subtitle={`Editing project ${projectPublicId}`} color="emerald" />

        {error && <div className="p-3 rounded bg-red-50 text-red-600 text-sm mb-4">{error}</div>}

        <FormCard columns={3} footer={{ onCancel: () => navigate(-1), submitLabel: 'Save Changes', submittingLabel: 'Saving...', isSubmitting: submitting }}>
          <FormField label="Project Name" required>
            <Input name="name" value={formData.name} onChange={handleChange} required className="h-10" />
          </FormField>
          <FormField label="Project ID">
            <Input value={projectPublicId} disabled className="h-10 bg-gray-100" />
          </FormField>
          <FormField label="Client" required>
            <Input name="client" value={formData.client} onChange={handleChange} required className="h-10" />
          </FormField>
          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={2} />
          </FormField>
          <FormField label="Manager" required>
            <ServerSearchDropdown entityType="users" value={formData.manager_email} onChange={v => set('manager_email', v)} placeholder="Select Manager" />
          </FormField>
          <FormField label="Status">
            <ServerSearchDropdown entityType="masters/statuses" value={formData.status_id} onChange={v => set('status_id', v)} placeholder="Select Status" />
          </FormField>
          <FormField label="Priority">
            <ServerSearchDropdown entityType="masters/priorities" value={formData.priority_id} onChange={v => set('priority_id', v)} placeholder="Select Priority" />
          </FormField>
          <FormField label="Start Date">
            <SharedCalendar value={formData.start_date} onChange={v => set('start_date', v)} />
          </FormField>
          <FormField label="End Date">
            <SharedCalendar value={formData.end_date} onChange={v => set('end_date', v)} />
          </FormField>
          <FormField label="Estimated Hours">
            <Input type="number" name="estimated_hours" value={formData.estimated_hours} onChange={handleChange} step="0.5" min="0" className="h-10" />
          </FormField>
          <FormField label="Department">
            <ServerSearchDropdown entityType="departments" value={formData.dept_id} onChange={v => set('dept_id', v)} placeholder="Select Department" />
          </FormField>
          <FormField label="Team">
            <ServerSearchDropdown entityType="teams" value={formData.team_id} onChange={v => set('team_id', v)} placeholder="Select Team" />
          </FormField>
          <FormField label="Project Group">
            <ServerSearchDropdown entityType="project-groups" value={formData.group_id} onChange={v => set('group_id', v)} placeholder="Select Group" />
          </FormField>
          <div className="flex items-end gap-5 pb-1 md:col-span-2 lg:col-span-3">
            <Checkbox label="Save as Template" checked={formData.is_template} onChange={(e: any) => set('is_template', e.target.checked)} />
            <Checkbox label="Archived" checked={formData.is_archived} onChange={(e: any) => set('is_archived', e.target.checked)} />
          </div>
        </FormCard>
      </form>
    </PageLayout>
  );
}