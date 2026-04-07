import { api } from '@/api/client';

export interface Project {
    id: number;
    public_id: string;
    name: string;
    description: string | null;
    client: string | null;
    manager_id: number | null;
    manager_email: string | null;
    status_id: number | null;
    priority_id: number | null;
    team_id: number | null;
    start_date: string | null;
    end_date: string | null;
    estimated_hours?: number;
    group_id?: number | null;
    is_template?: boolean;
    is_archived?: boolean;
    is_group?: boolean;
    actual_hours?: number;
    actual_start_date?: string | null;
    actual_end_date?: string | null;
    manager?: any;
    status?: any;
    priority?: any;
    team?: any;
    group?: any;
    users?: any[];
    milestones?: any[];
    task_lists?: any[];
}

export const projectsService = {
    getProjects: async (skip = 0, limit = 1000): Promise<Project[]> => {
        const { data } = await api.get('/projects/', { params: { skip, limit, include_all: true } });
        return data;
    },

    getProject: async (projectId: number): Promise<Project> => {
        const { data } = await api.get(`/projects/${projectId}`);
        return data;
    },

    createProject: async (payload: any): Promise<Project> => {
        const { data } = await api.post('/projects/', payload);
        return data;
    },

    updateProject: async (projectId: number, payload: any): Promise<Project> => {
        const { data } = await api.put(`/projects/${projectId}`, payload);
        return data;
    },

    deleteProject: async (projectId: number): Promise<void> => {
        await api.delete(`/projects/${projectId}`);
    },

    assignUser: async (
        projectId: number,
        payload: { user_id: string; user_email: string; display_name?: string; role_id?: number },
    ): Promise<void> => {
        await api.post(`/projects/${projectId}/users`, { ...payload, project_id: projectId });
    },

    removeUser: async (projectId: number, userEmail: string): Promise<void> => {
        await api.delete(`/projects/${projectId}/users/${userEmail}`);
    },
};
