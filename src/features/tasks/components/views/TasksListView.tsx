import { DropdownSelect } from "@/components/forms/DropdownSelect";
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { EmptyState } from '@/components/data-display/EmptyState';
import { StatCardProps } from '@/components/data-display/StatCard';
import { Search, Plus, Download, Upload, Layers, CheckCircle, Clock, AlertTriangle, Columns, List as ListIcon, X } from 'lucide-react';
import { TaskListTable } from '../ui/TaskListTable';
import { TableSkeleton } from '@/components/feedback/Skeleton/TableSkeleton';
import { TaskKanbanBoard } from '../ui/TaskKanbanBoard';
import { Task } from '@/api/services/tasks.service';
import { timelogsService, TimeLog } from '@/api/services/timelogs.service';
import { exportToCSV } from '@/utils/export';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useMasterLookups, useUsersDropdown } from '@/features/masters/hooks/useMasters';
import { useAuth } from '@/auth/AuthProvider';
import { can } from '@/utils/permissions';
import { statusStr } from '@/utils/statusHelpers';
import { tasklistsService, TaskList } from '@/api/services/tasklists.service';
import { useFilters } from '@/hooks/useFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { InputText } from 'primereact/inputtext';
import { LazyParams } from '@/components/data-display/DataTable';

export function TasksListView() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [groupBy, setGroupBy] = useState<'none' | 'tasklist' | 'project'>('tasklist');
    const [lazyParams, setLazyParams] = useState<LazyParams>({ first: 0, rows: 20, page: 0 });
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 400);

    const {
        selectedFilters, handleFilterChange, clearFilters, hasActiveFilters,
    } = useFilters();

    const queryParams = useMemo(() => ({
        skip: lazyParams.first,
        limit: lazyParams.rows,
        status_id: selectedFilters.status?.map(Number),
        priority_id: selectedFilters.priority?.map(Number),
        assignee_email: selectedFilters.assignee,
        search: debouncedSearch || undefined,
    }), [lazyParams, selectedFilters, debouncedSearch]);

    const { data: tasksResponse, isLoading: loadingTasks, refetch } = useTasks(queryParams);

    const tasks: Task[] = tasksResponse?.items || [];
    const totalRecords: number = tasksResponse?.total || 0;

    const { data: statuses = [] } = useMasterLookups('TaskStatus');
    const { data: priorities = [] } = useMasterLookups('TaskPriority');
    const { data: allUsers = [] } = useUsersDropdown();

    const [timelogs, setTimelogs] = useState<TimeLog[]>([]);
    const [taskLists, setTaskLists] = useState<TaskList[]>([]);

    useEffect(() => {
        timelogsService.getTimelogs(0, 100).then(setTimelogs).catch(console.error);
        tasklistsService.getTaskLists(undefined, 0, 1000).then(setTaskLists).catch(console.error);
    }, []);

    const filterGroups = [
        { id: 'status', label: 'Status', options: statuses.map((s: any) => ({ label: s.label || s.name, value: s.id.toString() })) },
        { id: 'priority', label: 'Priority', options: priorities.map((p: any) => ({ label: p.label || p.name, value: p.id.toString() })) },
        { id: 'assignee', label: 'Assignee', options: allUsers.map((u: any) => ({ label: `${u.first_name} ${u.last_name}`, value: u.email })) },
    ];

    const statsProps: StatCardProps[] = useMemo(() => {
        if (loadingTasks && !tasksResponse) return [];
        return [
            { label: 'Total Visible', value: tasks.length, icon: <Layers size={18} strokeWidth={2} />, accentVariant: 'teal' },
            { label: 'Completed', value: tasks.filter(t => statusStr((t as any).status_master ?? t.status) === 'completed').length, icon: <CheckCircle size={18} strokeWidth={2} />, accentVariant: 'teal' },
            { label: 'In Progress', value: tasks.filter(t => statusStr((t as any).status_master ?? t.status) === 'in progress').length, icon: <Clock size={18} strokeWidth={2} />, accentVariant: 'violet' },
            { label: 'Blocked', value: tasks.filter(t => statusStr((t as any).status_master ?? t.status) === 'blocked').length, icon: <AlertTriangle size={18} strokeWidth={2} />, accentVariant: 'amber' },
        ];
    }, [tasks, tasksResponse, loadingTasks]);

    const handleExport = () => exportToCSV(tasks, 'tasks.csv', [
        { key: 'public_id', header: 'Task ID' },
        { key: 'task_name', header: 'Task Title' },
        { key: 'due_date', header: 'Due Date' },
        { key: 'completion_percentage', header: 'Progress %' },
    ]);

    return (
        <EntityPageTemplate
            title="Tasks"
            stats={statsProps}
            filterGroups={filterGroups}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={Object.values(selectedFilters).flat().length}
            loading={loadingTasks}
            headerActions={
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleExport}
                        className="!w-9 !h-9 !p-0 !rounded-xl"
                        title="Export CSV"
                    >
                        <Download size={15} strokeWidth={2.5} />
                    </Button>
                    {can.createTask(user?.role?.name) && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate('/tasks/import')}
                            className="!w-9 !h-9 !p-0 !rounded-xl"
                            title="Import CSV"
                        >
                            <Upload size={15} strokeWidth={2.5} />
                        </Button>
                    )}
                    {can.createTask(user?.role?.name) && (
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/tasklists/create')}
                            className="!h-9 !px-4 !rounded-lg ml-1"
                            title="Add Task List"
                        >
                            <Layers size={15} /> Add Task List
                        </Button>
                    )}
                    {can.createTask(user?.role?.name) && (
                        <Button
                            variant="primary"
                            onClick={() => navigate('/tasks/create')}
                            className="!h-9 !px-4 !rounded-lg ml-1"
                        >
                            <Plus size={15} /> Add Task
                        </Button>
                    )}
                </div>
            }
            utilityBarExtra={
                <div className="flex items-center gap-3 w-full">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-teal-500 transition-colors" size={16} />
                        <InputText
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full pl-10 pr-10 h-10 border-none bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[13.5px] focus:ring-2 focus:ring-brand-teal-500/20 transition-all"
                        />
                        {search && (
                            <button 
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[12px]">
                            <span className="text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">Group By</span>
                            <DropdownSelect
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value as any)}
                                className="text-[12px] font-bold border-none bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1 cursor-pointer focus:ring-2 focus:ring-brand-teal-500/20 transition-all"
                                style={{ height: '32px', color: '#2563eb' }}
                            >
                                <option value="none">None</option>
                                <option value="tasklist">Task List</option>
                                <option value="project">Project</option>
                            </DropdownSelect>
                        </div>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                        <div className="flex items-center gap-2">
                            <SegmentedControl
                                value={view}
                                onChange={(v) => setView(v as 'list' | 'kanban')}
                                options={[
                                    { label: 'List', value: 'list', icon: <ListIcon size={13} strokeWidth={2.5} /> },
                                    { label: 'Kanban', value: 'kanban', icon: <Columns size={13} strokeWidth={2.5} /> },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            }
        >
            {view === 'list' ? (
                <div className="h-full flex flex-col min-h-0">
                    {loadingTasks && !tasksResponse ? (
                        <div className="p-4 h-full overflow-hidden">
                            <TableSkeleton rows={10} columns={8} />
                        </div>
                    ) : tasks.length === 0 ? (
                        <EmptyState
                            icon={<Layers />}
                            title="No tasks found"
                            description={hasActiveFilters || search ? "Try adjusting your filters or search to see more tasks." : "No tasks have been created yet. Start by creating a task."}
                            action={(!hasActiveFilters && !search) && <Button variant="primary" onClick={() => navigate('/tasks/create')} className="!h-10 !px-5 !rounded-lg"><Plus size={15} /> New Task</Button>}
                        />
                    ) : (
                        <TaskListTable
                            tasks={tasks}
                            timelogs={timelogs}
                            taskLists={taskLists}
                            canRename={can.manageTaskLists(user?.role?.name)}
                            onRowClick={(task) => navigate(`/tasks/${task.id}`, { state: { from: location.pathname + location.search } })}
                            groupBy={groupBy}
                            onTaskListRenamed={() => refetch()}
                            loading={loadingTasks}
                            lazy={true}
                            paginator={true}
                            totalRecords={totalRecords}
                            onPage={(e) => setLazyParams(e)}
                            first={lazyParams.first}
                            rows={lazyParams.rows}
                        />
                    )}
                </div>
            ) : (
                <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                    {tasks.length === 0 ? (
                        <EmptyState
                            icon={<Layers />}
                            title="Board is empty"
                            description={hasActiveFilters || search ? "No tasks match your filters or search." : "Ready for action! There are no tasks on the board yet."}
                        />
                    ) : (
                        <TaskKanbanBoard tasks={tasks} />
                    )}
                </div>
            )}
        </EntityPageTemplate>
    );
}
