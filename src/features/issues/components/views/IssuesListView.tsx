import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { EmptyState } from '@/components/data-display/EmptyState';
import { StatCardProps } from '@/components/data-display/StatCard';
import { FilterSidebar } from '@/components/layout/FilterSidebar';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Download, Plus, Upload, Columns, List as ListIcon } from 'lucide-react';
import { useIssues } from '../../hooks/useIssues';
import { useStatuses, usePriorities, useUsersDropdown } from '@/features/masters/hooks/useMasters';
import { useFilters } from '@/hooks/useFilters';
import { useAuth } from '@/auth/AuthProvider';
import { can } from '@/utils/permissions';
import { exportToCSV } from '@/utils/export';
import { LazyParams } from '@/components/data-display/DataTable';
import { TableSkeleton } from '@/components/feedback/Skeleton/TableSkeleton';
import { IssueListTable } from '../ui/IssueListTable';
import { IssuesKanbanBoard } from '../ui/IssuesKanbanBoard';
import { issuesService } from '../../api/issues.api';

export function IssuesListView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [lazyParams, setLazyParams] = useState<LazyParams>({ first: 0, rows: 20, page: 0 });

  const { data, isLoading, refetch } = useIssues({ skip: lazyParams.first, limit: lazyParams.rows });
  const issues = data?.items ?? [];
  const totalRecords = data?.total ?? 0;

  const { data: statuses = [] } = useStatuses();
  const { data: priorities = [] } = usePriorities();
  const { data: allUsers = [] } = useUsersDropdown();

  const {
    showFilters, selectedFilters, openFilters, closeFilters,
    handleFilterChange, clearFilters, hasActiveFilters, isMatch,
  } = useFilters();

  const filterGroups = [
    {
      id: 'status',
      label: 'Status',
      options: statuses.map((s) => ({ label: s.name, value: s.id.toString() })),
    },
    {
      id: 'priority',
      label: 'Severity / Priority',
      options: priorities.map((p) => ({ label: p.name, value: p.id.toString() })),
    },
    {
      id: 'assignee',
      label: 'Assignee',
      options: allUsers.map((u) => ({
        label: `${u.first_name} ${u.last_name}`,
        value: u.email,
      })),
    },
  ];

  const filteredIssues = useMemo(
    () =>
      issues.filter((issue) => {
        const matchesFilters = isMatch({
          status: issue.status,
          assignee: issue.assignee_id?.toString(),
        });
        return matchesFilters;
      }),
    [issues, isMatch],
  );

  const handleKanbanDrop = async (issueId: number, newStatus: string) => {
    const issue = issues.find((i) => i.id === issueId);
    if (issue && issue.status !== newStatus) {
      try {
        await issuesService.updateIssue(issueId, { status: newStatus });
        refetch();
      } catch (err) {
        console.error('Failed to update issue status via DnD', err);
      }
    }
  };

  const handleExport = () => {
    exportToCSV(filteredIssues, 'issues.csv', [
      { key: 'public_id', header: 'Issue ID' },
      { key: 'bug_name', header: 'Issue Title' },
      { key: 'status', header: 'Status' },
      { key: 'severity', header: 'Severity' },
      { key: 'created_at', header: 'Created At' },
    ]);
  };

  const statsProps: StatCardProps[] = useMemo(() => {
     if (isLoading) return [];
     const open = issues.filter((i) => !['Closed', 'Resolved'].includes(i.status ?? '')).length;
     const inProgress = issues.filter((i) => i.status === 'In Progress').length;
     const resolved = issues.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;
     
     return [
       { label: 'Total Defects', value: issues.length, icon: <AlertTriangle size={18} strokeWidth={2} />, accentVariant: 'amber' },
       { label: 'Open',         value: open,          icon: <AlertCircle   size={18} strokeWidth={2} />, accentVariant: 'rose' },
       { label: 'In Progress',  value: inProgress,    icon: <Clock         size={18} strokeWidth={2} />, accentVariant: 'violet' },
       { label: 'Resolved',     value: resolved,      icon: <CheckCircle   size={18} strokeWidth={2} />, accentVariant: 'teal' },
     ];
  }, [issues, isLoading]);

  return (
    <EntityPageTemplate
      title="Defects"
      stats={statsProps}
      filterGroups={filterGroups}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      activeFilterCount={Object.values(selectedFilters).flat().length}
      loading={isLoading}
      headerActions={
        can.createIssue(user?.role?.name) && (
          <Button
            onClick={() => navigate('/issues/create')}
            size="sm"
            className="shadow-brand-teal-500/25"
          >
            <Plus size={15} /> Report Defect
          </Button>
        )
      }
      utilityBarExtra={
         <div className="flex items-center gap-2">
            <SegmentedControl
                value={view}
                onChange={(v) => setView(v as 'list' | 'kanban')}
                options={[
                    { label: 'List', value: 'list', icon: <ListIcon size={13} strokeWidth={2.5} /> },
                    { label: 'Kanban', value: 'kanban', icon: <Columns size={13} strokeWidth={2.5} /> },
                ]}
            />
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1" />
            <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 w-9 h-9 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                title="Export CSV"
            >
                <Download size={15} strokeWidth={2.5} />
            </button>
            {can.createIssue(user?.role?.name) && (
                <button
                    onClick={() => navigate('/issues/import')}
                    className="flex items-center justify-center gap-2 w-9 h-9 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                    style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    title="Import CSV"
                >
                    <Upload size={15} strokeWidth={2.5} />
                </button>
            )}
         </div>
      }
    >
        {view === 'list' ? (
          <div className="h-full flex flex-col min-h-0">
              {isLoading ? (
                  <div className="p-4"><TableSkeleton rows={6} columns={8} /></div>
              ) : filteredIssues.length === 0 ? (
                  <EmptyState 
                      icon={<AlertTriangle />} 
                      title="No defects found" 
                      description={hasActiveFilters ? "Try adjusting your filters to see more defects." : "All clear! No defects reported."}
                      action={!hasActiveFilters && (
                        <Button 
                            variant="primary"
                            onClick={() => navigate('/issues/create')}
                            className="!h-10 !px-4"
                        >
                            <Plus size={15} /> Report Defect
                        </Button>
                      )}
                  />
              ) : (
                  <IssueListTable
                    issues={filteredIssues}
                    timelogs={[]}
                    totalRecords={totalRecords}
                    lazyParams={lazyParams}
                    onLazyLoad={setLazyParams}
                    onRowClick={(issue) => navigate(`/issues/${issue.id}`, { state: { from: location.pathname + location.search } })}
                  />
              )}
          </div>
        ) : (
          <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
            {filteredIssues.length === 0 ? (
                <EmptyState 
                  icon={<AlertTriangle />} 
                  title="Empty Board" 
                  description={hasActiveFilters ? "No defects in these columns match your filters." : "Your board is currently clean — no defects!"}
                />
            ) : (
              <IssuesKanbanBoard
                issues={filteredIssues}
                statuses={statuses}
                onDrop={(issueId: number, newStatus: string) => handleKanbanDrop(issueId, newStatus)}
              />
            )}
          </div>
        )}
    </EntityPageTemplate>
  );
}
