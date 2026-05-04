import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { FieldLabel, FieldError, SectionDivider, PremiumFormHeader, inputCls } from '@/components/forms/ModernForm';
import { milestonesService } from '@/features/milestones/api/milestones.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { useToast } from '@/providers/ToastContext';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Milestone as MilestoneIcon, Trash2, Tag, Calendar as CalIcon, Flag, Hash } from 'lucide-react';

const STATUS_OPTIONS = ['Active', 'Completed', 'On Hold', 'Cancelled'].map(s => ({ label: s, value: s }));
const FLAG_OPTIONS   = ['Internal', 'External'].map(f => ({ label: f, value: f }));

const milestoneSchema = z.object({
    milestone_name: z.string().trim().min(1, 'Milestone name is required'),
    description:    z.string().optional().nullable(),
    project_id:     z.any().optional(),
    status_id:      z.any().optional().nullable(),
    priority_id:    z.any().optional().nullable(),
    flags:          z.string().optional().nullable(),

    tags:           z.string().optional().nullable(),
    start_date:     z.any().optional().nullable(),
    end_date:       z.any().optional().nullable(),
}).superRefine((data, ctx) => {
    if (data.start_date && data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        if (end < start) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "End Date cannot be before Start Date",
                path: ["end_date"]
            });
        }
    }
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

const extractId = (v: any) => v && typeof v === 'object' ? v.id : v;

export function MilestoneEditView() {
    const { milestoneId } = useParams<{ milestoneId: string }>();
    const navigate        = useNavigate();
    const { showToast }   = useToast();

    const [loading, setLoading] = useState(true);
    const [publicId, setPublicId] = useState('');

    const {
        register, control, handleSubmit, reset,
        formState: { errors, isSubmitting },
    } = useForm<MilestoneFormData>({
        resolver: zodResolver(milestoneSchema),
        mode: 'onChange',
    });

    useEffect(() => {
        if (!milestoneId) return;
        (async () => {
            try {
                const ms = await milestonesService.getMilestone(Number(milestoneId));
                setPublicId(ms.public_id);
                reset({
                    milestone_name:        (ms as any).milestone_name || '',
                    description:           ms.description || '',
                    project_id:            ms.project || null,
                    status_id:             ms.status_master   || ms.status_id || null,
                    priority_id:           ms.priority_master || ms.priority_id || null,
                    flags:                 ms.flags || 'Internal',
                    tags:                  ms.tags || '',

                    start_date:            ms.start_date ? new Date(ms.start_date) : null,
                    end_date:              ms.end_date ? new Date(ms.end_date) : null,
                });
            } catch (err) {
                showToast('error', 'Error', 'Failed to load milestone data.');
            } finally {
                setLoading(false);
            }
        })();
    }, [milestoneId, reset, showToast]);

    const onSubmit = async (data: MilestoneFormData) => {
        if (!milestoneId) return;
        try {
            await milestonesService.updateMilestone(Number(milestoneId), {
                milestone_name:        data.milestone_name,
                description:           data.description || undefined,
                project_id:            extractId(data.project_id) || undefined,
                status_id:             extractId(data.status_id) || undefined,
                priority_id:           extractId(data.priority_id) || undefined,
                flags:                 data.flags || undefined,

                tags:                  data.tags || undefined,
                start_date:            data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : undefined,
                end_date:              data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : undefined,
            } as any);
            showToast('success', 'Milestone Updated', 'Changes saved successfully.');
            navigate(`/milestones/${milestoneId}`);
        } catch (err: any) {
            showToast('error', 'Error', err?.response?.data?.detail || 'Failed to update milestone.');
        }
    };

    const handleDelete = async () => {
        if (!milestoneId) return;
        try {
            await milestonesService.deleteMilestone(Number(milestoneId));
            showToast('success', 'Milestone Deleted', 'The milestone was removed.');
            navigate('/milestones');
        } catch {
            showToast('error', 'Error', 'Failed to delete milestone.');
        }
    };

    if (loading) return <PageSpinner fullPage label="Loading milestone…" />;

    return (
        <PageLayout
            title="Edit Milestone"
            showBackButton backPath={`/milestones/${milestoneId}`}
            actions={<Button variant="danger" type="button" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-[980px] mx-auto pb-16 px-4">

                <PremiumFormHeader
                    icon={MilestoneIcon}
                    title="Edit Milestone"
                    subtitle={`Modifying ${publicId}`}
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
                            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', height: '44px' }}
                        />
                        <FieldError message={errors.milestone_name?.message} />
                    </div>

                    <div>
                        <FieldLabel label="Project" />
                        <Controller name="project_id" control={control} render={({ field }) => (
                            <ServerSearchDropdown
                                entityType="projects"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select Project"
                            />
                        )} />
                    </div>

                    <SectionDivider title="Status & Classification" />

                    <div>
                        <FieldLabel label="Status" icon={<Tag size={11} />} />
                        <Controller name="status_id" control={control} render={({ field }) => (
                            <ServerSearchDropdown
                                entityType="masters/lookups/ProjectStatus"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select status…"
                            />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Priority" />
                        <Controller name="priority_id" control={control} render={({ field }) => (
                            <ServerSearchDropdown
                                entityType="masters/lookups/TaskPriority"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select priority…"
                            />
                        )} />
                    </div>


                    <div>
                        <FieldLabel label="Flag" icon={<Flag size={11} />} />
                        <Controller name="flags" control={control} render={({ field }) => (
                            <Dropdown
                                value={field.value}
                                options={FLAG_OPTIONS}
                                onChange={(e) => field.onChange(e.value)}
                                placeholder="Internal / External"
                                className="w-full rounded-xl text-[13px] font-medium border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                style={{ height: '44px', display: 'flex', alignItems: 'center' }}
                                pt={{
                                    input: { className: 'px-4' },
                                    trigger: { className: 'w-10' },
                                    item: { className: 'text-[13px] p-3' }
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
                            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', height: '44px' }}
                        />
                    </div>

                    <SectionDivider title="Schedule" />

                    <div>
                        <FieldLabel label="Start Date" icon={<CalIcon size={11} />} />
                        <Controller name="start_date" control={control} render={({ field }) => (
                            <Calendar
                                value={field.value}
                                onChange={(e) => field.onChange(e.value)}
                                dateFormat="dd/mm/yy" showIcon showButtonBar
                                className="w-full"
                                inputClassName="w-full rounded-xl px-4 text-[13px] font-medium border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                style={{ height: '44px' }}
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
                                className="w-full"
                                inputClassName={errors.end_date ? "p-invalid w-full rounded-xl px-4 text-[13px] font-medium border-red-500 bg-white dark:bg-slate-900" : "w-full rounded-xl px-4 text-[13px] font-medium border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"}
                                style={{ height: '44px' }}
                                placeholder="DD/MM/YYYY"
                            />
                        )} />
                        <FieldError message={errors.end_date?.message as string} />
                    </div>

                    <div className="lg:col-span-3">
                        <FieldLabel label="Description" />
                        <InputTextarea
                            {...register('description')}
                            rows={3}
                            placeholder="Brief milestone description…"
                            className={inputCls()}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-5 mt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <Button variant="ghost" type="button" onClick={() => navigate(`/milestones/${milestoneId}`)}>
                        Cancel
                    </Button>
                    <Button variant="gradient" type="submit" loading={isSubmitting}>
                        {isSubmitting ? 'Saving…' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </PageLayout>
    );
}
