import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersService, User as ApiUser } from '@/services/users';
import { format } from 'date-fns';

export function UsersList() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersService.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns: Column<ApiUser>[] = [
    { key: 'public_id', header: 'User ID', sortable: true },
    {
      key: 'first_name',
      header: 'Name',
      sortable: true,
      render: (value, row) => {
        const fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.username;
        const initial = fullName ? fullName[0].toUpperCase() : '?';
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#059669] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[12px] font-medium">{initial}</span>
              </div>
              <span className="truncate max-w-[150px]">{fullName}</span>
            </div>
          </div>
        );
      }
    },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (_, row) => <span>{row.role?.name || row.role_id || '-'}</span>
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (_, row) => <span>{row.department?.name || row.department_id || '-'}</span>
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value ? "Active" : "Inactive"} variant="status" />
    },
    {
      key: 'created_at',
      header: 'Join Date',
      sortable: true,
      render: (value) => <span>{value ? format(new Date(value), 'MMM d, yyyy') : '-'}</span>
    },
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
          data={users}
          selectable
          onRowClick={(user) => navigate(`/users/${user.id}`)}
          itemsPerPage={20}
        />
      </Card>
    </PageLayout>
  );
}
