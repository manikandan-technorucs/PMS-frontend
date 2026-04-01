import React, { useState, useEffect, useMemo } from 'react';
import { StatCard } from '@/components/ui/Card/StatCard';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from 'primereact/button';
import { DataTable, Column } from '@/components/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { TableSkeleton } from '@/components/ui/Skeleton/TableSkeleton';
import { Plus, Filter as FilterIcon } from 'lucide-react';
import { usersService, User as ApiUser } from '@/features/users/services/users.api';
import { format } from 'date-fns';
import { FilterSidebar } from '@/components/ui/FilterSidebar';
import { useRoles, useDepartments } from '@/hooks/useMasterData';
import { useFilters } from '@/hooks/useFilters';
import { UserAvatar } from '@/components/ui/UserAvatar/UserAvatar';
import { Users, UserPlus, CheckCircle } from 'lucide-react';

export function UsersList() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: roles = [] } = useRoles();
  const { data: departments = [] } = useDepartments();

  const {
    showFilters, selectedFilters, openFilters, closeFilters,
    handleFilterChange, clearFilters, hasActiveFilters, isMatch,
  } = useFilters();

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

  const filterGroups = [
    {
      id: 'role',
      label: 'Role',
      options: roles.map(r => ({ label: r.name, value: r.id.toString() }))
    },
    {
      id: 'department',
      label: 'Department',
      options: departments.map(d => ({ label: d.name, value: d.id.toString() }))
    }
  ];

  const filteredUsers = useMemo(() => {
    return users.filter(user => isMatch({
      role: user.role_id,
      department: (user as any).dept_id || (user as any).department_id,
    }));
  }, [users, isMatch]);

  const columns: Column<ApiUser>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <UserAvatar firstName={row.first_name} lastName={row.last_name} size="md" />
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-theme-primary antialiased capitalize">{row.first_name || row.username} {row.last_name || ''}</span>
            <span className="text-[12px] text-theme-muted font-normal">{row.email}</span>
          </div>
        </div>
      )
    },
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
      render: (_, row) => <span>{row.department?.name || (row as any).department_id || '-'}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status?.name ||"Active"} variant="status" />
    },
    {
      key: 'join_date',
      header: 'Join Date',
      sortable: true,
      render: (value) => <span>{value ? format(new Date(value as string), 'MMM d, yyyy') : '-'}</span>
    },
  ];

  return (
    <PageLayout
      title="Users"
      isFullHeight
      actions={
        <div className="flex gap-2">
          <Button outlined onClick={openFilters} className={hasActiveFilters ? 'border-brand-teal-500 bg-brand-teal-50 text-brand-teal-700' : ''}>
            <FilterIcon className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => navigate('/users/create')} className="btn-gradient">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      }
    >
      <div className="h-full flex flex-col overflow-hidden space-y-6">
        {}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-shrink-0">
          <StatCard label="Total Users" value={users.length} icon={<Users className="w-5 h-5" />} />
          <StatCard label="Active" value={users.filter(u => u.status?.name === 'Active' || !u.status).length} icon={<CheckCircle className="w-5 h-5" />} />
          <StatCard label="New (7d)" value={users.filter(u => new Date((u as any).created_at || new Date()).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length} icon={<UserPlus className="w-5 h-5" />} />
        </div>

        {loading ? (
          <div className="space-y-4">
            <TableSkeleton rows={8} columns={5} />
          </div>
        ) : (
          <div className="flex-1 overflow-auto rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
            <DataTable
              columns={columns}
              data={filteredUsers}
              selectable
              onRowClick={(user) => navigate(`/users/${user.id}`)}
              itemsPerPage={10}
            />
          </div>
        )}
      </div>

      <FilterSidebar
        isOpen={showFilters}
        onClose={closeFilters}
        groups={filterGroups}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClear={clearFilters}
      />
    </PageLayout>
  );
}
