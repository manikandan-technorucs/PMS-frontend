import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { Save } from 'lucide-react';

const notificationCategories = [
  {
    category: 'Projects',
    items: [
      { id: 'proj_created', label: 'New project created', email: true, inApp: true },
      { id: 'proj_updated', label: 'Project status updated', email: true, inApp: true },
      { id: 'proj_assigned', label: 'Assigned to a project', email: true, inApp: true },
      { id: 'proj_milestone', label: 'Milestone achieved', email: false, inApp: true },
    ],
  },
  {
    category: 'Tasks',
    items: [
      { id: 'task_assigned', label: 'Task assigned to me', email: true, inApp: true },
      { id: 'task_updated', label: 'Task status changed', email: false, inApp: true },
      { id: 'task_overdue', label: 'Task is overdue', email: true, inApp: true },
      { id: 'task_completed', label: 'Task marked as complete', email: false, inApp: true },
    ],
  },
  {
    category: 'Issues',
    items: [
      { id: 'issue_created', label: 'New issue reported', email: true, inApp: true },
      { id: 'issue_assigned', label: 'Issue assigned to me', email: true, inApp: true },
      { id: 'issue_updated', label: 'Issue status changed', email: false, inApp: true },
      { id: 'issue_resolved', label: 'Issue resolved', email: false, inApp: true },
    ],
  },
  {
    category: 'Time & Reports',
    items: [
      { id: 'time_reminder', label: 'Daily time log reminder', email: true, inApp: false },
      { id: 'report_generated', label: 'Report generated', email: true, inApp: true },
      { id: 'budget_alert', label: 'Budget threshold alert', email: true, inApp: true },
    ],
  },
];

export function NotificationSettings() {
  const [settings, setSettings] = useState(notificationCategories);

  return (
    <PageLayout
      title="Notification Settings"
      actions={
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Preferences
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
              <Save className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <p className="text-[14px] text-theme-secondary">
              Configure how you receive notifications for different types of events in the system.
            </p>
          </div>
        </Card>

        {settings.map((section, sectionIndex) => (
          <Card key={sectionIndex} title={section.category}>
            <div className="space-y-1">
              <div className="hidden sm:grid sm:grid-cols-3 gap-4 pb-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <div className="col-span-1 text-[12px] font-semibold text-theme-secondary uppercase tracking-wider">
                  Notification Type
                </div>
                <div className="text-center text-[12px] font-semibold text-theme-secondary uppercase tracking-wider">
                  Email
                </div>
                <div className="text-center text-[12px] font-semibold text-theme-secondary uppercase tracking-wider">
                  In-App
                </div>
              </div>

              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4 items-start sm:items-center py-3 rounded-[6px] transition-colors px-2"
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                >
                  <div className="col-span-1 text-[14px] text-theme-primary mb-1 sm:mb-0">
                    {item.label}
                  </div>
                  <div className="flex items-center gap-3 sm:justify-center w-full sm:w-auto pl-1 sm:pl-0">
                    <span className="sm:hidden text-[13px] text-theme-secondary w-16">Email</span>
                    <Checkbox defaultChecked={item.email} />
                  </div>
                  <div className="flex items-center gap-3 sm:justify-center w-full sm:w-auto pl-1 sm:pl-0">
                    <span className="sm:hidden text-[13px] text-theme-secondary w-16">In-App</span>
                    <Checkbox defaultChecked={item.inApp} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        <Card title="Notification Frequency">
          <div className="space-y-4">
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-2 rounded-[6px] transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
            >
              <div>
                <p className="text-[14px] font-medium text-theme-primary">Digest Email</p>
                <p className="text-[12px] text-theme-secondary">Receive a summary of all notifications</p>
              </div>
              <select
                className="h-10 px-3 w-full sm:w-auto min-w-[140px] mt-2 sm:mt-0 rounded-[6px] border text-[14px] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
              >
                <option>Never</option>
                <option>Daily</option>
                <option>Weekly</option>
              </select>
            </div>
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-2 rounded-[6px] transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
            >
              <div>
                <p className="text-[14px] font-medium text-theme-primary">Do Not Disturb</p>
                <p className="text-[12px] text-theme-secondary">Pause all notifications during specific hours</p>
              </div>
              <label className="relative inline-block w-12 h-6 cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-full h-full rounded-full transition-colors" style={{ backgroundColor: 'var(--border-color)' }}></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-6"></div>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
