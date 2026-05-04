import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '../api/tasks.api';
import { taskKeys } from './useTasks';

export function useTaskActions() {
    const queryClient = useQueryClient();

    const createTask = useMutation({
        mutationFn: (data: any) => tasksService.createTask(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
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
        },
    });

    const bulkCreateTasks = useMutation({
        mutationFn: (tasks: any[]) => tasksService.bulkCreateTasks(tasks),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });

    return { createTask, updateTask, deleteTask, bulkCreateTasks };
}

