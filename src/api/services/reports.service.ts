import { api } from '@/api/client';

export interface ReportSummary {
    total_projects: number;
    active_projects: number;
    total_tasks: number;
    completed_tasks: number;
    total_issues: number;
    open_issues: number;
    total_hours_logged: number;
    total_milestones?: number;
}

export const reportsService = {
    getSummary: async (): Promise<ReportSummary> => {
        const { data } = await api.get('/reports/summary');
        return data;
    },
};
