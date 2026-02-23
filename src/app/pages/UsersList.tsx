import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Plus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  joinDate: string;
}

const mockUsers: User[] = [
  { id: 'USR-001', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'Project Manager', department: 'Engineering', status: 'Active', joinDate: '2024-03-15' },
  { id: 'USR-002', name: 'Michael Chen', email: 'michael.chen@company.com', role: 'Senior Developer', department: 'Engineering', status: 'Active', joinDate: '2024-05-20' },
  { id: 'USR-003', name: 'Emily Rodriguez', email: 'emily.rodriguez@company.com', role: 'UI/UX Designer', department: 'Design', status: 'Active', joinDate: '2024-06-10' },
  { id: 'USR-004', name: 'David Park', email: 'david.park@company.com', role: 'DevOps Engineer', department: 'Engineering', status: 'Active', joinDate: '2024-07-01' },
  { id: 'USR-005', name: 'Lisa Anderson', email: 'lisa.anderson@company.com', role: 'Data Analyst', department: 'Analytics', status: 'Active', joinDate: '2024-08-15' },
  { id: 'USR-006', name: 'James Wilson', email: 'james.wilson@company.com', role: 'QA Engineer', department: 'Quality Assurance', status: 'Active', joinDate: '2024-09-01' },
  { id: 'USR-007', name: 'Maria Garcia', email: 'maria.garcia@company.com', role: 'Security Specialist', department: 'Security', status: 'Active', joinDate: '2024-10-12' },
  { id: 'USR-008', name: 'Robert Taylor', email: 'robert.taylor@company.com', role: 'Backend Developer', department: 'Engineering', status: 'On Hold', joinDate: '2024-11-20' },
];

export function UsersList() {
  const navigate = useNavigate();

  const columns: Column<User>[] = [
    { key: 'id', header: 'User ID', sortable: true },
    { 
      key: 'name', 
      header: 'Name', 
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center">
            <span className="text-white text-[12px] font-medium">{value[0]}</span>
          </div>
          <span>{value}</span>
        </div>
      )
    },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
    { key: 'department', header: 'Department', sortable: true },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true,
      render: (value) => <StatusBadge status={value} variant="status" />
    },
    { key: 'joinDate', header: 'Join Date', sortable: true },
  ];

  return (
    <PageLayout 
      title="Users"
      actions={
        <Button onClick={() => navigate('/users/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      }
    >
      <Card>
        <DataTable 
          columns={columns} 
          data={mockUsers}
          selectable
          onRowClick={(user) => navigate(`/users/${user.id}`)}
          itemsPerPage={20}
        />
      </Card>
    </PageLayout>
  );
}
