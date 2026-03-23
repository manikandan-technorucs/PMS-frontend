import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { SearchableMultiSelect } from '@/components/ui/SearchableMultiSelect/SearchableMultiSelect';
import { Trash2, Shield } from 'lucide-react';
import { rolesService } from '@/features/roles/services/roles.api';
import { usersService } from '@/features/users/services/users.api';
import { availablePermissions } from './RoleCreate';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';

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
            <Input value={roleId} disabled className="h-10 bg-theme-neutral" />
          </FormField>
          <div>{/* spacer */}</div>
          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter role description" rows={2} />
          </FormField>
        </FormCard>

        {/* Permissions */}
        <div className="card-base mb-5">
          <div className="px-5 py-3 border-b border-theme-border">
            <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-wide">Permissions</h3>
          </div>
          <div className="p-5 space-y-8">
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-6 bg-brand-teal-500 rounded-full" />
                  <h3 className="text-[15px] font-bold text-theme-primary uppercase tracking-tight">{category}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {permissions.map((permission) => (
                    <div key={permission.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPermissions.has(permission.id) 
                          ? 'border-brand-teal-500 bg-brand-teal-50 dark:bg-brand-teal-950/20 dark:border-brand-teal-500/50 shadow-sm ring-1 ring-brand-teal-500/10' 
                          : 'border-theme-border bg-theme-surface hover:border-theme-border-hover hover:bg-theme-neutralShadow'
                      }`}
                      onClick={() => togglePermission(permission.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox id={permission.id} checked={selectedPermissions.has(permission.id)} onChange={() => togglePermission(permission.id)} className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <label htmlFor={permission.id} className="block text-[13px] font-bold text-theme-primary cursor-pointer leading-tight truncate">{permission.name}</label>
                          <p className="text-[11px] text-theme-secondary mt-1 leading-tight">{permission.description}</p>
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
            <p className="text-xs text-theme-muted font-medium mb-3">Select users to assign this role to</p>
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
