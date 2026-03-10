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

import { Checkbox } from '@/shared/components/ui/Checkbox/Checkbox';

import { FormField } from '@/shared/components/forms/FormField';
import { projectSchema, ProjectFormData } from '@/features/projects/types/project.types';
import { useCreateProject, useProjectGroups } from '@/features/projects/hooks/useProjects';
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
  const { data: projectGroups = [], isLoading: loadingGroups } = useProjectGroups();

  const isInitializing = loadingUsers || loadingDepts || loadingTeams || loadingStatuses || loadingPriorities || loadingGroups;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      client: '',
      manager_id: '' as any,
      status_id: '' as any,
      priority_id: '' as any,
      dept_id: '' as any,
      team_id: '' as any,
      group_id: '' as any,
      is_template: false,
      is_archived: false,
      estimated_hours: '' as any,
      start_date: '',
      end_date: '',
    }
  });

  const startDate = form.watch('start_date');
  const endDate = form.watch('end_date');

  // Manual hook form cross-field validation
  const isValidDateRange = useMemo(() => {
    if (!startDate || !endDate) return true;
    return new Date(endDate as string) >= new Date(startDate as string);
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
      showBackButton
      backPath="/projects"
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
                name="group_id"
                label="Project Group"
                render={(field) => (
                  <Select {...field} value={field.value || ''}>
                    <option value="">No Group</option>
                    {projectGroups.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </Select>
                )}
              />

              <div className="flex items-center gap-6 pt-4 lg:col-span-3">
                <FormField
                  control={form.control}
                  name="is_template"
                  render={(field) => (
                    <Checkbox
                      label="Save as Template"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_archived"
                  render={(field) => (
                    <Checkbox
                      label="Mark as Archived"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </div>

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