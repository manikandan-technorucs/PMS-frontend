import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { automationService } from '../services/automation.api';
import { AutomationRuleFormData } from '../types';
import { useToast } from '@/shared/context/ToastContext';

export const useAutomationRules = () => {
    return useQuery({
        queryKey: ['automations'],
        queryFn: () => automationService.getRules()
    });
};

export const useAutomationRule = (id: number) => {
    return useQuery({
        queryKey: ['automations', id],
        queryFn: () => automationService.getRule(id),
        enabled: !!id
    });
};

export const useAutomationLogs = (ruleId: number) => {
    return useQuery({
        queryKey: ['automations', ruleId, 'logs'],
        queryFn: () => automationService.getLogs(ruleId),
        enabled: !!ruleId
    });
};

export const useCreateAutomationRule = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: (data: AutomationRuleFormData) => automationService.createRule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automations'] });
            showToast('success', 'Automation rule created successfully');
        },
        onError: (error: any) => {
            showToast('error', error.response?.data?.detail || 'Failed to create automation rule');
        }
    });
};

export const useUpdateAutomationRule = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<AutomationRuleFormData> }) =>
            automationService.updateRule(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['automations'] });
            queryClient.invalidateQueries({ queryKey: ['automations', id] });
            showToast('success', 'Automation rule updated successfully');
        },
        onError: (error: any) => {
            showToast('error', error.response?.data?.detail || 'Failed to update automation rule');
        }
    });
};

export const useDeleteAutomationRule = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: (id: number) => automationService.deleteRule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automations'] });
            showToast('success', 'Automation rule deleted successfully');
        },
        onError: (error: any) => {
            showToast('error', error.response?.data?.detail || 'Failed to delete automation rule');
        }
    });
};
