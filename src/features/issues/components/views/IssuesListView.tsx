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
          <Button variant="primary" size="md" onClick={() => navigate('/issues/create')}>
            <Plus size={16} className="mr-2" />
            Report Issue
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
            <Button variant="secondary" size="md" onClick={handleExport} title="Export CSV" className="px-3">
                <Download size={14} strokeWidth={2.5} />
            </Button>
            {can.createIssue(user?.role?.name) && (
                <Button variant="secondary" size="md" onClick={() => navigate('/issues/import')} title="Import CSV" className="px-3">
                    <Upload size={14} strokeWidth={2.5} />
                </Button>
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
                      action={!hasActiveFilters && <Button variant="primary" onClick={() => navigate('/issues/create')}><Plus size={16} className="mr-2" /> Report Issue</Button>}
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
