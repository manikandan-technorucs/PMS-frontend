import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from '@/hooks/useDebounce';
import { RadioButton } from 'primereact/radiobutton';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { GraphUserAutocomplete } from '../ui/GraphUserAutocomplete';
import { GraphUserMultiSelect } from '../ui/GraphUserMultiSelect';
import { useProjectActions } from '../../hooks/useProjectActions';
import { useTemplates } from '../../hooks/useTemplates';
import { projectSchema, type ProjectFormData } from '../../types/project.types';
import {
    FolderKanban, ChevronRight, ChevronLeft, Check, Layers,
    Hash, Building2, User2, Users, Calendar as CalIcon, Briefcase,
    Tag as TagIcon, ClipboardList, AlertCircle
} from 'lucide-react';
import { FieldLabel, FieldError, FormSection, PremiumFormHeader, inputCls } from '@/components/forms/ModernForm';

const extractId = (val: any): number | null =>
    val && typeof val === 'object' ? val.id ?? null : val ? Number(val) : null;

const fmtDate = (d: any): string | null =>
    d ? new Date(d).toISOString().split('T')[0] : null;

const STEP1_FIELDS = ['project_name', 'account_name', 'customer_name', 'project_id_sync'] as const;

const BILLING_OPTIONS = [
    { label: 'T&M', value: 'T&M', icon: '⏱' },
    { label: 'Fixed Monthly', value: 'FixedMonthly', icon: '📅' },
    { label: 'Milestone', value: 'Milestone', icon: '🎯' },
];

const PROJECT_TYPE_OPTIONS = [
    { label: 'Internal', value: 'internal' },
    { label: 'External', value: 'external' },
];

const STATUS_OPTIONS = [
    'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Closed'
].map(s => ({ label: s, value: s }));

const STEPS = ['Project Details', 'Template', 'Staffing & Members'];

function CustomStepper({ activeStep }: { activeStep: number }) {
    return (
        <div className="flex items-center mb-6 select-none">
            {STEPS.map((label, i) => {
                const done = i < activeStep;
                const active = i === activeStep;
                return (
                    <React.Fragment key={i}>
                        <div className="flex items-center gap-2 min-w-0">
                            <div className={classNames(
                                'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black flex-shrink-0 transition-all duration-300',
                                done ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' :
                                    active ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/30' :
                                        'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            )}>
                                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                            </div>
                            <span className={classNames(
                                'text-[13px] font-semibold transition-colors whitespace-nowrap',
                                active ? 'text-emerald-600 dark:text-emerald-400' :
                                    done ? 'text-slate-700 dark:text-slate-300' :
                                        'text-slate-400 dark:text-slate-500'
                            )}>{label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={classNames(
                                'flex-1 h-0.5 mx-3 rounded-full transition-all duration-500',
                                done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                            )} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

export function ProjectCreateView() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const { createProject } = useProjectActions();
    const { data: templates = [], isLoading: templatesLoading } = useTemplates();
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

    const {
        register,
        control,
        handleSubmit,
        trigger,
        watch,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<any>({
        resolver: zodResolver(projectSchema) as any,
        mode: 'onChange',
        defaultValues: {
            project_name: '',
            account_name: '',
            customer_name: '',
            client_name: '',
            project_id_sync: '',
            description: '',
            billing_model: 'T&M',
            project_type: 'external',
            is_template: false,
            is_archived: false,
            is_group: false,
            user_emails: [],
        },
    });

    const billingModel = watch('billing_model' as any);
    const projectType = watch('project_type' as any);

    const projectName = watch('project_name');
    const projectSyncId = watch('project_id_sync');
    const debouncedName = useDebounce(projectName, 500);
    const debouncedSyncId = useDebounce(projectSyncId, 500);

    useEffect(() => {
        if (debouncedName?.trim()) {
            projectsService.checkName(debouncedName.trim()).then(exists => {
                if (exists) {
                    setError('project_name', { type: 'manual', message: 'A project with this name already exists' });
                } else {
                    // Only clear manual errors to avoid clearing zod validation errors
                    if (errors.project_name?.type === 'manual') {
                        clearErrors('project_name');
                    }
                }
            }).catch(console.error);
        }
    }, [debouncedName, setError, clearErrors, errors.project_name?.type]);

    useEffect(() => {
        if (debouncedSyncId?.trim()) {
            projectsService.checkSyncId(debouncedSyncId.trim()).then(exists => {
                if (exists) {
                    setError('project_id_sync', { type: 'manual', message: 'This External Sync ID already exists' });
                } else {
                    if (errors.project_id_sync?.type === 'manual') {
                        clearErrors('project_id_sync');
                    }
                }
            }).catch(console.error);
        }
    }, [debouncedSyncId, setError, clearErrors, errors.project_id_sync?.type]);

    const advance = async (fields: readonly string[]) => {
        const ok = await trigger(fields as any);
        if (ok) {
            if (fields.includes('project_id_sync') && errors.project_id_sync) return;
            if (fields.includes('project_name') && errors.project_name) return;
            setActiveStep(s => s + 1);
        }
    };

    const onSubmit = async (data: ProjectFormData) => {
        const payload: any = {
            project_name: data.project_name.trim(),
            account_name: data.account_name.trim(),
            customer_name: data.customer_name.trim(),
            client_name: (data as any).client_name?.trim() || null,
            project_id_sync: data.project_id_sync.trim(),
            description: data.description || null,
            billing_model: (data as any).billing_model || 'T&M',
            project_type: (data as any).project_type || 'external',
            project_status_external: (data as any).project_status_external || null,
            
            ...( (extractId((data as any).project_manager) === null || isNaN(Number(extractId((data as any).project_manager))))
                ? { project_manager_email: (data as any).project_manager?.mail || null }
                : { project_manager_id: Number(extractId((data as any).project_manager)) }),

            ...( (extractId((data as any).delivery_head) === null || isNaN(Number(extractId((data as any).delivery_head))))
                ? { delivery_head_email: (data as any).delivery_head?.mail || null }
                : { delivery_head_id: Number(extractId((data as any).delivery_head)) }),

            status_id: (data as any).status_id ? (extractId((data as any).status_id) || null) : null,
            priority_id: (data as any).priority_id ? (extractId((data as any).priority_id) || null) : null,
            expected_start_date: fmtDate((data as any).expected_start_date),
            expected_end_date: fmtDate((data as any).expected_end_date),
            estimated_hours: data.estimated_hours ? Number(data.estimated_hours) : null,
            template_id: selectedTemplateId,
            user_emails: data.user_emails ?? [],
        };
        await createProject.mutateAsync(payload);
        navigate('/projects');
    };

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

    const inputStyle = { background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' };
    const calendarInputStyle = { ...inputStyle, width: '100%' };

    return (
        <PageLayout title="Create New Project" showBackButton backPath="/projects">
            <div className="max-w-[920px] mx-auto pb-16 px-4">
                <PremiumFormHeader
                    icon={FolderKanban}
                    title="New Project"
                    subtitle="Complete the 3-step wizard to create a fully configured project"
                    color="emerald"
                />

                <div className="rounded-2xl p-6 mb-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <CustomStepper activeStep={activeStep} />

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {activeStep === 0 && (
                            <div className="py-3 space-y-1">
                                <FormSection title="Identification">
                                    <div className="md:col-span-2">
                                        <FieldLabel label="Project Name" required icon={<FolderKanban size={12} />} />
                                        <InputText
                                            {...register('project_name')}
                                            placeholder="e.g. Acme Platform Redesign"
                                            className={inputCls(!!errors.project_name)}
                                            style={inputStyle}
                                        />
                                        <FieldError message={errors.project_name?.message as string} />
                                    </div>

                                    <div>
                                        <FieldLabel label="External Sync ID (Project ID)" required icon={<Hash size={12} />} />
                                        <InputText
                                            {...register('project_id_sync')}
                                            placeholder="e.g. ZHO-2025-0047"
                                            className={inputCls(!!errors.project_id_sync)}
                                            style={inputStyle}
                                        />
                                        <FieldError message={errors.project_id_sync?.message as string} />
                                    </div>

                                    <div>
                                        <FieldLabel label="Account Name" required icon={<Building2 size={12} />} />
                                        <InputText
                                            {...register('account_name')}
                                            placeholder="e.g. Acme Corp"
                                            className={inputCls(!!errors.account_name)}
                                            style={inputStyle}
                                        />
                                        <FieldError message={errors.account_name?.message as string} />
                                    </div>

                                    <div>
                                        <FieldLabel label="Customer Name" required icon={<User2 size={12} />} />
                                        <InputText
                                            {...register('customer_name')}
                                            placeholder="e.g. Acme Engineering Division"
                                            className={inputCls(!!errors.customer_name)}
                                            style={inputStyle}
                                        />
                                        <FieldError message={errors.customer_name?.message as string} />
                                    </div>

                                    <div>
                                        <FieldLabel label="Client Name" icon={<Briefcase size={12} />} />
                                        <InputText
                                            {...register('client_name' as any)}
                                            placeholder="End client / billing entity"
                                            className={inputCls()}
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <FieldLabel label="Project Status (External)" icon={<TagIcon size={12} />} />
                                        <Controller name={'project_status_external' as any} control={control} render={({ field }) => (
                                            <Dropdown
                                                value={field.value}
                                                options={STATUS_OPTIONS}
                                                onChange={(e) => field.onChange(e.value)}
                                                placeholder="Select status…"
                                                className="w-full"
                                                style={inputStyle}
                                                pt={{
                                                    root: { style: inputStyle },
                                                    input: { style: { background: 'transparent', color: 'var(--text-primary)' } },
                                                    panel: { style: { background: 'var(--bg-card)', border: '1px solid var(--border-color)' } },
                                                    item: { style: { color: 'var(--text-primary)' } },
                                                }}
                                            />
                                        )} />
                                    </div>
                                </FormSection>

                                <FormSection title="Classification">
                                    <div className="md:col-span-2">
                                        <FieldLabel label="Billing Model" required icon={<ClipboardList size={12} />} />
                                        <div className="flex gap-3 flex-wrap mt-1">
                                            {BILLING_OPTIONS.map(opt => (
                                                <label
                                                    key={opt.value}
                                                    className={classNames(
                                                        "flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border transition-all text-sm font-medium select-none",
                                                        billingModel === opt.value
                                                            ? "border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                                            : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                                    )}
                                                    style={{
                                                        background: billingModel === opt.value
                                                            ? 'hsl(152 60% 45% / 0.1)'
                                                            : 'var(--bg-secondary)',
                                                    }}
                                                >
                                                    <Controller name={'billing_model' as any} control={control} render={({ field }) => (
                                                        <RadioButton
                                                            inputId={`billing-${opt.value}`}
                                                            value={opt.value}
                                                            onChange={() => field.onChange(opt.value)}
                                                            checked={field.value === opt.value}
                                                            pt={{
                                                                box: {
                                                                    className: classNames('transition-all duration-200', {
                                                                        'bg-emerald-500 border-emerald-500': field.value === opt.value,
                                                                        'border-2': field.value !== opt.value
                                                                    }),
                                                                    style: field.value !== opt.value ? { background: 'var(--input-bg)', borderColor: 'var(--border-color)' } : {}
                                                                },
                                                                icon: { className: field.value === opt.value ? 'text-white' : 'hidden' }
                                                            }}
                                                        />
                                                    )} />
                                                    <span>{opt.icon} {opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <FieldLabel label="Project Type" required />
                                        <div className="flex gap-3 mt-1">
                                            {PROJECT_TYPE_OPTIONS.map(opt => (
                                                <label
                                                    key={opt.value}
                                                    className={classNames(
                                                        "flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer border transition-all text-sm font-medium select-none",
                                                        projectType === opt.value
                                                            ? "border-blue-500 text-blue-700 dark:text-blue-400"
                                                            : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                                    )}
                                                    style={{
                                                        background: projectType === opt.value
                                                            ? 'hsl(215 70% 50% / 0.1)'
                                                            : 'var(--bg-secondary)',
                                                    }}
                                                >
                                                    <Controller name={'project_type' as any} control={control} render={({ field }) => (
                                                        <RadioButton
                                                            inputId={`type-${opt.value}`}
                                                            value={opt.value}
                                                            onChange={() => field.onChange(opt.value)}
                                                            checked={field.value === opt.value}
                                                            pt={{
                                                                box: {
                                                                    className: classNames('transition-all duration-200', {
                                                                        'bg-blue-500 border-blue-500': field.value === opt.value,
                                                                        'border-2': field.value !== opt.value
                                                                    }),
                                                                    style: field.value !== opt.value ? { background: 'var(--input-bg)', borderColor: 'var(--border-color)' } : {}
                                                                },
                                                                icon: { className: field.value === opt.value ? 'text-white' : 'hidden' }
                                                            }}
                                                        />
                                                    )} />
                                                    {opt.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </FormSection>

                                <FormSection title="Schedule & Planning">
                                    <div>
                                        <FieldLabel label="Expected Start Date" required icon={<CalIcon size={12} />} />
                                        <Controller name={'expected_start_date' as any} control={control} render={({ field }) => (
                                            <Calendar
                                                value={field.value ? new Date(field.value) : null}
                                                onChange={(e) => field.onChange(e.value)}
                                                dateFormat="dd/mm/yy" showIcon showButtonBar
                                                className={classNames('w-full', { 'p-invalid': errors.expected_start_date })}
                                                placeholder="DD/MM/YYYY"
                                                inputStyle={calendarInputStyle}
                                                style={{ width: '100%' }}
                                            />
                                        )} />
                                        <FieldError message={errors.expected_start_date?.message as string} />
                                    </div>

                                    <div>
                                        <FieldLabel label="Expected End Date" required icon={<CalIcon size={12} />} />
                                        <Controller name={'expected_end_date' as any} control={control} render={({ field }) => (
                                            <Calendar
                                                value={field.value ? new Date(field.value) : null}
                                                onChange={(e) => field.onChange(e.value)}
                                                dateFormat="dd/mm/yy" showIcon showButtonBar
                                                className={classNames('w-full', { 'p-invalid': errors.expected_end_date })}
                                                placeholder="DD/MM/YYYY"
                                                inputStyle={calendarInputStyle}
                                                style={{ width: '100%' }}
                                            />
                                        )} />
                                        <FieldError message={errors.expected_end_date?.message as string} />
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <FieldLabel label="Status" required icon={<TagIcon size={12} />} />
                                                <Controller name="status_id" control={control} render={({ field }) => (
                                                    <ServerSearchDropdown
                                                        entityType="masters/lookups/ProjectStatus"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Select status…"
                                                        className={errors.status_id ? "p-invalid" : ""}
                                                    />
                                                )} />
                                                <FieldError message={errors.status_id?.message as string} />
                                            </div>
                                            <div>
                                                <FieldLabel label="Priority" required icon={<AlertCircle size={12} />} />
                                                <Controller name="priority_id" control={control} render={({ field }) => (
                                                    <ServerSearchDropdown
                                                        entityType="masters/lookups/TaskPriority"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Select priority…"
                                                        className={errors.priority_id ? "p-invalid" : ""}
                                                    />
                                                )} />
                                                <FieldError message={errors.priority_id?.message as string} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <FieldLabel label="Estimated Hours" />
                                        <InputText
                                            type="number" step="0.5" min="0"
                                            {...register('estimated_hours')}
                                            placeholder="0"
                                            className={inputCls()}
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <FieldLabel label="Description" />
                                        <InputTextarea
                                            {...register('description')}
                                            rows={3}
                                            placeholder="Brief project objective, scope, or notes…"
                                            className={inputCls()}
                                            style={inputStyle}
                                        />
                                    </div>
                                </FormSection>

                                <StepActions>
                                    <Button variant="ghost" onClick={() => navigate('/projects')} type="button">Cancel</Button>
                                    <Button variant="primary" onClick={() => advance(STEP1_FIELDS)} type="button" className="shadow-brand-teal-500/25">
                                        Next: Template <ChevronRight size={14} className="ml-1" />
                                    </Button>
                                </StepActions>
                            </div>
                        )}


                        {activeStep === 1 && (
                            <div className="py-3">
                                <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                                    Pick a pre-built task template to auto-populate your project, or start from scratch.
                                </p>

                                {templatesLoading ? (
                                    <div className="flex items-center gap-2 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                                        <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                        Loading templates…
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <TemplateCard
                                            selected={selectedTemplateId === null}
                                            onSelect={() => setSelectedTemplateId(null)}
                                            name="Start Blank"
                                            description="No tasks pre-loaded — build from scratch."
                                            taskCount={0}
                                            isBlank
                                        />
                                        {templates.map((tmpl) => (
                                            <TemplateCard
                                                key={tmpl.id}
                                                selected={selectedTemplateId === tmpl.id}
                                                onSelect={() => setSelectedTemplateId(tmpl.id)}
                                                name={tmpl.name}
                                                description={tmpl.description ?? ''}
                                                taskCount={tmpl.tasks.length}
                                            />
                                        ))}
                                    </div>
                                )}

                                {selectedTemplate && (
                                    <div className="mt-5 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                                            Tasks that will be created ({selectedTemplate.tasks.length})
                                        </p>
                                        <div className="flex flex-col gap-1.5 max-h-44 overflow-auto">
                                            {selectedTemplate.tasks.map((t, i) => (
                                                <div key={i} className="flex items-center gap-2.5 text-sm py-1 px-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
                                                    <Check size={11} className="text-emerald-400 flex-shrink-0" />
                                                    <span className="flex-1" style={{ color: 'var(--text-primary)' }}>{t.title}</span>
                                                    {t.estimated_hours && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                            style={{ background: 'hsl(160 60% 45% / 0.1)', color: 'hsl(160 60% 45%)' }}>
                                                            {t.estimated_hours}h
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <StepActions>
                                    <Button variant="ghost" icon={<ChevronLeft size={14} />} onClick={() => setActiveStep(s => s - 1)} type="button">Back</Button>
                                    <Button variant="primary" onClick={() => setActiveStep(s => s + 1)} type="button" className="shadow-brand-teal-500/25">
                                        Next: Members <ChevronRight size={14} className="ml-1" />
                                    </Button>
                                </StepActions>
                            </div>
                        )}


                        {activeStep === 2 && (
                            <div className="py-3 space-y-1">
                                <FormSection title="Project Staffing">
                                    <div>
                                        <FieldLabel label="Project Manager" required icon={<User2 size={12} />} />
                                        <Controller name={'project_manager' as any} control={control} render={({ field }) => (
                                            <GraphUserAutocomplete value={field.value} onChange={field.onChange} placeholder="Search for PM…" />
                                        )} />
                                        <FieldError message={errors.project_manager?.message as string} />
                                        <p className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">
                                            Will receive PM-level permissions automatically
                                        </p>
                                    </div>

                                    <div>
                                        <FieldLabel label="Delivery Head" required icon={<User2 size={12} />} />
                                        <Controller name={'delivery_head' as any} control={control} render={({ field }) => (
                                            <GraphUserAutocomplete value={field.value} onChange={field.onChange} placeholder="Search for Delivery Head…" />
                                        )} />
                                        <FieldError message={errors.delivery_head?.message as string} />
                                    </div>

                                    <div className="md:col-span-2">
                                        <FieldLabel label="Team Members" required icon={<Users size={12} />} />
                                        <Controller name="user_emails" control={control} render={({ field }) => (
                                            <GraphUserMultiSelect
                                                value={field.value as any}
                                                onChange={(users: any[]) => {
                                                    field.onChange(users.map((u) => u.mail || u.email).filter(Boolean));
                                                }}
                                                placeholder="Search organization users to add…"
                                            />
                                        )} />
                                        <FieldError message={errors.user_emails?.message as string} />
                                        <p className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">
                                            All selected users will be added as project members
                                        </p>
                                    </div>
                                </FormSection>

                                <StepActions>
                                    <Button variant="ghost" icon={<ChevronLeft size={14} />} onClick={() => setActiveStep(s => s - 1)} type="button">Back</Button>
                                    <Button
                                        variant="primary"
                                        type="button"
                                        onClick={handleSubmit(onSubmit)}
                                        loading={isSubmitting || createProject.isPending}
                                        icon={<Check size={14} />}
                                        className="shadow-brand-teal-500/25"
                                    >
                                        {isSubmitting || createProject.isPending ? 'Creating Project…' : 'Create Project'}
                                    </Button>
                                </StepActions>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </PageLayout>
    );
}

function StepActions({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between pt-5 mt-5"
            style={{ borderTop: '1px solid var(--border-color)' }}>
            {children}
        </div>
    );
}

function TemplateCard({ name, description, taskCount, selected, onSelect, isBlank }: {
    name: string; description: string; taskCount: number;
    selected: boolean; onSelect: () => void; isBlank?: boolean;
}) {
    return (
        <label
            className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all"
            style={{
                background: selected ? 'hsl(160 60% 45% / 0.08)' : 'var(--bg-secondary)',
                border: `2px solid ${selected ? 'hsl(160 60% 45%)' : 'var(--border-color)'}`,
                transform: selected ? 'translateY(-1px)' : 'none',
                boxShadow: selected ? '0 4px 16px hsl(160 60% 45% / 0.15)' : 'none',
                transition: 'all 0.15s ease',
            }}
        >
            <RadioButton value={name} onChange={onSelect} checked={selected} className="mt-0.5 flex-shrink-0" pt={{ box: { className: 'dark:bg-slate-900 dark:border-slate-600' } }} />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</span>
                    {isBlank
                        ? <Tag value="Blank" severity="secondary" className="text-[10px]" />
                        : <Tag value={`${taskCount} tasks`} severity="info" className="text-[10px]" />
                    }
                </div>
                {description && (
                    <span className="text-xs leading-relaxed" style={{ 
                        color: 'var(--text-muted)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>{description}</span>
                )}
            </div>
        </label>
    );
}
