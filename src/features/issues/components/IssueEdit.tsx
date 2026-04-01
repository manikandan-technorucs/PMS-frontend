import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from 'primereact/button';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { PageSpinner } from '@/components/ui/Loader/PageSpinner';
import { Trash2, AlertTriangle, X, UploadCloud, ImageIcon } from 'lucide-react';
import { issuesService } from '@/features/issues/services/issues.api';
import { documentsService } from '@/features/documents/services/documents.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import CoreSearchableMultiSelect from '@/components/core/SearchableMultiSelect';
import SharedCalendar from '@/components/core/SharedCalendar';
import { FilteredStatusSelect } from '@/components/core/FilteredStatusSelect';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';

export function IssueEdit() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [issuePublicId, setIssuePublicId] = useState('');
  const [dbStatusName, setDbStatusName] = useState('');

  const [formData, setFormData] = useState({
    title: '', project_id: null as any, reporter_email: null as any, assignee_email: null as any,
    status_id: null as any, priority_id: null as any, classification: 'None', start_date: null as any, end_date: null as any,
    estimated_hours: '', description: '', module: '', tags: '',
  });

  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [assignees, setAssignees] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!issueId) return;
        const issue = await issuesService.getIssue(parseInt(issueId, 10));
        setIssuePublicId(issue.public_id);
        setDbStatusName(issue.status?.name || '');
        setFormData({
          title: issue.title || '', project_id: issue.project || null, reporter_email: issue.reporter || issue.reporter_email || null,
          assignee_email: issue.assignee || issue.assignee_email || null, status_id: issue.status || null, priority_id: issue.priority || null,
          classification: issue.classification || 'None', start_date: issue.start_date ? new Date(issue.start_date) : null, end_date: issue.end_date ? new Date(issue.end_date) : null,
          estimated_hours: issue.estimated_hours?.toString() || '', description: issue.description || '',
          module: issue.module || '', tags: issue.tags || '',
        });
        setAssignees(issue.assignees || []);
        setFollowers(issue.followers || []);
        setExistingDocs(issue.documents || []);
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
  const extractEmail = (val: any) => (val && typeof val === 'object' ? val.email : val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueId) return;
    setSubmitting(true);
    setUploading(true);
    try {
      const pid = extractId(formData.project_id);
      const newDocIds: number[] = [];

      if (files.length > 0) {
        if (!pid) {
          alert('Please select a project before uploading images.');
          setUploading(false);
          setSubmitting(false);
          return;
        }
        for (const file of files) {
          const doc = await documentsService.createDocument(file, pid, file.name);
          newDocIds.push(doc.id);
        }
      }

      const payload: any = { ...formData };
      ['project_id', 'status_id', 'priority_id'].forEach(key => { payload[key] = extractId(payload[key]); });
      payload.reporter_email = extractEmail(payload.reporter_email);
      payload.assignee_ids = assignees.map((a: any) => (typeof a === 'object' ? a.id : a));
      payload.follower_ids = followers.map((f: any) => (typeof f === 'object' ? f.id : f));
      payload.classification = formData.classification;
      if (payload.description === '') payload.description = null;
      ['start_date', 'end_date'].forEach(key => {
        if (payload[key] instanceof Date) payload[key] = payload[key].toISOString().split('T')[0];
        else if (!payload[key]) payload[key] = null;
      });
      payload.estimated_hours = payload.estimated_hours === '' ? null : parseFloat(payload.estimated_hours);
      payload.document_ids = [...existingDocs.map(d => d.id), ...newDocIds];

      await issuesService.updateIssue(parseInt(issueId, 10), payload);
      navigate(`/issues/${issueId}`);
    } catch (error: any) {
      console.error('Failed to update issue:', error);
      alert(error.response?.data?.detail || 'Failed to update issue');
    } finally { 
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const total = existingDocs.length + files.length + selected.length;
      if (total > 5) {
        alert('You can only attach up to 5 images total.');
        return;
      }
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const removeNewFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDoc = (id: number) => {
    setExistingDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try { if (issueId) { await issuesService.deleteIssue(parseInt(issueId, 10)); navigate('/issues'); } }
      catch (error) { console.error('Failed to delete issue:', error); alert('Failed to delete issue'); }
    }
  };

  if (loading) return <PageSpinner fullPage label="Loading issue data" />;

  return (
    <PageLayout
      title={`Edit Issue ${issuePublicId}`}
      showBackButton backPath={`/issues/${issueId}`}
      actions={<Button severity="danger" type="button" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete Issue</Button>}
    >
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={AlertTriangle} title="Edit Issue" subtitle={`Editing issue ${issuePublicId}`} color="rose" />
        <FormCard 
          columns={3} 
          footer={{ 
            onCancel: () => navigate(`/issues/${issueId}`), 
            submitLabel: uploading ? 'Uploading...' : 'Save Changes', 
            submittingLabel: 'Saving...', 
            isSubmitting: submitting || uploading,
            isDisabled: submitting || uploading
          }}
        >
          <FormField label="Issue Title" required className="md:col-span-2 lg:col-span-3">
            <Input name="title" value={formData.title} onChange={handleChange} required placeholder="Brief description of the issue" className="h-10" />
          </FormField>
          <FormField label="Project">
            <ServerSearchDropdown entityType="projects" value={formData.project_id} onChange={v => set('project_id', v)} placeholder="Select Project" />
          </FormField>
          <FormField label="Reporter">
            <ServerSearchDropdown entityType="users" value={formData.reporter_email} onChange={v => set('reporter_email', v)} placeholder="Select Reporter" />
          </FormField>
          <FormField label="Assignees (Multi-Select)">
            <CoreSearchableMultiSelect
              entityType="users"
              value={assignees}
              onChange={setAssignees}
              placeholder="Select assignees..."
              field="email"
            />
          </FormField>
          <FormField label="Status">
            <FilteredStatusSelect module="issues" currentOriginalStatusName={dbStatusName} value={formData.status_id} onChange={v => set('status_id', v)} />
          </FormField>
          <FormField label="Severity / Priority">
            <ServerSearchDropdown entityType="masters/priorities" value={formData.priority_id} onChange={v => set('priority_id', v)} placeholder="Select Priority" />
          </FormField>
          <FormField label="Add Followers">
            <CoreSearchableMultiSelect
              entityType="users"
              value={followers}
              onChange={setFollowers}
              placeholder="Select followers..."
              field="email"
            />
          </FormField>
          <FormField label="Classification">
            <select
              name="classification"
              value={formData.classification}
              onChange={handleChange}
              className="w-full h-10 px-3 py-2 text-[13px] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
            >
              {['None', 'Security', 'Crash', 'Data Loss', 'Performance', 'UI/UX', 'Other', 'Feature', 'Enhancement'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Module">
            <Input name="module" value={formData.module} onChange={handleChange} placeholder="e.g. Authentication, Billing..." className="h-10" />
          </FormField>
          <FormField label="Tags (comma separated)">
            <Input name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. login, urgent, api" className="h-10" />
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
          
          <FormField label={`Attachments (${existingDocs.length + files.length} of 5 images)`} className="md:col-span-2 lg:col-span-3">
            <div className="border-2 border-dashed border-theme-border rounded-xl p-6 bg-theme-neutral/20 transition-all hover:bg-theme-neutral/40 focus-within:ring-2 focus-within:ring-brand-teal-500/20">
              <div className="flex flex-col items-center justify-center gap-2">
                <UploadCloud className="w-8 h-8 text-brand-teal-500 mb-1" />
                <p className="text-[14px] font-medium text-theme-primary">
                  Drag & drop images here, or <label className="text-brand-teal-600 hover:text-brand-teal-700 cursor-pointer font-bold">browse<input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} /></label>
                </p>
                <p className="text-[12px] text-theme-muted">PNG, JPG, GIF up to 10MB file size.</p>
              </div>
              
              {(existingDocs.length > 0 || files.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                  {/* Existing documents */}
                  {existingDocs.map((doc) => (
                    <div key={`doc-${doc.id}`} className="relative group bg-theme-surface border border-theme-border rounded-lg overflow-hidden flex flex-col items-center p-2 shadow-sm">
                      <div className="w-full h-16 bg-theme-neutral/50 rounded flex items-center justify-center mb-2 overflow-hidden">
                        {(doc.file_type && doc.file_type.startsWith('image/')) || doc.file_url?.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                          <img src={`http://localhost:8000/api/v1${doc.file_url}`} alt={doc.title} className="w-full h-full object-cover rounded" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-theme-muted" />
                        )}
                      </div>
                      <p className="text-[11px] text-theme-secondary font-medium truncate w-full text-center">{doc.title}</p>
                      <Button unstyled type="button" onClick={() => removeExistingDoc(doc.id)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}

                  {/* New pending files */}
                  {files.map((f, i) => (
                    <div key={`file-${i}`} className="relative group bg-brand-teal-50 dark:bg-brand-teal-900/10 border border-brand-teal-200 dark:border-brand-teal-800/30 rounded-lg overflow-hidden flex flex-col items-center p-2 shadow-sm">
                      <div className="w-full h-16 bg-theme-neutral/50 rounded flex items-center justify-center mb-2">
                        {f.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(f)} alt={f.name} className="h-full object-contain mix-blend-multiply dark:mix-blend-screen" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-theme-muted" />
                        )}
                      </div>
                      <p className="text-[11px] text-brand-teal-700 dark:text-brand-teal-400 font-medium truncate w-full text-center">{f.name}</p>
                      <Button unstyled type="button" onClick={() => removeNewFile(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </Button>
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
