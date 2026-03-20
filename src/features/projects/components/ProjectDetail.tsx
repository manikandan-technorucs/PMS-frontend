import React, { useState, useEffect } from 'react';
import { ViewToggle, ViewType } from '@/shared/components/ui/ViewToggle/ViewToggle';
import { MilestonesKanbanView } from './MilestonesKanbanView';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { StatCard } from '@/shared/components/ui/Card/StatCard';
import { Button } from '@/shared/components/ui/Button/Button';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { DataTable, Column } from '@/shared/components/lists/DataTable/DataTable';
import { projectsService, Project } from '@/features/projects/services/projects.api';
import { milestonesService, Milestone } from '@/features/milestones/services/milestones.api';
import { tasklistsService, TaskList } from '@/features/tasklists/services/tasklists.api';
import { tasksService, Task } from '@/features/tasks/services/tasks.api';
import { usersService, User } from '@/features/users/services/users.api';
import { timelogsService, TimeLog } from '@/features/timelogs/services/timelogs.api';
import { timesheetsService, Timesheet } from '@/features/timesheets/services/timesheets.api';
import { issuesService, Issue } from '@/features/issues/services/issues.api';
import { documentsService, Document } from '@/features/documents/services/documents.api';
import {
  ArrowLeft, Edit, FileText, Download, Trash2, Plus,
  User as UserIcon, Calendar, Building, Hash, Target, DollarSign,
  CheckCircle, Clock, AlertCircle, Milestone as MilestoneIcon,
  FileArchive, HardDrive, Upload, BarChart3, CalendarClock, TrendingUp,
  ChevronLeft, ChevronRight, Link as LinkIcon
} from 'lucide-react';
import SharedCalendar from '@/components/core/SharedCalendar';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';

const tabs = ['Dashboard', 'Tasks', 'Issues', 'Time Logs', 'Reports', 'Documents', 'Milestones', 'Timesheet', 'Users'];

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getDaysRemaining = (endDateStr?: string | null) => {
    if (!endDateStr) return null;
    const diff = new Date(endDateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days >= 0 ? `${days} days remaining` : `${Math.abs(days)} days overdue`;
  };

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [milestoneView, setMilestoneView] = useState<ViewType>('list');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Data states for tabs
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [timelogs, setTimelogs] = useState<TimeLog[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [actualHours, setActualHours] = useState(0);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>('');

  // Forms
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '', description: '', start_date: new Date().toISOString().split('T')[0], end_date: ''
  });

  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    title: '', description: '', file_url: '', file_type: 'url'
  });

  // Time Logs date range state
  const [logViewMode, setLogViewMode] = useState<'day' | 'week' | 'month' | 'range'>('week');
  const [logCurrentDate, setLogCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [logRangeStart, setLogRangeStart] = useState(new Date().toISOString().split('T')[0]);
  const [logRangeEnd, setLogRangeEnd] = useState(new Date().toISOString().split('T')[0]);

  // Timesheet filter state
  const [tsViewMode, setTsViewMode] = useState<'all' | 'week' | 'month' | 'range'>('all');
  const [tsCurrentDate, setTsCurrentDate] = useState(new Date());
  const [tsRangeStart, setTsRangeStart] = useState(new Date().toISOString().split('T')[0]);
  const [tsRangeEnd, setTsRangeEnd] = useState(new Date().toISOString().split('T')[0]);

  const getTsDateRange = () => {
    if (tsViewMode === 'all') return null;
    if (tsViewMode === 'week') {
      const d = new Date(tsCurrentDate);
      const day = d.getDay();
      const start = new Date(d); start.setDate(d.getDate() - day);
      const end = new Date(start); end.setDate(start.getDate() + 6);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
    if (tsViewMode === 'month') {
      const start = new Date(tsCurrentDate.getFullYear(), tsCurrentDate.getMonth(), 1);
      const end = new Date(tsCurrentDate.getFullYear(), tsCurrentDate.getMonth() + 1, 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
    return { start: tsRangeStart, end: tsRangeEnd };
  };

  const navigateTsDate = (dir: 'prev' | 'next') => {
    const d = new Date(tsCurrentDate);
    if (tsViewMode === 'week') d.setDate(d.getDate() + (dir === 'next' ? 7 : -7));
    else if (tsViewMode === 'month') d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
    setTsCurrentDate(d);
  };

  const filteredTimesheets = (() => {
    const range = getTsDateRange();
    if (!range) return timesheets;
    return timesheets.filter(ts => ts.start_date <= range.end && ts.end_date >= range.start);
  })();

  const tsDateLabel = (() => {
    const range = getTsDateRange();
    if (!range) return 'All Timesheets';
    return `${fmtDate(range.start)} — ${fmtDate(range.end)}`;
  })();

  const getDateRange = () => {
    const d = new Date(logCurrentDate);
    if (logViewMode === 'day') return { start: logCurrentDate, end: logCurrentDate };
    if (logViewMode === 'week') {
      const day = d.getDay();
      const start = new Date(d); start.setDate(d.getDate() - day);
      const end = new Date(start); end.setDate(start.getDate() + 6);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
    if (logViewMode === 'month') {
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
    return { start: logRangeStart, end: logRangeEnd };
  };

  const navigateLogDate = (dir: 'prev' | 'next') => {
    const d = new Date(logCurrentDate);
    if (logViewMode === 'day') d.setDate(d.getDate() + (dir === 'next' ? 1 : -1));
    else if (logViewMode === 'week') d.setDate(d.getDate() + (dir === 'next' ? 7 : -7));
    else if (logViewMode === 'month') d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
    setLogCurrentDate(d.toISOString().split('T')[0]);
  };

  const filteredTimelogs = (() => {
    const range = getDateRange();
    return timelogs.filter(l => {
      const d = l.date?.split('T')[0] || '';
      return d >= range.start && d <= range.end;
    });
  })();


  // Task list inline form state
  const [showTaskListForm, setShowTaskListForm] = useState(false);
  const [taskListName, setTaskListName] = useState('');
  // Milestone inline edit state
  const [editingMilestoneId, setEditingMilestoneId] = useState<number | null>(null);
  const [editMilestoneTitle, setEditMilestoneTitle] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const pid = parseInt(projectId as string, 10);
      const [projData, usersData, msData, tlData, tsData, logsData, issuesData, timesheetsData, docsData] = await Promise.all([
        projectsService.getProject(pid),
        usersService.getUsers(0, 500),
        milestonesService.getMilestones(pid),
        tasklistsService.getTaskLists(pid),
        tasksService.getTasks(0, 1000, pid),
        timelogsService.getTimelogs(0, 1000, pid),
        issuesService.getIssues(0, 1000, pid),
        timesheetsService.getTimesheets(pid),
        documentsService.getDocuments(0, 100, pid)
      ]);

      setProject(projData);
      setAllUsers(usersData);
      setMilestones(msData);
      setTaskLists(tlData);
      setTasks(tsData);
      setIssues(issuesData);
      setTimelogs(logsData);
      setTimesheets(timesheetsData);
      setDocuments(docsData);

      const hours = logsData.reduce((acc: number, log: any) => acc + log.hours, 0);
      setActualHours(hours);

    } catch (error) {
      console.error('Failed to fetch project detail data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserToAdd || !project) return;
    try {
      await projectsService.assignUser(project.id, parseInt(selectedUserToAdd));
      await fetchProjectData(); // Refresh to show newly added user
      setSelectedUserToAdd('');
    } catch (err) {
      console.error(err);

    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!project) return;
    try {
      await projectsService.removeUser(project.id, userId);
      await fetchProjectData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitTaskList = async () => {
    if (!taskListName.trim() || !project) return;
    try {
      await tasklistsService.createTaskList({
        name: taskListName.trim(),
        project_id: project.id,
        description: ''
      });
      setTaskListName('');
      setShowTaskListForm(false);
      await fetchProjectData();
    } catch (err) {
      console.error('Failed to create task list', err);
    }
  };

  const handleCreateMilestone = async () => {
    if (!milestoneForm.title.trim() || !project) return;
    try {
      await milestonesService.createMilestone({
        title: milestoneForm.title.trim(),
        description: milestoneForm.description.trim(),
        project_id: project.id,
        start_date: milestoneForm.start_date || new Date().toISOString().split('T')[0],
        end_date: milestoneForm.end_date || undefined,
      });
      setMilestoneForm({ title: '', description: '', start_date: new Date().toISOString().split('T')[0], end_date: '' });
      setShowMilestoneForm(false);
      await fetchProjectData();
    } catch (err) {
      console.error('Failed to create milestone', err);
    }
  };


  if (loading) return <div className="p-8"><p>Loading project details...</p></div>;
  if (!project) return <div className="p-8"><p>Project not found.</p></div>;

  return (
    <PageLayout
      title={project.name}
      isFullHeight
      actions={
        <>
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <Button onClick={() => navigate(`/projects/${projectId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Project
          </Button>
        </>
      }
    >
      <div className="h-full flex flex-col overflow-hidden space-y-4">
        <div className="flex-shrink-0 space-y-4">
          {/* Project Summary Header — Premium Design */}
          <div className="card-base overflow-hidden relative border-t-4 border-t-brand-teal-500 shadow-sm">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
                <div className="flex items-center gap-4">
                  <Hash className="w-5 h-5 text-brand-teal-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-theme-muted uppercase tracking-wider font-bold">Project ID</p>
                    <p className="text-[15px] font-bold text-theme-primary truncate">{project.public_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Building className="w-5 h-5 text-brand-teal-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-theme-muted uppercase tracking-wider font-bold">Client</p>
                    <p className="text-[15px] font-bold text-theme-primary truncate">{project.client || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Target className="w-5 h-5 text-brand-teal-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-theme-muted uppercase tracking-wider font-bold mb-0.5">Status</p>
                    <StatusBadge status={project.status?.name || 'Unknown'} variant="status" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-5 h-5 text-brand-teal-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-theme-muted uppercase tracking-wider font-bold mb-0.5">Priority</p>
                    <StatusBadge status={project.priority?.name || 'Unknown'} variant="priority" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <UserIcon className="w-5 h-5 text-brand-teal-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-theme-muted uppercase tracking-wider font-bold">Manager</p>
                    <p className="text-[15px] font-bold text-theme-primary truncate">
                      {project.manager ? `${project.manager.first_name} ${project.manager.last_name}` : 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-brand-teal-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-theme-muted uppercase tracking-wider font-bold">Start Date</p>
                    <p className="text-[15px] font-bold text-theme-primary truncate">{project.start_date || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <CalendarClock className="w-5 h-5 text-brand-teal-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-theme-muted uppercase tracking-wider font-bold">End Date</p>
                    <p className="text-[15px] font-bold text-theme-primary truncate">{project.end_date || 'N/A'}</p>
                    {project.end_date && (
                      <p className={`text-[12px] mt-0.5 font-medium ${getDaysRemaining(project.end_date)?.includes('overdue') ? 'text-red-500' : 'text-blue-500'}`}>
                        {getDaysRemaining(project.end_date)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-brand-teal-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-theme-muted uppercase tracking-wider font-bold">Project Hours</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-[15px] font-bold text-theme-primary">{actualHours.toFixed(1)}h</p>
                      <p className="text-[12px] text-theme-muted font-medium">/ {project.estimated_hours || 0}h est</p>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Tabs (Merged into the same card surface) */}
            <div className="border-t border-theme-border">
              <div className="flex px-4 overflow-x-auto hide-scrollbar gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-4 text-[14px] transition-all relative whitespace-nowrap border-b-2
                      ${activeTab === tab 
                        ? 'text-teal-600 font-bold border-teal-500' 
                        : 'text-slate-500 hover:text-slate-800 font-medium hover:bg-slate-50 border-transparent'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-auto min-h-0 pr-2 pb-4">

          {/* Tab Content: Dashboard / Overview */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-6">
              {/* KPI Stat Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Tasks Progress"
                  value={`${tasks.filter(t => t.status?.name === 'Completed').length}/${tasks.length}`}
                  icon={<CheckCircle className="w-5 h-5 text-brand-teal-600" />}
                  className="card-base"
                />
                <StatCard
                  label="Budget Used"
                  value={`${actualHours.toFixed(1)}h`}
                  icon={<Clock className="w-5 h-5 text-blue-600" />}
                  className="card-base"
                />
                <StatCard
                  label="Open Issues"
                  value={issues.filter(i => i.status?.name === 'Open').length}
                  icon={<AlertCircle className="w-5 h-5 text-red-600" />}
                  className="card-base"
                />
                <StatCard
                  label="Team Size"
                  value={project.users?.length || 0}
                  icon={<UserIcon className="w-5 h-5 text-indigo-600" />}
                  className="card-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  {/* About & Progress Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="About Project">
                      <p className="text-[14px] text-theme-secondary leading-relaxed mb-4">
                        {project.description || 'No description provided for this project.'}
                      </p>
                      <div className="space-y-2 pt-2 border-t border-theme-border">
                        <div className="flex justify-between text-[12px]">
                          <span className="text-theme-muted font-medium">Client</span>
                          <span className="font-bold text-theme-primary">{project.client || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-[12px]">
                          <span className="text-theme-muted font-medium">Department</span>
                          <span className="font-bold text-theme-primary">{project.department?.name || 'N/A'}</span>
                        </div>
                      </div>
                    </Card>

                    <Card title="Overall Progress">
                      <div className="space-y-6">
                        {/* Task Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[13px]">
                            <span className="font-bold text-theme-secondary uppercase tracking-wider">Task Completion</span>
                            <span className="font-bold text-brand-teal-600">
                              {tasks.length > 0 ? Math.round((tasks.filter(t => t.status?.name === 'Completed').length / tasks.length) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-theme-neutral rounded-full h-2 border border-theme-border/50">
                            <div
                              className="bg-brand-teal-500 h-2 rounded-full transition-all duration-700 shadow-sm shadow-brand-teal-500/20"
                              style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status?.name === 'Completed').length / tasks.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Budget Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[13px]">
                            <span className="font-bold text-theme-secondary uppercase tracking-wider">Budget Utilization</span>
                            <span className={`font-bold ${actualHours > (project.estimated_hours || 0) ? 'text-red-500' : 'text-blue-500'}`}>
                              {project.estimated_hours ? Math.round((actualHours / project.estimated_hours) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-theme-neutral rounded-full h-2 border border-theme-border/50">
                            <div
                              className={`h-2 rounded-full transition-all duration-700 ${actualHours > (project.estimated_hours || 0) ? 'bg-red-500 shadow-red-500/20' : 'bg-blue-500 shadow-blue-500/20'}`}
                              style={{ width: `${Math.min(project.estimated_hours ? (actualHours / project.estimated_hours) * 100 : 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Upcoming Milestones */}
                  <Card title="Upcoming Milestones" actions={
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('Milestones')} className="text-brand-teal-600">View All</Button>
                  }>
                    {milestones.length > 0 ? (
                      <div className="space-y-4">
                        {milestones.slice(0, 3).map((ms, idx) => (
                          <div key={ms.id} className="flex gap-4 group">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full mt-1.5 ring-4 ring-offset-2 transition-all duration-300 ${idx === 0 ? 'bg-brand-teal-500 ring-brand-teal-100 dark:ring-brand-teal-900/30' : 'bg-theme-border ring-theme-neutralShadow'}`} />
                              {idx < Math.min(milestones.length, 3) - 1 && <div className="w-0.5 h-full bg-theme-border/50 my-1" />}
                            </div>
                            <div className="pb-4">
                              <h4 className="text-[14px] font-bold text-theme-primary group-hover:text-brand-teal-600 transition-colors uppercase tracking-tight">{ms.title}</h4>
                              <p className="text-[12px] text-theme-muted font-medium">{ms.end_date ? `Due ${fmtDate(ms.end_date)}` : 'No deadline'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center border-2 border-dashed border-theme-border rounded-xl text-theme-muted text-[13px] bg-theme-neutral/20">
                        <MilestoneIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="font-medium">No milestones defined yet.</p>
                      </div>
                    )}
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Meta Stats Info */}
                  <Card title="Quick Info">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-100/50 dark:border-indigo-800/30">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] text-theme-muted uppercase tracking-wider font-bold mb-0.5">Manager</p>
                          <p className="text-[14px] font-bold text-theme-primary">
                            {project.manager ? `${project.manager.first_name} ${project.manager.last_name}` : 'Unassigned'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-teal-50 dark:bg-brand-teal-900/20 flex items-center justify-center text-brand-teal-600 shadow-inner border border-brand-teal-100/50 dark:border-brand-teal-800/30">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] text-theme-muted uppercase tracking-wider font-bold mb-0.5">Department</p>
                          <p className="text-[14px] font-bold text-theme-primary">{project.department?.name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 shadow-inner border border-amber-100/50 dark:border-amber-800/30">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] text-theme-muted uppercase tracking-wider font-bold mb-0.5">Current Status</p>
                          <StatusBadge status={project.status?.name || 'Planning'} variant="status" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Project Team Widget */}
                  <Card title="Project Team" actions={
                    project.users && project.users.length > 5 ? (
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('Users')} className="text-brand-teal-600">View All</Button>
                    ) : null
                  }>
                    {project.users && project.users.length > 0 ? (
                      <div className="space-y-4">
                        {project.users.slice(0, 5).map(u => (
                          <div key={u.id} className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-theme-neutral flex items-center justify-center text-theme-secondary font-bold text-[13px] flex-shrink-0 border border-theme-border/50 shadow-sm group-hover:bg-brand-teal-500 group-hover:text-white group-hover:border-brand-teal-400 transition-all">
                              {u.first_name?.[0]}{u.last_name?.[0]}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[14px] font-bold text-theme-primary truncate group-hover:text-brand-teal-600 transition-colors">{u.first_name} {u.last_name}</span>
                              <span className="text-[11px] text-theme-muted font-medium uppercase tracking-wider">{u.role?.name || 'Member'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[12px] text-theme-muted font-medium py-8 text-center border-2 border-dashed border-theme-border rounded-xl bg-theme-neutral/20">
                        <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p>No team members assigned.</p>
                      </div>
                    )}
                  </Card>

                  {/* Resource Utilization Preview might go here */}
                  <Card title="Recent Activity">
                    <div className="text-[12px] text-theme-muted font-medium py-10 text-center border-2 border-dashed border-theme-border rounded-xl bg-theme-neutral/20">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p>Activity logging coming soon...</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Tasks */}
          {activeTab === 'Tasks' && (
            <div className="space-y-6">
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowTaskListForm(!showTaskListForm)}>
                  <Plus className="w-4 h-4 mr-2" /> {showTaskListForm ? 'Cancel' : 'New Task List'}
                </Button>
                <Button onClick={() => navigate('/tasks/create')}>
                  <Plus className="w-4 h-4 mr-2" /> New Task
                </Button>
              </div>

              {/* Task List Creation Form */}
              {showTaskListForm && (
                <Card title="New Task List">
                  <div className="flex flex-col gap-4 mt-3">
                    <div>
                      <label className="block text-[12px] font-bold text-theme-muted uppercase tracking-wider mb-2">Task List Name *</label>
                      <input
                        type="text"
                        value={taskListName}
                        onChange={e => setTaskListName(e.target.value)}
                        className="w-full px-4 py-3 bg-theme-neutral border border-theme-border rounded-xl text-[14px] text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20"
                        placeholder="e.g. Design Phase, Development, QA..."
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSubmitTaskList();
                          if (e.key === 'Escape') setShowTaskListForm(false);
                        }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSubmitTaskList} disabled={!taskListName.trim()}>Save Task List</Button>
                      <Button variant="outline" onClick={() => { setShowTaskListForm(false); setTaskListName(''); }}>Cancel</Button>
                    </div>
                  </div>
                </Card>
              )}

              {taskLists.length > 0 ? taskLists.map(list => {
                const listTasks = tasks.filter(t => t.task_list_id === list.id);

                return (
                  <Card key={list.id} title={list.name} className="overflow-hidden">
                    <p className="text-[13px] text-theme-secondary font-medium mb-6 bg-theme-neutral/50 p-3 rounded-lg border border-theme-border/50">{list.description || "No description for this group."}</p>

                    {listTasks.length > 0 ? (
                      <div className="card-base rounded-[6px] shadow-sm">
                        <DataTable
                          columns={[
                            {
                               key: 'public_id', header: 'ID', sortable: true, render: (_, t) => (
                                 <span className="font-mono text-[11px] bg-theme-neutral px-2 py-0.5 rounded text-theme-secondary border border-theme-border font-bold">
                                   {t.public_id || `TSK-${t.id}`}
                                 </span>
                               )
                             },
                            { key: 'title', header: 'Task Name', sortable: true, render: (_, t) => <span className="font-medium text-theme-primary">{t.title}</span> },
                            {
                              key: 'status',
                              header: 'Status',
                              render: (_, t) => <StatusBadge status={t.status?.name || 'Open'} variant="status" />
                            },
                             {
                               key: 'hours',
                               header: 'Actual / Est',
                               render: (_, t) => {
                                 const taskHours = timelogs.filter(l => l.task_id === t.id).reduce((sum, l) => sum + l.hours, 0);
                                 return (
                                   <div className="text-[13px] font-bold">
                                     <span className="text-brand-teal-600 bg-brand-teal-50 dark:bg-brand-teal-900/20 px-2 py-0.5 rounded-lg border border-brand-teal-100 dark:border-brand-teal-800/30">{taskHours.toFixed(1)}h</span>
                                     <span className="text-theme-muted ml-2 font-medium">/ {t.estimated_hours || 0}h</span>
                                   </div>
                                 );
                               }
                             },
                            {
                              key: 'deadline',
                              header: 'Deadline',
                              render: (_, t) => (
                                <div className="text-[12px]">
                                  <p>{t.end_date || 'No date'}</p>
                                  <p className={`mt-0.5 ${getDaysRemaining(t.end_date)?.includes('overdue') ? 'text-red-500' : 'text-blue-500'}`}>
                                    {getDaysRemaining(t.end_date)}
                                  </p>
                                </div>
                              )
                            }
                          ]}
                          data={listTasks}
                          itemsPerPage={5}
                          onRowClick={(t) => navigate(`/tasks/${t.id}`)}
                        />
                      </div>
                    ) : (
                      <div className="py-8 text-center border-2 border-dashed border-theme-border rounded-xl text-theme-muted text-[13px] bg-theme-neutral/20">
                        No tasks in this list.
                      </div>
                    )}
                  </Card>
                );
              }) : (
                <Card>
                  <div className="text-center py-12 border-2 border-dashed border-theme-border rounded-xl text-theme-muted text-[14px] bg-theme-neutral/20">
                    <p className="font-medium">No Task Lists created. Task Lists help group your tasks.</p>
                  </div>
                </Card>
              )}

              {/* Unassigned Tasks */}
              {tasks.filter(t => !t.task_list_id).length > 0 && (
                <Card title="Unassigned Tasks">
                  <div className="space-y-2">
                    {tasks
                      .filter(t => !t.task_list_id)
                      .map(t => (
                        <div
                          key={t.id}
                          onClick={() => navigate(`/tasks/${t.id}`)}
                          className="cursor-pointer flex items-center justify-between p-4 card-base hover:shadow-lg hover:border-brand-teal-500 transition-all group scale-[0.99] hover:scale-[1.0]"
                        >
                          <p className="text-[14px] font-bold text-theme-primary group-hover:text-brand-teal-600 transition-colors">
                            {t.title}
                          </p>
                          <StatusBadge
                            status={t.status?.name || 'Open'}
                            variant="status"
                          />
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Tab Content: Issues */}
          {activeTab === 'Issues' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button onClick={() => navigate('/issues/create')}><Plus className="w-4 h-4 mr-2" /> New Issue</Button>
              </div>
              {issues.length > 0 ? (
                <div className="card-base shadow-sm overflow-hidden">
                  <DataTable
                    columns={[
                      {
                        key: 'public_id', header: 'ID', sortable: true, render: (_, i) => (
                          <span className="font-mono text-[11px] bg-theme-neutral px-2 py-0.5 rounded text-theme-secondary border border-theme-border font-bold">
                            {i.public_id || `ISS-${i.id}`}
                          </span>
                        )
                      },
                      { key: 'title', header: 'Issue Name', sortable: true, render: (_, i) => <span className="font-medium text-theme-primary">{i.title}</span> },
                      {
                        key: 'assignee',
                        header: 'Assignee',
                        render: (_, i) => (
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-brand-teal-50 dark:bg-brand-teal-900/30 text-brand-teal-600 flex items-center justify-center font-bold text-[10px] border border-brand-teal-100 dark:border-brand-teal-800/30">
                              {i.assignee?.first_name?.[0]}{i.assignee?.last_name?.[0]}
                            </div>
                            <span className="text-theme-secondary font-medium">{i.assignee ? `${i.assignee.first_name} ${i.assignee.last_name}` : 'Unassigned'}</span>
                          </div>
                        )
                      },
                      {
                        key: 'status',
                        header: 'Status',
                        render: (_, i) => <StatusBadge status={i.status?.name || 'Open'} variant="status" />
                      },
                      {
                        key: 'priority',
                        header: 'Severity',
                        render: (_, i) => <StatusBadge status={i.priority?.name || 'Medium'} variant="priority" />
                      },
                      {
                        key: 'deadline',
                        header: 'Deadline',
                        render: (_, i) => (
                          <div className="text-[12px]">
                            <p>{i.end_date || '—'}</p>
                            <p className={`mt-0.5 ${getDaysRemaining(i.end_date)?.includes('overdue') ? 'text-red-500' : 'text-blue-500'}`}>
                              {getDaysRemaining(i.end_date)}
                            </p>
                          </div>
                        )
                      }
                    ]}
                    data={issues}
                    itemsPerPage={5}
                    onRowClick={(i) => navigate(`/issues/${i.id}`)}
                  />
                </div>
              ) : (
                <Card>
                  <div className="text-center py-12 border-2 border-dashed border-theme-border rounded-xl text-theme-muted text-[14px] bg-theme-neutral/20">
                    <p className="font-medium">No issues reported for this project.</p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Tab Content: Time Logs */}
          {activeTab === 'Time Logs' && (
            <div className="space-y-4">
              {/* View mode + Date navigation bar */}
              <div className="card-base p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-theme-neutral rounded-lg p-1 border border-theme-border/50">
                  {(['day', 'week', 'month', 'range'] as const).map(mode => (
                    <button key={mode} onClick={() => setLogViewMode(mode)}
                      className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-all capitalize
                      ${logViewMode === mode ? 'bg-theme-surface text-brand-teal-600 shadow-sm' : 'text-theme-muted hover:text-theme-primary'}`}
                    >{mode}</button>
                  ))}
                </div>
                {logViewMode !== 'range' ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigateLogDate('prev')} className="p-1.5 rounded-lg hover:bg-theme-neutral border border-theme-border transition-colors">
                      <ChevronLeft className="w-4 h-4 text-theme-muted" />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-theme-neutral border border-theme-border rounded-lg text-[13px] font-bold text-theme-primary min-w-[200px] justify-center shadow-inner">
                      <Calendar className="w-4 h-4 text-brand-teal-500" />
                      {(() => { const r = getDateRange(); return r.start === r.end ? fmtDate(r.start) : `${fmtDate(r.start)} — ${fmtDate(r.end)}`; })()}
                    </div>
                    <button onClick={() => navigateLogDate('next')} className="p-1.5 rounded-lg hover:bg-theme-neutral border border-theme-border transition-colors">
                      <ChevronRight className="w-4 h-4 text-theme-muted" />
                    </button>
                    <button onClick={() => setLogCurrentDate(new Date().toISOString().split('T')[0])} className="text-[12px] font-bold text-brand-teal-600 hover:text-brand-teal-700 ml-1 transition-colors uppercase tracking-wider">Today</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <label className="text-[12px] text-theme-muted font-bold uppercase">From:</label>
                    <input type="date" value={logRangeStart} onChange={e => setLogRangeStart(e.target.value)} className="bg-theme-neutral border border-theme-border rounded-lg px-3 py-1.5 text-[13px] text-theme-primary focus:ring-2 focus:ring-brand-teal-500/20 outline-none" />
                    <label className="text-[12px] text-theme-muted font-bold uppercase">To:</label>
                    <input type="date" value={logRangeEnd} onChange={e => setLogRangeEnd(e.target.value)} className="bg-theme-neutral border border-theme-border rounded-lg px-3 py-1.5 text-[13px] text-theme-primary focus:ring-2 focus:ring-brand-teal-500/20 outline-none" />
                  </div>
                )}
                <div className="flex items-center gap-4 bg-theme-neutral/50 px-4 py-1.5 rounded-lg border border-theme-border/50">
                  <span className="text-[13px] font-bold text-brand-teal-600 flex items-center gap-1.5"><Clock className="w-4 h-4" />{filteredTimelogs.reduce((s, l) => s + l.hours, 0).toFixed(2)}h</span>
                  <div className="w-[1px] h-3 bg-theme-border" />
                  <span className="text-[12px] text-theme-muted font-medium">{filteredTimelogs.length} entries</span>
                </div>
              </div>

              {/* Add button */}
              <div className="flex justify-end">
                <Button onClick={() => navigate('/time-log/create')}><Plus className="w-4 h-4 mr-2" /> Add Time Log</Button>
              </div>

              {/* Entries grouped by date */}
              {filteredTimelogs.length > 0 ? (
                <div className="card-base overflow-hidden">
                  <DataTable
                    columns={[
                      {
                        key: 'date',
                        header: 'Date',
                        sortable: true,
                        render: (val) => <span className="text-theme-primary font-bold">{fmtDate(val as string)}</span>
                      },
                      {
                        key: 'description',
                        header: 'Description',
                        sortable: true,
                        render: (_, l) => (
                          <div className="max-w-md">
                            <p className="text-[14px] font-bold text-theme-primary">{l.description || l.task?.title || 'No description'}</p>
                            <div className="text-[11px] text-theme-muted flex items-center gap-3 mt-1 font-medium">
                              {l.task?.title && <span className="flex items-center gap-1 bg-brand-teal-50 dark:bg-brand-teal-900/20 text-brand-teal-600 px-1.5 py-0.5 rounded border border-brand-teal-100 dark:border-brand-teal-800/50">Task: {l.task.title}</span>}
                              {l.issue?.title && <span className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-800/50">Issue: {l.issue.title}</span>}
                            </div>
                          </div>
                        )
                      },
                      {
                        key: 'user',
                        header: 'User',
                        render: (_, l) => (
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-brand-teal-50 dark:bg-brand-teal-900/30 text-brand-teal-600 flex items-center justify-center font-bold text-[10px] border border-brand-teal-100 dark:border-brand-teal-800/30">
                              {l.user?.first_name?.[0]}{l.user?.last_name?.[0]}
                            </div>
                            <span className="text-theme-secondary font-medium">{l.user ? `${l.user.first_name} ${l.user.last_name}` : '—'}</span>
                          </div>
                        )
                      },
                      {
                        key: 'hours',
                        header: 'Hours',
                        sortable: true,
                        render: (val) => <span className="font-bold text-brand-teal-600 bg-brand-teal-50 dark:bg-brand-teal-900/20 px-2 py-0.5 rounded-full border border-brand-teal-100 dark:border-brand-teal-800/30">{Number(val).toFixed(2)}h</span>
                      },
                      {
                        key: 'actions',
                        header: '',
                        render: (_, l) => (
                          <button
                            onClick={() => navigate(`/time-log/edit/${l.id}`)}
                            className="p-1.5 text-theme-muted hover:text-brand-teal-600 hover:bg-brand-teal-50/50 rounded-lg transition-all"
                            title="Edit Time Log"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )
                      }
                    ]}
                    data={filteredTimelogs}
                    itemsPerPage={5}
                  />
                </div>
              ) : (
                <Card>
                  <div className="text-center py-8 text-[#6B7280] text-[14px]">
                    <Clock className="w-10 h-10 mx-auto text-[#D1D5DB] mb-3" />
                    <p>No time logs found for the selected date range.</p>
                  </div>
                </Card>
              )}

              {/* Bottom summary */}
              {filteredTimelogs.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-brand-teal-50/30 dark:bg-brand-teal-900/10 border border-brand-teal-100 dark:border-brand-teal-800/30 rounded-xl text-[13px] shadow-sm">
                  <div className="flex gap-6">
                    <span><span className="text-theme-muted font-bold uppercase tracking-wider text-[11px]">Total Selected: </span><span className="font-bold text-theme-primary text-base ml-2">{filteredTimelogs.reduce((s, l) => s + l.hours, 0).toFixed(2)}h</span></span>
                  </div>
                  <span className="text-[12px] text-theme-muted font-bold uppercase tracking-wider">{filteredTimelogs.length} entries</span>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Timesheet (List of Timesheets) */}
          {activeTab === 'Timesheet' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="card-base p-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex bg-theme-neutral rounded-lg p-1 border border-theme-border/50">
                    {([['all', 'All'], ['week', 'Weekly'], ['month', 'Monthly'], ['range', 'Custom']] as const).map(([mode, label]) => (
                      <button
                        key={mode}
                        onClick={() => setTsViewMode(mode as any)}
                        className={`px-4 py-1.5 text-[13px] font-bold rounded-md transition-all ${tsViewMode === mode ? 'bg-theme-surface text-brand-teal-600 shadow-sm border border-theme-border/30' : 'text-theme-muted hover:text-theme-primary'}`}
                      >{label}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {(tsViewMode === 'week' || tsViewMode === 'month') && (
                      <div className="flex items-center gap-3 mr-2">
                        <button onClick={() => navigateTsDate('prev')} className="p-2 hover:bg-theme-neutral rounded-lg border border-theme-border transition-colors"><ChevronLeft className="w-4 h-4 text-theme-muted" /></button>
                        <span className="text-[13px] font-bold text-brand-teal-600 px-2 uppercase tracking-wide">{tsDateLabel}</span>
                        <button onClick={() => navigateTsDate('next')} className="p-2 hover:bg-theme-neutral rounded-lg border border-theme-border transition-colors"><ChevronRight className="w-4 h-4 text-theme-muted" /></button>
                      </div>
                    )}
                    <Button onClick={() => navigate('/timesheets/create')} variant="gradient"><Plus className="w-4 h-4 mr-2" /> Create Timesheet</Button>
                  </div>
                </div>
                {tsViewMode === 'range' && (
                  <div className="flex items-center gap-4 pt-4 border-t border-theme-border">
                    <label className="text-[12px] text-theme-muted font-bold uppercase">From:</label>
                    <input type="date" value={tsRangeStart} onChange={e => setTsRangeStart(e.target.value)} className="bg-theme-neutral border border-theme-border rounded-lg px-3 py-1.5 text-[13px] text-theme-primary focus:ring-2 focus:ring-brand-teal-500/20 outline-none" />
                    <label className="text-[12px] text-theme-muted font-bold uppercase">To:</label>
                    <input type="date" value={tsRangeEnd} onChange={e => setTsRangeEnd(e.target.value)} className="bg-theme-neutral border border-theme-border rounded-lg px-3 py-1.5 text-[13px] text-theme-primary focus:ring-2 focus:ring-brand-teal-500/20 outline-none" />
                  </div>
                )}
              </div>

              {/* Summary Bar */}
              {filteredTimesheets.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-brand-teal-50/30 dark:bg-brand-teal-900/10 border border-brand-teal-100 dark:border-brand-teal-800/30 rounded-xl text-[13px] shadow-sm">
                  <span className="text-theme-muted font-bold uppercase tracking-wider">Showing <span className="font-bold text-theme-primary ml-1">{filteredTimesheets.length}</span> timesheet(s)</span>
                  <span className="text-theme-muted font-bold uppercase tracking-wider">Total Hours: <span className="font-bold text-brand-teal-600 ml-1 text-base">{filteredTimesheets.reduce((s, ts) => s + Number(ts.total_hours || 0), 0).toFixed(2)}h</span></span>
                </div>
              )}

              {/* Timesheet Table */}
              {filteredTimesheets.length > 0 ? (
                <div className="card-base rounded-[6px] shadow-sm">
                  <DataTable
                    columns={[
                      {
                        key: 'name',
                        header: 'Timesheet Name',
                        sortable: true,
                        render: (val, ts) => <span className="font-bold text-theme-primary hover:text-brand-teal-600 transition-colors cursor-pointer">{val}</span>
                      },
                      {
                        key: 'period',
                        header: 'Time Period',
                        render: (_, ts) => (
                          <div className="flex items-center gap-2 whitespace-nowrap text-theme-secondary font-medium">
                            <Clock className="w-3.5 h-3.5 text-brand-teal-500" />
                            {fmtDate(ts.start_date)} — {fmtDate(ts.end_date)}
                          </div>
                        )
                      },
                      {
                        key: 'user',
                        header: 'Log Users',
                        render: (_, ts) => ts.user ? (
                          <div className="flex items-center gap-2">
                             <div className="w-7 h-7 rounded-full bg-brand-teal-50 dark:bg-brand-teal-900/30 text-brand-teal-600 flex items-center justify-center font-bold text-[10px] border border-brand-teal-100 dark:border-brand-teal-800/30">
                              {ts.user.first_name[0]}{ts.user.last_name[0]}
                            </div>
                            <span className="text-theme-secondary font-medium">{ts.user.first_name} {ts.user.last_name}</span>
                          </div>
                        ) : '—'
                      },
                      { key: 'billing_type', header: 'Billing Type', sortable: true, render: (val) => <span className="font-medium text-theme-secondary">{val}</span> },
                      {
                        key: 'total_hours',
                        header: 'Total Hours',
                        sortable: true,
                        render: (val) => <span className="font-bold text-theme-primary bg-theme-neutral px-2.5 py-0.5 rounded-lg border border-theme-border/50">{Number(val).toFixed(2)}h</span>
                      },
                      {
                        key: 'approval_status',
                        header: 'Status',
                        sortable: true,
                        render: (val) => {
                          const status = val || 'Pending';
                          const colors: Record<string, string> = {
                            'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50',
                            'Rejected': 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50',
                            'Pending': 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50'
                          };
                          return (
                            <span className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${colors[status] || colors.Pending}`}>
                              {status}
                            </span>
                          );
                        }
                      }
                    ]}
                    data={filteredTimesheets}
                    itemsPerPage={5}
                    onRowClick={(ts) => navigate(`/timesheets/${ts.id}`)}
                  />
                </div>
              ) : (
                <Card>
                  <div className="text-center py-10 text-[#6B7280]">
                    <Clock className="w-10 h-10 mx-auto text-[#D1D5DB] mb-3" />
                    <p className="text-[14px]">{tsViewMode === 'all' ? 'No Timesheets found for this project.' : `No Timesheets found for ${tsDateLabel}`}</p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Tab Content: Reports */}
          {activeTab === 'Reports' && (
            <div className="space-y-6">
              {/* Project Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card-base rounded-[6px] p-5">
                  <p className="text-[12px] text-theme-secondary mb-1">Total Tasks</p>
                  <p className="text-[24px] font-bold text-theme-primary">{tasks.length}</p>
                </div>
                <div className="card-base rounded-[6px] p-5">
                  <p className="text-[12px] text-theme-secondary mb-1">Total Issues</p>
                  <p className="text-[24px] font-bold text-theme-primary">{issues.length}</p>
                </div>
                <div className="card-base rounded-[6px] p-5">
                  <p className="text-[12px] text-theme-secondary mb-1">Total Hours</p>
                  <p className="text-[24px] font-bold text-[#14b8a6]">{actualHours.toFixed(1)}h</p>
                </div>
                <div className="card-base rounded-[6px] p-5">
                  <p className="text-[12px] text-theme-secondary mb-1">Milestones</p>
                  <p className="text-[24px] font-bold text-[#7C3AED]">{milestones.length}</p>
                </div>
              </div>

              {/* Export Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-brand-teal-50 dark:bg-brand-teal-900/20 rounded-lg flex items-center justify-center text-brand-teal-600 flex-shrink-0 shadow-inner border border-brand-teal-100 dark:border-brand-teal-800/30">
                      <Download className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold mb-1 text-theme-primary uppercase tracking-tight">Export Project Tasks</h3>
                      <p className="text-[14px] mb-4 text-theme-secondary font-medium">Download all tasks for this project as a CSV spreadsheet.</p>
                      <Button size="sm" variant="gradient" onClick={() => {
                        const mapped = tasks.map(t => ({
                          'ID': t.public_id,
                          'Title': t.title,
                          'Status': t.status?.name || 'N/A',
                          'Assignee': t.assignee ? `${t.assignee.first_name} ${t.assignee.last_name}` : 'Unassigned',
                          'Start Date': t.start_date || 'N/A',
                          'End Date': t.end_date || 'N/A',
                          'Estimated Hours': t.estimated_hours || 0,
                        }));
                        import('@/shared/utils/export').then(m => m.exportToCSV(mapped, `${project?.name || 'project'}_tasks.csv`));
                      }}>
                        <Download className="w-3 h-3 mr-1" /> Download CSV
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0 shadow-inner border border-amber-100 dark:border-amber-800/30">
                      <Download className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold mb-1 text-theme-primary uppercase tracking-tight">Export Project Issues</h3>
                      <p className="text-[14px] mb-4 text-theme-secondary font-medium">Download all tracked issues and bugs as a CSV file.</p>
                      <Button size="sm" variant="gradient" className="from-amber-500 to-orange-600" onClick={() => {
                        const mapped = issues.map(i => ({
                          'ID': i.public_id,
                          'Title': i.title,
                          'Status': i.status?.name || 'N/A',
                          'Priority': i.priority?.name || 'N/A',
                          'Assignee': i.assignee ? `${i.assignee.first_name} ${i.assignee.last_name}` : 'Unassigned',
                          'Start Date': i.start_date || 'N/A',
                          'End Date': i.end_date || 'N/A',
                        }));
                        import('@/shared/utils/export').then(m => m.exportToCSV(mapped, `${project?.name || 'project'}_issues.csv`));
                      }}>
                        <Download className="w-3 h-3 mr-1" /> Download CSV
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0 shadow-inner border border-blue-100 dark:border-blue-800/30">
                      <Download className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold mb-1 text-theme-primary uppercase tracking-tight">Export Time Logs</h3>
                      <p className="text-[14px] mb-4 text-theme-secondary font-medium">Export all individual time entries for history and billing.</p>
                      <Button size="sm" variant="gradient" className="from-blue-500 to-indigo-600" onClick={() => {
                        const mapped = timelogs.map(l => ({
                          'User': l.user ? `${l.user.first_name} ${l.user.last_name}` : 'N/A',
                          'Task': l.task?.title || 'N/A',
                          'Date': l.date?.split('T')[0] || 'N/A',
                          'Hours': l.hours,
                          'Description': l.description || 'N/A',
                        }));
                        import('@/shared/utils/export').then(m => m.exportToCSV(mapped, `${project?.name || 'project'}_timelogs.csv`));
                      }}>
                        <Download className="w-3 h-3 mr-1" /> Download CSV
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-theme-neutral rounded-lg flex items-center justify-center text-theme-secondary flex-shrink-0 shadow-inner border border-theme-border">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold mb-1 text-theme-primary uppercase tracking-tight">Global Reports</h3>
                      <p className="text-[14px] mb-4 text-theme-secondary font-medium">Analyze performance and metrics across your entire organization.</p>
                      <Button size="sm" variant="outline" onClick={() => navigate('/reports')}>Go to Reports</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Tab Content: Documents */}
          {activeTab === 'Documents' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button onClick={() => setShowDocumentForm(!showDocumentForm)}><Plus className="w-4 h-4 mr-2" /> Upload Document</Button>
              </div>

              {/* Document Upload Form */}
              {showDocumentForm && (
                <Card title="Upload Document">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="md:col-span-2">
                      <label className="block text-[12px] font-bold text-theme-muted uppercase tracking-wider mb-2">Document Title *</label>
                      <input
                        type="text"
                        value={documentForm.title}
                        onChange={e => setDocumentForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-theme-neutral border border-theme-border rounded-xl text-[14px] text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20"
                        placeholder="e.g. Q3 Design Assets Link"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-theme-muted uppercase tracking-wider mb-2">Document URL *</label>
                      <input
                        type="text"
                        value={documentForm.file_url}
                        onChange={e => setDocumentForm(prev => ({ ...prev, file_url: e.target.value }))}
                        className="w-full px-4 py-3 bg-theme-neutral border border-theme-border rounded-xl text-[14px] text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20"
                        placeholder="https://docs.google.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-theme-muted uppercase tracking-wider mb-2">Type</label>
                      <input
                        type="text"
                        value={documentForm.file_type}
                        onChange={e => setDocumentForm(prev => ({ ...prev, file_type: e.target.value }))}
                        className="w-full px-4 py-3 bg-theme-neutral border border-theme-border rounded-xl text-[14px] text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20"
                        defaultValue="url"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[12px] font-bold text-theme-muted uppercase tracking-wider mb-2">Description (Optional)</label>
                      <textarea
                        value={documentForm.description}
                        onChange={e => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 bg-theme-neutral border border-theme-border rounded-xl text-[14px] text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 resize-none h-20"
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-3">
                      <Button onClick={async () => {
                        if (!documentForm.title || !documentForm.file_url || !project) return;
                        await documentsService.createLinkDocument({ ...documentForm, project_id: project.id });
                        setDocumentForm({ title: '', description: '', file_url: '', file_type: 'url' });
                        setShowDocumentForm(false);
                        fetchProjectData();
                      }}>Save Document</Button>
                      <Button variant="outline" onClick={() => setShowDocumentForm(false)}>Cancel</Button>
                    </div>
                  </div>
                </Card>
              )}

              {documents.length > 0 ? (
                <div className="card-base rounded-[6px] shadow-sm">
                  <DataTable
                    columns={[
                      {
                        key: 'title',
                        header: 'Title & Context',
                        sortable: true,
                        render: (_, doc) => {
                          const linkedIssue = issues.find(i => i.documents?.some((d: any) => d.id === doc.id));
                          return (
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-theme-neutral flex flex-shrink-0 items-center justify-center text-theme-secondary border border-theme-border/50">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-theme-primary leading-tight mb-1">{doc.title}</p>
                                {linkedIssue ? (
                                  <span className="text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-800/30 cursor-pointer hover:bg-red-100 transition-colors" onClick={() => navigate(`/issues/${linkedIssue.id}`)}>
                                    Bug: {linkedIssue.public_id} - {linkedIssue.title}
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-brand-teal-600 bg-brand-teal-50 dark:bg-brand-teal-900/20 px-1.5 py-0.5 rounded border border-brand-teal-100 dark:border-brand-teal-800/30">
                                    Project: {project.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                      },
                      { key: 'file_type', header: 'Type', sortable: true, render: (val) => <span className="font-bold text-theme-secondary uppercase text-[11px] bg-theme-neutral px-2 py-0.5 rounded border border-theme-border/50">{val}</span> },
                      {
                        key: 'uploaded_by',
                        header: 'Uploaded By',
                        render: (_, doc) => (
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-brand-teal-50 dark:bg-brand-teal-900/30 text-brand-teal-600 flex items-center justify-center font-bold text-[10px] border border-brand-teal-100 dark:border-brand-teal-800/30">
                              {doc.uploaded_by?.first_name?.[0]}{doc.uploaded_by?.last_name?.[0]}
                            </div>
                            <span className="text-theme-secondary font-medium">{doc.uploaded_by ? `${doc.uploaded_by.first_name} ${doc.uploaded_by.last_name}` : '—'}</span>
                          </div>
                        )
                      },
                      {
                        key: 'created_at',
                        header: 'Date Added',
                        sortable: true,
                        render: (val) => <span className="text-theme-muted font-medium">{fmtDate(val as string)}</span>
                      },
                      {
                        key: 'actions',
                        header: 'Actions',
                        render: (_, doc) => (
                          <div className="flex items-center justify-center gap-3">
                            {doc.file_url ? (
                              <a href={doc.file_url?.startsWith('/') ? `http://localhost:8000${doc.file_url}` : doc.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-brand-teal-600 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-900/20 rounded-lg transition-colors border border-transparent hover:border-brand-teal-100 dark:hover:border-brand-teal-800/30" title="Open Link">
                                <LinkIcon className="w-4 h-4" />
                              </a>
                            ) : null}
                            <button onClick={() => { documentsService.deleteDocument(doc.id).then(() => fetchProjectData()); }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-800/30" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      }
                    ]}
                    data={documents}
                    itemsPerPage={5}
                  />
                </div>
              ) : (
                <Card>
                  <div className="text-center py-10 text-[#6B7280]">
                    <HardDrive className="w-10 h-10 mx-auto text-[#D1D5DB] mb-3" />
                    <p className="text-[14px]">No documents uploaded to this project yet.</p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Tab Content: Milestones */}
          {activeTab === 'Milestones' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center card-base p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <ViewToggle view={milestoneView} onViewChange={setMilestoneView} />
                  <div className="h-8 w-px bg-theme-border mx-2 hidden sm:block"></div>
                  <span className="text-[14px] font-bold text-theme-primary uppercase tracking-tight">{milestones.length} Milestones</span>
                </div>
                <Button onClick={() => setShowMilestoneForm(!showMilestoneForm)} variant={showMilestoneForm ? 'outline' : 'gradient'}>
                  {showMilestoneForm ? 'Hide Form' : <><Plus className="w-4 h-4 mr-2" /> Add Milestone</>}
                </Button>
              </div>

              {/* Milestone Creation Form */}
              {showMilestoneForm && (
                <Card title="New Milestone">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="md:col-span-2">
                      <label className="block text-[12px] font-bold text-theme-muted uppercase tracking-wider mb-2">Title *</label>
                      <input
                        type="text"
                        value={milestoneForm.title}
                        onChange={e => setMilestoneForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-theme-neutral border border-theme-border rounded-xl text-[14px] text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20"
                        placeholder="Milestone title"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[12px] font-bold text-theme-muted uppercase tracking-wider mb-2">Description</label>
                      <textarea
                        value={milestoneForm.description}
                        onChange={e => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 bg-theme-neutral border border-theme-border rounded-xl text-[14px] text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 resize-none h-24"
                        placeholder="Describe this milestone..."
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-theme-muted uppercase tracking-wider mb-2">Start Date</label>
                      <SharedCalendar 
                        value={milestoneForm.start_date ? new Date(milestoneForm.start_date) : undefined} 
                        onChange={v => setMilestoneForm(prev => ({ ...prev, start_date: v?.toISOString().split('T')[0] || '' }))} 
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-theme-muted uppercase tracking-wider mb-2">End Date</label>
                      <SharedCalendar 
                        value={milestoneForm.end_date ? new Date(milestoneForm.end_date) : undefined} 
                        onChange={v => setMilestoneForm(prev => ({ ...prev, end_date: v?.toISOString().split('T')[0] || '' }))} 
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-3">
                      <Button onClick={handleCreateMilestone}>Create Milestone</Button>
                      <Button variant="outline" onClick={() => { setShowMilestoneForm(false); setMilestoneForm({ title: '', description: '', start_date: new Date().toISOString().split('T')[0], end_date: '' }); }}>Cancel</Button>
                    </div>
                  </div>
                </Card>
              )}

              {milestoneView === 'kanban' ? (
                <div className="h-[600px]">
                  <MilestonesKanbanView milestones={milestones as any} onUpdate={fetchProjectData} />
                </div>
              ) : milestones.length > 0 ? (
                <div className="card-base overflow-hidden">
                  <DataTable
                    columns={[
                      { key: 'public_id', header: 'ID', sortable: true, render: (val) => <span className="font-mono text-[11px] bg-theme-neutral text-theme-secondary border border-theme-border px-1.5 py-0.5 rounded">{val}</span> },
                      { key: 'title', header: 'Milestone Title', sortable: true, render: (val) => <span className="font-bold text-theme-primary">{val}</span> },
                      {
                        key: 'start_date',
                        header: 'Start Date',
                        sortable: true,
                        render: (val) => <span className="text-theme-secondary font-medium">{val || '—'}</span>
                      },
                      {
                        key: 'end_date',
                        header: 'End Date',
                        sortable: true,
                        render: (val) => <span className="text-theme-secondary font-medium">{val || '—'}</span>
                      },
                      {
                        key: 'status',
                        header: 'Time Remaining',
                        render: (_, m) => {
                          const daysLeft = getDaysRemaining(m.end_date);
                          const isOverdue = daysLeft?.includes('overdue');
                          return (
                            <span className={`text-[12px] font-bold uppercase tracking-wide bg-theme-neutral px-2.5 py-1 rounded-lg border ${isOverdue ? 'text-red-500 border-red-100 dark:border-red-900/30' : 'text-brand-teal-600 border-brand-teal-100 dark:border-brand-teal-900/30'}`}>
                              {daysLeft || '—'}
                            </span>
                          );
                        }
                      },
                      {
                        key: 'actions',
                        header: 'Actions',
                        render: (_, m) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMilestoneId(m.id);
                              setEditMilestoneTitle(m.title);
                            }}
                            className="p-2 text-theme-muted hover:text-brand-teal-600 hover:bg-brand-teal-50 dark:hover:bg-brand-teal-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )
                      }
                    ]}
                    data={milestones}
                    itemsPerPage={5}
                    onRowClick={(m) => {
                      setEditingMilestoneId(m.id);
                      setEditMilestoneTitle(m.title);
                    }}
                  />
                </div>
              ) : (
                <Card>
                  <div className="text-center py-8 text-[#6B7280] text-[14px]">
                    No milestones defined for this project.
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Tab Content: Users */}
          {activeTab === 'Users' && (
            <Card title={`Project Members (${project?.users?.length || 0})`}>
              {/* Inline Add User */}
              <div className="flex items-center gap-4 py-4 px-2 border-b border-theme-border/50 mb-4">
                <div className="flex-1">
                  <ServerSearchDropdown 
                    entityType="users"
                    value={selectedUserToAdd ? allUsers.find(u => u.id.toString() === selectedUserToAdd) : null}
                    onChange={v => setSelectedUserToAdd(v?.id?.toString() || '')}
                    placeholder="Search for a team member to add..."
                  />
                </div>
                <Button onClick={handleAddUser} disabled={!selectedUserToAdd} variant="gradient">
                  <Plus className="w-4 h-4 mr-2" /> Add Member
                </Button>
              </div>

              {/* Members List */}
              {project?.users && project.users.length > 0 ? (
                <div className="mt-4">
                  <DataTable
                    columns={[
                      {
                        key: 'name',
                        header: 'Member',
                        sortable: true,
                        render: (_, u) => (
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-teal-500 text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0 shadow-sm border border-brand-teal-400">
                              {u.first_name?.[0]}{u.last_name?.[0]}
                            </div>
                            <div className="flex flex-col">
                              <span 
                                onClick={() => navigate(`/users/${u.id}`)}
                                className="text-[14px] font-bold text-theme-primary antialiased hover:text-brand-teal-600 cursor-pointer transition-colors"
                              >
                                {u.first_name} {u.last_name}
                              </span>
                              <span className="text-[12px] text-theme-muted font-medium">{u.email}</span>
                            </div>
                          </div>
                        )
                      },
                      {
                        key: 'role',
                        header: 'Role',
                        render: (_, u) => (
                          <StatusBadge status={u.role?.name || 'Member'} variant="status" />
                        )
                      },
                      {
                        key: 'actions',
                        header: '',
                        render: (_, u) => (
                          <button
                            onClick={() => handleRemoveUser(u.id)}
                            className="p-2 text-theme-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all border border-transparent hover:border-red-100 dark:hover:border-red-800/30"
                            title="Remove from project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )
                      }
                    ]}
                    data={project.users}
                    itemsPerPage={10}
                  />
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-theme-border rounded-xl text-theme-muted text-[14px] bg-theme-neutral/20 mt-4">
                  <UserIcon className="w-10 h-10 mx-auto opacity-20 mb-3" />
                  <p className="font-medium">No users assigned to this project yet.</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
