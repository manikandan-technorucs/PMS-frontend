
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { RadioButton } from 'primereact/radiobutton';
import { Tag } from 'primereact/tag';

import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { TextInput } from '@/components/forms/TextInput';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { FormField } from '@/components/forms/Form';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { GraphUserAutocomplete } from '../ui/GraphUserAutocomplete';
import { GraphUserMultiSelect } from '../ui/GraphUserMultiSelect';
import { useProjectActions } from '../../hooks/useProjectActions';
import { useTemplates } from '../../hooks/useTemplates';
import { projectSchema, type ProjectFormData } from '../../types/project.types';
import { FolderKanban, ChevronRight, ChevronLeft, Check, Layers } from 'lucide-react';

const extractId = (val: any): number | null =>
    val && typeof val === 'object' ? val.id ?? null : val ? Number(val) : null;

const fmtDate = (d: any): string | null =>
    d ? new Date(d).toISOString().split('T')[0] : null;

const STEP1_FIELDS = ['project_name', 'account_name', 'customer_name', 'project_id_sync'] as const;

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
        formState: { errors, isSubmitting },
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        mode: 'onChange',
        defaultValues: {
            project_name: '',
            account_name: '',
            customer_name: '',
            project_id_sync: '',
            description: '',
            client: '',
            is_template: false,
            is_archived: false,
            is_group: false,
            user_emails: [],
        },
    });

    const advance = async (fields: readonly string[]) => {
        const ok = await trigger(fields as any);
        if (ok) stepperRef.current?.nextCallback();
    };

    const onSubmit = async (data: ProjectFormData) => {
        const payload: any = {
            project_name: data.project_name.trim(),
            account_name: data.account_name.trim(),
            customer_name: data.customer_name.trim(),
            project_id_sync: data.project_id_sync.trim(),
            description: data.description || null,
            client: data.client || null,
            manager_email: (data as any).manager_email?.mail || (data as any).manager_email?.email || (data as any).manager_email || null,
            project_manager_id: extractId((data as any).project_manager),
            delivery_head_id: extractId((data as any).delivery_head),
            status_id: extractId(data.status_id),
            priority_id: extractId(data.priority_id),
            expected_start_date: fmtDate((data as any).expected_start_date),
            expected_end_date: fmtDate((data as any).expected_end_date),
            estimated_hours: data.estimated_hours ? Number(data.estimated_hours) : null,
            template_id: selectedTemplateId,
            user_emails: (data.user_emails ?? []),
        };

        await createProject.mutateAsync(payload);
        navigate('/projects');
    };

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

    return (
        <PageLayout title="Create New Project" showBackButton backPath="/projects">
            <div className="max-w-[860px] mx-auto pb-12">

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, hsl(160 60% 45%), hsl(200 70% 50%))' }}>
                        <FolderKanban size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>New Project</h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Fill in 3 quick steps — takes under 2 minutes.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stepper ref={stepperRef} linear style={{ '--p-stepper-active-color': 'hsl(160 60% 45%)' } as any}>

                        <StepperPanel header="Project Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4">

                                <FormField label="Project Name" required className="md:col-span-2">
                                    <TextInput
                                        {...register('project_name')}
                                        placeholder="e.g. Acme Platform Redesign"
                                        error={errors.project_name?.message}
                                        className="h-10"
                                    />
                                </FormField>

                                <FormField label="Account Name" required
                                    hint="CRM account identifier (from Zoho/SharePoint)">
                                    <TextInput
                                        {...register('account_name')}
                                        placeholder="e.g. Acme Corp"
                                        error={errors.account_name?.message}
                                        className="h-10"
                                    />
                                </FormField>

                                <FormField label="Customer Name" required
                                    hint="End customer / beneficiary of this project">
                                    <TextInput
                                        {...register('customer_name')}
                                        placeholder="e.g. Acme Engineering Division"
                                        error={errors.customer_name?.message}
                                        className="h-10"
                                    />
                                </FormField>

                                <FormField label="External Sync ID" required
                                    hint="Zoho / SharePoint project key — used for data sync">
                                    <TextInput
                                        {...register('project_id_sync')}
                                        placeholder="e.g. ZHO-2025-0047"
                                        error={errors.project_id_sync?.message}
                                        className="h-10 font-mono"
                                    />
                                </FormField>

                                <FormField label="Client">
                                    <TextInput {...register('client')} placeholder="Client company" className="h-10" />
                                </FormField>

                                <FormField label="Status">
                                    <Controller name="status_id" control={control} render={({ field }) => (
                                        <ServerSearchDropdown
                                            entityType="masters/statuses"
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select status"
                                            allowedValues={['Planning', 'In Progress', 'Completed', 'On Hold', 'Closed', 'Cancelled']}
                                        />
                                    )} />
                                </FormField>

                                <FormField label="Priority">
                                    <Controller name="priority_id" control={control} render={({ field }) => (
                                        <ServerSearchDropdown entityType="masters/priorities" value={field.value} onChange={field.onChange} placeholder="Select priority" />
                                    )} />
                                </FormField>

                                <FormField label="Estimated Hours">
                                    <TextInput type="number" step="0.5" min="0" {...register('estimated_hours')} className="h-10" placeholder="0" />
                                </FormField>

                                <FormField label="Start Date">
                                    <Controller name={"expected_start_date" as any} control={control} render={({ field }) => (
                                        <SharedCalendar value={field.value} onChange={field.onChange} />
                                    )} />
                                </FormField>

                                <FormField label="End Date">
                                    <Controller name={"expected_end_date" as any} control={control} render={({ field }) => (
                                        <SharedCalendar value={field.value} onChange={field.onChange} />
                                    )} />
                                </FormField>

                                <FormField label="Description" className="md:col-span-2">
                                    <TextAreaInput {...register('description')} rows={2} placeholder="Brief project description..." />
                                </FormField>
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
                            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                                Pick a template to pre-load tasks, or start blank.
                            </p>

                            {templatesLoading ? (
                                <p className="text-sm text-muted py-4">Loading templates…</p>
                            ) : (
                                <div className="flex flex-col gap-3">

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
                                <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                                    <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                                        Tasks that will be created ({selectedTemplate.tasks.length})
                                    </p>
                                    <div className="flex flex-col gap-1 max-h-40 overflow-auto">
                                        {selectedTemplate.tasks.map((t, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm py-0.5">
                                                <Check size={11} className="text-emerald-400 flex-shrink-0" />
                                                <span style={{ color: 'var(--text-primary)' }}>{t.task_name}</span>
                                                {t.estimated_hours && (
                                                    <span className="ml-auto text-xs text-muted">{t.estimated_hours}h</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                        <StepperPanel header="Members">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4">

                                <FormField label="Project Manager"
                                    hint="Will receive PM-level permissions automatically">
                                    <Controller name={"project_manager" as any} control={control} render={({ field }) => (
                                        <GraphUserAutocomplete value={field.value} onChange={field.onChange} placeholder="Search for PM…" />
                                    )} />
                                </FormField>

                                <FormField label="Delivery Head">
                                    <Controller name={"delivery_head" as any} control={control} render={({ field }) => (
                                        <GraphUserAutocomplete value={field.value} onChange={field.onChange} placeholder="Search for Delivery Head…" />
                                    )} />
                                </FormField>

                                <FormField label="Team Members" className="md:col-span-2"
                                    hint="All selected users will be added as project members">
                                    <Controller name="user_emails" control={control} render={({ field }) => (
                                        <GraphUserMultiSelect
                                            value={field.value}
                                            onChange={(users: any[]) =>
                                                field.onChange(users.map((u) => u.mail || u.email).filter(Boolean))
                                            }
                                            placeholder="Search organization users…"
                                        />
                                    )} />
                                </FormField>
                            </div>

                            <StepActions>
                                <Button variant="ghost" icon={<ChevronLeft size={14} />} onClick={() => stepperRef.current?.prevCallback()} type="button">
                                    Back
                                </Button>
                                <Button
                                    variant="gradient" type="submit"
                                    loading={isSubmitting || createProject.isPending}
                                >
                                    {isSubmitting || createProject.isPending ? 'Creating…' : 'Create Project'}
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
        <div className="flex items-center justify-between pt-6 mt-4"
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
            className="flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
            style={{
                background: selected ? 'hsl(160 60% 45% / 0.1)' : 'var(--bg-secondary)',
                border: `1.5px solid ${selected ? 'hsl(160 60% 45%)' : 'var(--border-color)'}`,
                transition: 'all 0.15s',
            }}
        >
            <RadioButton value={name} onChange={onSelect} checked={selected} className="mt-0.5" />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{name}</span>
                    {isBlank
                        ? <Tag value="Blank" severity="secondary" className="text-xs" />
                        : <Tag value={`${taskCount} tasks`} severity="info" className="text-xs" />
                    }
                </div>
                {description && (
                    <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{description}</span>
                )}
            </div>
        </label>
    );
}
