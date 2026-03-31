import React, { useState, useMemo } from 'react';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from 'primereact/button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import {
  Save, Search, Users, Shield, Zap, Bug, Layout, Bell, Globe,
  Building, Mail, Key, HelpCircle, Activity, Lock, Target,
  Share2, Smartphone, Clock
} from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { settingsTabs } from '@/utils/permissions';

const settingsCategories = [
  {
    title: 'Personal Settings',
    items: [
      { id: 'profile_settings', label: 'Personal Information', icon: Users, description: 'Manage your name, alias and bio' },
      { id: 'notification_prefs', label: 'Notifications', icon: Bell, description: 'Set your email and desktop alerts' },
      { id: 'localization', label: 'Localization', icon: Globe, description: 'Language, date and time formats' },
    ]
  },
  {
    title: 'Organization',
    items: [
      { id: 'org_profile', label: 'Company Profile', icon: Building, description: 'Branding and basic organization info' },
    ]
  },
  {
    title: 'User Management',
    items: [
      { id: 'users_sync', label: 'Users & Sync', icon: Users, description: 'Manage team and sync O365' },
      { id: 'profiles_roles', label: 'Profiles & Roles', icon: Shield, description: 'Granular permissions and roles' },
      { id: 'teams', label: 'Teams', icon: Target, description: 'Group users into functional teams' },
    ]
  },
  {
    title: 'Customization',
    items: [
      { id: 'workflows', label: 'Automations', icon: Zap, description: 'Triggered actions and notifications' },
      { id: 'issue_config', label: 'Issue Tracker', icon: Bug, description: 'Prefixes and custom fields' },
    ]
  }
];

export function Settings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('profile_settings');

  const { user } = useAuth();
  const userRole = user?.role?.name;

  const filteredCategories = useMemo(() => {
    return settingsCategories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => {
        // Evaluate role permission for this item
        // e.g., settingsTabs[item.id](userRole) 
        // We'll write a simple lookup switch or just use the mapped item.id
        let hasAccess = true;
        if (item.id === 'org_profile') hasAccess = settingsTabs.organization(userRole);
        else if (item.id === 'users_sync') hasAccess = settingsTabs.users(userRole);
        else if (item.id === 'profiles_roles') hasAccess = settingsTabs.security(userRole);
        else if (item.id === 'teams') hasAccess = settingsTabs.users(userRole);
        else if (item.id === 'workflows') hasAccess = settingsTabs.organization(userRole);
        else if (item.id === 'issue_config') hasAccess = settingsTabs.organization(userRole);

        if (!hasAccess) return false;

        // Apply search query filter
        if (!searchQuery) return true;
        return item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.description.toLowerCase().includes(searchQuery.toLowerCase());
      })
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery, userRole]);

  const findItem = (id: string) => {
    for (const cat of settingsCategories) {
      const item = cat.items.find(i => i.id === id);
      if (item) return item;
    }
    return null;
  };

  const currentItem = findItem(activeSection);

  return (
    <PageLayout title="Setup" isFullHeight>
      <div className="flex h-full card-base rounded-lg overflow-hidden shadow-sm">
        {/* ─── SEARCHABLE SIDEBAR ─── */}
        <aside className="w-[320px] border-r border-theme-border flex flex-col bg-transparent">
          <div className="p-6 border-b border-theme-border">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-brand-teal-500 transition-colors" />
              <Input
                placeholder="Search settings..."
                className="pl-10 bg-theme-neutral border-theme-border h-10 text-[14px] focus:bg-theme-surface focus:border-brand-teal-500 transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredCategories.map((cat, catIdx) => (
              <div key={catIdx} className="mb-2">
                <h3 className="px-6 py-3 text-[11px] font-bold text-theme-muted uppercase tracking-widest">{cat.title}</h3>
                <div className="space-y-0.5">
                  {cat.items.map((item) => (
                    <Button unstyled 
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-4 px-6 py-3 transition-all text-left group ${activeSection === item.id
                          ? 'bg-brand-teal-50 dark:bg-brand-teal-900/20 border-r-[3px] border-r-brand-teal-500 shadow-inner dark:shadow-none'
                          : 'hover:bg-theme-neutral border-r-[3px] border-r-transparent'
                        }`}
                    >
                        <div className={`p-2 rounded-lg transition-colors ${activeSection === item.id ? 'bg-theme-surface shadow-sm text-brand-teal-600' : 'bg-theme-neutral text-theme-muted group-hover:text-theme-secondary'
                        }`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-bold ${activeSection === item.id ? 'text-brand-teal-700 dark:text-brand-teal-400' : 'text-theme-primary'}`}>
                          {item.label}
                        </p>
                        <p className="text-[11px] text-theme-muted truncate mt-0.5">{item.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 bg-transparent overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-4xl w-full mx-auto">
            <header className="mb-10">
              <h1 className="text-[28px] font-bold text-theme-primary tracking-tight">{currentItem?.label}</h1>
              <p className="text-[14px] text-theme-secondary mt-1">{currentItem?.description}</p>
            </header>

            <div className="animate-in fade-in duration-500">
              {activeSection === 'profile_settings' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-theme-secondary uppercase tracking-wider">Full Name</label>
                      <Input defaultValue="Admin User" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-theme-secondary uppercase tracking-wider">Public Alias</label>
                      <Input defaultValue="Admin" className="h-11" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[13px] font-bold text-theme-secondary uppercase tracking-wider">Profile Bio</label>
                      <Textarea className="min-h-[120px]" placeholder="A few words about yourself..." />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notification_prefs' && (
                <div className="space-y-6">
                  <div className="divide-y divide-theme-border border border-theme-border rounded-xl overflow-hidden shadow-sm bg-theme-surface">
                    {[
                      { label: 'Project Mentions', desc: 'When someone tags you in a comment' },
                      { label: 'Task Assignments', desc: 'When a new task is assigned to you' },
                      { label: 'Status Updates', desc: 'When project or task status changes' },
                      { label: 'Weekly Reports', desc: 'Summary of your work performance' },
                    ].map((n, i) => (
                      <div key={i} className="p-5 flex items-center justify-between hover:bg-theme-neutral transition-colors">
                        <div>
                          <p className="text-[14px] font-bold text-theme-primary">{n.label}</p>
                          <p className="text-[12px] text-theme-secondary">{n.desc}</p>
                        </div>
                        <Checkbox defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'localization' && (
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-theme-secondary uppercase tracking-wider">Language</label>
                    <Select className="h-11" defaultValue="en">
                      <option value="en">English (United States)</option>
                      <option value="uk">English (United Kingdom)</option>
                      <option value="hi">Hindi</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-theme-secondary uppercase tracking-wider">Date Format</label>
                    <Select className="h-11" defaultValue="ddmmyyyy">
                      <option value="ddmmyyyy">DD-MM-YYYY</option>
                      <option value="mmddyyyy">MM/DD/YYYY</option>
                    </Select>
                  </div>
                </div>
              )}

              {activeSection === 'org_profile' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 p-6 border border-theme-border rounded-2xl bg-theme-neutral">
                    <div className="w-20 h-20 rounded-2xl bg-brand-teal-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                      TR
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-theme-primary">TechnoRUCS</p>
                      <p className="text-[13px] text-theme-secondary">Professional Services • Kolkata, India</p>
                      <Button text  className="mt-2 text-brand-teal-600 p-0 h-auto hover:bg-transparent">Change Logo</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-theme-secondary uppercase tracking-wider">Company Name</label>
                      <Input defaultValue="TechnoRUCS" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-theme-secondary uppercase tracking-wider">Primary Timezone</label>
                      <Select className="h-11" defaultValue="IST">
                        <option value="IST">India Standard Time (IST)</option>
                        <option value="EST">Eastern Standard Time (EST)</option>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'users_sync' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-6 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-theme-surface rounded-xl shadow-sm text-blue-600 dark:text-blue-400">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-blue-900 dark:text-blue-200">Microsoft Office 365 Sync</p>
                        <p className="text-[12px] text-blue-700 dark:text-blue-400">Connect with Azure AD to import users automatically.</p>
                      </div>
                    </div>
                    <Button className="btn-gradient">Setup Sync</Button>
                  </div>
                  <div className="p-6 border border-theme-border rounded-2xl border-dashed flex flex-col items-center text-center">
                    <Users className="w-8 h-8 text-theme-muted mb-2" />
                    <p className="text-[14px] font-bold text-theme-primary">Manage Users</p>
                    <p className="text-[12px] text-theme-secondary mt-1 max-w-[240px]">Go to the Users module to add or invite team members.</p>
                    <Button outlined className="mt-4">Go to Users</Button>
                  </div>
                </div>
              )}

              {activeSection === 'profiles_roles' && (
                <div className="space-y-4">
                  <div className="p-5 border border-theme-border rounded-xl flex items-center justify-between hover:border-brand-teal-500/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-brand-teal-50 dark:bg-brand-teal-900/20 text-brand-teal-600 rounded-lg">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-theme-primary">Standard Profiles</p>
                        <p className="text-[11px] text-theme-muted">Admin, Manager, Employee roles</p>
                      </div>
                    </div>
                    <Button text  className="group-hover:text-brand-teal-600">Manage</Button>
                  </div>
                  <div className="p-5 border border-theme-border rounded-xl flex items-center justify-between hover:border-blue-500/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-theme-primary">Custom Profiles</p>
                        <p className="text-[11px] text-theme-muted">Defined by your organization</p>
                      </div>
                    </div>
                    <Button text  className="group-hover:text-blue-600">Manage</Button>
                  </div>
                </div>
              )}

              {activeSection === 'teams' && (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-theme-muted/30 mx-auto mb-4" />
                  <h3 className="text-[16px] font-bold text-theme-primary">Functional Teams</h3>
                  <p className="text-[13px] text-theme-secondary mt-1">Departments and teams mapping is done in the Teams module.</p>
                  <Button className="btn-gradient">View Teams</Button>
                </div>
              )}

              {activeSection === 'workflows' && (
                <div className="space-y-6">
                  <div className="p-8 border-2 border-dashed border-theme-border rounded-3xl text-center">
                    <Zap className="w-12 h-12 text-brand-teal-500/30 mx-auto mb-4" />
                    <h3 className="text-[18px] font-bold text-theme-primary">Business Automations</h3>
                    <p className="text-[14px] text-theme-secondary max-w-sm mx-auto mt-2">Create triggers and actions to automate repetitive tasks across your projects.</p>
                    <div className="flex justify-center gap-3 mt-8">
                      <Button outlined>Email Templates</Button>
                      <Button className="btn-gradient">Create Workflow</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'issue_config' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-theme-secondary uppercase tracking-wider">Issue ID Prefix</label>
                      <Input defaultValue="BUG-" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-theme-secondary uppercase tracking-wider">Default Severity</label>
                      <Select className="h-11" defaultValue="Medium">
                        <option>Critical</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </Select>
                    </div>
                  </div>
                  <div className="p-6 border rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <p className="text-[14px] font-bold text-amber-900 dark:text-amber-200">Custom Fields</p>
                    </div>
                    <p className="text-[12px] text-amber-800 dark:text-amber-400">Custom fields for Issue tracking can be defined here to capture specific environment data.</p>
                    <Button outlined  className="mt-4 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30">Configure Fields</Button>
                  </div>
                </div>
              )}

              <div className="pt-12 mt-12 border-t border-theme-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] text-theme-muted">
                  <HelpCircle className="w-4 h-4" />
                  <span>Need help configuring this? Visit our Help Center</span>
                </div>
                <div className="flex gap-3">
                  <Button outlined className="h-10 px-6 font-bold uppercase tracking-wider text-[12px]">Discard</Button>
                  <Button className="btn-gradient">Save Setup</Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
