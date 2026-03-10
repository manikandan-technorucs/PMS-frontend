import { useQuery } from '@tanstack/react-query';
import { mastersService } from '@/shared/services/masters.api';
import { usersService } from '@/features/users/services/users.api';
import { teamsService } from '@/features/teams/services/teams.api';

export const masterKeys = {
    departments: ['masters', 'departments'] as const,
    statuses: ['masters', 'statuses'] as const,
    priorities: ['masters', 'priorities'] as const,
    users: ['masters', 'users'] as const,
    teams: ['masters', 'teams'] as const,
    roles: ['masters', 'roles'] as const,
};

export function useDepartments() {
    return useQuery({
        queryKey: masterKeys.departments,
        queryFn: () => mastersService.getDepartments(),
        staleTime: 60 * 60 * 1000, // Cash for 1 hour
    });
}

export function useStatuses() {
    return useQuery({
        queryKey: masterKeys.statuses,
        queryFn: () => mastersService.getStatuses(),
        staleTime: 60 * 60 * 1000,
    });
}

export function usePriorities() {
    return useQuery({
        queryKey: masterKeys.priorities,
        queryFn: () => mastersService.getPriorities(),
        staleTime: 60 * 60 * 1000,
    });
}

// Global user dropdowns
export function useUsersDropdown() {
    return useQuery({
        queryKey: masterKeys.users,
        queryFn: () => usersService.getUsers(0, 1000), // Assuming dropdown needs large slice
        staleTime: 5 * 60 * 1000,
    });
}

export function useTeamsDropdown() {
    return useQuery({
        queryKey: masterKeys.teams,
        queryFn: () => teamsService.getTeams(0, 500),
        staleTime: 5 * 60 * 1000,
    });
}

export function useUsers() {
    return useQuery({
        queryKey: masterKeys.users,
        queryFn: () => usersService.getUsers(0, 1000),
        staleTime: 5 * 60 * 1000,
    });
}

export function useRoles() {
    return useQuery({
        queryKey: masterKeys.roles,
        queryFn: () => mastersService.getRoles(),
        staleTime: 60 * 60 * 1000,
    });
}
