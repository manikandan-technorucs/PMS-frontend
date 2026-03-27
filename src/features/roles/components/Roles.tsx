import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { StatCard } from '@/components/ui/Card/StatCard';
import { Button } from 'primereact/button';
import { MasterTable, ColumnSchema, LazyLoadEvent } from '@/components/data/MasterTable';
import { Plus, Shield, Users, Wrench, Lock, Edit, Trash2 } from 'lucide-react';
import { useRolesQuery } from '@/features/roles/hooks/useRoles';

import { Button as PRButton } from 'primereact/button';

const usePermissions = (_module: string) => ({ canEdit: true, canDelete: false });

export const Roles = () => {
  const navigate = useNavigate();
  const { canEdit, canDelete } = usePermissions('roles');

  const [lazyParams, setLazyParams] = useState<LazyLoadEvent>({
      first: 0,
      rows: 10,
      page: 0,
      sortField: undefined,
      sortOrder: undefined,
      globalFilter: null,
  });

  const { data, isLoading, isError } = useRolesQuery(lazyParams);

  const columns: ColumnSchema[] = [
    { field: 'id', header: 'Role ID', sortable: true },
    { field: 'name', header: 'Role Name', sortable: true },
    { field: 'description', header: 'Description' },
    {
      field: 'users_count',
      header: 'Users',
      sortable: true,
      body: (rowData) => <span>{rowData.users_count || 0}</span>
    },
    {
      field: 'permissions',
      header: 'Permissions',
      body: (rowData) => <span>{rowData.permissions ? Object.keys(rowData.permissions).length : 0} modules</span>
    },
  ];

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className="flex gap-1 justify-end">
        {canEdit && (
          <PRButton
            icon={<Edit className="w-4 h-4" />}
            text
            severity="secondary"
            onClick={(e) => { e.stopPropagation(); navigate(`/roles/edit/${rowData.id}`); }}
            className="!w-8 !h-8 !p-0"
          />
        )}
        {canDelete && (
          <PRButton
            icon={<Trash2 className="w-4 h-4" />}
            text
            severity="danger"
            onClick={(e) => { e.stopPropagation(); }}
            className="!w-8 !h-8 !p-0"
          />
        )}
      </div>
    );
  };

  const roles = data?.data || [];
  const totalRecords = data?.totalRecords || 0;
  
  const totalUsers = roles.reduce((acc, role) => acc + (role.users_count || 0), 0);
  const systemRoles = roles.filter(r => ['Admin', 'Manager', 'Employee'].includes(r.name)).length;
  const customRoles = roles.length - systemRoles;

  return (
    <PageLayout
      title="Roles"
      actions={
        <Button onClick={() => navigate('/roles/create')} className="btn-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Roles" value={totalRecords} icon={<Shield className="w-5 h-5" />} />
          <StatCard label="Active Users" value={totalUsers} icon={<Users className="w-5 h-5" />} />
          <StatCard label="Custom Roles" value={customRoles} icon={<Wrench className="w-5 h-5" />} />
          <StatCard label="System Roles" value={systemRoles} icon={<Lock className="w-5 h-5" />} />
        </div>

        <Card>
          <MasterTable
            title="Roles Directory"
            columns={columns}
            data={roles}
            totalRecords={totalRecords}
            lazyParams={lazyParams}
            onLazyLoad={setLazyParams}
            loading={isLoading}
            onRowClick={(role) => navigate(`/roles/${role.id}`)}
            actions={actionBodyTemplate}
            hideSearch={true}
          />
        </Card>
      </div>
    </PageLayout>
  );
}