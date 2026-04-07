import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/layout/Card';
import { Button } from '@/components/forms/Button';
import { DataTable } from '@/components/data-display/DataTable';
import { StatCard, StatCardProps } from '@/components/data-display/StatCard';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { FileText, Download, Calendar, TrendingUp, Layers, AlertCircle, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { reportsService, ReportSummary } from '@/features/reports/api/reports.api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/providers/ToastContext';
import { exportToCSV } from '@/utils/export';
import { projectsService } from '@/features/projects/api/projects.api';
import { timelogsService } from '@/features/timelogs/api/timelogs.api';
import { issuesService } from '@/features/issues/api/issues.api';
import { motion, AnimatePresence } from 'framer-motion';

const getArrayData = (res: any) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  return [];
};

const reportTypes = [
  {
    id: 1,
    title: 'Project Status Report',
    description: 'Comprehensive overview of all active projects, their progress, and key metrics.',
    icon: <FileText className="w-6 h-6" />,
    frequency: 'Weekly',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
  },
  {
    id: 2,
    title: 'Time Tracking Report',
    description: 'Detailed breakdown of time logged by team members across projects and tasks.',
    icon: <Calendar className="w-6 h-6" />,
    frequency: 'Monthly',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
  },
  {
    id: 3,
    title: 'Issue Analysis Report',
    description: 'Analysis of issues by severity, status, and resolution time logic.',
    icon: <TrendingUp className="w-6 h-6" />,
    frequency: 'Bi-weekly',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
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
      const res = await issuesService.getIssues({ skip: 0, limit: 1000 });
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
    setLoading(true);
    await handleDownload(1);
    await handleDownload(2);
    await handleDownload(3);
    setLoading(false);
    showToast('success', 'All Reports Exported', 'All reports have been downloaded successfully.');
  };

  const liveStats: StatCardProps[] = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "Total Projects", value: summary.total_projects, icon: <Layers size={18} strokeWidth={2}/>, accentVariant: 'teal' },
      { label: "Total Tasks", value: summary.total_tasks, icon: <CheckCircle size={18} strokeWidth={2}/>, accentVariant: 'teal' },
      { label: "Total Issues", value: summary.total_issues, icon: <AlertCircle size={18} strokeWidth={2}/>, accentVariant: 'amber' },
      { label: "Hours Logged", value: `${summary.total_hours_logged.toFixed(1)}h`, icon: <Clock size={18} strokeWidth={2}/>, accentVariant: 'rose' },
    ] as StatCardProps[];
  }, [summary]);

  return (
    <PageLayout
      title="System Reports"
      isFullHeight
      actions={
        !activeReport ? (
          <Button variant="primary" size="md" onClick={handleExportAll}>
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export All</span>
          </Button>
        ) : (
          <Button variant="secondary" size="md" onClick={() => handleDownload(activeReport)}>
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Download Data</span>
          </Button>
        )
      }
    >
      <div className="h-full flex flex-col space-y-6 overflow-hidden relative">

        {}
        <AnimatePresence mode="wait">
          {!activeReport ? (
            <motion.div 
               key="catalog"
               initial={{ opacity: 0, y: 15 }} 
               animate={{ opacity: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.98 }}
               transition={{ duration: 0.3 }}
               className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 pb-6 custom-scrollbar"
            >
              {}
              {loading && !summary ? (
                 <div className="py-12"><PageSpinner label="Syncing Telemetry..." /></div>
              ) : summary ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 flex-shrink-0">
                  {liveStats.map((stat, i) => (
                    <StatCard key={i} {...stat} className="h-full" />
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center text-red-500 font-bold border-red-200">System Telemetry Currently Offline</Card>
              )}

              {}
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-[16px] font-bold tracking-tight text-slate-800 dark:text-white">Report Catalog</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 flex-1 min-h-0">
                {reportTypes.map((report) => (
                  <Card key={report.id} glass={true} className="flex flex-col overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200/60 dark:border-slate-800 p-0" pt={{ content: { className: 'p-0 w-full h-full flex flex-col' } }}>
                    {}
                    <div className="h-2 w-full" style={{ background: report.gradient }}></div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div 
                          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
                          style={{ color: report.gradient.split(', ')[1].split(' ')[0] }}
                        >
                          {report.icon}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">{report.frequency}</span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{report.title}</h3>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6 flex-1 leading-relaxed">{report.description}</p>
                      
                      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
                        <Button variant="secondary" className="flex-1" onClick={() => handleView(report.id)}>
                          View Data
                        </Button>
                        <Button variant="primary" className="flex-1" onClick={() => handleDownload(report.id)}>
                           <Download className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Download</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dataview"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col overflow-hidden"
            >
              <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setActiveReport(null)} className="h-9 w-9 p-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                    {reportTypes.find(r => r.id === activeReport)?.title}
                  </h2>
                </div>
                <span className="text-[12px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full inline-flex self-start sm:self-auto">{reportData.length} Records Loading</span>
              </div>
              
              <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-[var(--shadow-premium)] overflow-hidden">
                {loading ? (
                   <div className="h-full w-full flex items-center justify-center"><PageSpinner label="Aggregating Report Data..." /></div>
                ) : reportData.length > 0 ? (
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
                    itemsPerPage={15}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                    <FileText className="w-12 h-12 mb-3 opacity-20" />
                    <span className="font-bold">No telemetry captured for this report.</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageLayout>
  );
}
