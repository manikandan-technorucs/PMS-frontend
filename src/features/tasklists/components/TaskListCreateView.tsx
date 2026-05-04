import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { FieldLabel, FieldError, SectionDivider, PremiumFormHeader, inputCls } from '@/components/forms/ModernForm';
import { tasklistsService } from '@/api/services/tasklists.service';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { useToast } from '@/providers/ToastContext';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Layers, FolderKanban } from 'lucide-react';

const schema = z.object({
    name: z.string().trim().min(1, 'Task list name is required'),
    description: z.string().optional(),
    project_id: z.any().refine((v) => !!v, { message: 'Project is required' }),
});

type FormData = z.infer<typeof schema>;

const extractId = (v: any) => (v && typeof v === 'object' ? v.id : v);

export function TaskListCreateView() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const {
        register, control, handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: { name: '', description: '' },
    });

    const onSubmit = async (data: FormData) => {
        try {
            await tasklistsService.createTaskList({
                name: data.name,
                description: data.description || undefined,
                project_id: extractId(data.project_id),
            });
            showToast('success', 'Task List Created', `"${data.name}" was created successfully.`);
            navigate('/tasklists');
        } catch (err: any) {
            showToast('error', 'Error', err?.response?.data?.detail || 'Failed to create task list.');
        }
    };

    return (
        <PageLayout title="Create Task List" showBackButton backPath="/tasklists">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-[760px] mx-auto pb-16 px-4">

                <PremiumFormHeader
                    icon={Layers}
                    title="New Task List"
                    subtitle="Organise tasks within a project under a named list"
                    color="teal"
                />

                <div
                    className="rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-premium)' }}
                >
                    <SectionDivider title="List Details" />

                    <div className="md:col-span-2">
                        <FieldLabel label="Task List Name" required icon={<Layers size={11} />} />
                        <InputText
                            {...register('name')}
                            placeholder="e.g. First Release, Sprint 1, Design Phase"
                            className={inputCls(!!errors.name)}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', height: '44px' }}
                        />
                        <FieldError message={errors.name?.message} />
                    </div>

                    <div>
                        <FieldLabel label="Project" required icon={<FolderKanban size={11} />} />
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
                    <div className="md:col-span-2">
                        <FieldLabel label="Description" />
                        <InputTextarea
                            {...register('description')}
                            rows={3}
                            placeholder="Optional description for this task list…"
                            className={inputCls()}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-5 mt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <Button variant="ghost" type="button" onClick={() => navigate('/tasklists')}>Cancel</Button>
                    <Button variant="gradient" type="submit" loading={isSubmitting}>
                        {isSubmitting ? 'Creating…' : 'Create Task List'}
                    </Button>
                </div>
            </form>
        </PageLayout>
    );
}
