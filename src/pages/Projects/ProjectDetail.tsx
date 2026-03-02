import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { StatCard } from '@/components/ui/Card/StatCard';
import { Button } from '@/components/ui/Button/Button';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { DataTable, Column } from '@/components/lists/DataTable/DataTable';
import { projectsService, Project } from '@/services/projects';
import { milestonesService, Milestone } from '@/services/milestones';
import { tasklistsService, TaskList } from '@/services/tasklists';
import { tasksService, Task } from '@/services/tasks';
import { usersService, User } from '@/services/users';
import { timelogsService, TimeLog } from '@/services/timelogs';
import { issuesService, Issue } from '@/services/issues';
import {
  ArrowLeft, Edit, FileText, Download, Trash2, Plus,
  User as UserIcon, Calendar, Building, Hash, Target, DollarSign,
  CheckCircle, Clock, AlertCircle, Milestone as MilestoneIcon,
  FileArchive, HardDrive, Upload, BarChart3, CalendarClock, TrendingUp
} from 'lucide-react';

const tabs = ['Dashboard', 'Tasks', 'Issues', 'Reports', 'Documents', 'Milestones', 'Timesheet', 'Users'];

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
  const [actualHours, setActualHours] = useState(0);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>('');

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const pid = parseInt(projectId as string, 10);
      const [projData, usersData, msData, tlData, tsData, logsData, issuesData] = await Promise.all([
        projectsService.getProject(pid),
        usersService.getUsers(0, 500),
        milestonesService.getMilestones(pid),
        tasklistsService.getTaskLists(pid),
        tasksService.getTasks(0, 1000),
        timelogsService.getTimelogs(0, 1000),
        issuesService.getIssues(0, 1000)
      ]);

      setProject(projData);
      setAllUsers(usersData);
      setMilestones(msData);
      setTaskLists(tlData);

      const pTasks = tsData.filter(t => t.project_id === pid);
      setTasks(pTasks);

      const pIssues = issuesData.filter(i => i.project_id === pid);
      setIssues(pIssues);

      const pLogs = logsData.filter(l => l.task?.project_id === pid || l.project_id === pid || l.issue?.project_id === pid);
      setTimelogs(pLogs);

      const hours = pLogs.reduce((acc, log) => acc + log.hours, 0);
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
    const listName = window.prompt('Enter new Task List name:');
    if (listName && listName.trim() && project) {
      try {
        await tasklistsService.createTaskList({
          name: listName.trim(),
          project_id: project.id,
          description: ''
        });
        await fetchProjectData();
      } catch (err) {
        console.error('Failed to create task list', err);
      }
    }
  };

  const handleCreateMilestone = async () => {
    const msTitle = window.prompt('Enter new Milestone title:');
    if (msTitle && msTitle.trim() && project) {
      try {
        await milestonesService.createMilestone({
          title: msTitle.trim(),
          project_id: project.id,
          description: '',
          start_date: new Date().toISOString().split('T')[0],
        });
        await fetchProjectData();
      } catch (err) {
        console.error('Failed to create milestone', err);
      }
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

        {/* Tab Content: Dashboard */}
        {activeTab === 'Dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <Card title="Description">
                <p className="text-[14px] text-[#374151] leading-relaxed">{project.description || 'No description provided.'}</p>
              </Card>

              {/* Removing budget visually since we removed it from creation */}
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
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2 mt-2">
                    <div
                      className="bg-[#059669] h-2 rounded-full"
                      style={{ width: `${Math.min((actualHours / (project.estimated_hours || 1)) * 100, 100)}%` }}
                    ></div>
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
        )}

        {/* Tab Content: Users */}
        {activeTab === 'Users' && (
          <div className="space-y-6">
            <Card title="Project Members" actions={
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-1.5 border rounded-[6px] text-[13px]"
                  value={selectedUserToAdd}
                  onChange={(e) => setSelectedUserToAdd(e.target.value)}
                >
                  <option value="">Select a user...</option>
                  {allUsers.filter(u => !(project.users || []).find((pu: any) => pu.id === u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                  ))}
                </select>
                <Button onClick={handleAddUser} disabled={!selectedUserToAdd}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            }>
              {project.users && project.users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.users.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between p-3 border rounded-[6px] bg-[#F9FAFB]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center font-bold">
                          {u.first_name[0]}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#1F2937]">{u.first_name} {u.last_name}</p>
                          <p className="text-[11px] text-[#6B7280]">
                            {timelogs.filter(l => l.user_id === u.id).reduce((sum, l) => sum + l.hours, 0).toFixed(1)}h logged
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveUser(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-[4px] transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#6B7280] text-[14px]">No users assigned to this project yet.</div>
              )}
            </Card>
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
            {taskLists.length > 0 ? taskLists.map(list => (
              <Card key={list.id} title={list.name}>
                <p className="text-[13px] text-[#6B7280] mb-4">{list.description}</p>
                <div className="space-y-2">
                  {tasks.filter(t => t.task_list_id === list.id).length > 0 ? tasks.filter(t => t.task_list_id === list.id).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-white border rounded-[6px] hover:shadow-sm transition-shadow">
                      <div>
                        <p className="text-[14px] font-medium text-[#1F2937]">{t.title}</p>
                        <p className="text-[12px] text-[#6B7280] mt-1">
                          {t.start_date ? `${t.start_date} to ${t.end_date}` : 'No dates set'} • {getDaysRemaining(t.end_date) || 'No deadline'}
                        </p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="text-right">
                          <p className="text-[13px] font-medium text-[#059669]">
                            {timelogs.filter(l => l.task_id === t.id).reduce((sum, l) => sum + l.hours, 0).toFixed(1)}h actual
                          </p>
                          <p className="text-[11px] text-[#6B7280]">
                            / {t.estimated_hours || 0}h effort
                          </p>
                        </div>
                        <StatusBadge status={t.status?.name || 'Open'} variant="status" />
                      </div>
                    </div>
                  )) : (
                    <p className="text-[12px] text-[#9CA3AF] italic">No tasks in this list.</p>
                  )}
                </div>
              </Card>
            )) : (
              <Card>
                <div className="text-center py-8 text-[#6B7280] text-[14px]">
                  No Task Lists created. Task Lists help group your tasks.
                </div>
              </Card>
            )}

            {/* Unlisted Tasks */}
            {tasks.filter(t => !t.task_list_id).length > 0 && (
              <Card title="Unassigned Tasks">
                <div className="space-y-2">
                  {tasks.filter(t => !t.task_list_id).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-white border rounded-[6px] hover:shadow-sm transition-shadow">
                      <div>
                        <p className="text-[14px] font-medium text-[#1F2937]">{t.title}</p>
                      </div>
                      <StatusBadge status={t.status?.name || 'Open'} variant="status" />
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
                    <div key={i.id} onClick={() => navigate(`/issues/${i.id}`)} className="cursor-pointer flex items-center justify-between p-3 bg-white border rounded-[6px] hover:shadow-sm transition-shadow">
                      <div>
                        <p className="text-[14px] font-medium text-[#1F2937]">{i.title}</p>
                        <p className="text-[12px] text-[#6B7280] mt-1">Assignee: {i.assignee ? `${i.assignee.first_name} ${i.assignee.last_name}` : 'Unassigned'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={i.status?.name || 'Open'} variant="status" />
                        <StatusBadge status={i.priority?.name || 'Open'} variant="priority" />
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

        {/* Tab Content: Timesheet */}
        {activeTab === 'Timesheet' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => navigate('/time-log/create')}><Plus className="w-4 h-4 mr-2" /> Log Time</Button>
            </div>
            {timelogs.length > 0 ? (
              <Card title={`Project Timesheet (${timelogs.length} entries)`}>
                <div className="space-y-2 mt-4">
                  {timelogs.map(l => (
                    <div key={l.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border rounded-[6px] hover:shadow-sm transition-shadow">
                      <div>
                        <p className="text-[14px] font-medium text-[#1F2937]">{l.description || 'No description'}</p>
                        <p className="text-[12px] text-[#6B7280] mt-1">
                          Date: {l.date} | Task: {l.task?.title || l.issue?.title || l.project?.name || 'N/A'}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center gap-3">
                        <span className="font-semibold text-[#059669]">{l.hours.toFixed(1)}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-8 text-[#6B7280] text-[14px]">
                  No time logs recorded for this project.
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab Content: Reports & Documents */}
        {activeTab === 'Reports' && (
          <Card title="Project Reports">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <BarChart3 className="w-12 h-12 text-[#9CA3AF]" />
              <p className="text-[14px] text-[#6B7280]">Detailed reporting is available in the global Reports section.</p>
              <Button onClick={() => navigate('/reports')}>Go to Global Reports</Button>
            </div>
          </Card>
        )}

        {activeTab === 'Documents' && (
          <Card title="Project Documents">
            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center px-4">
              <FileText className="w-12 h-12 text-[#9CA3AF]" />
              <p className="text-[14px] text-[#6B7280]">Document management will be integrated soon.<br />Please use SharePoint for now.</p>
            </div>
          </Card>
        )}

        {/* Tab Content: Milestones */}
        {activeTab === 'Milestones' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleCreateMilestone}><Plus className="w-4 h-4 mr-2" /> Add Milestone</Button>
            </div>
            {milestones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {milestones.map(m => (
                  <Card key={m.id} className="border-l-[4px] border-l-[#3B82F6]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[#1F2937]">{m.title}</h3>
                        <p className="text-[12px] text-[#6B7280] mt-1">{m.start_date} to {m.end_date}</p>
                      </div>
                      <StatusBadge status={m.status?.name || 'Active'} variant="status" />
                    </div>
                    <p className="text-[13px] text-[#4B5563] mt-3 line-clamp-2">{m.description || 'No description.'}</p>
                  </Card>
                ))}
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
      </div>
    </PageLayout>
  );
}
