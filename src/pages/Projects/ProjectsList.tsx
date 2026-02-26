import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { StatCard } from '@/components/ui/Card/StatCard';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Plus, FolderKanban, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  priority: string;
  progress: number;
  startDate: string;
  endDate: string;
  manager: string;
}

const mockProjects: Project[] = [
  { id: 'PRJ-001', name: 'Enterprise Portal Redesign', client: 'Acme Corp', status: 'In Progress', priority: 'High', progress: 65, startDate: '2026-01-15', endDate: '2026-06-30', manager: 'Sarah Johnson' },
  { id: 'PRJ-002', name: 'Mobile App Development', client: 'TechStart Inc', status: 'In Progress', priority: 'Critical', progress: 45, startDate: '2026-02-01', endDate: '2026-08-15', manager: 'Michael Chen' },
  { id: 'PRJ-003', name: 'API Integration Platform', client: 'DataFlow Ltd', status: 'Active', priority: 'Medium', progress: 80, startDate: '2025-11-01', endDate: '2026-03-30', manager: 'Emily Rodriguez' },
  { id: 'PRJ-004', name: 'Cloud Migration Project', client: 'Legacy Systems', status: 'Pending', priority: 'High', progress: 20, startDate: '2026-03-01', endDate: '2026-09-30', manager: 'David Park' },
  { id: 'PRJ-005', name: 'Data Analytics Dashboard', client: 'Analytics Pro', status: 'In Progress', priority: 'Medium', progress: 55, startDate: '2026-01-20', endDate: '2026-05-30', manager: 'Lisa Anderson' },
  { id: 'PRJ-006', name: 'Customer Portal v2', client: 'Retail Giant', status: 'Active', priority: 'High', progress: 72, startDate: '2025-12-01', endDate: '2026-04-30', manager: 'James Wilson' },
  { id: 'PRJ-007', name: 'Security Enhancement', client: 'FinTech Solutions', status: 'In Progress', priority: 'Critical', progress: 38, startDate: '2026-02-10', endDate: '2026-07-31', manager: 'Maria Garcia' },
  { id: 'PRJ-008', name: 'Inventory Management System', client: 'Supply Chain Co', status: 'Active', priority: 'Medium', progress: 90, startDate: '2025-10-01', endDate: '2026-02-28', manager: 'Robert Taylor' },
];

export function ProjectsList() {
  const navigate = useNavigate();

  const columns: Column<Project>[] = [
    { key: 'id', header: 'Project ID', sortable: true },
    { key: 'name', header: 'Project Name', sortable: true },
    { key: 'client', header: 'Client', sortable: true },
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
    {
      key: 'progress',
      header: 'Progress',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#059669] rounded-full transition-all"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-[12px] text-[#6B7280] w-10 text-right">{value}%</span>
        </div>
      )
    },
    { key: 'startDate', header: 'Start Date', sortable: true },
    { key: 'endDate', header: 'End Date', sortable: true },
    { key: 'manager', header: 'Project Manager', sortable: true },
  ];

  const activeCount = mockProjects.filter(p => p.status === 'Active' || p.status === 'In Progress').length;
  const completedCount = mockProjects.filter(p => p.status === 'Completed').length;
  const pendingCount = mockProjects.filter(p => p.status === 'Pending').length;

  return (
    <PageLayout
      title="Projects"
      actions={
        <Button onClick={() => navigate('/projects/create')}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Projects" value={mockProjects.length} icon={<FolderKanban className="w-5 h-5" />} />
          <StatCard label="Active" value={activeCount} icon={<Clock className="w-5 h-5" />} />
          <StatCard label="Completed" value={completedCount} icon={<CheckCircle className="w-5 h-5" />} />
          <StatCard label="Pending" value={pendingCount} icon={<AlertTriangle className="w-5 h-5" />} />
        </div>

        <Card>
          <DataTable
            columns={columns}
            data={mockProjects}
            selectable
            onRowClick={(project) => navigate(`/projects/${project.id}`)}
            itemsPerPage={20}
          />
        </Card>
      </div>
    </PageLayout>
  );
}
