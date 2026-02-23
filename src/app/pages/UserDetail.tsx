import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Edit, Mail, Phone } from 'lucide-react';

export function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const user = {
    id: userId,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4567',
    role: 'Project Manager',
    department: 'Engineering',
    status: 'Active',
    joinDate: '2024-03-15',
    location: 'San Francisco, CA',
    manager: 'John Smith',
    projects: ['Enterprise Portal Redesign', 'Customer Portal v2', 'Mobile App Development'],
    skills: ['Project Management', 'Agile', 'Scrum', 'JIRA', 'Team Leadership'],
  };

  return (
    <PageLayout 
      title={user.name}
      actions={
        <>
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
          <Button onClick={() => navigate(`/users/${userId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit User
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card title="User Information">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">User ID</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{user.id}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Department</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{user.department}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Role</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{user.role}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Status</p>
                <StatusBadge status={user.status} variant="status" />
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Location</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{user.location}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Join Date</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{user.joinDate}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Manager</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{user.manager}</p>
              </div>
            </div>
          </Card>

          <Card title="Assigned Projects">
            <div className="space-y-2">
              {user.projects.map((project, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-[#F8FAFC] rounded-[6px] border border-[#E5E7EB]">
                  <span className="text-[14px] text-[#1F2937]">{project}</span>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Skills">
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-[12px] font-medium rounded-[6px]">
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Contact Information">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EFF6FF] rounded-[6px] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280]">Email</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EFF6FF] rounded-[6px] flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280]">Phone</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{user.phone}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Activity Stats">
            <div className="space-y-4">
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Tasks Completed</p>
                <p className="text-[24px] font-semibold text-[#1F2937]">127</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Hours Logged (Month)</p>
                <p className="text-[24px] font-semibold text-[#1F2937]">156h</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Active Projects</p>
                <p className="text-[24px] font-semibold text-[#1F2937]">{user.projects.length}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
