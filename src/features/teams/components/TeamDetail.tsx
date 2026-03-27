import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from 'primereact/button';
import { DataTable, Column } from '@/components/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { TableSkeleton } from '@/components/ui/Skeleton/TableSkeleton';
import { PageSpinner } from '@/components/ui/Loader/PageSpinner';
import { Edit, Users, FolderKanban, TrendingUp, Trash2, ArrowLeft, UserPlus, UserMinus, Mail, Building } from 'lucide-react';
import { teamsService, Team as ApiTeam } from '@/features/teams/services/teams.api';
import { GraphUserAutocomplete, GraphUser } from '@/features/projects/components/GraphUserAutocomplete';
import { api } from '@/api/axiosInstance';
import { useToast } from '@/providers/ToastContext';

/* ─── StatCard ─────────────────────────────────────────────── */
function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="absolute top-0 left-0 right-0 h-1 opacity-80" style={{ background: 'var(--brand-gradient)' }} />
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl border border-white/20 dark:border-slate-800/50 relative text-brand-teal-600 dark:text-brand-teal-400">
          <div className="absolute inset-0 opacity-20 rounded-xl" style={{ background: 'var(--brand-gradient)' }} />
          <div className="relative z-10">{icon}</div>
        </div>
      </div>
      <div>
        <p className="text-[28px] font-black leading-none text-slate-800 dark:text-white mb-1 group-hover:scale-105 transition-transform origin-left">{value}</p>
        <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.08] pointer-events-none -mr-10 -mt-10 blur-2xl" style={{ background: 'var(--brand-gradient)' }} />
    </div>
  );
}

export function TeamDetail() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { showToast } = useToast();

  const [team, setTeam] = useState<ApiTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<GraphUser | null>(null);

  const fetchTeam = async () => {
    if (!teamId) return;
    const data = await teamsService.getTeam(Number(teamId));
    setTeam(data);
  };

  useEffect(() => {
    setLoading(true);
    fetchTeam().catch(console.error).finally(() => setLoading(false));
  }, [teamId]);

  const handleAddMember = async () => {
    if (!selectedUser || !teamId) return;
    const email = selectedUser.mail;
    if (!email) {
      showToast('error', 'No email', 'This user does not have an email address.');
      return;
    }
    setAddingUser(true);
    try {
      await api.post(`/teams/${teamId}/members/${encodeURIComponent(email)}`);
      showToast('success', 'Member Added', `${selectedUser.displayName} has been added to the team.`);
      setSelectedUser(null);
      await fetchTeam();
    } catch (e: any) {
      showToast('error', 'Error', e?.response?.data?.detail || 'Could not add member.');
    } finally {
      setAddingUser(false);
    }
  };

  const handleRemoveMember = async (email: string, name: string) => {
    if (!teamId) return;
    if (!window.confirm(`Remove ${name} from this team?`)) return;
    setRemovingEmail(email);
    try {
      await api.delete(`/teams/${teamId}/members/${encodeURIComponent(email)}`);
      showToast('success', 'Member Removed', `${name} has been removed from the team.`);
      await fetchTeam();
    } catch (e: any) {
      showToast('error', 'Error', e?.response?.data?.detail || 'Could not remove member.');
    } finally {
      setRemovingEmail(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await teamsService.deleteTeam(Number(teamId));
      navigate('/teams');
    } catch {
      showToast('error', 'Error', 'Failed to delete team.');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Member',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black text-slate-900 shadow-sm flex-shrink-0"
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
    {
      key: 'department',
      header: 'Department',
      render: (_, row) => <span className="text-sm text-slate-600 dark:text-slate-400">{row.department?.name || '—'}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => <StatusBadge status={row.status?.name || 'Active'} variant="status" />
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleRemoveMember(row.email, `${row.first_name} ${row.last_name}`); }}
          disabled={removingEmail === row.email}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
        >
          <UserMinus className="w-3.5 h-3.5" />
          {removingEmail === row.email ? 'Removing...' : 'Remove'}
        </button>
      )
    }
  ];

  if (loading) return <PageSpinner fullPage label="Loading team" />;
  if (!team) return <PageSpinner fullPage label="Team not found" />;

  return (
    <PageLayout
      title={team.name}
      showBackButton
      backPath="/teams"
      actions={
        <>
          <Button severity="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
          <Button onClick={() => navigate(`/teams/${teamId}/edit`)} className="btn-gradient">
            <Edit className="w-4 h-4 mr-2" /> Edit Team
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Team Members" value={team.members?.length || 0} icon={<Users className="w-5 h-5" />} />
          <StatCard label="Active Projects" value={0} icon={<FolderKanban className="w-5 h-5" />} />
          <StatCard label="Tasks Completed" value={0} icon={<TrendingUp className="w-5 h-5" />} />
          <StatCard label="Avg Productivity" value="—" icon={<TrendingUp className="w-5 h-5" />} />
        </div>

        {/* Team Info Card */}
        <Card title="Team Information">
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
            {[
              { label: 'Team ID', value: team.public_id },
              { label: 'Team Email', value: team.team_email },
              { label: 'Team Lead', value: team.lead ? `${team.lead.first_name} ${team.lead.last_name}` : '—' },
              { label: 'Department', value: (team as any).department?.name || '—' },
              { label: 'Max Size', value: team.max_team_size ?? '—' },
              { label: 'Communication', value: team.primary_communication_channel || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
              </div>
            ))}
            {team.description && (
              <div className="col-span-full">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{team.description}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Add Member with Graph Search */}
        <Card title="Team Members">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">Add member from your organisation</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-md">
                <GraphUserAutocomplete
                  value={selectedUser}
                  onChange={setSelectedUser}
                  placeholder="Search org users by name..."
                />
              </div>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUser || addingUser}
                className="btn-gradient"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {addingUser ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </div>

          <div className="overflow-auto">
            {(team.members?.length || 0) === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">No members yet</p>
                <p className="text-xs text-slate-400 mt-1">Search and add organisation users above</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={team.members || []}
                selectable
                onRowClick={(member) => navigate(`/users/${member.id}`)}
                itemsPerPage={10}
              />
            )}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
