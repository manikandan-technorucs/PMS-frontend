import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Input } from '@/components/ui/Input/Input';
import { SearchableMultiSelect } from '@/components/ui/SearchableMultiSelect/SearchableMultiSelect';
import { usersService } from '@/features/users/services/users.api';
import { mastersService, MasterResponse } from '@/api/masters.api';
import SharedCalendar from '@/components/core/SharedCalendar';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';
import { FormHeader, FormField, FormCard } from '@/components/ui/Form';
import { PageSpinner } from '@/components/ui/Loader/PageSpinner';
import { UserCog } from 'lucide-react';

export function UserEdit() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', employee_id: '',
    job_title: '', username: '', role_id: null as any, status_id: null as any,
    dept_id: null as any, manager_id: null as any, join_date: null as any,
  });

  const [selectedSkills, setSelectedSkills] = useState<Set<number>>(new Set());
  const [skills, setSkills] = useState<MasterResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;
        const [skillsData, user] = await Promise.all([mastersService.getSkills(), usersService.getUser(parseInt(userId, 10))]);
        setSkills(skillsData);
        setFormData({
          first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '',
          phone: user.phone || '', employee_id: (user as any).employee_id || '', job_title: user.job_title || '',
          username: user.username || '', role_id: user.role || null, status_id: (user as any).status || null,
          dept_id: user.department || null, manager_id: (user as any).manager || null,
          join_date: user.join_date ? new Date(user.join_date) : null,
        });
        if (user.skills) setSelectedSkills(new Set(user.skills.map(s => s.id)));
      } catch (error) { console.error('Failed to fetch data:', error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    try {
      const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);
      const payload: any = {
        first_name: formData.first_name, last_name: formData.last_name, email: formData.email,
        phone: formData.phone || null, job_title: formData.job_title || null,
        join_date: formData.join_date ? (formData.join_date instanceof Date ? formData.join_date.toISOString().split('T')[0] : formData.join_date) : null,
        role_id: extractId(formData.role_id), status_id: extractId(formData.status_id),
        dept_id: extractId(formData.dept_id), manager_id: extractId(formData.manager_id),
      };
      payload.skill_ids = Array.from(selectedSkills);
      await usersService.updateUser(parseInt(userId, 10), payload);
      navigate(`/users/${userId}`);
    } catch (error: any) {
      console.error('Failed to update user:', error);
      alert(error.response?.data?.detail || 'Failed to update user');
    } finally { setSubmitting(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }));

  if (loading) return <PageSpinner fullPage label="Loading user data" />;

  return (
    <PageLayout title={`Edit User`} showBackButton backPath={`/users/${userId}`}>
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto">
        <FormHeader icon={UserCog} title="Edit User" subtitle="Update user profile and account settings" color="blue" />

        <FormCard columns={3} footer={{ onCancel: () => navigate(`/users/${userId}`), submitLabel: 'Save Changes', submittingLabel: 'Saving...', isSubmitting: submitting }}>
          <FormField label="First Name" required>
            <Input name="first_name" value={formData.first_name} onChange={handleChange} required className="h-10" />
          </FormField>
          <FormField label="Last Name" required>
            <Input name="last_name" value={formData.last_name} onChange={handleChange} required className="h-10" />
          </FormField>
          <FormField label="Email" required>
            <Input name="email" value={formData.email} onChange={handleChange} type="email" required className="h-10" />
          </FormField>
          <FormField label="Employee ID">
            <Input name="employee_id" value={formData.employee_id} readOnly className="h-10 bg-gray-100" />
          </FormField>
          <FormField label="Phone">
            <Input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="h-10" />
          </FormField>
          <FormField label="Job Title">
            <Input name="job_title" value={formData.job_title} onChange={handleChange} className="h-10" />
          </FormField>
          <FormField label="Role">
            <ServerSearchDropdown entityType="masters/roles" value={formData.role_id} onChange={v => set('role_id', v)} placeholder="Select Role" />
          </FormField>
          <FormField label="Status">
            <ServerSearchDropdown entityType="masters/user-statuses" value={formData.status_id} onChange={v => set('status_id', v)} placeholder="Select Status" />
          </FormField>
          <FormField label="Department">
            <ServerSearchDropdown entityType="departments" value={formData.dept_id} onChange={v => set('dept_id', v)} placeholder="Select Department" />
          </FormField>
          <FormField label="Manager">
            <ServerSearchDropdown entityType="users" value={formData.manager_id} onChange={v => set('manager_id', v)} placeholder="Select Manager" />
          </FormField>
          <FormField label="Start Date">
            <SharedCalendar value={formData.join_date} onChange={v => set('join_date', v)} />
          </FormField>
          <div>{/* Grid spacer */}</div>
          <FormField label="Skills & Capabilities" className="md:col-span-2 lg:col-span-3">
            <SearchableMultiSelect
              options={skills.map(s => ({ id: s.id, label: s.name }))}
              selectedIds={selectedSkills}
              onChange={setSelectedSkills}
              placeholder={skills.length === 0 ? "No skills available" : "Search and select skills..."}
              emptyMessage="No skills available"
            />
          </FormField>
        </FormCard>
      </form>
    </PageLayout>
  );
}
