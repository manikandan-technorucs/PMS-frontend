import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { ArrowLeft } from 'lucide-react';

export function UserEdit() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4567',
    role: 'Project Manager',
    department: 'Engineering',
    status: 'Active',
    location: 'San Francisco, CA',
    manager: 'John Smith',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/users/${userId}`);
  };

  return (
    <PageLayout 
      title={`Edit User ${userId}`}
      actions={
        <Button variant="outline" onClick={() => navigate(`/users/${userId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to User
        </Button>
      }
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />

            <Select
              label="Role"
              options={[
                { value: 'Project Manager', label: 'Project Manager' },
                { value: 'Senior Developer', label: 'Senior Developer' },
                { value: 'Developer', label: 'Developer' },
                { value: 'UI/UX Designer', label: 'UI/UX Designer' },
                { value: 'QA Engineer', label: 'QA Engineer' },
              ]}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />

            <Select
              label="Department"
              options={[
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Design', label: 'Design' },
                { value: 'Quality Assurance', label: 'Quality Assurance' },
                { value: 'Analytics', label: 'Analytics' },
                { value: 'Security', label: 'Security' },
              ]}
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />

            <Select
              label="Status"
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'On Hold', label: 'On Hold' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />

            <Input
              label="Manager"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button type="button" variant="outline" onClick={() => navigate(`/users/${userId}`)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </PageLayout>
  );
}
