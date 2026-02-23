import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { X } from 'lucide-react';

export function TeamCreate() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    navigate('/teams');
  };

  const handleCancel = () => {
    navigate('/teams');
  };

  return (
    <PageLayout 
      title="Create New Team"
      actions={
        <Button variant="ghost" onClick={handleCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl space-y-6">
          {/* Team Information */}
          <Card title="Team Information">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team Name <span className="text-[#DC2626]">*</span>
                </label>
                <Input placeholder="Enter team name" required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team ID <span className="text-[#DC2626]">*</span>
                </label>
                <Input placeholder="e.g. TEAM-001" required />
              </div>
              <div className="col-span-2">
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Description
                </label>
                <Textarea 
                  placeholder="Enter team description" 
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team Lead <span className="text-[#DC2626]">*</span>
                </label>
                <Select required>
                  <option value="">Select team lead</option>
                  <option value="sarah">Sarah Johnson</option>
                  <option value="michael">Michael Chen</option>
                  <option value="emily">Emily Rodriguez</option>
                  <option value="james">James Wilson</option>
                  <option value="david">David Park</option>
                  <option value="lisa">Lisa Anderson</option>
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Department <span className="text-[#DC2626]">*</span>
                </label>
                <Select required>
                  <option value="">Select department</option>
                  <option value="engineering">Engineering</option>
                  <option value="design">Design</option>
                  <option value="qa">QA</option>
                  <option value="analytics">Analytics</option>
                  <option value="operations">Operations</option>
                  <option value="marketing">Marketing</option>
                </Select>
              </div>
            </div>
          </Card>

          {/* Team Settings */}
          <Card title="Team Settings">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team Type
                </label>
                <Select>
                  <option value="permanent">Permanent</option>
                  <option value="project">Project-Based</option>
                  <option value="cross-functional">Cross-Functional</option>
                  <option value="temporary">Temporary</option>
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
                  <option value="hybrid">Hybrid</option>
                  <option value="branch-1">Branch Office 1</option>
                  <option value="branch-2">Branch Office 2</option>
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Max Team Size
                </label>
                <Input type="number" placeholder="0" min="1" />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Budget Allocation
                </label>
                <Input type="number" placeholder="0.00" />
              </div>
            </div>
          </Card>

          {/* Communication & Tools */}
          <Card title="Communication & Tools">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Primary Communication Channel
                </label>
                <Select>
                  <option value="slack">Slack</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="email">Email</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Channel/Group ID
                </label>
                <Input placeholder="e.g. #team-frontend" />
              </div>
              <div className="col-span-2">
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team Email
                </label>
                <Input type="email" placeholder="team@example.com" />
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button variant="ghost" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Create Team
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
