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

import { FieldLabel, FieldError, FormSection, PremiumFormHeader, inputCls } from '@/components/forms/ModernForm';

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

    const advance = async (fields: readonly string[]) => {
        const ok = await trigger(fields as any);
        if (ok) stepperRef.current?.nextCallback();
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
            project_manager_id: extractId((data as any).project_manager),
            delivery_head_id: extractId((data as any).delivery_head),
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

    return (
        <PageLayout title="Create New Project" showBackButton backPath="/projects">
            <div className="max-w-[920px] mx-auto pb-16 px-4">

                <PremiumFormHeader 
                    icon={FolderKanban} 
                    title="New Project" 
                    subtitle="Complete the 3-step wizard to create a fully configured project" 
                    color="emerald" 
                />

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
                                            className={classNames(inputCls(!!errors.project_name), "bg-white dark:bg-slate-900 text-slate-900 dark:text-white")}
                                        />
                                        <FieldError message={errors.project_name?.message as string} />
                                    </div>

                                    <div>
                                        <FieldLabel label="External Sync ID (Project ID)" required icon={<Hash size={12} />} />
                                        <InputText
                                            {...register('project_id_sync')}
                                            placeholder="e.g. ZHO-2025-0047"
                                            className={classNames(inputCls(!!errors.project_id_sync), "bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono")}
                                        />
                                        <FieldError message={errors.project_id_sync?.message as string} />
                                    </div>

                                    <div>
                                        <FieldLabel label="Account Name" required icon={<Building2 size={12} />} />
                                        <InputText
                                            {...register('account_name')}
                                            placeholder="e.g. Acme Corp"
                                            className={classNames(inputCls(!!errors.account_name), "bg-white dark:bg-slate-900 text-slate-900 dark:text-white")}
                                        />
                                        <FieldError message={errors.account_name?.message as string} />
                                    </div>

                                    <div>
                                        <FieldLabel label="Customer Name" required icon={<User2 size={12} />} />
                                        <InputText
                                            {...register('customer_name')}
                                            placeholder="e.g. Acme Engineering Division"
                                            className={classNames(inputCls(!!errors.customer_name), "bg-white dark:bg-slate-900 text-slate-900 dark:text-white")}
                                        />
                                        <FieldError message={errors.customer_name?.message as string} />
                                    </div>

                                    <div>
                                        <FieldLabel label="Client Name" icon={<Briefcase size={12} />} />
                                        <InputText
                                            {...register('client_name' as any)}
                                            placeholder="End client / billing entity"
                                            className={classNames(inputCls(), "bg-white dark:bg-slate-900 text-slate-900 dark:text-white")}
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
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                                pt={{ root: { className: 'dark:text-white' }, input: { className: 'dark:text-white' } }}
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
                                                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                                    )}

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
                                                    className={classNames(
                                                        "flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer border transition-all text-sm font-medium select-none",
                                                        projectType === opt.value
                                                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400"
                                                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                                    )}
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

                                    <div className="md:col-span-2">
                                        <FieldLabel label="Status & Priority" />
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
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            {...register('estimated_hours')}
                                            placeholder="0"
                                            className={classNames(inputCls(), "bg-white dark:bg-slate-900 text-slate-900 dark:text-white")}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <FieldLabel label="Description" />
                                        <InputTextarea
                                            {...register('description')}
                                            rows={3}
                                            placeholder="Brief project objective, scope, or notes…"
                                            className={classNames(inputCls(), "bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-y")}
                                        />
                                    </div>
                                </FormSection>
                            </div>

                            <StepActions>
                                <Button variant="ghost" onClick={() => navigate('/projects')}>Cancel</Button>
                                <Button
                                    variant="primary"
                                    onClick={() => advance(STEP1_FIELDS)}
                                    type="button"
                                    className="shadow-brand-teal-500/25"
                                >
                                    Next: Template <ChevronRight size={14} className="ml-1" />
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
                            </div>

                            <StepActions>
                                <Button variant="ghost" icon={<ChevronLeft size={14} />} onClick={() => stepperRef.current?.prevCallback()} type="button">
                                    Back
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => stepperRef.current?.nextCallback()}
                                    type="button"
                                    className="shadow-brand-teal-500/25"
                                >
                                    Next: Members <ChevronRight size={14} className="ml-1" />
                                </Button>
                            </StepActions>
                        </StepperPanel>

                        <StepperPanel header="Staffing & Members">
                            <div className="py-5 space-y-1">
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
                            </div>

                            <StepActions>
                                <Button variant="ghost" icon={<ChevronLeft size={14} />} onClick={() => stepperRef.current?.prevCallback()} type="button">
                                    Back
                                </Button>
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
