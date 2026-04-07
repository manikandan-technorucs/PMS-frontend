import { useQuery } from '@tanstack/react-query';
import { teamsService } from '../api/teams.api';

export const teamKeys = {
    all:     ['teams']                                         as const,
    lists:   () => [...teamKeys.all, 'list']                  as const,
    list:    (f: any) => [...teamKeys.lists(), { f }]         as const,
    details: () => [...teamKeys.all, 'detail']                as const,
    detail:  (id: number) => [...teamKeys.details(), id]      as const,
};

export function useTeams(skip = 0, limit = 100) {
    return useQuery({
        queryKey: teamKeys.list({ skip, limit }),
        queryFn:  () => teamsService.getTeams(skip, limit),
    });
}

export function useTeam(id: number) {
    return useQuery({
        queryKey: teamKeys.detail(id),
        queryFn:  () => teamsService.getTeam(id),
        enabled:  !!id,
    });
}
