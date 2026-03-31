import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';
import { teamsService } from '@/features/teams/services/teams.api';
import { usersService } from '@/features/users/services/users.api';
import { GraphUserAutocomplete, GraphUser } from '@/features/projects/components/GraphUserAutocomplete';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { Button } from 'primereact/button';

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

  const [selectedGraphUsers, setSelectedGraphUsers] = useState<GraphUser[]>([]);
  const [userToAdd, setUserToAdd] = useState<GraphUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      // Sync MS Graph users to DB before creating team
      const memberEmails: string[] = [];
      for (const graphUser of selectedGraphUsers) {
        try {
          const email = graphUser.mail || (graphUser as any).userPrincipalName || `${graphUser.id}@temp.com`;
          let existingUser;
          try {
            const allUsers = await usersService.getUsers(0, 1000);
            existingUser = allUsers.find(u => u.email === email);
          } catch(e){}
          
          if (!existingUser) {
            existingUser = await usersService.createUser({
              first_name: (graphUser as any).givenName || graphUser.displayName.split(' ')[0],
              last_name: (graphUser as any).surname || graphUser.displayName.split(' ').slice(1).join(' ') || '',
              email: email,
              o365_id: graphUser.id,
            });
          }
          memberEmails.push(existingUser.email);
        } catch (err) {
          console.error('Failed to sync graph user:', err);
        }
      }
      payload.member_emails = memberEmails;
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

  const handleAddUser = () => {
    if (userToAdd && !selectedGraphUsers.find(u => u.id === userToAdd.id)) {
      setSelectedGraphUsers([...selectedGraphUsers, userToAdd]);
    }
    setUserToAdd(null);
  };

  const handleRemoveUser = (id: string) => {
    setSelectedGraphUsers(selectedGraphUsers.filter(u => u.id !== id));
  };

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
            <p className="text-xs text-slate-500 mb-3 hover:text-slate-700 transition-colors">Search organization users to add to this team</p>
            <div className="flex items-end gap-3 mb-5">
              <div className="flex-1 max-w-md">
                <GraphUserAutocomplete 
                  value={userToAdd} 
                  onChange={setUserToAdd} 
                  placeholder="Search organization users..." 
                />
              </div>
              <Button type="button" onClick={handleAddUser} disabled={!userToAdd} className="h-[42px]">
                <UserPlus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
            
            {selectedGraphUsers.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white/50 dark:bg-slate-900/50">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedGraphUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-teal-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                              {u.displayName?.charAt(0) || '?'}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{u.displayName}</span>
                              <span className="text-xs text-slate-500 truncate">{u.mail || 'No email'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button unstyled 
                            type="button"
                            onClick={() => handleRemoveUser(u.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {selectedGraphUsers.length === 0 && (
              <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-sm font-medium text-slate-500">No members added yet</p>
              </div>
            )}
          </div>
        </FormCard>
      </form>
    </PageLayout>
  );
}
