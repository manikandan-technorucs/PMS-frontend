import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Button } from '@/shared/components/ui/Button/Button';
import { Select } from '@/shared/components/ui/Select/Select';
import { Checkbox } from '@/shared/components/ui/Checkbox/Checkbox';
import { Zap } from 'lucide-react';
import { automationRuleSchema, AutomationRuleFormData, AutomationRule } from '../types';
import { useCreateAutomationRule, useUpdateAutomationRule } from '../hooks/useAutomation';
import { useEmailTemplates } from '@/features/email_templates/hooks/useEmailTemplates';
import { FormHeader, FormField, FormCard } from '@/shared/components/ui/Form';

interface AutomationEditorProps {
    rule?: AutomationRule | null;
    onBack: () => void;
}

export function AutomationEditor({ rule, onBack }: AutomationEditorProps) {
    const createMutation = useCreateAutomationRule();
    const updateMutation = useUpdateAutomationRule();
    const { data: templates = [] } = useEmailTemplates();

    const isEditing = !!rule;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<AutomationRuleFormData>({
        resolver: zodResolver(automationRuleSchema),
        defaultValues: { trigger_event: '', template_id: 0, is_active: true }
    });

    useEffect(() => {
        if (rule) {
            reset({ trigger_event: rule.trigger_event, template_id: rule.template_id, is_active: rule.is_active });
        } else {
            reset({ trigger_event: '', template_id: 0, is_active: true });
        }
    }, [rule, reset]);

    const onSubmit = (data: any) => {
        const validData: AutomationRuleFormData = { ...data, template_id: Number(data.template_id) };
        if (isEditing && rule) {
            updateMutation.mutate({ id: rule.id, data: validData }, { onSuccess: onBack });
        } else {
            createMutation.mutate(validData, { onSuccess: onBack });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    const TRIGGER_EVENTS = [
        { value: 'PROJECT_CREATED', label: 'When a new project is created' },
        { value: 'PROJECT_USER_ASSIGNED', label: 'When a user is assigned to a project' },
        { value: 'TASK_ASSIGNED', label: 'When a task is assigned to a user' },
        { value: 'ISSUE_CREATED', label: 'When a new issue/bug is created' },
        { value: 'TEAM_ASSIGNED', label: 'When a user is assigned to a team' },
        { value: 'TIMESHEET_APPROVED', label: 'When a timesheet is approved' },
    ];

    return (
        <PageLayout title={isEditing ? "Edit Automation Rule" : "Create Automation Rule"} showBackButton onBack={onBack}>
            <form id="automation-form" onSubmit={handleSubmit(onSubmit)} className="max-w-[1200px] mx-auto">
                <FormHeader icon={Zap} title={isEditing ? "Edit Automation Rule" : "New Automation Rule"} subtitle="Configure when and how automation triggers" color="amber" />

                <FormCard columns={3} footer={{ onCancel: onBack, submitLabel: isEditing ? 'Update Rule' : 'Create Rule', submittingLabel: 'Saving...', isSubmitting: isPending }}>
                    <FormField label="Trigger Event" required>
                        <Select error={errors.trigger_event?.message as string} {...register('trigger_event')}>
                            <option value="">Select a trigger event...</option>
                            {TRIGGER_EVENTS.map(evt => (
                                <option key={evt.value} value={evt.value}>{evt.label}</option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Email Template To Send" required className="md:col-span-2">
                        <Select error={errors.template_id?.message as string} {...register('template_id', { valueAsNumber: true })}>
                            <option value={0}>Select an email template...</option>
                            {templates.map(tpl => (
                                <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                            ))}
                        </Select>
                    </FormField>

                    <div className="md:col-span-2 lg:col-span-3 flex items-center gap-3 pt-2">
                        <input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300" />
                        <label htmlFor="is_active" className="text-[14px] font-medium text-slate-700 dark:text-gray-300 cursor-pointer">
                            Rule is Active
                        </label>
                    </div>
                </FormCard>
            </form>
        </PageLayout>
    );
}
