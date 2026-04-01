import { api } from '@/api/axiosInstance';

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
    classification?: string;
    start_date?: string | null;
    end_date?: string | null;
    estimated_hours?: number;
    project?: any;
    reporter?: any;
    assignee?: any;
    assignees?: any[];
    followers?: any[];
    status?: any;
    priority?: any;
    documents?: any[];
    module?: string | null;
    tags?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface IssueListResponse {
    total: number;
    items: Issue[];
}

export const issuesService = {
    getIssues: async (params: any = { skip: 0, limit: 100 }): Promise<IssueListResponse> => {
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

    bulkCreateIssues: async (issuesData: any[]): Promise<Issue[]> => {
        const response = await api.post('/issues/bulk', issuesData);
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
