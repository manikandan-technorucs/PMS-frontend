import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { reportsService, ReportSummary } from '@/services/reports';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { exportToCSV } from '@/utils/export';
import { projectsService } from '@/services/projects';
import { timelogsService } from '@/services/timelogs';
import { issuesService } from '@/services/issues';

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
      const projects = await projectsService.getProjects(0, 1000);
      return projects.map((p, index) => ({
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
      const timelogs = await timelogsService.getTimelogs(0, 1000);
      return timelogs.map((t, index) => ({
        id: t.id || index,
        'User': t.user ? `${t.user.first_name} ${t.user.last_name}` : 'N/A',
        'Task': t.task?.title || 'N/A',
        'Date': t.date.split('T')[0],
        'Hours': t.hours,
        'Description': t.description || 'N/A'
      }));
    } else if (id === 3) {
      const issues = await issuesService.getIssues(0, 1000);
      return issues.map((i, index) => ({
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
      actions={
        <Button onClick={handleExportAll}>
          <Download className="w-4 h-4 mr-2" />
          Export All Reports
        </Button>
      }
    >
      <div className="space-y-6">
        <Card title="Quick Stats (Live from DB)">
          {loading ? (
            <p className="p-4">Loading stats...</p>
          ) : summary ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[12px] mb-1 text-theme-secondary">Total Projects</p>
                <p className="text-[24px] font-semibold text-theme-primary">{summary.total_projects}</p>
              </div>
              <div>
                <p className="text-[12px] mb-1 text-theme-secondary">Total Tasks</p>
                <p className="text-[24px] font-semibold text-theme-primary">{summary.total_tasks}</p>
              </div>
              <div>
                <p className="text-[12px] mb-1 text-theme-secondary">Total Issues</p>
                <p className="text-[24px] font-semibold text-theme-primary">{summary.total_issues}</p>
              </div>
              <div>
                <p className="text-[12px] mb-1 text-theme-secondary">Total Hours Logged</p>
                <p className="text-[24px] font-semibold text-theme-primary">{summary.total_hours_logged.toFixed(1)}h</p>
              </div>
            </div>
          ) : (
            <p className="p-4 text-red-500">Failed to load statistics</p>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report) => (
            <Card key={report.id}>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#ECFDF5] rounded-[6px] flex items-center justify-center text-[#059669] flex-shrink-0">
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
                      <Button size="sm" variant="outline" onClick={() => handleView(report.id)}>View</Button>
                      <Button size="sm" onClick={() => handleDownload(report.id)}>
                        <Download className="w-3 h-3 mr-1" />
                        Download
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
              <Button variant="ghost" onClick={() => setActiveReport(null)}>Close Report</Button>
            }
          >
            <div className="overflow-x-auto">
              {reportData.length > 0 ? (
                <table className="min-w-full divide-y divide-[#E5E7EB]">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      {Object.keys(reportData[0]).filter(k => k !== 'id').map((heading) => (
                        <th key={heading} className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E5E7EB]">
                    {reportData.map((row) => (
                      <tr key={row.id}>
                        {Object.keys(row).filter(k => k !== 'id').map((key) => (
                          <td key={key} className="px-6 py-4 whitespace-nowrap text-[14px] text-[#374151]">
                            {row[key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-[#6B7280]">No data available for this report.</div>
              )}
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
