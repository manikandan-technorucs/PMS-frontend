import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/shared/components/layout/PageWrapper/PageLayout';
import { Card } from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import { Input } from '@/shared/components/ui/Input/Input';
import { Select } from '@/shared/components/ui/Select/Select';
import { ArrowLeft, X } from 'lucide-react';
import { MultiSelect } from '@/shared/components/ui/MultiSelect/MultiSelect';
import { usersService } from '@/features/users/services/users.api';
import { mastersService, MasterResponse } from '@/shared/services/masters.api';
import { useToast } from '@/shared/context/ToastContext';
import SharedCalendar from '@/components/core/SharedCalendar';
import ServerSearchDropdown from '@/components/core/ServerSearchDropdown';

export function UserCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employee_id: '',
    job_title: '',
    username: '',
    role_id: null,
    status_id: null,
    dept_id: null,
    manager_id: null,
    join_date: new Date(),
  });

  const [selectedSkills, setSelectedSkills] = useState<Set<number>>(new Set());

  const [skills, setSkills] = useState<MasterResponse[]>([]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const sk = await mastersService.getSkills();
        setSkills(sk);
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      }
    };
    fetchMasters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let payload: any = {};
    try {
      payload = { ...formData };


      const extractId = (val: any) => (val && typeof val === 'object' ? val.id : val);
      
      ['role_id', 'status_id', 'dept_id', 'manager_id'].forEach(key => {
          payload[key] = extractId(payload[key]);
      });


      if (!payload.username && payload.email) {
        payload.username = payload.email.split('@')[0];
      }

      // Delete entirely omitted fields
      delete payload.location_id;

      ['phone', 'job_title'].forEach(key => {
        if (payload[key] === '') {
          payload[key] = null;
        }
      });
      
      payload.join_date = payload.join_date?.toISOString().split('T')[0];

      payload.skill_ids = Array.from(selectedSkills);

      await usersService.createUser(payload);
      showToast('success', 'User Created', 'The user was successfully created.');
      navigate('/users');
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        showToast('error', 'Validation Error', data.errors.map((e: any) => `${e.loc?.join('.') || 'Field'}: ${e.msg}`).join('\n'));
      } else {
        const detail = data?.detail;
        showToast('error', 'Creation Failed', typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2));
      }
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSkill = (skillId: number) => {
    setSelectedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        newSet.add(skillId);
      }
      return newSet;
    });
  };

  return (
    <PageLayout
      title="Create New User"
      showBackButton
      backPath="/users"
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
                <Input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Enter first name" required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Last Name <span className="text-[#DC2626]">*</span>
                </label>
                <Input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Enter last name" required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Email <span className="text-[#DC2626]">*</span>
                </label>
                <Input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="user@example.com" required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Phone
                </label>
                <Input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Employee ID <span className="text-[#DC2626]">*</span>
                </label>
                <Input name="employee_id" value={formData.employee_id} onChange={handleChange} placeholder="e.g. EMP-001" required />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Job Title
                </label>
                <Input name="job_title" value={formData.job_title} onChange={handleChange} placeholder="Enter job title" />
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
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button variant="ghost" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Create User
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
