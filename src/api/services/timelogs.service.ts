import { api } from '@/api/client';

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
    user_email?: string;
    general_log?: boolean;
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
        const params: Record<string, any> = { skip, limit };
        if (projectId) params.project_id = projectId;
        const { data } = await api.get('/timelogs/', { params });
        return data;
    },

    getTimelog: async (id: number): Promise<TimeLog> => {
        const { data } = await api.get(`/timelogs/${id}`);
        return data;
    },

    createTimelog: async (payload: Partial<TimeLog>): Promise<TimeLog> => {
        const { data } = await api.post('/timelogs/', payload);
        return data;
    },

    bulkCreateTimelogs: async (payload: { logs: Partial<TimeLog>[] }): Promise<TimeLog[]> => {
        const { data } = await api.post('/timelogs/bulk', payload);
        return data;
    },

    updateTimelog: async (id: number, payload: Partial<TimeLog>): Promise<TimeLog> => {
        const { data } = await api.put(`/timelogs/${id}`, payload);
        return data;
    },

    deleteTimelog: async (id: number): Promise<void> => {
        await api.delete(`/timelogs/${id}`);
    },
};
