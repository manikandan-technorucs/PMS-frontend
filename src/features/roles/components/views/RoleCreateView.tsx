import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/providers/ToastContext';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { rolesService, roleSchema, RoleFormValues } from '@/features/roles/api/roles.api';
import { usersService } from '@/features/users/api/users.api';
import { GraphUserAutocomplete, GraphUser } from '@/features/projects/components/ui/GraphUserAutocomplete';
import { Shield, UserPlus, Trash2 } from 'lucide-react';
import { RolePermissionGrid } from '../ui/RolePermissionGrid';
import { availablePermissions, Permission } from '../../types/permissions';
import { PremiumFormHeader, FieldLabel, SectionDivider, inputCls } from '@/components/forms/ModernForm';

export function RoleCreateView() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedGraphUsers, setSelectedGraphUsers] = useState<GraphUser[]>([]);
  const [userToAdd, setUserToAdd] = useState<GraphUser | null>(null);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<RoleFormValues>({
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
    setSubmitting(true);
    try {
      const memberIds: number[] = [];
      
      for (const graphUser of selectedGraphUsers) {
        try {
          const email = graphUser.mail || (graphUser as any).userPrincipalName || `${graphUser.id}@temp.com`;
          let existingUser;
          try {
            const allUsers = await usersService.getUsers(0, 1000);
            existingUser = allUsers.find(u => u.email === email);
          } catch(e){}
          
          if (!existingUser) {
            existingUser = await usersService.createUser({
              first_name: (graphUser as any).givenName || graphUser.displayName.split(' ')[0],
              last_name: (graphUser as any).surname || graphUser.displayName.split(' ').slice(1).join(' ') || '',
              email: email,
              o365_id: graphUser.id,
            });
          }
          memberIds.push(existingUser.id);
        } catch (err) {
          console.error('Failed to sync graph user:', err);
        }
      }

      await rolesService.createRole({
        name: data.name,
        description: data.description || '',
        permissions: data.permissions,
        user_ids: memberIds
      });

      showToast('success', 'Role Created', 'The new role has been successfully created.');
      navigate('/roles');
    } catch (error: any) {
      console.error('Failed to create role:', error);
      showToast('error', 'Creation Failed', error.response?.data?.detail || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddUser = () => {
    if (userToAdd && !selectedGraphUsers.find(u => u.id === userToAdd.id)) {
      setSelectedGraphUsers([...selectedGraphUsers, userToAdd]);
    }
    setUserToAdd(null);
  };

  const handleRemoveUser = (id: string) => {
    setSelectedGraphUsers(selectedGraphUsers.filter(u => u.id !== id));
  };

  return (
    <PageLayout title="Create New Role" showBackButton backPath="/roles">
      <form onSubmit={handleSubmit(onSubmit as any)} className="max-w-[980px] mx-auto pb-16 px-4">

        <PremiumFormHeader
          icon={Shield}
          title="Create Role"
          subtitle="Define a new role with permissions and assign organization users"
          color="teal"
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
                  placeholder="e.g. Project Manager"
                  className={inputCls()}
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel label="Description" />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  {...field}
                  value={field.value || ''}
                  placeholder="Brief description of this role's purpose"
                  rows={1}
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
              style={{ background: 'hsl(175 70% 45% / 0.1)', color: 'hsl(175 70% 45%)' }}>
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
          <SectionDivider title="Assign Organization Users" />
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4 mt-2" style={{ color: 'var(--text-muted)' }}>
            Search organization users to assign this role to
          </p>
          <div className="flex items-end gap-3 mb-5">
            <div className="flex-1 max-w-md">
              <GraphUserAutocomplete
                value={userToAdd}
                onChange={setUserToAdd}
                placeholder="Search organization users..."
              />
            </div>
            <Button
              variant="secondary"
              type="button"
              onClick={handleAddUser}
              disabled={!userToAdd}
            >
              <UserPlus className="w-4 h-4 mr-2" /> Add User
            </Button>
          </div>

          {selectedGraphUsers.length > 0 ? (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>User Profile</span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Action</span>
              </div>
              <div>
                {selectedGraphUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, hsl(175 70% 45%), hsl(190 65% 50%))' }}>
                        {u.displayName?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{u.displayName}</span>
                        <span className="text-[11px] truncate font-medium" style={{ color: 'var(--text-muted)' }}>{u.mail || 'No email'}</span>
                      </div>
                    </div>
                    <Button variant="ghost" type="button" onClick={() => handleRemoveUser(u.id)}>
                      <Trash2 className="w-4 h-4" style={{ color: 'hsl(0 70% 55%)' }} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 rounded-xl"
              style={{ border: '2px dashed var(--border-color)', background: 'var(--bg-secondary)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No users assigned yet</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-5 mt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
          <Button variant="ghost" type="button" onClick={() => navigate('/roles')}>Cancel</Button>
          <Button variant="gradient" type="submit" loading={submitting} disabled={!watch('name')?.trim()}>
            {submitting ? 'Creating…' : 'Create Role'}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
