import React from 'react';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Checkbox } from '@/shared/components/ui/Checkbox/Checkbox';
import { Save } from 'lucide-react';

export function Settings() {
  return (
    <PageLayout
      title="Settings"
      actions={
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save All Settings
        </Button>
      }
    >
      <div className="space-y-6">
        <Card title="General Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Organization Name"
              defaultValue="TechnoRUCS"
            />
            <Input
              label="Organization Email"
              type="email"
              defaultValue="admin@technorucs.com"
            />
            <Select
              label="Default Language"
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
              ]}
              defaultValue="en"
            />
            <Select
              label="Timezone"
              options={[
                { value: 'UTC', label: 'UTC' },
                { value: 'PST', label: 'Pacific Time (PST)' },
                { value: 'EST', label: 'Eastern Time (EST)' },
                { value: 'IST', label: 'India Standard Time (IST)' },
              ]}
              defaultValue="PST"
            />
            <Select
              label="Date Format"
              options={[
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              ]}
              defaultValue="YYYY-MM-DD"
            />
            <Select
              label="Time Format"
              options={[
                { value: '24h', label: '24-hour' },
                { value: '12h', label: '12-hour' },
              ]}
              defaultValue="24h"
            />
          </div>
        </Card>

        <Card title="Project Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Default Project Duration (days)"
              type="number"
              defaultValue="90"
            />
            <Select
              label="Default Project Status"
              options={[
                { value: 'planning', label: 'Planning' },
                { value: 'active', label: 'Active' },
                { value: 'on-hold', label: 'On Hold' },
              ]}
              defaultValue="planning"
            />
            <div className="col-span-2 space-y-3">
              <Checkbox label="Require approval for project creation" defaultChecked={true} />
              <Checkbox label="Enable budget tracking" defaultChecked={true} />
            </div>
          </div>
        </Card>

        <Card title="Task Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Default Task Duration (hours)"
              type="number"
              defaultValue="8"
            />
            <Select
              label="Task Priority Default"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
              defaultValue="medium"
            />
            <div className="col-span-2 space-y-3">
              <Checkbox label="Send reminder for overdue tasks" defaultChecked={true} />
              <Checkbox label="Auto-assign tasks based on workload" defaultChecked={true} />
            </div>
          </div>
        </Card>

        <Card title="Security Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Session Timeout (minutes)"
              type="number"
              defaultValue="60"
            />
            <Input
              label="Password Expiry (days)"
              type="number"
              defaultValue="90"
            />
            <div className="col-span-2 space-y-3">
              <Checkbox label="Require two-factor authentication" defaultChecked={true} />
              <Checkbox label="Enable activity logging" defaultChecked={true} />
            </div>
          </div>
        </Card>

        <Card title="Integration Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="SMTP Server"
              defaultValue="smtp.company.com"
            />
            <Input
              label="SMTP Port"
              type="number"
              defaultValue="587"
            />
            <Input
              label="SMTP Username"
              defaultValue="noreply@company.com"
            />
            <Input
              label="API Key"
              type="password"
              defaultValue="••••••••••••••••"
            />
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
