import React from 'react';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Plus } from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: string;
  lastRun: string;
  executionCount: number;
}

const mockRules: AutomationRule[] = [
  { id: 'AUTO-001', name: 'Task Assignment Notification', trigger: 'Task Assigned', action: 'Send Email', status: 'Active', lastRun: '2026-02-19 14:30', executionCount: 245 },
  { id: 'AUTO-002', name: 'Issue Escalation', trigger: 'Issue Critical + 2 Hours', action: 'Notify Manager', status: 'Active', lastRun: '2026-02-19 13:15', executionCount: 12 },
  { id: 'AUTO-003', name: 'Project Status Report', trigger: 'Weekly Monday 9AM', action: 'Generate Report', status: 'Active', lastRun: '2026-02-17 09:00', executionCount: 52 },
  { id: 'AUTO-004', name: 'Overdue Task Reminder', trigger: 'Task Overdue', action: 'Send Reminder', status: 'Active', lastRun: '2026-02-19 08:00', executionCount: 89 },
  { id: 'AUTO-005', name: 'Time Log Validation', trigger: 'Daily 5PM', action: 'Validate Logs', status: 'Active', lastRun: '2026-02-18 17:00', executionCount: 156 },
  { id: 'AUTO-006', name: 'Budget Alert', trigger: 'Budget > 80%', action: 'Alert PM', status: 'Pending', lastRun: 'Never', executionCount: 0 },
];

export function Automation() {
  const columns: Column<AutomationRule>[] = [
    { key: 'id', header: 'Rule ID', sortable: true },
    { key: 'name', header: 'Rule Name', sortable: true },
    { key: 'trigger', header: 'Trigger', sortable: true },
    { key: 'action', header: 'Action', sortable: true },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true,
      render: (value) => <StatusBadge status={value} variant="status" />
    },
    { key: 'lastRun', header: 'Last Run', sortable: true },
    { key: 'executionCount', header: 'Executions', sortable: true },
  ];

  return (
    <PageLayout 
      title="Automation Rules"
      actions={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Total Rules</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">{mockRules.length}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Active Rules</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">
                {mockRules.filter(r => r.status === 'Active').length}
              </p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Total Executions</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">
                {mockRules.reduce((sum, rule) => sum + rule.executionCount, 0)}
              </p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Last Execution</p>
              <p className="text-[14px] font-medium text-[#1F2937]">2 minutes ago</p>
            </div>
          </Card>
        </div>

        <Card>
          <DataTable 
            columns={columns} 
            data={mockRules}
            selectable
            itemsPerPage={20}
          />
        </Card>
      </div>
    </PageLayout>
  );
}
