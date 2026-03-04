import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';

import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';

import { FormField } from '@/shared/components/forms/FormField';
import { projectSchema, ProjectFormData } from '@/features/projects/types/project.types';
import { useCreateProject } from '@/features/projects/hooks/useProjects';
import {
  useDepartments,
  useTeamsDropdown,
  useStatuses,
  usePriorities,
  useUsersDropdown
} from '@/shared/hooks/useMasterData';

export function ProjectCreate() {
  const navigate = useNavigate();
  const { mutateAsync: createProject, isPending } = useCreateProject();

  // Load cached master data
  const { data: users = [], isLoading: loadingUsers } = useUsersDropdown();
  const { data: departments = [], isLoading: loadingDepts } = useDepartments();
  const { data: teams = [], isLoading: loadingTeams } = useTeamsDropdown();
  const { data: statuses = [], isLoading: loadingStatuses } = useStatuses();
  const { data: priorities = [], isLoading: loadingPriorities } = usePriorities();

  const isInitializing = loadingUsers || loadingDepts || loadingTeams || loadingStatuses || loadingPriorities;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      client: '',
      manager_id: undefined,
      status_id: undefined,
      priority_id: undefined,
      dept_id: undefined,
      team_id: undefined,
      estimated_hours: undefined,
      start_date: '',
      end_date: '',
    }
  });

  const startDate = form.watch('start_date');
  const endDate = form.watch('end_date');

  // Manual hook form cross-field validation
  const isValidDateRange = useMemo(() => {
    if (!startDate || !endDate) return true;
    return new Date(endDate) >= new Date(startDate);
  }, [startDate, endDate]);

  const onSubmit = async (data: ProjectFormData) => {
    if (!isValidDateRange) {
      form.setError('end_date', { message: 'End date must be after start date' });
      return;
    }
    try {
      await createProject(data);
      navigate('/projects');
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to create project');
    }
  };

  const handleCancel = () => navigate('/projects');

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <PageLayout
      title="Create New Project"
      actions={
        <Button variant="ghost" onClick={handleCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Card title="Project Details">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              <FormField
                control={form.control}
                name="name"
                label="Project Name"
                required
                render={(field) => <Input {...field} placeholder="Acme Redesign" />}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Project ID</label>
                <Input value="Auto-generated (PRJ-XXXX)" disabled />
              </div>

              <FormField
                control={form.control}
                name="client"
                label="Client"
                required
                render={(field) => <Input {...field} placeholder="Client Name" />}
              />

              <FormField
                className="lg:col-span-3"
                control={form.control}
                name="description"
                label="Description"
                render={(field) => <Textarea {...field} rows={4} />}
              />

              <FormField
                control={form.control}
                name="manager_id"
                label="Project Manager"
                required
                render={(field) => (
                  <Select {...field} value={field.value || ''}>
                    <option value="">Select manager</option>
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </option>
                    ))}
                  </Select>
                )}
              />

              <FormField
                control={form.control}
                name="status_id"
                label="Status"
                render={(field) => (
                  <Select {...field} value={field.value || ''}>
                    <option value="">Select status</option>
                    {statuses.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                )}
              />

              <FormField
                control={form.control}
                name="priority_id"
                label="Priority"
                render={(field) => (
                  <Select {...field} value={field.value || ''}>
                    <option value="">Select priority</option>
                    {priorities.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                label="Start Date"
                render={(field) => <Input type="date" {...field} value={field.value || ''} />}
              />

              <FormField
                control={form.control}
                name="end_date"
                label="End Date"
                render={(field) => <Input type="date" {...field} value={field.value || ''} />}
              />

              <FormField
                control={form.control}
                name="estimated_hours"
                label="Estimated Hours"
                render={(field) => (
                  <Input type="number" step="0.5" min="0" {...field} value={field.value === undefined ? '' : field.value} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                )}
              />

              <FormField
                control={form.control}
                name="dept_id"
                label="Department"
                render={(field) => (
                  <Select {...field} value={field.value || ''}>
                    <option value="">Select department</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </Select>
                )}
              />

              <FormField
                control={form.control}
                name="team_id"
                label="Team"
                render={(field) => (
                  <Select {...field} value={field.value || ''}>
                    <option value="">Select team</option>
                    {teams.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </Select>
                )}
              />

            </div>
          </Card>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !form.formState.isDirty}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}