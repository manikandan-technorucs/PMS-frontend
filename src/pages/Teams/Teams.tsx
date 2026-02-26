import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { StatCard } from '@/components/ui/Card/StatCard';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/lists/DataTable/DataTable';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { Plus, UsersRound, Users, FolderKanban, Building } from 'lucide-react';

import { useState, useEffect } from 'react';
import { teamsService, Team as ApiTeam } from '@/services/teams';

export function Teams() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamsService.getTeams();
        setTeams(data);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const columns: Column<ApiTeam>[] = [
    { key: 'public_id', header: 'Team ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'lead_id',
      header: 'Lead',
      sortable: true,
      render: (value) => <span>User {value || '-'}</span>
    },
    {
      key: 'id', // just as placeholder key
      header: 'Members',
      render: () => <span>{Math.floor(Math.random() * 10) + 1}</span> // Mock for now
    },
    {
      key: 'id', // placeholder key
      header: 'Active Projects',
      render: () => <span>{Math.floor(Math.random() * 5)}</span> // Mock for now
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (_, row) => <span>{(row as any).department?.name || row.dept_id || '-'}</span>
    },
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Teams" value={teams.length} icon={<UsersRound className="w-5 h-5" />} />
          <StatCard label="Total Members" value={0} icon={<Users className="w-5 h-5" />} />
          <StatCard label="Active Projects" value={0} icon={<FolderKanban className="w-5 h-5" />} />
          <StatCard label="Departments" value={0} icon={<Building className="w-5 h-5" />} />
        </div>

        <Card>
          <DataTable
            columns={columns}
            data={teams}
            selectable
            onRowClick={(team) => navigate(`/teams/${team.id}`)}
            itemsPerPage={20}
          />
        </Card>
      </div>
    </PageLayout>
  );
}