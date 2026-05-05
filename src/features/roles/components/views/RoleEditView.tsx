import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/providers/ToastContext';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { Trash2, Shield, UserCheck } from 'lucide-react';
import { rolesService, roleSchema, RoleFormValues } from '@/features/roles/api/roles.api';
import { usersService } from '@/features/users/api/users.api';
import SearchableMultiSelect from '@/components/core/SearchableMultiSelect';
import { FormField } from '@/components/forms/FormField';
import { RolePermissionGrid } from '../ui/RolePermissionGrid';
import { availablePermissions, Permission } from '../../types/permissions';
import { PremiumFormHeader } from '@/components/forms/PremiumFormHeader';
import { FieldLabel } from '@/components/forms/FieldLabel';
import { SectionDivider } from '@/components/forms/SectionDivider';
import { inputCls } from '@/components/forms/FormStyles';

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
      <form onSubmit={handleSubmit(onSubmit as any)} className="max-w-[980px] mx-auto pb-16 px-4">

        <PremiumFormHeader
          icon={Shield}
          title="Edit Role"
          subtitle={`Modify configuration for the ${roleName} role`}
          color="indigo"
        />

        {}
        <div
          className="rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-5 mb-6"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
        >
          <SectionDivider title="Role Details" />

          <div>
            <FieldLabel label="Role Name" required />
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  placeholder="Enter role name"
                  className={inputCls()}
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              )}
            />
          </div>

          <div>
            <FieldLabel label="Role ID" />
            <InputText
              value={roleId}
              disabled
              className={inputCls()}
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontFamily: 'monospace', opacity: 0.7 }}
            />
          </div>

          <div className="md:col-span-3">
            <FieldLabel label="Description" />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  {...field}
                  value={field.value || ''}
                  placeholder="Update role description"
                  rows={2}
                  className={inputCls()}
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              )}
            />
          </div>
        </div>

        {}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <SectionDivider title="Permissions Schema" />
            <span className="text-[11px] font-black px-3 py-1 rounded-full ml-4 flex-shrink-0"
              style={{ background: 'hsl(230 80% 60% / 0.1)', color: 'hsl(230 80% 60%)' }}>
              {selectedPermissionsSet.size} / {availablePermissions.length} SELECTED
            </span>
          </div>
          <RolePermissionGrid
            selectedPermissions={selectedPermissionsSet}
            onTogglePermission={onTogglePermission}
            onToggleAllInCategory={onToggleAllInCategory}
          />
        </div>

        {}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
        >
          <SectionDivider title="Assigned Userbase" />
          <div className="flex items-center gap-2 mb-4 mt-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
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
        </div>

        <div className="flex items-center justify-between pt-5 mt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
          <Button variant="ghost" type="button" onClick={() => navigate(`/roles/${roleId}`)}>Cancel</Button>
          <Button variant="gradient" type="submit" loading={submitting} disabled={!watch('name')?.trim()}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
