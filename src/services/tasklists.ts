import { api } from '../lib/api';

export interface TaskList {
    id: number;
    project_id: number;
    name: string;
    description?: string;
    project?: any;
}

export const tasklistsService = {
    getTaskLists: async (projectId?: number, skip = 0, limit = 100): Promise<TaskList[]> => {
        const params = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
        });
        if (projectId) params.append('project_id', projectId.toString());

        const response = await api.get(`/tasklists/?${params}`);
        return response.data;
    },

    getTaskList: async (id: number): Promise<TaskList> => {
        const response = await api.get(`/tasklists/${id}`);
        return response.data;
    },

    createTaskList: async (data: Partial<TaskList>): Promise<TaskList> => {
        const response = await api.post('/tasklists/', data);
        return response.data;
    },

    updateTaskList: async (id: number, data: Partial<TaskList>): Promise<TaskList> => {
        const response = await api.put(`/tasklists/${id}`, data);
        return response.data;
    },

    deleteTaskList: async (id: number): Promise<void> => {
        await api.delete(`/tasklists/${id}`);
    },
};
