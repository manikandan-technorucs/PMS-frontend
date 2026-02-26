import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { X, Trash2 } from 'lucide-react';
import { teamsService } from '@/services/teams';
import { usersService } from '@/services/users';
import { mastersService, MasterResponse } from '@/services/masters';

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
    location_id: '',
  });

  const [departments, setDepartments] = useState<MasterResponse[]>([]);
  const [locations, setLocations] = useState<MasterResponse[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!teamId) return;

        const [d, l, u, team] = await Promise.all([
          mastersService.getDepartments(),
          mastersService.getLocations(),
          usersService.getUsers(0, 100),
          teamsService.getTeam(parseInt(teamId, 10))
        ]);

        setDepartments(d);
        setLocations(l);
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
          location_id: team.location_id?.toString() || '',
        });
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

      ['lead_id', 'dept_id', 'location_id', 'max_team_size'].forEach(key => {
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

  if (loading) {
    return <div className="p-8"><p>Loading team data...</p></div>;
  }

  return (
    <PageLayout
      title={`Edit Team ${teamId}`}
      actions={
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="danger" type="button" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Team
          </Button>
          <Button variant="ghost" type="button" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Team Information */}
          <Card title="Team Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="col-span-2">
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
            </div>
          </Card>

          {/* Team Settings */}
          <Card title="Team Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team Type
                </label>
                <Select name="team_type" value={formData.team_type} onChange={handleChange}>
                  <option value="">Select type</option>
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
                <Select name="location_id" value={formData.location_id} onChange={handleChange}>
                  <option value="">Select location</option>
                  {locations.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Max Team Size
                </label>
                <Input name="max_team_size" value={formData.max_team_size} onChange={handleChange} type="number" min="1" />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Budget Allocation
                </label>
                <Input name="budget_allocation" value={formData.budget_allocation} onChange={handleChange} type="number" step="0.01" />
              </div>
            </div>
          </Card>

          {/* Communication & Tools */}
          <Card title="Communication & Tools">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Primary Communication Channel
                </label>
                <Select name="primary_communication_channel" value={formData.primary_communication_channel} onChange={handleChange}>
                  <option value="">Select channel</option>
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
                <Input name="channel_id" value={formData.channel_id} onChange={handleChange} />
              </div>
              <div className="col-span-2">
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Team Email <span className="text-[#DC2626]">*</span>
                </label>
                <Input name="team_email" value={formData.team_email} onChange={handleChange} type="email" required />
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
