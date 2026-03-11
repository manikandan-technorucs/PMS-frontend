import { useEffect, useMemo, useState } from "react";
import { projectsService, Project } from "@/services/projects";

export function useProjectsList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        try {
            setLoading(true);
            const data = await projectsService.getProjects(0, 500);
            setProjects(data);
        } finally {
            setLoading(false);
        }
    }

    const stats = useMemo(() => {
        let active = 0;
        let completed = 0;
        let planning = 0;

        for (const p of projects) {
            const status = p.status?.name;
            if (status === "Completed") completed++;
            else if (status === "Planning") planning++;
            else if (status === "Active" || status === "In Progress") active++;
        }

        return {
            total: projects.length,
            active,
            completed,
            planning,
        };
    }, [projects]);

    const filterByTab = (tab: string) => {
        if (tab === "All Projects") return projects;
        if (tab === "Active Projects")
            return projects.filter(
                (p) => !["Completed", "Closed"].includes(p.status?.name || "")
            );
        if (tab === "Archived Projects")
            return projects.filter((p) =>
                ["Completed", "Closed"].includes(p.status?.name || "")
            );
        return [];
    };

    return {
        projects,
        loading,
        stats,
        filterByTab,
    };
}