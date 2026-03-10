import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { X, Trash2 } from 'lucide-react';

import { projectsService } from '@/features/projects/services/projects.api';
import { usersService } from '@/features/users/services/users.api';
import { mastersService, MasterResponse } from '@/shared/services/masters.api';
import { teamsService } from '@/features/teams/services/teams.api';
import { projectGroupsService } from '@/features/projects/services/project_groups.api';
import { Checkbox } from '@/shared/components/ui/Checkbox/Checkbox';

interface ProjectFormData {
  name: string;
  description: string;
  client: string;
  manager_id: string;
  status_id: string;
  priority_id: string;
  start_date: string;
  end_date: string;
  estimated_hours: string;
  dept_id: string;
  team_id: string;
  group_id: string;
  is_template: boolean;
  is_archived: boolean;
}

const INITIAL_FORM: ProjectFormData = {
  name: '',
  description: '',
  client: '',
  manager_id: '',
  status_id: '',
  priority_id: '',
  start_date: '',
  end_date: '',
  estimated_hours: '',
  dept_id: '',
  team_id: '',
  group_id: '',
  is_template: false,
  is_archived: false
};

export function ProjectEdit() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_FORM);
  const [projectPublicId, setProjectPublicId] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<MasterResponse[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<MasterResponse[]>([]);
  const [priorities, setPriorities] = useState<MasterResponse[]>([]);
  const [projectGroups, setProjectGroups] = useState<any[]>([]);

  /* ----------------------------- Helpers ----------------------------- */

  const normalizePayload = (data: ProjectFormData) => {
    const payload: any = { ...data };

    const relationFields = [
      'manager_id',
      'status_id',
      'priority_id',
      'dept_id',
      'team_id',
      'group_id'
    ];

    relationFields.forEach((key) => {
      payload[key] = payload[key] ? parseInt(payload[key], 10) : null;
    });

    payload.estimated_hours = data.estimated_hours
      ? parseFloat(data.estimated_hours)
      : 0;

    payload.is_template = data.is_template;
    payload.is_archived = data.is_archived;

    ['start_date', 'end_date', 'description', 'client'].forEach((key) => {
      if (!payload[key]) payload[key] = null;
    });

    return payload;
  };

  /* ----------------------------- Fetch ----------------------------- */

  const fetchData = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      const [u, d, t, s, p, groups, project] = await Promise.all([
        usersService.getUsers(0, 100),
        mastersService.getDepartments(),
        teamsService.getTeams(0, 100),
        mastersService.getStatuses(),
        mastersService.getPriorities(),
        projectGroupsService.getProjectGroups(),
        projectsService.getProject(Number(projectId))
      ]);

      setUsers(u);
      setDepartments(d);
      setTeams(t);
      setStatuses(s);
      setPriorities(p);
      setProjectGroups(groups);

      setProjectPublicId(project.public_id);

      setFormData({
        name: project.name ?? '',
        description: project.description ?? '',
        client: project.client ?? '',
        manager_id: project.manager_id?.toString() ?? '',
        status_id: project.status_id?.toString() ?? '',
        priority_id: project.priority_id?.toString() ?? '',
        start_date: project.start_date ?? '',
        end_date: project.end_date ?? '',
        estimated_hours: project.estimated_hours?.toString() ?? '',
        dept_id: project.dept_id?.toString() ?? '',
        team_id: project.team_id?.toString() ?? '',
        group_id: project.group_id?.toString() ?? '',
        is_template: project.is_template ?? false,
        is_archived: project.is_archived ?? false
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load project data.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ----------------------------- Handlers ----------------------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = normalizePayload(formData);

      await projectsService.updateProject(Number(projectId), payload);
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to update project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;

    const confirmed = window.confirm(
      'Delete this project permanently? This cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await projectsService.deleteProject(Number(projectId));
      navigate('/projects');
    } catch (err) {
      console.error(err);
      setError('Failed to delete project.');
    }
  };

  /* ----------------------------- UI ----------------------------- */

  if (loading)
    return <div className="p-8 text-gray-600">Loading project...</div>;

  return (
    <PageLayout
      title={`Edit Project ${projectPublicId}`}
      showBackButton
      actions={
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <Card title="Project Details">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField label="Project Name *">
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </InputField>

            <InputField label="Project ID">
              <Input value={projectPublicId} disabled />
            </InputField>

            <InputField label="Client *">
              <Input
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
              />
            </InputField>

            <div className="col-span-full">
              <label className="block mb-2 font-medium">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <SelectField
              label="Manager *"
              name="manager_id"
              value={formData.manager_id}
              onChange={handleChange}
              required
              options={users.map((u) => ({
                value: u.id,
                label: `${u.first_name} ${u.last_name}`
              }))}
            />

            <SelectField
              label="Status"
              name="status_id"
              value={formData.status_id}
              onChange={handleChange}
              options={statuses.map((s) => ({
                value: s.id,
                label: s.name
              }))}
            />

            <SelectField
              label="Priority"
              name="priority_id"
              value={formData.priority_id}
              onChange={handleChange}
              options={priorities.map((p) => ({
                value: p.id,
                label: p.name
              }))}
            />

            <InputField label="Start Date">
              <Input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </InputField>

            <InputField label="End Date">
              <Input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </InputField>

            <InputField label="Estimated Hours">
              <Input
                type="number"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                step="0.5"
                min="0"
              />
            </InputField>

            <SelectField
              label="Project Group"
              name="group_id"
              value={formData.group_id}
              onChange={handleChange}
              options={projectGroups.map((g) => ({
                value: g.id,
                label: g.name
              }))}
            />

            <div className="flex items-center gap-6 pt-6 col-span-full">
              <Checkbox
                label="Save as Template"
                checked={formData.is_template}
                onChange={(e) => setFormData(prev => ({ ...prev, is_template: e.target.checked }))}
              />
              <Checkbox
                label="Archived"
                checked={formData.is_archived}
                onChange={(e) => setFormData(prev => ({ ...prev, is_archived: e.target.checked }))}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}

/* ----------------------------- Reusable Fields ----------------------------- */

function InputField({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-2 font-medium">{label}</label>
      {children}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required
}: {
  label: string;
  name: string;
  value: string;
  onChange: any;
  options: { value: number; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block mb-2 font-medium">{label}</label>
      <Select name={name} value={value} onChange={onChange} required={required}>
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}