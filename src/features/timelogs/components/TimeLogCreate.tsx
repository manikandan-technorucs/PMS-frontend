import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntity } from '@/hooks/useEntity';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';

/**
 * TimeLogCreate - Integrated with ServerSearchDropdown and SharedCalendar.
 * Logic: Task selection enabled only after Project selection.
 */
export function TimeLogCreate() {
    const navigate = useNavigate();
    const { create, loading } = useEntity('timelogs');
    
    const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

    const [form, setForm] = useState({
        project_id: null as any,
        task_id: null as any,
        issue_id: null as any,
        user_id: 1, 
        date: new Date(),
        start_time: '09:00',
        end_time: '10:00',
        hours: '1.0',
        billing_type: 'Billable',
        description: ''
    });

    const handleWorkItemChange = (val: any) => {
        if (!val) {
            setForm(prev => ({ ...prev, task_id: null, issue_id: null }));
            return;
        }
        
        if (val.type === 'task') {
            setForm(prev => ({ ...prev, task_id: val, issue_id: null }));
        } else if (val.type === 'issue') {
            setForm(prev => ({ ...prev, task_id: null, issue_id: val }));
        } else {
            // Fallback
            setForm(prev => ({ ...prev, task_id: val, issue_id: null }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            await create({
                project_id: extractId(form.project_id),
                task_id: extractId(form.task_id),
                issue_id: extractId(form.issue_id),
                user_id: 1, // Fallback for now
                date: form.date.toISOString().split('T')[0],
                hours: parseFloat(form.hours),
                billing_type: form.billing_type,
                description: form.description || null
            });
            navigate('/timelogs');
        } catch (err) {
            console.error('Failed to log time:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <PageLayout
            title="Log Time"
            showBackButton
            backPath="/timelogs"
        >
            <form onSubmit={handleSave}>
                <div className="space-y-6">
                    <Card title="Time Entry Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            <div>
                                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                                    Project
                                </label>
                                <ServerSearchDropdown 
                                    entityType="projects" 
                                    value={form.project_id} 
                                    onChange={v => setForm({...form, project_id: v, task_id: null, issue_id: null})} 
                                    placeholder="Select Project" 
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                                    Task / Issue
                                </label>
                                <ServerSearchDropdown 
                                    entityType="search/work-items" 
                                    customSearchPath="/search/work-items"
                                    value={form.task_id || form.issue_id} 
                                    onChange={handleWorkItemChange} 
                                    placeholder={form.project_id ? "Search Tasks or Issues..." : "Select a project first"} 
                                    disabled={!form.project_id}
                                    filters={form.project_id ? { project_id: extractId(form.project_id) } : {}}
                                    field="name"
                                    itemTemplate={(item) => (
                                        <div className="flex flex-col gap-0.5 py-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${item.type === 'issue' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                    {item.type}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-slate-500 font-mono">{item.public_id}</span>
                                        </div>
                                    )}
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                                    Date
                                </label>
                                <SharedCalendar 
                                    value={form.date} 
                                    onChange={v => setForm({...form, date: v})} 
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                                    Hours
                                </label>
                                <Input 
                                    name="hours"
                                    type="number"
                                    step="0.1"
                                    value={form.hours}
                                    onChange={handleChange}
                                    placeholder="e.g. 1.0"
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                                    Start Time
                                </label>
                                <Input 
                                    name="start_time"
                                    type="time"
                                    value={form.start_time}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                                    End Time
                                </label>
                                <Input 
                                    name="end_time"
                                    type="time"
                                    value={form.end_time}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                                    Billing Type
                                </label>
                                <Select 
                                    name="billing_type"
                                    value={form.billing_type} 
                                    onChange={handleChange}
                                >
                                    <option value="Billable">Billable</option>
                                    <option value="Non-Billable">Non-Billable</option>
                                </Select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Description</label>
                                <Textarea 
                                    name="description"
                                    value={form.description} 
                                    onChange={handleChange} 
                                    rows={4}
                                    placeholder="What did you work on?"
                                />
                            </div>
                        </div>
                    </Card>
                    <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                        <Button 
                            variant="outline" 
                            type="button" 
                            onClick={() => navigate('/timelogs')}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Log Time'}
                        </Button>
                    </div>
                </div>
            </form>
        </PageLayout>
    );
}
