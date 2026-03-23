import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntity } from '@/hooks/useEntity';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';
import { AlertTriangle, FileUp, X, UploadCloud, ImageIcon } from 'lucide-react';
import { documentsService } from '@/features/documents/services/documents.api';

export function IssueCreate() {
  const navigate = useNavigate();
  const { create, loading } = useEntity('issues');

  const [formData, setFormData] = useState({
    title: '',
    project_id: null as any,
    reporter_email: null as any,
    assignee_email: null as any,
    status_id: null as any,
    priority_id: null as any,
    start_date: new Date(),
    end_date: null as any,
    estimated_hours: '',
    description: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);
  const extractEmail = (val: any) => (val && typeof val === 'object' ? val.email : val);

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setUploading(true);
    try {
      const pid = extractId(formData.project_id);
      
      const docIds: number[] = [];
      if (files.length > 0) {
        if (!pid) {
          alert('Please select a project before uploading images.');
          setUploading(false);
          return;
        }
        for (const file of files) {
          const doc = await documentsService.createDocument(file, pid, file.name);
          docIds.push(doc.id);
        }
      }

      const payload = {
        ...formData,
        project_id: pid,
        reporter_email: extractEmail(formData.reporter_email),
        assignee_email: extractEmail(formData.assignee_email),
        status_id: extractId(formData.status_id),
        priority_id: extractId(formData.priority_id),
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        start_date: formData.start_date?.toISOString().split('T')[0],
        end_date: formData.end_date ? (formData.end_date instanceof Date ? formData.end_date.toISOString().split('T')[0] : formData.end_date) : null,
        document_ids: docIds
      };
      
      await create(payload);
      navigate('/issues');
    } catch (err) {
      console.error('Failed to create issue:', err);
      alert('Failed to save issue or upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const total = files.length + selected.length;
      if (total > 5) {
        alert('You can only upload up to 5 images.');
        return;
      }
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <PageLayout title="Report New Issue" showBackButton backPath="/issues">
      <form onSubmit={handleSave} className="max-w-[1200px] mx-auto">
        <FormHeader icon={AlertTriangle} title="Issue Details" subtitle="Provide details about the issue you want to report" color="rose" />

        <FormCard
          columns={3}
          footer={{ 
            onCancel: () => navigate('/issues'), 
            submitLabel: uploading ? 'Uploading images...' : 'Report Issue', 
            submittingLabel: 'Saving...', 
            isSubmitting: loading || uploading, 
            isDisabled: !formData.title.trim() || uploading 
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

          <FormField label="Assignee">
            <ServerSearchDropdown entityType="users" value={formData.assignee_email} onChange={v => set('assignee_email', v)} placeholder="Select Assignee" />
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

          <FormField label="Attachments (Up to 5 images)" className="md:col-span-2 lg:col-span-3">
            <div className="border-2 border-dashed border-theme-border rounded-xl p-6 bg-theme-neutral/20 transition-all hover:bg-theme-neutral/40 focus-within:ring-2 focus-within:ring-brand-teal-500/20">
              <div className="flex flex-col items-center justify-center gap-2">
                <UploadCloud className="w-8 h-8 text-brand-teal-500 mb-1" />
                <p className="text-[14px] font-medium text-theme-primary">
                  Drag & drop images here, or <label className="text-brand-teal-600 hover:text-brand-teal-700 cursor-pointer font-bold">browse<input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} /></label>
                </p>
                <p className="text-[12px] text-theme-muted">PNG, JPG, GIF up to 10MB file size.</p>
              </div>
              
              {files.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                  {files.map((f, i) => (
                    <div key={i} className="relative group bg-theme-surface border border-theme-border rounded-lg overflow-hidden flex flex-col items-center p-2 shadow-sm">
                      <div className="w-full h-16 bg-theme-neutral/50 rounded flex items-center justify-center mb-2">
                        {f.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(f)} alt={f.name} className="h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-theme-muted" />
                        )}
                      </div>
                      <p className="text-[11px] text-theme-secondary font-medium truncate w-full text-center">{f.name}</p>
                      <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
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
