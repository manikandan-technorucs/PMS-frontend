import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Edit, Users, Shield, CheckCircle, Trash2, ArrowLeft } from 'lucide-react';
import { rolesService, Role as ApiRole } from '@/services/roles';
import { useState, useEffect } from 'react';

import { availablePermissions } from './RoleCreate';

export function RoleDetail() {
  const navigate = useNavigate();
  const { roleId } = useParams();

  const [role, setRole] = useState<ApiRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        if (roleId) {
          const data = await rolesService.getRole(Number(roleId));
          setRole(data);
        }
      } catch (error) {
        console.error('Failed to fetch role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [roleId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await rolesService.deleteRole(Number(roleId));
        navigate('/roles');
      } catch (error) {
        console.error('Failed to delete role:', error);
        alert('Failed to delete role');
      }
    }
  };

  const userColumns: Column<any>[] = [
    { key: 'public_id', header: 'User ID', sortable: true },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (_, row: any) => <span>{row.first_name || ''} {row.last_name || ''}</span>
    },
    { key: 'email', header: 'Email' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, row: any) => <StatusBadge status={row.status?.name || 'Active'} variant="status" />
    }
  ];

  const assignedPerms = role ? availablePermissions.filter(p => !!role.permissions?.[p.id]) : [];

  const groupedPermissions = assignedPerms.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof availablePermissions[0][]>);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!role) return <div className="p-8">Role not found</div>;

  return (
    <PageLayout
      title={role.name || `Role ${roleId}`}
      actions={
        <>
          <Button variant="outline" onClick={() => navigate('/roles')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button onClick={() => navigate(`/roles/${roleId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Role
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Role Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[12px] text-[#6B7280] mb-1">Users Assigned</p>
                <p className="text-[24px] font-semibold text-[#1F2937] mb-1">{role.users?.length || 0}</p>
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
                <p className="text-[24px] font-semibold text-[#1F2937] mb-1">{assignedPerms.length}</p>
                <p className="text-[12px] text-[#6B7280]">of {availablePermissions.length} available</p>
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
              <p className="text-[14px] text-[#1F2937]">{role.name}</p>
            </div>
            <div className="col-span-2">
              <label className="block text-[12px] text-[#6B7280] mb-1">Description</label>
              <p className="text-[14px] text-[#1F2937]">
                {role.description || 'No description provided.'}
              </p>
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
            data={role.users || []}
            selectable
            onRowClick={(user) => navigate(`/users/${user.id}`)}
            itemsPerPage={10}
          />
        </Card>
      </div>
    </PageLayout>
  );
}
