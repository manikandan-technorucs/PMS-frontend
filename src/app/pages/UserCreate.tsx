import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { X } from 'lucide-react';

export function UserCreate() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    navigate('/users');
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <PageLayout 
      title="Create New User"
      actions={
        <Button variant="ghost" onClick={handleCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl space-y-6">
          {/* Personal Information */}
          <Card title="Personal Information">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  First Name <span className="text-[#DC2626]">*</span>
                </label>
                <Input placeholder="Enter first name" required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Last Name <span className="text-[#DC2626]">*</span>
                </label>
                <Input placeholder="Enter last name" required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Email <span className="text-[#DC2626]">*</span>
                </label>
                <Input type="email" placeholder="user@example.com" required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Phone
                </label>
                <Input type="tel" placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Employee ID
                </label>
                <Input placeholder="e.g. EMP-001" />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Job Title
                </label>
                <Input placeholder="Enter job title" />
              </div>
            </div>
          </Card>

          {/* Account Settings */}
          <Card title="Account Settings">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Username <span className="text-[#DC2626]">*</span>
                </label>
                <Input placeholder="Enter username" required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Role <span className="text-[#DC2626]">*</span>
                </label>
                <Select required>
                  <option value="">Select role</option>
                  <option value="admin">Administrator</option>
                  <option value="pm">Project Manager</option>
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="qa">QA Engineer</option>
                  <option value="viewer">Viewer</option>
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Status <span className="text-[#DC2626]">*</span>
                </label>
                <Select required>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team
                </label>
                <Select>
                  <option value="">Select team</option>
                  <option value="frontend">Frontend Development</option>
                  <option value="backend">Backend Development</option>
                  <option value="design">UI/UX Design</option>
                  <option value="qa">Quality Assurance</option>
                  <option value="devops">DevOps</option>
                  <option value="analytics">Data Analytics</option>
                </Select>
              </div>
            </div>
          </Card>

          {/* Department & Location */}
          <Card title="Department & Location">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Department
                </label>
                <Select>
                  <option value="">Select department</option>
                  <option value="engineering">Engineering</option>
                  <option value="design">Design</option>
                  <option value="qa">QA</option>
                  <option value="analytics">Analytics</option>
                  <option value="operations">Operations</option>
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Location
                </label>
                <Select>
                  <option value="">Select location</option>
                  <option value="hq">Headquarters</option>
                  <option value="remote">Remote</option>
                  <option value="branch-1">Branch Office 1</option>
                  <option value="branch-2">Branch Office 2</option>
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Manager
                </label>
                <Select>
                  <option value="">Select manager</option>
                  <option value="sarah">Sarah Johnson</option>
                  <option value="michael">Michael Chen</option>
                  <option value="emily">Emily Rodriguez</option>
                  <option value="david">David Park</option>
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Start Date
                </label>
                <Input type="date" />
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button variant="ghost" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Create User
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
