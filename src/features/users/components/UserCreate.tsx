import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Input } from '@/components/ui/Input/Input';
import CoreSearchableMultiSelect from '@/components/core/SearchableMultiSelect';
import SharedCalendar from '@/components/core/SharedCalendar';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { useApi } from '@/hooks/useApi';
import { useForm } from '@/hooks/useForm';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';
import { UserPlus } from 'lucide-react';

export function UserCreate() {
  const navigate = useNavigate();
  const { post, isSubmitting } = useApi();

  const { form, setValues, handleInputChange, isFormValid } = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      employee_id: '',
      job_title: '',
      username: '',
      role_id: null as any,
      status_id: null as any,
      dept_id: null as any,
      manager_id: null as any,
      join_date: new Date(),
    },
    requiredFields: ['first_name', 'last_name', 'email', 'employee_id']
  });

  // Skills: full user objects selected via server-side multi-select
  const [selectedSkills, setSelectedSkills] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const extractId = (val: any) => {
        if (!val || val === '') return null;
        return typeof val === 'object' ? val.id : val;
      };
      const payload: any = {
        ...form,
        role_id: extractId(form.role_id),
        status_id: extractId(form.status_id),
        dept_id: extractId(form.dept_id),
        manager_id: extractId(form.manager_id),
      };
      if (!payload.username && payload.email) payload.username = payload.email.split('@')[0];
      ['phone', 'job_title'].forEach(key => { if (payload[key] === '') payload[key] = null; });
      payload.join_date = payload.join_date ? new Date(payload.join_date).toISOString().split('T')[0] : null;
      payload.skill_ids = selectedSkills.map((s: any) => (typeof s === 'object' ? s.id : s));
      await post('/users/', payload, 'User created successfully!');
      navigate('/users');
    } catch (error: any) {
      console.error('Failed to create user', error);
    }
  };

  const set = (field: string, val: any) => setValues(prev => ({...prev, [field]: val}));

  return (
    <PageLayout title="Create New User" showBackButton backPath="/users">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={UserPlus} title="User Details" subtitle="Fill in the information below to add a new team member" color="blue" />

        <FormCard
          columns={3}
          footer={{ onCancel: () => navigate('/users'), submitLabel: 'Create User', submittingLabel: 'Creating...', isSubmitting, isDisabled: !isFormValid }}
        >
          <FormField label="First Name" required>
            <Input name="first_name" value={form.first_name} onChange={handleInputChange} placeholder="First name" className="h-10" required />
          </FormField>
          <FormField label="Last Name" required>
            <Input name="last_name" value={form.last_name} onChange={handleInputChange} placeholder="Last name" className="h-10" required />
          </FormField>
          <FormField label="Email" required>
            <Input name="email" value={form.email} onChange={handleInputChange} type="email" placeholder="user@example.com" className="h-10" required />
          </FormField>

          <FormField label="Employee ID" required>
            <Input name="employee_id" value={form.employee_id} onChange={handleInputChange} placeholder="e.g. EMP-001" className="h-10" required />
          </FormField>
          <FormField label="Phone">
            <Input name="phone" value={form.phone} onChange={handleInputChange} type="tel" placeholder="+1 (555) 000-0000" className="h-10" />
          </FormField>
          <FormField label="Job Title">
            <Input name="job_title" value={form.job_title} onChange={handleInputChange} placeholder="Job title" className="h-10" />
          </FormField>

          <FormField label="Role">
            <ServerSearchDropdown entityType="masters/roles" value={form.role_id} onChange={v => set('role_id', v)} placeholder="Select Role" />
          </FormField>
          <FormField label="Status">
            <ServerSearchDropdown entityType="masters/user-statuses" value={form.status_id} onChange={v => set('status_id', v)} placeholder="Select Status" />
          </FormField>
          <FormField label="Department">
            <ServerSearchDropdown entityType="departments" value={form.dept_id} onChange={v => set('dept_id', v)} placeholder="Select Department" />
          </FormField>

          <FormField label="Manager">
            <ServerSearchDropdown entityType="users" value={form.manager_id} onChange={v => set('manager_id', v)} placeholder="Select Manager" />
          </FormField>
          <FormField label="Start Date">
            <SharedCalendar value={form.join_date} onChange={v => set('join_date', v)} />
          </FormField>
          <div>{/* Grid spacer */}</div>

          <FormField label="Skills & Capabilities" className="md:col-span-2 lg:col-span-3">
            <CoreSearchableMultiSelect
              entityType="masters/skills"
              value={selectedSkills}
              onChange={setSelectedSkills}
              placeholder="Search and select skills..."
              field="name"
            />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
