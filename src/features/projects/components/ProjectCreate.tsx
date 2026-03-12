import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Textarea } from '@/shared/components/ui/Textarea/Textarea';
import { Checkbox } from '@/shared/components/ui/Checkbox/Checkbox';

import { FormField } from '@/shared/components/forms/FormField';
import { projectSchema, ProjectFormData } from '@/features/projects/types/project.types';
import { useCreateProject } from '@/features/projects/hooks/useProjects';

import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import SharedCalendar from '@/components/core/SharedCalendar';

export function ProjectCreate() {
  const navigate = useNavigate();
  const { mutateAsync: createProject, isPending } = useCreateProject();

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
      start_date: new Date().toISOString(),
      end_date: '',
    }
  });

  const startDate = form.watch('start_date');
  const endDate = form.watch('end_date');

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
                render={(field) => <Input {...field} placeholder="Acme Redesign" className="focus:border-teal-500" />}
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
                render={(field) => <Input {...field} placeholder="Client Name" className="focus:border-teal-500" />}
              />

              <FormField
                className="lg:col-span-3"
                control={form.control}
                name="description"
                label="Description"
                render={(field) => <Textarea {...field} rows={4} className="focus:border-teal-500" />}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Project Manager <span className="text-red-500">*</span></label>
                <Controller
                  control={form.control}
                  name="manager_id"
                  render={({ field }) => (
                    <ServerSearchDropdown
                      entityType="users"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select manager"
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Status</label>
                <Controller
                  control={form.control}
                  name="status_id"
                  render={({ field }) => (
                    <ServerSearchDropdown
                      entityType="masters/statuses"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Priority</label>
                <Controller
                  control={form.control}
                  name="priority_id"
                  render={({ field }) => (
                    <ServerSearchDropdown
                      entityType="masters/priorities"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Start Date</label>
                <Controller
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <SharedCalendar
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString())}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">End Date</label>
                <Controller
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <SharedCalendar
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString())}
                    />
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="estimated_hours"
                label="Estimated Hours"
                render={(field) => (
                  <Input type="number" step="0.5" min="0" {...field} value={field.value === undefined ? '' : field.value} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} className="focus:border-teal-500" />
                )}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Department</label>
                <Controller
                  control={form.control}
                  name="dept_id"
                  render={({ field }) => (
                    <ServerSearchDropdown
                      entityType="departments"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Project Group</label>
                <Controller
                  control={form.control}
                  name="group_id"
                  render={({ field }) => (
                    <ServerSearchDropdown
                      entityType="project-groups"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

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