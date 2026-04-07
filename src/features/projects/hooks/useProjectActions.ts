import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/providers/ToastContext';
import { projectsService } from '../api/projects.api';
import { projectGroupsService } from '../api/project_groups.api';
import { projectKeys } from './useProjects';
import type { ProjectFormData } from '../types/project.types';

export interface AssignUserPayload {
    user_id: string;        
    user_email: string;
    display_name?: string;
    role_id?: number;
    project_id: number;
}

export function useProjectActions() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const createProject = useMutation({
        mutationFn: (data: ProjectFormData) => projectsService.createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            showToast('success', 'Project Created', 'New project has been created successfully.');
        },
    });

    const updateProject = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<ProjectFormData> }) =>
            projectsService.updateProject(id, data),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(vars.id) });
            showToast('success', 'Project Updated', 'Changes saved successfully.');
        },
    });

    const deleteProject = useMutation({
        mutationFn: (id: number) => projectsService.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            showToast('success', 'Project Deleted', 'The project has been removed.');
        },
    });

    const assignUser = useMutation({
        mutationFn: ({ projectId, payload }: { projectId: number; payload: AssignUserPayload }) =>
            projectsService.assignUser(projectId, payload),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(vars.projectId) });
            showToast('success', 'Member Added', 'User has been assigned to the project.');
        },
    });

    const removeUser = useMutation({
        mutationFn: ({ projectId, userEmail }: { projectId: number; userEmail: string }) =>
            projectsService.removeUser(projectId, userEmail),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(vars.projectId) });
            showToast('warning', 'Member Removed', 'User has been removed from the project.');
        },
    });

    return { createProject, updateProject, deleteProject, assignUser, removeUser };
}
