import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { DataTable, Column } from '@/shared/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/ui/Badge/StatusBadge';
import { Edit, Users, FolderKanban, TrendingUp, Trash2, ArrowLeft } from 'lucide-react';
import { teamsService, Team as ApiTeam } from '@/features/teams/services/teams.api';
import { useState, useEffect } from 'react';

export function TeamDetail() {
  const navigate = useNavigate();
  const { teamId } = useParams();

  const [team, setTeam] = useState<ApiTeam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (teamId) {
          const data = await teamsService.getTeam(Number(teamId));
          setTeam(data);
        }
      } catch (error) {
        console.error('Failed to fetch team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await teamsService.deleteTeam(Number(teamId));
        navigate('/teams');
      } catch (error) {
        console.error('Failed to delete team:', error);
        alert('Failed to delete team');
      }
    }
  };

  const columns: Column<any>[] = [
    { key: 'email', header: 'User ID (Email)', sortable: true },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (_, row) => <span>{row.first_name || ''} {row.last_name || ''}</span>
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (_, row) => <span>{row.department?.name || '-'}</span>
    },
    { key: 'email_col', header: 'Email', render: (_, row) => <span>{row.email}</span> },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status?.name || 'Active'} variant="status" />
    }
  ];

  if (loading) return <div className="p-8">Loading...</div>;
  if (!team) return <div className="p-8">Team not found</div>;

  return (
    <PageLayout
      title={team.name}
      actions={
        <>
          <Button variant="outline" onClick={() => navigate('/teams')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button onClick={() => navigate(`/teams/${teamId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Team
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[12px] text-[#6B7280] mb-1">Team Members</p>
                <p className="text-[24px] font-semibold text-[#1F2937] mb-1">{team.members?.length || 0}</p>
              </div>
              <div className="text-[#14b8a6]">
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
              <div className="text-[#14b8a6]">
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
              <div className="text-[#14b8a6]">
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
              <div className="text-[#14b8a6]">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Team Information */}
        <Card title="Team Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Team ID</label>
              <p className="text-[14px] text-[#1F2937]">{team.public_id}</p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Team Lead</label>
              <p className="text-[14px] text-[#1F2937]">{team.lead ? `${team.lead.first_name} ${team.lead.last_name}` : '-'}</p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Department</label>
              <p className="text-[14px] text-[#1F2937]">{(team as any).department?.name || team.dept_id || '-'}</p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Location</label>
              <p className="text-[14px] text-[#1F2937]">{(team as any).location?.name || team.location_id || '-'}</p>
            </div>
            <div className="col-span-2">
              <label className="block text-[12px] text-[#6B7280] mb-1">Description</label>
              <p className="text-[14px] text-[#1F2937]">
                {team.description || 'No description provided.'}
              </p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Communication Channel</label>
              <p className="text-[14px] text-[#1F2937]">{team.primary_communication_channel || '-'}</p>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B7280] mb-1">Team Email</label>
              <p className="text-[14px] text-[#1F2937]">{team.team_email || '-'}</p>
            </div>
          </div>
        </Card>

        {/* Team Members */}
        <Card title="Team Members">
          <DataTable
            columns={columns}
            data={team.members || []}
            selectable
            onRowClick={(member) => navigate(`/users/${member.id}`)}
            itemsPerPage={10}
          />
        </Card>
      </div>
    </PageLayout>
  );
}
