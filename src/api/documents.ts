import { api } from './axiosInstance';
import { User } from './users';

const API_URL = 'api/v1/documents';

export interface Document {
    id: number;
    title: string;
    description?: string;
    file_url: string;
    file_type: string;
    file_size?: number;
    project_id: number;
    uploaded_by_id?: number;
    uploaded_by?: User;
    created_at: string;
    updated_at: string;
}

export interface DocumentCreate {
    title: string;
    description?: string;
    file_url: string;
    file_type?: string;
    file_size?: number;
    project_id: number;
}

export interface DocumentUpdate {
    title?: string;
    description?: string;
    file_url?: string;
    file_type?: string;
}

export const documentsService = {
    getDocuments: async (skip = 0, limit = 100, projectId?: number): Promise<Document[]> => {
        const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
        if (projectId) params.append('project_id', projectId.toString());

        const response = await api.get(`${API_URL}/?${params.toString()}`);
        return response.data;
    },

    getDocument: async (id: number): Promise<Document> => {
        const response = await api.get(`${API_URL}/${id}`);
        return response.data;
    },

    createDocument: async (document: DocumentCreate): Promise<Document> => {
        const response = await api.post(`${API_URL}/`, document);
        return response.data;
    },

    updateDocument: async (id: number, document: DocumentUpdate): Promise<Document> => {
        const response = await api.put(`${API_URL}/${id}`, document);
        return response.data;
    },

    deleteDocument: async (id: number): Promise<void> => {
        await api.delete(`${API_URL}/${id}`);
    }
};
