import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { MultiSelect } from '@/shared/components/ui/MultiSelect/MultiSelect';
import { ArrowLeft } from 'lucide-react';
import { usersService } from '@/features/users/services/users.api';
import { mastersService, MasterResponse } from '@/shared/services/masters.api';
import SharedCalendar from '@/components/core/SharedCalendar';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';

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
    role_id: null as any,
    status_id: null as any,
    dept_id: null as any,
    manager_id: null as any,
    join_date: null as any,
  });

  const [selectedSkills, setSelectedSkills] = useState<Set<number>>(new Set());

  const [skills, setSkills] = useState<MasterResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;

        const [skillsData, user] = await Promise.all([
          mastersService.getSkills(),
          usersService.getUser(parseInt(userId, 10))
        ]);

        setSkills(skillsData);

        // Pre-fill form
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          employee_id: (user as any).employee_id || '',
          job_title: user.job_title || '',
          username: user.username || '',
          role_id: user.role || null,
          status_id: (user as any).status || null,
          dept_id: user.department || null,
          manager_id: (user as any).manager || null,
          join_date: user.join_date ? new Date(user.join_date) : null,
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
        const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);
        
        const payload: any = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone || null,
          job_title: formData.job_title || null,
          join_date: formData.join_date ? (formData.join_date instanceof Date ? formData.join_date.toISOString().split('T')[0] : formData.join_date) : null,
          role_id: extractId(formData.role_id),
          status_id: extractId(formData.status_id),
          dept_id: extractId(formData.dept_id),
          manager_id: extractId(formData.manager_id),
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
      showBackButton
      backPath={`/users/${userId}`}
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
                <ServerSearchDropdown 
                  entityType="masters/roles" 
                  value={formData.role_id} 
                  onChange={v => setFormData({...formData, role_id: v})} 
                  placeholder="Select Role" 
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Status
                </label>
                <ServerSearchDropdown 
                  entityType="masters/user-statuses" 
                  value={formData.status_id} 
                  onChange={v => setFormData({...formData, status_id: v})} 
                  placeholder="Select Status" 
                />
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
                <ServerSearchDropdown 
                  entityType="departments" 
                  value={formData.dept_id} 
                  onChange={v => setFormData({...formData, dept_id: v})} 
                  placeholder="Select Department" 
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Manager
                </label>
                <ServerSearchDropdown 
                  entityType="users" 
                  value={formData.manager_id} 
                  onChange={v => setFormData({...formData, manager_id: v})} 
                  placeholder="Select Manager" 
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Start Date
                </label>
                <SharedCalendar 
                  value={formData.join_date} 
                  onChange={v => setFormData({...formData, join_date: v})} 
                />
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
