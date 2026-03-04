/**
 * Global TypeScript Interfaces
 */

export interface BaseEntity {
    id: number;
    public_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface User extends BaseEntity {
    first_name: string;
    last_name: string;
    email: string;
    role_id?: number;
}

export interface Project extends BaseEntity {
    name: string;
    description?: string;
    client: string;
    start_date?: string;
    end_date?: string;
    estimated_hours?: number;
    manager_id?: number;
    status_id?: number;
    priority_id?: number;
}

export interface Task extends BaseEntity {
    title: string;
    description?: string;
    project_id: number;
    assignee_id?: number;
    status_id?: number;
    priority_id?: number;
    start_date?: string;
    due_date?: string;
    estimated_hours?: number;
}

export interface Milestone extends BaseEntity {
    name: string;
    project_id: number;
    start_date?: string;
    end_date?: string;
    status_id?: number;
}
