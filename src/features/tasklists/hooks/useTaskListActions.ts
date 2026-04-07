import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/providers/ToastContext';
import { tasklistsService, TaskList } from '../api/tasklists.api';
import { taskListKeys } from './useTaskLists';

export function useTaskListActions() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const createTaskList = useMutation({
        mutationFn: (data: Partial<TaskList>) => tasklistsService.createTaskList(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskListKeys.lists() });
            showToast('success', 'Task List Created', 'New task list has been added.');
        },
    });

    const updateTaskList = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<TaskList> }) =>
            tasklistsService.updateTaskList(id, data),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: taskListKeys.lists() });
            queryClient.invalidateQueries({ queryKey: taskListKeys.detail(vars.id) });
            showToast('success', 'Task List Updated', 'Changes saved successfully.');
        },
    });

    const deleteTaskList = useMutation({
        mutationFn: (id: number) => tasklistsService.deleteTaskList(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskListKeys.lists() });
            showToast('success', 'Task List Deleted', 'The task list has been removed.');
        },
    });

    return { createTaskList, updateTaskList, deleteTaskList };
}
