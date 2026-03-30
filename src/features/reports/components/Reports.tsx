import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from 'primereact/button';
import { DataTable } from '@/components/DataTable/DataTable';
import { StatCard } from '@/components/ui/Card/StatCard';
import { PageSpinner } from '@/components/ui/Loader/PageSpinner';
import { FileText, Download, Calendar, TrendingUp, Layers, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { reportsService, ReportSummary } from '@/features/reports/services/reports.api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/providers/ToastContext';
import { exportToCSV } from '@/utils/export';
import { projectsService } from '@/features/projects/services/projects.api';
import { timelogsService } from '@/features/timelogs/services/timelogs.api';
import { issuesService } from '@/features/issues/services/issues.api';

const getArrayData = (res: any) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  return [];
};

const reportTypes = [
  {
    id: 1,
    title: 'Project Status Report',
    description: 'Comprehensive overview of all active projects, their progress, and key metrics',
    icon: <FileText className="w-6 h-6" />,
    frequency: 'Weekly'
  },
  {
    id: 2,
    title: 'Time Tracking Report',
    description: 'Detailed breakdown of time logged by team members across projects and tasks',
    icon: <Calendar className="w-6 h-6" />,
    frequency: 'Monthly'
  },
  {
    id: 3,
    title: 'Issue Analysis Report',
    description: 'Analysis of issues by severity, status, and resolution time',
    icon: <TrendingUp className="w-6 h-6" />,
    frequency: 'Bi-weekly'
  }
];

export function Reports() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeReport, setActiveReport] = useState<number | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await reportsService.getSummary();
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch report summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const getReportMappedData = async (id: number) => {
    if (id === 1) {
      const res = await projectsService.getProjects(0, 1000);
      const projects = getArrayData(res);
      return projects.map((p: any, index: number) => ({
        id: p.id || index,
        'Project ID': p.public_id,
        'Name': p.name,
        'Client': p.client || 'N/A',
        'Status': p.status?.name || 'N/A',
        'Priority': p.priority?.name || 'N/A',
        'Start Date': p.start_date || 'N/A',
        'End Date': p.end_date || 'N/A'
      }));
    } else if (id === 2) {
      const res = await timelogsService.getTimelogs(0, 1000);
      const timelogs = getArrayData(res);
      return timelogs.map((t: any, index: number) => ({
        id: t.id || index,
        'User': t.user ? `${t.user.first_name} ${t.user.last_name}` : 'N/A',
        'Task': t.task?.title || 'N/A',
        'Date': t.date.split('T')[0],
        'Hours': t.hours,
        'Description': t.description || 'N/A'
      }));
    } else if (id === 3) {
      const res = await issuesService.getIssues(0, 1000);
      const issues = getArrayData(res);
      return issues.map((i: any, index: number) => ({
        id: i.id || index,
        'Issue ID': i.public_id,
        'Title': i.title,
        'Project': i.project?.name || 'N/A',
        'Reporter': i.reporter ? `${i.reporter.first_name} ${i.reporter.last_name}` : 'N/A',
        'Assignee': i.assignee ? `${i.assignee.first_name} ${i.assignee.last_name}` : 'Unassigned',
        'Status': i.status?.name || 'N/A',
        'Priority': i.priority?.name || 'N/A'
      }));
    }
    return [];
  };

  const handleView = async (id: number) => {
    setLoading(true);
    try {
      const mapped = await getReportMappedData(id);
      setReportData(mapped);
      setActiveReport(id);
    } catch (err) {
      console.error(err);
      showToast('error', 'View Failed', 'Failed to load the report data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const mapped = await getReportMappedData(id);
      if (id === 1) {
        exportToCSV(mapped as Record<string, any>[], 'project_status_report.csv');
        showToast('success', 'Exported', 'Project Status Report downloaded successfully.');
      }
      else if (id === 2) {
        exportToCSV(mapped as Record<string, any>[], 'time_tracking_report.csv');
        showToast('success', 'Exported', 'Time Tracking Report downloaded successfully.');
      }
      else if (id === 3) {
        exportToCSV(mapped as Record<string, any>[], 'issue_analysis_report.csv');
        showToast('success', 'Exported', 'Issue Analysis Report downloaded successfully.');
      }
    } catch (error) {
      console.error('Failed to export report:', error);
      showToast('error', 'Export Failed', 'An error occurred while exporting the report.');
    }
  };

  const handleExportAll = async () => {
    await handleDownload(1);
    await handleDownload(2);
    await handleDownload(3);
    showToast('success', 'All Reports Exported', 'All reports have been downloaded successfully.');
  };

  return (
    <PageLayout
      title="Reports"
      isFullHeight
      actions={
        <Button onClick={handleExportAll} className="btn-gradient">
          <Download className="w-4 h-4 mr-2" />
          Export All Reports
        </Button>
      }
    >
      <div className="h-full flex flex-col overflow-hidden space-y-6">
        <div className="flex-1 overflow-auto space-y-6 pr-2">
          <Card title="Live Statistics">
            {loading ? (
              <div className="p-2"><PageSpinner label="Fetching stats" /></div>
            ) : summary ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                <StatCard label="Total Projects" value={summary.total_projects} icon={<Layers className="w-4 h-4" />} />
                <StatCard label="Total Tasks" value={summary.total_tasks} icon={<CheckCircle className="w-4 h-4" />} />
                <StatCard label="Total Issues" value={summary.total_issues} icon={<AlertCircle className="w-4 h-4" />} />
                <StatCard label="Hours Logged" value={`${summary.total_hours_logged.toFixed(1)}h`} icon={<Clock className="w-4 h-4" />} />
              </div>
            ) : (
              <div className="p-6 text-center text-red-400 font-bold text-sm">Failed to load statistics. Backend may be restarting.</div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report) => (
              <Card key={report.id}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-brand-teal-50 rounded-md flex items-center justify-center text-brand-teal-600 flex-shrink-0">
                    {report.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold mb-1 text-theme-primary">{report.title}</h3>
                    <p className="text-[14px] mb-3 text-theme-secondary">{report.description}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <span className="text-[12px] text-theme-secondary">
                        Frequency: <span className="font-medium text-theme-primary">{report.frequency}</span>
                      </span>
                      <div className="flex gap-2">
                        <Button outlined onClick={() => handleView(report.id)} label="View" className="px-3" />
                        <Button onClick={() => handleDownload(report.id)} className="px-3">
                          <Download className="w-4 h-4 mr-1.5" />
                          <span className="font-semibold">Download</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {activeReport !== null && (
            <Card
              title={reportTypes.find(r => r.id === activeReport)?.title || 'Report Details'}
              actions={
                <Button text onClick={() => setActiveReport(null)}>Close Report</Button>
              }
            >
              <div className="overflow-hidden">
                {reportData.length > 0 ? (
                  <DataTable
                    columns={
                      activeReport === 1 ? [
                        { key: 'Project ID', header: 'ID', sortable: true },
                        { key: 'Name', header: 'Project Name', sortable: true },
                        { key: 'Client', header: 'Client' },
                        { key: 'Status', header: 'Status' },
                        { key: 'Priority', header: 'Priority' }
                      ] : activeReport === 2 ? [
                        { key: 'User', header: 'User', sortable: true },
                        { key: 'Task', header: 'Task' },
                        { key: 'Date', header: 'Date', sortable: true },
                        { key: 'Hours', header: 'Hours', render: (val) => `${Number(val).toFixed(1)}h` },
                        { key: 'Description', header: 'Description' }
                      ] : activeReport === 3 ? [
                        { key: 'Issue ID', header: 'ID', sortable: true },
                        { key: 'Title', header: 'Title', sortable: true },
                        { key: 'Project', header: 'Project' },
                        { key: 'Status', header: 'Status' },
                        { key: 'Priority', header: 'Severity' }
                      ] : []
                    }
                    data={reportData}
                    itemsPerPage={10}
                  />
                ) : (
                  <div className="p-8 text-center text-[#6B7280]">No data available for this report.</div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
