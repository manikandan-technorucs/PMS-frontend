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
          status: issue.status_id,
          priority: issue.priority_id,
          assignee: issue.assignee_email,
        });
        return matchesFilters;
      }),
    [issues, isMatch],
  );

  const handleKanbanDrop = async (issueId: number, statusId: number) => {
    const issue = issues.find((i) => i.id === issueId);
    if (issue && issue.status_id !== statusId) {
      try {
        await issuesService.updateIssue(issueId, { status_id: statusId });
        refetch();
      } catch (err) {
        console.error('Failed to update issue status via DnD', err);
      }
    }
  };

  const handleExport = () => {
    exportToCSV(filteredIssues, 'issues.csv', [
      { key: 'public_id', header: 'Issue ID' },
      { key: 'title', header: 'Issue Title' },
      { key: 'status_id', header: 'Status ID' },
      { key: 'priority_id', header: 'Priority ID' },
      { key: 'created_at', header: 'Created At' },
    ]);
  };

  const statsProps: StatCardProps[] = useMemo(() => {
     if (isLoading) return [];
     const open = issues.filter((i) => i.status?.name !== 'Closed').length;
     const inProgress = issues.filter((i) => i.status?.name === 'In Progress').length;
     const resolved = issues.filter((i) => i.status?.name === 'Resolved' || i.status?.name === 'Closed').length;
     
     return [
       { label: 'Total Issues', value: issues.length, icon: <AlertTriangle size={18} strokeWidth={2} />, accentVariant: 'amber' },
       { label: 'Open',         value: open,          icon: <AlertCircle   size={18} strokeWidth={2} />, accentVariant: 'rose' },
       { label: 'In Progress',  value: inProgress,    icon: <Clock         size={18} strokeWidth={2} />, accentVariant: 'violet' },
       { label: 'Resolved',     value: resolved,      icon: <CheckCircle   size={18} strokeWidth={2} />, accentVariant: 'teal' },
     ];
  }, [issues, isLoading]);

  return (
    <EntityPageTemplate
      title="Issues"
      stats={statsProps}
      filterGroups={filterGroups}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      activeFilterCount={Object.values(selectedFilters).flat().length}
      headerActions={
        can.createIssue(user?.role?.name) && (
          <button
            onClick={() => navigate('/issues/create')}
            className="inline-flex items-center justify-center gap-2 font-bold px-4 rounded-lg text-slate-900 text-[13px] transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
               height: '36px',
               background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)',
               boxShadow: '0 4px 15px rgba(12, 209, 195, 0.35)',
            }}
         >
            <Plus size={15} /> Report Issue
         </button>
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
          <div className="h-full overflow-auto">
              {filteredIssues.length === 0 ? (
                  <EmptyState 
                      icon={<AlertTriangle />} 
                      title="No issues found" 
                      description={hasActiveFilters ? "Try adjusting your filters to see more issues." : "All quiet on the Western Front! No issues reported."}
                      action={!hasActiveFilters && <button onClick={() => navigate('/issues/create')} className="inline-flex items-center justify-center gap-2 font-bold px-5 rounded-lg text-slate-900 text-[13px] transition-all hover:opacity-90 active:scale-[0.98]" style={{ height: '40px', background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)', boxShadow: '0 4px 15px rgba(12, 209, 195, 0.35)' }}><Plus size={15} /> Report Issue</button>}
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
                  description={hasActiveFilters ? "No issues in these columns match your filters." : "Your board is currently clean of any issues."}
                />
            ) : (
              <IssuesKanbanBoard
                issues={filteredIssues}
                statuses={statuses}
                onDrop={handleKanbanDrop}
              />
            )}
          </div>
        )}
    </EntityPageTemplate>
  );
}
