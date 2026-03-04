import { api } from '@/shared/lib/api';

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

        const response = await api.get(`/task-lists/?${params}`);
        return response.data;
    },

    getTaskList: async (id: number): Promise<TaskList> => {
        const response = await api.get(`/task-lists/${id}`);
        return response.data;
    },

    createTaskList: async (data: Partial<TaskList>): Promise<TaskList> => {
        const response = await api.post('/task-lists/', data);
        return response.data;
    },

    updateTaskList: async (id: number, data: Partial<TaskList>): Promise<TaskList> => {
        const response = await api.put(`/task-lists/${id}`, data);
        return response.data;
    },

    deleteTaskList: async (id: number): Promise<void> => {
        await api.delete(`/task-lists/${id}`);
    },
};
