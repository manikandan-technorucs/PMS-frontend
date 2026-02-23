import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DataTable, Column } from '../components/DataTable';
import { Plus } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: number;
}

const mockRoles: Role[] = [
  { id: 'ROLE-001', name: 'Administrator', description: 'Full system access and control', users: 3, permissions: 45 },
  { id: 'ROLE-002', name: 'Project Manager', description: 'Manage projects, tasks, and teams', users: 8, permissions: 32 },
  { id: 'ROLE-003', name: 'Developer', description: 'Access to development tasks and code', users: 25, permissions: 18 },
  { id: 'ROLE-004', name: 'Designer', description: 'Access to design tasks and assets', users: 12, permissions: 15 },
  { id: 'ROLE-005', name: 'QA Engineer', description: 'Testing and quality assurance', users: 10, permissions: 20 },
  { id: 'ROLE-006', name: 'Viewer', description: 'Read-only access to projects', users: 15, permissions: 8 },
];

export function Roles() {
  const navigate = useNavigate();

  const columns: Column<Role>[] = [
    { key: 'id', header: 'Role ID', sortable: true },
    { key: 'name', header: 'Role Name', sortable: true },
    { key: 'description', header: 'Description' },
    { key: 'users', header: 'Users', sortable: true },
    { key: 'permissions', header: 'Permissions', sortable: true },
  ];

  return (
    <PageLayout 
      title="Roles"
      actions={
        <Button onClick={() => navigate('/roles/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Total Roles</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">{mockRoles.length}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Active Users</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">
                {mockRoles.reduce((sum, role) => sum + role.users, 0)}
              </p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Custom Roles</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">4</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">System Roles</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">2</p>
            </div>
          </Card>
        </div>

        <Card>
          <DataTable 
            columns={columns} 
            data={mockRoles}
            selectable
            onRowClick={(role) => navigate(`/roles/${role.id}`)}
            itemsPerPage={20}
          />
        </Card>
      </div>
    </PageLayout>
  );
}