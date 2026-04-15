import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { FieldLabel, FieldError, SectionDivider, PremiumFormHeader, inputCls } from '@/components/forms/ModernForm';
import { milestonesService } from '@/features/milestones/api/milestones.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { useToast } from '@/providers/ToastContext';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Milestone as MilestoneIcon, Tag, Calendar as CalIcon, Flag, Hash } from 'lucide-react';

const FLAG_OPTIONS = ['Internal', 'External'].map(f => ({ label: f, value: f }));

const milestoneSchema = z.object({
    milestone_name: z.string().trim().min(1, 'Milestone name is required'),
    description: z.string().optional(),
    project_id: z.any().refine((v) => !!v, { message: 'Project is required' }),
    flags: z.string().optional(),
    tags: z.string().optional(),
    owner_email: z.string().optional(),
    start_date: z.any().optional(),
    end_date: z.any().optional(),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

const extractId = (v: any) => v && typeof v === 'object' ? v.id : v;

export function MilestoneCreate() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const {
        register, control, handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<MilestoneFormData>({
        resolver: zodResolver(milestoneSchema),
        mode: 'onChange',
        defaultValues: {
            milestone_name: '',
            description: '',
            flags: 'Internal',
            tags: '',
            start_date: new Date(),
        },
    });

    const onSubmit = async (data: MilestoneFormData) => {
        try {
            await milestonesService.createMilestone({
                milestone_name: data.milestone_name,
                description: data.description || undefined,
                project_id: extractId(data.project_id),
                flags: data.flags || undefined,
                tags: data.tags || undefined,
                start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : undefined,
                end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : undefined,
            } as any);
            showToast('success', 'Milestone Created', 'The milestone was created successfully.');
            navigate('/milestones');
        } catch (err: any) {
            showToast('error', 'Error', err?.response?.data?.detail || 'Failed to create milestone.');
        }
    };

    return (
        <PageLayout title="Create New Milestone" showBackButton backPath="/milestones">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-[980px] mx-auto pb-16 px-4">

                <PremiumFormHeader
                    icon={MilestoneIcon}
                    title="New Milestone"
                    subtitle="Define a key project checkpoint with dates and ownership"
                    color="violet"
                />

                <div
                    className="rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
                >
                    <SectionDivider title="Milestone Identity" />

                    <div className="lg:col-span-2">
                        <FieldLabel label="Milestone Name" required icon={<MilestoneIcon size={11} />} />
                        <InputText
                            {...register('milestone_name')}
                            placeholder="e.g. Phase 1 Complete"
                            className={inputCls(!!errors.milestone_name)}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', height: '44px' }}
                        />
                        <FieldError message={errors.milestone_name?.message} />
                    </div>

                    <div>
                        <FieldLabel label="Project" required />
                        <Controller name="project_id" control={control} render={({ field }) => (
                            <ServerSearchDropdown
                                entityType="projects"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select Project"
                            />
                        )} />
                        <FieldError message={errors.project_id?.message as string} />
                    </div>

                    <SectionDivider title="Classification" />

                    <div>
                        <FieldLabel label="Flag" icon={<Flag size={11} />} />
                        <Controller name="flags" control={control} render={({ field }) => (
                            <Dropdown
                                value={field.value}
                                options={FLAG_OPTIONS}
                                onChange={(e) => field.onChange(e.value)}
                                placeholder="Internal / External"
                                className="w-full"
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, height: '44px' }}
                                pt={{
                                    root: { className: 'flex items-center' },
                                    input: { className: 'text-[13px] font-medium' }
                                }}
                            />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Tags" icon={<Hash size={11} />} />
                        <InputText
                            {...register('tags')}
                            placeholder="e.g. v2, release, critical"
                            className={inputCls()}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', height: '44px' }}
                        />
                    </div>

                    <div />

                    <SectionDivider title="Schedule" />

                    <div>
                        <FieldLabel label="Start Date" icon={<CalIcon size={11} />} />
                        <Controller name="start_date" control={control} render={({ field }) => (
                            <Calendar
                                value={field.value}
                                onChange={(e) => field.onChange(e.value)}
                                dateFormat="dd/mm/yy" showIcon showButtonBar
                                className="form-calendar w-full"
                                placeholder="DD/MM/YYYY"
                            />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="End Date" icon={<CalIcon size={11} />} />
                        <Controller name="end_date" control={control} render={({ field }) => (
                            <Calendar
                                value={field.value}
                                onChange={(e) => field.onChange(e.value)}
                                dateFormat="dd/mm/yy" showIcon showButtonBar
                                className="form-calendar w-full"
                                placeholder="DD/MM/YYYY"
                            />
                        )} />
                    </div>

                    <div />

                    <div className="lg:col-span-3">
                        <FieldLabel label="Description" />
                        <InputTextarea
                            {...register('description')}
                            rows={3}
                            placeholder="Brief milestone description or objective…"
                            className={inputCls()}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-5 mt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <Button variant="ghost" type="button" onClick={() => navigate('/milestones')}>Cancel</Button>
                    <Button variant="gradient" type="submit" loading={isSubmitting}>
                        {isSubmitting ? 'Creating…' : 'Create Milestone'}
                    </Button>
                </div>
            </form>
        </PageLayout>
    );
}
