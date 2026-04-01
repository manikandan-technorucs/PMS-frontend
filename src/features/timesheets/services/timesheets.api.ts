import { api } from '@/api/axiosInstance';
import { User, Project } from '@/shared/types';

export interface Timesheet {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    project_id: number;
    user_id: number;
    billing_type: string;
    total_hours: number;
    approval_status: string;
    user_email?: string;
    project?: Project;
    user?: User;
}

export const timesheetsService = {
    getTimesheets: async (skip = 0, limit = 100, projectId?: number, userId?: number): Promise<Timesheet[]> => {
        const params: any = { skip, limit };
        if (projectId) params.project_id = projectId;
        if (userId) params.user_id = userId;
        const response = await api.get('/timesheets/', { params });
        return response.data;
    },

    getTimesheet: async (id: number): Promise<Timesheet> => {
        const response = await api.get(`/timesheets/${id}`);
        return response.data;
    },

    createTimesheet: async (data: Partial<Timesheet>): Promise<Timesheet> => {
        const response = await api.post('/timesheets/', data);
        return response.data;
    },

    updateTimesheet: async (id: number, data: Partial<Timesheet>): Promise<Timesheet> => {
        const response = await api.put(`/timesheets/${id}`, data);
        return response.data;
    },

    deleteTimesheet: async (id: number): Promise<void> => {
        await api.delete(`/timesheets/${id}`);
    }
};
