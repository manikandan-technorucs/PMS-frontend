import React, { useState } from 'react';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { StatCard } from '@/shared/components/ui/Card/StatCard';
import { Button } from '@/shared/components/ui/Button/Button';
import { DataTable, Column } from '@/shared/components/lists/DataTable/DataTable';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { Plus, Eye, Mail, BarChart3, Tag, FileEdit, ArrowLeft, Save } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  lastModified: string;
  usageCount: number;
}

const initialTemplates: EmailTemplate[] = [
  { id: 'TPL-001', name: 'Task Assignment', subject: 'You have been assigned to {{task_name}}', category: 'Tasks', lastModified: '2026-02-15', usageCount: 245 },
  { id: 'TPL-002', name: 'Issue Created', subject: 'New issue reported: {{issue_title}}', category: 'Issues', lastModified: '2026-02-14', usageCount: 156 },
  { id: 'TPL-003', name: 'Project Status Update', subject: 'Weekly Project Status - {{project_name}}', category: 'Projects', lastModified: '2026-02-10', usageCount: 89 },
  { id: 'TPL-004', name: 'Task Overdue', subject: 'Reminder: {{task_name}} is overdue', category: 'Tasks', lastModified: '2026-02-08', usageCount: 67 },
  { id: 'TPL-005', name: 'Welcome Email', subject: 'Welcome to TechnoRUCS PMS', category: 'System', lastModified: '2026-01-20', usageCount: 23 },
  { id: 'TPL-006', name: 'Password Reset', subject: 'Reset your password', category: 'System', lastModified: '2026-01-15', usageCount: 45 },
];

export function EmailTemplates() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: '', subject: '', category: 'Tasks', body: '' });

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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTemplate: EmailTemplate = {
      id: `TPL-00${templates.length + 1}`,
      name: formData.name,
      subject: formData.subject,
      category: formData.category,
      lastModified: new Date().toISOString().split('T')[0],
      usageCount: 0,
    };
    setTemplates([newTemplate, ...templates]);
    setIsCreating(false);
    setFormData({ name: '', subject: '', category: 'Tasks', body: '' });
  };

  if (isCreating) {
    return (
      <PageLayout
        title="Create Email Template"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Button>
            <Button onClick={handleCreateSubmit}>
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        }
      >
        <Card>
          <form className="space-y-6" onSubmit={handleCreateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-theme-primary">Template Name <span className="text-[#DC2626]">*</span></label>
                <Input required placeholder="e.g. New User Onboarding" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-theme-primary">Category <span className="text-[#DC2626]">*</span></label>
                <Select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="Tasks">Tasks</option>
                  <option value="Projects">Projects</option>
                  <option value="Issues">Issues</option>
                  <option value="System">System</option>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[14px] font-medium text-theme-primary">Subject Line <span className="text-[#DC2626]">*</span></label>
                <Input required placeholder="e.g. Welcome {{user_name}} to PMS" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[14px] font-medium text-theme-primary flex items-center justify-between">
                  <span>Email Body <span className="text-[#DC2626]">*</span></span>
                  <span className="text-[12px] text-theme-muted font-normal">Use {"{{var}}"} for dynamic variables</span>
                </label>
                <Textarea
                  required
                  rows={8}
                  placeholder="Hi {{user_name}},\n\nWelcome to our platform!"
                  value={formData.body}
                  onChange={e => setFormData({ ...formData, body: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button type="submit">Create Template</Button>
            </div>
          </form>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Email Templates"
      actions={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Templates" value={templates.length} icon={<Mail className="w-5 h-5" />} />
          <StatCard label="Total Usage" value={templates.reduce((sum, tpl) => sum + tpl.usageCount, 0)} icon={<BarChart3 className="w-5 h-5" />} />
          <StatCard label="Categories" value={4} icon={<Tag className="w-5 h-5" />} />
          <StatCard label="Custom Templates" value={4} icon={<FileEdit className="w-5 h-5" />} />
        </div>

        <Card>
          <DataTable
            columns={columns}
            data={templates}
            selectable
            itemsPerPage={20}
          />
        </Card>
      </div>
    </PageLayout>
  );
}
