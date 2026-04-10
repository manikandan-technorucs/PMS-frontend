import { z } from 'zod';

export const projectSchema = z.object({
    
    project_name:    z.string().min(1, 'Project name is required').max(255),
    account_name:    z.string().min(1, 'Account name is required').max(255),
    customer_name:   z.string().min(1, 'Customer name is required').max(255),
    client_name:     z.string().nullable().optional(),
    project_id_sync: z.string().min(1, 'External sync ID is required').max(100),

    billing_model:           z.string().default('T&M'),
    project_type:            z.string().default('internal'),
    project_status_external: z.string().nullable().optional(),

    description:         z.string().nullable().optional(),
    project_manager_id:  z.coerce.number().nullable().optional(),
    delivery_head_id:    z.coerce.number().nullable().optional(),
    owner_id:            z.coerce.number().nullable().optional(),
    template_id:         z.coerce.number().nullable().optional(),

    status:              z.string().optional(),
    priority:            z.string().optional(),

    expected_start_date: z.string().nullable().optional(),
    expected_end_date:   z.string().nullable().optional(),
    estimated_hours:     z.coerce.number().nullable().optional(),
    actual_start_date:   z.string().nullable().optional(),
    actual_end_date:     z.string().nullable().optional(),
    actual_hours:        z.coerce.number().nullable().optional(),

    is_template:         z.boolean().default(false),
    is_archived:         z.boolean().default(false),
    is_group:            z.boolean().default(false),

    user_emails:         z.array(z.string().email()).default([]),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export interface ProjectUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    display_name?: string | null;
}

export interface MasterItem {
    id: number;
    name: string;
    color?: string | null;
}

export interface Project extends ProjectFormData {
    id: number;
    public_id: string;

    manager?: ProjectUser | null;
    creator?: ProjectUser | null;
    owner?: ProjectUser | null;
    project_manager?: ProjectUser | null;
    delivery_head?: ProjectUser | null;
    status?: MasterItem | null;
    priority?: MasterItem | null;
    ms_teams_group_id?: string | null;
    users: ProjectUser[];

    tasks?: any[];
    issues?: any[];
    milestones?: any[];
    task_lists?: any[];
    documents?: any[];
    timelogs?: any[];
}

export const projectSyncSchema = z.object({
    project_id_sync: z.string().min(1).max(100).optional(),
    account_name:    z.string().min(1).max(255).optional(),
    customer_name:   z.string().min(1).max(255).optional(),
});

export type ProjectSyncData = z.infer<typeof projectSyncSchema>;
