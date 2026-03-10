import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/context/ToastContext';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { DataTable, Column } from '@/shared/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { Plus, Download, Upload, Filter as FilterIcon, ListFilter } from 'lucide-react';
import { ViewToggle } from '@/shared/components/ui/ViewToggle/ViewToggle';
import { Task, tasksService } from '@/features/tasks/services/tasks.api';
import { timelogsService, TimeLog } from '@/features/timelogs/services/timelogs.api';
import { exportToCSV } from '@/shared/utils/export';
import { useTasks } from '../hooks/useTasks';
import { KanbanView } from './KanbanView';
import { TaskImport } from './TaskImport';
import { FilterSidebar } from '@/shared/components/ui/FilterSidebar';
import { useStatuses, usePriorities, useUsers } from '@/shared/hooks/useMasterData';
import { useTaskLists, useCreateTaskList } from '@/features/tasklists/hooks/useTaskLists';
import { useProjects } from '@/features/projects/hooks/useProjects';

export function TasksList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [view, setView] = useState<'list' | 'kanban'>('list');
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
      options: allUsers.map(u => ({ label: `${u.first_name} ${u.last_name}`, value: u.id.toString() }))
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
      const assigneeMatch = !selectedFilters.assignee?.length || selectedFilters.assignee.includes(task.assignee_id?.toString() || '');
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
    { key: 'public_id', header: 'Task ID', sortable: true },
    { key: 'title', header: 'Task Title', sortable: true },
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
            <span className="font-semibold text-[#059669]">{actual.toFixed(1)}h</span>
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
        if (!row.end_date) return <span className="text-[#6B7280]">No deadline</span>;
        const diff = new Date(row.end_date).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        const text = days >= 0 ? `${days} days left` : `${Math.abs(days)} days overdue`;
        const color = days >= 0 ? 'text-[#3B82F6]' : 'text-red-500';
        return (
          <div>
            <p>{row.end_date}</p>
            <p className={`text-[12px] mt-0.5 ${color}`}>{text}</p>
          </div>
        );
      }
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#059669] rounded-full transition-all"
              style={{ width: `${row.progress}%` }}
            />
          </div>
          <span className="text-[12px] text-[#6B7280] w-10 text-right">{row.progress}%</span>
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

          <Button variant="outline" onClick={() => setShowFilters(true)} className={Object.keys(selectedFilters).some(k => selectedFilters[k].length > 0) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}>
            <FilterIcon className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <Button variant="outline" onClick={() => setShowTaskListModal(true)}>
            <ListFilter className="w-4 h-4 mr-2" />
            New Task List
          </Button>

          <Button variant="outline" onClick={() => setImportVisible(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/tasks/create')}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      }
    >
      <div className="h-full flex flex-col overflow-hidden">
        {view === 'list' ? (
          <div className="flex-1 overflow-auto space-y-6">
            {taskLists.map(list => {
              const listTasks = groupedTasks[list.id] || [];
              if (listTasks.length === 0 && Object.keys(selectedFilters).some(k => selectedFilters[k].length > 0)) return null;

              return (
                <div key={list.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-[#F9FAFB] border-b flex justify-between items-center">
                    <div>
                      <h3 className="text-[14px] font-semibold text-[#1F2937]">{list.name}</h3>
                      <p className="text-[11px] text-[#6B7280]">{list.project?.name}</p>
                    </div>
                    <span className="text-[12px] font-medium text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
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
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-[#F9FAFB] border-b flex justify-between items-center">
                  <h3 className="text-[14px] font-semibold text-[#1F2937]">Unassigned Tasks</h3>
                  <span className="text-[12px] font-medium text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
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
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed">
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
                  className="w-full px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                  placeholder="e.g. Phase 1, Requirements..."
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1">Project *</label>
                <select
                  value={newTaskList.project_id}
                  onChange={e => setNewTaskList(prev => ({ ...prev, project_id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-[6px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 bg-white"
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
