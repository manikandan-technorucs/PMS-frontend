import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Checkbox } from '../components/Checkbox';
import { X, Trash2 } from 'lucide-react';

interface Permission {
  id: string;
  category: string;
  name: string;
  description: string;
}

const availablePermissions: Permission[] = [
  { id: 'proj-view', category: 'Projects', name: 'View Projects', description: 'View all project details' },
  { id: 'proj-create', category: 'Projects', name: 'Create Projects', description: 'Create new projects' },
  { id: 'proj-edit', category: 'Projects', name: 'Edit Projects', description: 'Modify project details' },
  { id: 'proj-delete', category: 'Projects', name: 'Delete Projects', description: 'Delete projects' },
  { id: 'task-view', category: 'Tasks', name: 'View Tasks', description: 'View all tasks' },
  { id: 'task-create', category: 'Tasks', name: 'Create Tasks', description: 'Create new tasks' },
  { id: 'task-edit', category: 'Tasks', name: 'Edit Tasks', description: 'Modify task details' },
  { id: 'task-delete', category: 'Tasks', name: 'Delete Tasks', description: 'Delete tasks' },
  { id: 'user-view', category: 'Users', name: 'View Users', description: 'View user profiles' },
  { id: 'user-create', category: 'Users', name: 'Create Users', description: 'Add new users' },
  { id: 'user-edit', category: 'Users', name: 'Edit Users', description: 'Modify user details' },
  { id: 'user-delete', category: 'Users', name: 'Delete Users', description: 'Remove users' },
  { id: 'report-view', category: 'Reports', name: 'View Reports', description: 'Access reports' },
  { id: 'report-export', category: 'Reports', name: 'Export Reports', description: 'Export report data' },
  { id: 'settings-view', category: 'Settings', name: 'View Settings', description: 'View system settings' },
  { id: 'settings-edit', category: 'Settings', name: 'Edit Settings', description: 'Modify system settings' },
];

export function RoleEdit() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  
  // Pre-select some permissions for demo
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(['proj-view', 'proj-create', 'proj-edit', 'task-view', 'task-create', 'task-edit', 'user-view', 'report-view'])
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    navigate(`/roles/${roleId}`);
  };

  const handleCancel = () => {
    navigate(`/roles/${roleId}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      navigate('/roles');
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <PageLayout 
      title={`Edit Role ${roleId}`}
      actions={
        <div className="flex items-center gap-3">
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Role
          </Button>
          <Button variant="ghost" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl space-y-6">
          {/* Basic Information */}
          <Card title="Basic Information">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Role Name <span className="text-[#DC2626]">*</span>
                </label>
                <Input 
                  placeholder="Enter role name" 
                  defaultValue="Project Manager"
                  required 
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Role ID <span className="text-[#DC2626]">*</span>
                </label>
                <Input 
                  placeholder="e.g. ROLE-001" 
                  defaultValue={roleId}
                  disabled
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[14px] font-medium text-[#1F2937] mb-2">
                  Description
                </label>
                <Textarea 
                  placeholder="Enter role description" 
                  defaultValue="Manage projects, tasks, and teams. Has full access to project management features including creating, editing, and monitoring projects."
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Permissions */}
          <Card title="Permissions">
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category}>
                  <h3 className="text-[16px] font-semibold text-[#1F2937] mb-3">{category}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start gap-3">
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.has(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                        />
                        <div className="flex-1">
                          <label 
                            htmlFor={permission.id}
                            className="block text-[14px] font-medium text-[#1F2937] cursor-pointer"
                          >
                            {permission.name}
                          </label>
                          <p className="text-[12px] text-[#6B7280]">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Summary */}
          <Card title="Summary">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[12px] text-[#6B7280] mb-1">Selected Permissions</label>
                <p className="text-[20px] font-semibold text-[#1F2937]">{selectedPermissions.size}</p>
              </div>
              <div>
                <label className="block text-[12px] text-[#6B7280] mb-1">Total Available</label>
                <p className="text-[20px] font-semibold text-[#1F2937]">{availablePermissions.length}</p>
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button variant="ghost" type="button" onClick={handleCancel}>
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
