import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle,
  FolderKanban, Download, Activity, Users, ArrowUpRight, Zap
} from 'lucide-react';
import { Button } from 'primereact/button';
import { exportToCSV } from '@/utils/export';
import { projectsService } from '@/features/projects/services/projects.api';
import { tasksService } from '@/features/tasks/services/tasks.api';
import { issuesService } from '@/features/issues/services/issues.api';
import { reportsService } from '@/features/reports/services/reports.api';
import { timelogsService } from '@/features/timelogs/services/timelogs.api';
import { useToast } from '@/providers/ToastContext';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { useAuth } from '@/auth/AuthProvider';

const getArrayData = (res: any) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
};

/* ─── Animated Counter ─────────────────────────────────────────────── */
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [display, setDisplay] = useState('0');
  const prevRef = useRef(0);
  useEffect(() => {
    const target = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    const start = prevRef.current;
    prevRef.current = target;
    if (target === start) { setDisplay(value); return; }
    let frame = 0;
    const total = 30;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / total;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased * 10) / 10;
      const hasDecimal = value.includes('.');
      setDisplay(hasDecimal ? current.toFixed(1) : Math.round(current).toString());
      if (frame >= total) { clearInterval(timer); setDisplay(value.replace(/[^0-9.%]/g, '') + suffix); }
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

/* ─── KPI Card ─────────────────────────────────────────────────────── */
function KpiCard({ title, value, change, trend, icon, gradient }: {
  title: string; value: string; change: string; trend: 'up' | 'down';
  icon: React.ReactNode; gradient: string;
}) {
  return (
    <div className="card-base p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border border-slate-200/60 dark:border-slate-800">
      <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: gradient }} />
      <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500" style={{ background: gradient }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-xl" style={{ background: `${gradient}18` }}>
            <div style={{ color: gradient }}>{icon}</div>
          </div>
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${trend === 'up'
              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
              : 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400'
            }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          </div>
        </div>
        <p className="text-[32px] tracking-tight font-black text-slate-800 dark:text-white leading-none mb-1">
          <AnimatedCounter value={value} />
        </p>
        <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{change}</p>
      </div>
    </div>
  );
}

/* ─── Custom Tooltip ────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl text-xs">
      {label && <p className="text-slate-400 font-bold mb-1 uppercase tracking-wider">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color || p.fill }}>
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ─── Dashboard ─────────────────────────────────────────────────────── */
export function Dashboard() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [taskStatusData, setTaskStatusData] = useState<any[]>([]);
  const [phaseStatusData, setPhaseStatusData] = useState<any[]>([]);
  const [issueSeverityData, setIssueSeverityData] = useState<any[]>([]);
  const [projectTaskProgressData, setProjectTaskProgressData] = useState<any[]>([]);
  const [kpiCards, setKpiCards] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const greeting = (() => {
    const h = currentTime.getHours();
    const name = user?.first_name ? `, ${user.first_name}` : '';
    if (h < 12) return `Good morning${name} ☀️`;
    if (h < 17) return `Good afternoon${name} 👋`;
    return `Good evening${name} 🌙`;
  })();

  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [resSummary, resTasks, resProjects, resIssues] = await Promise.allSettled([
        reportsService.getSummary(),
        tasksService.getTasks(0, 1000),
        projectsService.getProjects(0, 1000),
        issuesService.getIssues(0, 1000)
      ]);

      const tasks = getArrayData(resTasks.status === 'fulfilled' ? resTasks.value : []);
      const projects = getArrayData(resProjects.status === 'fulfilled' ? resProjects.value : []);
      const issues = getArrayData(resIssues.status === 'fulfilled' ? resIssues.value : []);

      const summary = (resSummary.status === 'fulfilled' && resSummary.value) ? resSummary.value : {
        total_projects: projects.length,
        active_projects: projects.filter((p: any) => !['Completed', 'Closed'].includes(p.status?.name || '')).length,
        total_tasks: tasks.length,
        completed_tasks: tasks.filter((t: any) => t.status?.name === 'Completed').length,
        total_issues: issues.length,
        open_issues: issues.filter((i: any) => !['Completed', 'Closed', 'Resolved'].includes(i.status?.name || '')).length,
        total_hours_logged: 0
      };

      setRecentProjects(projects.slice(0, 3));

      // Task status donut
      const tStats: Record<string, number> = {};
      tasks.forEach((t: any) => {
        const n = t.status?.name || 'Pending';
        tStats[n] = (tStats[n] || 0) + 1;
      });
      const tColors: Record<string, string> = { 'Pending': '#94A3B8', 'In Progress': '#3B82F6', 'Completed': '#10B981', 'Blocked': '#F43F5E' };
      setTaskStatusData(Object.entries(tStats).map(([name, value]) => ({ name, value, color: tColors[name] || '#8B5CF6' })));

      // Project phase status
      const pStats: Record<string, number> = {};
      projects.forEach((p: any) => { const n = p.status?.name || 'Planning'; pStats[n] = (pStats[n] || 0) + 1; });
      const pColors = ['#6366F1', '#8B5CF6', '#14B8A6', '#F59E0B', '#EC4899', '#0EA5E9'];
      setPhaseStatusData(Object.entries(pStats).map(([name, value], i) => ({ name, value, color: pColors[i % pColors.length] })));

      // Issue severity
      const iStats: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
      issues.forEach((i: any) => { const n = i.priority?.name || 'Medium'; iStats[n] = (iStats[n] || 0) + 1; });
      const iColors: Record<string, string> = { Critical: '#EF4444', High: '#F97316', Medium: '#F59E0B', Low: '#3B82F6' };
      setIssueSeverityData(Object.entries(iStats).map(([severity, count]) => ({ severity, count, fill: iColors[severity] || '#8B5CF6' })));

      const completionRate = summary.total_tasks > 0
        ? Math.round((summary.completed_tasks / summary.total_tasks) * 100) : 0;

      // Real DB Data for Project Task Progress insight
      const activeProjectsWithTasks = projects
        .filter((p: any) => p.status?.name !== 'Completed' && p.status?.name !== 'Closed')
        .map((p: any) => {
          const pTasks = tasks.filter((t: any) => t.project_id === p.id || t.project?.id === p.id);
          const completedCount = pTasks.filter((t: any) => t.status?.name === 'Completed').length;
          return {
            name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
            total: pTasks.length,
            completed: completedCount,
          };
        })
        .sort((a: any, b: any) => b.total - a.total) // Always show the most active projects first
        .slice(0, 8); // Limits to 8 so the chart is never squished
      setProjectTaskProgressData(activeProjectsWithTasks);

      const kpiDefs = [
        { title: 'Active Projects', value: String(summary.active_projects || 0), change: `${summary.total_projects || 0} total projects`, trend: 'up', icon: <FolderKanban className="w-5 h-5" />, gradient: '#14b8a6' },
        { title: 'Total Tasks', value: String(summary.total_tasks || 0), change: `${summary.completed_tasks || 0} completed`, trend: 'up', icon: <CheckCircle className="w-5 h-5" />, gradient: '#8B5CF6' },
        { title: 'Open Issues', value: String(summary.open_issues || 0), change: 'Requires attention', trend: 'down', icon: <AlertCircle className="w-5 h-5" />, gradient: '#EF4444' },
        { title: 'Hours Logged', value: (summary.total_hours_logged || 0).toFixed(1), change: 'This period', trend: 'up', icon: <Clock className="w-5 h-5" />, gradient: '#3B82F6' },
        { title: 'Completion Rate', value: `${completionRate}%`, change: `${summary.completed_tasks || 0}/${summary.total_tasks || 0} tasks done`, trend: completionRate >= 50 ? 'up' : 'down', icon: <TrendingUp className="w-5 h-5" />, gradient: '#10B981' },
      ];
      setKpiCards(kpiDefs as any);
    } catch (e) {
      console.error('Dashboard data error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (id: number) => {
    try {
      if (id === 1) {
        const projects = getArrayData(await projectsService.getProjects(0, 1000));
        exportToCSV(projects.map((p: any) => ({
          ID: p.public_id, Name: p.name, Client: p.client || 'N/A',
          Status: p.status?.name || 'N/A', Priority: p.priority?.name || 'N/A',
          Start: p.start_date || 'N/A', End: p.end_date || 'N/A'
        })), 'project_status_report.csv');
        showToast('success', 'Exported', 'Project Status Report downloaded.');
      } else if (id === 2) {
        const logs = getArrayData(await timelogsService.getTimelogs(0, 1000));
        exportToCSV(logs.map((t: any) => ({
          User: t.user ? `${t.user.first_name} ${t.user.last_name}` : 'N/A',
          Task: t.task?.title || 'N/A', Date: t.date.split('T')[0],
          Hours: t.hours, Description: t.description || 'N/A'
        })), 'time_tracking_report.csv');
        showToast('success', 'Exported', 'Time Tracking Report downloaded.');
      } else if (id === 3) {
        const issues = getArrayData(await issuesService.getIssues(0, 1000));
        exportToCSV(issues.map((i: any) => ({
          ID: i.public_id, Title: i.title, Project: i.project?.name || 'N/A',
          Reporter: i.reporter ? `${i.reporter.first_name} ${i.reporter.last_name}` : 'N/A',
          Assignee: i.assignee ? `${i.assignee.first_name} ${i.assignee.last_name}` : 'Unassigned',
          Status: i.status?.name || 'N/A', Priority: i.priority?.name || 'N/A'
        })), 'issue_analysis_report.csv');
        showToast('success', 'Exported', 'Issue Analysis Report downloaded.');
      }
    } catch { showToast('error', 'Export Failed', 'An error occurred.'); }
  };

  const chartCardClass ="card-base flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500 overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900";

  return (
    <PageLayout isFullHeight>
      <div className="h-full flex flex-col overflow-auto pr-1 pb-8 pt-2 space-y-8">

        {/* Modern Immersive Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-teal-500/20 ring-4 ring-white dark:ring-slate-900">
              {user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || ''}
            </div>
            <div>
              <h1 className="text-[24px] sm:text-[32px] font-black text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-none mb-2 break-words">
                {greeting}
              </h1>
              <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-500 animate-pulse flex-shrink-0" />
                <span>Here's what's happening today • {dateStr}</span>
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <Button outlined onClick={() => handleDownloadReport(1)} className="bg-white/50 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Download className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Projects</span>
            </Button>
            <Button outlined onClick={() => handleDownloadReport(2)} className="bg-white/50 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Download className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Time</span>
            </Button>
            <Button outlined onClick={() => handleDownloadReport(3)} className="bg-white/50 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Download className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Issues</span>
            </Button>
          </div>
        </div>

        {/* ── KPI Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {loading
            ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
            ))
            : kpiCards.map((kpi, i) => <KpiCard key={i} {...kpi} />)
          }
        </div>

        {/* ── Charts Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Project Task Progress (Spans 2 columns on large screens) */}
          <div className={`${chartCardClass} xl:col-span-2`}>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-4 bg-teal-500 rounded-full"></div>
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Top Active Projects Task Progress</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md">Live Sync</span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-center">
              {loading ? <div className="h-[260px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-teal-500 text-3xl" /></div> : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={projectTaskProgressData} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#33415510" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3341550a' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} />
                    <Bar dataKey="total" name="Total Tasks" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="completed" name="Completed Tasks" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Task Status Donut */}
          <div className={`${chartCardClass} xl:col-span-1`}>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Global Tasks Status</h3>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-center">
              {loading ? <div className="h-[260px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-teal-500 text-3xl" /></div>
                : taskStatusData.reduce((a, c) => a + c.value, 0) === 0
                  ? <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">No data yet</div>
                  : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={taskStatusData.filter(d => d.value > 0)} cx="50%" cy="50%"
                          innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value"
                          label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                          labelLine={false}
                          stroke="none"
                        >
                          {taskStatusData.filter(d => d.value > 0).map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
            </div>
          </div>

          {/* Project Phase Donut */}
          <div className={`${chartCardClass} xl:col-span-1`}>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Project Phases</h3>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-center">
              {loading ? <div className="h-[260px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-teal-500 text-3xl" /></div>
                : phaseStatusData.reduce((a, c) => a + c.value, 0) === 0
                  ? <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">No data yet</div>
                  : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={phaseStatusData.filter(d => d.value > 0)} cx="50%" cy="50%"
                          innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value"
                          label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                          labelLine={false}
                          stroke="none"
                        >
                          {phaseStatusData.filter(d => d.value > 0).map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
            </div>
          </div>

          {/* Issue Severity (Spans 2 cols) */}
          <div className={`${chartCardClass} xl:col-span-2`}>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-4 bg-rose-500 rounded-full"></div>
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Issue Severity Matrix</h3>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-center">
              {loading ? <div className="h-[260px] flex items-center justify-center"><i className="pi pi-spin pi-spinner text-teal-500 text-3xl" /></div>
                : issueSeverityData.reduce((a, c) => a + c.count, 0) === 0
                  ? <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">No data yet</div>
                  : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={issueSeverityData} barCategoryGap="30%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#33415510" vertical={false} />
                        <XAxis dataKey="severity" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3341550a' }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} />
                        <Bar dataKey="count" name="Open Issues" radius={[6, 6, 0, 0]} barSize={32}>
                          {issueSeverityData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
            </div>
          </div>
        </div>

        {/* ── Recent Projects ───────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800/60 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 rounded-xl">
                <FolderKanban className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-[15px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Recent Active Projects</h3>
            </div>
            <Button outlined onClick={() => navigate('/projects')} className="font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              View Directory <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />)}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 text-sm">
              <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No projects yet. <Button unstyled onClick={() => navigate('/projects/create')} className="text-teal-500 hover:underline">Create one →</Button></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentProjects.map((project: any) => {
                const statusColors: Record<string, string> = {
                  'In Progress': '#14b8a6', 'Planning': '#8B5CF6', 'Completed': '#10B981',
                  'On Hold': '#F59E0B', 'Cancelled': '#EF4444'
                };
                const accent = statusColors[project.status?.name || ''] || '#8B5CF6';
                return (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="card-base p-6 hover:shadow-xl hover:-translate-y-1 hover:border-teal-500/30 transition-all duration-300 cursor-pointer relative overflow-hidden group border border-slate-200/60 dark:border-slate-800"
                  >
                    {/* top accent strip */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] opacity-90" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}bb)` }} />
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500"
                      style={{ background: accent }} />

                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="p-2.5 rounded-xl" style={{ background: `${accent}15` }}>
                        <FolderKanban className="w-5 h-5" style={{ color: accent }} />
                      </div>
                      <StatusBadge status={project.status?.name || 'Active'} variant="status" />
                    </div>

                    <div className="relative z-10 mb-4">
                      <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{project.name}</h4>
                      <p className="text-[12px] text-slate-500 font-medium mt-0.5 truncate">{project.client || 'Internal Project'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800 relative z-10">
                      <div className="flex -space-x-2">
                        {project.users?.slice(0, 4).map((m: any) => (
                          <div key={m.id} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-[9px] font-black text-white shadow-sm" title={`${m.first_name} ${m.last_name}`}>
                            {m.first_name?.[0]}{m.last_name?.[0]}
                          </div>
                        ))}
                        {(project.users?.length || 0) > 4 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-black text-slate-600 dark:text-slate-300">
                            +{project.users.length - 4}
                          </div>
                        )}
                        {(!project.users || project.users.length === 0) && (
                          <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                            <Users className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 dark:text-slate-500 group-hover:text-teal-500 transition-colors">
                        View <ArrowUpRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
