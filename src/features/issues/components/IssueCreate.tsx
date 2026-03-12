import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntity } from '@/hooks/useEntity';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';

export function IssueCreate() {
  const navigate = useNavigate();
  const { create, loading } = useEntity('issues');
  
  const [formData, setFormData] = useState({
    title: '',
    project_id: null as any,
    reporter_id: null as any,
    assignee_id: null as any,
    status_id: null as any,
    priority_id: null as any,
    start_date: new Date(),
    end_date: null as any,
    estimated_hours: '',
    description: '',
  });

  const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const payload = { 
        ...formData,
        project_id: extractId(formData.project_id),
        reporter_id: extractId(formData.reporter_id),
        assignee_id: extractId(formData.assignee_id),
        status_id: extractId(formData.status_id),
        priority_id: extractId(formData.priority_id),
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        start_date: formData.start_date?.toISOString().split('T')[0],
        end_date: formData.end_date ? (formData.end_date instanceof Date ? formData.end_date.toISOString().split('T')[0] : formData.end_date) : null,
      };
      await create(payload);
      navigate('/issues');
    } catch (err) {
      console.error('Failed to create issue:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <PageLayout
      title="Report New Issue"
      showBackButton
      backPath="/issues"
    >
      <form onSubmit={handleSave}>
        <div className="space-y-6">
          <Card title="Issue Details">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Issue Title *</label>
                    <Input 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                        placeholder="Brief description of the issue" 
                    />
                </div>

                <div>
                    <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Project</label>
                    <ServerSearchDropdown 
                        entityType="projects" 
                        value={formData.project_id} 
                        onChange={v => setFormData({ ...formData, project_id: v })} 
                        placeholder="Select Project" 
                    />
                </div>

                <div>
                    <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Reporter</label>
                    <ServerSearchDropdown 
                        entityType="users" 
                        value={formData.reporter_id} 
                        onChange={v => setFormData({ ...formData, reporter_id: v })} 
                        placeholder="Select Reporter" 
                    />
                </div>

                <div>
                    <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Assignee</label>
                    <ServerSearchDropdown 
                        entityType="users" 
                        value={formData.assignee_id} 
                        onChange={v => setFormData({ ...formData, assignee_id: v })} 
                        placeholder="Select Assignee" 
                    />
                </div>

                <div>
                    <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Status</label>
                    <ServerSearchDropdown 
                        entityType="masters/statuses" 
                        value={formData.status_id} 
                        onChange={v => setFormData({ ...formData, status_id: v })} 
                        placeholder="Select Status" 
                    />
                </div>

                <div>
                    <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Priority</label>
                    <ServerSearchDropdown 
                        entityType="masters/priorities" 
                        value={formData.priority_id} 
                        onChange={v => setFormData({ ...formData, priority_id: v })} 
                        placeholder="Select Priority" 
                    />
                </div>

                <div>
                    <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Estimated Hours</label>
                    <Input 
                        name="estimated_hours" 
                        type="number" 
                        step="0.1"
                        value={formData.estimated_hours} 
                        onChange={handleChange} 
                        placeholder="e.g. 10.5" 
                    />
                </div>

                <div>
                    <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Start Date</label>
                    <SharedCalendar 
                        value={formData.start_date} 
                        onChange={v => setFormData({ ...formData, start_date: v })} 
                    />
                </div>

                <div>
                    <label className="block text-[14px] font-medium text-[#1F2937] mb-2">End Date</label>
                    <SharedCalendar 
                        value={formData.end_date} 
                        onChange={v => setFormData({ ...formData, end_date: v })} 
                    />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Description</label>
                    <Textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        rows={5} 
                        placeholder="Detailed description of the issue" 
                    />
                </div>
            </div>
          </Card>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button variant="outline" type="button" onClick={() => navigate('/issues')}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Report Issue'}</Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
