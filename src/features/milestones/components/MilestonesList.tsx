import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Button } from '@/shared/components/ui/Button/Button';
import { DataTable, Column } from '@/shared/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { TableSkeleton } from '@/shared/components/ui/Skeleton/TableSkeleton';
import { StatCard } from '@/shared/components/ui/Card/StatCard';
import { CardSkeleton } from '@/shared/components/ui/Skeleton/CardSkeleton';
import { Plus, Filter as FilterIcon, Milestone as MilestoneIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { milestonesService, Milestone } from '@/features/milestones/services/milestones.api';
import { FilterSidebar } from '@/shared/components/ui/FilterSidebar';
import { useStatuses } from '@/shared/hooks/useMasterData';
import { useFilters } from '@/shared/hooks/useFilters';
import { ViewToggle, ViewType } from '@/shared/components/ui/ViewToggle/ViewToggle';
import { MilestonesKanbanView } from '@/features/projects/components/MilestonesKanbanView';

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
        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-theme-secondary border border-slate-200 dark:border-slate-700">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
            <StatCard label="Total Milestones" value={stats.total} icon={<MilestoneIcon className="w-5 h-5 text-gray-500" />} accent={false} className="card-base" />
            <StatCard label="Completed" value={stats.completed} icon={<CheckCircle className="w-5 h-5 text-brand-teal-600" />} className="card-base border-t-brand-teal-500" />
            <StatCard label="In Progress" value={stats.inProgress} icon={<Clock className="w-5 h-5 text-blue-600" />} className="card-base border-t-blue-500" />
            <StatCard label="Pending" value={stats.pending} icon={<AlertCircle className="w-5 h-5 text-amber-600" />} className="card-base border-t-amber-500" />
          </div>

          {view === 'list' ? (
            <div className="flex-1 overflow-auto card-base rounded-xl shadow-sm">
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
