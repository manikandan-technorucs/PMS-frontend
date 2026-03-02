import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { StatCard } from '@/components/ui/Card/StatCard';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/lists/DataTable/DataTable';
import { Plus, Shield, Users, Wrench, Lock } from 'lucide-react';

import { useState, useEffect } from 'react';
import { rolesService, Role as ApiRole } from '@/services/roles';

export function Roles() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await rolesService.getRoles();
        setRoles(data);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const columns: Column<ApiRole>[] = [
    { key: 'id', header: 'Role ID', sortable: true },
    { key: 'name', header: 'Role Name', sortable: true },
    { key: 'description', header: 'Description' },
    {
      key: 'users_count' as any, // placeholder key
      header: 'Users',
      render: () => <span>{Math.floor(Math.random() * 20) + 1}</span> // Mock for now
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (value) => <span>{value ? Object.keys(value).length : 0} modules</span>
    },
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Roles" value={roles.length} icon={<Shield className="w-5 h-5" />} />
          <StatCard label="Active Users" value={0} icon={<Users className="w-5 h-5" />} />
          <StatCard label="Custom Roles" value={roles.length > 2 ? roles.length - 2 : 0} icon={<Wrench className="w-5 h-5" />} />
          <StatCard label="System Roles" value={Math.min(roles.length, 2)} icon={<Lock className="w-5 h-5" />} />
        </div>

        <Card>
          <DataTable
            columns={columns}
            data={roles}
            selectable
            onRowClick={(role) => navigate(`/roles/${role.id}`)}
            itemsPerPage={20}
          />
        </Card>
      </div>
    </PageLayout>
  );
}