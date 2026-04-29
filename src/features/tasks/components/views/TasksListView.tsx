import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { EmptyState } from '@/components/data-display/EmptyState';
import { StatCardProps } from '@/components/data-display/StatCard';
import { Plus, Download, Upload, Layers, CheckCircle, Clock, AlertTriangle, Columns, List as ListIcon } from 'lucide-react';
import { TaskListTable } from '../ui/TaskListTable';
import { TaskKanbanBoard } from '../ui/TaskKanbanBoard';
import { Task } from '@/api/services/tasks.service';
import { timelogsService, TimeLog } from '@/api/services/timelogs.service';
import { exportToCSV } from '@/utils/export';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useStatuses, usePriorities, useUsersDropdown } from '@/features/masters/hooks/useMasters';
import { useAuth } from '@/auth/AuthProvider';
import { can } from '@/utils/permissions';
import { statusStr } from '@/utils/statusHelpers';

export function TasksListView() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'kanban'>('list');

    const [groupBy, setGroupBy] = useState<'none' | 'tasklist' | 'project'>('none');
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    const [timelogs, setTimelogs] = useState<TimeLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    const { data: tasksResponse, isLoading: loadingTasks } = useTasks({
        skip: 0,
        limit: 1000,
    });

    const tasks: Task[] = tasksResponse?.items || (Array.isArray(tasksResponse) ? tasksResponse : []);
    const treeData = tasksResponse?.treeData || [];
    const totalRecords: number = tasksResponse?.total || tasks.length;

    const { data: statuses = [] } = useStatuses();
    const { data: priorities = [] } = usePriorities();
    const { data: allUsers = [] } = useUsersDropdown();

    const filterGroups = [
        { id: 'status', label: 'Status', options: statuses.map(s => ({ label: s.name, value: s.id.toString() })) },
        { id: 'priority', label: 'Priority', options: priorities.map(p => ({ label: p.name, value: p.id.toString() })) },
        { id: 'assignee', label: 'Assignee', options: allUsers.map(u => ({ label: `${u.first_name} ${u.last_name}`, value: u.email })) },
    ];

    const handleFilterChange = (groupId: string, value: string) => {
        setSelectedFilters(prev => {
            const current = prev[groupId] || [];
            const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
            return { ...prev, [groupId]: updated };
        });
    };

    const filteredTasks = useMemo(() => tasks.filter((task: any) => {
        const statusMatch = !selectedFilters.status?.length || selectedFilters.status.includes(task.status_id?.toString() || '');
        const priorityMatch = !selectedFilters.priority?.length || selectedFilters.priority.includes(task.priority_id?.toString() || '');
        const assigneeMatch = !selectedFilters.assignee?.length || (
            (task.assignees || []).some((a: any) => selectedFilters.assignee.includes(a.email || a.mail || ''))
        );
        const searchMatch = true;
        return statusMatch && priorityMatch && assigneeMatch && searchMatch;
    }), [tasks, selectedFilters]);

    const filterTree = (nodes: any[]): any[] =>
        nodes.map(node => {
            const children = filterTree(node.children || []);
            const matches = filteredTasks.some((ft: any) => ft.id === node.data.id);
            if (matches || children.length > 0) return { ...node, children };
            return null;
        }).filter(Boolean);

    const filteredTreeData = useMemo(() => filterTree(treeData), [treeData, filteredTasks]);

    const statsProps: StatCardProps[] = useMemo(() => {
        if (loadingTasks) return [];
        return [
            { label: 'Total Tasks', value: totalRecords, icon: <Layers size={18} strokeWidth={2} />, accentVariant: 'teal' },
            { label: 'Completed', value: tasks.filter(t => statusStr(t.status) === 'completed').length, icon: <CheckCircle size={18} strokeWidth={2} />, accentVariant: 'teal' },
            { label: 'In Progress', value: tasks.filter(t => statusStr(t.status) === 'in progress').length, icon: <Clock size={18} strokeWidth={2} />, accentVariant: 'violet' },
            { label: 'Blocked', value: tasks.filter(t => statusStr(t.status) === 'blocked').length, icon: <AlertTriangle size={18} strokeWidth={2} />, accentVariant: 'amber' },
        ];
    }, [tasks, totalRecords, loadingTasks]);

    useEffect(() => {
        timelogsService.getTimelogs(0, 100)
            .then(setTimelogs)
            .catch(console.error)
            .finally(() => setLoadingLogs(false));
    }, []);

    const loading = loadingTasks || loadingLogs;
    const hasActiveFilters = Object.values(selectedFilters).some(v => v.length > 0);

    const handleExport = () => exportToCSV(filteredTasks, 'tasks.csv', [
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
            onClearFilters={() => setSelectedFilters({})}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={Object.values(selectedFilters).flat().length}
            headerActions={
                <div className="flex items-center gap-2">
                    <SegmentedControl
                        value={view}
                        onChange={(v) => setView(v as 'list' | 'kanban')}
                        options={[
                            { label: 'List', value: 'list', icon: <ListIcon size={13} strokeWidth={2.5} /> },
                            { label: 'Kanban', value: 'kanban', icon: <Columns size={13} strokeWidth={2.5} /> },
                        ]}
                    />
                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1" />
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
                            variant="primary"
                            onClick={() => navigate('/tasks/create')}
                            className="!h-9 !px-4 !rounded-lg ml-2"
                        >
                            <Plus size={15} /> New Task
                        </Button>
                    )}
                </div>
            }
            utilityBarExtra={
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[12px]">
                        <span className="text-slate-500 font-semibold whitespace-nowrap">Group By:</span>
                        <select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value as any)}
                            className="text-[12px] font-bold border rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-1"
                            style={{
                                borderColor: 'var(--border-color)',
                                background: 'var(--bg-secondary)',
                                color: '#2563eb',
                                height: '28px',
                            }}
                        >
                            <option value="none">None</option>
                            <option value="tasklist">Task List</option>
                            <option value="project">Project</option>
                        </select>
                    </div>
                </div>

            }
        >
            {view === 'list' ? (
                <div className="h-full flex flex-col min-h-0">
                    {!loading && filteredTasks.length === 0 ? (
                        <EmptyState
                            icon={<Layers />}
                            title="No tasks found"
                            description={hasActiveFilters ? "Try adjusting your filters to see more tasks." : "No tasks have been created yet. Start by creating a task."}
                            action={!hasActiveFilters && <Button variant="primary" onClick={() => navigate('/tasks/create')} className="!h-10 !px-5 !rounded-lg"><Plus size={15} /> New Task</Button>}
                        />
                    ) : (
                        <TaskListTable
                            tasks={filteredTasks}
                            timelogs={timelogs}
                            onRowClick={(task) => navigate(`/tasks/${task.id}`, { state: { from: location.pathname + location.search } })}
                            loading={loading}
                            groupBy={groupBy}
                        />
                    )}
                </div>
            ) : (
                <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                    {!loading && filteredTasks.length === 0 ? (
                        <EmptyState
                            icon={<Layers />}
                            title="Board is empty"
                            description={hasActiveFilters ? "No tasks in these columns match your filters." : "Ready for action! There are no tasks on the board yet."}
                        />
                    ) : (
                        <TaskKanbanBoard tasks={filteredTasks} />
                    )}
                </div>
            )}
        </EntityPageTemplate>
    );
}
