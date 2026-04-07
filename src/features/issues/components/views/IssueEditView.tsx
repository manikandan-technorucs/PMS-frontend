import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { TextInput } from '@/components/forms/TextInput';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { DropdownSelect } from '@/components/forms/DropdownSelect';
import { FormField } from '@/components/forms/FormField';
import { FormHeader, FormCard } from '@/components/forms/Form';
import { Button } from '@/components/forms/Button';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { AlertTriangle, ImageIcon, Trash2, UploadCloud, X } from 'lucide-react';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { FilteredStatusSelect } from '@/components/core/FilteredStatusSelect';
import { GraphUserAutocomplete } from '@/features/projects/components/ui/GraphUserAutocomplete';
import { GraphUserMultiSelect } from '@/features/projects/components/ui/GraphUserMultiSelect';
import SharedCalendar from '@/components/core/SharedCalendar';
import { useIssue } from '../../hooks/useIssues';
import { useIssueActions } from '../../hooks/useIssueActions';
import { documentsService } from '@/features/documents/api/documents.api';
import { useToast } from '@/providers/ToastContext';

const CLASSIFICATIONS = [
  'None', 'Security', 'Crash/Hang', 'Data Loss', 'Performance',
  'UI/UX Usability', 'Other Bugs', 'Feature (New)', 'Enhancement',
] as const;

const issueSchema = z.object({
  title: z.string().trim().min(3, 'Min 3 characters').max(100, 'Max 100 characters'),
  description: z.string().trim().optional().nullable(),
  project_id: z.any().optional(),
  reporter_email: z.any().optional(),
  status_id: z.any().optional(),
  priority_id: z.any().optional(),
  classification: z.enum(CLASSIFICATIONS),
  module: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  estimated_hours: z.string().optional(),
  start_date: z.any().optional().nullable(),
  end_date: z.any().optional().nullable(),
});

type IssueFormValues = z.infer<typeof issueSchema>;

const extractId = (v: any) => (v && typeof v === 'object' ? v.id : v);
const toDate = (v: any) =>
  v instanceof Date ? v.toISOString().split('T')[0] : v || null;

export function IssueEditView() {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const id = parseInt(issueId ?? '0', 10);

  const { data: issue, isLoading } = useIssue(id);
  const { updateIssue, deleteIssue } = useIssueActions();

  const [assignees, setAssignees] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dbStatusName, setDbStatusName] = useState('');

  const { control, register, handleSubmit, reset, formState: { errors } } =
    useForm<IssueFormValues>({
      resolver: zodResolver(issueSchema) as any,
      mode: 'onChange',
    });

  
  useEffect(() => {
    if (!issue) return;
    setDbStatusName(issue.status?.name || '');
    setAssignees(issue.assignees || []);
    setFollowers(issue.followers || []);
    setExistingDocs(issue.documents || []);
    reset({
      title: issue.title || '',
      description: issue.description || '',
      project_id: issue.project || null,
      reporter_email: issue.reporter || issue.reporter_email || null,
      status_id: issue.status || null,
      priority_id: issue.priority || null,
      classification: (issue.classification as any) || 'None',
      module: issue.module || '',
      tags: issue.tags || '',
      estimated_hours: issue.estimated_hours?.toString() || '',
      start_date: issue.start_date ? new Date(issue.start_date) : null,
      end_date: issue.end_date ? new Date(issue.end_date) : null,
    });
  }, [issue, reset]);

  const onSubmit = async (data: IssueFormValues) => {
    setUploading(true);
    const pid = extractId(data.project_id);
    try {
      const newDocIds: number[] = [];
      if (files.length > 0) {
        if (!pid) { showToast('error', 'Validation', 'Select a project before uploading.'); setUploading(false); return; }
        for (const f of files) { const d = await documentsService.createDocument(f, pid, f.name); newDocIds.push(d.id); }
      }
      await updateIssue.mutateAsync({
        id,
        data: {
          title: data.title, description: data.description || null,
          project_id: pid ?? null,
          reporter_email: (data.reporter_email as any)?.mail || (data.reporter_email as any)?.email || data.reporter_email || null,
          follower_emails: followers.map((f: any) => f.mail || f.email).filter(Boolean),
          assignee_emails: assignees.map((a: any) => a.mail || a.email).filter(Boolean),
          status_id: extractId(data.status_id) ?? null,
          priority_id: extractId(data.priority_id) ?? null,
          classification: data.classification,
          module: data.module || null, tags: data.tags || null,
          estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
          start_date: toDate(data.start_date), end_date: toDate(data.end_date),
          document_ids: [...existingDocs.map((d: any) => d.id), ...newDocIds],
        },
      });
      navigate(`/issues/${id}`);
    } catch (err: any) {
      showToast('error', 'Error', err?.response?.data?.detail || 'Failed to update issue.');
    } finally { setUploading(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteIssue.mutateAsync(id);
      navigate('/issues');
    } catch { showToast('error', 'Error', 'Failed to delete issue.'); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const sel = Array.from(e.target.files);
    if (existingDocs.length + files.length + sel.length > 5) { showToast('error', 'Limit', 'Max 5 images total.'); return; }
    setFiles(p => [...p, ...sel]);
  };

  if (isLoading) return <PageSpinner fullPage label="Loading issue…" />;

  const isBusy = updateIssue.isPending || uploading;
  const attachCount = existingDocs.length + files.length;

  return (
    <PageLayout title={`Edit Issue`} showBackButton backPath={`/issues/${id}`}
      actions={<Button variant="danger" type="button" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete Issue</Button>}>
      <form onSubmit={handleSubmit(onSubmit as any)} className="max-w-[1200px] mx-auto">
        <FormHeader icon={AlertTriangle} title="Edit Issue"
          subtitle={`Editing issue ${issue?.public_id || `ISS-${id}`}`} color="rose" />
        <FormCard columns={3} footer={{
          onCancel: () => navigate(`/issues/${id}`),
          submitLabel: uploading ? 'Uploading…' : 'Save Changes',
          submittingLabel: 'Saving…', isSubmitting: isBusy, isDisabled: isBusy,
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

          <FormField label="Status">
            <Controller name="status_id" control={control} render={({ field }) => (
              <FilteredStatusSelect module="issues" currentOriginalStatusName={dbStatusName}
                value={field.value} onChange={field.onChange} />
            )} />
          </FormField>

          <FormField label="Severity / Priority">
            <Controller name="priority_id" control={control} render={({ field }) => (
              <ServerSearchDropdown entityType="masters/priorities" value={field.value} onChange={field.onChange} placeholder="Select Priority" />
            )} />
          </FormField>

          <FormField label="Followers">
            <GraphUserMultiSelect value={followers} onChange={setFollowers} placeholder="Search users…" />
          </FormField>

          <FormField label="Classification">
            <Controller name="classification" control={control} render={({ field }) => (
              <DropdownSelect options={CLASSIFICATIONS.map(c => ({ name: c, id: c }))}
                value={field.value} onChange={e => field.onChange(e.value)} />
            )} />
          </FormField>

          <FormField label="Module" error={errors.module?.message}>
            <TextInput {...register('module')} placeholder="e.g. Authentication…" className="h-10" />
          </FormField>

          <FormField label="Tags" error={errors.tags?.message}>
            <TextInput {...register('tags')} placeholder="e.g. login, urgent" className="h-10" />
          </FormField>

          <FormField label="Estimated Hours">
            <TextInput {...register('estimated_hours')} type="number" step="0.1" min="0" placeholder="e.g. 10.5" className="h-10" />
          </FormField>

          <FormField label="Start Date">
            <Controller name="start_date" control={control} render={({ field }) => (
              <SharedCalendar value={field.value} onChange={field.onChange} />
            )} />
          </FormField>

          <FormField label="End Date">
            <Controller name="end_date" control={control} render={({ field }) => (
              <SharedCalendar value={field.value} onChange={field.onChange} />
            )} />
          </FormField>

          <FormField label="Description" error={errors.description?.message} className="md:col-span-2 lg:col-span-3">
            <TextAreaInput {...(register('description') as any)} rows={3} placeholder="Detailed description of the issue" />
          </FormField>

          {}
          <FormField label={`Attachments (${attachCount}/5)`} className="md:col-span-2 lg:col-span-3">
            <div className="border-2 border-dashed border-theme-border rounded-xl p-6 bg-theme-neutral/20 hover:bg-theme-neutral/40 transition-all">
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="w-8 h-8 text-brand-teal-500" />
                <p className="text-[14px] font-medium text-theme-primary">
                  Drop images or{' '}
                  <label className="text-brand-teal-600 font-bold cursor-pointer">
                    browse<input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={isBusy} />
                  </label>
                </p>
                <p className="text-[12px] text-theme-muted">PNG, JPG, GIF — max 10 MB, 5 files.</p>
              </div>

              {(existingDocs.length > 0 || files.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                  {existingDocs.map((doc: any) => (
                    <div key={`doc-${doc.id}`} className="relative group bg-theme-surface border border-theme-border rounded-lg p-2 shadow-sm flex flex-col items-center overflow-hidden">
                      <div className="w-full h-16 flex items-center justify-center mb-2 overflow-hidden">
                        {(doc.file_type?.startsWith('image/') || doc.file_url?.match(/\.(jpeg|jpg|gif|png)$/i)) ? (
                          <img src={`http://localhost:8000/api/v1${doc.file_url}`} alt={doc.title} className="w-full h-full object-cover rounded" />
                        ) : <ImageIcon className="w-6 h-6 text-theme-muted" />}
                      </div>
                      <p className="text-[11px] text-theme-secondary font-medium truncate w-full text-center">{doc.title}</p>
                      <button type="button" onClick={() => setExistingDocs(p => p.filter(d => d.id !== doc.id))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {files.map((f, i) => (
                    <div key={`file-${i}`} className="relative group bg-brand-teal-50 dark:bg-brand-teal-900/10 border border-brand-teal-200 dark:border-brand-teal-800/30 rounded-lg p-2 shadow-sm flex flex-col items-center overflow-hidden">
                      <div className="w-full h-16 flex items-center justify-center mb-2">
                        {f.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(f)} alt={f.name} className="h-full object-contain" />
                        ) : <ImageIcon className="w-6 h-6 text-theme-muted" />}
                      </div>
                      <p className="text-[11px] text-brand-teal-700 dark:text-brand-teal-400 font-medium truncate w-full text-center">{f.name}</p>
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
