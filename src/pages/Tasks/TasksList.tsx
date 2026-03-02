import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Plus, Download, Clock } from 'lucide-react';
import { tasksService, Task } from '@/services/tasks';
import { timelogsService, TimeLog } from '@/services/timelogs';
import { exportToCSV } from '@/utils/export';

export function TasksList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timelogs, setTimelogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const [taskData, logData] = await Promise.all([
        tasksService.getTasks(0, 500),
        timelogsService.getTimelogs(0, 2000)
      ]);
      setTasks(taskData);
      setTimelogs(logData);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      showToast('error', 'Error', 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportColumns = [
      { key: 'public_id', header: 'Task ID' },
      { key: 'title', header: 'Task Title' },
      { key: 'project_id', header: 'Project ID' },
      { key: 'assignee_id', header: 'Assignee ID' },
      { key: 'status_id', header: 'Status ID' },
      { key: 'priority_id', header: 'Priority ID' },
      { key: 'due_date', header: 'Due Date' },
      { key: 'progress', header: 'Progress %' }
    ];
    exportToCSV(tasks, 'tasks.csv', exportColumns);
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
      actions={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => navigate('/tasks/create')}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      }
    >
      <Card>
        <DataTable
          columns={columns}
          data={tasks}
          selectable
          onRowClick={(task) => navigate(`/tasks/${task.id}`)}
          itemsPerPage={20}
        />
      </Card>
    </PageLayout>
  );
}
