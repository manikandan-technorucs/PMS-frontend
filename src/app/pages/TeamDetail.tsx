import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Edit, Users, FolderKanban, TrendingUp } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: string;
  tasksCompleted: number;
}

const mockMembers: TeamMember[] = [
  { id: 'USR-001', name: 'Sarah Johnson', role: 'Team Lead', email: 'sarah.j@company.com', status: 'Active', tasksCompleted: 45 },
  { id: 'USR-002', name: 'Michael Chen', role: 'Senior Developer', email: 'michael.c@company.com', status: 'Active', tasksCompleted: 38 },
  { id: 'USR-003', name: 'Emily Rodriguez', role: 'Developer', email: 'emily.r@company.com', status: 'Active', tasksCompleted: 32 },
  { id: 'USR-004', name: 'David Park', role: 'Developer', email: 'david.p@company.com', status: 'Active', tasksCompleted: 28 },
  { id: 'USR-005', name: 'Lisa Anderson', role: 'Junior Developer', email: 'lisa.a@company.com', status: 'Active', tasksCompleted: 22 },
  { id: 'USR-006', name: 'James Wilson', role: 'Developer', email: 'james.w@company.com', status: 'On Leave', tasksCompleted: 15 },
];

export function TeamDetail() {
  const navigate = useNavigate();
  const { teamId } = useParams();

  const columns: Column<TeamMember>[] = [
    { key: 'id', header: 'User ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
    { key: 'email', header: 'Email' },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true,
      render: (value) => <StatusBadge status={value} variant="status" />
    },
    { key: 'tasksCompleted', header: 'Tasks Completed', sortable: true },
  ];

  return (
    <PageLayout 
      title={`Team ${teamId} - Frontend Development`}
      actions={
        <Button onClick={() => navigate(`/teams/${teamId}/edit`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Team
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[12px] text-[#6B7280] mb-1">Team Members</p>
                <p className="text-[24px] font-semibold text-[#1F2937] mb-1">8</p>
                <p className="text-[12px] text-[#6B7280]">2 vacancies</p>
              </div>
              <div className="text-[#2563EB]">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[12px] text-[#6B7280] mb-1">Active Projects</p>
                <p className="text-[24px] font-semibold text-[#1F2937] mb-1">5</p>
                <p className="text-[12px] text-[#16A34A]">+2 this month</p>
              </div>
              <div className="text-[#2563EB]">
                <FolderKanban className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[12px] text-[#6B7280] mb-1">Tasks Completed</p>
                <p className="text-[24px] font-semibold text-[#1F2937] mb-1">180</p>
                <p className="text-[12px] text-[#16A34A]">+15% vs last month</p>
              </div>
              <div className="text-[#2563EB]">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[12px] text-[#6B7280] mb-1">Avg Productivity</p>
                <p className="text-[24px] font-semibold text-[#1F2937] mb-1">87%</p>
                <p className="text-[12px] text-[#16A34A]">Above target</p>
              </div>
              <div className="text-[#2563EB]">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Team Information */}
        <Card title="Team Information">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Team ID</label>
              <p className="text-[14px] text-[#1F2937]">{teamId}</p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Team Lead</label>
              <p className="text-[14px] text-[#1F2937]">Sarah Johnson</p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Department</label>
              <p className="text-[14px] text-[#1F2937]">Engineering</p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Location</label>
              <p className="text-[14px] text-[#1F2937]">Hybrid</p>
            </div>
            <div className="col-span-2">
              <label className="block text-[12px] text-[#6B7280] mb-1">Description</label>
              <p className="text-[14px] text-[#1F2937]">
                Responsible for building and maintaining all frontend applications and user interfaces across the organization.
              </p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Communication Channel</label>
              <p className="text-[14px] text-[#1F2937]">#team-frontend</p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Team Email</label>
              <p className="text-[14px] text-[#1F2937]">frontend@company.com</p>
            </div>
          </div>
        </Card>

        {/* Team Members */}
        <Card title="Team Members">
          <DataTable 
            columns={columns} 
            data={mockMembers}
            selectable
            onRowClick={(member) => navigate(`/users/${member.id}`)}
            itemsPerPage={10}
          />
        </Card>
      </div>
    </PageLayout>
  );
}
