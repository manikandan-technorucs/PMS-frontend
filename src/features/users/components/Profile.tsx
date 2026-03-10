import React, { useState } from 'react';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { Checkbox } from '@/shared/components/ui/Checkbox/Checkbox';
import {
    User, Mail, Phone, MapPin, Building, Calendar, Shield,
    Camera, Save, Key, Bell, Clock, Globe, Edit,
    Monitor, Smartphone, Laptop, LogOut, CheckCircle,
    ShieldCheck, Smartphone as SmartphoneIcon, Mail as MailIcon,
    ChevronRight, ExternalLink, Trash2, Plus
} from 'lucide-react';

const profileTabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Basic info and contact details' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password and 2FA settings' },
    { id: 'sessions', label: 'Sessions', icon: Monitor, description: 'Manage active devices' },
    { id: 'emails', label: 'Emails', icon: Mail, description: 'Manage secondary emails' },
];

export function Profile() {
    const [activeTab, setActiveTab] = useState('profile');
    const [userData, setUserData] = useState({
        first_name: 'Admin',
        last_name: 'User',
        display_name: 'Admin User',
        email: 'admin@technorucs.com',
        phone: '+1 (555) 123-4567',
        gender: 'Male',
        country: 'United States',
        language: 'English',
        timezone: 'Asia/Kolkata'
    });

    const isTabActive = (id: string) => activeTab === id;

    return (
        <PageLayout title="My Profile" isFullHeight>
            <div className="flex h-full bg-[#f8f9fa] border rounded-lg overflow-hidden">
                {/* ─── SIDEBAR ─── */}
                <aside className="w-[300px] border-r bg-white flex flex-col">
                    <div className="p-8 pb-4 flex flex-col items-center border-b mb-4">
                        <div className="relative group mb-4">
                            <div className="w-24 h-24 rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-md">
                                AU
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
                                <Camera className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <h2 className="text-[18px] font-bold text-gray-900">{userData.display_name}</h2>
                        <p className="text-[13px] text-gray-500">ZOHO ID: 812456789</p>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        {profileTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all text-left ${isTabActive(tab.id)
                                        ? 'bg-emerald-50 border-emerald-100 shadow-sm'
                                        : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`p-2 rounded-md ${isTabActive(tab.id) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    <tab.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[14px] font-semibold ${isTabActive(tab.id) ? 'text-emerald-900' : 'text-gray-700'}`}>
                                        {tab.label}
                                    </p>
                                    <p className="text-[11px] text-gray-400 truncate">{tab.description}</p>
                                </div>
                                {isTabActive(tab.id) && <ChevronRight className="w-4 h-4 text-emerald-400" />}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* ─── MAIN CONTENT ─── */}
                <main className="flex-1 flex flex-col bg-white overflow-y-auto">
                    <div className="p-10 max-w-4xl w-full mx-auto">
                        {activeTab === 'profile' && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <header>
                                    <h1 className="text-[22px] font-bold text-gray-900 mb-2">Profile Information</h1>
                                    <p className="text-[14px] text-gray-500">Update your account details and contact information.</p>
                                </header>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-gray-700">Display Name</label>
                                        <div className="group relative">
                                            <Input className="bg-gray-50 border-gray-100 focus:bg-white transition-all h-11" defaultValue={userData.display_name} />
                                            <Edit className="w-3.5 h-3.5 absolute right-3 top-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-gray-700">Gender</label>
                                        <Select className="bg-gray-50 border-gray-100 h-11" defaultValue={userData.gender}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Non-binary">Non-binary</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-gray-700">Email Address</label>
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-[14px] text-gray-700 flex-1">{userData.email}</span>
                                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-tight">Primary</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-gray-700">Phone</label>
                                        <Input className="bg-gray-50 border-gray-100 h-11" defaultValue={userData.phone} />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-gray-700">Country/Region</label>
                                        <Select className="bg-gray-50 border-gray-100 h-11" defaultValue={userData.country}>
                                            <option value="United States">United States</option>
                                            <option value="India">India</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-gray-700">Language</label>
                                        <Select className="bg-gray-50 border-gray-100 h-11" defaultValue={userData.language}>
                                            <option value="English">English</option>
                                            <option value="French">French</option>
                                            <option value="Spanish">Spanish</option>
                                        </Select>
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[13px] font-semibold text-gray-700">Timezone</label>
                                        <Select className="bg-gray-50 border-gray-100 h-11" defaultValue={userData.timezone}>
                                            <option value="Asia/Kolkata">(GMT+05:30) IST - Kolkata</option>
                                            <option value="America/New_York">(GMT-05:00) Eastern Time</option>
                                            <option value="UTC">(GMT+00:00) UTC</option>
                                        </Select>
                                    </div>
                                </div>

                                <div className="pt-8 border-t flex justify-end gap-3">
                                    <Button variant="outline" className="h-10 px-6">Discard</Button>
                                    <Button className="h-10 px-8 bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-12 animate-in slide-in-from-right duration-500">
                                <header>
                                    <h1 className="text-[22px] font-bold text-gray-900 mb-2">Security Settings</h1>
                                    <p className="text-[14px] text-gray-500">Manage your password and account security preferences.</p>
                                </header>

                                <div className="space-y-8">
                                    <Card className="p-0 border-gray-100 shadow-none">
                                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <Key className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-semibold text-gray-900">Password</p>
                                                    <p className="text-[12px] text-gray-500">Last changed 3 months ago</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">Change Password</Button>
                                        </div>
                                        <div className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                                    <ShieldCheck className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[15px] font-semibold text-gray-900">Multi-factor Authentication</p>
                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Enabled</span>
                                                    </div>
                                                    <p className="text-[12px] text-gray-500">Secure your account with an extra layer of security</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">Manage MFA</Button>
                                        </div>
                                    </Card>

                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex gap-3">
                                        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-[13px] font-semibold text-amber-900">Security Recommendation</p>
                                            <p className="text-[12px] text-amber-700 mt-0.5">We noticed you haven't updated your password in a while. Consider changing it to maintain account safety.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'sessions' && (
                            <div className="space-y-12 animate-in slide-in-from-right duration-500">
                                <header>
                                    <h1 className="text-[22px] font-bold text-gray-900 mb-2">Connected Sessions</h1>
                                    <p className="text-[14px] text-gray-500">View and manage all your active login sessions.</p>
                                </header>

                                <div className="divide-y border rounded-xl overflow-hidden shadow-sm border-gray-100">
                                    {[
                                        { device: 'Chrome on Windows', icon: Monitor, location: 'Kolkata, India', ip: '192.168.1.1', status: 'Current Session', current: true },
                                        { device: 'Safari on iPhone 15', icon: SmartphoneIcon, location: 'Kolkata, India', ip: '103.21.12.45', status: 'Last active: 2 hours ago', current: false },
                                        { device: 'Firefox on MacBook Pro', icon: Laptop, location: 'Bengaluru, India', ip: '106.51.123.88', status: 'Last active: 3 days ago', current: false },
                                    ].map((session, idx) => (
                                        <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-5">
                                                <div className={`p-3 rounded-xl ${session.current ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    <session.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="text-[15px] font-bold text-gray-900">{session.device}</p>
                                                        {session.current && <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">Current</span>}
                                                    </div>
                                                    <p className="text-[12px] text-gray-500 font-medium">
                                                        {session.location} • {session.ip}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-1">{session.status}</p>
                                                </div>
                                            </div>
                                            {!session.current && (
                                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <LogOut className="w-4 h-4 mr-2" />
                                                    Terminate
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-center">
                                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-10 px-6">
                                        Terminate All Other Sessions
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'emails' && (
                            <div className="space-y-12 animate-in slide-in-from-right duration-500">
                                <header>
                                    <h1 className="text-[22px] font-bold text-gray-900 mb-2">Email Addresses</h1>
                                    <p className="text-[14px] text-gray-500">Manage the email addresses associated with your account.</p>
                                </header>

                                <div className="space-y-4">
                                    <div className="border rounded-xl p-6 flex items-center justify-between border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-gray-50 text-gray-400 rounded-lg">
                                                <MailIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[15px] font-bold text-gray-900">{userData.email}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Primary</span>
                                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase">Verified</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-gray-400 cursor-not-allowed" disabled>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <Button variant="outline" className="w-full h-14 border-dashed border-2 hover:border-emerald-200 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 transition-all flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        <span className="text-[14px] font-semibold">Add Secondary Email</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </PageLayout>
    );
}
