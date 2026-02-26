import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { ArrowLeft, Edit, Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersService, User as ApiUser } from '@/services/users';
import { format } from 'date-fns';

export function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (userId) {
          const data = await usersService.getUser(Number(userId));
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">User not found</div>;

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;

  // Mock data for UI sections not yet supported by DB
  const mockProjects = ['Enterprise Portal Redesign', 'Customer Portal v2', 'Mobile App Development'];

  return (
    <PageLayout
      title={fullName}
      actions={
        <>
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
          <Button onClick={() => navigate(`/users/${userId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit User
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card title="User Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">User ID</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{user.public_id}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Department</p>
                <p className="text-[14px] font-medium text-[#1F2937]">Dept {user.department_id || '-'}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Role</p>
                <p className="text-[14px] font-medium text-[#1F2937]">Role {user.role_id || '-'}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Status</p>
                <StatusBadge status={user.is_active ? "Active" : "Inactive"} variant="status" />
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Location</p>
                <p className="text-[14px] font-medium text-[#1F2937]">Loc {user.location_id || '-'}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Join Date</p>
                <p className="text-[14px] font-medium text-[#1F2937]">{user.join_date ? format(new Date(user.join_date), 'MMM d, yyyy') : '-'}</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Manager</p>
                <p className="text-[14px] font-medium text-[#1F2937]">-</p>
              </div>
            </div>
          </Card>

          <Card title="Assigned Projects">
            <div className="space-y-2">
              {mockProjects.map((project, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 px-3 bg-[#F8FAFC] rounded-[6px] border border-[#E5E7EB]">
                  <span className="text-[14px] text-[#1F2937]">{project}</span>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Skills">
            <div className="flex flex-wrap gap-2">
              {user.skills && user.skills.length > 0 ? (
                user.skills.map((skill) => (
                  <span key={skill.id} className="px-3 py-1 bg-[#ECFDF5] text-[#059669] text-[12px] font-medium rounded-[6px]">
                    {skill.name}
                  </span>
                ))
              ) : (
                <span className="text-[14px] text-gray-500">No skills assigned</span>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Contact Information">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ECFDF5] rounded-[6px] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#059669]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280]">Email</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ECFDF5] rounded-[6px] flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#059669]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280]">Phone</p>
                  <p className="text-[14px] font-medium text-[#1F2937]">{user.phone || '-'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Activity Stats">
            <div className="space-y-4">
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Tasks Completed</p>
                <p className="text-[24px] font-semibold text-[#1F2937]">127</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Hours Logged (Month)</p>
                <p className="text-[24px] font-semibold text-[#1F2937]">156h</p>
              </div>
              <div>
                <p className="text-[12px] text-[#6B7280] mb-1">Active Projects</p>
                <p className="text-[24px] font-semibold text-[#1F2937]">{mockProjects.length}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
