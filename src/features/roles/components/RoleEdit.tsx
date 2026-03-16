import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { Checkbox } from '@/shared/components/ui/Checkbox/Checkbox';
import { SearchableMultiSelect } from '@/shared/components/ui/SearchableMultiSelect/SearchableMultiSelect';
import { Trash2, Shield } from 'lucide-react';
import { rolesService } from '@/features/roles/services/roles.api';
import { usersService } from '@/features/users/services/users.api';
import { availablePermissions } from './RoleCreate';
import { FormHeader, FormField, FormCard } from '@/shared/components/ui/Form';

export function RoleEdit() {
  const navigate = useNavigate();
  const { roleId } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchRoleAndUsers = async () => {
      if (!roleId) return;
      try {
        const [role, usersData] = await Promise.all([rolesService.getRole(parseInt(roleId, 10)), usersService.getUsers(0, 100)]);
        setUsers(usersData);
        setFormData({ name: role.name || '', description: role.description || '' });
        const permsSet = new Set<string>();
        if (role.permissions) {
          for (const [key, val] of Object.entries(role.permissions)) { if (val === true) permsSet.add(key); }
        }
        setSelectedPermissions(permsSet);
        if (role.users) setSelectedUsers(new Set(role.users.map((u: any) => u.id)));
      } catch (error) { console.error('Failed to load role:', error); }
      finally { setLoading(false); }
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
    setSubmitting(true);
    try {
      const permissionsMap: any = {};
      availablePermissions.forEach(p => { permissionsMap[p.id] = selectedPermissions.has(p.id); });
      await rolesService.updateRole(parseInt(roleId, 10), {
        name: formData.name, description: formData.description,
        permissions: permissionsMap, user_ids: Array.from(selectedUsers)
      });
      navigate(`/roles/${roleId}`);
    } catch (error: any) {
      console.error('Failed to update role:', error);
      alert(error.response?.data?.detail || 'Failed to update role');
    } finally { setSubmitting(false); }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) navigate('/roles');
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) newSet.delete(permissionId);
      else newSet.add(permissionId);
      return newSet;
    });
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) acc[permission.category] = [];
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof availablePermissions[0][]>);

  const userOptions = users.map(u => ({
    label: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
    id: u.id,
    subtitle: u.email
  }));

  if (loading) return <div className="p-8"><p>Loading role data...</p></div>;

  return (
    <PageLayout
      title={`Edit Role: ${formData.name}`}
      showBackButton backPath={`/roles/${roleId}`}
      actions={<Button variant="danger" type="button" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete Role</Button>}
    >
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={Shield} title="Edit Role" subtitle="Update role name, permissions and assigned users" color="violet" />

        <FormCard columns={3} className="mb-5">
          <FormField label="Role Name" required>
            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter role name" required className="h-10" />
          </FormField>
          <FormField label="Role ID">
            <Input value={roleId} disabled className="h-10 bg-gray-100" />
          </FormField>
          <div>{/* spacer */}</div>
          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter role description" rows={2} />
          </FormField>
        </FormCard>

        {/* Permissions */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm mb-5">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wide">Permissions</h3>
          </div>
          <div className="p-5 space-y-6">
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <div key={category}>
                <h3 className="text-[15px] font-semibold text-slate-800 dark:text-gray-200 mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {permissions.map((permission) => (
                    <div key={permission.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPermissions.has(permission.id) ? 'border-violet-300 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-600' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}
                      onClick={() => togglePermission(permission.id)}
                    >
                      <div className="flex items-start gap-2.5">
                        <Checkbox id={permission.id} checked={selectedPermissions.has(permission.id)} onChange={() => togglePermission(permission.id)} />
                        <div className="flex-1">
                          <label htmlFor={permission.id} className="block text-[13px] font-medium text-slate-800 dark:text-gray-200 cursor-pointer">{permission.name}</label>
                          <p className="text-[11px] text-slate-500 mt-0.5">{permission.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Users */}
        <FormCard columns={3} sectionTitle="Assigned Users" footer={{ onCancel: () => navigate(`/roles/${roleId}`), submitLabel: 'Save Changes', submittingLabel: 'Saving...', isSubmitting: submitting }}>
          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-xs text-slate-500 mb-3">Select users to assign this role to</p>
            <SearchableMultiSelect
              options={userOptions}
              selectedIds={selectedUsers}
              onChange={setSelectedUsers}
              placeholder={users.length === 0 ? "No users available" : "Search and select users..."}
              emptyMessage="No users available"
            />
          </div>
        </FormCard>
      </form>
    </PageLayout>
  );
}
