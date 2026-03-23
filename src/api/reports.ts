import { api } from '@/api/axiosInstance';

export interface ReportSummary {
    total_projects: number;
    total_tasks: number;
    total_issues: number;
    total_hours_logged: number;
}

export const reportsService = {
    getSummary: async (): Promise<ReportSummary> => {
        const response = await api.get('/reports/summary');
        return response.data;
    }
};
