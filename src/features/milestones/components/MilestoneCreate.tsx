import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { TextInput } from '@/components/forms/TextInput';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { DropdownSelect } from '@/components/forms/DropdownSelect';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { useToast } from '@/providers/ToastContext';
import { useMsal } from '@azure/msal-react';
import { milestonesService } from '@/features/milestones/api/milestones.api';
import { FormHeader, FormField, FormCard } from '@/components/forms/Form';
import { Milestone as MilestoneIcon } from 'lucide-react';

const FLAGS = ['Internal', 'External'];

export function MilestoneCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { accounts } = useMsal();
  const currentUserEmail = accounts?.[0]?.username || '';
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    project_id: null as any,
    start_date: new Date(),
    end_date: null as any,
    flags: 'Internal',
    tags: '',
    owner_email: currentUserEmail,
  });

  const extractId = (val: any) => val && typeof val === 'object' ? val.id : val;
  const set = (field: string, val: any) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.project_id) return;
    setCreating(true);
    try {
      await milestonesService.createMilestone({
        title: form.title,
        description: form.description || undefined,
        project_id: extractId(form.project_id),
        start_date: form.start_date ? new Date(form.start_date).toISOString().split('T')[0] : undefined,
        end_date: form.end_date ? new Date(form.end_date).toISOString().split('T')[0] : undefined,
        flags: form.flags,
        tags: form.tags || undefined,
        owner_email: form.owner_email || undefined,
      } as any);
      showToast('success', 'Milestone Created', 'The milestone was created successfully.');
      navigate('/milestones');
    } catch (error: any) {
      console.error('Failed to create milestone:', error);
      showToast('error', 'Error', error.response?.data?.detail || 'Failed to create milestone');
    } finally {
      setCreating(false);
    }
  };

  const isValid = form.title.trim() && form.project_id;

  return (
    <PageLayout title="Create New Milestone" showBackButton backPath="/milestones">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={MilestoneIcon} title="Milestone Details" subtitle="Fill in the details below to create a new milestone" color="purple" />

        <FormCard
          columns={3}
          footer={{ onCancel: () => navigate('/milestones'), submitLabel: 'Create Milestone', submittingLabel: 'Creating...', isSubmitting: creating, isDisabled: !isValid }}
        >
          {}
          <FormField label="Milestone Name" required>
            <TextInput value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Phase 1 Complete" className="h-10" />
          </FormField>
          <FormField label="Project" required>
            <ServerSearchDropdown entityType="projects" value={form.project_id} onChange={v => set('project_id', v)} placeholder="Select project" />
          </FormField>

          {}
          <FormField label="Flag">
            <DropdownSelect
              options={FLAGS.map(f => ({ label: f, value: f }))}
              value={form.flags}
              onChange={(e) => set('flags', e.value)}
              className="w-full"
            />
          </FormField>

          <FormField label="Owner (auto — current user)">
            <TextInput
              value={form.owner_email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('owner_email', e.target.value)}
              placeholder="owner@company.com"
              className="h-10 bg-theme-neutral/30"
              readOnly
            />
          </FormField>

          <FormField label="Tags (comma separated)">
            <TextInput value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. v2, release, critical" className="h-10" />
          </FormField>

          {}
          <FormField label="Start Date">
            <SharedCalendar value={form.start_date} onChange={d => set('start_date', d)} />
          </FormField>
          <FormField label="End Date">
            <SharedCalendar value={form.end_date} onChange={d => set('end_date', d)} />
          </FormField>
          <div>{}</div>

          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <TextAreaInput value={form.description} onChange={(e: any) => set('description', e.target.value)} rows={2} placeholder="Brief milestone description..." />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
