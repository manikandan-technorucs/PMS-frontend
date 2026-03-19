import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle, FolderKanban, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button/Button';
import { exportToCSV } from '@/shared/utils/export';
import { projectsService } from '@/features/projects/services/projects.api';
import { tasksService } from '@/features/tasks/services/tasks.api';
import { issuesService } from '@/features/issues/services/issues.api';
import { reportsService, ReportSummary } from '@/features/reports/services/reports.api';
import { timelogsService } from '@/features/timelogs/services/timelogs.api';
import { useToast } from '@/shared/context/ToastContext';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { useAuth } from '@/shared/context/AuthContext';

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
      const [summaryData, tasksData, projectsData, issuesData] = await Promise.all([
        reportsService.getSummary(),
        tasksService.getTasks(0, 1000),
        projectsService.getProjects(0, 1000),
        issuesService.getIssues(0, 1000)
      ]);

      setRecentProjects(projectsData.slice(0, 3));

      // Process Tasks for Status Data
      const tStats: Record<string, number> = { 'Completed': 0, 'In Progress': 0, 'Pending': 0, 'Blocked': 0 };
      tasksData.forEach(t => {
        const name = t.status?.name || 'Pending';
        if (tStats[name] !== undefined) tStats[name]++;
        else tStats[name] = 1;
      });
      const tColors: Record<string, string> = { 'Completed': '#16A34A', 'In Progress': '#059669', 'Pending': '#F59E0B', 'Blocked': '#DC2626' };
      setTaskStatusData(Object.entries(tStats).map(([name, value]) => ({ name, value, color: tColors[name] || '#8884d8' })));

      // Process Projects for Status Data
      const pStats: Record<string, number> = {};
      projectsData.forEach(p => {
        const name = p.status?.name || 'Planning';
        if (pStats[name]) pStats[name]++;
        else pStats[name] = 1;
      });
      const pColors = ['#8B5CF6', '#EC4899', '#059669', '#F59E0B', '#16A34A', '#3B82F6'];
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
      const completedTasks = tasksData.filter(t => t.status?.name === 'Completed').length;
      const completionRate = summaryData.total_tasks > 0 ? Math.round((completedTasks / summaryData.total_tasks) * 100) : 0;
      const activeProjects = projectsData.filter(p => ['Active', 'In Progress'].includes(p.status?.name || '')).length;

      setKpiCards([
        { title: 'Active Projects', value: activeProjects.toString(), change: `${projectsData.length} total`, trend: 'up', icon: <FolderKanban className="w-6 h-6" /> },
        { title: 'Total Tasks', value: summaryData.total_tasks.toString(), change: `${completedTasks} completed`, trend: 'up', icon: <CheckCircle className="w-6 h-6" /> },
        { title: 'Open Issues', value: summaryData.total_issues.toString(), change: 'Real-time', trend: 'down', icon: <AlertCircle className="w-6 h-6" /> },
        { title: 'Hours Logged', value: summaryData.total_hours_logged.toFixed(1), change: 'This period', trend: 'up', icon: <Clock className="w-6 h-6" /> },
        { title: 'Completion Rate', value: `${completionRate}%`, change: `${completedTasks}/${summaryData.total_tasks} tasks`, trend: completionRate >= 50 ? 'up' : 'down', icon: <TrendingUp className="w-6 h-6" /> },
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
        const projects = await projectsService.getProjects(0, 1000);
        const mapped = projects.map(p => ({
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
        const timelogs = await timelogsService.getTimelogs(0, 1000);
        const mapped = timelogs.map(t => ({
          'User': t.user ? `${t.user.first_name} ${t.user.last_name}` : 'N/A',
          'Task': t.task?.title || 'N/A',
          'Date': t.date.split('T')[0],
          'Hours': t.hours,
          'Description': t.description || 'N/A'
        }));
        exportToCSV(mapped, 'time_tracking_report.csv');
        showToast('success', 'Exported', 'Time Tracking Report downloaded successfully.');
      } else if (id === 3) {
        const issues = await issuesService.getIssues(0, 1000);
        const mapped = issues.map(i => ({
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
            <div
              key={index}
              className="card-base border-t-[3px] border-t-brand-teal-500 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[11px] mb-1 uppercase tracking-wider font-semibold text-theme-secondary">{kpi.title}</p>
                  <p className="text-[28px] font-bold mb-2 text-theme-primary">{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-[#16A34A]" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-[#DC2626]" />
                    )}
                    <span className={`text-[12px] font-medium ${kpi.trend === 'up' ? 'text-green-600 dark:text-green-500' : 'text-red-500'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-brand-teal-50 dark:bg-brand-teal-900/30 flex items-center justify-center text-brand-teal-600 dark:text-brand-teal-400">
                  {kpi.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Task Status Distribution */}
          <Card title="Task Status Distribution">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-[#059669] text-3xl"></i></div>
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
              <div className="h-[300px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-[#059669] text-3xl"></i></div>
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
              <div className="h-[300px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-[#059669] text-3xl"></i></div>
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
                    <Bar dataKey="count" fill="#059669" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Burndown Chart */}
          <Card title="Project Burndown">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-[#059669] text-3xl"></i></div>
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
                    <Line type="monotone" dataKey="actual" stroke="#059669" strokeWidth={2} />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentProjects.map((project: any) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="card-base p-4 hover:shadow-md hover:border-brand-teal-500 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-teal-50 dark:bg-brand-teal-900/30 flex items-center justify-center text-brand-teal-600 dark:text-brand-teal-400 group-hover:bg-brand-teal-600 group-hover:text-white transition-colors">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <StatusBadge status={project.status?.name || 'Active'} variant="status" />
                </div>
                <h4 className="font-bold text-theme-primary mb-1 truncate">{project.name}</h4>
                <p className="text-[12px] text-theme-secondary mb-4 truncate">{project.client || 'Internal Project'}</p>
                <div className="flex items-center justify-between pt-3 border-t border-theme-border">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-theme-neutral border-2 border-theme-surface flex items-center justify-center text-[10px] font-bold text-theme-secondary">
                        U{i}
                      </div>
                    ))}
                  </div>
                  <span className="text-[12px] text-theme-muted">{project.public_id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout >
  );
}
