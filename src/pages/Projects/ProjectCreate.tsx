import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { X, FolderPlus, Settings, Users } from 'lucide-react';

export function ProjectCreate() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/projects');
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <PageLayout
      title="Create New Project"
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
                  <FolderPlus className="w-4 h-4" />
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
                  <Input placeholder="Enter project name" required />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Project ID <span className="text-[#DC2626]">*</span>
                  </label>
                  <Input placeholder="e.g. PRJ-001" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Description
                  </label>
                  <Textarea
                    placeholder="Enter project description"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Client <span className="text-[#DC2626]">*</span>
                  </label>
                  <Input placeholder="Client name" required />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Project Manager <span className="text-[#DC2626]">*</span>
                  </label>
                  <Select required>
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
                  <Select required>
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
                  <Select required>
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
                  <Input type="date" required />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    End Date <span className="text-[#DC2626]">*</span>
                  </label>
                  <Input type="date" required />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Budget
                  </label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                    Department
                  </label>
                  <Select>
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
                  <Select>
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
                  <Input placeholder="Add stakeholder emails" />
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
              Create Project
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
