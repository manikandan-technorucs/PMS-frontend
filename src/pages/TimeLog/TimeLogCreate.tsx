import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export function TimeLogCreate() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        showToast('success', 'Time Logged', 'New time entry created successfully');
        navigate('/time-log');
    };

    const handleCancel = () => {
        navigate('/time-log');
    };

    return (
        <PageLayout
            title="Log Time"
            actions={
                <Button variant="ghost" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                </Button>
            }
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <Card title="Time Entry Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            <Select label="Project" required options={[
                                { value: '', label: 'Select project...' },
                                { value: 'proj1', label: 'Enterprise Portal Redesign' },
                                { value: 'proj2', label: 'Mobile App Development' },
                                { value: 'proj3', label: 'API Integration Platform' }
                            ]} />

                            <Select label="Task" required options={[
                                { value: '', label: 'Select task...' },
                                { value: 'task1', label: 'Design homepage mockup' },
                                { value: 'task2', label: 'Implement authentication API' },
                                { value: 'task3', label: 'Database schema optimization' }
                            ]} />

                            <Input
                                label="Date"
                                type="date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />

                            <Input
                                label="Hours"
                                type="number"
                                step="0.5"
                                min="0.5"
                                required
                                placeholder="e.g. 4.0"
                            />

                            <Select label="Billing Type" options={[
                                { value: 'Billable', label: 'Billable' },
                                { value: 'Non-Billable', label: 'Non-Billable' }
                            ]} />

                            <div className="md:col-span-2 mt-4 space-y-2">
                                <label className="block text-[14px] font-medium text-theme-primary">Description</label>
                                <textarea
                                    className="w-full h-32 px-3 py-2 rounded-[6px] border text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 transition-all resize-none"
                                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                                    placeholder="Describe the work done..."
                                    required
                                ></textarea>
                            </div>
                        </div>
                    </Card>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <Button variant="ghost" type="button" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Time Log
                        </Button>
                    </div>
                </div>
            </form>
        </PageLayout>
    );
}
