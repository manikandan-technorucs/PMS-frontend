

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/providers/ToastContext';
import { tasksService } from '@/features/tasks/api/tasks.api';
import { projectKeys } from '@/features/projects/hooks/useProjects';

export function useTaskOperations(projectId: number) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const taskDetailKey = [...projectKeys.detail(projectId), 'tasks'];

    const createTask = useMutation({
        mutationFn: tasksService.createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskDetailKey });
            showToast('success', 'Task Created', 'Task has been added to the project.');
        },
        onError: () => {
            showToast('error', 'Error', 'Failed to create task.');
        },
    });

    const updateTask = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            tasksService.updateTask(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskDetailKey });
            showToast('success', 'Task Updated', 'Changes saved.');
        },
        onError: () => {
            showToast('error', 'Error', 'Failed to update task.');
        },
    });

    const deleteTask = useMutation({
        mutationFn: (id: number) => tasksService.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskDetailKey });
            showToast('warn', 'Task Deleted', 'Task removed from project.');
        },
    });

    const updateTaskStatus = useMutation({
        mutationFn: ({ id, status_id }: { id: number; status_id: number }) =>
            tasksService.updateTask(id, { status_id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskDetailKey });
        },
    });

    return { createTask, updateTask, deleteTask, updateTaskStatus };
}
