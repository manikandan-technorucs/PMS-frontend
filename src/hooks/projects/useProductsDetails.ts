import { useEffect, useMemo, useState } from "react";
import { projectsService } from "@/features/projects/services/projects.api";
import { milestonesService } from "@/features/milestones/services/milestones.api";
import { tasklistsService } from "@/features/tasklists/services/tasklists.api";
import { tasksService } from "@/features/tasks/services/tasks.api";
import { usersService } from "@/features/users/services/users.api";
import { timelogsService } from "@/features/timelogs/services/timelogs.api";
import { issuesService } from "@/features/issues/services/issues.api";

export function useProjectDetail(projectId?: string) {
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [taskLists, setTaskLists] = useState<any[]>([]);
    const [issues, setIssues] = useState<any[]>([]);
    const [timelogs, setTimelogs] = useState<any[]>([]);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        if (!projectId) return;

        async function load() {
            try {
                setLoading(true);
                const pid = Number(projectId);

                const [
                    project,
                    users,
                    milestones,
                    taskLists,
                    tasks,
                    timelogs,
                    issues,
                ] = await Promise.all([
                    projectsService.getProject(pid),
                    usersService.getUsers(0, 500),
                    milestonesService.getMilestones(pid),
                    tasklistsService.getTaskLists(pid),
                    tasksService.getTasks({ skip: 0, limit: 1000 }),
                    timelogsService.getTimelogs(0, 1000),
                    issuesService.getIssues({ skip: 0, limit: 1000 }),
                ]);

                setProject(project);
                setUsers(users);
                setMilestones(milestones);
                setTaskLists(taskLists);
                setTasks((tasks.items || []).filter((t: any) => t.project_id === pid));
                setIssues((issues.items || []).filter((i: any) => i.project_id === pid));
                setTimelogs(
                    timelogs.filter(
                        (l: any) =>
                            l.project_id === pid ||
                            l.task?.project_id === pid ||
                            l.issue?.project_id === pid
                    )
                );
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [projectId]);

    const actualHours = useMemo(
        () => timelogs.reduce((sum, l) => sum + l.hours, 0),
        [timelogs]
    );

    const hoursByTask = useMemo(() => {
        const map: Record<number, number> = {};
        timelogs.forEach((l) => {
            if (!l.task_id) return;
            map[l.task_id] = (map[l.task_id] || 0) + l.hours;
        });
        return map;
    }, [timelogs]);

    const hoursByUser = useMemo(() => {
        const map: Record<number, number> = {};
        timelogs.forEach((l) => {
            if (!l.user_id) return;
            map[l.user_id] = (map[l.user_id] || 0) + l.hours;
        });
        return map;
    }, [timelogs]);

    return {
        loading,
        project,
        tasks,
        taskLists,
        issues,
        timelogs,
        milestones,
        users,
        actualHours,
        hoursByTask,
        hoursByUser,
    };
}