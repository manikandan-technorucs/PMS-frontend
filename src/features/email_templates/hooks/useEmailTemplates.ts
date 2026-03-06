import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailTemplatesService } from '../services/email_templates.api';
import { EmailTemplateFormData } from '../types';
import { useToast } from '@/shared/context/ToastContext';

export const useEmailTemplates = () => {
    return useQuery({
        queryKey: ['email-templates'],
        queryFn: () => emailTemplatesService.getTemplates()
    });
};

export const useEmailTemplate = (id: number) => {
    return useQuery({
        queryKey: ['email-templates', id],
        queryFn: () => emailTemplatesService.getTemplate(id),
        enabled: !!id
    });
};

export const useCreateEmailTemplate = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: (data: EmailTemplateFormData) => emailTemplatesService.createTemplate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['email-templates'] });
            showToast('success', 'Email template created successfully');
        },
        onError: (error: any) => {
            showToast('error', error.response?.data?.detail || 'Failed to create template');
        }
    });
};

export const useUpdateEmailTemplate = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<EmailTemplateFormData> }) =>
            emailTemplatesService.updateTemplate(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['email-templates'] });
            queryClient.invalidateQueries({ queryKey: ['email-templates', id] });
            showToast('success', 'Email template updated successfully');
        },
        onError: (error: any) => {
            showToast('error', error.response?.data?.detail || 'Failed to update template');
        }
    });
};

export const useDeleteEmailTemplate = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: (id: number) => emailTemplatesService.deleteTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['email-templates'] });
            showToast('success', 'Email template deleted successfully');
        },
        onError: (error: any) => {
            showToast('error', error.response?.data?.detail || 'Failed to delete template');
        }
    });
};
