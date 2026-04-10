import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/providers/ToastContext';
import { projectsService } from '../api/projects.api';
import type { ProjectTemplate, ProjectTemplateCreate } from '../types/template.types';

const templateKeys = {
    all: ['templates'] as const,
    lists: () => [...templateKeys.all, 'list'] as const,
    detail: (id: number) => [...templateKeys.all, 'detail', id] as const,
};

export function useTemplates() {
    return useQuery<ProjectTemplate[]>({
        queryKey: templateKeys.lists(),
        queryFn: () => projectsService.getTemplates(),
        staleTime: 10 * 60 * 1000, // Templates rarely change — 10 min cache
    });
}

export function useTemplate(id: number) {
    return useQuery<ProjectTemplate>({
        queryKey: templateKeys.detail(id),
        queryFn: () => projectsService.getTemplate(id),
        enabled: !!id,
    });
}

export function useCreateTemplate() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: (data: ProjectTemplateCreate) => projectsService.createTemplate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
            showToast('success', 'Template Created', 'Project template created successfully.');
        },
        onError: () => {
            showToast('error', 'Error', 'Failed to create template.');
        },
    });
}

export function useDeleteTemplate() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: (id: number) => projectsService.deleteTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
            showToast('warn', 'Template Deleted', 'Template has been removed.');
        },
    });
}
