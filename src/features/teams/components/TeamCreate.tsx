import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { SearchableMultiSelect } from '@/components/ui/SearchableMultiSelect/SearchableMultiSelect';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';
import { teamsService } from '@/features/teams/services/teams.api';
import { usersService } from '@/features/users/services/users.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { Users } from 'lucide-react';

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
    lead_email: null as any,
    dept_id: null as any,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<any>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    usersService.getUsers(0, 100).then(setUsers).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);
      const extractEmail = (val: any) => (val && typeof val === 'object' ? val.email : val);
      const payload: any = { ...formData };

      ['dept_id'].forEach(key => { payload[key] = extractId(payload[key]); });
      payload.lead_email = extractEmail(payload.lead_email);
      if (payload.max_team_size === '') payload.max_team_size = null;
      else payload.max_team_size = parseInt(payload.max_team_size, 10);

      ['description', 'team_type', 'primary_communication_channel', 'channel_id'].forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      payload.budget_allocation = payload.budget_allocation === '' ? 0 : parseFloat(payload.budget_allocation);
      payload.member_emails = Array.from(selectedMembers);
      delete payload.location_id;

      await teamsService.createTeam(payload);
      navigate('/teams');
    } catch (error: any) {
      console.error('Failed to create team:', error);
      alert(error.response?.data?.detail || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));

  const userOptions = users.map(u => ({ id: u.email, label: `${u.first_name || ''} ${u.last_name || ''}`.trim(), subtitle: u.email }));

  return (
    <PageLayout title="Create New Team" showBackButton backPath="/teams">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={Users} title="Team Information" subtitle="Configure your new team and add members" color="cyan" />

        <FormCard columns={3} className="mb-5">
          <FormField label="Team Name" required>
            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter team name" required className="h-10" />
          </FormField>

          <FormField label="Team Email" required>
            <Input name="team_email" value={formData.team_email} onChange={handleChange} type="email" placeholder="team@example.com" required className="h-10" />
          </FormField>

          <FormField label="Team Lead">
            <ServerSearchDropdown entityType="users" value={formData.lead_email} onChange={v => set('lead_email', v)} placeholder="Select team lead" />
          </FormField>

          <FormField label="Department">
            <ServerSearchDropdown entityType="departments" value={formData.dept_id} onChange={v => set('dept_id', v)} placeholder="Select department" />
          </FormField>

          <FormField label="Max Team Size">
            <Input name="max_team_size" type="number" min="1" value={formData.max_team_size} onChange={handleChange} placeholder="e.g. 10" className="h-10" />
          </FormField>

          <FormField label="Budget Allocation">
            <Input name="budget_allocation" type="number" step="0.01" min="0" value={formData.budget_allocation} onChange={handleChange} placeholder="0.00" className="h-10" />
          </FormField>

          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the team's purpose" rows={2} />
          </FormField>
        </FormCard>

        {/* Team Members Card */}
        <FormCard columns={3} footer={{ onCancel: () => navigate('/teams'), submitLabel: 'Create Team', submittingLabel: 'Creating...', isSubmitting, isDisabled: !formData.name.trim() }} sectionTitle="Team Members">
          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-xs text-slate-500 mb-3">Select users to add to this team (optional)</p>
            <SearchableMultiSelect
              options={userOptions}
              selectedIds={selectedMembers}
              onChange={setSelectedMembers}
              placeholder={users.length === 0 ? "No users available" : "Search and select members..."}
              emptyMessage="No users available"
            />
          </div>
        </FormCard>
      </form>
    </PageLayout>
  );
}
