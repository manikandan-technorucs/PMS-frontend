import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { ArrowLeft, Save } from 'lucide-react';
import { automationRuleSchema, AutomationRuleFormData, AutomationRule } from '../types';
import { useCreateAutomationRule, useUpdateAutomationRule } from '../hooks/useAutomation';
import { useEmailTemplates } from '@/features/email_templates/hooks/useEmailTemplates';

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
        defaultValues: {
            trigger_event: '',
            template_id: 0,
            is_active: true
        }
    });

    useEffect(() => {
        if (rule) {
            reset({
                trigger_event: rule.trigger_event,
                template_id: rule.template_id,
                is_active: rule.is_active
            });
        } else {
            reset({
                trigger_event: '',
                template_id: 0,
                is_active: true
            });
        }
    }, [rule, reset]);

    const onSubmit = (data: any) => {
        // Convert template_id to number from string
        const validData: AutomationRuleFormData = {
            ...data,
            template_id: Number(data.template_id)
        };

        if (isEditing && rule) {
            updateMutation.mutate(
                { id: rule.id, data: validData },
                { onSuccess: onBack }
            );
        } else {
            createMutation.mutate(validData, { onSuccess: onBack });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    const TRIGGER_EVENTS = [
        { value: 'PROJECT_CREATED', label: 'When a new project is created' },
        { value: 'TASK_ASSIGNED', label: 'When a task is assigned to a user' },
        { value: 'ISSUE_CREATED', label: 'When a new issue/bug is created' },
        { value: 'TEAM_ASSIGNED', label: 'When a user is assigned to a team' },
        { value: 'TIMESHEET_APPROVED', label: 'When a timesheet is approved' },
    ];

    return (
        <PageLayout
            title={isEditing ? "Edit Automation Rule" : "Create Automation Rule"}
            actions={
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button type="submit" form="automation-form" disabled={isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        {isPending ? 'Saving...' : 'Save Rule'}
                    </Button>
                </div>
            }
        >
            <Card>
                <form id="automation-form" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <Select
                                label="Trigger Event"
                                error={errors.trigger_event?.message as string}
                                {...register('trigger_event')}
                            >
                                <option value="">Select a trigger event...</option>
                                {TRIGGER_EVENTS.map(evt => (
                                    <option key={evt.value} value={evt.value}>{evt.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="md:col-span-2 space-y-1">
                            <Select
                                label="Email Template To Send"
                                error={errors.template_id?.message as string}
                                {...register('template_id', { valueAsNumber: true })}
                            >
                                <option value={0}>Select an email template...</option>
                                {templates.map(tpl => (
                                    <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2 flex items-center gap-2 mt-4">
                            <input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 rounded text-theme-primary focus:ring-theme-primary bg-theme-muted/10 border-theme-border" />
                            <label htmlFor="is_active" className="text-[14px] font-medium text-theme-primary">
                                Rule is Active
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-theme-border">
                        <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : (isEditing ? 'Update Rule' : 'Create Rule')}
                        </Button>
                    </div>
                </form>
            </Card>
        </PageLayout>
    );
}
