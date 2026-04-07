// src/features/teams/hooks/useTeamActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/providers/ToastContext';
import { teamsService } from '../api/teams.api';
import { teamKeys } from './useTeams';

export function useTeamActions() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const createTeam = useMutation({
        mutationFn: (data: any) => teamsService.createTeam(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            showToast('success', 'Team Created', 'New team has been created.');
        },
    });

    const updateTeam = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => teamsService.updateTeam(id, data),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            queryClient.invalidateQueries({ queryKey: teamKeys.detail(vars.id) });
            showToast('success', 'Team Updated', 'Changes saved successfully.');
        },
    });

    const deleteTeam = useMutation({
        mutationFn: (id: number) => teamsService.deleteTeam(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
            showToast('success', 'Team Deleted', 'The team has been removed.');
        },
    });

    return { createTeam, updateTeam, deleteTeam };
}
