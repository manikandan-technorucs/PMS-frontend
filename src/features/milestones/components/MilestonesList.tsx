import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { StatCardProps } from '@/components/data-display/StatCard';
import { DataTable, DataTableColumn } from '@/components/data-display/DataTable';
import { Badge } from '@/components/data-display/Badge';
import { TableSkeleton } from '@/components/feedback/Skeleton/TableSkeleton';
import { CardSkeleton } from '@/components/feedback/Skeleton/CardSkeleton';
import { Plus, Milestone as MilestoneIcon, CheckCircle, Clock, AlertCircle, Columns, List as ListIcon } from 'lucide-react';
import { milestonesService, Milestone } from '@/features/milestones/api/milestones.api';
import { FilterSidebar } from '@/components/layout/FilterSidebar';
import { useFilters } from '@/hooks/useFilters';
import { MilestonesKanbanView } from '@/features/milestones/components/ui/MilestonesKanbanView';

export function MilestonesList() {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  

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

  const filterGroups: any[] = [];

  const filteredMilestones = useMemo(() => {
    return milestones;
  }, [milestones]);

  const statsProps: StatCardProps[] = useMemo(() => {
    if (loading) return [];
    const total = milestones.length;
    return [
      { label: 'Total Milestones', value: total, icon: <MilestoneIcon size={18} strokeWidth={2} />, accentVariant: 'teal' },
      { label: 'Completed', value: 0, icon: <CheckCircle size={18} strokeWidth={2} />, accentVariant: 'teal' },
      { label: 'In Progress', value: 0, icon: <Clock size={18} strokeWidth={2} />, accentVariant: 'violet' },
      { label: 'Pending', value: total, icon: <AlertCircle size={18} strokeWidth={2} />, accentVariant: 'amber' }
    ];
  }, [milestones, loading]);

  const columns: DataTableColumn<Milestone>[] = [
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
      render: (_, row) => <span className="font-medium text-slate-800 dark:text-slate-200">{row.title}</span>
    },
    {
      key: 'project',
      header: 'Project',
      sortable: true,
      render: (_, row) => <span className="text-[13px] text-slate-600 dark:text-slate-400">{row.project?.name || 'Unknown'}</span>
    },
    {
      key: 'start_date',
      header: 'Start Date',
      sortable: true,
      render: (_, row) => <span className="text-[13px] text-slate-600 dark:text-slate-400">{row.start_date || '—'}</span>
    },
    {
      key: 'end_date',
      header: 'End Date',
      sortable: true,
      render: (_, row) => {
        if (!row.end_date) return <span className="text-gray-400">—</span>;
        const diff = new Date(row.end_date).getTime() - Date.now();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        const color = days >= 0 ? 'text-emerald-500' : 'text-red-500';
        const text = days >= 0 ? `${days} days left` : `${Math.abs(days)} days overdue`;
        return (
          <div>
            <span className="text-[13px] text-slate-600 dark:text-slate-400">{row.end_date}</span>
            <span className={`text-[12px] ml-2 font-medium ${color}`}>{text}</span>
          </div>
        );
      }
    },
  ];

  return (
    <EntityPageTemplate
      title="Milestones"
      stats={statsProps}
      filterGroups={filterGroups}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      activeFilterCount={Object.values(selectedFilters).flat().length}
      headerActions={
          <Button variant="primary" size="md" onClick={() => navigate('/milestones/create')}>
            <Plus size={16} className="mr-2" />
            New Milestone
          </Button>
      }
      utilityBarExtra={
         <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
             <Button
                 variant={view === 'list' ? 'primary' : 'ghost'}
                 size="sm"
                 onClick={() => setView('list')}
                 className={view === 'list' ? 'text-white' : 'text-slate-500'}
             >
                 <ListIcon size={13} className="mr-1" /> List
             </Button>
             <Button
                 variant={view === 'kanban' ? 'primary' : 'ghost'}
                 size="sm"
                 onClick={() => setView('kanban')}
                 className={view === 'kanban' ? 'text-white' : 'text-slate-500'}
             >
                 <Columns size={13} className="mr-1" /> Kanban
             </Button>
         </div>
      }
    >
      {loading ? (
        <div className="space-y-4 p-4">
          <TableSkeleton rows={6} columns={5} />
        </div>
      ) : (
        <div className="h-full overflow-hidden">
          {view === 'list' ? (
            <div className="h-full overflow-auto">
              <DataTable
                columns={columns}
                data={filteredMilestones}
                selectable
                onRowClick={(m) => navigate(`/projects/${m.project_id}`)}
                itemsPerPage={20}
              />
            </div>
          ) : (
            <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
              <MilestonesKanbanView milestones={filteredMilestones as any} onUpdate={fetchMilestones} />
            </div>
          )}
        </div>
      )}
    </EntityPageTemplate>
  );
}
