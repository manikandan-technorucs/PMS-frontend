import React, { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { AlertTriangle, ImageIcon, Trash2, UploadCloud, X, Tag, User2, Users, Layers, Calendar as CalIcon } from 'lucide-react';
import { RadioButton } from 'primereact/radiobutton';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { ServerLookupDropdown } from '@/components/core/ServerLookupDropdown';
import { GraphUserAutocomplete } from '@/features/projects/components/ui/GraphUserAutocomplete';
import { GraphUserMultiSelect } from '@/features/projects/components/ui/GraphUserMultiSelect';
import { useIssue } from '../../hooks/useIssues';
import { useIssueActions } from '../../hooks/useIssueActions';
import { documentsService } from '@/features/documents/api/documents.api';
import { useToast } from '@/providers/ToastContext';
import { FieldLabel } from '@/components/forms/FieldLabel';
import { FieldError } from '@/components/forms/FieldError';
import { SectionDivider } from '@/components/forms/SectionDivider';
import { PremiumFormHeader } from '@/components/forms/PremiumFormHeader';
import { inputCls } from '@/components/forms/FormStyles';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { handleServerError } from '@/utils/errorHelpers';
import { 
    ISSUE_CLASSIFICATIONS as CLASSIFICATIONS, 
    SEVERITY_COLORS, 
    BUG_TYPE_OPTIONS, 
    REPRO_OPTIONS 
} from '@/constants/constants';

const SEVERITY_OPTIONS = [
    { label: 'Critical', value: 'Critical', color: SEVERITY_COLORS.critical },
    { label: 'High', value: 'High', color: SEVERITY_COLORS.high },
    { label: 'Medium', value: 'Medium', color: SEVERITY_COLORS.medium },
    { label: 'Low', value: 'Low', color: SEVERITY_COLORS.low },
];

const issueSchema = z.object({
    bug_name: z.string().trim().min(3, 'Min 3 characters').max(100, 'Max 100 characters'),
    description: z.string().trim().optional().nullable(),
    project_id: z.any().refine((v) => !!v, { message: 'Project is required' }),
    milestone_id: z.any().optional(),
    reporter_ref: z.any().optional(),
    status_ref: z.any().optional(),
    severity_ref: z.any().optional(),
    bug_type: z.string().optional(),

    classification: z.any().optional(),
    module: z.string().trim().optional(),
    tags: z.string().trim().optional(),
    estimated_hours: z.string().optional(),
    start_date: z.any().refine((v) => !!v, { message: 'Start Date is required' }),
    end_date: z.any().refine((v) => !!v, { message: 'Due Date is required' }),
}).refine(
    (data) => {
        if (data.start_date && data.end_date) {
            const start = data.start_date instanceof Date ? data.start_date : new Date(data.start_date);
            const end = data.end_date instanceof Date ? data.end_date : new Date(data.end_date);
            return end >= start;
        }
        return true;
    },
    { message: 'Due Date cannot be earlier than Start Date', path: ['end_date'] }
);

type IssueFormValues = z.infer<typeof issueSchema>;

const extractId = (v: any) => (v && typeof v === 'object' ? v.id : v);
const toDate = (v: any) =>
    v instanceof Date ? v.toISOString().split('T')[0] : v || null;
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/v1$/, '') ?? '';

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

    const { control, register, handleSubmit, reset, setValue, watch, setError, formState: { errors } } =
        useForm<IssueFormValues>({
            resolver: zodResolver(issueSchema) as any,
            mode: 'onChange',
        });

    const watchBugType = watch('bug_type');
    const watchReproducible = watch('reproducible_flag');
    const watchStartDate = watch('start_date');
    const watchProjectId = useWatch({ control, name: 'project_id' });

    useEffect(() => {
        if (!issue) return;
        setDbStatusName(issue.status ?? '');
        setAssignees(issue.assignees || []);
        setFollowers(issue.followers || []);
        setExistingDocs(issue.documents || []);
        reset({
            bug_name: issue.bug_name || '',
            description: issue.description || '',

            project_id: issue.project || null,
            milestone_id: issue.milestone || null,

            reporter_ref: issue.reporter || null,
            status_ref: issue.status_id || null,
            severity_ref: issue.severity_id || null,
            bug_type: issue.flag || 'Internal',
            classification: issue.classification_id || null,

            module: issue.module || '',
            tags: issue.tags || '',
            reproducible_flag: issue.reproducible_flag ?? true,
            estimated_hours: issue.estimated_hours?.toString() || '',
            start_date: issue.start_date ? new Date(issue.start_date) : null,
            end_date: issue.due_date ? new Date(issue.due_date) : null,
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
                    bug_name: data.bug_name, description: data.description || null,
                    project_id: pid ?? null,
                    milestone_id: extractId(data.milestone_id) ?? null,
                    reporter_id: (!isNaN(Number((data.reporter_ref as any)?.id))) ? Number((data.reporter_ref as any)?.id) : undefined,
                    follower_emails: followers.map((f: any) => f.mail || f.email).filter(Boolean),
                    assignee_emails: assignees.map((a: any) => a.mail || a.email).filter(Boolean),
                    status_id: extractId(data.status_ref),
                    severity_id: extractId(data.severity_ref),
                    flag: (data as any).bug_type || 'Internal',
                    classification_id: extractId(data.classification),

                    module: data.module || null, tags: data.tags || null,
                    estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
                    start_date: toDate(data.start_date), due_date: toDate(data.end_date),
                    document_ids: [...existingDocs.map((d: any) => d.id), ...newDocIds],
                },
            });
            if (window.history.state && window.history.state.idx > 0) navigate(-1); else navigate(`/issues/${id}`, { replace: true });
        } catch (err: any) {
            console.error(err);
            handleServerError(err, setError, showToast, 'Update Failed');
        } finally { setUploading(false); }
    };

    const handleDelete = async () => {
        try {
            await deleteIssue.mutateAsync(id);
            navigate('/issues');
        } catch { showToast('error', 'Error', 'Failed to delete defect.'); }
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
        <PageLayout title="Edit Defect" showBackButton onBack={() => { if (window.history.state && window.history.state.idx > 0) navigate(-1); else navigate(`/issues/${id}`, { replace: true }); }} actions={
            <Button variant="danger" type="button" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete Defect</Button>
        }>
            <form onSubmit={handleSubmit(onSubmit as any)} className="max-w-[980px] mx-auto pb-16 px-4">
                <PremiumFormHeader
                    icon={AlertTriangle}
                    title="Edit Defect Details"
                    subtitle={`Modifying ${issue?.public_id || `DEF-${id}`}`}
                    color="red"
                />

                <div className="rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-premium)' }}>

                    <SectionDivider title="Defect Identification" />

                    <div className="lg:col-span-3">
                        <FieldLabel label="Defect Name" required icon={<AlertTriangle size={11} />} />
                        <InputText {...register('bug_name')} placeholder="Brief description of the defect"
                            className={inputCls(!!errors.bug_name)}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                        <FieldError message={errors.bug_name?.message} />
                    </div>

                    <div>
                        <FieldLabel label="Project" required />
                        <Controller name="project_id" control={control} render={({ field }) => (
                            <ServerSearchDropdown
                                entityType="projects"
                                value={field.value}
                                onChange={(v) => { field.onChange(v); setValue('milestone_id', null); }}
                                placeholder="Search Projects…"
                            />
                        )} />
                        <FieldError message={errors.project_id?.message as string} />
                    </div>

                    <div>
                        <FieldLabel label="Milestone" />
                        <Controller name="milestone_id" control={control} render={({ field }) => (
                            <ServerSearchDropdown 
                                entityType="milestones" 
                                value={field.value} 
                                onChange={field.onChange} 
                                placeholder="Select Milestone"
                                disabled={!watchProjectId}
                                filters={watchProjectId ? { project_id: extractId(watchProjectId) } : {}}
                            />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Module" icon={<Layers size={11} />} />
                        <InputText {...register('module')} placeholder="e.g. Authentication, Billing…"
                            className={inputCls()} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>

                    <div />

                    <SectionDivider title="Triage" />

                    <div>
                        <FieldLabel label="Status" icon={<Tag size={11} />} />
                        <Controller name="status_ref" control={control} render={({ field }) => (
                            <ServerLookupDropdown category="IssueStatus" value={field.value} onChange={field.onChange} placeholder="Select Status" />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Severity" />
                        <Controller name="severity_ref" control={control} render={({ field }) => (
                            <ServerLookupDropdown category="IssueSeverity" value={field.value} onChange={field.onChange} placeholder="Select Severity" />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Bug Type" />
                        <div className="flex gap-3 mt-1">
                            {BUG_TYPE_OPTIONS.map(opt => (
                                <label key={opt.value} className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border transition-all text-sm font-medium select-none"
                                    style={{
                                        background: watchBugType === opt.value ? 'hsl(220 70% 50% / 0.1)' : 'var(--bg-secondary)',
                                        border: `1.5px solid ${watchBugType === opt.value ? 'hsl(220 70% 50%)' : 'var(--border-color)'}`,
                                        color: watchBugType === opt.value ? 'hsl(220 70% 45%)' : 'var(--text-primary)',
                                    }}>
                                    <Controller name={'bug_type' as any} control={control} render={({ field }) => (
                                        <RadioButton value={opt.value} onChange={() => field.onChange(opt.value)} checked={field.value === opt.value} />
                                    )} />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <FieldLabel label="Classification" />
                        <Controller name="classification" control={control} render={({ field }) => (
                            <ServerLookupDropdown category="IssueClassification" value={field.value} onChange={field.onChange} placeholder="Select Classification" />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Tags" icon={<Tag size={11} />} />
                        <InputText {...register('tags')} placeholder="e.g. login, crash, api"
                            className={inputCls()} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>

                    <div className="lg:col-span-2">
                        <FieldLabel label="Reproducible Flag" />
                        <div className="flex gap-3 mt-1">
                            {REPRO_OPTIONS.map(opt => (
                                <label key={String(opt.value)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border transition-all text-sm font-medium select-none"
                                    style={{
                                        background: watchReproducible === opt.value ? 'hsl(0 70% 55% / 0.1)' : 'var(--bg-secondary)',
                                        border: `1.5px solid ${watchReproducible === opt.value ? 'hsl(0 70% 55%)' : 'var(--border-color)'}`,
                                        color: watchReproducible === opt.value ? 'hsl(0 70% 50%)' : 'var(--text-primary)',
                                    }}>
                                    <Controller name="reproducible_flag" control={control} render={({ field }) => (
                                        <RadioButton 
                                            value={opt.value} 
                                            onChange={() => field.onChange(opt.value)} 
                                            checked={field.value === opt.value} 
                                        />
                                    )} />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <SectionDivider title="Assignment" />

                    <div>
                        <FieldLabel label="Reporter" icon={<User2 size={11} />} />
                        <Controller name="reporter_ref" control={control} render={({ field }) => (
                            <GraphUserAutocomplete value={field.value} onChange={field.onChange} placeholder="Search reporter…" />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Assignees" icon={<Users size={11} />} />
                        <GraphUserMultiSelect value={assignees} onChange={setAssignees} placeholder="Search assignees…" />
                    </div>

                    <div>
                        <FieldLabel label="Followers" />
                        <GraphUserMultiSelect value={followers} onChange={setFollowers} placeholder="Search followers…" />
                    </div>

                    <SectionDivider title="Schedule" />

                    <div>
                        <FieldLabel label="Start Date" required icon={<CalIcon size={11} />} />
                        <Controller name="start_date" control={control} render={({ field }) => (
                            <Calendar value={field.value} onChange={(e) => field.onChange(e.value)}
                                dateFormat="dd/mm/yy" showIcon showButtonBar className="w-full"
                                inputClassName="w-full rounded-xl px-3 py-2.5 text-sm" placeholder="DD/MM/YYYY" />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Target Due Date" required icon={<CalIcon size={11} />} />
                        <Controller name="end_date" control={control} render={({ field }) => (
                            <Calendar value={field.value} onChange={(e) => field.onChange(e.value)}
                                dateFormat="dd/mm/yy" showIcon showButtonBar className="w-full"
                                inputClassName="w-full rounded-xl px-3 py-2.5 text-sm" placeholder="DD/MM/YYYY"
                                minDate={watchStartDate instanceof Date ? watchStartDate : watchStartDate ? new Date(watchStartDate) : undefined} />
                        )} />
                        <FieldError message={errors.end_date?.message as string} />
                    </div>

                    <div>
                        <FieldLabel label="Estimated Hours" />
                        <InputText type="number" step="0.1" min="0" {...register('estimated_hours')}
                            placeholder="e.g. 4.5" className={inputCls()}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>

                    <div className="lg:col-span-3">
                        <FieldLabel label="Description / Steps to Reproduce" />
                        <InputTextarea {...register('description')} rows={4}
                            placeholder="Steps to reproduce, expected behavior vs actual behavior…"
                            className={inputCls()} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }} />
                    </div>

                    <div className="lg:col-span-3">
                        <FieldLabel label={`Attachments (${attachCount}/5)`} />
                        <div className="rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all"
                            style={{ border: '2px dashed var(--border-color)', background: 'var(--bg-secondary)' }}>
                            <UploadCloud size={28} style={{ color: 'hsl(0 70% 55%)' }} />
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                Drag & drop or{' '}
                                <label className="font-bold cursor-pointer" style={{ color: 'hsl(0 70% 55%)' }}>
                                    browse
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={isBusy} />
                                </label>
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PNG, JPG, GIF — max 10 MB each, 5 files</p>
                            {(existingDocs.length > 0 || files.length > 0) && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2 w-full">
                                    {existingDocs.map((doc: any) => (
                                        <div key={`doc-${doc.id}`} className="relative group rounded-xl border overflow-hidden"
                                            style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                                            <div className="w-full h-16 flex items-center justify-center">
                                                {(doc.file_type?.startsWith('image/') || doc.file_url?.match(/\.(jpeg|jpg|gif|png)$/i)) ? (
                                                    <img src={`${API_BASE}/api/v1${doc.file_url}`} alt={doc.title} className="h-full w-full object-cover" />
                                                ) : <ImageIcon size={24} style={{ color: 'var(--text-muted)' }} />}
                                            </div>
                                            <p className="text-[10px] text-center px-1 pb-1 truncate" style={{ color: 'var(--text-muted)' }}>{doc.title}</p>
                                            <button type="button" onClick={() => setExistingDocs(p => p.filter(d => d.id !== doc.id))}
                                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {files.map((f, i) => (
                                        <div key={`file-${i}`} className="relative group rounded-xl border overflow-hidden"
                                            style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                                            <div className="w-full h-16 flex items-center justify-center">
                                                {f.type.startsWith('image/') ? (
                                                    <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
                                                ) : <ImageIcon size={24} style={{ color: 'var(--text-muted)' }} />}
                                            </div>
                                            <p className="text-[10px] text-center px-1 pb-1 truncate" style={{ color: 'var(--text-muted)' }}>{f.name}</p>
                                            <button type="button" onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))}
                                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-5 mt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <Button variant="ghost" type="button" onClick={() => { if (window.history.state && window.history.state.idx > 0) navigate(-1); else navigate(`/issues/${id}`, { replace: true }); }}>Cancel</Button>
                    <Button variant="primary" type="submit" loading={isBusy} className="shadow-brand-teal-500/25">
                        {uploading ? 'Uploading…' : isBusy ? 'Saving…' : 'Save Defect'}
                    </Button>
                </div>
            </form>
        </PageLayout>
    );
}
