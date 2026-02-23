import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Textarea';
import { X, Trash2 } from 'lucide-react';

export function TeamEdit() {
  const navigate = useNavigate();
  const { teamId } = useParams();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    navigate(`/teams/${teamId}`);
  };

  const handleCancel = () => {
    navigate(`/teams/${teamId}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      navigate('/teams');
    }
  };

  return (
    <PageLayout 
      title={`Edit Team ${teamId}`}
      actions={
        <div className="flex items-center gap-3">
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Team
          </Button>
          <Button variant="ghost" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
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
                <Input 
                  placeholder="Enter team name" 
                  defaultValue="Frontend Development"
                  required 
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team ID <span className="text-[#DC2626]">*</span>
                </label>
                <Input 
                  placeholder="e.g. TEAM-001" 
                  defaultValue={teamId}
                  disabled
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Description
                </label>
                <Textarea 
                  placeholder="Enter team description" 
                  defaultValue="Responsible for building and maintaining all frontend applications and user interfaces across the organization."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team Lead <span className="text-[#DC2626]">*</span>
                </label>
                <Select defaultValue="sarah" required>
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
                <Select defaultValue="engineering" required>
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
                <Select defaultValue="permanent">
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
                <Select defaultValue="hybrid">
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
                <Input type="number" placeholder="0" min="1" defaultValue="10" />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Budget Allocation
                </label>
                <Input type="number" placeholder="0.00" defaultValue="500000" />
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
                <Select defaultValue="slack">
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
                <Input 
                  placeholder="e.g. #team-frontend" 
                  defaultValue="#team-frontend"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team Email
                </label>
                <Input 
                  type="email" 
                  placeholder="team@example.com" 
                  defaultValue="frontend@company.com"
                />
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button variant="ghost" type="button" onClick={handleCancel}>
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
