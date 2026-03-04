import React, { useState } from 'react';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { StatCard } from '@/shared/components/ui/Card/StatCard';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { Checkbox } from '@/shared/components/ui/Checkbox/Checkbox';
import {
    User, Mail, Phone, MapPin, Building, Calendar, Shield,
    Camera, Save, Key, Bell, Clock, Globe, Edit,
    FolderKanban, CheckCircle, TrendingUp, Award,
    Monitor, Smartphone, Laptop, LogOut, Link2, Github, Linkedin,
    Star, Briefcase, Hash, AlertCircle, FileText, MessageSquare, Upload
} from 'lucide-react';

export function Profile() {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        { id: 'security', label: 'Security', icon: <Key className="w-4 h-4" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { id: 'activity', label: 'Activity Log', icon: <Clock className="w-4 h-4" /> },
    ];

    const skills = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'GraphQL'];

    const activityData = [
        { action: 'Updated project', target: 'Enterprise Portal Redesign', time: '10 minutes ago', color: '#059669', icon: <Edit className="w-3.5 h-3.5" /> },
        { action: 'Completed task', target: 'Implement navigation component', time: '1 hour ago', color: '#059669', icon: <CheckCircle className="w-3.5 h-3.5" /> },
        { action: 'Created issue', target: 'Dashboard loading performance', time: '2 hours ago', color: '#D97706', icon: <AlertCircle className="w-3.5 h-3.5" /> },
        { action: 'Commented on', target: 'API Integration Platform', time: '3 hours ago', color: '#3B82F6', icon: <MessageSquare className="w-3.5 h-3.5" /> },
        { action: 'Assigned task', target: 'User authentication module', time: '5 hours ago', color: '#7C3AED', icon: <User className="w-3.5 h-3.5" /> },
        { action: 'Updated milestone', target: 'Phase 2: Core Development', time: 'Yesterday', color: '#059669', icon: <Star className="w-3.5 h-3.5" /> },
        { action: 'Uploaded document', target: 'Technical Architecture.docx', time: 'Yesterday', color: '#0284C7', icon: <Upload className="w-3.5 h-3.5" /> },
        { action: 'Resolved issue', target: 'Form validation error messages', time: '2 days ago', color: '#059669', icon: <CheckCircle className="w-3.5 h-3.5" /> },
        { action: 'Created project', target: 'Mobile App Development', time: '3 days ago', color: '#7C3AED', icon: <FolderKanban className="w-3.5 h-3.5" /> },
        { action: 'Updated permissions', target: 'Developer role', time: '4 days ago', color: '#D97706', icon: <Shield className="w-3.5 h-3.5" /> },
    ];

    return (
        <PageLayout
            title="My Profile"
            actions={
                <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            }
        >
            <div className="space-y-6">
                {/* ─── PROFILE HEADER HERO ─── */}
                <div className="card-base border rounded-[6px] overflow-hidden shadow-sm">
                    {/* Green gradient banner with pattern */}
                    <div className="h-40 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#047857] via-[#059669] to-[#34D399]" />
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }} />
                        {/* Decorative circles */}
                        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
                        <div className="absolute -top-6 -right-16 w-32 h-32 rounded-full bg-white/5" />
                        <div className="absolute top-4 left-1/3 w-20 h-20 rounded-full bg-white/5" />
                    </div>

                    <div className="px-4 pb-6 sm:px-8">
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 -mt-14 items-center text-center lg:text-left">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 flex-1 min-w-0 w-full sm:w-auto">
                                {/* Avatar */}
                                <div className="relative group flex-shrink-0">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[#047857] to-[#34D399] rounded-full flex items-center justify-center border-4 border-[var(--card-bg)] shadow-xl ring-4 ring-[#059669]/20">
                                        <span className="text-white text-3xl font-bold select-none">AU</span>
                                    </div>
                                    <button className="absolute bottom-1 right-1 w-8 h-8 sm:w-9 sm:h-9 card-base border-2 border-[var(--border-color)] rounded-full flex items-center justify-center shadow-md hover:bg-[#059669]/10 hover:border-[#059669] transition-all group-hover:scale-110">
                                        <Camera className="w-4 h-4 text-theme-secondary group-hover:text-[#059669]" />
                                    </button>
                                </div>

                                {/* Name, role & social */}
                                <div className="pb-1 min-w-0 w-full flex flex-col items-center sm:items-start text-center sm:text-left">
                                    <div className="flex items-center gap-3 mb-1 justify-center sm:justify-start">
                                        <h2 className="text-[20px] sm:text-[24px] font-bold text-theme-primary truncate">Admin User</h2>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#059669]/10 text-[#059669] text-[11px] font-bold rounded-full border border-[#059669]/30 uppercase tracking-wider flex-shrink-0">
                                            <Shield className="w-3 h-3" />
                                            Admin
                                        </span>
                                    </div>
                                    <p className="text-[14px] sm:text-[15px] text-theme-secondary mb-2 truncate">System Administrator · Engineering Department</p>
                                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 sm:gap-4">
                                        <span className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-theme-secondary whitespace-nowrap">
                                            <MapPin className="w-3.5 h-3.5" /> San Francisco, CA
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-theme-secondary whitespace-nowrap">
                                            <Mail className="w-3.5 h-3.5" /> admin@technorucs.com
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-theme-secondary whitespace-nowrap">
                                            <Calendar className="w-3.5 h-3.5" /> Joined Jan 2025
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats cards */}
                            <div className="grid grid-cols-2 lg:flex gap-3 sm:gap-4 pb-2 w-full lg:w-auto mt-4 lg:mt-0 flex-shrink-0">
                                {[
                                    { value: '24', label: 'Projects', icon: <FolderKanban className="w-4 h-4" />, color: '#059669' },
                                    { value: '156', label: 'Tasks', icon: <CheckCircle className="w-4 h-4" />, color: '#0284C7' },
                                    { value: '98%', label: 'Completion', icon: <TrendingUp className="w-4 h-4" />, color: '#059669' },
                                    { value: '4.9', label: 'Rating', icon: <Star className="w-4 h-4" />, color: '#D97706' },
                                ].map((stat, idx) => (
                                    <div key={idx} className="text-center p-3 rounded-[8px] border transition-all cursor-default bg-secondary hover:border-[#059669]/50 w-full min-w-[100px]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                                        <div className="flex justify-center mb-1" style={{ color: stat.color }}>{stat.icon}</div>
                                        <p className="text-[18px] font-bold text-theme-primary">{stat.value}</p>
                                        <p className="text-[10px] text-theme-secondary uppercase tracking-wider font-semibold">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── TABS ─── */}
                <div className="card-base border rounded-[6px] px-2">
                    <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3.5 text-[14px] font-medium transition-all border-b-2 rounded-t-[4px] ${activeTab === tab.id
                                    ? 'text-[#059669] border-[#059669] bg-[#059669]/10'
                                    : 'text-theme-secondary border-transparent hover:text-theme-primary hover:bg-[var(--bg-hover-neutral)]'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── PROFILE TAB ─── */}
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-6">
                            {/* Personal Information */}
                            <div className="card-base border rounded-[6px] border-l-[3px] border-l-[#059669] overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-color border-[var(--border-color)] ">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-[8px] bg-[#059669]/10 flex items-center justify-center text-[#059669] shadow-sm">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-[16px] font-semibold text-theme-primary">Personal Information</h3>
                                            <p className="text-[12px] text-theme-muted">Your personal details and contact information</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">First Name</label>
                                            <Input defaultValue="Admin" />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">Last Name</label>
                                            <Input defaultValue="User" />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">Email Address</label>
                                            <Input type="email" defaultValue="admin@technorucs.com" />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">Phone Number</label>
                                            <Input type="tel" defaultValue="+1 (555) 123-4567" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">Bio</label>
                                            <Textarea
                                                defaultValue="Experienced project manager with over 8 years of expertise in enterprise software development, team leadership, and Agile methodologies. Passionate about delivering high-quality solutions."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Work Information */}
                            <div className="card-base border rounded-[6px] border-l-[3px] border-l-[#059669] overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-color border-[var(--border-color)] ">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-[8px] bg-[#059669]/10 flex items-center justify-center text-[#059669] shadow-sm">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-[16px] font-semibold text-theme-primary">Work Information</h3>
                                            <p className="text-[12px] text-theme-muted">Your professional details and preferences</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">Job Title</label>
                                            <Input defaultValue="System Administrator" />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">Department</label>
                                            <Select defaultValue="engineering">
                                                <option value="engineering">Engineering</option>
                                                <option value="design">Design</option>
                                                <option value="marketing">Marketing</option>
                                                <option value="management">Management</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">Office Location</label>
                                            <Input defaultValue="San Francisco, CA" />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">Timezone</label>
                                            <Select defaultValue="pst">
                                                <option value="pst">Pacific Time (PST)</option>
                                                <option value="est">Eastern Time (EST)</option>
                                                <option value="cst">Central Time (CST)</option>
                                                <option value="ist">India Standard Time (IST)</option>
                                                <option value="utc">UTC</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">Employee ID</label>
                                            <Input defaultValue="EMP-001" disabled />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">Reports To</label>
                                            <Input defaultValue="CEO" disabled />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="card-base border rounded-[6px] border-l-[3px] border-l-[#059669] overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-color border-[var(--border-color)] ">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-[8px] bg-[#059669]/10 flex items-center justify-center text-[#059669] shadow-sm">
                                            <Link2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-[16px] font-semibold text-theme-primary">Social & Links</h3>
                                            <p className="text-[12px] text-theme-muted">Connect your accounts and add portfolio links</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="flex items-center gap-2 text-[13px] font-medium text-theme-primary mb-1.5">
                                                <Github className="w-4 h-4 text-theme-primary" /> GitHub
                                            </label>
                                            <Input placeholder="github.com/username" defaultValue="github.com/adminuser" />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-[13px] font-medium text-theme-primary mb-1.5">
                                                <Linkedin className="w-4 h-4 text-[#0A66C2]" /> LinkedIn
                                            </label>
                                            <Input placeholder="linkedin.com/in/username" defaultValue="linkedin.com/in/adminuser" />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-[13px] font-medium text-theme-primary mb-1.5">
                                                <Globe className="w-4 h-4 text-[#059669]" /> Website
                                            </label>
                                            <Input placeholder="https://yourportfolio.com" defaultValue="https://adminuser.dev" />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-[13px] font-medium text-theme-primary mb-1.5">
                                                <MessageSquare className="w-4 h-4 text-[#6366F1]" /> Slack Username
                                            </label>
                                            <Input placeholder="@username" defaultValue="@admin.user" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="space-y-6">
                            {/* Contact Card */}
                            <div className="card-base border rounded-[6px] overflow-hidden shadow-sm">
                                <div className="px-5 py-3 border-b border-color border-[var(--border-color)] ">
                                    <h3 className="text-[15px] font-semibold text-theme-primary">Contact Details</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    {[
                                        { icon: <Mail className="w-4 h-4" />, label: 'Email', value: 'admin@technorucs.com' },
                                        { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: '+1 (555) 123-4567' },
                                        { icon: <MapPin className="w-4 h-4" />, label: 'Location', value: 'San Francisco, CA' },
                                        { icon: <Globe className="w-4 h-4" />, label: 'Timezone', value: 'Pacific Time (PST)' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-[6px] hover:bg-[var(--bg-hover)] transition-colors group">
                                            <div className="w-9 h-9 rounded-[8px] bg-[#059669]/10 flex items-center justify-center text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-theme-muted uppercase tracking-wider font-bold">{item.label}</p>
                                                <p className="text-[13px] font-medium text-theme-primary">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Account Details */}
                            <div className="card-base border rounded-[6px] overflow-hidden shadow-sm">
                                <div className="px-5 py-3 border-b border-color border-[var(--border-color)] ">
                                    <h3 className="text-[15px] font-semibold text-theme-primary">Account Details</h3>
                                </div>
                                <div className="p-4 space-y-2">
                                    {[
                                        { label: 'Role', badge: true, value: 'Administrator', color: '#059669', icon: <Shield className="w-3 h-3" /> },
                                        { label: 'Status', badge: true, value: 'Active', color: '#059669' },
                                        { label: 'Joined', value: 'Jan 15, 2025' },
                                        { label: 'Last Login', value: 'Today, 3:30 PM' },
                                        { label: 'Last IP', value: '192.168.1.xxx' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2.5 rounded-[6px] hover:bg-[var(--bg-secondary)] transition-colors">
                                            <span className="text-[13px] text-theme-secondary">{item.label}</span>
                                            {item.badge ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full border" style={{
                                                    backgroundColor: `${item.color}10`,
                                                    color: item.color,
                                                    borderColor: `${item.color}30`,
                                                }}>
                                                    {item.icon} {item.value}
                                                </span>
                                            ) : (
                                                <span className="text-[13px] font-semibold text-theme-primary">{item.value}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="card-base border rounded-[6px] overflow-hidden shadow-sm">
                                <div className="px-5 py-3 border-b border-color border-[var(--border-color)] ">
                                    <h3 className="text-[15px] font-semibold text-theme-primary">Skills & Expertise</h3>
                                </div>
                                <div className="p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1.5 text-[12px] font-medium rounded-full border transition-colors hover:bg-[#059669]/10 hover:border-[#A7F3D0] hover:text-[#059669] cursor-default bg-[var(--bg-secondary)] border-color border-[var(--border-color)] text-theme-primary">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Performance */}
                            <div className="card-base border rounded-[6px] overflow-hidden shadow-sm">
                                <div className="px-5 py-3 border-b border-color border-[var(--border-color)] ">
                                    <h3 className="text-[15px] font-semibold text-theme-primary">Performance</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    {[
                                        { label: 'Task Completion', value: 98, color: '#059669' },
                                        { label: 'On-Time Delivery', value: 92, color: '#0284C7' },
                                        { label: 'Code Quality', value: 95, color: '#7C3AED' },
                                    ].map((metric, idx) => (
                                        <div key={idx}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1.5">
                                                <span className="text-[12px] font-medium text-theme-secondary">{metric.label}</span>
                                                <span className="text-[13px] font-bold" style={{ color: metric.color }}>{metric.value}%</span>
                                            </div>
                                            <div className="h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{ width: `${metric.value}%`, background: `linear-gradient(90deg, ${metric.color}, ${metric.color}88)` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── SECURITY TAB ─── */}
                {activeTab === 'security' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-6">
                            {/* Change Password */}
                            <div className="card-base border rounded-[6px] border-l-[3px] border-l-[#059669] overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-color border-[var(--border-color)] ">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-[8px] bg-[#059669]/10 flex items-center justify-center text-[#059669] shadow-sm">
                                            <Key className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-[16px] font-semibold text-theme-primary">Change Password</h3>
                                            <p className="text-[12px] text-theme-muted">Ensure your account is using a strong password</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div>
                                        <label className="block text-[13px] font-medium text-theme-primary mb-1.5">Current Password</label>
                                        <Input type="password" placeholder="Enter current password" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">New Password</label>
                                            <Input type="password" placeholder="Enter new password" />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-medium text-theme-primary mb-1.5">Confirm New Password</label>
                                            <Input type="password" placeholder="Confirm new password" />
                                        </div>
                                    </div>
                                    {/* Password strength hints */}
                                    <div className="p-3 bg-[var(--bg-secondary)] rounded-[6px] border border-color border-[var(--border-color)]">
                                        <p className="text-[12px] font-medium text-theme-secondary mb-2">Password requirements:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                            {['At least 8 characters', 'One uppercase letter', 'One number', 'One special character'].map((req, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <CheckCircle className="w-3.5 h-3.5 text-[#059669]" />
                                                    <span className="text-[11px] text-theme-secondary">{req}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Button>Update Password</Button>
                                    </div>
                                </div>
                            </div>

                            {/* Two-Factor Authentication */}
                            <div className="card-base border rounded-[6px] border-l-[3px] border-l-[#059669] overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-color border-[var(--border-color)] ">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-[8px] bg-[#059669]/10 flex items-center justify-center text-[#059669] shadow-sm">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-[16px] font-semibold text-theme-primary">Two-Factor Authentication</h3>
                                            <p className="text-[12px] text-theme-muted">Increase your account security with 2FA</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#059669]/10 rounded-[6px] border border-[#A7F3D0]/50">
                                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-4">
                                            <div className="w-12 h-12 bg-[#059669]/10 rounded-full flex items-center justify-center">
                                                <Smartphone className="w-6 h-6 text-[#059669]" />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-semibold text-theme-primary">Authenticator App</p>
                                                <p className="text-[13px] text-theme-secondary">Use an authenticator app like Google Authenticator or Authy</p>
                                            </div>
                                        </div>
                                        <Checkbox defaultChecked={false} />
                                    </div>
                                </div>
                            </div>

                            {/* Active Sessions */}
                            <div className="card-base border rounded-[6px] border-l-[3px] border-l-[#059669] overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-color border-[var(--border-color)] ">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-[8px] bg-[#059669]/10 flex items-center justify-center text-[#059669] shadow-sm">
                                                <Monitor className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-[16px] font-semibold text-theme-primary">Active Sessions</h3>
                                                <p className="text-[12px] text-theme-muted">Manage your active login sessions</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost">
                                            <LogOut className="w-3.5 h-3.5 mr-1" />
                                            Revoke All
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    {[
                                        { device: 'Chrome on Windows', icon: <Monitor className="w-5 h-5" />, location: 'San Francisco, CA', ip: '192.168.1.100', time: 'Active now', current: true },
                                        { device: 'Safari on iPhone 15', icon: <Smartphone className="w-5 h-5" />, location: 'San Francisco, CA', ip: '192.168.1.101', time: '2 hours ago', current: false },
                                        { device: 'Firefox on MacBook Pro', icon: <Laptop className="w-5 h-5" />, location: 'New York, NY', ip: '10.0.0.55', time: '3 days ago', current: false },
                                    ].map((session, idx) => (
                                        <div key={idx} className={`flex items-center justify-between p-4 rounded-[6px] transition-colors ${session.current ? 'bg-[#059669]/10 border border-[#A7F3D0]/30' : 'hover:bg-[var(--bg-secondary)]'}`}>
                                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-4">
                                                <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center ${session.current ? 'bg-[#059669] text-white' : 'bg-[var(--border-color)] text-theme-secondary'}`}>
                                                    {session.icon}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-medium text-theme-primary">{session.device}</p>
                                                    <p className="text-[12px] text-theme-secondary">{session.location} · {session.ip} · {session.time}</p>
                                                </div>
                                            </div>
                                            {session.current ? (
                                                <span className="text-[11px] font-bold text-[#059669] px-3 py-1.5 bg-[#059669]/10 rounded-full border border-[#A7F3D0] uppercase tracking-wider">Current</span>
                                            ) : (
                                                <Button size="sm" variant="outline">Revoke</Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Security sidebar */}
                        <div className="space-y-6">
                            <div className="card-base border rounded-[6px] overflow-hidden shadow-sm">
                                <div className="px-5 py-3 border-b border-color border-[var(--border-color)] ">
                                    <h3 className="text-[15px] font-semibold text-theme-primary">Security Score</h3>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="relative w-32 h-32">
                                            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                                                <circle cx="60" cy="60" r="52" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                                                <circle cx="60" cy="60" r="52" fill="none" stroke="#059669" strokeWidth="8" strokeDasharray="327" strokeDashoffset="49" strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-[28px] font-bold text-[#059669]">85</span>
                                                <span className="text-[11px] text-theme-secondary font-medium">/ 100</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Strong password', done: true },
                                            { label: 'Email verified', done: true },
                                            { label: 'Phone verified', done: true },
                                            { label: '2FA enabled', done: false },
                                            { label: 'Recovery email set', done: false },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2.5">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-[#059669]' : 'bg-[var(--border-color)]'}`}>
                                                    <CheckCircle className={`w-3 h-3 ${item.done ? 'text-white' : 'text-theme-secondary'}`} />
                                                </div>
                                                <span className={`text-[13px] ${item.done ? 'text-theme-primary' : 'text-theme-muted'}`}>{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── NOTIFICATIONS TAB ─── */}
                {activeTab === 'notifications' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-6">
                            {/* Email Notifications */}
                            <div className="card-base border rounded-[6px] border-l-[3px] border-l-[#059669] overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-color border-[var(--border-color)] ">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-[8px] bg-[#059669]/10 flex items-center justify-center text-[#059669] shadow-sm">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-[16px] font-semibold text-theme-primary">Email Notifications</h3>
                                            <p className="text-[12px] text-theme-muted">Choose what emails you'd like to receive</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="divide-y divide-[var(--border-color)]">
                                    {[
                                        { label: 'Task assignments', description: 'Get notified when a task is assigned to you', checked: true },
                                        { label: 'Task status updates', description: 'Get notified when tasks you follow are updated', checked: true },
                                        { label: 'Issue mentions', description: 'Get notified when you are mentioned in an issue comment', checked: true },
                                        { label: 'Project milestones', description: 'Get notified about project milestone completions', checked: false },
                                        { label: 'Weekly digest', description: 'Receive a weekly summary of your activity and team updates', checked: true },
                                        { label: 'Product newsletter', description: 'Receive product updates, tips, and best practices', checked: false },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-[var(--bg-hover)] transition-colors">
                                            <div className="flex-1 mr-4">
                                                <p className="text-[14px] font-medium text-theme-primary">{item.label}</p>
                                                <p className="text-[13px] text-theme-muted">{item.description}</p>
                                            </div>
                                            <Checkbox defaultChecked={item.checked} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Push Notifications */}
                            <div className="card-base border rounded-[6px] border-l-[3px] border-l-[#059669] overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-color border-[var(--border-color)] ">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-[8px] bg-[#059669]/10 flex items-center justify-center text-[#059669] shadow-sm">
                                            <Bell className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-[16px] font-semibold text-theme-primary">Push Notifications</h3>
                                            <p className="text-[12px] text-theme-muted">Manage in-app and browser push notifications</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="divide-y divide-[var(--border-color)]">
                                    {[
                                        { label: 'Desktop notifications', description: 'Show browser push notifications for important updates', checked: true },
                                        { label: 'Sound alerts', description: 'Play a sound when you receive a new notification', checked: false },
                                        { label: 'Direct messages', description: 'Get instant notifications for direct messages', checked: true },
                                        { label: 'Team announcements', description: 'Get notified about team-wide announcements', checked: true },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-[var(--bg-hover)] transition-colors">
                                            <div className="flex-1 mr-4">
                                                <p className="text-[14px] font-medium text-theme-primary">{item.label}</p>
                                                <p className="text-[13px] text-theme-muted">{item.description}</p>
                                            </div>
                                            <Checkbox defaultChecked={item.checked} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Notification sidebar */}
                        <div className="space-y-6">
                            <div className="card-base border rounded-[6px] overflow-hidden shadow-sm">
                                <div className="px-5 py-3 border-b border-color border-[var(--border-color)] ">
                                    <h3 className="text-[15px] font-semibold text-theme-primary">Quick Settings</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2.5 rounded-[6px] hover:bg-[var(--bg-secondary)] transition-colors">
                                        <span className="text-[13px] text-theme-primary font-medium">Do Not Disturb</span>
                                        <Checkbox defaultChecked={false} />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2.5 rounded-[6px] hover:bg-[var(--bg-secondary)] transition-colors">
                                        <span className="text-[13px] text-theme-primary font-medium">Mute All Sounds</span>
                                        <Checkbox defaultChecked={false} />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2.5 rounded-[6px] hover:bg-[var(--bg-secondary)] transition-colors">
                                        <span className="text-[13px] text-theme-primary font-medium">Show Badges</span>
                                        <Checkbox defaultChecked={true} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#059669]/10 border border-[#A7F3D0] rounded-[6px] p-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-white rounded-[8px] flex items-center justify-center text-[#059669] border border-[#A7F3D0] flex-shrink-0">
                                        <Bell className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-semibold text-[#065F46] mb-1">Stay Updated</p>
                                        <p className="text-[12px] text-[#047857] leading-relaxed">Enable notifications to stay on top of your tasks and never miss important updates from your team.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── ACTIVITY LOG TAB ─── */}
                {activeTab === 'activity' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="col-span-2">
                            <div className="card-base border rounded-[6px] overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-color border-[var(--border-color)] ">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-[8px] bg-[#059669]/10 flex items-center justify-center text-[#059669] shadow-sm">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-[16px] font-semibold text-theme-primary">Recent Activity</h3>
                                                <p className="text-[12px] text-theme-muted">Your latest actions across all projects</p>
                                            </div>
                                        </div>
                                        <Select defaultValue="all">
                                            <option value="all">All Activity</option>
                                            <option value="projects">Projects</option>
                                            <option value="tasks">Tasks</option>
                                            <option value="issues">Issues</option>
                                        </Select>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="relative">
                                        {/* Timeline vertical line */}
                                        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-[var(--border-color)]" />

                                        <div className="space-y-1">
                                            {activityData.map((activity, idx) => (
                                                <div key={idx} className="flex items-start gap-4 p-3 rounded-[6px] hover:bg-[var(--bg-hover)] transition-colors relative group">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 shadow-sm border-2 border-white" style={{ backgroundColor: `${activity.color}15`, color: activity.color }}>
                                                        {activity.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-1">
                                                        <p className="text-[14px] text-theme-primary">
                                                            <span className="font-semibold">{activity.action}</span>{' '}
                                                            <span className="font-semibold" style={{ color: activity.color }}>{activity.target}</span>
                                                        </p>
                                                        <p className="text-[12px] text-theme-muted mt-0.5 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {activity.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity sidebar */}
                        <div className="space-y-6">
                            <div className="card-base border rounded-[6px] overflow-hidden shadow-sm">
                                <div className="px-5 py-3 border-b border-color border-[var(--border-color)] ">
                                    <h3 className="text-[15px] font-semibold text-theme-primary">Activity Summary</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    {[
                                        { label: 'Projects Updated', value: '5', icon: <FolderKanban className="w-4 h-4" />, color: '#059669' },
                                        { label: 'Tasks Completed', value: '12', icon: <CheckCircle className="w-4 h-4" />, color: '#0284C7' },
                                        { label: 'Issues Resolved', value: '8', icon: <AlertCircle className="w-4 h-4" />, color: '#7C3AED' },
                                        { label: 'Comments Made', value: '23', icon: <MessageSquare className="w-4 h-4" />, color: '#D97706' },
                                        { label: 'Documents Uploaded', value: '3', icon: <FileText className="w-4 h-4" />, color: '#0284C7' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-[6px] hover:bg-[var(--bg-secondary)] transition-colors">
                                            <div className="w-9 h-9 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: `${item.color}10`, color: item.color }}>
                                                {item.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[12px] text-theme-muted">{item.label}</p>
                                            </div>
                                            <span className="text-[16px] font-bold text-theme-primary">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card-base border rounded-[6px] overflow-hidden shadow-sm">
                                <div className="px-5 py-3 border-b border-color border-[var(--border-color)] ">
                                    <h3 className="text-[15px] font-semibold text-theme-primary">This Week</h3>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">
                                                <span className="text-[12px] text-theme-secondary">Productivity</span>
                                                <span className="text-[13px] font-bold text-[#059669]">92%</span>
                                            </div>
                                            <div className="h-2.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-[#059669] to-[#34D399]" style={{ width: '92%' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[12px] text-theme-muted leading-relaxed">
                                        You're <span className="font-semibold text-[#059669]">12% above</span> your average weekly productivity. Great work! 🎉
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
