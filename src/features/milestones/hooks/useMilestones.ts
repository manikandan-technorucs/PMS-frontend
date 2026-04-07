import { useQuery } from '@tanstack/react-query';
import { milestonesService } from '../api/milestones.api';

export const milestoneKeys = {
    all:     ['milestones']                                    as const,
    lists:   () => [...milestoneKeys.all, 'list']             as const,
    list:    (projectId?: number) => [...milestoneKeys.lists(), { projectId }] as const,
    details: () => [...milestoneKeys.all, 'detail']           as const,
    detail:  (id: number) => [...milestoneKeys.details(), id] as const,
};

export function useMilestones(projectId?: number, skip = 0, limit = 100) {
    return useQuery({
        queryKey: milestoneKeys.list(projectId),
        queryFn:  () => milestonesService.getMilestones(projectId, skip, limit),
    });
}

export function useMilestone(id: number) {
    return useQuery({
        queryKey: milestoneKeys.detail(id),
        queryFn:  () => milestonesService.getMilestone(id),
        enabled:  !!id,
    });
}
