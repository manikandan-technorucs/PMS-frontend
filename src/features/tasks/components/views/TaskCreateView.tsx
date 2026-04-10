import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/providers/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useTaskActions } from '@/features/tasks/hooks/useTaskActions';
import { useTaskListActions } from '@/features/tasklists/hooks/useTaskListActions';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { FilteredStatusSelect } from '@/components/core/FilteredStatusSelect';
import { GraphUserMultiSelect } from '@/features/projects/components/ui/GraphUserMultiSelect';
import { GraphUserAutocomplete } from '@/features/projects/components/ui/GraphUserAutocomplete';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { classNames } from 'primereact/utils';
import {
    ClipboardList, Plus, AlertCircle, Hash, User2, Users,
    Calendar as CalIcon, Briefcase, Tag, Timer, ChevronDown
} from 'lucide-react';

const BILLING_TYPES = [
    { label: 'Billable', value: 'Billable', icon: '💰' },
    { label: 'Non-Billable', value: 'Non-Billable', icon: '🔒' },
    { label: 'Internal', value: 'Internal', icon: '🏢' },
];

const PRIORITY_OPTIONS = [
    { label: 'Critical', value: 'Critical', color: '#ef4444' },
    { label: 'High', value: 'High', color: '#f97316' },
    { label: 'Medium', value: 'Medium', color: '#eab308' },
    { label: 'Low', value: 'Low', color: '#22c55e' },
];

const taskSchema = z.object({
    task_name: z.string().min(1, 'Task name is required'),
    project_id: z.any().optional(),
    task_list_id: z.any().optional(),
    associated_team_id: z.any().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    owner: z.any().optional(),
    assignees: z.array(z.any()).optional(),
    owners: z.array(z.any()).optional(),
    tags: z.string().optional(),
    start_date: z.any().optional(),
    due_date: z.any().optional(),
    duration: z.any().optional(),
    estimated_hours: z.any().optional(),
    work_hours: z.any().optional(),
    billing_type: z.string().optional(),
    completion_percentage: z.any().optional(),
    description: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

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
        : 'border border-[var(--border-color)] focus:ring-[hsl(160_60%_45%_/_0.2)] focus:border-[hsl(160_60%_45%)]',
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

export function TaskCreateView() {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { createTask } = useTaskActions();
    const { createTaskList: addTaskList } = useTaskListActions();
    const [newTaskListName, setNewTaskListName] = useState('');
    const [showTaskListInput, setShowTaskListInput] = useState(false);
    const [creatingTaskList, setCreatingTaskList] = useState(false);

    const { control, handleSubmit, watch, setValue, register, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            task_name: '',
            billing_type: 'Billable',
            assignees: [],
            owners: [],
            completion_percentage: 0,
            start_date: new Date(),
        }
    });

    const watchProjectId = watch('project_id');
    const watchBilling = watch('billing_type');

    const extractId = (val: any) => val && typeof val === 'object' ? val.id : val;

    const handleCreateTaskList = async () => {
        if (!newTaskListName.trim() || !watchProjectId) return;
        setCreatingTaskList(true);
        try {
            const result = await addTaskList.mutateAsync({ name: newTaskListName.trim(), project_id: extractId(watchProjectId) });
            setValue('task_list_id', result.id);
            setNewTaskListName('');
            setShowTaskListInput(false);
        } catch (err) {
        } finally {
            setCreatingTaskList(false);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            const payload = {
                task_name:            data.task_name,
                description:          data.description,
                project_id:           extractId(data.project_id),
                task_list_id:         extractId(data.task_list_id),
                associated_team_id:   extractId(data.associated_team_id),
                status:               data.status || null,
                priority:             data.priority || null,
                owner_emails:         (data.owners || []).map((o: any) => o.mail || o.email).filter(Boolean),
                assignee_emails:      (data.assignees || []).map((a: any) => a.mail || a.email).filter(Boolean),
                tags:                 data.tags || null,
                estimated_hours:      data.estimated_hours ? parseFloat(data.estimated_hours) : null,
                work_hours:           data.work_hours ? parseFloat(data.work_hours) : null,
                start_date:           data.start_date instanceof Date ? data.start_date.toISOString().split('T')[0] : data.start_date || null,
                due_date:             data.due_date instanceof Date ? data.due_date.toISOString().split('T')[0] : data.due_date || null,
                billing_type:         data.billing_type || 'Billable',
                completion_percentage: parseInt(data.completion_percentage) || 0,
            };
            await createTask.mutateAsync(payload);
            showToast('success', 'Task Created', 'The task has been created successfully.');
            navigate('/tasks');
        } catch (err: any) {
            showToast('error', 'Creation Failed', err?.response?.data?.detail || 'An error occurred.');
        }
    };

    return (
        <PageLayout title="Create New Task" showBackButton backPath="/tasks">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-[980px] mx-auto pb-16 px-4">

                <div className="flex items-center gap-4 mb-8 p-5 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, hsl(220 70% 50% / 0.08), hsl(200 70% 50% / 0.05))',
                    border: '1px solid hsl(220 70% 50% / 0.2)'
                }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, hsl(220 70% 50%), hsl(200 70% 55%))' }}>
                        <ClipboardList size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>New Task</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Fill in task details, assign members, and set deadlines</p>
                    </div>
                </div>

                <div className="rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-premium)' }}>

                    <SectionDivider title="Core Information" />

                    <div className="lg:col-span-3">
                        <FieldLabel label="Task Name" required icon={<ClipboardList size={11} />} />
                        <InputText
                            {...register('task_name')}
                            placeholder="e.g. Implement login API"
                            className={inputCls(!!errors.task_name)}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        />
                        <FieldError message={errors.task_name?.message} />
                    </div>

                    <div>
                        <FieldLabel label="Project" icon={<Briefcase size={11} />} />
                        <Controller name="project_id" control={control} render={({ field }) => (
                            <ServerSearchDropdown entityType="projects" value={field.value}
                                onChange={(v) => { field.onChange(v); setValue('task_list_id', null); }}
                                placeholder="Select Project" />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Task List" />
                        {showTaskListInput ? (
                            <div className="flex gap-2">
                                <InputText value={newTaskListName}
                                    onChange={(e) => setNewTaskListName(e.target.value)}
                                    placeholder="New task list name…"
                                    className={inputCls()}
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    autoFocus
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTaskList(); } }}
                                />
                                <button type="button" onClick={handleCreateTaskList} disabled={creatingTaskList}
                                    className="px-3 text-xs rounded-xl font-bold"
                                    style={{ background: 'hsl(160 60% 45%)', color: '#fff' }}>
                                    Save
                                </button>
                                <button type="button" onClick={() => setShowTaskListInput(false)}
                                    className="px-3 text-xs rounded-xl border font-bold" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Controller name="task_list_id" control={control} render={({ field }) => (
                                        <ServerSearchDropdown entityType="tasklists" value={field.value} onChange={field.onChange}
                                            placeholder="Select Task List" disabled={!watchProjectId}
                                            filters={watchProjectId ? { project_id: extractId(watchProjectId) } : {}} />
                                    )} />
                                </div>
                                <button type="button" disabled={!watchProjectId} onClick={() => setShowTaskListInput(true)}
                                    className="flex items-center gap-1 px-3 text-xs rounded-xl border font-bold disabled:opacity-40"
                                    style={{ borderColor: 'hsl(160 60% 45%)', color: 'hsl(160 60% 45%)' }}>
                                    <Plus size={11} /> New
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <FieldLabel label="Associated Team" />
                        <Controller name="associated_team_id" control={control} render={({ field }) => (
                            <ServerSearchDropdown entityType="teams" value={field.value} onChange={field.onChange} placeholder="Select Team" />
                        )} />
                    </div>

                    <SectionDivider title="Status & Priority" />

                    <div>
                        <FieldLabel label="Status" icon={<Tag size={11} />} />
                        <Controller name="status" control={control} render={({ field }) => (
                            <FilteredStatusSelect module="tasks" value={field.value} onChange={field.onChange} />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Priority" />
                        <Controller name="priority" control={control} render={({ field }) => (
                            <Dropdown value={field.value} options={PRIORITY_OPTIONS} onChange={(e) => field.onChange(e.value)}
                                placeholder="Select Priority" className="w-full"
                                itemTemplate={(opt) => (
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: opt.color }} />
                                        {opt.label}
                                    </div>
                                )}
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                            />
                        )} />
                    </div>

                    <div>
                        <FieldLabel label="Tags" icon={<Tag size={11} />} />
                        <InputText {...register('tags')} placeholder="e.g. api, frontend, urgent"
                            className={inputCls()} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>

                    <SectionDivider title="Assignees" />

                    <div>
                        <FieldLabel label="Owners" icon={<User2 size={11} />} />
                        <Controller name="owners" control={control} render={({ field }) => (
                            <GraphUserMultiSelect value={field.value} onChange={field.onChange} placeholder="Search owners…" />
                        )} />
                    </div>

                    <div className="lg:col-span-2">
                        <FieldLabel label="Assignees" icon={<Users size={11} />} />
                        <Controller name="assignees" control={control} render={({ field }) => (
                            <GraphUserMultiSelect value={field.value} onChange={field.onChange} placeholder="Search assignees…" />
                        )} />
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
                        <FieldLabel label="Duration (days)" />
                        <InputText type="number" min="0" {...register('duration')}
                            placeholder="Auto-calc from dates"
                            className={inputCls()} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>

                    <SectionDivider title="Hours & Billing" />

                    <div>
                        <FieldLabel label="Work Hours (Planned)" icon={<Timer size={11} />} />
                        <InputText type="number" step="0.5" min="0" {...register('estimated_hours')}
                            placeholder="e.g. 40" className={inputCls()}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>

                    <div>
                        <FieldLabel label="Actual Work Hours" icon={<Timer size={11} />} />
                        <InputText type="number" step="0.5" min="0" {...register('work_hours')}
                            placeholder="e.g. 32.5" className={inputCls()}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>

                    <div>
                        <FieldLabel label="Completion %" />
                        <InputText type="number" min="0" max="100" {...register('completion_percentage')}
                            placeholder="0–100" className={inputCls()}
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </div>

                    <div className="lg:col-span-3">
                        <FieldLabel label="Billing Type" />
                        <div className="flex gap-3 flex-wrap mt-1">
                            {BILLING_TYPES.map(opt => (
                                <label key={opt.value} className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer border transition-all text-sm font-medium select-none"
                                    style={{
                                        background: watchBilling === opt.value ? 'hsl(160 60% 45% / 0.12)' : 'var(--bg-secondary)',
                                        border: `1.5px solid ${watchBilling === opt.value ? 'hsl(160 60% 45%)' : 'var(--border-color)'}`,
                                        color: watchBilling === opt.value ? 'hsl(160 60% 40%)' : 'var(--text-primary)',
                                    }}>
                                    <Controller name="billing_type" control={control} render={({ field }) => (
                                        <RadioButton value={opt.value} onChange={() => field.onChange(opt.value)} checked={field.value === opt.value} />
                                    )} />
                                    {opt.icon} {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <FieldLabel label="Description" />
                        <InputTextarea {...register('description')} rows={3}
                            placeholder="Detailed description, acceptance criteria, or notes…"
                            className={inputCls()} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }} />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-5 mt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <Button variant="ghost" type="button" onClick={() => navigate('/tasks')}>Cancel</Button>
                    <Button variant="gradient" type="submit" loading={createTask.isPending || isSubmitting}>
                        {createTask.isPending ? 'Creating…' : 'Create Task'}
                    </Button>
                </div>
            </form>
        </PageLayout>
    );
}
