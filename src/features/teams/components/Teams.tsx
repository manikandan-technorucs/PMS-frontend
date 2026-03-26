import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { TableSkeleton } from '@/components/ui/Skeleton/TableSkeleton';
import { Plus, UsersRound, Users, FolderKanban, Building, ChevronRight } from 'lucide-react';
import { teamsService, Team as ApiTeam } from '@/features/teams/services/teams.api';

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

export function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teamsService.getTeams()
      .then(setTeams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<ApiTeam>[] = [
    {
      key: 'public_id',
      header: 'Team ID',
      sortable: true,
      render: (v) => <span className="font-mono text-xs font-bold text-slate-500">{v as string}</span>
    },
    {
      key: 'name',
      header: 'Team',
      sortable: true,
      render: (v, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-slate-900 shadow-sm flex-shrink-0"
               style={{ background: 'var(--brand-gradient)' }}>
            {String(v)?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{v as string}</p>
            {row.department?.name && <p className="text-xs text-slate-500">{row.department.name}</p>}
          </div>
        </div>
      )
    },
    {
      key: 'lead_id',
      header: 'Team Lead',
      render: (_, row: any) => row.lead
        ? <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{row.lead.first_name} {row.lead.last_name}</span>
        : <span className="text-xs text-slate-400 italic">None assigned</span>
    },
    {
      key: 'members_count',
      header: 'Members',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{value as number || 0}</span>
        </div>
      )
    },
    {
      key: 'dept_id',
      header: 'Department',
      render: (_, row: any) => row.department?.name
        ? <StatusBadge status={row.department.name} variant="status" />
        : <span className="text-xs text-slate-400 italic">—</span>
    },
    {
      key: 'id',
      header: '',
      render: (_, row) => (
        <button onClick={(e) => { e.stopPropagation(); navigate(`/teams/${row.id}`); }}
          className="p-1.5 text-slate-400 hover:text-brand-teal-600 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      )
    }
  ];

  const totalMembers = teams.reduce((acc, t) => acc + (t.members_count || 0), 0);
  const totalDeps = new Set(teams.map(t => (t as any).department?.id || t.dept_id).filter(Boolean)).size;

  return (
    <PageLayout
      title="Teams"
      isFullHeight
      actions={
        <Button onClick={() => navigate('/teams/create')} variant="gradient">
          <Plus className="w-4 h-4 mr-2" /> Create Team
        </Button>
      }
    >
      <div className="h-full flex flex-col space-y-5 overflow-hidden">
        {/* StatCards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          <StatCard label="Total Teams" value={teams.length} icon={<UsersRound className="w-5 h-5" />} />
          <StatCard label="Total Members" value={totalMembers} icon={<Users className="w-5 h-5" />} />
          <StatCard label="Active Projects" value={0} icon={<FolderKanban className="w-5 h-5" />} />
          <StatCard label="Departments" value={totalDeps} icon={<Building className="w-5 h-5" />} />
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
          {loading ? (
            <TableSkeleton rows={8} columns={6} />
          ) : (
            <DataTable
              columns={columns}
              data={teams}
              selectable
              onRowClick={(team) => navigate(`/teams/${team.id}`)}
              itemsPerPage={20}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}