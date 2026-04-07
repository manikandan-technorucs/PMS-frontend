import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/providers/ToastContext';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/layout/Card';
import { Button } from 'primereact/button';
import { TextInput } from '@/components/forms/TextInput';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { rolesService, roleSchema, RoleFormValues } from '@/features/roles/api/roles.api';
import { usersService } from '@/features/users/api/users.api';
import { GraphUserAutocomplete, GraphUser } from '@/features/projects/components/ui/GraphUserAutocomplete';
import { Shield, UserPlus, Trash2 } from 'lucide-react';
import { FormField } from '@/components/forms/FormField';
import { FormHeader, FormCard } from '@/components/forms/Form';
import { RolePermissionGrid } from '../ui/RolePermissionGrid';
import { availablePermissions, Permission } from '../../types/permissions';

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
      <form onSubmit={handleSubmit(onSubmit as any)} className="max-w-[1200px] mx-auto">
        <FormHeader icon={Shield} title="Role Configuration" subtitle="Define the role name, description, and permission levels" color="teal" />

        <FormCard 
          columns={3} 
          className="mb-6"
          footer={{
            onCancel: () => navigate('/roles'),
            submitLabel: 'Create Role',
            submittingLabel: 'Creating...',
            isSubmitting: submitting,
            isDisabled: !watch('name')?.trim()
          }}
        >
          <FormField label="Role Name" required error={errors.name}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextInput {...field} placeholder="e.g. Project Manager" className="h-11" />
              )}
            />
          </FormField>

          <FormField label="Description" className="md:col-span-2 lg:col-span-2" error={errors.description}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextAreaInput {...field} value={field.value || ''} placeholder="Brief role description" rows={1} className="min-h-[44px]" />
              )}
            />
          </FormField>
        </FormCard>

        <Card 
          title="Permissions Schema" 
          className="mb-6 overflow-visible"
          actions={<span className="text-[11px] font-black text-brand-teal-600 bg-brand-teal-50 dark:bg-brand-teal-900/20 px-3 py-1 rounded-full">{selectedPermissionsSet.size} / {availablePermissions.length} SELECTED</span>}
        >
          <RolePermissionGrid 
            selectedPermissions={selectedPermissionsSet}
            onTogglePermission={onTogglePermission}
            onToggleAllInCategory={onToggleAllInCategory}
          />
        </Card>

        <Card title="Assign Organization Users" className="mb-6">
          <div className="p-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Search organization users to assign this role to</p>
            <div className="flex items-end gap-3 mb-5">
              <div className="flex-1 max-w-md">
                <GraphUserAutocomplete 
                  value={userToAdd} 
                  onChange={setUserToAdd} 
                  placeholder="Search organization users..." 
                />
              </div>
              <Button type="button" onClick={handleAddUser} disabled={!userToAdd} className="h-[42px]">
                <UserPlus className="w-4 h-4 mr-2" /> Add User
              </Button>
            </div>
            
            {selectedGraphUsers.length > 0 ? (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white/50 dark:bg-slate-900/50 flex flex-col">
                <div className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Profile</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Action</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedGraphUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-teal-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                          {u.displayName?.charAt(0) || '?'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{u.displayName}</span>
                          <span className="text-[11px] text-slate-500 truncate font-medium">{u.mail || 'No email available'}</span>
                        </div>
                      </div>
                      <Button text
                         type="button"
                        onClick={() => handleRemoveUser(u.id)}
                        className="!p-2 !text-slate-400 hover:!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-sm font-medium text-slate-500">No users assigned yet</p>
              </div>
            )}
          </div>
        </Card>
      </form>
    </PageLayout>
  );
}
