import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { X, Trash2 } from 'lucide-react';
import { MultiSelect } from '@/shared/components/ui/MultiSelect/MultiSelect';
import { teamsService } from '@/features/teams/services/teams.api';
import { usersService } from '@/features/users/services/users.api';
import { mastersService, MasterResponse } from '@/shared/services/masters.api';

export function TeamEdit() {
  const navigate = useNavigate();
  const { teamId } = useParams();

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    team_email: '',
    description: '',
    team_type: '',
    max_team_size: '',
    budget_allocation: '',
    primary_communication_channel: '',
    channel_id: '',
    lead_id: '',
    dept_id: '',
  });

  const [departments, setDepartments] = useState<MasterResponse[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!teamId) return;

        const [d, u, team] = await Promise.all([
          mastersService.getDepartments(),
          usersService.getUsers(0, 100),
          teamsService.getTeam(parseInt(teamId, 10))
        ]);

        setDepartments(d);
        setUsers(u);

        setFormData({
          name: team.name || '',
          team_email: team.team_email || '',
          description: team.description || '',
          team_type: team.team_type || '',
          max_team_size: team.max_team_size?.toString() || '',
          budget_allocation: team.budget_allocation?.toString() || '',
          primary_communication_channel: team.primary_communication_channel || '',
          channel_id: team.channel_id || '',
          lead_id: team.lead_id?.toString() || '',
          dept_id: team.dept_id?.toString() || '',
        });

        if (team.members) {
          setSelectedMembers(new Set(team.members.map((m: any) => m.id)));
        }
      } catch (error) {
        console.error('Failed to fetch team data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;

    try {
      const payload: any = { ...formData };

      ['lead_id', 'dept_id', 'max_team_size'].forEach(key => {
        if (payload[key] === '') {
          payload[key] = null;
        } else {
          payload[key] = parseInt(payload[key], 10);
        }
      });

      ['description', 'team_type', 'primary_communication_channel', 'channel_id'].forEach(key => {
        if (payload[key] === '') {
          payload[key] = null;
        }
      });

      if (payload.budget_allocation === '') {
        payload.budget_allocation = 0;
      } else {
        payload.budget_allocation = parseFloat(payload.budget_allocation);
      }

      payload.member_ids = Array.from(selectedMembers);

      // Delete omitted fields
      delete payload.location_id;

      await teamsService.updateTeam(parseInt(teamId, 10), payload);
      navigate(`/teams/${teamId}`);
    } catch (error: any) {
      console.error('Failed to update team:', error);
      alert(error.response?.data?.detail || 'Failed to update team');
    }
  };

  const handleCancel = () => {
    navigate(`/teams/${teamId}`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      // teamsService.deleteTeam
      navigate('/teams');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const userOptions = users.map(u => ({ label: `${u.first_name || ''} ${u.last_name || ''} (${u.email})`, value: u.id }));

  if (loading) {
    return <div className="p-8"><p>Loading team data...</p></div>;
  }

  return (
    <PageLayout
      title={`Edit Team ${teamId}`}
      showBackButton
      backPath={`/teams/${teamId}`}
      actions={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="danger" type="button" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Team
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Team Information */}
          <Card title="Team Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team Name <span className="text-[#DC2626]">*</span>
                </label>
                <Input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team ID (Immutable)
                </label>
                <Input value={teamId} readOnly className="bg-gray-100" />
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team Lead
                </label>
                <Select name="lead_id" value={formData.lead_id} onChange={handleChange}>
                  <option value="">Select team lead</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Department
                </label>
                <Select name="dept_id" value={formData.dept_id} onChange={handleChange}>
                  <option value="">Select department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team Email <span className="text-[#DC2626]">*</span>
                </label>
                <Input name="team_email" value={formData.team_email} onChange={handleChange} type="email" required />
              </div>
            </div>
          </Card>



          {/* Team Members */}
          <Card title="Team Members">
            <div className="space-y-4">
              <p className="text-[14px] text-[#6B7280]">Select users to add to this team.</p>
              <MultiSelect
                value={Array.from(selectedMembers)}
                options={userOptions}
                onChange={(e) => setSelectedMembers(new Set(e.value))}
                optionLabel="label"
                optionValue="value"
                filter
                placeholder={users.length === 0 ? "No users available" : "Search and select members"}
                maxSelectedLabels={5}
                className="w-full form-control-theme border border-[#D1D5DB] rounded-[6px]"
                display="chip"
              />
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
