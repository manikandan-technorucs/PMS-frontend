import { api } from '@/shared/lib/api';

export interface Project {
    id: number;
    public_id: string;
    name: string;
    description: string | null;
    client: string | null;
    manager_id: number | null;
    status_id: number | null;
    priority_id: number | null;
    dept_id: number | null;
    team_id: number | null;
    start_date: string | null;
    end_date: string | null;
    estimated_hours?: number;
    manager?: any;
    status?: any;
    priority?: any;
    department?: any;
    team?: any;
    users?: any[];
    milestones?: any[];
    task_lists?: any[];
}

export const projectsService = {
    getProjects: async (skip: number = 0, limit: number = 100): Promise<Project[]> => {
        const response = await api.get('/projects/', { params: { skip, limit } });
        return response.data;
    },

    getProject: async (projectId: number): Promise<Project> => {
        const response = await api.get(`/projects/${projectId}`);
        return response.data;
    },

    createProject: async (projectData: any): Promise<Project> => {
        const response = await api.post('/projects/', projectData);
        return response.data;
    },

    updateProject: async (projectId: number, projectData: any): Promise<Project> => {
        const response = await api.put(`/projects/${projectId}`, projectData);
        return response.data;
    },

    deleteProject: async (projectId: number): Promise<void> => {
        await api.delete(`/projects/${projectId}`);
    },

    assignUser: async (projectId: number, userId: number): Promise<void> => {
        await api.post(`/projects/${projectId}/users/${userId}`);
    },

    removeUser: async (projectId: number, userId: number): Promise<void> => {
        await api.delete(`/projects/${projectId}/users/${userId}`);
    },
};
