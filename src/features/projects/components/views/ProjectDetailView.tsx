import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { Badge } from '@/components/data-display/Badge';
import { DataTable } from '@/components/data-display/DataTable';
import { EmptyState } from '@/components/data-display/EmptyState';
import { Card } from '@/components/layout/Card';
import { StatCardProps } from '@/components/data-display/StatCard';
import { EntityDetailTemplate } from '@/components/layout/EntityDetailTemplate';
import { TaskListTable } from '@/features/tasks/components/ui/TaskListTable';

import { projectsService, Project } from '@/features/projects/api/projects.api';
import { milestonesService, Milestone } from '@/features/milestones/api/milestones.api';
import { tasklistsService, TaskList } from '@/features/tasklists/api/tasklists.api';
import { tasksService, Task } from '@/features/tasks/api/tasks.api';
import { usersService, User } from '@/features/users/api/users.api';
import { timelogsService, TimeLog } from '@/features/timelogs/api/timelogs.api';
import { issuesService, Issue } from '@/features/issues/api/issues.api';
import { documentsService, Document } from '@/features/documents/api/documents.api';
import {
  ArrowLeft, Edit, FileText, Download, Trash2, Plus,
  User as UserIcon, Calendar, Building, Hash, Target, DollarSign,
  CheckCircle, Clock, AlertCircle, Milestone as MilestoneIcon,
  HardDrive, Upload, BarChart3, AlertTriangle, Layers, FolderKanban
} from 'lucide-react';
import { GraphUserMultiSelect } from '@/features/projects/components/ui/GraphUserMultiSelect';
import { api } from '@/api/client';
import { useToast } from '@/providers/ToastContext';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';

const TABS = [
  { label: 'Dashboard' },
  { label: 'Bugs' },
  { label: 'Tasks' },
  { label: 'Reports' },
  { label: 'Documents' },
  { label: 'Milestones' },
  { label: 'Time Logs' },
  { label: 'Users' }
];

export function ProjectDetailView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const activeTab = searchParams.get('tab') || 'Dashboard';

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [timelogs, setTimelogs] = useState<TimeLog[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [actualHours, setActualHours] = useState(0);
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<any[]>([]);
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    if (projectId) fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const pid = parseInt(projectId as string, 10);
      const [proj, usr, ms, tl, t, log, iss, doc] = await Promise.all([
        projectsService.getProject(pid), 
        usersService.getUsers(0, 500), 
        milestonesService.getMilestones(pid),
        tasklistsService.getTaskLists(pid), 
        tasksService.getTasks({ skip: 0, limit: 100, project_id: pid }), 
        timelogsService.getTimelogs(0, 100, pid),
        issuesService.getIssues({ skip: 0, limit: 100, project_id: pid }), 
        documentsService.getDocuments(pid)
      ]);
      setProject(proj);
      setAllUsers((usr as any)?.items || usr || []);
      setMilestones(ms);
      setTaskLists(tl);
      setTasks((t as any)?.items || t || []);
      setTimelogs((log as any)?.items || log || []);
      setIssues((iss as any)?.items || iss || []);
      setDocuments(doc);

      const logsArr = (log as any)?.items || log || [];
      setActualHours(logsArr.reduce((acc: number, curr: TimeLog) => acc + (curr.hours || 0), 0));
    } catch (e) {
      console.error('Error fetching project data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (selectedUsersToAdd.length === 0 || !project) return;
    setAddingUser(true);
    try {
      const userEmails = selectedUsersToAdd.map(u => u.mail || u.email || null).filter(Boolean);
      await api.post(`/projects/${project.id}/users/bulk`, userEmails);
      showToast('success', 'Members Added', `${selectedUsersToAdd.length} users have been added to this project.`);
      setSelectedUsersToAdd([]);
      await fetchProjectData();
    } catch (e: any) {
      showToast('error', 'Failed to add members', e?.response?.data?.detail || 'Could not assign users.');
    } finally {
      setAddingUser(false);
    }
  };

  const handleRemoveUser = async (userEmail: string) => {
    if (!project) return;
    try {
      await projectsService.removeUser(project.id, userEmail);
      fetchProjectData();
    } catch (error) { console.error('Failed to remove user', error); }
  };

  const handleDeleteMilestone = async (id: number) => {
    try { await milestonesService.deleteMilestone(id); fetchProjectData(); } catch (e) { }
  };

  const handleDeleteDoc = async (id: number) => {
    try { await documentsService.deleteDocument(id); fetchProjectData(); } catch (e) { }
  };

  const progressPercent = project?.estimated_hours ? Math.min(100, Math.round((actualHours / project.estimated_hours) * 100)) : 0;

  if (loading || !project) return <PageSpinner fullPage label="Loading project" />;

  const metadataNodes = [
    <span key="id" className="flex items-center gap-1"><Hash className="w-3.5 h-3.5 opacity-70" /> {project.public_id}</span>,
    project.client && <span key="client" className="flex items-center gap-1"><Building className="w-3.5 h-3.5 opacity-70" /> {project.client}</span>,
    <span key="dates" className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 opacity-70" /> {fmtDate(project.start_date)} - {project.end_date ? fmtDate(project.end_date) : 'Ongoing'}</span>
  ].filter(Boolean) as React.ReactNode[];

  
  const fixedStats: StatCardProps[] = [
    { label: 'Tasks', value: `${tasks.filter(t => t.status?.name === 'Completed').length}/${tasks.length}`, icon: <Layers size={18} strokeWidth={2} />, accentVariant: 'teal' },
    { label: 'Hours Logged', value: `${actualHours.toFixed(1)}h`, icon: <Clock size={18} strokeWidth={2} />, accentVariant: 'violet' },
    { label: 'Open Issues', value: issues.filter(i => i.status?.name !== 'Closed').length, icon: <AlertTriangle size={18} strokeWidth={2} />, accentVariant: 'rose' },
    { label: 'Team Size', value: project.users?.length || 0, icon: <UserIcon size={18} strokeWidth={2} />, accentVariant: 'amber' },
  ];

  return (
    <PageLayout
      title={project.name}
      subtitle={project.public_id}
      isFullHeight
      showBackButton
      backPath="/projects"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate(`/projects/${project.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
        </div>
      }
    >
      <EntityDetailTemplate
        title={project.name}
        icon={<FolderKanban className="w-5 h-5 text-slate-900" />}
        badges={[<Badge key="status" value={project.status?.name || 'Active'} variant="status" />]}
        metadata={metadataNodes}
        progressPercent={progressPercent}
        users={project.users}
        tabs={TABS}
        stats={fixedStats}
      >
        {activeTab === 'Dashboard' && (
          <div className="grid md:grid-cols-3 gap-5">
            <Card glass={true} className="p-0">
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
                      <Badge value={project.priority?.name || 'Normal'} variant="priority" />
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card glass={true} className="p-0">
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
                        <Badge value={value} variant="status" />
                      ) : (
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card glass={true} className="p-0">
              <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Project Team</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate(`?tab=Users`)} className="text-xs font-bold text-teal-600">Manage</Button>
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
                        <Badge value={u.status?.name || 'Active'} variant="status" />
                      </div>
                    ))}
                    {project.users.length > 5 && (
                      <p className="text-xs text-center text-slate-400 pt-1">+{project.users.length - 5} more members</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'Tasks' && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 mb-2">
              <Button onClick={() => navigate('/tasks/create')} variant="primary" size="sm"><Plus className="w-4 h-4 mr-2"/> New Task</Button>
            </div>
            <Card glass={true} className="p-0">
              {tasks.length > 0 ? (
                <TaskListTable
                  tasks={tasks}
                  onRowClick={(r) => navigate(`/tasks/${r.id}`, { state: { from: location.pathname + location.search } })}
                />
              ) : <EmptyState icon={<Layers />} title="No tasks" description="Create a task to kick things off." action={<Button variant="secondary" onClick={() => navigate('/tasks/create')}>Create Task</Button>} />}
            </Card>
          </div>
        )}

        {activeTab === 'Bugs' && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 mb-2">
              <Button onClick={() => navigate('/issues/create')} variant="primary" size="sm"><Plus className="w-4 h-4 mr-2"/> Report Bug</Button>
            </div>
            <Card glass={true} className="p-0">
              {issues.length > 0 ? (
                <DataTable
                  columns={[
                    { key: 'public_id', header: 'ID', render: (_, r) => <span className="font-mono text-xs font-bold text-slate-500">{r.public_id}</span> },
                    { key: 'title', header: 'Title', render: (_, r) => <span className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-orange-600 cursor-pointer">{r.title}</span> },
                    { key: 'assignees', header: 'Assignees', render: (_, r) => (
                      <div className="flex -space-x-2 overflow-hidden">
                        {r.assignees?.map((a: any) => (
                          <div key={a.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold" title={`${a.first_name} ${a.last_name}`}>
                            {a.first_name?.[0]}{a.last_name?.[0]}
                          </div>
                        ))}
                      </div>
                    )},
                    { key: 'status', header: 'Status', render: (_, r) => <Badge value={r.status?.name || 'Open'} variant="status" /> },
                    { key: 'priority', header: 'Priority', render: (_, r) => <Badge value={r.priority?.name || 'Medium'} variant="priority" /> },
                  ]}
                  data={issues}
                  itemsPerPage={10}
                  onRowClick={(r) => navigate(`/issues/${r.id}`, { state: { from: location.pathname + location.search } })}
                />
              ) : <EmptyState icon={<AlertCircle />} title="No bugs" description="Looking good! No bugs tracked yet." action={<Button variant="secondary" onClick={() => navigate('/issues/create')}><AlertCircle className="w-4 h-4 mr-2" /> Report Bug</Button>} />}
            </Card>
          </div>
        )}

        {activeTab === 'Users' && (
          <div className="space-y-4">
            <Card glass={true} className="p-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex-1 w-full max-w-xl">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5" /> Select user to add
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <GraphUserMultiSelect 
                      onChange={(u) => setSelectedUsersToAdd(u)} 
                      value={selectedUsersToAdd}
                      placeholder="Select members..."
                    />
                  </div>
                  <Button 
                    onClick={handleAddUser} 
                    disabled={selectedUsersToAdd.length === 0 || addingUser} 
                    variant="primary"
                    className="flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-2"/> <span className="font-semibold text-[13px]">{addingUser ? 'Adding...' : 'Add Members'}</span>
                  </Button>
                </div>
              </div>
            </Card>
            <Card glass={true} className="p-0">
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
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleRemoveUser(r.email); }} 
                          className="w-8 h-8 !p-0"
                        >
                           <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                        </Button>
                      </div>
                    )}
                  ]}
                  data={project.users}
                  itemsPerPage={10}
                />
              ) : <EmptyState icon={<UserIcon />} title="No team members" description="Add users to collaborate on this project." />}
            </Card>
          </div>
        )}

        {activeTab === 'Milestones' && (
          <div className="space-y-4">
             <div className="flex justify-end gap-2 mb-2">
              <Button onClick={() => navigate('/milestones/create')} variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2"/> New Milestone
              </Button>
            </div>
            <Card glass={true} className="p-0">
              {milestones.length > 0 ? (
                <DataTable
                  columns={[
                    { key: 'public_id', header: 'ID', render: (_, r) => <span className="font-mono text-xs font-bold text-slate-500">{r.public_id}</span> },
                    { key: 'title', header: 'Title', render: (_, r) => <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{r.title}</span> },
                    { key: 'flags', header: 'Flag', render: (_, r) => <Badge value={r.flags || 'Internal'} variant="status" /> },
                    { key: 'end_date', header: 'Deadline', render: (_, r) => <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{r.end_date ? fmtDate(r.end_date) : '--'}</span> },
                    { key: 'actions', header: '', render: (_, r) => (
                      <div className="flex justify-end pr-2">
                        <Button 
                          variant="ghost" 
                          onClick={(e) => { e.stopPropagation(); handleDeleteMilestone(r.id); }} 
                          className="w-8 h-8 !p-0"
                        >
                           <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  ]}
                  data={milestones}
                  itemsPerPage={10}
                  onRowClick={(r) => navigate(`/milestones/${r.id}`)}
                />
              ) : <EmptyState icon={<MilestoneIcon />} title="No milestones" description="Break your project down into milestones." action={<Button variant="secondary" onClick={() => navigate('/milestones/create')}>Create Milestone</Button>} />}
            </Card>
          </div>
        )}

        {activeTab === 'Time Logs' && (
          <div className="space-y-4">
             <div className="flex justify-end gap-2 mb-2">
              <Button onClick={() => navigate('/time-log/create')} variant="primary" size="sm"><Plus className="w-4 h-4 mr-2"/> Log Time</Button>
            </div>
            <Card glass={true} className="p-0">
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
              ) : <EmptyState icon={<Clock />} title="No time logged" description="Start tracking time on your tasks." action={<Button variant="secondary" onClick={() => navigate('/time-log/create')}>Log Time</Button>} />}
            </Card>
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 mb-2">
              <Button onClick={() => navigate('/documents/create')} variant="primary" size="sm"><Upload className="w-4 h-4 mr-2"/> Upload</Button>
            </div>
            <Card glass={true} className="p-0">
              {documents.length > 0 ? (
                <DataTable
                  columns={[
                    { key: 'name', header: 'File Name', render: (_, r) => <span className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-blue-600 cursor-pointer">{r.title || (r as any).file_name}</span> },
                    { key: 'size', header: 'Size', render: (_, r) => <span className="text-sm text-slate-500">{r.file_size ? `${(r.file_size / 1024).toFixed(2)} KB` : '--'}</span> },
                    { key: 'uploaded_by', header: 'Uploaded By', render: (_, r) => <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{r.uploaded_by?.first_name} {r.uploaded_by?.last_name}</span> },
                    { key: 'actions', header: '', render: (_, r) => (
                      <div className="flex gap-1 justify-end pr-2">
                        <Button 
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); window.open(r.file_url, '_blank'); }} 
                          className="w-8 h-8 !p-0"
                        >
                           <Download className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleDeleteDoc(r.id); }} 
                          className="w-8 h-8 !p-0"
                        >
                           <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  ]}
                  data={documents}
                  itemsPerPage={10}
                />
              ) : <EmptyState icon={<FileText />} title="No documents" description="Store your project files here." action={<Button variant="secondary" onClick={() => navigate('/documents/create')}>Upload File</Button>} />}
            </Card>
          </div>
        )}

        {activeTab === 'Reports' && (
          <div className="space-y-4 flex flex-col items-center justify-center p-12 mt-10">
              <EmptyState icon={<BarChart3 className="w-8 h-8"/>} title="Reports Coming Soon" description="Advanced analytics and project reporting are currently under development." />
          </div>
        )}
      </EntityDetailTemplate>
    </PageLayout>
  );
}
