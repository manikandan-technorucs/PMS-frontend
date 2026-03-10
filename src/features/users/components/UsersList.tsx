import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { DataTable, Column } from '@/shared/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { Plus, Filter as FilterIcon } from 'lucide-react';
import { usersService, User as ApiUser } from '@/features/users/services/users.api';
import { format } from 'date-fns';
import { FilterSidebar } from '@/shared/components/ui/FilterSidebar';
import { useRoles, useDepartments } from '@/shared/hooks/useMasterData';

export function UsersList() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const { data: roles = [] } = useRoles();
  const { data: departments = [] } = useDepartments();

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

  const handleFilterChange = (groupId: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[groupId] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [groupId]: updated };
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const roleMatch = !selectedFilters.role?.length || selectedFilters.role.includes(user.role_id?.toString() || '');
      const deptMatch = !selectedFilters.department?.length || selectedFilters.department.includes(user.department_id?.toString() || '');
      return roleMatch && deptMatch;
    });
  }, [users, selectedFilters]);

  const columns: Column<ApiUser>[] = [
    { key: 'email', header: 'Email ID (User ID)', sortable: true },
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
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status?.name || "Active"} variant="status" />
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
          <Button variant="outline" onClick={() => setShowFilters(true)} className={Object.keys(selectedFilters).some(k => selectedFilters[k].length > 0) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}>
            <FilterIcon className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => navigate('/users/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      }
    >
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto bg-white rounded-lg border shadow-sm">
          <DataTable
            columns={columns}
            data={filteredUsers}
            selectable
            onRowClick={(user) => navigate(`/users/${user.id}`)}
            itemsPerPage={10}
          />
        </div>
      </div>

      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        groups={filterGroups}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClear={() => setSelectedFilters({})}
      />
    </PageLayout>
  );
}
