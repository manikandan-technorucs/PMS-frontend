import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { X, Trash2, FolderEdit, Settings, Users, AlertTriangle } from 'lucide-react';

export function ProjectEdit() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/projects/${projectId}`);
  };

  const handleCancel = () => {
    navigate(`/projects/${projectId}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      navigate('/projects');
    }
  };

  return (
    <PageLayout
      title={`Edit Project ${projectId}`}
      actions={
        <Button variant="ghost" onClick={handleCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white border border-[#E5E7EB] rounded-[6px] border-l-[3px] border-l-[#059669] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAF9]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <FolderEdit className="w-4 h-4" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#1F2937]">Basic Information</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Project Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <Input
                    placeholder="Enter project name"
                    defaultValue="Enterprise Portal Redesign"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Project ID <span className="text-[#DC2626]">*</span>
                  </label>
                  <Input
                    placeholder="e.g. PRJ-001"
                    defaultValue={projectId}
                    disabled
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Description
                  </label>
                  <Textarea
                    placeholder="Enter project description"
                    defaultValue="Complete redesign of the enterprise customer portal with modern UI/UX"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Client <span className="text-[#DC2626]">*</span>
                  </label>
                  <Input
                    placeholder="Client name"
                    defaultValue="Acme Corp"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Project Manager <span className="text-[#DC2626]">*</span>
                  </label>
                  <Select defaultValue="sarah" required>
                    <option value="">Select manager</option>
                    <option value="sarah">Sarah Johnson</option>
                    <option value="michael">Michael Chen</option>
                    <option value="emily">Emily Rodriguez</option>
                    <option value="david">David Park</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Project Settings */}
          <div className="bg-white border border-[#E5E7EB] rounded-[6px] border-l-[3px] border-l-[#059669] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAF9]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#1F2937]">Project Settings</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Status <span className="text-[#DC2626]">*</span>
                  </label>
                  <Select defaultValue="in-progress" required>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="in-progress">In Progress</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Priority <span className="text-[#DC2626]">*</span>
                  </label>
                  <Select defaultValue="high" required>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Start Date <span className="text-[#DC2626]">*</span>
                  </label>
                  <Input type="date" defaultValue="2026-01-15" required />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    End Date <span className="text-[#DC2626]">*</span>
                  </label>
                  <Input type="date" defaultValue="2026-06-30" required />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Budget
                  </label>
                  <Input type="number" placeholder="0.00" defaultValue="250000" />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Department
                  </label>
                  <Select defaultValue="engineering">
                    <option value="">Select department</option>
                    <option value="engineering">Engineering</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Team Assignment */}
          <div className="bg-white border border-[#E5E7EB] rounded-[6px] border-l-[3px] border-l-[#059669] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAF9]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[6px] bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#1F2937]">Team Assignment</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Assigned Team
                  </label>
                  <Select defaultValue="frontend">
                    <option value="">Select team</option>
                    <option value="frontend">Frontend Development</option>
                    <option value="backend">Backend Development</option>
                    <option value="design">UI/UX Design</option>
                    <option value="qa">Quality Assurance</option>
                    <option value="devops">DevOps</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Stakeholders
                  </label>
                  <Input
                    placeholder="Add stakeholder emails"
                    defaultValue="stakeholder@acmecorp.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button variant="ghost" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>

          {/* Danger Zone */}
          <div className="bg-white border border-[#FCA5A5] rounded-[6px] border-l-[3px] border-l-[#DC2626] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#FCA5A5] bg-[#FEF2F2]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[6px] bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#DC2626]">Danger Zone</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-medium text-[#1F2937]">Delete this project</p>
                  <p className="text-[13px] text-[#6B7280]">Once deleted, all project data including tasks, issues, and documents will be permanently removed.</p>
                </div>
                <Button variant="danger" type="button" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
