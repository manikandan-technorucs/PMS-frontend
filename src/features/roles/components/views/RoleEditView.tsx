import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/providers/ToastContext';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/layout/Card';
import { Button } from '@/components/forms/Button';
import { TextInput } from '@/components/forms/TextInput';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { Trash2, Shield, UserCheck } from 'lucide-react';
import { rolesService, roleSchema, RoleFormValues } from '@/features/roles/api/roles.api';
import { usersService } from '@/features/users/api/users.api';
import SearchableMultiSelect from '@/components/core/SearchableMultiSelect';
import { FormField } from '@/components/forms/FormField';
import { FormHeader, FormCard } from '@/components/forms/Form';
import { RolePermissionGrid } from '../ui/RolePermissionGrid';
import { availablePermissions, Permission } from '../../types/permissions';

export function RoleEditView() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { roleId } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      permissions: {},
      user_ids: []
    }
  });

  const selectedPermissionsMap = (watch('permissions') || {}) as Record<string, boolean>;
  const selectedPermissionsSet = new Set(
    Object.entries(selectedPermissionsMap)
      .filter(([_, value]) => value === true)
      .map(([key]) => key)
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!roleId) return;
      try {
        const [role, usersData] = await Promise.all([
          rolesService.getRole(parseInt(roleId, 10)),
          usersService.getUsers(0, 500)
        ]);
        
        setRoleName(role.name);
        setAllUsers(usersData);
        
        const permsMap: Record<string, boolean> = {};
        if (role.permissions) {
          Object.entries(role.permissions).forEach(([key, val]) => {
            permsMap[key] = val === true;
          });
        }

        reset({
          name: role.name || '',
          description: role.description || '',
          permissions: permsMap,
          user_ids: role.users ? role.users.map((u: any) => u.id) : []
        });
      } catch (error) {
        console.error('Failed to load role:', error);
        showToast('error', 'Error', 'Failed to load role data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roleId, reset, showToast]);

  const onTogglePermission = (id: string) => {
    const current = { ...selectedPermissionsMap };
    current[id] = !current[id];
    setValue('permissions', current, { shouldDirty: true });
  };

  const onToggleAllInCategory = (category: string, permissions: Permission[]) => {
    const current = { ...selectedPermissionsMap };
    const allSelected = permissions.every(p => current[p.id]);
    permissions.forEach(p => {
      current[p.id] = !allSelected;
    });
    setValue('permissions', current, { shouldDirty: true });
  };

  const onSubmit = async (data: RoleFormValues) => {
    if (!roleId) return;
    setSubmitting(true);
    try {
      await rolesService.updateRole(parseInt(roleId, 10), {
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        user_ids: data.user_ids
      });
      showToast('success', 'Role Updated', 'The role has been successfully updated.');
      navigate(`/roles/${roleId}`);
    } catch (error: any) {
      console.error('Failed to update role:', error);
      showToast('error', 'Update Failed', error.response?.data?.detail || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!roleId) return;
    try {
      await rolesService.deleteRole(parseInt(roleId, 10));
      showToast('success', 'Role Deleted', 'The role was successfully deleted.');
      navigate('/roles');
    } catch (error) {
      console.error('Failed to delete role:', error);
      showToast('error', 'Deletion Failed', 'Failed to delete role');
    }
  };

  const userOptions = allUsers.map(u => ({
    label: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
    id: u.id,
    subtitle: u.email
  }));

  if (loading) return <PageSpinner fullPage label="Loading role configuration..." />;

  return (
    <PageLayout
      title={`Edit Role: ${roleName}`}
      showBackButton backPath={`/roles/${roleId}`}
      actions={<Button variant="danger" type="button" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete Role</Button>}
    >
      <form onSubmit={handleSubmit(onSubmit as any)} className="max-w-[1200px] mx-auto">
        <FormHeader icon={Shield} title="Role Update" subtitle={`Modify configuration for the ${roleName} role`} color="indigo" />

        <FormCard 
          columns={3} 
          className="mb-6"
          footer={{
            onCancel: () => navigate(`/roles/${roleId}`),
            submitLabel: 'Save Changes',
            submittingLabel: 'Saving...',
            isSubmitting: submitting,
            isDisabled: !watch('name')?.trim()
          }}
        >
          <FormField label="Role Name" required error={errors.name}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextInput {...field} placeholder="Enter role name" className="h-11" />
              )}
            />
          </FormField>

          <FormField label="Role ID" className="lg:col-span-1">
            <TextInput value={roleId} disabled className="h-11 bg-theme-neutral/50 font-mono text-[13px]" />
          </FormField>

          <FormField label="Description" className="md:col-span-2 lg:col-span-3" error={errors.description}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextAreaInput {...field} value={field.value || ''} placeholder="Update role description" rows={2} />
              )}
            />
          </FormField>
        </FormCard>

        <Card 
          title="Permissions Schema" 
          className="mb-6"
          actions={<span className="text-[11px] font-black text-brand-teal-600 bg-brand-teal-50 dark:bg-brand-teal-900/20 px-3 py-1 rounded-full">{selectedPermissionsSet.size} / {availablePermissions.length} SELECTED</span>}
        >
          <RolePermissionGrid 
            selectedPermissions={selectedPermissionsSet}
            onTogglePermission={onTogglePermission}
            onToggleAllInCategory={onToggleAllInCategory}
          />
        </Card>

        <FormCard sectionTitle="Assigned Userbase" columns={3} className="bg-theme-neutral/20 dark:bg-slate-900/40">
           <FormField label="Select Users to Assign" className="md:col-span-2 lg:col-span-3" error={errors.user_ids}>
            <div className="flex items-center gap-2 mb-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <UserCheck className="w-3.5 h-3.5" /> Direct assignments to this role
            </div>
            <Controller
              name="user_ids"
              control={control}
              render={({ field }) => (
                <SearchableMultiSelect
                  entityType="users"
                  value={allUsers.filter((u) => field.value?.includes(u.id))}
                  onChange={(selected) => field.onChange(selected.map((u: any) => u.id))}
                  placeholder={allUsers.length === 0 ? 'No active users available' : 'Type to filter and select users...'}
                  field="email"
                />
              )}
            />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
