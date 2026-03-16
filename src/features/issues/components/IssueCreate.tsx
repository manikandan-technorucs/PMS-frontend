import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntity } from '@/hooks/useEntity';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Input } from '@/shared/components/ui/Input/Input';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { FormHeader, FormField, FormCard } from '@/shared/components/ui/Form';
import { AlertTriangle } from 'lucide-react';

export function IssueCreate() {
  const navigate = useNavigate();
  const { create, loading } = useEntity('issues');

  const [formData, setFormData] = useState({
    title: '',
    project_id: null as any,
    reporter_id: null as any,
    assignee_id: null as any,
    status_id: null as any,
    priority_id: null as any,
    start_date: new Date(),
    end_date: null as any,
    estimated_hours: '',
    description: '',
  });

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        ...formData,
        project_id: extractId(formData.project_id),
        reporter_id: extractId(formData.reporter_id),
        assignee_id: extractId(formData.assignee_id),
        status_id: extractId(formData.status_id),
        priority_id: extractId(formData.priority_id),
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        start_date: formData.start_date?.toISOString().split('T')[0],
        end_date: formData.end_date ? (formData.end_date instanceof Date ? formData.end_date.toISOString().split('T')[0] : formData.end_date) : null,
      };
      await create(payload);
      navigate('/issues');
    } catch (err) {
      console.error('Failed to create issue:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));

  return (
    <PageLayout title="Report New Issue" showBackButton backPath="/issues">
      <form onSubmit={handleSave} className="max-w-[1200px] mx-auto">
        <FormHeader icon={AlertTriangle} title="Issue Details" subtitle="Provide details about the issue you want to report" color="rose" />

        <FormCard
          columns={3}
          footer={{ onCancel: () => navigate('/issues'), submitLabel: 'Report Issue', submittingLabel: 'Saving...', isSubmitting: loading, isDisabled: !formData.title.trim() }}
        >
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

          <FormField label="Priority">
            <ServerSearchDropdown entityType="masters/priorities" value={formData.priority_id} onChange={v => set('priority_id', v)} placeholder="Select Priority" />
          </FormField>

          <FormField label="Estimated Hours">
            <Input name="estimated_hours" type="number" step="0.1" value={formData.estimated_hours} onChange={handleChange} placeholder="e.g. 10.5" className="h-10" />
          </FormField>

          <FormField label="Start Date">
            <SharedCalendar value={formData.start_date} onChange={v => set('start_date', v)} />
          </FormField>

          <FormField label="End Date">
            <SharedCalendar value={formData.end_date} onChange={v => set('end_date', v)} />
          </FormField>

          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Detailed description of the issue" />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
