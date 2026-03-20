import { api } from '@/shared/lib/api';

export interface Issue {
    id: number;
    public_id: string;
    title: string;
    description: string | null;
    project_id: number | null;
    reporter_id: number | null;
    reporter_email: string | null;
    assignee_id: number | null;
    assignee_email: string | null;
    status_id: number | null;
    priority_id: number | null;
    start_date?: string | null;
    end_date?: string | null;
    estimated_hours?: number;
    project?: any;
    reporter?: any;
    assignee?: any;
    status?: any;
    priority?: any;
    documents?: any[];
    created_at?: string;
    updated_at?: string;
}

export const issuesService = {
    getIssues: async (skip: number = 0, limit: number = 100, projectId?: number): Promise<Issue[]> => {
        const params: any = { skip, limit };
        if (projectId) params.project_id = projectId;
        const response = await api.get('/issues/', { params });
        return response.data;
    },

    getIssue: async (issueId: number): Promise<Issue> => {
        const response = await api.get(`/issues/${issueId}`);
        return response.data;
    },

    createIssue: async (issueData: any): Promise<Issue> => {
        const response = await api.post('/issues/', issueData);
        return response.data;
    },

    updateIssue: async (issueId: number, issueData: any): Promise<Issue> => {
        const response = await api.put(`/issues/${issueId}`, issueData);
        return response.data;
    },

    deleteIssue: async (issueId: number): Promise<void> => {
        await api.delete(`/issues/${issueId}`);
    },
};
