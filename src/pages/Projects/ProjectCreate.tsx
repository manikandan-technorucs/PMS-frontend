import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { X } from 'lucide-react';

import { projectsService } from '@/services/projects';
import { usersService } from '@/services/users';
import { mastersService, MasterResponse } from '@/services/masters';
import { teamsService } from '@/services/teams';

export function ProjectCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    manager_id: '',
    status_id: '',
    priority_id: '',
    start_date: '',
    end_date: '',
    estimated_hours: 0,
    dept_id: '',
    team_id: ''
  });

  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<MasterResponse[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<MasterResponse[]>([]);
  const [priorities, setPriorities] = useState<MasterResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, d, t, s, p] = await Promise.all([
          usersService.getUsers(0, 100),
          mastersService.getDepartments(),
          teamsService.getTeams(0, 100),
          mastersService.getStatuses(),
          mastersService.getPriorities()
        ]);
        setUsers(u);
        setDepartments(d);
        setTeams(t);
        setStatuses(s);
        setPriorities(p);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };

      // Convert relations to integers
      ['manager_id', 'status_id', 'priority_id', 'dept_id', 'team_id'].forEach(key => {
        if (payload[key] === '') {
          payload[key] = null;
        } else {
          payload[key] = parseInt(payload[key], 10);
        }
      });

      payload.estimated_hours = parseFloat(payload.estimated_hours) || 0;

      // Convert dates to null if empty
      ['start_date', 'end_date'].forEach(key => {
        if (!payload[key]) {
          payload[key] = null;
        }
      });

      // Clear empty strings
      ['description', 'client'].forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      await projectsService.createProject(payload);
      navigate('/projects');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      alert(error.response?.data?.detail || 'Failed to create project');
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <PageLayout
      title="Create New Project"
      actions={
        <Button variant="ghost" type="button" onClick={handleCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card title="Project Details">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Project Name <span className="text-[#DC2626]">*</span>
                </label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter project name" required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Project ID (Auto-generated)
                </label>
                <Input value="Will be generated (PRJ-XXXX)" readOnly disabled className="bg-gray-100" />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Client <span className="text-[#DC2626]">*</span>
                </label>
                <Input name="client" value={formData.client} onChange={handleChange} placeholder="Client name" required />
              </div>

              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter project description"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Project Manager <span className="text-[#DC2626]">*</span>
                </label>
                <Select name="manager_id" value={formData.manager_id} onChange={handleChange} required>
                  <option value="">Select manager</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Status
                </label>
                <Select name="status_id" value={formData.status_id} onChange={handleChange}>
                  <option value="">Select status</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Priority
                </label>
                <Select name="priority_id" value={formData.priority_id} onChange={handleChange}>
                  <option value="">Select priority</option>
                  {priorities.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Start Date
                </label>
                <Input name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  End Date
                </label>
                <Input name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Estimated Hours
                </label>
                <Input name="estimated_hours" type="number" step="0.5" min="0" value={formData.estimated_hours} onChange={handleChange} placeholder="e.g. 100.5" />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Department
                </label>
                <Select name="dept_id" value={formData.dept_id} onChange={handleChange}>
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Assigned Team
                </label>
                <Select name="team_id" value={formData.team_id} onChange={handleChange}>
                  <option value="">Select team</option>
                  {teams.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button variant="ghost" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Create Project
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
