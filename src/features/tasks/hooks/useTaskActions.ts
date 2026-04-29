import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/providers/ToastContext';
import { tasksService } from '../api/tasks.api';
import { taskKeys } from './useTasks';

export function useTaskActions() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const createTask = useMutation({
        mutationFn: (data: any) => tasksService.createTask(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            showToast('success', 'Task Created', 'New task has been added.');
        },
    });

    const updateTask = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => tasksService.updateTask(id, data),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: taskKeys.detail(vars.id) });
        },
    });

    const deleteTask = useMutation({
        mutationFn: (id: number) => tasksService.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            showToast('success', 'Task Deleted', 'The task has been removed.');
        },
        onError: () => {
            showToast('error', 'Delete Failed', 'Could not delete the task. It may have already been removed.');
        },
    });

    const bulkCreateTasks = useMutation({
        mutationFn: (tasks: any[]) => tasksService.bulkCreateTasks(tasks),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            showToast('success', 'Tasks Created', 'Bulk tasks have been added.');
        },
    });

    return { createTask, updateTask, deleteTask, bulkCreateTasks };
}

