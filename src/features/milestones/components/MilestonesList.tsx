import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { TableSkeleton } from '@/components/ui/Skeleton/TableSkeleton';
import { CardSkeleton } from '@/components/ui/Skeleton/CardSkeleton';
import { Plus, Filter as FilterIcon, Milestone as MilestoneIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { milestonesService, Milestone } from '@/features/milestones/services/milestones.api';
import { FilterSidebar } from '@/components/ui/FilterSidebar';
import { useStatuses } from '@/hooks/useMasterData';
import { useFilters } from '@/hooks/useFilters';
import { ViewToggle, ViewType } from '@/components/ui/ViewToggle/ViewToggle';
import { MilestonesKanbanView } from '@/features/projects/components/MilestonesKanbanView';

/* ─── Stat Card ─────────────────────────────────────────────── */
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

export function MilestonesList() {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewType>('list');

  const { data: statuses = [] } = useStatuses();

  const {
    showFilters, selectedFilters, openFilters, closeFilters,
    handleFilterChange, clearFilters, hasActiveFilters, isMatch,
  } = useFilters();

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const data = await milestonesService.getMilestones();
      setMilestones(data);
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = [
    {
      id: 'status',
      label: 'Status',
      options: statuses.map(s => ({ label: s.name, value: s.id.toString() }))
    },
  ];

  const filteredMilestones = useMemo(() => {
    return milestones.filter(m => isMatch({ status: m.status_id }));
  }, [milestones, isMatch]);

  const stats = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter(m => m.status?.name?.toLowerCase() === 'completed').length;
    const inProgress = milestones.filter(m => ['in progress', 'active'].includes(m.status?.name?.toLowerCase() || '')).length;
    const pending = total - completed - inProgress;
    return { total, completed, inProgress, pending };
  }, [milestones]);

  const columns: Column<Milestone>[] = [
    {
      key: 'public_id',
      header: 'ID',
      sortable: true,
      render: (_, row) => (
        <span className="font-mono text-[11px] bg-theme-neutral text-theme-secondary border border-theme-border px-1.5 py-0.5 rounded">
          {row.public_id || `MLS-${row.id}`}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Milestone',
      sortable: true,
      render: (_, row) => <span className="font-medium text-theme-primary">{row.title}</span>
    },
    {
      key: 'project',
      header: 'Project',
      sortable: true,
      render: (_, row) => <span className="text-[13px]">{row.project?.name || 'Unknown'}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status?.name || 'Pending'} variant="status" />
    },
    {
      key: 'start_date',
      header: 'Start Date',
      sortable: true,
      render: (_, row) => <span className="text-[13px]">{row.start_date || '—'}</span>
    },
    {
      key: 'end_date',
      header: 'End Date',
      sortable: true,
      render: (_, row) => {
        if (!row.end_date) return <span className="text-gray-400">—</span>;
        const diff = new Date(row.end_date).getTime() - Date.now();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        const color = days >= 0 ? 'text-[#14b8a6]' : 'text-red-500';
        const text = days >= 0 ? `${days} days left` : `${Math.abs(days)} days overdue`;
        return (
          <div>
            <span className="text-[13px]">{row.end_date}</span>
            <span className={`text-[12px] ml-2 font-medium ${color}`}>{text}</span>
          </div>
        );
      }
    },
  ];

  return (
    <PageLayout
      title="Milestones"
      isFullHeight
      actions={
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <div className="h-8 w-[1px] bg-gray-200 hidden sm:block mx-1" />
          <Button variant="outline" onClick={openFilters} className={hasActiveFilters ? 'border-brand-teal-500 bg-brand-teal-50 text-brand-teal-700' : ''}>
            <FilterIcon className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => navigate('/milestones/create')} variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            New Milestone
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton count={4} />
          <TableSkeleton rows={6} columns={5} />
        </div>
      ) : (
        <div className="h-full flex flex-col overflow-hidden space-y-6">
          {/* Detailed Stats Grid aligned with Brand Gradient */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
            <StatCard label="Total Milestones" value={stats.total} icon={<MilestoneIcon className="w-5 h-5" />} />
            <StatCard label="Completed" value={stats.completed} icon={<CheckCircle className="w-5 h-5" />} />
            <StatCard label="In Progress" value={stats.inProgress} icon={<Clock className="w-5 h-5" />} />
            <StatCard label="Pending" value={stats.pending} icon={<AlertCircle className="w-5 h-5" />} />
          </div>

          {view === 'list' ? (
            <div className="flex-1 overflow-auto rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
              <DataTable
                columns={columns}
                data={filteredMilestones}
                selectable
                onRowClick={(m) => navigate(`/projects/${m.project_id}`)}
                itemsPerPage={10}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <MilestonesKanbanView milestones={filteredMilestones as any} onUpdate={fetchMilestones} />
            </div>
          )}
        </div>
      )}

      <FilterSidebar
        isOpen={showFilters}
        onClose={closeFilters}
        groups={filterGroups}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClear={clearFilters}
      />
    </PageLayout>
  );
}
