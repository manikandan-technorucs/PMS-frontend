import { api } from '@/shared/lib/api';

export interface Milestone {
    id: number;
    public_id: string;
    project_id?: number;
    status_id?: number;
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    project?: any;
    status?: any;
}

export const milestonesService = {
    getMilestones: async (projectId?: number, skip = 0, limit = 100): Promise<Milestone[]> => {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
        });
        if (projectId) params.append('project_id', projectId.toString());

        const response = await api.get(`/milestones/?${params}`);
        return response.data;
    },

    getMilestone: async (id: number): Promise<Milestone> => {
        const response = await api.get(`/milestones/${id}`);
        return response.data;
    },

    createMilestone: async (data: Partial<Milestone>): Promise<Milestone> => {
        const response = await api.post('/milestones/', data);
        return response.data;
    },

    updateMilestone: async (id: number, data: Partial<Milestone>): Promise<Milestone> => {
        const response = await api.put(`/milestones/${id}`, data);
        return response.data;
    },

    deleteMilestone: async (id: number): Promise<void> => {
        await api.delete(`/milestones/${id}`);
    },
};
