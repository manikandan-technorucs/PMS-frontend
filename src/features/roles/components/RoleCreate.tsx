import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { Checkbox } from '@/shared/components/ui/Checkbox/Checkbox';
import { X } from 'lucide-react';
import { MultiSelect } from '@/shared/components/ui/MultiSelect/MultiSelect';
import { rolesService } from '@/features/roles/services/roles.api';
import { usersService } from '@/features/users/services/users.api';

interface Permission {
  id: string;
  category: string;
  name: string;
  description: string;
}

export const availablePermissions: Permission[] = [
  { id: 'proj-view', category: 'Projects', name: 'View Projects', description: 'View all project details' },
  { id: 'proj-create', category: 'Projects', name: 'Create Projects', description: 'Create new projects' },
  { id: 'proj-edit', category: 'Projects', name: 'Edit Projects', description: 'Modify project details' },
  { id: 'proj-delete', category: 'Projects', name: 'Delete Projects', description: 'Delete projects' },
  { id: 'task-view', category: 'Tasks', name: 'View Tasks', description: 'View all tasks' },
  { id: 'task-create', category: 'Tasks', name: 'Create Tasks', description: 'Create new tasks' },
  { id: 'task-edit', category: 'Tasks', name: 'Edit Tasks', description: 'Modify task details' },
  { id: 'task-delete', category: 'Tasks', name: 'Delete Tasks', description: 'Delete tasks' },
  { id: 'user-view', category: 'Users', name: 'View Users', description: 'View user profiles' },
  { id: 'user-create', category: 'Users', name: 'Create Users', description: 'Add new users' },
  { id: 'user-edit', category: 'Users', name: 'Edit Users', description: 'Modify user details' },
  { id: 'user-delete', category: 'Users', name: 'Delete Users', description: 'Remove users' },
  { id: 'report-view', category: 'Reports', name: 'View Reports', description: 'Access reports' },
  { id: 'report-export', category: 'Reports', name: 'Export Reports', description: 'Export report data' },
  { id: 'settings-view', category: 'Settings', name: 'View Settings', description: 'View system settings' },
  { id: 'settings-edit', category: 'Settings', name: 'Edit Settings', description: 'Modify system settings' },
];

export function RoleCreate() {
  const navigate = useNavigate();
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersService.getUsers(0, 100);
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };
    fetchUsers();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const permissionsMap: any = {};
      availablePermissions.forEach(p => {
        permissionsMap[p.id] = selectedPermissions.has(p.id);
      });

      await rolesService.createRole({
        name: formData.name,
        description: formData.description,
        permissions: permissionsMap,
        user_ids: Array.from(selectedUsers)
      });

      navigate('/roles');
    } catch (error: any) {
      console.error('Failed to create role:', error);
      alert(error.response?.data?.detail || 'Failed to create role');
    }
  };

  const handleCancel = () => {
    navigate('/roles');
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const userOptions = users.map(u => ({ label: `${u.first_name || ''} ${u.last_name || ''} (${u.email})`, value: u.id }));

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <PageLayout
      title="Create New Role"
      showBackButton
      backPath="/roles"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Role Name <span className="text-[#DC2626]">*</span>
                </label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter role name" required />
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Permissions */}
          <Card title="Permissions">
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category}>
                  <h3 className="text-[16px] font-semibold text-[#1F2937] mb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start gap-3">
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.has(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={permission.id}
                            className="block text-[14px] font-medium text-[#1F2937] cursor-pointer"
                          >
                            {permission.name}
                          </label>
                          <p className="text-[12px] text-[#6B7280]">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Assigned Users */}
          <Card title="Assigned Users">
            <div className="space-y-4">
              <p className="text-[14px] text-[#6B7280]">Select users to assign this role to.</p>
              <MultiSelect
                value={Array.from(selectedUsers)}
                options={userOptions}
                onChange={(e) => setSelectedUsers(new Set(e.value))}
                optionLabel="label"
                optionValue="value"
                filter
                placeholder={users.length === 0 ? "No users available" : "Search and select users"}
                maxSelectedLabels={5}
                className="w-full form-control-theme border border-[#D1D5DB] rounded-[6px]"
                display="chip"
              />
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button variant="ghost" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Create Role
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
