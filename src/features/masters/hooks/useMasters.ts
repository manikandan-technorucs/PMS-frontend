// src/features/masters/hooks/useMasters.ts
// Consolidated TanStack Query hooks for all ERP lookup data.
// Replace ALL imports of src/hooks/useMasterData.ts with this file.
//
// staleTime tiers:
//   STATIC  = 1 hour  — truly static data (roles, departments, statuses, priorities)
//   DYNAMIC = 5 min   — semi-dynamic data (users, teams)

import { useQuery } from '@tanstack/react-query';
import { mastersApi } from '../api/masters.api';

// These imports will resolve once Step 2 (services→api rename) is complete
import { usersService } from '@/features/users/api/users.api';
import { teamsService } from '@/features/teams/api/teams.api';

export const masterKeys = {
    statuses:     ['masters', 'statuses']     as const,
    priorities:   ['masters', 'priorities']   as const,
    roles:        ['masters', 'roles']        as const,
    skills:       ['masters', 'skills']       as const,
    userStatuses: ['masters', 'userStatuses'] as const,
    users:        ['masters', 'users']        as const,
    teams:        ['masters', 'teams']        as const,
} as const;

const STATIC  = 60 * 60 * 1000; // 1 hour
const DYNAMIC =  5 * 60 * 1000; // 5 min

export const useStatuses      = () => useQuery({ queryKey: masterKeys.statuses,     queryFn: mastersApi.getStatuses,     staleTime: STATIC  });
export const usePriorities    = () => useQuery({ queryKey: masterKeys.priorities,   queryFn: mastersApi.getPriorities,   staleTime: STATIC  });
export const useRolesLookup   = () => useQuery({ queryKey: masterKeys.roles,        queryFn: mastersApi.getRoles,        staleTime: STATIC  });
export const useUserStatuses  = () => useQuery({ queryKey: masterKeys.userStatuses, queryFn: mastersApi.getUserStatuses, staleTime: STATIC  });
export const useSkillsLookup  = () => useQuery({ queryKey: masterKeys.skills,       queryFn: mastersApi.getSkills,       staleTime: STATIC  });

export const useUsersDropdown = () =>
    useQuery({ queryKey: masterKeys.users, queryFn: () => usersService.getUsers(0, 1000), staleTime: DYNAMIC });

export const useTeamsDropdown = () =>
    useQuery({ queryKey: masterKeys.teams, queryFn: () => teamsService.getTeams(0, 500),  staleTime: DYNAMIC });
