import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { classNames } from 'primereact/utils';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { FilteredStatusSelect } from '@/components/core/FilteredStatusSelect';
import { GraphUserAutocomplete } from '@/features/projects/components/ui/GraphUserAutocomplete';
import { GraphUserMultiSelect } from '@/features/projects/components/ui/GraphUserMultiSelect';
import { useIssueActions } from '../../hooks/useIssueActions';
import { documentsService } from '@/features/documents/api/documents.api';
import { useToast } from '@/providers/ToastContext';
import { useAuth } from '@/auth/AuthProvider';
import { AlertTriangle, ImageIcon, UploadCloud, X, AlertCircle, Tag, User2, Users, Calendar as CalIcon, Layers } from 'lucide-react';

const CLASSIFICATIONS = [
    'None', 'Security', 'Crash/Hang', 'Data Loss', 'Performance',
    'UI/UX Usability', 'Other Bugs', 'Feature (New)', 'Enhancement',
] as const;

const SEVERITY_OPTIONS = [
    { label: 'Critical', value: 'Critical', color: '#ef4444' },
    { label: 'High', value: 'High', color: '#f97316' },
    { label: 'Medium', value: 'Medium', color: '#eab308' },
    { label: 'Low', value: 'Low', color: '#22c55e' },
];

const REPRO_OPTIONS = [
    { label: 'Yes — Reproducible', value: true },
    { label: 'No — Intermittent', value: false },
];

const issueSchema = z.object({
    bug_name: z.string().trim().min(3, 'Minimum 3 characters required').max(200),
    description: z.string().trim().optional(),
    project_id: z.any().optional(),
    reporter_email: z.any().optional(),
    status: z.string().optional(),
    severity: z.string().optional(),
    classification: z.enum(CLASSIFICATIONS),
    module: z.string().trim().optional(),
    tags: z.string().trim().optional(),
    estimated_hours: z.string().optional(),
    start_date: z.any().optional(),
    due_date: z.any().optional(),
    reproducible_flag: z.boolean().optional(),
    associated_team_id: z.any().optional(),
});

type IssueFormValues = z.infer<typeof issueSchema>;

function FieldLabel({ label, required, icon }: { label: string; required?: boolean; icon?: React.ReactNode }) {
    return (
        <label className="flex items-center gap-1.5 text-[11px] font-bold mb-1.5 tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            {icon && <span className="opacity-60">{icon}</span>}
            {label}
            {required && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase"
                    style={{ background: 'hsl(0 85% 60% / 0.12)', color: 'hsl(0 75% 55%)' }}>
                    Required
                </span>
            )}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <div className="flex items-center gap-1 mt-1 text-[11px] font-medium" style={{ color: 'hsl(0 75% 55%)' }}>
            <AlertCircle size={10} />{message}
        </div>
    );
}

const inputCls = (hasError?: boolean) => classNames(
    'w-full rounded-xl px-3 py-2.5 text-sm transition-all outline-none focus:ring-2',
    hasError
        ? 'border border-red-400 focus:ring-red-200'
        : 'border border-[var(--border-color)] focus:ring-[hsl(0_75%_60%_/_0.15)] focus:border-[hsl(0_70%_60%)]',
);

function SectionDivider({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-2 col-span-full my-1">
            <div className="h-px flex-1" style={{ background: 'var(--border-color)' }} />
            <span className="text-[10px] font-bold tracking-widest uppercase px-2" style={{ color: 'var(--text-muted)' }}>{title}</span>
            <div className="h-px flex-1" style={{ background: 'var(--border-color)' }} />
        </div>
    );
}

const extractId = (v: any) => v && typeof v === 'object' ? v.id : v;
const toDate = (v: any) => v ? (v instanceof Date ? v.toISOString().split('T')[0] : v) : null;

export function IssueCreateView() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { createIssue } = useIssueActions();
    const [assignees, setAssignees] = useState<any[]>([]);
    const [followers, setFollowers] = useState<any[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const { control, register, handleSubmit, watch, formState: { errors, isValid } } =
        useForm<IssueFormValues>({
            resolver: zodResolver(issueSchema),
            mode: 'onChange',
            defaultValues: {
                bug_name: '',
                description: '',
                classification: 'None',
                module: '',
                tags: '',
                estimated_hours: '',
                reproducible_flag: true,
                reporter_email: user ? { mail: user.email, displayName: `${user.first_name} ${user.last_name}`.trim() } : undefined
            },
        });

    const watchReproducible = watch('reproducible_flag');

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
                bug_name: data.bug_name,
                description: data.description || null,
                project_id: pid ?? null,
                associated_team_id: extractId(data.associated_team_id) ?? null,
                reporter_email: (data.reporter_email as any)?.mail || (data.reporter_email as any)?.email || null,
                follower_emails: followers.map((f: any) => f.mail || f.email).filter(Boolean),
                assignee_emails: assignees.map((a: any) => a.mail || a.email).filter(Boolean),
                status: data.status || null,
                severity: data.severity || null,
                classification: data.classification,
                module: data.module || null,
                tags: data.tags || null,
                estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
                start_date: toDate(data.start_date),
                due_date: toDate(data.due_date),
                reproducible_flag: data.reproducible_flag ?? true,
                document_ids: docIds,
            });
            navigate('/issues');
        } catch (err: any) {
            showToast('error', 'Error', err?.response?.data?.detail || 'Failed to create bug.');
        } finally { setUploading(false); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const sel = Array.from(e.target.files);
        if (files.length + sel.length > 5) { showToast('error', 'Limit', 'Max 5 attachments.'); return; }
        setFiles(p => [...p, ...sel]);
    };

    const isBusy = createIssue.isPending || uploading;

    return (
        <PageLayout title="Report Bug / Issue" showBackButton backPath="/issues">
            <form onSubmit={handleSubmit(onSubmit as any)} className="max-w-[980px] mx-auto pb-16 px-4">

                <div className="flex items-center gap-4 mb-8 p-5 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, hsl(0 70% 55% / 0.08), hsl(30 90% 55% / 0.05))',
                    border: '1px solid hsl(0 70% 55% / 0.2)'
                }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, hsl(0 70% 55%), hsl(20 85% 55%))' }}>
                        <AlertTriangle size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Report Bug / Issue</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Provide detailed information so the team can reproduce and fix this issue</p>
                    </div>
                </div>

                <div className="rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-premium)' }}>

                    <SectionDivider title="Bug Identification" />

                    <div className="lg:col-span-3">
                        <FieldLabel label="Bug Name" required icon={<AlertTriangle size={11} />} />
                        <InputText {...register('bug_name')} placeholder="Brief description of the bug"
                            className={inputCls(!!errors.bug_name)}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                        <FieldError message={errors.bug_name?.message} />
                    </div>

                    <div>
                        <FieldLabel label="Project" />
                        <Controller name="project_id" control={control} render={({ field }) => (
                            <ServerSearchDropdown entityType="projects" value={field.value} onChange={field.onChange} placeholder="Select Project" />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Associated Team" />
                        <Controller name="associated_team_id" control={control} render={({ field }) => (
                            <ServerSearchDropdown entityType="teams" value={field.value} onChange={field.onChange} placeholder="Select Team" />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Module" icon={<Layers size={11} />} />
                        <InputText {...register('module')} placeholder="e.g. Authentication, Billing…"
                            className={inputCls()} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>

                    <SectionDivider title="Triage" />

                    <div>
                        <FieldLabel label="Status" icon={<Tag size={11} />} />
                        <Controller name="status" control={control} render={({ field }) => (
                            <FilteredStatusSelect module="issues" value={field.value} onChange={field.onChange} />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Severity" />
                        <Controller name="severity" control={control} render={({ field }) => (
                            <Dropdown value={field.value} options={SEVERITY_OPTIONS} onChange={(e) => field.onChange(e.value)}
                                placeholder="Select Severity"
                                itemTemplate={(opt) => (
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ background: opt.color }} />
                                        {opt.label}
                                    </div>
                                )}
                                className="w-full"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                            />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Classification" />
                        <Controller name="classification" control={control} render={({ field }) => (
                            <Dropdown value={field.value} options={CLASSIFICATIONS.map(c => ({ label: c, value: c }))}
                                onChange={(e) => field.onChange(e.value)} placeholder="Select Classification"
                                className="w-full"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                            />
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
                                        <RadioButton value={opt.value} onChange={() => field.onChange(opt.value)} checked={field.value === opt.value} />
                                    )} />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <SectionDivider title="Assignment" />

                    <div>
                        <FieldLabel label="Reporter" icon={<User2 size={11} />} />
                        <Controller name="reporter_email" control={control} render={({ field }) => (
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
                        <FieldLabel label="Start Date" icon={<CalIcon size={11} />} />
                        <Controller name="start_date" control={control} render={({ field }) => (
                            <Calendar value={field.value} onChange={(e) => field.onChange(e.value)}
                                dateFormat="dd/mm/yy" showIcon showButtonBar className="w-full"
                                inputClassName="w-full rounded-xl px-3 py-2.5 text-sm" placeholder="DD/MM/YYYY" />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Due Date" icon={<CalIcon size={11} />} />
                        <Controller name="due_date" control={control} render={({ field }) => (
                            <Calendar value={field.value} onChange={(e) => field.onChange(e.value)}
                                dateFormat="dd/mm/yy" showIcon showButtonBar className="w-full"
                                inputClassName="w-full rounded-xl px-3 py-2.5 text-sm" placeholder="DD/MM/YYYY" />
                        )} />
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
                        <FieldLabel label={`Attachments (${files.length}/5)`} />
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
                            {files.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2 w-full">
                                    {files.map((f, i) => (
                                        <div key={i} className="relative group rounded-xl border overflow-hidden"
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
                    <Button variant="ghost" type="button" onClick={() => navigate('/issues')}>Cancel</Button>
                    <Button variant="gradient" type="submit" loading={isBusy}
                        style={{ background: 'linear-gradient(135deg, hsl(0 70% 55%), hsl(20 85% 55%))' }}>
                        {uploading ? 'Uploading…' : isBusy ? 'Saving…' : 'Report Bug'}
                    </Button>
                </div>
            </form>
        </PageLayout>
    );
}
