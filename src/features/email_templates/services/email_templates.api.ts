import { api } from '@/shared/lib/api';
import { EmailTemplate, EmailTemplateFormData } from '../types';

export const emailTemplatesService = {
    getTemplates: async (skip = 0, limit = 100): Promise<EmailTemplate[]> => {
        const response = await api.get('/email-templates/', { params: { skip, limit } });
        return response.data;
    },

    getTemplate: async (id: number): Promise<EmailTemplate> => {
        const response = await api.get(`/email-templates/${id}`);
        return response.data;
    },

    createTemplate: async (data: EmailTemplateFormData): Promise<EmailTemplate> => {
        const response = await api.post('/email-templates/', data);
        return response.data;
    },

    updateTemplate: async (id: number, data: Partial<EmailTemplateFormData>): Promise<EmailTemplate> => {
        const response = await api.put(`/email-templates/${id}`, data);
        return response.data;
    },

    deleteTemplate: async (id: number): Promise<void> => {
        await api.delete(`/email-templates/${id}`);
    }
};
