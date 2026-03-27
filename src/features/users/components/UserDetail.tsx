import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/ui/Card/Card';
import { Button } from 'primereact/button';
import { StatusBadge } from '@/components/ui/Badge/StatusBadge';
import { PageSpinner } from '@/components/ui/Loader/PageSpinner';
import { ArrowLeft, Edit, Mail, Phone, Trash2, User as UserIcon, Briefcase, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersService, User as ApiUser } from '@/features/users/services/users.api';
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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersService.deleteUser(Number(userId));
        navigate('/users');
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    }
  };

  if (loading) return <PageSpinner fullPage label="Loading user" />;
  if (!user) return <PageSpinner fullPage label="User not found" />;

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || '?';

  return (
    <PageLayout
      title={fullName}
      actions={
        <>
          <Button outlined onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
          <Button severity="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button onClick={() => navigate(`/users/${userId}/edit`)} className="btn-gradient">
            <Edit className="w-4 h-4 mr-2" />
            Edit User
          </Button>
        </>
      }
    >
      <div className="space-y-6">

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border-none shadow-lg px-8 py-6"
          style={{ background: 'var(--brand-gradient)', boxShadow: '0 10px 30px -5px rgba(12, 209, 195, 0.3)' }}>
          <div className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 50%)' }} />
          <div className="relative z-10 flex items-center gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-white/30 border-2 border-white/50 flex items-center justify-center text-slate-900 text-xl font-black flex-shrink-0 backdrop-blur-md shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-slate-900 leading-tight">{fullName}</h2>
              <p className="text-slate-800/80 text-sm font-medium mt-0.5">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={user.status?.name || 'Active'} variant="status" />
                {user.role?.name && <StatusBadge status={user.role.name} variant="status" />}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">

            {/* User Information */}
            <Card title="User Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-1">
                {[
                  { label: 'Email', value: user.email },
                  { label: 'Department', value: user.department?.name || '-' },
                  { label: 'Role', value: user.role?.name || '-' },
                  { label: 'Status', value: user.status?.name || 'Active', isBadge: true },
                  { label: 'Join Date', value: user.join_date ? format(new Date(user.join_date), 'MMM d, yyyy') : '-' },
                  { label: 'Manager', value: user.manager ? `${user.manager.first_name} ${user.manager.last_name}`.trim() : '-' },
                ].map(({ label, value, isBadge }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted">{label}</p>
                    {isBadge
                      ? <StatusBadge status={value} variant="status" />
                      : <p className="text-[14px] font-semibold text-theme-primary">{value}</p>
                    }
                  </div>
                ))}
              </div>
            </Card>

            {/* Assigned Projects */}
            <Card title="Assigned Projects">
              <div className="p-4 text-center border-2 border-dashed border-theme-border rounded-xl">
                <Briefcase className="w-8 h-8 text-theme-muted mx-auto mb-2" />
                <p className="text-[13px] text-theme-muted font-medium">No projects assigned yet.</p>
              </div>
            </Card>

            {/* Skills */}
            <Card title="Skills">
              <div className="flex flex-wrap gap-2">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 bg-brand-teal-50 text-brand-teal-700 dark:bg-brand-teal-900/20 dark:text-brand-teal-300 text-[12px] font-semibold rounded-lg border border-brand-teal-200 dark:border-brand-teal-700/30"
                    >
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <div className="w-full p-4 text-center border-2 border-dashed border-theme-border rounded-xl">
                    <Star className="w-8 h-8 text-theme-muted mx-auto mb-2" />
                    <p className="text-[13px] text-theme-muted font-medium">No skills assigned.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card title="Contact">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-teal-50 dark:bg-brand-teal-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-brand-teal-600 dark:text-brand-teal-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-theme-muted font-bold uppercase tracking-wider">Email</p>
                    <p className="text-[13px] font-semibold text-theme-primary truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-teal-50 dark:bg-brand-teal-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-brand-teal-600 dark:text-brand-teal-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-theme-muted font-bold uppercase tracking-wider">Phone</p>
                    <p className="text-[13px] font-semibold text-theme-primary">{user.phone || '-'}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Activity Stats */}
            <Card title="Activity">
              <div className="space-y-4">
                {[
                  { label: 'Tasks Completed', value: '0' },
                  { label: 'Hours Logged (Month)', value: '0h' },
                  { label: 'Active Projects', value: '0' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-theme-neutral">
                    <p className="text-[12px] text-theme-muted font-bold uppercase tracking-wide">{label}</p>
                    <p className="text-[22px] font-black text-theme-primary leading-none">{value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
