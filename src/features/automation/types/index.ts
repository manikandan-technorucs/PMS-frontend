import { z } from 'zod';
import { EmailTemplate } from '../../email_templates/types';

export const automationRuleSchema = z.object({
    trigger_event: z.string().min(1, "Trigger event is required").max(100),
    conditions_json: z.record(z.string(), z.any()).optional().nullable(),
    template_id: z.number().min(1, "Template is required"),
    is_active: z.boolean().default(true),
});

export type AutomationRuleFormData = z.infer<typeof automationRuleSchema>;

export interface AutomationRule extends AutomationRuleFormData {
    id: number;
    tenant_id?: string;
    template: EmailTemplate;
    created_at: string;
    updated_at?: string;
}

export interface AutomationLog {
    id: number;
    rule_id: number;
    execution_status: "SUCCESS" | "FAILED" | "PENDING";
    error_message?: string;
    idempotency_key: string;
    triggered_at: string;
    completed_at?: string;
}
