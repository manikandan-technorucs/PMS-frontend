import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Select } from '@/shared/components/ui/Select/Select';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/shared/context/ToastContext';
import { timesheetsService } from '@/features/timesheets/services/timesheets.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';

type ViewMode = 'day' | 'week' | 'month' | 'range';

function getWeekDates(refDate: Date): Date[] {
    const day = refDate.getDay();
    const start = new Date(refDate);
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d;
    });
}
function fmtISO(d: Date) { return d.toISOString().split('T')[0]; }
function fmtNice(s: string) { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

export function TimesheetCreate() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Form fields
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [billingType, setBillingType] = useState<string>('Billable');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dateRange = useMemo(() => {
        if (viewMode === 'day') {
            const s = fmtISO(currentDate);
            return { start: s, end: s };
        }
        if (viewMode === 'week') {
            const wd = getWeekDates(currentDate);
            return { start: fmtISO(wd[0]), end: fmtISO(wd[6]) };
        }
        const s = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const e = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        return { start: fmtISO(s), end: fmtISO(e) };
    }, [viewMode, currentDate]);

    const navigate_date = (dir: 'prev' | 'next') => {
        const d = new Date(currentDate);
        if (viewMode === 'day') d.setDate(d.getDate() + (dir === 'next' ? 1 : -1));
        else if (viewMode === 'week') d.setDate(d.getDate() + (dir === 'next' ? 7 : -7));
        else d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
        setCurrentDate(d);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser || !selectedProject) {
            showToast('error', 'Validation Error', 'Please select a User and a Project');
            return;
        }

        setIsSubmitting(true);
        try {
            const projName = selectedProject.name || 'Project';
            const generatedName = `${projName} - ${fmtNice(dateRange.start)} to ${fmtNice(dateRange.end)}`;

            await timesheetsService.createTimesheet({
                name: generatedName,
                start_date: dateRange.start,
                end_date: dateRange.end,
                project_id: selectedProject.id,
                user_id: selectedUser.id,
                billing_type: billingType,
                approval_status: 'Pending',
                total_hours: 0
            });

            showToast('success', 'Timesheet Created', `Timesheet span saved for ${fmtNice(dateRange.start)} to ${fmtNice(dateRange.end)}`);
            navigate('/timesheets');
        } catch (error) {
            console.error(error);
            showToast('error', 'Error', 'Failed to create timesheet');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageLayout
            title="Create Timesheet"
            actions={
                <Button variant="outline" onClick={() => navigate('/timesheets')} disabled={isSubmitting}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Timesheets
                </Button>
            }
        >
            <form onSubmit={handleSubmit} className="max-w-2xl">
                <Card title="Time Period Details">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[14px] font-medium text-[#1F2937] mb-3">
                                Select Time Period <span className="text-[#DC2626]">*</span>
                            </label>

                            <div className="border rounded-[8px] p-5 bg-[#F9FAFB]">
                                <div className="flex justify-center mb-5">
                                    <div className="flex bg-white border rounded-[6px] p-1 shadow-sm">
                                        {(['day', 'week', 'month'] as const).map(mode => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setViewMode(mode)}
                                                className={`px-4 py-2 text-[13px] font-medium rounded-[4px] capitalize transition-colors ${viewMode === mode ? 'bg-[#F0FDF4] text-[#059669] ring-1 ring-[#059669]/20' : 'text-[#6B7280] hover:text-[#374151]'}`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-white border rounded-[8px] px-4 py-3 shadow-sm">
                                    <button type="button" onClick={() => navigate_date('prev')} className="p-1 hover:bg-gray-100 rounded">
                                        <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
                                    </button>
                                    <span className="text-[15px] font-semibold text-[#1F2937]">
                                        {dateRange.start === dateRange.end ? fmtNice(dateRange.start) : `${fmtNice(dateRange.start)} to ${fmtNice(dateRange.end)}`}
                                    </span>
                                    <button type="button" onClick={() => navigate_date('next')} className="p-1 hover:bg-gray-100 rounded">
                                        <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-[#374151] mb-1">Project <span className="text-[#DC2626]">*</span></label>
                            <ServerSearchDropdown 
                                entityType="projects"
                                value={selectedProject}
                                onChange={setSelectedProject}
                                placeholder="Select Project"
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-[#374151] mb-1">Log Users <span className="text-[#DC2626]">*</span></label>
                            <ServerSearchDropdown 
                                entityType="users"
                                value={selectedUser}
                                onChange={setSelectedUser}
                                placeholder="Select User"
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-[#374151] mb-1">Billing Type</label>
                            <Select
                                name="billing_type"
                                value={billingType}
                                onChange={(e) => setBillingType(e.target.value)}
                            >
                                <option value="Billable">Billable</option>
                                <option value="Non-billable">Non-billable</option>
                            </Select>
                        </div>

                        <div className="flex justify-start gap-3 pt-6 border-t mt-6">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate('/timesheets')} disabled={isSubmitting}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            </form>
        </PageLayout>
    );
}
