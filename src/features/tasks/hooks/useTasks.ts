import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService, Task } from '../api/tasks.api';

export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    list: (filters: any) => [...taskKeys.lists(), { filters }] as const,
    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (id: number) => [...taskKeys.details(), id] as const,
};

export function useTasks(params: any = { skip: 0, limit: 100 }) {
    return useQuery({
        queryKey: taskKeys.list(params),
        queryFn: () => tasksService.getTasks(params),
        select: (data) => {
            const rawItems = data?.items || [];
            
            
            const map = new Map<number, any>();
            const treeNodes: any[] = [];
            
            rawItems.forEach(task => {
                map.set(task.id, { key: task.id.toString(), data: task, children: [] });
            });
            
            rawItems.forEach(task => {
                const node = map.get(task.id);
                if (task.parent_id && map.has(task.parent_id)) {
                    map.get(task.parent_id).children.push(node);
                } else {
                    treeNodes.push(node);
                }
            });
            
            return {
                ...data,
                items: rawItems, 
                treeData: treeNodes
            };
        }
    });
}

export function useTask(id: number) {
    return useQuery({
        queryKey: taskKeys.detail(id),
        queryFn: () => tasksService.getTask(id),
        enabled: !!id,
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            tasksService.updateTask(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: taskKeys.all });
            queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
        },
    });
}
