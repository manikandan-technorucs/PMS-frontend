import React, { useState, useEffect } from 'react';
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

const tabs = ['Dashboard', 'Tasks', 'Issues', 'Time Logs', 'Reports', 'Documents', 'Milestones', 'Timesheet', 'Users'];

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
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

  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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

  const handleCreateTaskList = async () => {
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

  const getDaysRemaining = (endDateStr?: string | null) => {
    if (!endDateStr) return null;
    const diff = new Date(endDateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days >= 0 ? `${days} days remaining` : `${Math.abs(days)} days overdue`;
  };

  if (loading) return <div className="p-8"><p>Loading project details...</p></div>;
  if (!project) return <div className="p-8"><p>Project not found.</p></div>;

  return (
    <PageLayout
      title={project.name}
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
      <div className="space-y-6">
        {/* Project Summary Header — Premium Design */}
        <div className="bg-white border border-[#E5E7EB] rounded-[6px] border-t-[3px] border-t-[#059669] overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Project ID</p>
                  <p className="text-[14px] font-semibold text-[#1F2937]">{project.public_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Client</p>
                  <p className="text-[14px] font-semibold text-[#1F2937]">{project.client || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Status</p>
                  <StatusBadge status={project.status?.name || 'Unknown'} variant="status" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Priority</p>
                  <StatusBadge status={project.priority?.name || 'Unknown'} variant="priority" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Manager</p>
                  <p className="text-[14px] font-semibold text-[#1F2937]">
                    {project.manager ? `${project.manager.first_name} ${project.manager.last_name}` : 'Unassigned'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Start Date</p>
                  <p className="text-[14px] font-semibold text-[#1F2937]">{project.start_date || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">End Date</p>
                  <p className="text-[14px] font-semibold text-[#1F2937]">{project.end_date || 'N/A'}</p>
                  {project.end_date && (
                    <p className={`text-[12px] mt-0.5 ${getDaysRemaining(project.end_date)?.includes('overdue') ? 'text-red-500' : 'text-blue-500'}`}>
                      {getDaysRemaining(project.end_date)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="w-9 h-9 rounded-[6px] bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Project Hours</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-[14px] font-semibold text-[#1F2937]">{actualHours.toFixed(1)}h</p>
                    <p className="text-[12px] text-[#6B7280]">/ {project.estimated_hours || 0}h eff</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#E5E7EB] w-full overflow-x-auto hide-scrollbar">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-[14px] font-medium transition-all border-b-2 ${activeTab === tab
                  ? 'text-[#059669] border-[#059669]'
                  : 'text-[#6B7280] border-transparent hover:text-[#1F2937] hover:bg-[#ECFDF5]/30'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content: Dashboard / Overview */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-6">
            {/* KPI Stat Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white border rounded-[6px] p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Tasks</span>
                </div>
                <p className="text-[22px] font-bold text-[#1F2937]">{tasks.length}</p>
                <p className="text-[11px] text-[#059669] mt-0.5">{tasks.filter(t => t.status?.name === 'Completed').length} completed</p>
              </div>
              <div className="bg-white border rounded-[6px] p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-[6px] bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Issues</span>
                </div>
                <p className="text-[22px] font-bold text-[#1F2937]">{issues.length}</p>
                <p className="text-[11px] text-[#D97706] mt-0.5">{issues.filter(i => i.status?.name === 'Open').length} open</p>
              </div>
              <div className="bg-white border rounded-[6px] p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-[6px] bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED]">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Milestones</span>
                </div>
                <p className="text-[22px] font-bold text-[#1F2937]">{milestones.length}</p>
              </div>
              <div className="bg-white border rounded-[6px] p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-[6px] bg-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Hours</span>
                </div>
                <p className="text-[22px] font-bold text-[#1F2937]">{actualHours.toFixed(1)}h</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">of {project.estimated_hours || 0}h est</p>
              </div>
              <div className="bg-white border rounded-[6px] p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-[6px] bg-[#FCE7F3] flex items-center justify-center text-[#DB2777]">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Team</span>
                </div>
                <p className="text-[22px] font-bold text-[#1F2937]">{project.users?.length || 0}</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">members</p>
              </div>
              <div className="bg-white border rounded-[6px] p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-[6px] bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-[#6B7280] uppercase tracking-wider font-medium">Documents</span>
                </div>
                <p className="text-[22px] font-bold text-[#1F2937]">{documents.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <Card title="Description">
                  <p className="text-[14px] text-[#374151] leading-relaxed">{project.description || 'No description provided.'}</p>
                </Card>

                {/* Task Completion Progress */}
                <Card title="Task Completion">
                  <div className="space-y-3">
                    {(() => {
                      const completedCount = tasks.filter(t => t.status?.name === 'Completed').length;
                      const inProgressCount = tasks.filter(t => t.status?.name === 'In Progress').length;
                      const pendingCount = tasks.length - completedCount - inProgressCount;
                      const completionPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
                      return (
                        <>
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-[#6B7280]">Overall Progress</span>
                            <span className="font-bold text-[#059669]">{completionPct}%</span>
                          </div>
                          <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                            <div className="bg-[#059669] h-3 rounded-full transition-all" style={{ width: `${completionPct}%` }}></div>
                          </div>
                          <div className="flex gap-6 text-[12px] text-[#6B7280] mt-2">
                            <span><span className="inline-block w-2 h-2 rounded-full bg-[#059669] mr-1"></span>Completed: {completedCount}</span>
                            <span><span className="inline-block w-2 h-2 rounded-full bg-[#F59E0B] mr-1"></span>In Progress: {inProgressCount}</span>
                            <span><span className="inline-block w-2 h-2 rounded-full bg-[#D1D5DB] mr-1"></span>Pending: {pendingCount}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </Card>

                {/* Hours Progress */}
                <Card title="Hours Tracking">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#6B7280]">Actual vs. Estimated</span>
                      <span className="font-bold text-[#1F2937]">{actualHours.toFixed(1)}h / {project.estimated_hours || 0}h</span>
                    </div>
                    <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${actualHours > (project.estimated_hours || 0) ? 'bg-red-500' : 'bg-[#2563EB]'}`}
                        style={{ width: `${Math.min((actualHours / (project.estimated_hours || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    {actualHours > (project.estimated_hours || 0) && (
                      <p className="text-[12px] text-red-500 font-medium">⚠ Over budget by {(actualHours - (project.estimated_hours || 0)).toFixed(1)}h</p>
                    )}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card title="Project Summary">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#6B7280]">Effort Hours</span>
                      <span className="font-semibold text-[#1F2937]">{project.estimated_hours || 0}h</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#6B7280]">Actual Hours</span>
                      <span className="font-semibold text-[#059669]">{actualHours.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#6B7280]">Time Logs</span>
                      <span className="font-semibold text-[#1F2937]">{timelogs.length}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#6B7280]">Timesheets</span>
                      <span className="font-semibold text-[#1F2937]">{timesheets.length}</span>
                    </div>
                  </div>
                </Card>
                {project.department && (
                  <Card title="Department">
                    <p className="text-[14px] text-[#374151]">{project.department.name}</p>
                  </Card>
                )}
                {project.team && (
                  <Card title="Assigned Team">
                    <p className="text-[14px] text-[#374151]">{project.team.name}</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Tasks */}
        {activeTab === 'Tasks' && (
          <div className="space-y-6">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCreateTaskList}>
                <Plus className="w-4 h-4 mr-2" /> New Task List
              </Button>
              <Button onClick={() => navigate('/tasks/create')}>
                <Plus className="w-4 h-4 mr-2" /> New Task
              </Button>
            </div>

            {taskLists.length > 0 ? taskLists.map(list => {
              const listTasks = tasks.filter(t => t.task_list_id === list.id);

              return (
                <Card key={list.id} title={list.name}>
                  <p className="text-[13px] text-[#6B7280] mb-4">{list.description}</p>

                  {listTasks.length > 0 ? (
                    <div className="space-y-2">
                      {listTasks.map(t => {
                        const taskHours = timelogs
                          .filter(l => l.task_id === t.id)
                          .reduce((sum, l) => sum + l.hours, 0);

                        return (
                          <div
                            key={t.id}
                            onClick={() => navigate(`/tasks/${t.id}`)}
                            className="cursor-pointer flex items-center justify-between p-3 bg-white border rounded-[6px] hover:shadow-md hover:border-[#059669] transition-all"
                          >
                            <div>
                              <p className="text-[14px] font-medium text-[#1F2937]">
                                {t.title}
                              </p>
                              <p className="text-[12px] text-[#6B7280] mt-1">
                                {t.start_date
                                  ? `${t.start_date} to ${t.end_date}`
                                  : 'No dates set'}{' '}
                                • {getDaysRemaining(t.end_date) || 'No deadline'}
                              </p>
                            </div>

                            <div className="flex gap-4 items-center">
                              <div className="text-right">
                                <p className="text-[13px] font-medium text-[#059669]">
                                  {taskHours.toFixed(1)}h actual
                                </p>
                                <p className="text-[11px] text-[#6B7280]">
                                  / {t.estimated_hours || 0}h effort
                                </p>
                              </div>
                              <StatusBadge
                                status={t.status?.name || 'Open'}
                                variant="status"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#9CA3AF] italic">
                      No tasks in this list.
                    </p>
                  )}
                </Card>
              );
            }) : (
              <Card>
                <div className="text-center py-8 text-[#6B7280] text-[14px]">
                  No Task Lists created. Task Lists help group your tasks.
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
                        className="cursor-pointer flex items-center justify-between p-3 bg-white border rounded-[6px] hover:shadow-md hover:border-[#059669] transition-all"
                      >
                        <p className="text-[14px] font-medium text-[#1F2937]">
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
              <Card title={`Project Issues (${issues.length})`}>
                <div className="space-y-2 mt-4">
                  {issues.map(i => (
                    <div key={i.id} onClick={() => navigate(`/issues/${i.id}`)} className="cursor-pointer flex items-center justify-between p-3 bg-white border rounded-[6px] hover:shadow-md hover:border-[#059669] transition-all">
                      <div className="flex-1">
                        <p className="text-[14px] font-medium text-[#1F2937]">{i.title}</p>
                        <p className="text-[12px] text-[#6B7280] mt-1">
                          Assignee: {i.assignee ? `${i.assignee.first_name} ${i.assignee.last_name}` : 'Unassigned'}
                          {i.start_date && ` • ${i.start_date} to ${i.end_date || 'N/A'}`}
                          {i.end_date && ` • ${getDaysRemaining(i.end_date) || ''}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[13px] font-medium text-[#059669]">
                            {i.estimated_hours || 0}h effort
                          </p>
                          {i.end_date && (
                            <p className={`text-[11px] ${getDaysRemaining(i.end_date)?.includes('overdue') ? 'text-red-500' : 'text-blue-500'}`}>
                              {getDaysRemaining(i.end_date)}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={i.status?.name || 'Open'} variant="status" />
                        <StatusBadge status={i.priority?.name || 'Medium'} variant="priority" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-8 text-[#6B7280] text-[14px]">
                  No issues reported for this project.
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab Content: Time Logs */}
        {activeTab === 'Time Logs' && (
          <div className="space-y-4">
            {/* View mode + Date navigation bar */}
            <div className="bg-white border rounded-[6px] p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-[6px] p-1">
                {(['day', 'week', 'month', 'range'] as const).map(mode => (
                  <button key={mode} onClick={() => setLogViewMode(mode)}
                    className={`px-3 py-1.5 text-[12px] font-medium rounded-[4px] transition-all capitalize
                      ${logViewMode === mode ? 'bg-white text-[#059669] shadow-sm' : 'text-[#6B7280] hover:text-[#374151]'}`}
                  >{mode}</button>
                ))}
              </div>
              {logViewMode !== 'range' ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => navigateLogDate('prev')} className="p-1.5 rounded hover:bg-gray-100">
                    <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFB] border rounded-[6px] text-[13px] font-medium text-[#374151] min-w-[200px] justify-center">
                    <Calendar className="w-4 h-4 text-[#059669]" />
                    {(() => { const r = getDateRange(); return r.start === r.end ? fmtDate(r.start) : `${fmtDate(r.start)} — ${fmtDate(r.end)}`; })()}
                  </div>
                  <button onClick={() => navigateLogDate('next')} className="p-1.5 rounded hover:bg-gray-100">
                    <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                  </button>
                  <button onClick={() => setLogCurrentDate(new Date().toISOString().split('T')[0])} className="text-[12px] font-medium text-[#059669] hover:underline ml-1">Today</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <label className="text-[12px] text-[#6B7280]">From:</label>
                  <input type="date" value={logRangeStart} onChange={e => setLogRangeStart(e.target.value)} className="border rounded-[6px] px-2 py-1.5 text-[13px]" />
                  <label className="text-[12px] text-[#6B7280]">To:</label>
                  <input type="date" value={logRangeEnd} onChange={e => setLogRangeEnd(e.target.value)} className="border rounded-[6px] px-2 py-1.5 text-[13px]" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-[13px]"><Clock className="w-3.5 h-3.5 inline text-[#059669] mr-1" />{filteredTimelogs.reduce((s, l) => s + l.hours, 0).toFixed(2)}h</span>
                <span className="text-[12px] text-[#6B7280]">{filteredTimelogs.length} entries</span>
              </div>
            </div>

            {/* Add button */}
            <div className="flex justify-end">
              <Button onClick={() => navigate('/time-log/create')}><Plus className="w-4 h-4 mr-2" /> Add Time Log</Button>
            </div>

            {/* Entries grouped by date */}
            {filteredTimelogs.length > 0 ? (
              <div className="space-y-3">
                {Object.entries(
                  filteredTimelogs.reduce((groups: Record<string, typeof timelogs>, log) => {
                    const d = log.date?.split('T')[0] || 'Unknown';
                    if (!groups[d]) groups[d] = [];
                    groups[d].push(log);
                    return groups;
                  }, {})
                ).sort(([a], [b]) => b.localeCompare(a)).map(([date, logs]) => (
                  <Card key={date}>
                    <div className="flex items-center justify-between mb-2 pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#059669]" />
                        <span className="text-[14px] font-semibold text-[#1F2937]">{fmtDate(date)}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#059669]">{logs.reduce((s: number, l: any) => s + l.hours, 0).toFixed(2)}h</span>
                    </div>
                    <div className="space-y-2">
                      {logs.map((l: any) => (
                        <div key={l.id} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-[6px] hover:bg-[#F0FDF4] transition-colors group">
                          <div className="flex-1">
                            <p className="text-[14px] font-medium text-[#1F2937]">{l.description || l.task?.title || 'No description'}</p>
                            <p className="text-[12px] text-[#6B7280] mt-1">
                              <span className="font-medium text-[#059669]">{project?.name || 'Project'}</span>
                              {l.task?.title && <> • Task: {l.task.title}</>}
                              {l.issue?.title && <> • Issue: {l.issue.title}</>}
                              {l.user && <> • {l.user.first_name} {l.user.last_name}</>}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => navigate(`/time-log/edit/${l.id}`)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-[#6B7280] hover:text-[#059669] hover:bg-[#ECFDF5] rounded transition-all"
                              title="Edit Time Log"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <span className="text-[16px] font-bold text-[#059669] w-[60px] text-right">{l.hours.toFixed(2)}h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
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
              <div className="flex items-center justify-between p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px] text-[13px]">
                <div className="flex gap-6">
                  <span><span className="text-[#6B7280]">Total: </span><span className="font-bold text-[#1F2937]">{filteredTimelogs.reduce((s, l) => s + l.hours, 0).toFixed(2)}h</span></span>
                </div>
                <span className="text-[12px] text-[#6B7280]">{filteredTimelogs.length} entries</span>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Timesheet (List of Timesheets) */}
        {activeTab === 'Timesheet' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white border rounded-[6px] p-3 shadow-sm space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex bg-[#F3F4F6] rounded-[6px] p-1">
                  {([['all', 'All'], ['week', 'Weekly'], ['month', 'Monthly'], ['range', 'Custom']] as const).map(([mode, label]) => (
                    <button
                      key={mode}
                      onClick={() => setTsViewMode(mode as any)}
                      className={`px-3 py-1.5 text-[13px] font-medium rounded-[4px] transition-colors ${tsViewMode === mode ? 'bg-white text-[#059669] shadow-sm' : 'text-[#6B7280] hover:text-[#374151]'}`}
                    >{label}</button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {(tsViewMode === 'week' || tsViewMode === 'month') && (
                    <>
                      <button onClick={() => navigateTsDate('prev')} className="p-1.5 hover:bg-gray-100 rounded border"><ChevronLeft className="w-4 h-4 text-[#6B7280]" /></button>
                      <span className="text-[13px] font-medium text-[#059669] px-2">{tsDateLabel}</span>
                      <button onClick={() => navigateTsDate('next')} className="p-1.5 hover:bg-gray-100 rounded border"><ChevronRight className="w-4 h-4 text-[#6B7280]" /></button>
                    </>
                  )}
                  <Button onClick={() => navigate('/timesheets/create')}><Plus className="w-4 h-4 mr-2" /> Create Timesheet</Button>
                </div>
              </div>
              {tsViewMode === 'range' && (
                <div className="flex items-center gap-3 pt-2 border-t">
                  <label className="text-[13px] text-[#6B7280]">From:</label>
                  <input type="date" value={tsRangeStart} onChange={e => setTsRangeStart(e.target.value)} className="px-3 py-1.5 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30" />
                  <label className="text-[13px] text-[#6B7280]">To:</label>
                  <input type="date" value={tsRangeEnd} onChange={e => setTsRangeEnd(e.target.value)} className="px-3 py-1.5 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30" />
                </div>
              )}
            </div>

            {/* Summary Bar */}
            {filteredTimesheets.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px] text-[13px]">
                <span className="text-[#6B7280]">Showing <span className="font-bold text-[#1F2937]">{filteredTimesheets.length}</span> timesheet(s)</span>
                <span className="text-[#6B7280]">Total Hours: <span className="font-bold text-[#059669]">{filteredTimesheets.reduce((s, ts) => s + Number(ts.total_hours || 0), 0).toFixed(2)}h</span></span>
              </div>
            )}

            {/* Timesheet Table */}
            {filteredTimesheets.length > 0 ? (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-[#F9FAFB] border-b text-[#4B5563]">
                        <th className="text-left px-4 py-3 font-semibold">Timesheet Name</th>
                        <th className="text-left px-4 py-3 font-semibold">Time Period</th>
                        <th className="text-left px-4 py-3 font-semibold">Log Users</th>
                        <th className="text-left px-4 py-3 font-semibold">Billing Type</th>
                        <th className="text-right px-4 py-3 font-semibold">Total Hours</th>
                        <th className="text-center px-4 py-3 font-semibold">Approval Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredTimesheets.map(ts => (
                        <tr key={ts.id} className="hover:bg-[#F9FAFB]/50 cursor-pointer transition-colors" onClick={() => navigate(`/timesheets/${ts.id}`)}>
                          <td className="px-4 py-3 font-medium text-[#374151] hover:text-[#059669]">{ts.name}</td>
                          <td className="px-4 py-3 text-[#374151] whitespace-nowrap"><div className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#6B7280]" /> {fmtDate(ts.start_date)} to {fmtDate(ts.end_date)}</div></td>
                          <td className="px-4 py-3 text-[#374151]">
                            {ts.user ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold text-[10px]">
                                  {ts.user.first_name[0]}{ts.user.last_name[0]}
                                </div>
                                <span>{ts.user.first_name} {ts.user.last_name}</span>
                              </div>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3 text-[#374151]">{ts.billing_type || '—'}</td>
                          <td className="px-4 py-3 text-right font-medium text-[#374151]">{Number(ts.total_hours).toFixed(2)}h</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${ts.approval_status === 'Approved' ? 'bg-[#D1FAE5] text-[#065F46]' :
                              ts.approval_status === 'Rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>
                              {ts.approval_status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
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
              <div className="bg-white border rounded-[6px] p-5">
                <p className="text-[12px] text-[#6B7280] mb-1">Total Tasks</p>
                <p className="text-[24px] font-bold text-[#1F2937]">{tasks.length}</p>
              </div>
              <div className="bg-white border rounded-[6px] p-5">
                <p className="text-[12px] text-[#6B7280] mb-1">Total Issues</p>
                <p className="text-[24px] font-bold text-[#1F2937]">{issues.length}</p>
              </div>
              <div className="bg-white border rounded-[6px] p-5">
                <p className="text-[12px] text-[#6B7280] mb-1">Total Hours</p>
                <p className="text-[24px] font-bold text-[#059669]">{actualHours.toFixed(1)}h</p>
              </div>
              <div className="bg-white border rounded-[6px] p-5">
                <p className="text-[12px] text-[#6B7280] mb-1">Milestones</p>
                <p className="text-[24px] font-bold text-[#7C3AED]">{milestones.length}</p>
              </div>
            </div>

            {/* Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#ECFDF5] rounded-[6px] flex items-center justify-center text-[#059669] flex-shrink-0">
                    <Download className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold mb-1 text-[#1F2937]">Export Project Tasks</h3>
                    <p className="text-[14px] mb-3 text-[#6B7280]">Download all tasks for this project as CSV</p>
                    <Button size="sm" onClick={() => {
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
                  <div className="w-12 h-12 bg-[#FEF3C7] rounded-[6px] flex items-center justify-center text-[#D97706] flex-shrink-0">
                    <Download className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold mb-1 text-[#1F2937]">Export Project Issues</h3>
                    <p className="text-[14px] mb-3 text-[#6B7280]">Download all issues for this project as CSV</p>
                    <Button size="sm" onClick={() => {
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
                  <div className="w-12 h-12 bg-[#DBEAFE] rounded-[6px] flex items-center justify-center text-[#2563EB] flex-shrink-0">
                    <Download className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold mb-1 text-[#1F2937]">Export Time Logs</h3>
                    <p className="text-[14px] mb-3 text-[#6B7280]">Download all time logs for this project as CSV</p>
                    <Button size="sm" onClick={() => {
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
                  <div className="w-12 h-12 bg-[#F3F4F6] rounded-[6px] flex items-center justify-center text-[#6B7280] flex-shrink-0">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-semibold mb-1 text-[#1F2937]">Global Reports</h3>
                    <p className="text-[14px] mb-3 text-[#6B7280]">View detailed reports across all projects</p>
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
                    <label className="block text-[13px] font-medium text-[#374151] mb-1">Document Title *</label>
                    <input
                      type="text"
                      value={documentForm.title}
                      onChange={e => setDocumentForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                      placeholder="e.g. Q3 Design Assets Link"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#374151] mb-1">Document URL (Link to SharePoint/GDrive) *</label>
                    <input
                      type="text"
                      value={documentForm.file_url}
                      onChange={e => setDocumentForm(prev => ({ ...prev, file_url: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                      placeholder="https://docs.google.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#374151] mb-1">Type</label>
                    <input
                      type="text"
                      value={documentForm.file_type}
                      onChange={e => setDocumentForm(prev => ({ ...prev, file_type: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                      defaultValue="url"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-medium text-[#374151] mb-1">Description (Optional)</label>
                    <textarea
                      value={documentForm.description}
                      onChange={e => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 resize-none h-16"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <Button onClick={async () => {
                      if (!documentForm.title || !documentForm.file_url || !project) return;
                      await documentsService.createDocument({ ...documentForm, project_id: project.id });
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
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-[#F9FAFB] border-b text-[#4B5563]">
                        <th className="text-left px-4 py-3 font-semibold">Title</th>
                        <th className="text-left px-4 py-3 font-semibold">Type</th>
                        <th className="text-left px-4 py-3 font-semibold">Uploaded By</th>
                        <th className="text-left px-4 py-3 font-semibold">Date Added</th>
                        <th className="text-center px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {documents.map(doc => (
                        <tr key={doc.id} className="hover:bg-[#F9FAFB]/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-[#F3F4F6] flex flex-shrink-0 items-center justify-center text-[#6B7280]">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-[#1F2937] leading-none mb-1">{doc.title}</p>
                                {doc.description && <p className="text-[11px] text-[#6B7280] line-clamp-1">{doc.description}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#6B7280]">{doc.file_type || 'url'}</td>
                          <td className="px-4 py-3 text-[#374151]">
                            {doc.uploaded_by ? `${doc.uploaded_by.first_name} ${doc.uploaded_by.last_name}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-[#6B7280]">
                            {fmtDate(doc.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {doc.file_url ? (
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-[#059669] hover:bg-[#ECFDF5] rounded transition-colors" title="Open Link">
                                  <LinkIcon className="w-4 h-4" />
                                </a>
                              ) : null}
                              <button onClick={() => { documentsService.deleteDocument(doc.id).then(() => fetchProjectData()); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
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
            <div className="flex justify-end">
              <Button onClick={() => setShowMilestoneForm(!showMilestoneForm)}><Plus className="w-4 h-4 mr-2" /> Add Milestone</Button>
            </div>

            {/* Milestone Creation Form */}
            {showMilestoneForm && (
              <Card title="New Milestone">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-medium text-[#374151] mb-1">Title *</label>
                    <input
                      type="text"
                      value={milestoneForm.title}
                      onChange={e => setMilestoneForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                      placeholder="Milestone title"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-medium text-[#374151] mb-1">Description</label>
                    <textarea
                      value={milestoneForm.description}
                      onChange={e => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 resize-none h-20"
                      placeholder="Describe this milestone..."
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#374151] mb-1">Start Date</label>
                    <input
                      type="date"
                      value={milestoneForm.start_date}
                      onChange={e => setMilestoneForm(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#374151] mb-1">End Date</label>
                    <input
                      type="date"
                      value={milestoneForm.end_date}
                      onChange={e => setMilestoneForm(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <Button onClick={handleCreateMilestone}>Create Milestone</Button>
                    <Button variant="outline" onClick={() => { setShowMilestoneForm(false); setMilestoneForm({ title: '', description: '', start_date: new Date().toISOString().split('T')[0], end_date: '' }); }}>Cancel</Button>
                  </div>
                </div>
              </Card>
            )}

            {milestones.length > 0 ? (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-[#F9FAFB] border-b text-[#4B5563]">
                        <th className="text-left px-4 py-3 font-semibold">Phase Name</th>
                        <th className="text-left px-4 py-3 font-semibold">Status</th>
                        <th className="text-left px-4 py-3 font-semibold">Start Date</th>
                        <th className="text-left px-4 py-3 font-semibold">End Date</th>
                        <th className="text-left px-4 py-3 font-semibold">Days Left</th>
                        <th className="text-center px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {milestones.map(m => {
                        const daysLeft = getDaysRemaining(m.end_date);
                        const isOverdue = daysLeft?.includes('overdue');
                        const isEditing = editingMilestoneId === m.id;
                        return (
                          <tr key={m.id} className="hover:bg-[#F9FAFB]/50 transition-colors">
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editMilestoneTitle}
                                    onChange={e => setEditMilestoneTitle(e.target.value)}
                                    className="flex-1 px-2 py-1 border rounded text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                                    autoFocus
                                    onKeyDown={e => {
                                      if (e.key === 'Enter' && editMilestoneTitle.trim()) {
                                        milestonesService.updateMilestone(m.id, { title: editMilestoneTitle.trim() }).then(() => { setEditingMilestoneId(null); fetchProjectData(); });
                                      }
                                      if (e.key === 'Escape') setEditingMilestoneId(null);
                                    }}
                                  />
                                  <button onClick={() => { if (editMilestoneTitle.trim()) milestonesService.updateMilestone(m.id, { title: editMilestoneTitle.trim() }).then(() => { setEditingMilestoneId(null); fetchProjectData(); }); }} className="text-[#059669] hover:text-[#047857] text-[12px] font-medium">Save</button>
                                  <button onClick={() => setEditingMilestoneId(null)} className="text-[#6B7280] hover:text-[#374151] text-[12px]">Cancel</button>
                                </div>
                              ) : (
                                <>
                                  <p className="font-medium text-[#059669]">{m.title}</p>
                                  {m.description && <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-1">{m.description}</p>}
                                </>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={m.status?.name || 'Active'} variant="status" />
                            </td>
                            <td className="px-4 py-3 text-[#374151]">{m.start_date || '—'}</td>
                            <td className="px-4 py-3 text-[#374151]">{m.end_date || '—'}</td>
                            <td className="px-4 py-3">
                              {daysLeft ? (
                                <span className={`text-[12px] font-medium ${isOverdue ? 'text-red-500' : 'text-[#059669]'}`}>
                                  {daysLeft}
                                </span>
                              ) : (
                                <span className="text-[#9CA3AF]">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {!isEditing && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingMilestoneId(m.id);
                                    setEditMilestoneTitle(m.title);
                                  }}
                                  className="p-1.5 text-[#6B7280] hover:text-[#059669] hover:bg-[#ECFDF5] rounded transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
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
            <div className="flex items-center gap-3 mt-3 pb-3 border-b">
              <select
                value={selectedUserToAdd}
                onChange={e => setSelectedUserToAdd(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 bg-white"
              >
                <option value="">Add a team member...</option>
                {allUsers
                  .filter(u => !project?.users?.some((pu: any) => pu.id === u.id))
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
                  ))}
              </select>
              <Button onClick={handleAddUser} disabled={!selectedUserToAdd}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {/* Members List */}
            {project?.users && project.users.length > 0 ? (
              <div className="space-y-2 mt-3">
                {project.users.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-[6px] hover:bg-[#F0FDF4] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#059669] flex items-center justify-center text-white font-semibold text-[14px]">
                        {u.first_name?.[0]}{u.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#1F2937]">{u.first_name} {u.last_name}</p>
                        <p className="text-[12px] text-[#6B7280]">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-[#6B7280] bg-white px-2 py-1 rounded border">
                        {u.role?.name || 'Member'}
                      </span>
                      <button
                        onClick={() => handleRemoveUser(u.id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remove from project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#6B7280] text-[14px] mt-3">
                <UserIcon className="w-10 h-10 mx-auto text-[#D1D5DB] mb-3" />
                <p>No users assigned to this project yet.</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
