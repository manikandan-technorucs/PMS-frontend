import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { SearchableMultiSelect } from '@/shared/components/ui/SearchableMultiSelect/SearchableMultiSelect';
import { Trash2, Users } from 'lucide-react';
import { teamsService } from '@/features/teams/services/teams.api';
import { usersService } from '@/features/users/services/users.api';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { FormHeader, FormField, FormCard } from '@/shared/components/ui/Form';

export function TeamEdit() {
  const navigate = useNavigate();
  const { teamId } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '', team_email: '', description: '', team_type: '',
    max_team_size: '', budget_allocation: '', primary_communication_channel: '',
    channel_id: '', lead_id: null as any, dept_id: null as any,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!teamId) return;
        const [u, team] = await Promise.all([usersService.getUsers(0, 100), teamsService.getTeam(parseInt(teamId, 10))]);
        setUsers(u);
        setFormData({
          name: team.name || '', team_email: team.team_email || '', description: team.description || '',
          team_type: team.team_type || '', max_team_size: team.max_team_size?.toString() || '',
          budget_allocation: team.budget_allocation?.toString() || '', primary_communication_channel: team.primary_communication_channel || '',
          channel_id: team.channel_id || '', lead_id: team.lead || null, dept_id: team.department || null,
        });
        if (team.members) setSelectedMembers(new Set(team.members.map((m: any) => m.id)));
      } catch (error) { console.error('Failed to fetch team data:', error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [teamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;
    setSubmitting(true);
    try {
      const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);
      const payload: any = { ...formData };
      ['lead_id', 'dept_id'].forEach(key => { payload[key] = extractId(payload[key]); });
      if (payload.max_team_size === '') payload.max_team_size = null;
      else payload.max_team_size = parseInt(payload.max_team_size, 10);
      ['description', 'team_type', 'primary_communication_channel', 'channel_id'].forEach(key => { if (payload[key] === '') payload[key] = null; });
      payload.budget_allocation = payload.budget_allocation === '' ? 0 : parseFloat(payload.budget_allocation);
      payload.member_ids = Array.from(selectedMembers);
      delete payload.location_id;
      await teamsService.updateTeam(parseInt(teamId, 10), payload);
      navigate(`/teams/${teamId}`);
    } catch (error: any) {
      console.error('Failed to update team:', error);
      alert(error.response?.data?.detail || 'Failed to update team');
    } finally { setSubmitting(false); }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) navigate('/teams');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));
  const userOptions = users.map(u => ({ id: u.id, label: `${u.first_name || ''} ${u.last_name || ''}`.trim(), subtitle: u.email }));

  if (loading) return <div className="p-8"><p>Loading team data...</p></div>;

  return (
    <PageLayout
      title={`Edit Team`}
      showBackButton backPath={`/teams/${teamId}`}
      actions={<Button variant="danger" type="button" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete Team</Button>}
    >
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={Users} title="Edit Team" subtitle="Update team details and manage members" color="cyan" />

        <FormCard columns={3} className="mb-5">
          <FormField label="Team Name" required>
            <Input name="name" value={formData.name} onChange={handleChange} required className="h-10" />
          </FormField>
          <FormField label="Team Email" required>
            <Input name="team_email" value={formData.team_email} onChange={handleChange} type="email" required className="h-10" />
          </FormField>
          <FormField label="Team Lead">
            <ServerSearchDropdown entityType="users" value={formData.lead_id} onChange={v => set('lead_id', v)} placeholder="Select team lead" />
          </FormField>
          <FormField label="Department">
            <ServerSearchDropdown entityType="departments" value={formData.dept_id} onChange={v => set('dept_id', v)} placeholder="Select department" />
          </FormField>
          <FormField label="Max Team Size">
            <Input name="max_team_size" type="number" min="1" value={formData.max_team_size} onChange={handleChange} className="h-10" />
          </FormField>
          <FormField label="Budget Allocation">
            <Input name="budget_allocation" type="number" step="0.01" min="0" value={formData.budget_allocation} onChange={handleChange} className="h-10" />
          </FormField>
          <FormField label="Description" className="md:col-span-2 lg:col-span-3">
            <Textarea name="description" value={formData.description} onChange={handleChange} rows={2} />
          </FormField>
        </FormCard>

        <FormCard columns={3} sectionTitle="Team Members" footer={{ onCancel: () => navigate(`/teams/${teamId}`), submitLabel: 'Save Changes', submittingLabel: 'Saving...', isSubmitting: submitting }}>
          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-xs text-slate-500 mb-3">Select users to add to this team</p>
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
