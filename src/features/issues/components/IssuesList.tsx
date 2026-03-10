import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/context/ToastContext';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { DataTable, Column } from '@/shared/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { Plus, Download, Filter as FilterIcon } from 'lucide-react';
import { issuesService, Issue } from '@/features/issues/services/issues.api';
import { timelogsService, TimeLog } from '@/features/timelogs/services/timelogs.api';
import { exportToCSV } from '@/shared/utils/export';
import { ViewToggle, ViewType } from '@/shared/components/ui/ViewToggle/ViewToggle';
import { IssuesKanbanView } from './IssuesKanbanView';
import { FilterSidebar } from '@/shared/components/ui/FilterSidebar';
import { useStatuses, usePriorities, useUsers } from '@/shared/hooks/useMasterData';

export function IssuesList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [timelogs, setTimelogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewType>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

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

  const handleFilterChange = (groupId: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[groupId] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [groupId]: updated };
    });
  };

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const statusMatch = !selectedFilters.status?.length || selectedFilters.status.includes(issue.status_id?.toString() || '');
      const priorityMatch = !selectedFilters.priority?.length || selectedFilters.priority.includes(issue.priority_id?.toString() || '');
      const assigneeMatch = !selectedFilters.assignee?.length || selectedFilters.assignee.includes(issue.assignee_id?.toString() || '');
      return statusMatch && priorityMatch && assigneeMatch;
    });
  }, [issues, selectedFilters]);

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
    { key: 'public_id', header: 'Issue ID', sortable: true },
    { key: 'title', header: 'Title', sortable: true },
    {
      key: 'project',
      header: 'Project',
      sortable: true,
      render: (_, row) => row.project ? row.project.name : 'Unassigned'
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
            <span className="font-semibold text-[#059669]">{actual.toFixed(1)}h</span>
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

          <Button variant="outline" onClick={() => setShowFilters(true)} className={Object.keys(selectedFilters).some(k => selectedFilters[k].length > 0) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}>
            <FilterIcon className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/issues/create')}>
            <Plus className="w-4 h-4 mr-2" />
            New Issue
          </Button>
        </div>
      }
    >
      <div className="h-full flex flex-col overflow-hidden">
        {view === 'list' ? (
          <div className="flex-1 overflow-auto bg-white rounded-lg border shadow-sm">
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

      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        groups={filterGroups}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClear={() => setSelectedFilters({})}
      />
    </PageLayout>
  );
}
