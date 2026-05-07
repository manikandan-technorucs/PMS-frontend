import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EntityPageTemplate } from '@/components/layout/EntityPageTemplate';
import { Button } from '@/components/forms/Button';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { EmptyState } from '@/components/data-display/EmptyState';
import { StatCardProps } from '@/components/data-display/StatCard';
import { Search, AlertCircle, AlertTriangle, CheckCircle, Clock, Download, Plus, Upload, Columns, List as ListIcon, X } from 'lucide-react';
import { useIssues } from '../../hooks/useIssues';
import { useMasterLookups, useUsersDropdown } from '@/features/masters/hooks/useMasters';
import { useFilters } from '@/hooks/useFilters';
import { useAuth } from '@/auth/AuthProvider';
import { can } from '@/utils/permissions';
import { exportToCSV } from '@/utils/export';
import { LazyParams } from '@/components/data-display/DataTable';
import { TableSkeleton } from '@/components/feedback/Skeleton/TableSkeleton';
import { IssueListTable } from '../ui/IssueListTable';
import { IssuesKanbanBoard } from '../ui/IssuesKanbanBoard';
import { issuesService } from '../../api/issues.api';
import { InputText } from 'primereact/inputtext';
import { useDebounce } from '@/hooks/useDebounce';

export function IssuesListView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [lazyParams, setLazyParams] = useState<LazyParams>({ first: 0, rows: 20, page: 0 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const {
    selectedFilters, handleFilterChange, clearFilters, hasActiveFilters,
  } = useFilters();

  const queryParams = useMemo(() => ({
    skip: lazyParams.first,
    limit: lazyParams.rows,
    status_id: selectedFilters.status?.map(Number),
    severity_id: selectedFilters.priority?.map(Number),
    assignee_email: selectedFilters.assignee,
    search: debouncedSearch || undefined,
  }), [lazyParams, selectedFilters, debouncedSearch]);

  const { data, isLoading, refetch } = useIssues(queryParams);
  const issues = data?.items ?? [];
  const totalRecords = data?.total ?? 0;

  const { data: statuses = [] } = useMasterLookups('IssueStatus');
  const { data: priorities = [] } = useMasterLookups('IssueSeverity');
  const { data: allUsers = [] } = useUsersDropdown();

  const filterGroups = [
    {
      id: 'status',
      label: 'Status',
      options: statuses.map((s: any) => ({ label: s.label || s.name, value: s.id.toString() })),
    },
    {
      id: 'priority',
      label: 'Severity / Priority',
      options: priorities.map((p: any) => ({ label: p.label || p.name, value: p.id.toString() })),
    },
    {
      id: 'assignee',
      label: 'Assignee',
      options: allUsers.map((u: any) => ({
        label: `${u.first_name} ${u.last_name}`,
        value: u.email,
      })),
    },
  ];

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
    exportToCSV(issues, 'issues.csv', [
      { key: 'public_id', header: 'Issue ID' },
      { key: 'bug_name', header: 'Issue Title' },
      { key: 'status', header: 'Status' },
      { key: 'severity', header: 'Severity' },
      { key: 'created_at', header: 'Created At' },
    ]);
  };

  const statsProps: StatCardProps[] = useMemo(() => {
    if (isLoading && !data) return [];
    
    // Note: These stats are now based on the current page. 
    // In a real app, you might want a separate stats endpoint for global counts.
    const open = issues.filter((i) => !['Closed', 'Resolved'].includes(i.status ?? '')).length;
    const inProgress = issues.filter((i) => i.status === 'In Progress').length;
    const resolved = issues.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;

    return [
      { label: 'Total Visible', value: issues.length, icon: <AlertTriangle size={18} strokeWidth={2} />, accentVariant: 'amber' },
      { label: 'Open', value: open, icon: <AlertCircle size={18} strokeWidth={2} />, accentVariant: 'rose' },
      { label: 'In Progress', value: inProgress, icon: <Clock size={18} strokeWidth={2} />, accentVariant: 'violet' },
      { label: 'Resolved', value: resolved, icon: <CheckCircle size={18} strokeWidth={2} />, accentVariant: 'teal' },
    ];
  }, [issues, isLoading, data]);

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
      utilityBarExtra={
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-teal-500 transition-colors" size={16} />
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or Title..."
              className="w-full pl-10 pr-10 h-10 border-none bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[13.5px] focus:ring-2 focus:ring-brand-teal-500/20 transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
             <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mr-2">View Mode</span>
             <SegmentedControl
              value={view}
              onChange={(v) => setView(v as 'list' | 'kanban')}
              options={[
                { label: 'List', value: 'list', icon: <ListIcon size={13} strokeWidth={2.5} /> },
                { label: 'Kanban', value: 'kanban', icon: <Columns size={13} strokeWidth={2.5} /> },
              ]}
            />
          </div>
        </div>
      }
      headerActions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            className="!w-9 !h-9 !p-0 !rounded-xl"
            title="Export CSV"
          >
            <Download size={15} strokeWidth={2.5} />
          </Button>
          {can.createIssue(user?.role?.name) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/issues/import')}
              className="!w-9 !h-9 !p-0 !rounded-xl"
              title="Import CSV"
            >
              <Upload size={15} strokeWidth={2.5} />
            </Button>
          )}
          {can.createIssue(user?.role?.name) && (
            <Button
              onClick={() => navigate('/issues/create')}
              size="sm"
              className="shadow-brand-teal-500/25 ml-2"
            >
              <Plus size={15} /> Report Defect
            </Button>
          )}
        </div>
      }
    >
      {view === 'list' ? (
        <div className="h-full flex flex-col min-h-0">
          {isLoading && !data ? (
            <div className="p-4"><TableSkeleton rows={6} columns={8} /></div>
          ) : issues.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle />}
              title="No defects found"
              description={hasActiveFilters || search ? "Try adjusting your filters or search to see more defects." : "All clear! No defects reported."}
              action={(!hasActiveFilters && !search) && (
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
              issues={issues}
              totalRecords={totalRecords}
              lazy={true}
              paginator={true}
              onPage={(e) => setLazyParams(e)}
              first={lazyParams.first}
              rows={lazyParams.rows}
              onRowClick={(issue) => navigate(`/issues/${issue.id}`, { state: { from: location.pathname + location.search } })}
              loading={isLoading}
            />
          )}
        </div>
      ) : (
        <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50">
          {issues.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle />}
              title="Empty Board"
              description={hasActiveFilters || search ? "No defects match your filters or search." : "Your board is currently clean — no defects!"}
            />
          ) : (
            <IssuesKanbanBoard
              issues={issues}
              statuses={statuses}
              onDrop={(issueId: number, newStatus: string) => handleKanbanDrop(issueId, newStatus)}
            />
          )}
        </div>
      )}
    </EntityPageTemplate>
  );
}
