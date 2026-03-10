import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/shared/context/ToastContext';

import { timelogsService } from '@/features/timelogs/services/timelogs.api';
import { tasksService } from '@/features/tasks/services/tasks.api';

export function TimeLogEdit() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { showToast } = useToast();

    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        task_id: '',
        date: '',
        hours: '',
        description: '',
    });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [tList, logData] = await Promise.all([
                    tasksService.getTasks(0, 500),
                    timelogsService.getTimelog(parseInt(id!, 10))
                ]);
                setTasks(tList);
                if (logData) {
                    setFormData({
                        task_id: logData.task_id ? logData.task_id.toString() : '',
                        date: logData.date ? logData.date.split('T')[0] : '',
                        hours: logData.hours ? logData.hours.toString() : '',
                        description: logData.description || '',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
                showToast('error', 'Error', 'Failed to load time log details');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchAll();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = { ...formData };
            payload.hours = parseFloat(payload.hours);
            payload.task_id = payload.task_id ? parseInt(payload.task_id, 10) : null;
            if (payload.description === '') payload.description = null;

            await timelogsService.updateTimelog(parseInt(id!, 10), payload);
            showToast('success', 'Time Log Updated', 'Your time entry has been successfully updated.');
            navigate(-1);
        } catch (error: any) {
            console.error('Failed to update time log', error);
            if (error.response && error.response.data) {
                console.error('Validation details:', error.response.data);
            }
            showToast('error', 'Update Failed', 'An error occurred while updating the time log.');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <PageLayout
            title="Edit Time Log"
            showBackButton
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <Card title="Time Entry Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                                        Select Task
                                    </label>
                                    <Select name="task_id" value={formData.task_id} onChange={handleChange}>
                                        <option value="">No specific task</option>
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
                                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full h-32 px-3 py-2 rounded-[6px] border text-[13px] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 transition-all resize-none"
                                    placeholder="Describe the work done..."
                                ></textarea>
                            </div>
                        </div>
                    </Card>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </div>
                </div>
            </form>
        </PageLayout>
    );
}
