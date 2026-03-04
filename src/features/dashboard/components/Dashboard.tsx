import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [taskStatusData, setTaskStatusData] = useState<any[]>([]);
  const [phaseStatusData, setPhaseStatusData] = useState<any[]>([]);
  const [issueSeverityData, setIssueSeverityData] = useState<any[]>([]);
  const [kpiCards, setKpiCards] = useState<any[]>([]);

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
        { title: 'Active Projects', value: activeProjects.toString(), change: 'Live', trend: 'up', icon: <FolderKanban className="w-6 h-6" /> },
        { title: 'Total Tasks', value: summaryData.total_tasks.toString(), change: 'Live', trend: 'up', icon: <CheckCircle className="w-6 h-6" /> },
        { title: 'Open Issues', value: summaryData.total_issues.toString(), change: 'Live', trend: 'down', icon: <AlertCircle className="w-6 h-6" /> },
        { title: 'Hours Logged', value: summaryData.total_hours_logged.toFixed(1), change: 'Live', trend: 'up', icon: <Clock className="w-6 h-6" /> },
        { title: 'Completion Rate', value: `${completionRate}%`, change: 'Live', trend: 'up', icon: <TrendingUp className="w-6 h-6" /> },
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
      title="Dashboard"
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
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {kpiCards.map((kpi, index) => (
            <div
              key={index}
              className="rounded-[6px] border-t-[3px] border-t-[#059669] p-4 hover:shadow-md transition-shadow dashboard-kpi-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[12px] mb-1 uppercase tracking-wider font-medium dashboard-kpi-label">{kpi.title}</p>
                  <p className="text-[28px] font-bold mb-2 dashboard-kpi-value">{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-[#16A34A]" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-[#DC2626]" />
                    )}
                    <span className={`text-[12px] font-medium ${kpi.trend === 'up' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Phase Status Distribution */}
          <Card title="Phase Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={phaseStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {phaseStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Issue Severity */}
          <Card title="Issue Severity Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issueSeverityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="severity" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Burndown Chart */}
          <Card title="Project Burndown">
            <ResponsiveContainer width="100%" height={300}>
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
          </Card>
        </div>
      </div>
    </PageLayout >
  );
}
