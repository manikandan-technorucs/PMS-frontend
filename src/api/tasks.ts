import { api } from '../lib/api';

export interface Task {
    id: number;
    public_id: string;
    title: string;
    description: string | null;
    project_id: number | null;
    assignee_id: number | null;
    status_id: number | null;
    priority_id: number | null;
    task_list_id?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    due_date: string | null;
    estimated_hours?: number;
    progress: number;
    project?: any;
    task_list?: any;
    assignee?: any;
    status?: any;
    priority?: any;
}

export const tasksService = {
    getTasks: async (skip: number = 0, limit: number = 100, projectId?: number): Promise<Task[]> => {
        const params: any = { skip, limit };
        if (projectId) params.project_id = projectId;
        const response = await api.get('/tasks/', { params });
        return response.data;
    },

    getTask: async (taskId: number): Promise<Task> => {
        const response = await api.get(`/tasks/${taskId}`);
        return response.data;
    },

    createTask: async (taskData: any): Promise<Task> => {
        const response = await api.post('/tasks/', taskData);
        return response.data;
    },

    updateTask: async (taskId: number, taskData: any): Promise<Task> => {
        const response = await api.put(`/tasks/${taskId}`, taskData);
        return response.data;
    },

    deleteTask: async (taskId: number): Promise<void> => {
        await api.delete(`/tasks/${taskId}`);
    },
};
