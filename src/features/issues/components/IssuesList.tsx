import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/context/ToastContext';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { StatCard } from '@/shared/components/ui/Card/StatCard';
import { TableSkeleton } from '@/shared/components/ui/Skeleton/TableSkeleton';
import { CardSkeleton } from '@/shared/components/ui/Skeleton/CardSkeleton';
import { Button } from '@/shared/components/ui/Button/Button';
import { DataTable, Column } from '@/shared/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { Plus, Download, Filter as FilterIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { issuesService, Issue } from '@/features/issues/services/issues.api';
import { timelogsService, TimeLog } from '@/features/timelogs/services/timelogs.api';
import { exportToCSV } from '@/shared/utils/export';
import { ViewToggle, ViewType } from '@/shared/components/ui/ViewToggle/ViewToggle';
import { IssuesKanbanView } from './IssuesKanbanView';
import { FilterSidebar } from '@/shared/components/ui/FilterSidebar';
import { useStatuses, usePriorities, useUsers } from '@/shared/hooks/useMasterData';
import { useFilters } from '@/shared/hooks/useFilters';

export function IssuesList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [timelogs, setTimelogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewType>('list');
  const {
    showFilters, selectedFilters, openFilters, closeFilters,
    handleFilterChange, clearFilters, hasActiveFilters, isMatch,
  } = useFilters();

  const { data: statuses = [] } = useStatuses();
  const { data: priorities = [] } = usePriorities();
  const { data: allUsers = [] } = useUsers();

  const filterGroups = [
    {
      id: 'status',
      label: 'Status',
      options: statuses.map(s => ({ label: s.name, value: s.id.toString() }))
    },
    {
      id: 'priority',
      label: 'Severity/Priority',
      options: priorities.map(p => ({ label: p.name, value: p.id.toString() }))
    },
    {
      id: 'assignee',
      label: 'Assignee',
      options: allUsers.map(u => ({ label: `${u.first_name} ${u.last_name}`, value: u.id.toString() }))
    }
  ];



  const filteredIssues = useMemo(() => {
    return issues.filter(issue => isMatch({
      status: issue.status_id,
      priority: issue.priority_id,
      assignee: issue.assignee_id,
    }));
  }, [issues, isMatch]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const [issueData, logData] = await Promise.all([
        issuesService.getIssues(0, 500),
        timelogsService.getTimelogs(0, 2000)
      ]);
      setIssues(issueData);
      setTimelogs(logData);
    } catch (error) {
      console.error('Failed to fetch issues', error);
      showToast('error', 'Error', 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportColumns = [
      { key: 'public_id', header: 'Issue ID' },
      { key: 'title', header: 'Issue Title' },
      { key: 'status_id', header: 'Status ID' },
      { key: 'priority_id', header: 'Priority ID' },
      { key: 'created_at', header: 'Created At' }
    ];
    exportToCSV(filteredIssues, 'issues.csv', exportColumns);
  };

  const columns: Column<Issue>[] = [
    {
      key: 'public_id',
      header: 'Issue ID',
      sortable: true,
      render: (_, row) => (
        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-theme-secondary border border-slate-200 dark:border-slate-700">
          {row.public_id || `ISS-${row.id}`}
        </span>
      ),
    },
    { key: 'title', header: 'Issue Title', sortable: true, render: (_, row) => <span className="font-medium text-theme-primary">{row.title}</span> },
    {
      key: 'project',
      header: 'Project',
      sortable: true,
      render: (_, row) => row.project ? row.project.name : 'Unknown'
    },
    {
      key: 'reporter',
      header: 'Reporter',
      sortable: true,
      render: (_, row) => row.reporter ? `${row.reporter.first_name} ${row.reporter.last_name}` : 'Unassigned'
    },
    {
      key: 'assignee',
      header: 'Assignee',
      sortable: true,
      render: (_, row) => row.assignee ? `${row.assignee.first_name} ${row.assignee.last_name}` : 'Unassigned'
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status?.name || 'Unknown'} variant="status" />
    },
    {
      key: 'priority',
      header: 'Severity',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.priority?.name || 'Unknown'} variant="priority" />
    },
    {
      key: 'hours',
      header: 'Hours',
      render: (_, row) => {
        const actual = timelogs.filter(l => l.issue_id === row.id).reduce((sum, l) => sum + l.hours, 0);
        return (
          <div className="flex items-center gap-1 text-[13px]">
            <span className="font-semibold text-[#14b8a6]">{actual.toFixed(1)}h</span>
            <span className="text-[#6B7280]">/ {row.estimated_hours || 0}h</span>
          </div>
        );
      }
    },
    {
      key: 'end_date',
      header: 'Deadline',
      sortable: true,
      render: (_, row) => {
        if (!row.end_date) return <span className="text-[#6B7280]">No deadline</span>;
        const diff = new Date(row.end_date).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        const text = days >= 0 ? `${days} days left` : `${Math.abs(days)} days overdue`;
        const color = days >= 0 ? 'text-[#3B82F6]' : 'text-red-500';
        return (
          <div>
            <p>{row.end_date}</p>
            <p className={`text-[12px] mt-0.5 ${color}`}>{text}</p>
          </div>
        );
      }
    },
    {
      key: 'created_at',
      header: 'Created Date',
      sortable: true,
      render: (_, row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'
    },
  ];

  return (
    <PageLayout
      title="Issues"
      isFullHeight
      actions={
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <ViewToggle view={view} onViewChange={setView} />

          <div className="h-8 w-[1px] bg-gray-200 hidden sm:block mx-1" />

          <Button variant="outline" onClick={openFilters} className={hasActiveFilters ? 'border-brand-teal-500 bg-brand-teal-50 text-brand-teal-700' : ''}>
            <FilterIcon className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} title="Export CSV">
              <Download className="w-4 h-4" />
            </Button>
            <Button onClick={() => navigate('/issues/create')} variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><CardSkeleton count={4} /></div>
          <TableSkeleton rows={6} columns={5} />
        </div>
      ) : (
        <div className="h-full flex flex-col overflow-hidden space-y-6">
          {/* Issue Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
            <StatCard
              label="Overall Issues"
              value={issues.length}
              icon={<AlertCircle className="w-5 h-5 text-gray-500" />}
              accent={false}
              className="bg-white border hover:shadow-md transition-shadow"
            />
            <StatCard
              label="Completed"
              value={issues.filter(i => i.status?.name?.toLowerCase() === 'completed' || i.status?.name?.toLowerCase() === 'closed').length}
              icon={<CheckCircle className="w-5 h-5 text-brand-teal-600" />}
              className="bg-white border border-t-brand-teal-500 hover:shadow-md transition-shadow"
            />
            <StatCard
              label="In Progress"
              value={issues.filter(i => i.status?.name?.toLowerCase() === 'in progress' || i.status?.name?.toLowerCase() === 'open').length}
              icon={<Clock className="w-5 h-5 text-blue-600" />}
              className="bg-white border border-t-blue-500 hover:shadow-md transition-shadow"
            />
            <StatCard
              label="Pending"
              value={issues.filter(i => !['completed', 'closed', 'in progress', 'open'].includes(i.status?.name?.toLowerCase() || '')).length}
              icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
              className="bg-white border border-t-amber-500 hover:shadow-md transition-shadow"
            />
          </div>

          {view === 'list' ? (
            <div className="flex-1 overflow-auto bg-white rounded-xl border shadow-sm">
              <DataTable
                columns={columns}
                data={filteredIssues}
                selectable
                onRowClick={(issue) => navigate(`/issues/${issue.id}`)}
                itemsPerPage={10}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <IssuesKanbanView issues={filteredIssues} onUpdate={fetchIssues} />
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
