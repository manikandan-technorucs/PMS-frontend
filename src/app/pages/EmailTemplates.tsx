import React from 'react';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DataTable, Column } from '../components/DataTable';
import { Plus, Eye } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  lastModified: string;
  usageCount: number;
}

const mockTemplates: EmailTemplate[] = [
  { id: 'TPL-001', name: 'Task Assignment', subject: 'You have been assigned to {{task_name}}', category: 'Tasks', lastModified: '2026-02-15', usageCount: 245 },
  { id: 'TPL-002', name: 'Issue Created', subject: 'New issue reported: {{issue_title}}', category: 'Issues', lastModified: '2026-02-14', usageCount: 156 },
  { id: 'TPL-003', name: 'Project Status Update', subject: 'Weekly Project Status - {{project_name}}', category: 'Projects', lastModified: '2026-02-10', usageCount: 89 },
  { id: 'TPL-004', name: 'Task Overdue', subject: 'Reminder: {{task_name}} is overdue', category: 'Tasks', lastModified: '2026-02-08', usageCount: 67 },
  { id: 'TPL-005', name: 'Welcome Email', subject: 'Welcome to TechnoRUCS PMS', category: 'System', lastModified: '2026-01-20', usageCount: 23 },
  { id: 'TPL-006', name: 'Password Reset', subject: 'Reset your password', category: 'System', lastModified: '2026-01-15', usageCount: 45 },
];

export function EmailTemplates() {
  const columns: Column<EmailTemplate>[] = [
    { key: 'id', header: 'Template ID', sortable: true },
    { key: 'name', header: 'Template Name', sortable: true },
    { key: 'subject', header: 'Subject Line', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'lastModified', header: 'Last Modified', sortable: true },
    { key: 'usageCount', header: 'Usage Count', sortable: true },
    {
      key: 'id',
      header: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout 
      title="Email Templates"
      actions={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Total Templates</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">{mockTemplates.length}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Total Usage</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">
                {mockTemplates.reduce((sum, tpl) => sum + tpl.usageCount, 0)}
              </p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Categories</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">4</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Custom Templates</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">4</p>
            </div>
          </Card>
        </div>

        <Card>
          <DataTable 
            columns={columns} 
            data={mockTemplates}
            selectable
            itemsPerPage={20}
          />
        </Card>
      </div>
    </PageLayout>
  );
}
