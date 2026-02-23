import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  project: string;
  assignee: string;
  status: string;
  priority: string;
  dueDate: string;
  progress: number;
}

const mockTasks: Task[] = [
  { id: 'TSK-001', title: 'Design homepage mockup', project: 'Enterprise Portal Redesign', assignee: 'Emily Rodriguez', status: 'In Progress', priority: 'High', dueDate: '2026-02-25', progress: 70 },
  { id: 'TSK-002', title: 'Implement authentication API', project: 'Mobile App Development', assignee: 'Michael Chen', status: 'In Progress', priority: 'Critical', dueDate: '2026-02-20', progress: 85 },
  { id: 'TSK-003', title: 'Database schema optimization', project: 'API Integration Platform', assignee: 'David Park', status: 'Completed', priority: 'Medium', dueDate: '2026-02-18', progress: 100 },
  { id: 'TSK-004', title: 'User acceptance testing', project: 'Cloud Migration Project', assignee: 'Lisa Anderson', status: 'Pending', priority: 'High', dueDate: '2026-03-01', progress: 0 },
  { id: 'TSK-005', title: 'Create data visualization components', project: 'Data Analytics Dashboard', assignee: 'James Wilson', status: 'In Progress', priority: 'Medium', dueDate: '2026-02-28', progress: 45 },
  { id: 'TSK-006', title: 'Security audit and fixes', project: 'Security Enhancement', assignee: 'Maria Garcia', status: 'In Progress', priority: 'Critical', dueDate: '2026-02-22', progress: 60 },
  { id: 'TSK-007', title: 'API documentation', project: 'API Integration Platform', assignee: 'Robert Taylor', status: 'Completed', priority: 'Low', dueDate: '2026-02-15', progress: 100 },
  { id: 'TSK-008', title: 'Performance testing', project: 'Customer Portal v2', assignee: 'Sarah Johnson', status: 'Active', priority: 'High', dueDate: '2026-02-26', progress: 30 },
];

export function TasksList() {
  const navigate = useNavigate();

  const columns: Column<Task>[] = [
    { key: 'id', header: 'Task ID', sortable: true },
    { key: 'title', header: 'Task Title', sortable: true },
    { key: 'project', header: 'Project', sortable: true },
    { key: 'assignee', header: 'Assignee', sortable: true },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true,
      render: (value) => <StatusBadge status={value} variant="status" />
    },
    { 
      key: 'priority', 
      header: 'Priority', 
      sortable: true,
      render: (value) => <StatusBadge status={value} variant="priority" />
    },
    { key: 'dueDate', header: 'Due Date', sortable: true },
    { 
      key: 'progress', 
      header: 'Progress',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#2563EB] rounded-full transition-all"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-[12px] text-[#6B7280] w-10 text-right">{value}%</span>
        </div>
      )
    },
  ];

  return (
    <PageLayout 
      title="Tasks"
      actions={
        <Button onClick={() => navigate('/tasks/create')}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      }
    >
      <Card>
        <DataTable 
          columns={columns} 
          data={mockTasks}
          selectable
          onRowClick={(task) => navigate(`/tasks/${task.id}`)}
          itemsPerPage={20}
        />
      </Card>
    </PageLayout>
  );
}
