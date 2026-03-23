import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/providers/ToastContext';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { StatCard } from '@/components/ui/Card/StatCard';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Plus, Download, Upload, Filter as FilterIcon, ListFilter, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ViewToggle, ViewType } from '@/components/ui/ViewToggle/ViewToggle';
import { Task, tasksService } from '@/features/tasks/services/tasks.api';
import { timelogsService, TimeLog } from '@/features/timelogs/services/timelogs.api';
import { exportToCSV } from '@/utils/export';
import { useTasks } from '../hooks/useTasks';
import { KanbanView } from './KanbanView';
import { TaskImport } from './TaskImport';
import { FilterSidebar } from '@/components/ui/FilterSidebar';
import { useStatuses, usePriorities, useUsers } from '@/hooks/useMasterData';
import { useTaskLists, useCreateTaskList } from '@/features/tasklists/hooks/useTaskLists';
import { useProjects } from '@/features/projects/hooks/useProjects';

export function TasksList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [view, setView] = useState<ViewType>('list');
  const [importVisible, setImportVisible] = useState(false);
  const { data: tasks = [], isLoading: loadingTasks, refetch } = useTasks();
  const { data: taskLists = [] } = useTaskLists();
  const { data: projects = [] } = useProjects();
  const createTaskList = useCreateTaskList();

  const [timelogs, setTimelogs] = useState<TimeLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  // Task List Creation State
  const [showTaskListModal, setShowTaskListModal] = useState(false);
  const [newTaskList, setNewTaskList] = useState({ name: '', project_id: '' });

  const { data: statuses = [] } = useStatuses();
  const { data: priorities = [] } = usePriorities();
  const { data: allUsers = [] } = useUsers();

  const filterGroups = [
    {
      id: 'status',
      label: 'Status',
      options: statuses.map(s => ({ label: s.name, value: s.id.toString() }))
    },
    {
      id: 'priority',
      label: 'Priority',
      options: priorities.map(p => ({ label: p.name, value: p.id.toString() }))
    },
    {
      id: 'assignee',
      label: 'Assignee',
      options: allUsers.map(u => ({ label: `${u.first_name} ${u.last_name}`, value: u.email }))
    }
  ];

  const handleFilterChange = (groupId: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[groupId] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [groupId]: updated };
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const statusMatch = !selectedFilters.status?.length || selectedFilters.status.includes(task.status_id?.toString() || '');
      const priorityMatch = !selectedFilters.priority?.length || selectedFilters.priority.includes(task.priority_id?.toString() || '');
      const assigneeMatch = !selectedFilters.assignee?.length || selectedFilters.assignee.includes(task.assignee_email || '');
      return statusMatch && priorityMatch && assigneeMatch;
    });
  }, [tasks, selectedFilters]);

  // Grouping tasks by Task List for display
  const groupedTasks = useMemo(() => {
    const groups: Record<number | string, Task[]> = {};

    // Initialize groups with existing task lists
    taskLists.forEach(list => {
      groups[list.id] = [];
    });
    groups['unassigned'] = [];

    filteredTasks.forEach(task => {
      if (task.task_list_id && groups[task.task_list_id]) {
        groups[task.task_list_id].push(task);
      } else {
        groups['unassigned'].push(task);
      }
    });

    return groups;
  }, [filteredTasks, taskLists]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const logData = await timelogsService.getTimelogs(0, 2000);
      setTimelogs(logData);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleCreateTaskList = async () => {
    if (!newTaskList.name || !newTaskList.project_id) return;
    try {
      await createTaskList.mutateAsync({
        name: newTaskList.name,
        project_id: parseInt(newTaskList.project_id),
      });
      showToast('success', 'Success', 'Task list created successfully');
      setShowTaskListModal(false);
      setNewTaskList({ name: '', project_id: '' });
    } catch (error) {
      showToast('error', 'Error', 'Failed to create task list');
    }
  };

  const loading = loadingTasks || loadingLogs;

  const handleExport = () => {
    const exportColumns = [
      { key: 'public_id', header: 'Task ID' },
      { key: 'title', header: 'Task Title' },
      { key: 'due_date', header: 'Due Date' },
      { key: 'progress', header: 'Progress %' }
    ];
    exportToCSV(filteredTasks, 'tasks.csv', exportColumns);
  };

  const columns: Column<Task>[] = [
    {
      key: 'public_id',
      header: 'Task ID',
      sortable: true,
      render: (_, row) => (
        <span className="font-mono text-[11px] bg-theme-neutral text-theme-secondary border border-theme-border px-1.5 py-0.5 rounded">
          {row.public_id || `TSK-${row.id}`}
        </span>
      ),
    },
    { key: 'title', header: 'Task Name', sortable: true, render: (_, row) => <span className="font-medium text-theme-primary">{row.title}</span> },
    {
      key: 'project',
      header: 'Project',
      sortable: true,
      render: (_, row) => row.project ? row.project.name : 'Unassigned'
    },
    {
      key: 'assignee',
      header: 'Assignee',
      sortable: true,
      render: (_, row) => row.assignee ? `${row.assignee.first_name} ${row.assignee.last_name}` : 'Unassigned'
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status?.name || 'Unknown'} variant="status" />
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.priority?.name || 'Unknown'} variant="priority" />
    },
    {
      key: 'hours',
      header: 'Hours',
      render: (_, row) => {
        const actual = timelogs.filter(l => l.task_id === row.id).reduce((sum, l) => sum + l.hours, 0);
        return (
          <div className="flex items-center gap-1 text-[13px]">
            <span className="font-semibold text-[#14b8a6]">{actual.toFixed(1)}h</span>
            <span className="text-[#6B7280]">/ {row.estimated_hours || 0}h</span>
          </div>
        );
      }
    },
    {
      key: 'end_date',
      header: 'Deadline',
      sortable: true,
      render: (_, row) => {
        if (!row.end_date) return <span className="text-theme-muted italic">No deadline</span>;
        const diff = new Date(row.end_date).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        const text = days >= 0 ? `${days} days left` : `${Math.abs(days)} days overdue`;
        const color = days >= 0 ? 'text-blue-500' : 'text-red-500';
        return (
          <div>
            <p className="font-medium text-theme-secondary">{row.end_date}</p>
            <p className={`text-[12px] mt-0.5 font-bold ${color}`}>{text}</p>
          </div>
        );
      }
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-theme-neutral rounded-full overflow-hidden border border-theme-border/50">
            <div
              className="h-full bg-brand-teal-500 rounded-full transition-all shadow-sm shadow-brand-teal-500/20"
              style={{ width: `${row.progress}%` }}
            />
          </div>
          <span className="text-[12px] text-theme-muted w-10 text-right font-medium">{row.progress}%</span>
        </div>
      )
    },
  ];

  return (
    <PageLayout
      title="Tasks"
      isFullHeight
      actions={
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <ViewToggle view={view} onViewChange={setView} />

          <div className="h-8 w-[1px] bg-gray-200 hidden sm:block mx-1" />

          <Button variant="outline" onClick={() => setShowFilters(true)} className={Object.keys(selectedFilters).some(k => selectedFilters[k].length > 0) ? 'border-brand-teal-500 bg-brand-teal-50 text-brand-teal-700' : ''}>
            <FilterIcon className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <Button variant="outline" onClick={() => setShowTaskListModal(true)}>
            <ListFilter className="w-4 h-4 mr-2" />
            New Task List
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} title="Export CSV">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => setImportVisible(true)} title="Import CSV">
              <Upload className="w-4 h-4" />
            </Button>
            <Button onClick={() => navigate('/tasks/create')} variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>
      }
    >
      <div className="h-full flex flex-col overflow-hidden space-y-6">
        {/* Task Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
          <StatCard
            label="Overall Tasks"
            value={tasks.length}
            icon={<ListFilter className="w-5 h-5" />}
            accent={false}
            className="card-base hover:shadow-md transition-shadow"
          />
          <StatCard
            label="Completed"
            value={tasks.filter(t => t.status?.name?.toLowerCase() === 'completed').length}
            icon={<CheckCircle className="w-5 h-5 text-brand-teal-600" />}
            className="card-base border-t-brand-teal-500 hover:shadow-md transition-shadow"
          />
          <StatCard
            label="In Progress"
            value={tasks.filter(t => t.status?.name?.toLowerCase() === 'in progress').length}
            icon={<Clock className="w-5 h-5 text-blue-600" />}
            className="card-base border-t-blue-500 hover:shadow-md transition-shadow"
          />
          <StatCard
            label="Pending"
            value={tasks.filter(t => !['completed', 'in progress'].includes(t.status?.name?.toLowerCase() || '')).length}
            icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
            className="card-base border-t-amber-500 hover:shadow-md transition-shadow"
          />
        </div>

        {view === 'list' ? (
          <div className="flex-1 overflow-auto space-y-6">
            {taskLists.map(list => {
              const listTasks = groupedTasks[list.id] || [];
              if (listTasks.length === 0 && Object.keys(selectedFilters).some(k => selectedFilters[k].length > 0)) return null;

              return (
                <div key={list.id} className="card-base overflow-hidden">
                  <div className="px-4 py-3 bg-theme-neutral border-b border-theme-border flex justify-between items-center">
                    <div>
                      <h3 className="text-[14px] font-bold text-theme-primary">{list.name}</h3>
                      <p className="text-[11px] text-theme-secondary">{list.project?.name}</p>
                    </div>
                    <span className="text-[12px] font-bold text-brand-teal-700 dark:text-brand-teal-400 bg-brand-teal-50 dark:bg-brand-teal-900/30 px-2.5 py-1 rounded-full border border-brand-teal-200 dark:border-brand-teal-800">
                      {listTasks.length} Tasks
                    </span>
                  </div>
                  <DataTable
                    columns={columns}
                    data={listTasks}
                    selectable
                    onRowClick={(task) => navigate(`/tasks/${task.id}`)}
                    hideHeader={false}
                    itemsPerPage={5}
                  />
                </div>
              );
            })}

            {groupedTasks['unassigned']?.length > 0 && (
              <div className="card-base overflow-hidden">
                <div className="px-4 py-3 bg-theme-neutral border-b border-theme-border flex justify-between items-center">
                  <h3 className="text-[14px] font-bold text-theme-primary">Unassigned Tasks</h3>
                  <span className="text-[12px] font-bold text-theme-secondary bg-theme-surface border border-theme-border px-2.5 py-1 rounded-full">
                    {groupedTasks['unassigned'].length} Tasks
                  </span>
                </div>
                <DataTable
                  columns={columns}
                  data={groupedTasks['unassigned']}
                  selectable
                  onRowClick={(task) => navigate(`/tasks/${task.id}`)}
                  itemsPerPage={5}
                />
              </div>
            )}

            {filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 card-base border-dashed">
                <p className="text-[#6B7280] text-[14px]">No tasks found matching your filters.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <KanbanView tasks={filteredTasks} />
          </div>
        )}
      </div>

      {/* Task List Creation Modal */}
      {showTaskListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card title="Create New Task List" className="w-full max-w-md mx-4">
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1">Task List Name *</label>
                <input
                  type="text"
                  value={newTaskList.name}
                  onChange={e => setNewTaskList(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/30"
                  placeholder="e.g. Phase 1, Requirements..."
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1">Project *</label>
                <select
                  value={newTaskList.project_id}
                  onChange={e => setNewTaskList(prev => ({ ...prev, project_id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/30 bg-white"
                >
                  <option value="">Select a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleCreateTaskList} disabled={!newTaskList.name || !newTaskList.project_id || createTaskList.isPending}>
                  {createTaskList.isPending ? 'Creating...' : 'Create Task List'}
                </Button>
                <Button variant="outline" onClick={() => setShowTaskListModal(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        groups={filterGroups}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClear={() => setSelectedFilters({})}
      />

      <TaskImport
        visible={importVisible}
        onHide={() => setImportVisible(false)}
        onSuccess={() => refetch()}
      />
    </PageLayout>
  );
}
