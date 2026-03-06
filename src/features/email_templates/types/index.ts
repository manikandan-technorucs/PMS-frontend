import { z } from 'zod';

export const emailTemplateSchema = z.object({
    name: z.string().min(1, "Template name is required").max(255),
    subject: z.string().min(1, "Subject line is required").max(255),
    body_html: z.string().min(1, "HTML body is required"),
    body_text: z.string().optional(),
    variables_schema: z.array(z.string()).optional(),
    is_active: z.boolean().default(true),
});

export type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;

export interface EmailTemplate extends EmailTemplateFormData {
    id: number;
    tenant_id?: string;
    version: number;
    created_at: string;
    updated_at?: string;
    usageCount?: number; // UI only
}
