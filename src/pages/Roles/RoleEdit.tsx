import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { X, Trash2 } from 'lucide-react';
import { MultiSelect } from '@/components/ui/MultiSelect/MultiSelect';
import { rolesService } from '@/services/roles';
import { usersService } from '@/services/users';
import { availablePermissions } from './RoleCreate';

export function RoleEdit() {
  const navigate = useNavigate();
  const { roleId } = useParams();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchRoleAndUsers = async () => {
      if (!roleId) return;
      try {
        const [role, usersData] = await Promise.all([
          rolesService.getRole(parseInt(roleId, 10)),
          usersService.getUsers(0, 100)
        ]);

        setUsers(usersData);

        setFormData({
          name: role.name || '',
          description: role.description || ''
        });

        const permsSet = new Set<string>();
        if (role.permissions) {
          for (const [key, val] of Object.entries(role.permissions)) {
            if (val === true) {
              permsSet.add(key);
            }
          }
        }
        setSelectedPermissions(permsSet);

        if (role.users) {
          setSelectedUsers(new Set(role.users.map((u: any) => u.id)));
        }
      } catch (error) {
        console.error('Failed to load role:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoleAndUsers();
  }, [roleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId) return;

    try {
      const permissionsMap: any = {};
      availablePermissions.forEach(p => {
        permissionsMap[p.id] = selectedPermissions.has(p.id);
      });

      await rolesService.updateRole(parseInt(roleId, 10), {
        name: formData.name,
        description: formData.description,
        permissions: permissionsMap,
        user_ids: Array.from(selectedUsers)
      });

      navigate(`/roles/${roleId}`);
    } catch (error: any) {
      console.error('Failed to update role:', error);
      alert(error.response?.data?.detail || 'Failed to update role');
    }
  };

  const handleCancel = () => {
    navigate(`/roles/${roleId}`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      navigate('/roles');
    }
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
  }, {} as Record<string, typeof availablePermissions[0][]>);

  if (loading) {
    return <div className="p-8"><p>Loading role data...</p></div>;
  }

  return (
    <PageLayout
      title={`Edit Role ${formData.name}`}
      actions={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="danger" type="button" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Role
          </Button>
          <Button variant="ghost" type="button" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      }
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
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Role ID (Immutable)
                </label>
                <Input
                  value={roleId}
                  disabled
                />
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
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
