import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { StatCardProps } from '@/components/data-display/StatCard';
import { Button } from '@/components/forms/Button';
import { MasterTable, ColumnSchema, LazyLoadEvent } from '@/components/data-display/MasterTable';
import { Plus, Shield, Users, Wrench, Lock, Edit, Trash2 } from 'lucide-react';
import { useRolesQuery } from '@/features/roles/hooks/useRoles';

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

  const { data, isLoading } = useRolesQuery(lazyParams);

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
          <Button
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); navigate(`/roles/edit/${rowData.id}`); }}
            className="w-8 h-8 !p-0"
            title="Edit Role"
          >
             <Edit className="w-4 h-4 text-slate-500 hover:text-brand-teal-600" />
          </Button>
        )}
        {canDelete && (
          <Button
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); }}
            className="w-8 h-8 !p-0"
            title="Delete Role"
          >
             <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
          </Button>
        )}
      </div>
    );
  };

  const roles = data?.data || [];
  const totalRecords = data?.totalRecords || 0;
  
  const totalUsers = roles.reduce((acc, role) => acc + (role.users_count || 0), 0);
  const systemRoles = roles.filter(r => ['Admin', 'Manager', 'Employee'].includes(r.name)).length;
  const customRoles = roles.length - systemRoles;

  const statsProps: StatCardProps[] = [
    { label: 'Total Roles', value: totalRecords, icon: <Shield size={18} strokeWidth={2} />, accentVariant: 'teal' },
    { label: 'Active Users', value: totalUsers, icon: <Users size={18} strokeWidth={2} />, accentVariant: 'violet' },
    { label: 'Custom Roles', value: customRoles, icon: <Wrench size={18} strokeWidth={2} />, accentVariant: 'amber' },
    { label: 'System Roles', value: systemRoles, icon: <Lock size={18} strokeWidth={2} />, accentVariant: 'teal' }
  ];

  return (
    <EntityPageTemplate
      title="Roles"
      stats={statsProps}
      
      
            headerActions={
        <Button variant="primary" size="md" onClick={() => navigate('/roles/create')}>
          <Plus size={16} className="mr-2" />
          Create Role
        </Button>
      }
    >
      <div className="h-full overflow-hidden">
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
      </div>
    </EntityPageTemplate>
  );
}
