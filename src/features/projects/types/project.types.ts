import { z } from 'zod';

export const projectSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().nullable().optional(),
    client: z.string().min(1, 'Client is required'),
    manager_id: z.coerce.number().min(1, 'Manager is required'),
    status_id: z.coerce.number().optional(),
    priority_id: z.coerce.number().optional(),
    team_id: z.coerce.number().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    estimated_hours: z.coerce.number().optional(),
    is_template: z.boolean().default(false).optional(),
    is_archived: z.boolean().default(false).optional(),
    group_id: z.coerce.number().nullable().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export interface Project extends ProjectFormData {
    id: number;
    public_id: string;
    manager?: any;
    status?: any;
    priority?: any;
    team?: any;
    group?: any;
    users?: any[];
    milestones?: any[];
    task_lists?: any[];
}
