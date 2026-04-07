import { useState, useEffect } from 'react';

export interface DashboardSummary {
  activeProjects: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  openIssues: number;
  totalIssues: number;
  totalHoursLogged: number;
}

export interface TaskStatusData {
  name: string;
  value: number;
  color: string;
}

export interface PhaseStatusData {
  name: string;
  value: number;
  color: string;
}

export interface IssueSeverityData {
  severity: string;
  count: number;
  fill: string;
}

export interface ProjectTaskProgressData {
  name: string;
  total: number;
  completed: number;
}

export interface RecentActivity {
  id: string;
  activity: string;
  project: string;
  user: string;
  type: 'Task' | 'Issue' | 'Comment' | 'Status' | 'Upload';
  time: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  taskStatusData: TaskStatusData[];
  phaseStatusData: PhaseStatusData[];
  issueSeverityData: IssueSeverityData[];
  projectTaskProgressData: ProjectTaskProgressData[];
  recentActivities: RecentActivity[];
  isLoading: boolean;
  error: Error | null;
}

export const useDashboardData = (): DashboardData => {
  const [data, setData] = useState<Omit<DashboardData, 'isLoading' | 'error'>>({
    summary: {
      activeProjects: 0,
      totalProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      openIssues: 0,
      totalIssues: 0,
      totalHoursLogged: 0,
    },
    taskStatusData: [],
    phaseStatusData: [],
    issueSeverityData: [],
    projectTaskProgressData: [],
    recentActivities: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mock = {
          summary: {
            active_projects: 6,
            total_projects: 9,
            total_tasks: 84,
            completed_tasks: 53,
            open_issues: 12,
            total_issues: 18,
            total_hours_logged: 142.5,
          },
          task_status_data: [
            { name: 'Completed', value: 53, color: '#10B981' },
            { name: 'In Progress', value: 21, color: '#14B8A6' },
            { name: 'Open', value: 10, color: '#8B5CF6' },
          ],
          phase_status_data: [
            { name: 'Planning', value: 2, color: '#8B5CF6' },
            { name: 'Development', value: 4, color: '#14B8A6' },
            { name: 'Testing', value: 2, color: '#F59E0B' },
            { name: 'Deployment', value: 1, color: '#10B981' },
          ],
          issue_severity_data: [
            { severity: 'Low',      count: 2,  fill: '#3B82F6' },
            { severity: 'Medium',   count: 6,  fill: '#14B8A6' },
            { severity: 'High',     count: 3,  fill: '#F97316' },
            { severity: 'Critical', count: 1,  fill: '#EF4444' },
          ],
          project_task_progress_data: [
            { name: 'Alpha', total: 20, completed: 18 },
            { name: 'Beta',  total: 35, completed: 22 },
            { name: 'Gamma', total: 15, completed: 8  },
            { name: 'Delta', total: 14, completed: 5  },
          ],
          recent_activities: [
            { id: '1', activity: 'Closed critical auth bug',       project: 'Alpha',  user: 'Manikandan', type: 'Issue',  time: '2m ago'  },
            { id: '2', activity: 'Completed API integration task',  project: 'Beta',   user: 'Revathi',    type: 'Task',   time: '18m ago' },
            { id: '3', activity: 'Logged 3.5h on Sprint Planning',  project: 'Gamma',  user: 'Arun',       type: 'Upload', time: '1h ago'  },
            { id: '4', activity: 'Added release notes comment',     project: 'Alpha',  user: 'Priya',      type: 'Comment',time: '2h ago'  },
            { id: '5', activity: 'Moved Delta to Testing phase',    project: 'Delta',  user: 'Manikandan', type: 'Status', time: '3h ago'  },
            { id: '6', activity: 'Created new issue: Timeout error',project: 'Beta',   user: 'Karthik',    type: 'Issue',  time: '4h ago'  },
          ],
        };

        setData({
          summary: {
            activeProjects:   mock.summary.active_projects,
            totalProjects:    mock.summary.total_projects,
            totalTasks:       mock.summary.total_tasks,
            completedTasks:   mock.summary.completed_tasks,
            openIssues:       mock.summary.open_issues,
            totalIssues:      mock.summary.total_issues,
            totalHoursLogged: mock.summary.total_hours_logged,
          },
          taskStatusData:          mock.task_status_data,
          phaseStatusData:         mock.phase_status_data,
          issueSeverityData:       mock.issue_severity_data,
          projectTaskProgressData: mock.project_task_progress_data,
          recentActivities:        mock.recent_activities as RecentActivity[],
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { ...data, isLoading, error };
};
