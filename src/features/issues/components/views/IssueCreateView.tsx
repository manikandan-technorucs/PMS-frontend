// src/features/issues/components/views/IssueCreateView.tsx
// SMART — RHF + Zod, createIssue mutation, file upload side-channel.
// All inputs wrapped in <FormField>. No native <select>/<input>/<textarea>.

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { TextInput } from '@/components/forms/TextInput';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { DropdownSelect } from '@/components/forms/DropdownSelect';
import { FormField } from '@/components/forms/FormField';
import { FormHeader, FormCard } from '@/components/forms/Form';
import { Button } from '@/components/forms/Button';
import { AlertTriangle, ImageIcon, UploadCloud, X } from 'lucide-react';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { FilteredStatusSelect } from '@/components/core/FilteredStatusSelect';
import { GraphUserAutocomplete } from '@/features/projects/components/ui/GraphUserAutocomplete';
import { GraphUserMultiSelect } from '@/features/projects/components/ui/GraphUserMultiSelect';
import SharedCalendar from '@/components/core/SharedCalendar';
import { useIssueActions } from '../../hooks/useIssueActions';
import { documentsService } from '@/features/documents/api/documents.api';
import { useToast } from '@/providers/ToastContext';
import { useAuth } from '@/auth/AuthProvider';

const CLASSIFICATIONS = [
  'None', 'Security', 'Crash/Hang', 'Data Loss', 'Performance',
  'UI/UX Usability', 'Other Bugs', 'Feature (New)', 'Enhancement',
] as const;

const issueSchema = z.object({
  title: z.string().trim().min(3, 'Min 3 characters').max(100, 'Max 100 characters'),
  description: z.string().trim().optional(),
  project_id: z.any().optional(),
  reporter_email: z.any().optional(),
  status_id: z.any().optional(),
  priority_id: z.any().optional(),
  classification: z.enum(CLASSIFICATIONS),
  module: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  estimated_hours: z.string().optional(),
  start_date: z.any().optional(),
  end_date: z.any().optional(),
  due_date: z.any().optional(),
});

type IssueFormValues = z.infer<typeof issueSchema>;

const extractId = (v: any) => (v && typeof v === 'object' ? v.id : v);
const toDate = (v: any) =>
  v ? (v instanceof Date ? v.toISOString().split('T')[0] : v) : null;

export function IssueCreateView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { createIssue } = useIssueActions();
  const [assignees, setAssignees] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { control, register, handleSubmit, formState: { errors, isValid } } =
    useForm<IssueFormValues>({
      resolver: zodResolver(issueSchema),
      mode: 'onChange',
      defaultValues: { 
        title: '', 
        description: '', 
        classification: 'None', 
        module: '', 
        tags: '', 
        estimated_hours: '',
        reporter_email: user ? { 
          mail: user.email, 
          displayName: `${user.first_name} ${user.last_name}`.trim() || user.email 
        } : undefined 
      },
    });

  const onSubmit = async (data: IssueFormValues) => {
    setUploading(true);
    const pid = extractId(data.project_id);
    try {
      const docIds: number[] = [];
      if (files.length > 0) {
        if (!pid) { showToast('error', 'Validation', 'Select a project before uploading.'); setUploading(false); return; }
        for (const f of files) { const d = await documentsService.createDocument(f, pid, f.name); docIds.push(d.id); }
      }
      await createIssue.mutateAsync({
        title: data.title, description: data.description || null, project_id: pid ?? null,
        reporter_email: (data.reporter_email as any)?.mail || (data.reporter_email as any)?.email || null,
        follower_emails: followers.map((f: any) => f.mail || f.email).filter(Boolean),
        assignee_emails: assignees.map((a: any) => a.mail || a.email).filter(Boolean),
        status_id: extractId(data.status_id) ?? null, priority_id: extractId(data.priority_id) ?? null,
        classification: data.classification, module: data.module || null, tags: data.tags || null,
        estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
        start_date: toDate(data.start_date), end_date: toDate(data.end_date),
        due_date: toDate(data.due_date), document_ids: docIds,
      });
      navigate('/issues');
    } catch (err: any) {
      showToast('error', 'Error', err?.response?.data?.detail || 'Failed to create issue.');
    } finally { setUploading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const sel = Array.from(e.target.files);
    if (files.length + sel.length > 5) { showToast('error', 'Limit', 'Max 5 images.'); return; }
    setFiles(p => [...p, ...sel]);
  };

  const isBusy = createIssue.isPending || uploading;

  return (
    <PageLayout title="Report New Issue" showBackButton backPath="/issues">
      <form onSubmit={handleSubmit(onSubmit as any)} className="max-w-[1200px] mx-auto">
        <FormHeader icon={AlertTriangle} title="Bug / Issue Details" subtitle="Provide details about the issue you want to report" color="rose" />
        <FormCard columns={3} footer={{
          onCancel: () => navigate('/issues'),
          submitLabel: uploading ? 'Uploading…' : 'Report Issue',
          submittingLabel: 'Saving…', isSubmitting: isBusy, isDisabled: !isValid || isBusy,
        }}>
          <FormField label="Issue Title" required error={errors.title?.message} className="md:col-span-2 lg:col-span-3">
            <TextInput {...register('title')} isInvalid={!!errors.title}
              placeholder="Brief description of the issue" className="h-10" />
          </FormField>

          <FormField label="Project">
            <Controller name="project_id" control={control} render={({ field }) => (
              <ServerSearchDropdown entityType="projects" value={field.value} onChange={field.onChange} placeholder="Select Project" />
            )} />
          </FormField>

          <FormField label="Assignees">
            <GraphUserMultiSelect value={assignees} onChange={setAssignees} placeholder="Search users…" />
          </FormField>

          <FormField label="Reporter">
            <Controller name="reporter_email" control={control} render={({ field }) => (
              <GraphUserAutocomplete value={field.value} onChange={field.onChange} placeholder="Search reporter…" />
            )} />
          </FormField>

          <FormField label="Followers">
            <GraphUserMultiSelect value={followers} onChange={setFollowers} placeholder="Search users…" />
          </FormField>

          <FormField label="Status">
            <Controller name="status_id" control={control} render={({ field }) => (
              <FilteredStatusSelect module="issues" value={field.value} onChange={field.onChange} />
            )} />
          </FormField>

          <FormField label="Severity / Priority">
            <Controller name="priority_id" control={control} render={({ field }) => (
              <ServerSearchDropdown entityType="masters/priorities" value={field.value} onChange={field.onChange} placeholder="Select Priority" />
            )} />
          </FormField>

          <FormField label="Classification">
            <Controller name="classification" control={control} render={({ field }) => (
              <DropdownSelect options={CLASSIFICATIONS.map(c => ({ name: c, id: c }))}
                value={field.value} onChange={e => field.onChange(e.value)} />
            )} />
          </FormField>

          <FormField label="Module" error={errors.module?.message}>
            <TextInput {...register('module')} placeholder="e.g. Authentication, Billing…" className="h-10" />
          </FormField>

          <FormField label="Tags" error={errors.tags?.message}>
            <TextInput {...register('tags')} placeholder="e.g. login, urgent, api" className="h-10" />
          </FormField>

          <FormField label="Estimated Hours">
            <TextInput {...register('estimated_hours')} type="number" step="0.1" min="0" placeholder="e.g. 10.5" className="h-10" />
          </FormField>

          <FormField label="Due Date">
            <Controller name="due_date" control={control} render={({ field }) => (
              <SharedCalendar value={field.value} onChange={field.onChange} />
            )} />
          </FormField>

          <FormField label="Start Date">
            <Controller name="start_date" control={control} render={({ field }) => (
              <SharedCalendar value={field.value} onChange={field.onChange} />
            )} />
          </FormField>

          <FormField label="Description" error={errors.description?.message} className="md:col-span-2 lg:col-span-3">
            <TextAreaInput {...register('description')} rows={3}
              placeholder="Steps to reproduce, expected vs actual behavior…" />
          </FormField>

          <FormField label={`Attachments (${files.length}/5)`} className="md:col-span-2 lg:col-span-3">
            <div className="border-2 border-dashed border-theme-border rounded-xl p-6 bg-theme-neutral/20 hover:bg-theme-neutral/40 transition-all">
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="w-8 h-8 text-brand-teal-500" />
                <p className="text-[14px] font-medium text-theme-primary">
                  Drag &amp; drop or{' '}
                  <label className="text-brand-teal-600 font-bold cursor-pointer">
                    browse<input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={isBusy} />
                  </label>
                </p>
                <p className="text-[12px] text-theme-muted">PNG, JPG, GIF — max 10 MB each, 5 files.</p>
              </div>
              {files.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                  {files.map((f, i) => (
                    <div key={i} className="relative group bg-theme-surface border border-theme-border rounded-lg p-2 shadow-sm flex flex-col items-center overflow-hidden">
                      <div className="w-full h-16 flex items-center justify-center mb-2">
                        {f.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(f)} alt={f.name} className="h-full object-contain" />
                        ) : <ImageIcon className="w-6 h-6 text-theme-muted" />}
                      </div>
                      <p className="text-[11px] text-theme-secondary font-medium truncate w-full text-center">{f.name}</p>
                      <button type="button" onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
