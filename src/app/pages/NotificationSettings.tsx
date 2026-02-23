import React, { useState } from 'react';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
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
          <p className="text-[14px] text-[#6B7280] mb-4">
            Configure how you receive notifications for different types of events in the system.
          </p>
        </Card>

        {settings.map((section, sectionIndex) => (
          <Card key={sectionIndex} title={section.category}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 pb-3 border-b border-[#E5E7EB]">
                <div className="col-span-1 text-[12px] font-semibold text-[#6B7280]">
                  Notification Type
                </div>
                <div className="text-center text-[12px] font-semibold text-[#6B7280]">
                  Email
                </div>
                <div className="text-center text-[12px] font-semibold text-[#6B7280]">
                  In-App
                </div>
              </div>

              {section.items.map((item) => (
                <div key={item.id} className="grid grid-cols-3 gap-4 items-center py-2">
                  <div className="col-span-1 text-[14px] text-[#1F2937]">
                    {item.label}
                  </div>
                  <div className="flex justify-center">
                    <input 
                      type="checkbox" 
                      defaultChecked={item.email}
                      className="w-4 h-4 rounded border-[#E5E7EB]"
                    />
                  </div>
                  <div className="flex justify-center">
                    <input 
                      type="checkbox" 
                      defaultChecked={item.inApp}
                      className="w-4 h-4 rounded border-[#E5E7EB]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        <Card title="Notification Frequency">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[14px] font-medium text-[#1F2937]">Digest Email</p>
                <p className="text-[12px] text-[#6B7280]">Receive a summary of all notifications</p>
              </div>
              <select className="h-10 px-3 rounded-[6px] border border-[#E5E7EB] bg-white text-[14px]">
                <option>Never</option>
                <option>Daily</option>
                <option>Weekly</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[14px] font-medium text-[#1F2937]">Do Not Disturb</p>
                <p className="text-[12px] text-[#6B7280]">Pause all notifications during specific hours</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-full h-full bg-[#E5E7EB] rounded-full peer-checked:bg-[#2563EB] transition-colors"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
