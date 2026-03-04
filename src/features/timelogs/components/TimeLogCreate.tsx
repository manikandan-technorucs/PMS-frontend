import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { X, ArrowLeft } from 'lucide-react';
import { useToast } from '@/shared/context/ToastContext';

import { timelogsService } from '@/features/timelogs/services/timelogs.api';
import { tasksService } from '@/features/tasks/services/tasks.api';
import { projectsService } from '@/features/projects/services/projects.api';
import { issuesService } from '@/features/issues/services/issues.api';

export function TimeLogCreate() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [tasks, setTasks] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [issues, setIssues] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        task_id: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [t] = await Promise.all([
                    tasksService.getTasks(0, 500)
                ]);
                setTasks(t);
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = { ...formData };
            payload.hours = parseFloat(payload.hours);
            payload.user_id = 1; // Default user id for now since auth context doesn't provide it

            payload.task_id = parseInt(payload.task_id, 10);

            if (payload.description === '') payload.description = null;

            await timelogsService.createTimelog(payload);
            showToast('success', 'Time Logged', 'New time entry created successfully');
            navigate('/time-log');
        } catch (error: any) {
            console.error('Failed to create timelog:', error);
            alert(error.response?.data?.detail || 'Failed to create timelog');
        }
    };

    const handleCancel = () => {
        navigate('/time-log');
    };

    return (
        <PageLayout
            title="Log Time"
            actions={
                <Button variant="outline" onClick={handleCancel}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Time Logs
                </Button>
            }
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <Card title="Time Entry Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                                        Select Task <span className="text-[#DC2626]">*</span>
                                    </label>
                                    <Select name="task_id" value={formData.task_id} onChange={handleChange} required>
                                        <option value="">Select a task...</option>
                                        {tasks.map(t => (
                                            <option key={t.id} value={t.id}>{t.project?.name ? `[${t.project.name}] ` : ''}{t.title}</option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                                    Date <span className="text-[#DC2626]">*</span>
                                </label>
                                <Input
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                                    Hours <span className="text-[#DC2626]">*</span>
                                </label>
                                <Input
                                    name="hours"
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    value={formData.hours}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. 4.5"
                                />
                            </div>

                            <div className="md:col-span-2 mt-4 space-y-2">
                                <label className="block text-[14px] font-medium text-theme-primary">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full h-32 px-3 py-2 rounded-[6px] border text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 transition-all resize-none"
                                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
                                    placeholder="Describe the work done..."
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
