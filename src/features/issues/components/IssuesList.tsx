import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/context/ToastContext';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { DataTable, Column } from '@/shared/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { Plus, Download, Clock } from 'lucide-react';
import { issuesService, Issue } from '@/features/issues/services/issues.api';
import { timelogsService, TimeLog } from '@/features/timelogs/services/timelogs.api';
import { exportToCSV } from '@/shared/utils/export';

export function IssuesList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [timelogs, setTimelogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);

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
      { key: 'project_id', header: 'Project ID' },
      { key: 'reporter_id', header: 'Reporter ID' },
      { key: 'assignee_id', header: 'Assignee ID' },
      { key: 'status_id', header: 'Status ID' },
      { key: 'priority_id', header: 'Priority ID' },
      { key: 'created_at', header: 'Created At' }
    ];
    exportToCSV(issues, 'issues.csv', exportColumns);
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
      actions={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => navigate('/issues/create')}>
            <Plus className="w-4 h-4 mr-2" />
            New Issue
          </Button>
        </div>
      }
    >
      <Card>
        <DataTable
          columns={columns}
          data={issues}
          selectable
          onRowClick={(issue) => navigate(`/issues/${issue.id}`)}
          itemsPerPage={20}
        />
      </Card>
    </PageLayout>
  );
}
