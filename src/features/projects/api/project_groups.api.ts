import { api } from '@/api/axiosInstance';

export interface ProjectGroup {
    id: number;
    name: string;
    description?: string;
}

export interface ProjectGroupCreate {
    name: string;
    description?: string;
}

export interface ProjectGroupUpdate {
    name?: string;
    description?: string;
}

export const projectGroupsService = {
    getProjectGroups: async (skip = 0, limit = 100): Promise<ProjectGroup[]> => {
        const response = await api.get('/project-groups/', { params: { skip, limit } });
        return response.data;
    },

    getProjectGroup: async (id: number): Promise<ProjectGroup> => {
        const response = await api.get(`/project-groups/${id}`);
        return response.data;
    },

    createProjectGroup: async (group: ProjectGroupCreate): Promise<ProjectGroup> => {
        const response = await api.post('/project-groups/', group);
        return response.data;
    },

    updateProjectGroup: async (id: number, group: ProjectGroupUpdate): Promise<ProjectGroup> => {
        const response = await api.put(`/project-groups/${id}`, group);
        return response.data;
    },

    deleteProjectGroup: async (id: number): Promise<void> => {
        await api.delete(`/project-groups/${id}`);
    },
};
