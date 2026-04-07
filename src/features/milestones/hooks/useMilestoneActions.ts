// src/features/milestones/hooks/useMilestoneActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/providers/ToastContext';
import { milestonesService, Milestone } from '../api/milestones.api';
import { milestoneKeys } from './useMilestones';

export function useMilestoneActions() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const createMilestone = useMutation({
        mutationFn: (data: Partial<Milestone>) => milestonesService.createMilestone(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: milestoneKeys.lists() });
            showToast('success', 'Milestone Created', 'New milestone has been added.');
        },
    });

    const updateMilestone = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Milestone> }) =>
            milestonesService.updateMilestone(id, data),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: milestoneKeys.lists() });
            queryClient.invalidateQueries({ queryKey: milestoneKeys.detail(vars.id) });
            showToast('success', 'Milestone Updated', 'Changes saved successfully.');
        },
    });

    const deleteMilestone = useMutation({
        mutationFn: (id: number) => milestonesService.deleteMilestone(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: milestoneKeys.lists() });
            showToast('success', 'Milestone Deleted', 'The milestone has been removed.');
        },
    });

    return { createMilestone, updateMilestone, deleteMilestone };
}
