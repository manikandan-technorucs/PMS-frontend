import React, { useState, useMemo } from 'react';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { Checkbox } from '@/shared/components/ui/Checkbox/Checkbox';
import {
  Save, Search, Users, Shield, Zap, Bug, Layout, Bell, Globe,
  Building, Mail, Key, HelpCircle, Activity, Lock, Target,
  Share2, Smartphone, Clock
} from 'lucide-react';

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

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return settingsCategories;
    return settingsCategories.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery]);

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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="Search settings..."
                className="pl-10 bg-gray-50 border-gray-100 h-10 text-[14px] focus:bg-white focus:border-emerald-200 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredCategories.map((cat, catIdx) => (
              <div key={catIdx} className="mb-2">
                <h3 className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">{cat.title}</h3>
                <div className="space-y-0.5">
                  {cat.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-4 px-6 py-3 transition-all text-left group ${activeSection === item.id
                          ? 'bg-emerald-50 border-r-[3px] border-r-emerald-500'
                          : 'hover:bg-gray-50 border-r-[3px] border-r-transparent'
                        }`}
                    >
                        <div className={`p-2 rounded-lg transition-colors ${activeSection === item.id ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 group-hover:text-gray-600'
                        }`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold ${activeSection === item.id ? 'text-emerald-900' : 'text-gray-700'}`}>
                          {item.label}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.description}</p>
                      </div>
                    </button>
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
              <h1 className="text-[24px] font-bold text-gray-900">{currentItem?.label}</h1>
              <p className="text-[14px] text-gray-500 mt-1">{currentItem?.description}</p>
            </header>

            <div className="animate-in fade-in duration-500">
              {activeSection === 'profile_settings' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600">Full Name</label>
                      <Input defaultValue="Admin User" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600">Public Alias</label>
                      <Input defaultValue="Admin" className="h-11" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600">Profile Bio</label>
                      <Textarea className="min-h-[120px]" placeholder="A few words about yourself..." />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notification_prefs' && (
                <div className="space-y-6">
                  <div className="divide-y divide-theme-border border border-theme-border rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
                    {[
                      { label: 'Project Mentions', desc: 'When someone tags you in a comment' },
                      { label: 'Task Assignments', desc: 'When a new task is assigned to you' },
                      { label: 'Status Updates', desc: 'When project or task status changes' },
                      { label: 'Weekly Reports', desc: 'Summary of your work performance' },
                    ].map((n, i) => (
                      <div key={i} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="text-[14px] font-bold text-gray-900">{n.label}</p>
                          <p className="text-[12px] text-gray-500">{n.desc}</p>
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
                    <label className="text-[13px] font-semibold text-gray-600">Language</label>
                    <Select className="h-11" defaultValue="en">
                      <option value="en">English (United States)</option>
                      <option value="uk">English (United Kingdom)</option>
                      <option value="hi">Hindi</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-gray-600">Date Format</label>
                    <Select className="h-11" defaultValue="ddmmyyyy">
                      <option value="ddmmyyyy">DD-MM-YYYY</option>
                      <option value="mmddyyyy">MM/DD/YYYY</option>
                    </Select>
                  </div>
                </div>
              )}

              {activeSection === 'org_profile' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 p-6 border rounded-2xl bg-gray-50/50">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                      TR
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-gray-900">TechnoRUCS</p>
                      <p className="text-[13px] text-gray-500">Professional Services • Kolkata, India</p>
                      <Button variant="ghost" size="sm" className="mt-2 text-emerald-600 p-0 h-auto hover:bg-transparent">Change Logo</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600">Company Name</label>
                      <Input defaultValue="TechnoRUCS" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600">Primary Timezone</label>
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
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-blue-600">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-blue-900">Microsoft Office 365 Sync</p>
                        <p className="text-[12px] text-blue-700">Connect with Azure AD to import users automatically.</p>
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">Setup Sync</Button>
                  </div>
                  <div className="p-6 border rounded-2xl border-dashed flex flex-col items-center text-center">
                    <Users className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-[14px] font-bold text-gray-900">Manage Users</p>
                    <p className="text-[12px] text-gray-500 mt-1 max-w-[240px]">Go to the Users module to add or invite team members.</p>
                    <Button variant="outline" className="mt-4">Go to Users</Button>
                  </div>
                </div>
              )}

              {activeSection === 'profiles_roles' && (
                <div className="space-y-4">
                  <div className="p-5 border rounded-xl flex items-center justify-between hover:border-emerald-200 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-gray-900">Standard Profiles</p>
                        <p className="text-[11px] text-gray-400">Admin, Manager, Employee roles</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:text-emerald-600">Manage</Button>
                  </div>
                  <div className="p-5 border rounded-xl flex items-center justify-between hover:border-blue-200 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-gray-900">Custom Profiles</p>
                        <p className="text-[11px] text-gray-400">Defined by your organization</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:text-blue-600">Manage</Button>
                  </div>
                </div>
              )}

              {activeSection === 'teams' && (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-[16px] font-bold text-gray-900">Functional Teams</h3>
                  <p className="text-[13px] text-gray-500 mt-1">Departments and teams mapping is done in the Teams module.</p>
                  <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700">View Teams</Button>
                </div>
              )}

              {activeSection === 'workflows' && (
                <div className="space-y-6">
                  <div className="p-8 border-2 border-dashed rounded-3xl text-center">
                    <Zap className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
                    <h3 className="text-[18px] font-bold text-gray-900">Business Automations</h3>
                    <p className="text-[14px] text-gray-500 max-w-sm mx-auto mt-2">Create triggers and actions to automate repetitive tasks across your projects.</p>
                    <div className="flex justify-center gap-3 mt-8">
                      <Button variant="outline">Email Templates</Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100">Create Workflow</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'issue_config' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600">Issue ID Prefix</label>
                      <Input defaultValue="BUG-" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600">Default Severity</label>
                      <Select className="h-11" defaultValue="Medium">
                        <option>Critical</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </Select>
                    </div>
                  </div>
                  <div className="p-6 border rounded-2xl bg-amber-50/50 border-amber-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <p className="text-[14px] font-bold text-amber-900">Custom Fields</p>
                    </div>
                    <p className="text-[12px] text-amber-800">Custom fields for Issue tracking can be defined here to capture specific environment data.</p>
                    <Button variant="outline" size="sm" className="mt-4 border-amber-200 text-amber-700 hover:bg-amber-100">Configure Fields</Button>
                  </div>
                </div>
              )}

              <div className="pt-12 mt-12 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] text-gray-400">
                  <HelpCircle className="w-4 h-4" />
                  <span>Need help configuring this? Visit our Help Center</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="h-10 px-6 font-semibold">Discard</Button>
                  <Button className="h-10 px-8 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100 font-semibold">Save Setup</Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
