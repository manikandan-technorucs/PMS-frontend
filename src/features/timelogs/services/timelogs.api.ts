import { api } from '@/shared/lib/api';

export interface TimeLog {
    id: number;
    public_id?: string;
    date: string;
    hours: number;
    description?: string;
    billing_type?: string;
    approval_status?: string;
    log_title?: string;
    user_id?: number;
    project_id?: number;
    task_id?: number;
    issue_id?: number;
    timesheet_id?: number;
    user?: any;
    project?: any;
    task?: any;
    issue?: any;
}

export const timelogsService = {
    getTimelogs: async (skip = 0, limit = 500, projectId?: number): Promise<TimeLog[]> => {
        const params: any = { skip, limit };
        if (projectId) params.project_id = projectId;
        const response = await api.get(`/timelogs/`, { params });
        return response.data;
    },

    getTimelog: async (id: number): Promise<TimeLog> => {
        const response = await api.get(`/timelogs/${id}`);
        return response.data;
    },

    createTimelog: async (data: Partial<TimeLog>): Promise<TimeLog> => {
        const response = await api.post('/timelogs/', data);
        return response.data;
    },

    updateTimelog: async (id: number, data: Partial<TimeLog>): Promise<TimeLog> => {
        const response = await api.put(`/timelogs/${id}`, data);
        return response.data;
    },

    deleteTimelog: async (id: number): Promise<void> => {
        await api.delete(`/timelogs/${id}`);
    }
};
