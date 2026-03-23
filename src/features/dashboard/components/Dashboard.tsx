import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { StatCard } from '@/components/ui/Card/StatCard';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle, FolderKanban, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { exportToCSV } from '@/utils/export';
import { projectsService } from '@/features/projects/services/projects.api';
import { tasksService } from '@/features/tasks/services/tasks.api';
import { issuesService } from '@/features/issues/services/issues.api';
import { reportsService, ReportSummary } from '@/features/reports/services/reports.api';
import { timelogsService } from '@/features/timelogs/services/timelogs.api';
import { useToast } from '@/providers/ToastContext';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { useAuth } from '@/auth/AuthProvider';

const burndownData = [
  { week: 'Week 1', planned: 100, actual: 95 },
  { week: 'Week 2', planned: 85, actual: 82 },
  { week: 'Week 3', planned: 70, actual: 68 },
  { week: 'Week 4', planned: 55, actual: 58 },
  { week: 'Week 5', planned: 40, actual: 45 },
  { week: 'Week 6', planned: 25, actual: 30 },
  { week: 'Week 7', planned: 10, actual: 15 },
  { week: 'Week 8', planned: 0, actual: 5 },
];

const getArrayData = (res: any) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
};

export function Dashboard() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [taskStatusData, setTaskStatusData] = useState<any[]>([]);
  const [phaseStatusData, setPhaseStatusData] = useState<any[]>([]);
  const [issueSeverityData, setIssueSeverityData] = useState<any[]>([]);
  const [kpiCards, setKpiCards] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const navigate = useNavigate();

  const greeting = user?.first_name ? `Welcome back, ${user.first_name}` : 'Dashboard';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resSummary, resTasks, resProjects, resIssues] = await Promise.allSettled([
        reportsService.getSummary(),
        tasksService.getTasks(0, 1000),
        projectsService.getProjects(0, 1000),
        issuesService.getIssues(0, 1000)
      ]);

      const tasksData = getArrayData(resTasks.status === 'fulfilled' ? resTasks.value : []);
      const projectsData = getArrayData(resProjects.status === 'fulfilled' ? resProjects.value : []);
      const issuesData = getArrayData(resIssues.status === 'fulfilled' ? resIssues.value : []);

      const summaryData = resSummary.status === 'fulfilled' && resSummary.value ? resSummary.value : { 
        total_projects: projectsData.length, 
        active_projects: projectsData.filter((p: any) => !['Completed', 'Closed'].includes(p.status?.name || '')).length,
        total_tasks: tasksData.length, 
        completed_tasks: tasksData.filter((t: any) => t.status?.name === 'Completed').length,
        total_issues: issuesData.length, 
        open_issues: issuesData.filter((i: any) => !['Completed', 'Closed', 'Resolved'].includes(i.status?.name || '')).length,
        total_hours_logged: 0 
      };

      setRecentProjects(projectsData.slice(0, 3));

      // Process Tasks for Status Data
      const tStats: Record<string, number> = { 'Completed': 0, 'In Progress': 0, 'Pending': 0, 'Blocked': 0 };
      tasksData.forEach(t => {
        const name = t.status?.name || 'Pending';
        if (tStats[name] !== undefined) tStats[name]++;
        else tStats[name] = 1;
      });
      const tColors: Record<string, string> = { 'Completed': '#16A34A', 'In Progress': '#14b8a6', 'Pending': '#F59E0B', 'Blocked': '#DC2626' };
      setTaskStatusData(Object.entries(tStats).map(([name, value]) => ({ name, value, color: tColors[name] || '#8884d8' })));

      // Process Projects for Status Data
      const pStats: Record<string, number> = {};
      projectsData.forEach(p => {
        const name = p.status?.name || 'Planning';
        if (pStats[name]) pStats[name]++;
        else pStats[name] = 1;
      });
      const pColors = ['#8B5CF6', '#EC4899', '#14b8a6', '#F59E0B', '#16A34A', '#3B82F6'];
      setPhaseStatusData(Object.entries(pStats).map(([name, value], i) => ({ name, value, color: pColors[i % pColors.length] })));

      // Process Issues for Severity Data
      const iStats: Record<string, number> = { 'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0 };
      issuesData.forEach(i => {
        const name = i.priority?.name || 'Medium';
        if (iStats[name] !== undefined) iStats[name]++;
        else iStats[name] = 1;
      });
      setIssueSeverityData(Object.entries(iStats).map(([severity, count]) => ({ severity, count })));

      // Calculate KPIs
      const completionRate = summaryData.total_tasks > 0 ? Math.round((summaryData.completed_tasks / summaryData.total_tasks) * 100) : 0;
      
      setKpiCards([
        { title: 'Active Projects', value: (summaryData.active_projects || 0).toString(), change: `${summaryData.total_projects || 0} total`, trend: 'up', icon: <FolderKanban className="w-6 h-6" /> },
        { title: 'Total Tasks', value: (summaryData.total_tasks || 0).toString(), change: `${summaryData.completed_tasks || 0} completed`, trend: 'up', icon: <CheckCircle className="w-6 h-6" /> },
        { title: 'Open Issues', value: (summaryData.open_issues || 0).toString(), change: 'Real-time', trend: 'down', icon: <AlertCircle className="w-6 h-6" /> },
        { title: 'Hours Logged', value: (summaryData.total_hours_logged || 0).toFixed(1), change: 'This period', trend: 'up', icon: <Clock className="w-6 h-6" /> },
        { title: 'Completion Rate', value: `${completionRate}%`, change: `${summaryData.completed_tasks || 0}/${summaryData.total_tasks || 0} tasks`, trend: completionRate >= 50 ? 'up' : 'down', icon: <TrendingUp className="w-6 h-6" /> },
      ]);

    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };
  const handleExportSummary = () => {
    const exportData = kpiCards.map(kpi => ({
      'Metric': kpi.title,
      'Value': kpi.value,
      'Change': kpi.change,
      'Trend': kpi.trend === 'up' ? 'Positive' : 'Negative'
    }));
    exportToCSV(exportData, 'dashboard_summary.csv');
  };

  const handleDownloadReport = async (id: number) => {
    try {
      if (id === 1) {
        const rawProjects = await projectsService.getProjects(0, 1000);
        const projects = getArrayData(rawProjects);
        const mapped = projects.map((p: any) => ({
          'ID': p.public_id,
          'Name': p.name,
          'Client': p.client || 'N/A',
          'Status': p.status?.name || 'N/A',
          'Priority': p.priority?.name || 'N/A',
          'Start Date': p.start_date || 'N/A',
          'End Date': p.end_date || 'N/A'
        }));
        exportToCSV(mapped, 'project_status_report.csv');
        showToast('success', 'Exported', 'Project Status Report downloaded successfully.');
      } else if (id === 2) {
        const rawTimelogs = await timelogsService.getTimelogs(0, 1000);
        const timelogs = getArrayData(rawTimelogs);
        const mapped = timelogs.map((t: any) => ({
          'User': t.user ? `${t.user.first_name} ${t.user.last_name}` : 'N/A',
          'Task': t.task?.title || 'N/A',
          'Date': t.date.split('T')[0],
          'Hours': t.hours,
          'Description': t.description || 'N/A'
        }));
        exportToCSV(mapped, 'time_tracking_report.csv');
        showToast('success', 'Exported', 'Time Tracking Report downloaded successfully.');
      } else if (id === 3) {
        const rawIssues = await issuesService.getIssues(0, 1000);
        const issues = getArrayData(rawIssues);
        const mapped = issues.map((i: any) => ({
          'ID': i.public_id,
          'Title': i.title,
          'Project': i.project?.name || 'N/A',
          'Reporter': i.reporter ? `${i.reporter.first_name} ${i.reporter.last_name}` : 'N/A',
          'Assignee': i.assignee ? `${i.assignee.first_name} ${i.assignee.last_name}` : 'Unassigned',
          'Status': i.status?.name || 'N/A',
          'Priority': i.priority?.name || 'N/A'
        }));
        exportToCSV(mapped, 'issue_analysis_report.csv');
        showToast('success', 'Exported', 'Issue Analysis Report downloaded successfully.');
      }
    } catch (err) {
      showToast('error', 'Export Failed', 'An error occurred.');
    }
  };

  return (
    <PageLayout
      title={greeting}
      isFullHeight
      actions={
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <Button variant="outline" onClick={() => handleDownloadReport(1)}>
            <Download className="w-4 h-4 mr-2" /> Projects Report
          </Button>
          <Button variant="outline" onClick={() => handleDownloadReport(2)}>
            <Download className="w-4 h-4 mr-2" /> Time Report
          </Button>
          <Button variant="outline" onClick={() => handleDownloadReport(3)}>
            <Download className="w-4 h-4 mr-2" /> Issues Report
          </Button>
          <Button onClick={handleExportSummary}>
            <Download className="w-4 h-4 mr-2" /> Dashboard Summary
          </Button>
        </div>
      }
    >
      <div className="h-full flex flex-col overflow-auto space-y-6 pr-2">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {kpiCards.map((kpi, index) => (
            <StatCard
              key={index}
              label={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              change={kpi.change}
              trend={kpi.trend}
            />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Task Status Distribution */}
          <Card title="Task Status Distribution">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-[#14b8a6] text-3xl"></i></div>
            ) : taskStatusData.reduce((acc, curr) => acc + (curr.value || 0), 0) === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-theme-secondary font-medium italic border-2 border-dashed border-theme-border rounded-lg bg-theme-neutral">No Data Available</div>
            ) : (
              <div className="h-[300px] w-full min-w-0 overflow-hidden relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskStatusData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskStatusData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Phase Status Distribution */}
          <Card title="Phase Status Distribution">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-[#14b8a6] text-3xl"></i></div>
            ) : phaseStatusData.reduce((acc, curr) => acc + (curr.value || 0), 0) === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500 font-medium italic border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 dark:bg-slate-900 dark:border-slate-800">No Data Available</div>
            ) : (
              <div className="h-[300px] w-full min-w-0 overflow-hidden relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={phaseStatusData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {phaseStatusData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Issue Severity */}
          <Card title="Issue Severity Distribution">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-[#14b8a6] text-3xl"></i></div>
            ) : issueSeverityData.reduce((acc, curr) => acc + (curr.count || 0), 0) === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500 font-medium italic border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 dark:bg-slate-900 dark:border-slate-800">No Data Available</div>
            ) : (
              <div className="h-[300px] w-full min-w-0 overflow-hidden relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={issueSeverityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#14b8a6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Burndown Chart */}
          <Card title="Project Burndown">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-[#14b8a6] text-3xl"></i></div>
            ) : (
              <div className="h-[300px] w-full min-w-0 overflow-hidden relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={burndownData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="planned" stroke="#9CA3AF" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="actual" stroke="#14b8a6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-theme-primary">Recent Projects</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>View All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentProjects.map((project: any) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="card-base p-6 hover:shadow-xl hover:border-brand-teal-500/50 transition-all duration-500 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-teal-500/5 rounded-full blur-2xl group-hover:bg-brand-teal-500/10 transition-all duration-500" />
                
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-brand-teal-50 dark:bg-brand-teal-900/20 flex items-center justify-center text-brand-teal-600 dark:text-brand-teal-400 group-hover:bg-brand-teal-500 group-hover:text-white transition-all duration-300">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={project.status?.name || 'Active'} variant="status" />
                  </div>
                </div>
                
                <div className="relative z-10">
                  <h4 className="text-[15px] font-bold text-theme-primary mb-1.5 truncate group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-400 transition-colors">{project.name}</h4>
                  <p className="text-[12px] text-theme-muted mb-5 truncate font-medium">{project.client || 'Internal Project'}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-theme-border/50 relative z-10">
                  <div className="flex -space-x-2">
                    {project.users?.slice(0, 3).map((member: any) => (
                      <div 
                        key={member.id} 
                        className="w-7 h-7 rounded-full border-2 border-theme-bg bg-brand-teal-100 flex items-center justify-center text-[10px] font-bold text-brand-teal-700 shadow-sm"
                        title={member.first_name}
                      >
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </div>
                    ))}
                    {(project.users?.length || 0) > 3 && (
                      <div className="w-7 h-7 rounded-full border-2 border-theme-bg bg-theme-neutral flex items-center justify-center text-[10px] font-bold text-theme-secondary shadow-sm">
                        +{(project.users?.length || 0) - 3}
                      </div>
                    )}
                    {(!project.users || project.users.length === 0) && (
                      <div className="w-7 h-7 rounded-full border-2 border-theme-bg bg-theme-neutral flex items-center justify-center text-[10px] font-bold text-theme-muted shadow-sm">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] font-bold text-theme-muted uppercase tracking-wider group-hover:text-theme-secondary transition-colors">
                    View Details
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout >
  );
}
