import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { Checkbox } from '@/shared/components/ui/Checkbox/Checkbox';
import { SearchableMultiSelect } from '@/shared/components/ui/SearchableMultiSelect/SearchableMultiSelect';
import { rolesService } from '@/features/roles/services/roles.api';
import { usersService } from '@/features/users/services/users.api';
import { Shield, ChevronDown, ChevronRight } from 'lucide-react';

interface Permission {
  id: string;
  category: string;
  name: string;
  description: string;
}

export const availablePermissions: Permission[] = [
  // Projects
  { id: 'proj-view', category: 'Projects', name: 'View Projects', description: 'View all project details and overview' },
  { id: 'proj-create', category: 'Projects', name: 'Create Projects', description: 'Create and set up new projects' },
  { id: 'proj-edit', category: 'Projects', name: 'Edit Projects', description: 'Modify project details and configuration' },
  { id: 'proj-delete', category: 'Projects', name: 'Delete Projects', description: 'Permanently delete projects' },
  // Tasks
  { id: 'task-view', category: 'Tasks', name: 'View Tasks', description: 'View all tasks and their details' },
  { id: 'task-create', category: 'Tasks', name: 'Create Tasks', description: 'Create and assign new tasks' },
  { id: 'task-edit', category: 'Tasks', name: 'Edit Tasks', description: 'Modify task details and status' },
  { id: 'task-delete', category: 'Tasks', name: 'Delete Tasks', description: 'Remove tasks from the system' },
  { id: 'task-assign', category: 'Tasks', name: 'Assign Tasks', description: 'Assign tasks to team members' },
  // Issues
  { id: 'issue-view', category: 'Issues', name: 'View Issues', description: 'View all reported issues' },
  { id: 'issue-create', category: 'Issues', name: 'Report Issues', description: 'Report new issues and bugs' },
  { id: 'issue-edit', category: 'Issues', name: 'Edit Issues', description: 'Update issue details and priority' },
  { id: 'issue-delete', category: 'Issues', name: 'Delete Issues', description: 'Remove issues from the system' },
  // Milestones
  { id: 'milestone-view', category: 'Milestones', name: 'View Milestones', description: 'View all project milestones' },
  { id: 'milestone-create', category: 'Milestones', name: 'Create Milestones', description: 'Create new milestones' },
  { id: 'milestone-edit', category: 'Milestones', name: 'Edit Milestones', description: 'Modify milestone details' },
  { id: 'milestone-delete', category: 'Milestones', name: 'Delete Milestones', description: 'Remove milestones' },
  // Time Tracking
  { id: 'time-view', category: 'Time Tracking', name: 'View Time Logs', description: 'View time entries and reports' },
  { id: 'time-create', category: 'Time Tracking', name: 'Log Time', description: 'Create time log entries' },
  { id: 'time-edit', category: 'Time Tracking', name: 'Edit Time Logs', description: 'Modify time log entries' },
  { id: 'time-delete', category: 'Time Tracking', name: 'Delete Time Logs', description: 'Remove time log entries' },
  { id: 'timesheet-approve', category: 'Time Tracking', name: 'Approve Timesheets', description: 'Approve or reject timesheets' },
  // Users
  { id: 'user-view', category: 'Users', name: 'View Users', description: 'View user profiles and information' },
  { id: 'user-create', category: 'Users', name: 'Create Users', description: 'Add new users to the system' },
  { id: 'user-edit', category: 'Users', name: 'Edit Users', description: 'Modify user details and roles' },
  { id: 'user-delete', category: 'Users', name: 'Delete Users', description: 'Remove users from the system' },
  // Teams
  { id: 'team-view', category: 'Teams', name: 'View Teams', description: 'View team composition and info' },
  { id: 'team-create', category: 'Teams', name: 'Create Teams', description: 'Create new teams' },
  { id: 'team-edit', category: 'Teams', name: 'Edit Teams', description: 'Modify team details and members' },
  { id: 'team-delete', category: 'Teams', name: 'Delete Teams', description: 'Remove teams from the system' },
  // Reports
  { id: 'report-view', category: 'Reports', name: 'View Reports', description: 'Access dashboards and reports' },
  { id: 'report-export', category: 'Reports', name: 'Export Reports', description: 'Download and export report data' },
  // Settings & Administration
  { id: 'settings-view', category: 'Administration', name: 'View Settings', description: 'View system configuration' },
  { id: 'settings-edit', category: 'Administration', name: 'Edit Settings', description: 'Modify system settings' },
  { id: 'role-manage', category: 'Administration', name: 'Manage Roles', description: 'Create, edit and delete roles' },
  { id: 'automation-manage', category: 'Administration', name: 'Manage Automation', description: 'Create and manage automation rules' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Projects': 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50',
  'Tasks': 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50',
  'Issues': 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50',
  'Milestones': 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/50',
  'Time Tracking': 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50',
  'Users': 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800/50',
  'Teams': 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800/50',
  'Reports': 'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800/50',
  'Administration': 'bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/50',
};

export function RoleCreate() {
  const navigate = useNavigate();
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(Object.keys(CATEGORY_COLORS)));
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    usersService.getUsers(0, 100).then(setUsers).catch(console.error);
  }, []);

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

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const s = new Set(prev);
      s.has(permissionId) ? s.delete(permissionId) : s.add(permissionId);
      return s;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const s = new Set(prev);
      s.has(category) ? s.delete(category) : s.add(category);
      return s;
    });
  };

  const toggleAllInCategory = (category: string, permissions: Permission[]) => {
    const allSelected = permissions.every(p => selectedPermissions.has(p.id));
    setSelectedPermissions(prev => {
      const s = new Set(prev);
      permissions.forEach(p => allSelected ? s.delete(p.id) : s.add(p.id));
      return s;
    });
  };

  const groupedPermissions = availablePermissions.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  const userOptions = users.map(u => ({
    label: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
    id: u.id,
    subtitle: u.email
  }));

  return (
    <PageLayout title="Create New Role" showBackButton backPath="/roles">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-900/10 dark:to-purple-900/10 border border-violet-100 dark:border-violet-900/30 rounded-xl p-5 mb-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shadow-inner">
              <Shield className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-theme-primary tracking-tight">Role & Permissions</h2>
              <p className="text-xs text-theme-secondary font-medium">Configure role access levels and assign users</p>
            </div>
          </div>
        </div>

        {/* Basic Info Card */}
        <div className="card-base mb-5">
          <div className="px-5 py-3 border-b border-theme-border">
            <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-wide">Basic Information</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-theme-secondary uppercase tracking-wider">Role Name <span className="text-red-500">*</span></label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Project Manager" className="h-10" required />
              </div>
              <div className="flex flex-col gap-2 lg:col-span-2">
                <label className="text-[13px] font-bold text-theme-secondary uppercase tracking-wider">Description</label>
                <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Brief role description" rows={1} />
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Card */}
        <div className="card-base mb-5">
          <div className="px-5 py-3 border-b border-theme-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-wide">Permissions</h3>
            <span className="text-xs text-theme-muted font-medium">{selectedPermissions.size}/{availablePermissions.length} selected</span>
          </div>
          <div className="p-5 space-y-4">
            {Object.entries(groupedPermissions).map(([category, permissions]) => {
              const isExpanded = expandedCategories.has(category);
              const selectedCount = permissions.filter(p => selectedPermissions.has(p.id)).length;
              const allSelected = selectedCount === permissions.length;
              const colorCls = CATEGORY_COLORS[category] || 'bg-gray-50 border-gray-200';

              return (
                <div key={category} className={`border rounded-lg overflow-hidden ${colorCls}`}>
                  {/* Category Header */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-theme-muted" /> : <ChevronRight className="w-4 h-4 text-theme-muted" />}
                      <span className="text-[14px] font-bold text-theme-primary">{category}</span>
                      <span className="text-[11px] bg-white/60 dark:bg-black/20 text-theme-secondary px-2 py-0.5 rounded-full font-bold">
                        {selectedCount}/{permissions.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleAllInCategory(category, permissions); }}
                      className="text-[12px] font-bold text-brand-teal-600 hover:text-brand-teal-700 transition-colors uppercase tracking-wider"
                    >
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  {/* Permissions Grid */}
                  {isExpanded && (
                    <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {permissions.map(permission => (
                        <label
                          key={permission.id}
                          className={`flex items-start gap-2.5 p-3 rounded-lg cursor-pointer border transition-all ${
                            selectedPermissions.has(permission.id)
                              ? 'bg-theme-surface border-brand-teal-500 dark:border-brand-teal-500/50 shadow-sm ring-1 ring-brand-teal-500/10'
                              : 'bg-white/40 dark:bg-black/10 border-transparent hover:bg-theme-surface hover:border-theme-border/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.has(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="mt-0.5 w-4 h-4 rounded border-theme-border text-brand-teal-600 focus:ring-brand-teal-500/20"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="block text-[13px] font-bold text-theme-primary truncate">{permission.name}</span>
                            <span className="block text-[11px] text-theme-secondary leading-tight mt-0.5">{permission.description}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Users Card */}
        <div className="card-base mb-5">
          <div className="px-5 py-3 border-b border-theme-border">
            <h3 className="text-sm font-bold text-theme-secondary uppercase tracking-wide">Assigned Users</h3>
          </div>
          <div className="p-5">
            <p className="text-xs text-theme-muted font-medium mb-3">Select users to assign this role to (optional)</p>
            <SearchableMultiSelect
              options={userOptions}
              selectedIds={selectedUsers}
              onChange={setSelectedUsers}
              placeholder={users.length === 0 ? "No users available" : "Search and select users..."}
              emptyMessage="No users available"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pb-4">
          <Button variant="ghost" type="button" onClick={() => navigate('/roles')}>Cancel</Button>
          <Button type="submit" disabled={!formData.name.trim()}>Create Role</Button>
        </div>
      </form>
    </PageLayout>
  );
}
