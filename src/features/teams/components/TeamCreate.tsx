import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { X } from 'lucide-react';
import { MultiSelect } from '@/shared/components/ui/MultiSelect/MultiSelect';
import { teamsService } from '@/features/teams/services/teams.api';
import { usersService } from '@/features/users/services/users.api';
import { mastersService, MasterResponse } from '@/shared/services/masters.api';

export function TeamCreate() {
  const navigate = useNavigate();

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
    const fetchMasters = async () => {
      try {
        const [d, u] = await Promise.all([
          mastersService.getDepartments(),
          usersService.getUsers(0, 100),
        ]);
        setDepartments(d);
        setUsers(u);
      } catch (error) {
        console.error('Failed to fetch master data:', error);
      }
    };
    fetchMasters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };

      // Conversions
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

      // Delete properties completely left out of the UI
      delete payload.location_id;

      await teamsService.createTeam(payload);
      navigate('/teams');
    } catch (error: any) {
      console.error('Failed to create team:', error);
      alert(error.response?.data?.detail || 'Failed to create team');
    }
  };

  const handleCancel = () => {
    navigate('/teams');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const userOptions = users.map(u => ({ label: `${u.first_name || ''} ${u.last_name || ''} (${u.email})`, value: u.id }));

  return (
    <PageLayout
      title="Create New Team"
      actions={
        <Button variant="ghost" type="button" onClick={handleCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
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
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter team name" required />
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter team description"
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
                <Input name="team_email" value={formData.team_email} onChange={handleChange} type="email" placeholder="team@example.com" required />
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
              Create Team
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
