import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { RadioButton } from 'primereact/radiobutton';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
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

function FieldLabel({ label, required, icon }: { label: string; required?: boolean; icon?: React.ReactNode }) {
    return (
        <label className="flex items-center gap-1.5 text-[12px] font-semibold mb-1.5 tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
            {icon && <span className="opacity-60">{icon}</span>}
            {label}
            {required && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase"
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
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium" style={{ color: 'hsl(0 75% 55%)' }}>
            <AlertCircle size={11} />
            {message}
        </div>
    );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1" style={{ background: 'var(--border-color)' }} />
                <span className="text-[11px] font-bold tracking-widest uppercase px-2" style={{ color: 'var(--text-muted)' }}>{title}</span>
                <div className="h-px flex-1" style={{ background: 'var(--border-color)' }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {children}
            </div>
        </div>
    );
}

const inputCls = (hasError?: boolean) =>
    classNames(
        'w-full rounded-xl border px-3 py-2.5 text-sm transition-all outline-none focus:ring-2',
        hasError
            ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
            : 'border-[var(--border-color)] focus:ring-[hsl(160_60%_45%_/_0.2)] focus:border-[hsl(160_60%_45%)]',
    );

export function ProjectCreateView() {
    const navigate = useNavigate();
    const stepperRef = useRef<any>(null);
    const { createProject } = useProjectActions();
    const { data: templates = [], isLoading: templatesLoading } = useTemplates();
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

    const {
        register,
        control,
        handleSubmit,
        trigger,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
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

    const advance = async (fields: readonly string[]) => {
        const ok = await trigger(fields as any);
        if (ok) stepperRef.current?.nextCallback();
    };

    const onSubmit = async (data: ProjectFormData) => {
        const payload: any = {
            project_name:        data.project_name.trim(),
            account_name:        data.account_name.trim(),
            customer_name:       data.customer_name.trim(),
            client_name:         (data as any).client_name?.trim() || null,
            project_id_sync:     data.project_id_sync.trim(),
            description:         data.description || null,
            billing_model:       (data as any).billing_model || 'T&M',
            project_type:        (data as any).project_type || 'external',
            project_status_external: (data as any).project_status_external || null,
            project_manager_id:  extractId((data as any).project_manager),
            delivery_head_id:    extractId((data as any).delivery_head),
            status:              (data as any).status || 'Planning',
            priority:            (data as any).priority || 'Medium',
            expected_start_date: fmtDate((data as any).expected_start_date),
            expected_end_date:   fmtDate((data as any).expected_end_date),
            estimated_hours:     data.estimated_hours ? Number(data.estimated_hours) : null,
            template_id:         selectedTemplateId,
            user_emails:         data.user_emails ?? [],
        };
        await createProject.mutateAsync(payload);
        navigate('/projects');
    };

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

    return (
        <PageLayout title="Create New Project" showBackButton backPath="/projects">
            <div className="max-w-[920px] mx-auto pb-16 px-4">

                <div className="flex items-center gap-4 mb-8 p-5 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, hsl(160 60% 45% / 0.08), hsl(200 70% 50% / 0.06))',
                    border: '1px solid hsl(160 60% 45% / 0.2)'
                }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, hsl(160 60% 45%), hsl(200 70% 50%))' }}>
                        <FolderKanban size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>New Project</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            Complete the 3-step wizard to create a fully configured project
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stepper ref={stepperRef} linear style={{ '--p-stepper-active-color': 'hsl(160 60% 45%)' } as any}>

                        <StepperPanel header="Project Details">
                            <div className="py-5 space-y-1">

                                <FormSection title="Identification">
                                    <div className="md:col-span-2">
                                        <FieldLabel label="Project Name" required icon={<FolderKanban size={12} />} />
                                        <InputText
                                            {...register('project_name')}
                                            placeholder="e.g. Acme Platform Redesign"
                                            className={inputCls(!!errors.project_name)}
                                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                        />
                                        <FieldError message={errors.project_name?.message} />
                                    </div>

                                    <div>
                                        <FieldLabel label="External Sync ID (Project ID)" required icon={<Hash size={12} />} />
                                        <InputText
                                            {...register('project_id_sync')}
                                            placeholder="e.g. ZHO-2025-0047"
                                            className={inputCls(!!errors.project_id_sync)}
                                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace' }}
                                        />
                                        <FieldError message={errors.project_id_sync?.message} />
                                    </div>

                                    <div>
                                        <FieldLabel label="Account Name" required icon={<Building2 size={12} />} />
                                        <InputText
                                            {...register('account_name')}
                                            placeholder="e.g. Acme Corp"
                                            className={inputCls(!!errors.account_name)}
                                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                        />
                                        <FieldError message={errors.account_name?.message} />
                                    </div>

                                    <div>
                                        <FieldLabel label="Customer Name" required icon={<User2 size={12} />} />
                                        <InputText
                                            {...register('customer_name')}
                                            placeholder="e.g. Acme Engineering Division"
                                            className={inputCls(!!errors.customer_name)}
                                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                        />
                                        <FieldError message={errors.customer_name?.message} />
                                    </div>

                                    <div>
                                        <FieldLabel label="Client Name" icon={<Briefcase size={12} />} />
                                        <InputText
                                            {...register('client_name' as any)}
                                            placeholder="End client / billing entity"
                                            className={inputCls()}
                                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
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
                                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12 }}
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
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border transition-all text-sm font-medium select-none"
                                                    style={{
                                                        background: billingModel === opt.value ? 'hsl(160 60% 45% / 0.12)' : 'var(--bg-secondary)',
                                                        border: `1.5px solid ${billingModel === opt.value ? 'hsl(160 60% 45%)' : 'var(--border-color)'}`,
                                                        color: billingModel === opt.value ? 'hsl(160 60% 40%)' : 'var(--text-primary)',
                                                    }}
                                                >
                                                    <Controller name={'billing_model' as any} control={control} render={({ field }) => (
                                                        <RadioButton
                                                            inputId={opt.value}
                                                            value={opt.value}
                                                            onChange={() => field.onChange(opt.value)}
                                                            checked={field.value === opt.value}
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
                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer border transition-all text-sm font-medium select-none"
                                                    style={{
                                                        background: projectType === opt.value ? 'hsl(200 70% 50% / 0.12)' : 'var(--bg-secondary)',
                                                        border: `1.5px solid ${projectType === opt.value ? 'hsl(200 70% 50%)' : 'var(--border-color)'}`,
                                                        color: projectType === opt.value ? 'hsl(200 70% 40%)' : 'var(--text-primary)',
                                                    }}
                                                >
                                                    <Controller name={'project_type' as any} control={control} render={({ field }) => (
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
                                </FormSection>

                                <FormSection title="Schedule & Planning">
                                    <div>
                                        <FieldLabel label="Expected Start Date" icon={<CalIcon size={12} />} />
                                        <Controller name={'expected_start_date' as any} control={control} render={({ field }) => (
                                            <Calendar
                                                value={field.value ? new Date(field.value) : null}
                                                onChange={(e) => field.onChange(e.value)}
                                                dateFormat="dd/mm/yy"
                                                showIcon
                                                showButtonBar
                                                className="w-full"
                                                inputClassName="w-full rounded-xl px-3 py-2.5 text-sm"
                                                style={{ width: '100%' }}
                                                placeholder="DD/MM/YYYY"
                                            />
                                        )} />
                                    </div>

                                    <div>
                                        <FieldLabel label="Expected End Date" icon={<CalIcon size={12} />} />
                                        <Controller name={'expected_end_date' as any} control={control} render={({ field }) => (
                                            <Calendar
                                                value={field.value ? new Date(field.value) : null}
                                                onChange={(e) => field.onChange(e.value)}
                                                dateFormat="dd/mm/yy"
                                                showIcon
                                                showButtonBar
                                                className="w-full"
                                                inputClassName="w-full rounded-xl px-3 py-2.5 text-sm"
                                                style={{ width: '100%' }}
                                                placeholder="DD/MM/YYYY"
                                            />
                                        )} />
                                    </div>

                                    <div>
                                        <FieldLabel label="Internal Status" />
                                        <Dropdown
                                            {...register('status' as any)}
                                            options={STATUS_OPTIONS}
                                            onChange={(e) => {}}
                                            defaultValue="Planning"
                                            placeholder="Planning"
                                            className="w-full"
                                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                                        />
                                    </div>

                                    <div>
                                        <FieldLabel label="Estimated Hours" />
                                        <InputText
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            {...register('estimated_hours')}
                                            placeholder="0"
                                            className={inputCls()}
                                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <FieldLabel label="Description" />
                                        <InputTextarea
                                            {...register('description')}
                                            rows={3}
                                            placeholder="Brief project objective, scope, or notes…"
                                            className={inputCls()}
                                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }}
                                        />
                                    </div>
                                </FormSection>
                            </div>

                            <StepActions>
                                <Button variant="ghost" onClick={() => navigate('/projects')}>Cancel</Button>
                                <Button
                                    variant="gradient" icon={<ChevronRight size={14} />} iconPosition="right"
                                    onClick={() => advance(STEP1_FIELDS)}
                                    type="button"
                                >
                                    Next: Template
                                </Button>
                            </StepActions>
                        </StepperPanel>

                        <StepperPanel header="Template">
                            <div className="py-5">
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
                                                    <span className="flex-1" style={{ color: 'var(--text-primary)' }}>{t.task_name}</span>
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
                            </div>

                            <StepActions>
                                <Button variant="ghost" icon={<ChevronLeft size={14} />} onClick={() => stepperRef.current?.prevCallback()} type="button">
                                    Back
                                </Button>
                                <Button
                                    variant="gradient" icon={<ChevronRight size={14} />} iconPosition="right"
                                    onClick={() => stepperRef.current?.nextCallback()}
                                    type="button"
                                >
                                    Next: Members
                                </Button>
                            </StepActions>
                        </StepperPanel>

                        <StepperPanel header="Staffing & Members">
                            <div className="py-5 space-y-1">
                                <FormSection title="Project Staffing">
                                    <div>
                                        <FieldLabel label="Project Manager" icon={<User2 size={12} />} />
                                        <Controller name={'project_manager' as any} control={control} render={({ field }) => (
                                            <GraphUserAutocomplete value={field.value} onChange={field.onChange} placeholder="Search for PM…" />
                                        )} />
                                        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                            Will receive PM-level permissions automatically
                                        </p>
                                    </div>

                                    <div>
                                        <FieldLabel label="Delivery Head" icon={<User2 size={12} />} />
                                        <Controller name={'delivery_head' as any} control={control} render={({ field }) => (
                                            <GraphUserAutocomplete value={field.value} onChange={field.onChange} placeholder="Search for Delivery Head…" />
                                        )} />
                                    </div>

                                    <div className="md:col-span-2">
                                        <FieldLabel label="Team Members" icon={<Users size={12} />} />
                                        <Controller name="user_emails" control={control} render={({ field }) => (
                                            <GraphUserMultiSelect
                                                value={field.value}
                                                onChange={(users: any[]) =>
                                                    field.onChange(users.map((u) => u.mail || u.email).filter(Boolean))
                                                }
                                                placeholder="Search organization users to add…"
                                            />
                                        )} />
                                        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                            All selected users will be added as project members
                                        </p>
                                    </div>
                                </FormSection>
                            </div>

                            <StepActions>
                                <Button variant="ghost" icon={<ChevronLeft size={14} />} onClick={() => stepperRef.current?.prevCallback()} type="button">
                                    Back
                                </Button>
                                <Button
                                    variant="gradient"
                                    type="submit"
                                    loading={isSubmitting || createProject.isPending}
                                    icon={<Check size={14} />}
                                >
                                    {isSubmitting || createProject.isPending ? 'Creating Project…' : 'Create Project'}
                                </Button>
                            </StepActions>
                        </StepperPanel>
                    </Stepper>
                </form>
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
            <RadioButton value={name} onChange={onSelect} checked={selected} className="mt-0.5 flex-shrink-0" />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</span>
                    {isBlank
                        ? <Tag value="Blank" severity="secondary" className="text-[10px]" />
                        : <Tag value={`${taskCount} tasks`} severity="info" className="text-[10px]" />
                    }
                </div>
                {description && (
                    <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</span>
                )}
            </div>
        </label>
    );
}
