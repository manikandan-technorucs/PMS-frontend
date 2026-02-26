import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Edit, Users, Shield, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  assignedDate: string;
}

interface Permission {
  id: string;
  category: string;
  name: string;
}

const mockUsers: User[] = [
  { id: 'USR-001', name: 'Sarah Johnson', email: 'sarah.j@company.com', status: 'Active', assignedDate: '2025-01-15' },
  { id: 'USR-002', name: 'Michael Chen', email: 'michael.c@company.com', status: 'Active', assignedDate: '2025-02-10' },
  { id: 'USR-003', name: 'Emily Rodriguez', email: 'emily.r@company.com', status: 'Active', assignedDate: '2025-03-05' },
  { id: 'USR-004', name: 'David Park', email: 'david.p@company.com', status: 'Active', assignedDate: '2026-01-20' },
  { id: 'USR-005', name: 'Lisa Anderson', email: 'lisa.a@company.com', status: 'Inactive', assignedDate: '2025-04-12' },
];

const mockPermissions: Permission[] = [
  { id: 'proj-view', category: 'Projects', name: 'View Projects' },
  { id: 'proj-create', category: 'Projects', name: 'Create Projects' },
  { id: 'proj-edit', category: 'Projects', name: 'Edit Projects' },
  { id: 'task-view', category: 'Tasks', name: 'View Tasks' },
  { id: 'task-create', category: 'Tasks', name: 'Create Tasks' },
  { id: 'task-edit', category: 'Tasks', name: 'Edit Tasks' },
  { id: 'user-view', category: 'Users', name: 'View Users' },
  { id: 'report-view', category: 'Reports', name: 'View Reports' },
];

export function RoleDetail() {
  const navigate = useNavigate();
  const { roleId } = useParams();

  const userColumns: Column<User>[] = [
    { key: 'id', header: 'User ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true,
      render: (value) => <StatusBadge status={value} variant="status" />
    },
    { key: 'assignedDate', header: 'Assigned Date', sortable: true },
  ];

  const groupedPermissions = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <PageLayout 
      title={`Role ${roleId} - Project Manager`}
      actions={
        <Button onClick={() => navigate(`/roles/${roleId}/edit`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Role
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Role Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[12px] text-[#6B7280] mb-1">Users Assigned</p>
                <p className="text-[24px] font-semibold text-[#1F2937] mb-1">8</p>
                <p className="text-[12px] text-[#16A34A]">+2 this month</p>
              </div>
              <div className="text-[#059669]">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[12px] text-[#6B7280] mb-1">Permissions</p>
                <p className="text-[24px] font-semibold text-[#1F2937] mb-1">32</p>
                <p className="text-[12px] text-[#6B7280]">of 45 available</p>
              </div>
              <div className="text-[#059669]">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[12px] text-[#6B7280] mb-1">Active Users</p>
                <p className="text-[24px] font-semibold text-[#1F2937] mb-1">7</p>
                <p className="text-[12px] text-[#6B7280]">1 inactive</p>
              </div>
              <div className="text-[#059669]">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[12px] text-[#6B7280] mb-1">Role Type</p>
                <p className="text-[24px] font-semibold text-[#1F2937] mb-1">Custom</p>
                <p className="text-[12px] text-[#6B7280]">Editable</p>
              </div>
              <div className="text-[#059669]">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Role Information */}
        <Card title="Role Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Role ID</label>
              <p className="text-[14px] text-[#1F2937]">{roleId}</p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Role Name</label>
              <p className="text-[14px] text-[#1F2937]">Project Manager</p>
            </div>
            <div className="col-span-2">
              <label className="block text-[12px] text-[#6B7280] mb-1">Description</label>
              <p className="text-[14px] text-[#1F2937]">
                Manage projects, tasks, and teams. Has full access to project management features including creating, editing, and monitoring projects. Can assign tasks and manage team resources.
              </p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Created Date</label>
              <p className="text-[14px] text-[#1F2937]">2025-01-10</p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Last Modified</label>
              <p className="text-[14px] text-[#1F2937]">2026-02-15</p>
            </div>
          </div>
        </Card>

        {/* Permissions */}
        <Card title="Assigned Permissions">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <div key={category}>
                <h3 className="text-[14px] font-semibold text-[#1F2937] mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center gap-2 text-[14px] text-[#1F2937]">
                      <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                      {permission.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Users with this Role */}
        <Card title="Users with this Role">
          <DataTable 
            columns={userColumns} 
            data={mockUsers}
            selectable
            onRowClick={(user) => navigate(`/users/${user.id}`)}
            itemsPerPage={10}
          />
        </Card>
      </div>
    </PageLayout>
  );
}
