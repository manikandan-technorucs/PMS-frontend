import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from 'primereact/button';
import { DataTable, Column } from '@/components/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Edit, Users, Shield, CheckCircle, Trash2, UserPlus, UserMinus } from 'lucide-react';
import { PageSpinner } from '@/components/ui/Loader/PageSpinner';
import { rolesService, Role as ApiRole } from '@/features/roles/services/roles.api';
import CoreSearchableMultiSelect from '@/components/core/SearchableMultiSelect';
import { api } from '@/api/axiosInstance';
import { useToast } from '@/providers/ToastContext';
import { availablePermissions } from './RoleCreate';

/* ─── StatCard ─────────────────────────────────────────────── */
function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="absolute top-0 left-0 right-0 h-1 opacity-80" style={{ background: 'var(--brand-gradient)' }} />
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl border border-white/20 relative text-brand-teal-600 dark:text-brand-teal-400">
          <div className="absolute inset-0 opacity-20 rounded-xl" style={{ background: 'var(--brand-gradient)' }} />
          <div className="relative z-10">{icon}</div>
        </div>
      </div>
      <p className="text-[28px] font-black leading-none text-slate-800 dark:text-white mb-1 group-hover:scale-105 transition-transform origin-left">{value}</p>
      <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

export function RoleDetail() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const { showToast } = useToast();

  const [role, setRole] = useState<ApiRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const fetchRole = async () => {
    if (!roleId) return;
    const data = await rolesService.getRole(Number(roleId));
    setRole(data);
  };

  useEffect(() => {
    setLoading(true);
    fetchRole().catch(console.error).finally(() => setLoading(false));
  }, [roleId]);

  const handleBulkAssign = async () => {
    if (selectedUsers.length === 0 || !roleId) return;
    setAddingUser(true);
    try {
      const userIds = selectedUsers.map(u => u.id);
      await api.post(`/masters/roles/${roleId}/users/bulk`, userIds);
      showToast('success', 'Users Assigned', `${selectedUsers.length} users have been assigned this role.`);
      setSelectedUsers([]);
      await fetchRole();
    } catch (e: any) {
      showToast('error', 'Assignment Failed', e?.response?.data?.detail || 'Could not assign users.');
    } finally {
      setAddingUser(false);
    }
  };

  const handleRemoveUser = async (email: string, name: string) => {
    if (!roleId) return;
    if (!window.confirm(`Remove ${name} from this role?`)) return;
    setRemovingEmail(email);
    try {
      await api.delete(`/masters/roles/${roleId}/users/${encodeURIComponent(email)}`);
      showToast('success', 'User Removed', `${name} has been removed from this role.`);
      await fetchRole();
    } catch (e: any) {
      showToast('error', 'Error', e?.response?.data?.detail || 'Could not remove user.');
    } finally {
      setRemovingEmail(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await rolesService.deleteRole(Number(roleId));
      navigate('/roles');
    } catch {
      showToast('error', 'Error', 'Failed to delete role.');
    }
  };

  const assignedPerms = role ? availablePermissions.filter(p => !!role.permissions?.[p.id]) : [];
  const groupedPermissions = assignedPerms.reduce((acc, permission) => {
    if (!acc[permission.category]) acc[permission.category] = [];
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof availablePermissions[0][]>);

  const userColumns: Column<any>[] = [
    {
      key: 'name',
      header: 'User',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black text-slate-900 flex-shrink-0"
            style={{ background: 'var(--brand-gradient)' }}>
            {row.first_name?.[0]}{row.last_name?.[0]}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{row.first_name} {row.last_name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'email', header: 'Email', render: (_, row) => <span className="text-sm text-slate-600">{row.email}</span> },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={row.status?.name || 'Active'} variant="status" /> },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <Button unstyled           onClick={(e) => { e.stopPropagation(); handleRemoveUser(row.email, `${row.first_name} ${row.last_name}`); }}
          disabled={removingEmail === row.email}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
        >
          <UserMinus className="w-3.5 h-3.5" />
          {removingEmail === row.email ? 'Removing...' : 'Remove'}
        </Button>
      )
    }
  ];

  if (loading) return <PageSpinner fullPage label="Loading role" />;
  if (!role) return <PageSpinner fullPage label="Role not found" />;

  return (
    <PageLayout
      title={role.name || `Role ${roleId}`}
      showBackButton
      backPath="/roles"
      actions={
        <>
          <Button severity="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
          <Button onClick={() => navigate(`/roles/${roleId}/edit`)} className="btn-gradient">
            <Edit className="w-4 h-4 mr-2" /> Edit Role
          </Button>
        </>
      }
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        {/* Super-Premium Hero Header */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-500/20 shadow-xl px-8 py-6"
             style={{ background: 'var(--brand-gradient)', boxShadow: '0 10px 30px -5px rgba(12, 209, 195, 0.25)' }}>
          <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 50%)' }} />
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center flex-shrink-0 border border-white/50 backdrop-blur-md shadow-sm">
                <Shield className="w-7 h-7 text-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-[24px] md:text-[28px] leading-none tracking-tight font-black text-slate-900">{role.name}</h1>
                </div>
                <div className="flex flex-wrap items-center mt-2 gap-3 text-[13px] font-bold text-slate-800">
                  <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 opacity-70" /> User Role Management</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right flex flex-col items-end">
                <p className="text-[12px] font-black text-slate-800 mb-2 uppercase tracking-widest">Access Control</p>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-black text-slate-900 tabular-nums uppercase px-3 py-1 bg-white/20 rounded-full border border-slate-900/10 shadow-sm">{assignedPerms.length} Permissions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Users Assigned" value={role.users?.length || 0} icon={<Users className="w-5 h-5" />} />
          <StatCard label="Permissions" value={assignedPerms.length} icon={<Shield className="w-5 h-5" />} />
          <StatCard label="Available" value={availablePermissions.length} icon={<Shield className="w-5 h-5" />} />
          <StatCard label="Coverage" value={availablePermissions.length > 0 ? `${Math.round((assignedPerms.length / availablePermissions.length) * 100)}%` : '0%'} icon={<CheckCircle className="w-5 h-5" />} />
        </div>

        {/* Role Info */}
        <Card title="Role Information">
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Role ID</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">{roleId}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Role Name</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{role.name}</p>
            </div>
            {role.description && (
              <div className="col-span-full">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{role.description}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Permissions Card */}
        {assignedPerms.length > 0 && (
          <Card title="Assigned Permissions">
            <div className="p-5 space-y-5">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category}>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                    <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    {category}
                    <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{permission.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Users with this Role */}
        <Card title="Users with this Role">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">Assign user from your organisation</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-md">
                <CoreSearchableMultiSelect
                  entityType="users"
                  value={selectedUsers}
                  onChange={setSelectedUsers}
                  placeholder="Select system users to assign..."
                  field="first_name"
                />
              </div>
              <Button
                onClick={handleBulkAssign}
                disabled={selectedUsers.length === 0 || addingUser}
                className="btn-gradient"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {addingUser ? 'Assigning...' : 'Assign Role'}
              </Button>
            </div>
          </div>

          <div className="overflow-auto">
            {(role.users?.length || 0) === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">No users assigned</p>
                <p className="text-xs text-slate-400 mt-1">Search and assign org users above</p>
              </div>
            ) : (
              <DataTable
                columns={userColumns}
                data={role.users || []}
                selectable
                onRowClick={(user) => navigate(`/users/${user.id}`)}
                itemsPerPage={10}
              />
            )}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
