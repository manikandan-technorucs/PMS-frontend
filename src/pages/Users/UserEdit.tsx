import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { MultiSelect } from '@/components/ui/MultiSelect/MultiSelect';
import { ArrowLeft } from 'lucide-react';
import { usersService } from '@/services/users';
import { mastersService, MasterResponse } from '@/services/masters';

export function UserEdit() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employee_id: '',
    job_title: '',
    username: '',
    role_id: '',
    status_id: '',
    dept_id: '',
    location_id: '',
    manager_id: '',
    join_date: '',
  });

  const [selectedSkills, setSelectedSkills] = useState<Set<number>>(new Set());

  const [roles, setRoles] = useState<MasterResponse[]>([]);
  const [statuses, setStatuses] = useState<MasterResponse[]>([]);
  const [departments, setDepartments] = useState<MasterResponse[]>([]);
  const [locations, setLocations] = useState<MasterResponse[]>([]);
  const [skills, setSkills] = useState<MasterResponse[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;

        const [r, st, d, l, sk, u, user] = await Promise.all([
          mastersService.getRoles(),
          mastersService.getUserStatuses(),
          mastersService.getDepartments(),
          mastersService.getLocations(),
          mastersService.getSkills(),
          usersService.getUsers(0, 100),
          usersService.getUser(parseInt(userId, 10))
        ]);

        setRoles(r);
        setStatuses(st);
        setDepartments(d);
        setLocations(l);
        setSkills(sk);
        setManagers(u);

        // Pre-fill form
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          employee_id: (user as any).employee_id || '',
          job_title: user.job_title || '',
          username: user.username || '',
          role_id: user.role_id?.toString() || '',
          status_id: (user as any).status_id?.toString() || '',
          dept_id: user.department_id?.toString() || '',
          location_id: user.location_id?.toString() || '',
          manager_id: (user as any).manager_id?.toString() || '',
          join_date: user.join_date || '',
        });

        if (user.skills) {
          setSelectedSkills(new Set(user.skills.map(s => s.id)));
        }

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        job_title: formData.job_title || null,
        join_date: formData.join_date || null,
        role_id: formData.role_id ? parseInt(formData.role_id, 10) : null,
        status_id: formData.status_id ? parseInt(formData.status_id, 10) : null,
        dept_id: formData.dept_id ? parseInt(formData.dept_id, 10) : null,
        location_id: formData.location_id ? parseInt(formData.location_id, 10) : null,
        manager_id: formData.manager_id ? parseInt(formData.manager_id, 10) : null,
      };

      payload.skill_ids = Array.from(selectedSkills);

      await usersService.updateUser(parseInt(userId, 10), payload);
      navigate(`/users/${userId}`);
    } catch (error: any) {
      console.error('Failed to update user:', error);
      alert(error.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleCancel = () => {
    navigate(`/users/${userId}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="p-8"><p>Loading user data...</p></div>;
  }

  return (
    <PageLayout
      title={`Edit User ${userId}`}
      actions={
        <Button variant="outline" type="button" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to User
        </Button>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Personal Information */}
          <Card title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  First Name <span className="text-[#DC2626]">*</span>
                </label>
                <Input name="first_name" value={formData.first_name} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Last Name <span className="text-[#DC2626]">*</span>
                </label>
                <Input name="last_name" value={formData.last_name} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Email <span className="text-[#DC2626]">*</span>
                </label>
                <Input name="email" value={formData.email} onChange={handleChange} type="email" required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Phone
                </label>
                <Input name="phone" value={formData.phone} onChange={handleChange} type="tel" />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Employee ID (Immutable)
                </label>
                <Input name="employee_id" value={formData.employee_id} readOnly className="bg-gray-100" />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Job Title
                </label>
                <Input name="job_title" value={formData.job_title} onChange={handleChange} />
              </div>
            </div>
          </Card>

          {/* Account Settings */}
          <Card title="Account Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Role <span className="text-[#DC2626]">*</span>
                </label>
                <Select name="role_id" value={formData.role_id} onChange={handleChange} required>
                  <option value="">Select role</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Status
                </label>
                <Select name="status_id" value={formData.status_id} onChange={handleChange}>
                  <option value="">Select status</option>
                  {statuses.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>

          {/* Department & Location */}
          <Card title="Department & Location">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Department
                </label>
                <Select name="dept_id" value={formData.dept_id} onChange={handleChange}>
                  <option value="">Select department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Location
                </label>
                <Select name="location_id" value={formData.location_id} onChange={handleChange}>
                  <option value="">Select location</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Manager
                </label>
                <Select name="manager_id" value={formData.manager_id} onChange={handleChange}>
                  <option value="">Select manager</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Start Date
                </label>
                <Input name="join_date" value={formData.join_date} onChange={handleChange} type="date" />
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card title="Skills">
            <div className="space-y-4">
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                Select Capabilities
              </label>
              <MultiSelect
                value={Array.from(selectedSkills)}
                options={skills}
                onChange={(e) => setSelectedSkills(new Set(e.value))}
                optionLabel="name"
                optionValue="id"
                filter
                placeholder={skills.length === 0 ? "No skills available" : "Search and select skills"}
                maxSelectedLabels={5}
                className="w-full form-control-theme border border-[#D1D5DB] rounded-[6px]"
                display="chip"
              />
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
