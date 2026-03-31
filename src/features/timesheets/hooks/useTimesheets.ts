import { useQuery } from '@tanstack/react-query';
import { timesheetsService } from '../services/timesheets.api';

export const timesheetKeys = {
    all: ['timesheets'] as const,
    lists: () => [...timesheetKeys.all, 'list'] as const,
    list: (filters: string) => [...timesheetKeys.lists(), { filters }] as const,
    details: () => [...timesheetKeys.all, 'detail'] as const,
    detail: (id: number) => [...timesheetKeys.details(), id] as const,
};

export function useTimesheets() {
    return useQuery({
        queryKey: timesheetKeys.lists(),
        queryFn: () => timesheetsService.getTimesheets(),
        staleTime: 5 * 60 * 1000,
    });
}

export function useTimesheet(id: number) {
    return useQuery({
        queryKey: timesheetKeys.detail(id),
        queryFn: () => timesheetsService.getTimesheet(id),
        enabled: !!id,
    });
}
