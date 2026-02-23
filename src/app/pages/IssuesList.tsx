import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Plus } from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  project: string;
  reporter: string;
  assignee: string;
  status: string;
  severity: string;
  createdDate: string;
}

const mockIssues: Issue[] = [
  { id: 'ISS-001', title: 'Login authentication fails on mobile', project: 'Mobile App Development', reporter: 'John Doe', assignee: 'Michael Chen', status: 'Open', severity: 'Critical', createdDate: '2026-02-18' },
  { id: 'ISS-002', title: 'Dashboard loading performance issue', project: 'Enterprise Portal Redesign', reporter: 'Jane Smith', assignee: 'Emily Rodriguez', status: 'In Progress', severity: 'High', createdDate: '2026-02-17' },
  { id: 'ISS-003', title: 'API timeout on large data requests', project: 'API Integration Platform', reporter: 'Bob Johnson', assignee: 'David Park', status: 'Open', severity: 'High', createdDate: '2026-02-16' },
  { id: 'ISS-004', title: 'UI misalignment on tablet view', project: 'Customer Portal v2', reporter: 'Alice Brown', assignee: 'Sarah Johnson', status: 'Resolved', severity: 'Medium', createdDate: '2026-02-15' },
  { id: 'ISS-005', title: 'Chart tooltip not displaying', project: 'Data Analytics Dashboard', reporter: 'Charlie Wilson', assignee: 'Lisa Anderson', status: 'In Progress', severity: 'Low', createdDate: '2026-02-14' },
  { id: 'ISS-006', title: 'Security vulnerability in file upload', project: 'Security Enhancement', reporter: 'Diana Lee', assignee: 'Maria Garcia', status: 'Open', severity: 'Critical', createdDate: '2026-02-19' },
  { id: 'ISS-007', title: 'Export function generates corrupt file', project: 'Inventory Management System', reporter: 'Eric Taylor', assignee: 'Robert Taylor', status: 'In Progress', severity: 'Medium', createdDate: '2026-02-13' },
  { id: 'ISS-008', title: 'Email notification not sent', project: 'Cloud Migration Project', reporter: 'Fiona Davis', assignee: 'James Wilson', status: 'Resolved', severity: 'Low', createdDate: '2026-02-12' },
];

export function IssuesList() {
  const navigate = useNavigate();

  const columns: Column<Issue>[] = [
    { key: 'id', header: 'Issue ID', sortable: true },
    { key: 'title', header: 'Title', sortable: true },
    { key: 'project', header: 'Project', sortable: true },
    { key: 'reporter', header: 'Reporter', sortable: true },
    { key: 'assignee', header: 'Assignee', sortable: true },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true,
      render: (value) => <StatusBadge status={value} variant="status" />
    },
    { 
      key: 'severity', 
      header: 'Severity', 
      sortable: true,
      render: (value) => <StatusBadge status={value} variant="priority" />
    },
    { key: 'createdDate', header: 'Created Date', sortable: true },
  ];

  return (
    <PageLayout 
      title="Issues"
      actions={
        <Button onClick={() => navigate('/issues/create')}>
          <Plus className="w-4 h-4 mr-2" />
          New Issue
        </Button>
      }
    >
      <Card>
        <DataTable 
          columns={columns} 
          data={mockIssues}
          selectable
          onRowClick={(issue) => navigate(`/issues/${issue.id}`)}
          itemsPerPage={20}
        />
      </Card>
    </PageLayout>
  );
}
