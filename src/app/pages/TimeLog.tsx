import React from 'react';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DataTable, Column } from '../components/DataTable';
import { Plus } from 'lucide-react';

interface TimeEntry {
  id: string;
  user: string;
  project: string;
  task: string;
  date: string;
  hours: number;
  description: string;
}

const mockTimeEntries: TimeEntry[] = [
  { id: 'TL-001', user: 'Sarah Johnson', project: 'Enterprise Portal Redesign', task: 'Design homepage mockup', date: '2026-02-19', hours: 6.5, description: 'Completed initial mockup designs' },
  { id: 'TL-002', user: 'Michael Chen', project: 'Mobile App Development', task: 'Implement authentication API', date: '2026-02-19', hours: 8.0, description: 'Completed API endpoints and testing' },
  { id: 'TL-003', user: 'Emily Rodriguez', project: 'API Integration Platform', task: 'Database schema optimization', date: '2026-02-18', hours: 5.0, description: 'Optimized queries and indexes' },
  { id: 'TL-004', user: 'David Park', project: 'Cloud Migration Project', task: 'Server setup and configuration', date: '2026-02-18', hours: 7.5, description: 'Configured production servers' },
  { id: 'TL-005', user: 'Lisa Anderson', project: 'Data Analytics Dashboard', task: 'Create data visualization components', date: '2026-02-17', hours: 6.0, description: 'Built chart components' },
  { id: 'TL-006', user: 'James Wilson', project: 'Customer Portal v2', task: 'Performance testing', date: '2026-02-17', hours: 4.5, description: 'Load testing and optimization' },
  { id: 'TL-007', user: 'Maria Garcia', project: 'Security Enhancement', task: 'Security audit', date: '2026-02-16', hours: 8.0, description: 'Comprehensive security review' },
  { id: 'TL-008', user: 'Robert Taylor', project: 'Inventory Management System', task: 'Bug fixes', date: '2026-02-16', hours: 3.0, description: 'Fixed export functionality issues' },
];

export function TimeLog() {
  const columns: Column<TimeEntry>[] = [
    { key: 'id', header: 'Entry ID', sortable: true },
    { key: 'user', header: 'User', sortable: true },
    { key: 'project', header: 'Project', sortable: true },
    { key: 'task', header: 'Task', sortable: true },
    { key: 'date', header: 'Date', sortable: true },
    { 
      key: 'hours', 
      header: 'Hours', 
      sortable: true,
      render: (value) => `${value}h`
    },
    { key: 'description', header: 'Description' },
  ];

  const totalHours = mockTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <PageLayout 
      title="Time Log"
      actions={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Log Time
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Today</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">14.5h</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">This Week</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">{totalHours.toFixed(1)}h</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">This Month</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">168h</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Total Entries</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">{mockTimeEntries.length}</p>
            </div>
          </Card>
        </div>

        <Card>
          <DataTable 
            columns={columns} 
            data={mockTimeEntries}
            selectable
            itemsPerPage={20}
          />
        </Card>
      </div>
    </PageLayout>
  );
}
