import axios from 'axios';
import { User } from '@/features/users/services/users.api';
import { api } from '@/shared/lib/api';

const API_URL = 'http://localhost:8000/api/v1/documents';

export interface Document {
    id: number;
    title: string;
    description?: string;
    file_url: string;
    file_type: string;
    file_size?: number;
    project_id: number;
    uploaded_by_email?: string;
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

        const response = await api.get(`/documents/?${params.toString()}`);
        return response.data;
    },

    getDocument: async (id: number): Promise<Document> => {
        const response = await api.get(`/documents/${id}`);
        return response.data;
    },

    createDocument: async (file: File, projectId: number, title?: string, description?: string): Promise<Document> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', projectId.toString());
        if (title) formData.append('title', title);
        if (description) formData.append('description', description);

        const response = await api.post(`/documents/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    createLinkDocument: async (document: DocumentCreate): Promise<Document> => {
        const response = await api.post(`/documents/`, document);
        return response.data;
    },

    updateDocument: async (id: number, document: DocumentUpdate): Promise<Document> => {
        const response = await api.put(`/documents/${id}`, document);
        return response.data;
    },

    deleteDocument: async (id: number): Promise<void> => {
        await api.delete(`/documents/${id}`);
    }
};
