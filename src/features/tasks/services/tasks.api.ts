import { api } from '@/api/axiosInstance';

export interface Task {
    id: number;
    public_id: string;
    title: string;
    description: string | null;
    project_id: number | null;
    assignee_id: number | null;
    assignee_email: string | null;
    created_by_email?: string | null;
    status_id: number | null;
    priority_id: number | null;
    task_list_id?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    due_date: string | null;
    estimated_hours?: number;
    actual_hours?: number;
    progress: number;
    project?: any;
    task_list?: any;
    assignee?: any;
    assignees?: any[];
    owners?: any[];
    status?: any;
    priority?: any;
}

export interface TaskListResponse {
    total: number;
    items: Task[];
}

export const tasksService = {
    getTasks: async (params: any = { skip: 0, limit: 100 }): Promise<TaskListResponse> => {
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

    bulkCreateTasks: async (tasks: any[]): Promise<Task[]> => {
        const response = await api.post('/tasks/bulk', tasks);
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
