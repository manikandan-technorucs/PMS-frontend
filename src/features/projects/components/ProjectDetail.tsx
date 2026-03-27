import React, { useState, useEffect, useMemo } from 'react';
import { ViewToggle, ViewType } from '@/components/ui/ViewToggle/ViewToggle';
import { MilestonesKanbanView } from './MilestonesKanbanView';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from 'primereact/button';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { DataTable, Column } from '@/components/DataTable/DataTable';
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
  ChevronLeft, ChevronRight, Link as LinkIcon, AlertTriangle, Layers, FolderKanban
} from 'lucide-react';
import SharedCalendar from '@/components/core/SharedCalendar';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { GraphUserAutocomplete, GraphUser } from './GraphUserAutocomplete';
import { PageSpinner } from '@/components/ui/Loader/PageSpinner';

const tabs = ['Dashboard', 'Tasks', 'Issues', 'Time Logs', 'Reports', 'Documents', 'Milestones', 'Timesheet', 'Users'];

/* ─── Premium UI Components ───────────────────────────────────────── */

const GlassCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`card-base bg-white dark:bg-slate-900 overflow-hidden ${className}`}>
    <div className="relative z-10">{children}</div>
  </div>
);

const StatChip = ({ label, value, icon }: any) => (
  <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all">
    <div className="w-1 absolute top-0 bottom-0 left-0 bg-teal-500 rounded-l-xl" />
    <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
      <div className="relative z-10">{icon}</div>
    </div>
    <div className="pt-0.5">
      <p className="text-[18px] font-black text-slate-800 dark:text-white leading-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 leading-none mt-0.5">{label}</p>
    </div>
  </div>
);

const EmptyState = ({ icon, title, description, action }: any) => (
  <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
    <p className="text-xs font-medium text-slate-500 mb-4">{description}</p>
    {action}
  </div>
);

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const getDaysRemaining = (endDateStr?: string | null) => {
    if (!endDateStr) return null;
    const diff = new Date(endDateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days >= 0 ? `${days} days left` : `${Math.abs(days)}d overdue`;
  };

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [milestoneView, setMilestoneView] = useState<ViewType>('list');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [timelogs, setTimelogs] = useState<TimeLog[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [actualHours, setActualHours] = useState(0);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<GraphUser | null>(null);

  useEffect(() => {
    if (projectId) fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const pid = parseInt(projectId as string, 10);
      const [proj, usr, ms, tl, t, log, iss, ts, doc] = await Promise.all([
        projectsService.getProject(pid), usersService.getUsers(0, 500), milestonesService.getMilestones(pid),
        tasklistsService.getTaskLists(pid), tasksService.getTasks(0, 1000, pid), timelogsService.getTimelogs(0, 1000, pid),
        issuesService.getIssues(0, 1000, pid), timesheetsService.getTimesheets(0, 1000, pid), documentsService.getDocuments(pid)
      ]);
      setProject(proj);
      setAllUsers((usr as any)?.items || usr || []);
      setMilestones(ms);
      setTaskLists(tl);
      setTasks((t as any)?.items || t || []);
      setTimelogs((log as any)?.items || log || []);
      setIssues((iss as any)?.items || iss || []);
      setTimesheets((ts as any)?.items || ts || []);
      setDocuments(doc);

      const logsArr = (log as any)?.items || log || [];
      setActualHours(logsArr.reduce((acc: number, curr: TimeLog) => acc + (curr.hours || 0), 0));
    } catch (e) { console.error('Error fetching project data', e); } finally { setLoading(false); }
  };

  const handleAddUser = async () => {
    if (!project || !selectedUserToAdd) return;
    try {
      let existingUser = allUsers.find(u => u.email === selectedUserToAdd.mail);
      if (!existingUser) existingUser = await usersService.createUser({
        first_name: (selectedUserToAdd as any).givenName || selectedUserToAdd.displayName.split(' ')[0],
        last_name: (selectedUserToAdd as any).surname || selectedUserToAdd.displayName.split(' ').slice(1).join(' ') || '',
        email: selectedUserToAdd.mail || (selectedUserToAdd as any).userPrincipalName || `${selectedUserToAdd.id}@temp.com`,
        o365_id: selectedUserToAdd.id,
      });
      await projectsService.assignUser(project.id, { user_id: existingUser.id.toString(), user_email: existingUser.email, display_name: `${existingUser.first_name} ${existingUser.last_name}` });
      setSelectedUserToAdd(null); fetchProjectData();
    } catch (error) { console.error('Failed to add user', error); }
  };

  const handleRemoveUser = async (userEmail: string) => {
    if (!project || !window.confirm('Remove this user from the project?')) return;
    try {
      await projectsService.removeUser(project.id, userEmail);
      fetchProjectData();
    } catch (error) { console.error('Failed to remove user', error); }
  };

  const handleDeleteMilestone = async (id: number) => {
    if (!window.confirm('Delete this milestone?')) return;
    try { await milestonesService.deleteMilestone(id); fetchProjectData(); } catch (e) { }
  };

  const handleDeleteDoc = async (id: number) => {
    if (!window.confirm('Delete this document?')) return;
    try { await documentsService.deleteDocument(id); fetchProjectData(); } catch (e) { }
  };

  const progressPercent = project?.estimated_hours ? Math.min(100, Math.round((actualHours / project.estimated_hours) * 100)) : 0;

  if (loading || !project) return <PageSpinner fullPage label="Loading project" />;

  return (
    <PageLayout
      title="Project Details"
      isFullHeight
      actions={
        <div className="flex items-center gap-2">
          <Button outlined onClick={() => navigate('/projects')}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <Button onClick={() => navigate(`/projects/${project.id}/edit`)} className="btn-gradient"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
        </div>
      }
    >
      <div className="h-full flex flex-col space-y-6 overflow-hidden">
        
        {/* Header Hero Banner aligned with Brand Logo Gradient */}
        <div className="relative overflow-hidden rounded-3xl border-none shadow-lg px-8 py-6 flex-shrink-0"
             style={{ background: 'var(--brand-gradient)', boxShadow: '0 10px 30px -5px rgba(12, 209, 195, 0.3)' }}>
          <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 50%)' }} />
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center flex-shrink-0 border border-white/50 backdrop-blur-md shadow-sm">
                <FolderKanban className="w-7 h-7 text-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-[28px] leading-none tracking-tight font-black text-slate-900">{project.name}</h1>
                  <StatusBadge status={project.status?.name || 'Active'} variant="status" />
                  <StatusBadge status={project.priority?.name || 'Normal'} variant="priority" />
                </div>
                <div className="flex flex-wrap items-center mt-3 gap-4 text-[13px] font-bold text-slate-800">
                  <span className="flex items-center gap-1.5"><Hash className="w-4 h-4 opacity-70" /> {project.public_id}</span>
                  {project.client && <span className="flex items-center gap-1.5"><Building className="w-4 h-4 opacity-70" /> {project.client}</span>}
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 opacity-70" /> {fmtDate(project.start_date)} - {project.end_date ? fmtDate(project.end_date) : 'Ongoing'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[12px] font-black text-slate-800 mb-1.5 uppercase tracking-widest">Progress</p>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2.5 rounded-full bg-slate-900/10 overflow-hidden backdrop-blur-sm shadow-inner border border-slate-900/5">
                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-[16px] font-black text-slate-900 tabular-nums tracking-tighter">{progressPercent}%</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-800/80 mt-1.5 font-black">{actualHours} / {project.estimated_hours || 0} Hours</p>
              </div>

              <div className="hidden lg:flex flex-col items-end">
                <p className="text-[11px] uppercase font-black text-slate-800 tracking-widest mb-2.5">Team</p>
                <div className="flex -space-x-2">
                  {project.users?.slice(0,4).map(u => (
                    <div key={u.id} className="w-8 h-8 rounded-full bg-slate-900 border-2 border-[#B3F57B] flex items-center justify-center text-[11px] font-black text-[#B3F57B] shadow-sm z-10" title={`${u.first_name} ${u.last_name}`}>
                      {u.first_name?.[0]}{u.last_name?.[0]}
                    </div>
                  ))}
                  {(project.users?.length || 0) > 4 && (
                    <div className="w-8 h-8 rounded-full bg-white/40 border-2 border-[#0CD1C3] flex items-center justify-center text-[10px] font-black text-slate-900 backdrop-blur-md">
                      +{project.users!.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 overflow-x-auto pb-px">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 text-[13px] font-extrabold whitespace-nowrap relative transition-colors border-0 bg-transparent cursor-pointer ${activeTab === tab ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-auto pr-1">
          
          {/* Dashboard Tab */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-5">
              {/* 4 KPI mini-cards row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tasks Progress</p>
                    <Layers className="w-4 h-4 text-teal-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{tasks.filter(t => t.status?.name === 'Completed').length}/{tasks.length}</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hours Logged</p>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{actualHours.toFixed(1)}h</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Open Issues</p>
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{issues.filter(i => i.status?.name !== 'Closed').length}</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Team Size</p>
                    <UserIcon className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{project.users?.length || 0}</p>
                </GlassCard>
              </div>

              {/* Main 3-col body: About Project / Overall Progress / Quick Info */}
              <div className="grid md:grid-cols-3 gap-5">
                {/* About Project */}
                <GlassCard>
                  <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                    <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">About Project</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {project.description || <span className="italic text-slate-400">No description provided for this <span className="text-teal-500 cursor-pointer" onClick={() => navigate(`/projects/${project.id}/edit`)}>project</span>.</span>}
                    </p>
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Client</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{project.client || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Priority</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          <StatusBadge status={project.priority?.name || 'Normal'} variant="priority" />
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Overall Progress */}
                <GlassCard>
                  <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50">
                    <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Overall Progress</h3>
                  </div>
                  <div className="p-4 space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Task Completion</span>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-200">{progressPercent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPercent}%`, background: 'var(--brand-gradient)' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hours Utilization</span>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                          {project.estimated_hours ? Math.round((actualHours / Number(project.estimated_hours)) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-red-400 transition-all duration-700"
                          style={{ width: `${project.estimated_hours ? Math.min(100, Math.round((actualHours / Number(project.estimated_hours)) * 100)) : 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Issue Resolution</span>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                          {issues.length > 0 ? Math.round((issues.filter(i => i.status?.name === 'Closed').length / issues.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-orange-400 transition-all duration-700"
                          style={{ width: `${issues.length > 0 ? Math.round((issues.filter(i => i.status?.name === 'Closed').length / issues.length) * 100) : 0}%` }} />
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Quick Info */}
                <GlassCard>
                  <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50">
                    <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Quick Info</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { icon: <UserIcon className="w-4 h-4 text-slate-400" />, label: 'Manager', value: project.manager ? `${project.manager.first_name} ${project.manager.last_name}` : 'N/A' },
                      { icon: <Hash className="w-4 h-4 text-slate-400" />, label: 'Project ID', value: project.public_id || `PRJ-${project.id}` },
                      { icon: <Hash className="w-4 h-4 text-slate-400" />, label: 'Current Status', value: project.status?.name || 'N/A', badge: true },
                    ].map(({ icon, label, value, badge }) => (
                      <div key={label} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex-shrink-0">{icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                          {badge ? (
                            <StatusBadge status={value} variant="status" />
                          ) : (
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Bottom row: Upcoming Milestones + Project Team */}
              <div className="grid md:grid-cols-2 gap-5">
                <GlassCard>
                  <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Upcoming Milestones</h3>
                    <button className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors" onClick={() => setActiveTab('Milestones')}>View All</button>
                  </div>
                  <div className="p-4">
                    {milestones.length === 0 ? <p className="text-sm text-slate-500 italic">No milestones set.</p> : (
                      <div className="space-y-2">
                        {milestones.slice(0, 3).map(m => (
                          <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--brand-gradient)' }} />
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{m.title}</p>
                              </div>
                              <p className="text-xs text-slate-500 ml-4">{fmtDate(m.start_date)} — {fmtDate(m.end_date)}</p>
                            </div>
                            <StatusBadge status={m.status?.name || 'Open'} variant="status" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Project Team</h3>
                    <button className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors" onClick={() => setActiveTab('Users')}>Manage</button>
                  </div>
                  <div className="p-4">
                    {(!project.users || project.users.length === 0) ? (
                      <p className="text-sm text-slate-500 italic">No team members assigned yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {project.users.slice(0, 5).map(u => (
                          <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer" onClick={() => navigate(`/users/${u.id}`)}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-slate-900 flex-shrink-0" style={{ background: 'var(--brand-gradient)' }}>
                              {u.first_name?.[0]}{u.last_name?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{u.first_name} {u.last_name}</p>
                              <p className="text-xs text-slate-400 truncate">{u.email}</p>
                            </div>
                            <StatusBadge status={u.status?.name || 'Active'} variant="status" />
                          </div>
                        ))}
                        {project.users.length > 5 && (
                          <p className="text-xs text-center text-slate-400 pt-1">+{project.users.length - 5} more members</p>
                        )}
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            </div>
          )}


          {/* Tasks Tab */}
          {activeTab === 'Tasks' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 mb-2">
                <StatChip label="Total Tasks" value={tasks.length} icon={<Layers className="w-5 h-5"/>} />
                <StatChip label="Completed" value={tasks.filter(t => t.status?.name === 'Completed').length} icon={<CheckCircle className="w-5 h-5"/>} />
                <StatChip label="Blocked" value={tasks.filter(t => t.status?.name === 'Blocked').length} icon={<AlertTriangle className="w-5 h-5"/>} />
                <div className="ml-auto flex items-center gap-2">
                  <Button onClick={() => navigate('/tasks/create')} className="btn-gradient"><Plus className="w-4 h-4 mr-2"/> New Task</Button>
                </div>
              </div>
              <GlassCard>
                {tasks.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'public_id', header: 'ID', render: (_, r) => <span className="font-mono text-xs font-bold text-slate-500">{r.public_id}</span> },
                      { key: 'title', header: 'Title', render: (_, r) => <span className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-teal-600 cursor-pointer">{r.title}</span> },
                      { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status?.name || 'Pending'} variant="status" /> },
                      { key: 'assignee', header: 'Assignee', render: (_, r) => r.assignee ? <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{r.assignee.first_name} {r.assignee.last_name}</span> : <span className="text-xs text-slate-400 italic">Unassigned</span> },
                    ]}
                    data={tasks}
                    itemsPerPage={10}
                    onRowClick={(r) => navigate(`/tasks/${r.id}`)}
                  />
                ) : <EmptyState icon={<Layers />} title="No tasks" description="Create a task to kick things off." action={<Button onClick={() => navigate('/tasks/create')} outlined>Create Task</Button>} />}
              </GlassCard>
            </div>
          )}

          {/* Issues Tab */}
          {activeTab === 'Issues' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 mb-2">
                <StatChip label="Total Issues" value={issues.length} icon={<AlertTriangle className="w-5 h-5"/>} />
                <StatChip label="Open" value={issues.filter(i => i.status?.name !== 'Closed').length} icon={<AlertCircle className="w-5 h-5"/>} />
                <div className="ml-auto flex items-center gap-2">
                  <Button onClick={() => navigate('/issues/create')} className="btn-gradient"><Plus className="w-4 h-4 mr-2"/> Report Issue</Button>
                </div>
              </div>
              <GlassCard>
                {issues.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'public_id', header: 'ID', render: (_, r) => <span className="font-mono text-xs font-bold text-slate-500">{r.public_id}</span> },
                      { key: 'title', header: 'Title', render: (_, r) => <span className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-orange-600 cursor-pointer">{r.title}</span> },
                      { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status?.name || 'Open'} variant="status" /> },
                      { key: 'priority', header: 'Priority', render: (_, r) => <StatusBadge status={r.priority?.name || 'Medium'} variant="priority" /> },
                    ]}
                    data={issues}
                    itemsPerPage={10}
                    onRowClick={(r) => navigate(`/issues/${r.id}`)}
                  />
                ) : <EmptyState icon={<AlertCircle />} title="No issues" description="Looking good! No bugs tracked yet." action={<Button onClick={() => navigate('/issues/create')} outlined label="Report Issue" icon={<AlertCircle className="w-4 h-4 mr-2" />} className="!text-[13px] !px-4 !py-2" />} />}
              </GlassCard>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'Users' && (
            <div className="space-y-4">
              <GlassCard className="p-5 flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700">
                <div className="flex-1 w-full max-w-xl">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5" /> Select user to add
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <GraphUserAutocomplete 
                        onChange={(u) => setSelectedUserToAdd(u)} 
                        value={selectedUserToAdd}
                      />
                    </div>
                    <Button 
                      onClick={handleAddUser} 
                      disabled={!selectedUserToAdd} 
                      className="btn-gradient !h-[42px] !px-6 flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-2"/> <span className="font-semibold text-[13px]">Add Member</span>
                    </Button>
                  </div>
                </div>
              </GlassCard>
              <GlassCard>
                {project.users && project.users.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'name', header: 'Member', render: (_, r) => (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white font-black text-xs">
                            {r.first_name?.[0]}{r.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{r.first_name} {r.last_name}</p>
                            <p className="text-xs text-slate-500 font-medium">{r.email}</p>
                          </div>
                        </div>
                      )},
                      { key: 'actions', header: '', render: (_, r) => (
                        <div className="flex justify-end pr-2">
                          <Button 
                            icon={<Trash2 className="w-4 h-4" />}
                            text
                            severity="danger"
                            onClick={(e) => { e.stopPropagation(); handleRemoveUser(r.email); }} 
                            className="!w-8 !h-8 !p-0 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                          />
                        </div>
                      )}
                    ]}
                    data={project.users}
                    itemsPerPage={10}
                  />
                ) : <EmptyState icon={<UserIcon />} title="No team members" description="Add users to collaborate on this project." />}
              </GlassCard>
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'Milestones' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 mb-2">
                <StatChip label="Milestones" value={milestones.length} icon={<MilestoneIcon className="w-5 h-5"/>} />
                <StatChip label="Completed" value={milestones.filter(m => m.status?.name === 'Completed').length} icon={<CheckCircle className="w-5 h-5"/>} />
                <div className="ml-auto flex items-center gap-2">
                  <Button onClick={() => navigate('/milestones/create')} className="btn-gradient">
                    <Plus className="w-4 h-4 mr-2"/> New Milestone
                  </Button>
                </div>
              </div>
              <GlassCard>
                {milestones.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'public_id', header: 'ID', render: (_, r) => <span className="font-mono text-xs font-bold text-slate-500">{r.public_id}</span> },
                      { key: 'title', header: 'Title', render: (_, r) => <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{r.title}</span> },
                      { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.status?.name || 'Pending'} variant="status" /> },
                      { key: 'end_date', header: 'Deadline', render: (_, r) => <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{r.end_date ? fmtDate(r.end_date) : '--'}</span> },
                      { key: 'actions', header: '', render: (_, r) => (
                        <div className="flex justify-end pr-2">
                          <Button 
                            icon={<Trash2 className="w-4 h-4" />}
                            text
                            severity="danger"
                            onClick={(e) => { e.stopPropagation(); handleDeleteMilestone(r.id); }} 
                            className="!w-8 !h-8 !p-0 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                          />
                        </div>
                      )}
                    ]}
                    data={milestones}
                    itemsPerPage={10}
                    onRowClick={(r) => navigate(`/milestones/${r.id}`)}
                  />
                ) : <EmptyState icon={<MilestoneIcon />} title="No milestones" description="Break your project down into milestones." action={<Button onClick={() => navigate('/milestones/create')} outlined>Create Milestone</Button>} />}
              </GlassCard>
            </div>
          )}

          {/* Time Logs Tab */}
          {activeTab === 'Time Logs' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 mb-2">
                <StatChip label="Entries" value={timelogs.length} icon={<Clock className="w-5 h-5"/>} />
                <StatChip label="Total Hours" value={actualHours.toFixed(2)} icon={<Clock className="w-5 h-5"/>} />
                <div className="ml-auto flex items-center gap-2">
                  <Button onClick={() => navigate('/time-log/create')} className="btn-gradient"><Plus className="w-4 h-4 mr-2"/> Log Time</Button>
                </div>
              </div>
              <GlassCard>
                {timelogs.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'date', header: 'Date', render: (_, r) => <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{fmtDate(r.date)}</span> },
                      { key: 'user', header: 'User', render: (_, r) => <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{r.user?.first_name} {r.user?.last_name}</span> },
                      { key: 'task', header: 'Task', render: (_, r) => <span className="text-sm text-slate-500">{r.task?.title || 'General'}</span> },
                      { key: 'hours', header: 'Hours', render: (_, r) => <span className="font-bold text-teal-500">{r.hours.toFixed(2)}h</span> },
                    ]}
                    data={timelogs}
                    itemsPerPage={10}
                    onRowClick={(r) => navigate(`/time-log/edit/${r.id}`)}
                  />
                ) : <EmptyState icon={<Clock />} title="No time logged" description="Start tracking time on your tasks." action={<Button onClick={() => navigate('/time-log/create')} outlined>Log Time</Button>} />}
              </GlassCard>
            </div>
          )}

          {/* Timesheet Tab */}
          {activeTab === 'Timesheet' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 mb-2">
                <StatChip label="Timesheets" value={timesheets.length} icon={<CalendarClock className="w-5 h-5"/>} color="#8B5CF6" />
                <div className="ml-auto flex items-center gap-2">
                  <Button onClick={() => navigate('/timesheets/create')} className="btn-gradient"><Plus className="w-4 h-4 mr-2"/> Create Timesheet</Button>
                </div>
              </div>
              <GlassCard>
                {timesheets.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'name', header: 'Name', render: (_, r) => <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{r.name}</span> },
                      { key: 'period', header: 'Period', render: (_, r) => <span className="text-sm text-slate-500">{fmtDate(r.start_date)} - {fmtDate(r.end_date)}</span> },
                      { key: 'status', header: 'Status', render: (_, r) => <StatusBadge status={r.approval_status || 'Pending'} variant="status" /> },
                      { key: 'hours', header: 'Total Hours', render: (_, r) => <span className="font-bold text-indigo-500">{Number(r.total_hours || 0).toFixed(2)}h</span> },
                    ]}
                    data={timesheets}
                    itemsPerPage={10}
                    onRowClick={(r) => navigate(`/timesheets/${r.id}`)}
                  />
                ) : <EmptyState icon={<CalendarClock />} title="No timesheets" description="Bundle your timelogs into timesheets." action={<Button onClick={() => navigate('/timesheets/create')} outlined>Create</Button>} />}
              </GlassCard>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'Documents' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 mb-2">
                <StatChip label="Documents" value={documents.length} icon={<HardDrive className="w-5 h-5"/>} color="#3B82F6" />
                <div className="ml-auto flex items-center gap-2">
                  <Button onClick={() => navigate('/documents/create')} className="btn-gradient"><Upload className="w-4 h-4 mr-2"/> Upload</Button>
                </div>
              </div>
              <GlassCard>
                {documents.length > 0 ? (
                  <DataTable
                    columns={[
                      { key: 'name', header: 'File Name', render: (_, r) => <span className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-blue-600 cursor-pointer">{r.title || (r as any).file_name}</span> },
                      { key: 'size', header: 'Size', render: (_, r) => <span className="text-sm text-slate-500">{r.file_size ? `${(r.file_size / 1024).toFixed(2)} KB` : '--'}</span> },
                      { key: 'uploaded_by', header: 'Uploaded By', render: (_, r) => <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{r.uploaded_by?.first_name} {r.uploaded_by?.last_name}</span> },
                      { key: 'actions', header: '', render: (_, r) => (
                        <div className="flex gap-1 justify-end pr-2">
                          <Button 
                            icon={<Download className="w-4 h-4" />}
                            text
                            severity="info"
                            onClick={(e) => { e.stopPropagation(); window.open(r.file_url, '_blank'); }} 
                            className="!w-8 !h-8 !p-0 hover:!bg-blue-50 dark:hover:!bg-blue-900/20"
                          />
                          <Button 
                            icon={<Trash2 className="w-4 h-4" />}
                            text
                            severity="danger"
                            onClick={(e) => { e.stopPropagation(); handleDeleteDoc(r.id); }} 
                            className="!w-8 !h-8 !p-0 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                          />
                        </div>
                      )}
                    ]}
                    data={documents}
                    itemsPerPage={10}
                  />
                ) : <EmptyState icon={<FileText />} title="No documents" description="Store your project files here." action={<Button onClick={() => navigate('/documents/create')} outlined>Upload File</Button>} />}
              </GlassCard>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'Reports' && (
            <div className="space-y-4 flex flex-col items-center justify-center p-12 mt-10">
                <EmptyState icon={<BarChart3 className="w-8 h-8"/>} title="Reports Coming Soon" description="Advanced analytics and project reporting are currently under development." />
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  );
}
