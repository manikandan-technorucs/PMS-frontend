import { api } from '@/api/axiosInstance';
import { AutomationRule, AutomationRuleFormData, AutomationLog } from '../types';

export const automationService = {
    getRules: async (skip = 0, limit = 100): Promise<AutomationRule[]> => {
        const response = await api.get('/automations/', { params: { skip, limit } });
        return response.data;
    },

    getRule: async (id: number): Promise<AutomationRule> => {
        const response = await api.get(`/automations/${id}`);
        return response.data;
    },

    createRule: async (data: AutomationRuleFormData): Promise<AutomationRule> => {
        const response = await api.post('/automations/', data);
        return response.data;
    },

    updateRule: async (id: number, data: Partial<AutomationRuleFormData>): Promise<AutomationRule> => {
        const response = await api.put(`/automations/${id}`, data);
        return response.data;
    },

    deleteRule: async (id: number): Promise<void> => {
        await api.delete(`/automations/${id}`);
    },

    getLogs: async (ruleId: number, skip = 0, limit = 100): Promise<AutomationLog[]> => {
        const response = await api.get(`/automations/${ruleId}/logs`, { params: { skip, limit } });
        return response.data;
    }
};
