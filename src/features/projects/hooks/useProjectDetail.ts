
import { useQuery } from '@tanstack/react-query';
import { projectsService } from '../api/projects.api';
import { tasksService } from '@/features/tasks/api/tasks.api';
import { issuesService } from '@/features/issues/api/issues.api';
import { milestonesService } from '@/features/milestones/api/milestones.api';
import { timelogsService } from '@/features/timelogs/api/timelogs.api';
import { projectKeys } from './useProjects';

const STALE = 2 * 60 * 1000;

export function useProjectDetail(projectId: number | undefined) {
    const enabled = !!projectId;

    const project = useQuery({
        queryKey: projectKeys.detail(projectId!),
        queryFn: () => projectsService.getProject(projectId!),
        enabled,
        staleTime: STALE,
    });

    const tasks = useQuery({
        queryKey: [...projectKeys.detail(projectId!), 'tasks'],
        queryFn: () => tasksService.getTasks({ project_id: projectId }),
        enabled,
        staleTime: STALE,
    });

    const issues = useQuery({
        queryKey: [...projectKeys.detail(projectId!), 'issues'],
        queryFn: () => issuesService.getIssues({ project_id: projectId }),
        enabled,
        staleTime: STALE,
    });

    const milestones = useQuery({
        queryKey: [...projectKeys.detail(projectId!), 'milestones'],
        queryFn: () => milestonesService.getMilestones(projectId!),
        enabled,
        staleTime: STALE,
    });

    const timelogs = useQuery({
        queryKey: [...projectKeys.detail(projectId!), 'timelogs'],
        queryFn: () => timelogsService.getTimelogs(projectId!),
        enabled,
        staleTime: STALE,
    });

    const isLoading =
        project.isLoading ||
        tasks.isLoading ||
        issues.isLoading ||
        milestones.isLoading ||
        timelogs.isLoading;

    const isError =
        project.isError ||
        tasks.isError ||
        issues.isError ||
        milestones.isError ||
        timelogs.isError;

    return {
        project: project.data,
        tasks: tasks.data?.items ?? [],
        taskTotal: tasks.data?.total ?? 0,
        issues: issues.data?.items ?? [],
        issueTotal: issues.data?.total ?? 0,
        milestones: milestones.data ?? [],
        timelogs: timelogs.data ?? [],
        isLoading,
        isError,
        refetchAll: () => {
            project.refetch();
            tasks.refetch();
            issues.refetch();
            milestones.refetch();
            timelogs.refetch();
        },
    };
}
