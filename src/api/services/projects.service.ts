import { api } from '@/api/client';
import type { Project } from '@/features/projects/types/project.types';
import type { ProjectTemplate, ProjectTemplateCreate } from '@/features/projects/types/template.types';

export type { Project };

export const projectsService = {
    getProjects: async (params?: {
        skip?: number; limit?: number; include_all?: boolean;
        status_id?: number[]; priority_id?: number[]; is_archived?: boolean; is_template?: boolean;
    }): Promise<Project[]> => {
        const { data } = await api.get('/projects/', { params: { skip: 0, limit: 1000, include_all: true, ...params } });
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

    archiveProject: async (projectId: number): Promise<Project> => {
        const { data } = await api.patch(`/projects/${projectId}/archive`);
        return data;
    },

    unarchiveProject: async (projectId: number): Promise<Project> => {
        const { data } = await api.patch(`/projects/${projectId}/unarchive`);
        return data;
    },

    syncProject: async (projectId: number, payload: { project_id_sync?: string; account_name?: string; customer_name?: string }): Promise<Project> => {
        const { data } = await api.post(`/projects/${projectId}/sync`, payload);
        return data;
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

    bulkAssignUsers: async (projectId: number, userEmails: string[]): Promise<void> => {
        await api.post(`/projects/${projectId}/users/bulk`, userEmails);
    },

    getTemplates: async (): Promise<ProjectTemplate[]> => {
        const { data } = await api.get('/templates/');
        return data;
    },

    getTemplate: async (templateId: number): Promise<ProjectTemplate> => {
        const { data } = await api.get(`/templates/${templateId}`);
        return data;
    },

    createTemplate: async (payload: ProjectTemplateCreate): Promise<ProjectTemplate> => {
        const { data } = await api.post('/templates/', payload);
        return data;
    },

    deleteTemplate: async (templateId: number): Promise<void> => {
        await api.delete(`/templates/${templateId}`);
    },
};
