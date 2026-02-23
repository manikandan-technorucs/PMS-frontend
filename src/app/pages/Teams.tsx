import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DataTable, Column } from '../components/DataTable';
import { Plus } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  lead: string;
  members: number;
  projects: number;
  department: string;
}

const mockTeams: Team[] = [
  { id: 'TEAM-001', name: 'Frontend Development', lead: 'Sarah Johnson', members: 8, projects: 5, department: 'Engineering' },
  { id: 'TEAM-002', name: 'Backend Development', lead: 'Michael Chen', members: 10, projects: 7, department: 'Engineering' },
  { id: 'TEAM-003', name: 'UI/UX Design', lead: 'Emily Rodriguez', members: 5, projects: 12, department: 'Design' },
  { id: 'TEAM-004', name: 'Quality Assurance', lead: 'James Wilson', members: 6, projects: 8, department: 'QA' },
  { id: 'TEAM-005', name: 'DevOps', lead: 'David Park', members: 4, projects: 15, department: 'Engineering' },
  { id: 'TEAM-006', name: 'Data Analytics', lead: 'Lisa Anderson', members: 5, projects: 6, department: 'Analytics' },
];

export function Teams() {
  const navigate = useNavigate();

  const columns: Column<Team>[] = [
    { key: 'id', header: 'Team ID', sortable: true },
    { key: 'name', header: 'Team Name', sortable: true },
    { key: 'lead', header: 'Team Lead', sortable: true },
    { key: 'members', header: 'Members', sortable: true },
    { key: 'projects', header: 'Active Projects', sortable: true },
    { key: 'department', header: 'Department', sortable: true },
  ];

  return (
    <PageLayout 
      title="Teams"
      actions={
        <Button onClick={() => navigate('/teams/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Total Teams</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">{mockTeams.length}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Total Members</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">
                {mockTeams.reduce((sum, team) => sum + team.members, 0)}
              </p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Active Projects</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">
                {mockTeams.reduce((sum, team) => sum + team.projects, 0)}
              </p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Avg Team Size</p>
              <p className="text-[24px] font-semibold text-[#1F2937]">
                {Math.round(mockTeams.reduce((sum, team) => sum + team.members, 0) / mockTeams.length)}
              </p>
            </div>
          </Card>
        </div>

        <Card>
          <DataTable 
            columns={columns} 
            data={mockTeams}
            selectable
            onRowClick={(team) => navigate(`/teams/${team.id}`)}
            itemsPerPage={20}
          />
        </Card>
      </div>
    </PageLayout>
  );
}