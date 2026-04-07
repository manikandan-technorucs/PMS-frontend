import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { EmptyState } from '@/components/data-display/EmptyState';
import { StatCardProps } from '@/components/data-display/StatCard';
import { Plus, Download, Upload, Layers, CheckCircle, Clock, AlertTriangle, Columns, List as ListIcon } from 'lucide-react';
import { TaskListTable } from '../ui/TaskListTable';
import { TaskKanbanBoard } from '../ui/TaskKanbanBoard';
import { Task } from '@/features/tasks/api/tasks.api';
import { timelogsService, TimeLog } from '@/features/timelogs/api/timelogs.api';
import { exportToCSV } from '@/utils/export';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useStatuses, usePriorities, useUsersDropdown } from '@/features/masters/hooks/useMasters';
import { useAuth } from '@/auth/AuthProvider';
import { can } from '@/utils/permissions';

export function TasksListView() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'kanban'>('list');
    
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
        { id: 'status',   label: 'Status',   options: statuses.map(s => ({ label: s.name, value: s.id.toString() })) },
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
        const statusMatch   = !selectedFilters.status?.length   || selectedFilters.status.includes(task.status_id?.toString() || '');
        const priorityMatch = !selectedFilters.priority?.length || selectedFilters.priority.includes(task.priority_id?.toString() || '');
        const assigneeMatch = !selectedFilters.assignee?.length || selectedFilters.assignee.includes(task.assignee_email || '');
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
          { label: 'Completed', value: tasks.filter(t => t.status?.name?.toLowerCase() === 'completed').length, icon: <CheckCircle size={18} strokeWidth={2} />, accentVariant: 'teal' },
          { label: 'In Progress', value: tasks.filter(t => t.status?.name?.toLowerCase() === 'in progress').length, icon: <Clock size={18} strokeWidth={2} />, accentVariant: 'violet' },
          { label: 'Blocked', value: tasks.filter(t => t.status?.name?.toLowerCase() === 'blocked').length, icon: <AlertTriangle size={18} strokeWidth={2} />, accentVariant: 'amber' },
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
        { key: 'public_id', header: 'Task ID'    },
        { key: 'title',     header: 'Task Title'  },
        { key: 'due_date',  header: 'Due Date'    },
        { key: 'progress',  header: 'Progress %'  },
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
                can.createTask(user?.role?.name) && (
                    <Button variant="primary" size="md" onClick={() => navigate('/tasks/create')}>
                        <Plus size={16} className="mr-2" /> New Task
                    </Button>
                )
            }
            utilityBarExtra={
                <>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                        <Button
                            variant={view === 'list' ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setView('list')}
                            className={view === 'list' ? 'text-white' : 'text-slate-500'}
                        >
                            <ListIcon size={13} className="mr-1" /> List
                        </Button>
                        <Button
                            variant={view === 'kanban' ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setView('kanban')}
                            className={view === 'kanban' ? 'text-white' : 'text-slate-500'}
                        >
                            <Columns size={13} className="mr-1" /> Kanban
                        </Button>
                    </div>
                    <Button variant="secondary" size="md" onClick={handleExport} title="Export CSV" className="rounded-xl">
                        <Download size={15} />
                    </Button>
                    {can.createTask(user?.role?.name) && (
                        <Button variant="secondary" size="md" onClick={() => navigate('/tasks/import')} title="Import CSV" className="rounded-xl">
                            <Upload size={15} />
                        </Button>
                    )}
                </>
            }
        >
            {view === 'list' ? (
                <div className="h-full overflow-auto">
                    {!loading && filteredTasks.length === 0 ? (
                        <EmptyState 
                            icon={<Layers />} 
                            title="No tasks found" 
                            description={hasActiveFilters ? "Try adjusting your filters to see more tasks." : "No tasks have been created yet. Start by creating a task."}
                            action={!hasActiveFilters && <Button variant="primary" onClick={() => navigate('/tasks/create')}><Plus size={16} className="mr-2" /> New Task</Button>}
                        />
                    ) : (
                        <TaskListTable
                            tasks={filteredTasks}
                            timelogs={timelogs}
                            onRowClick={(task) => navigate(`/tasks/${task.id}`, { state: { from: location.pathname + location.search } })}
                            loading={loading}
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
