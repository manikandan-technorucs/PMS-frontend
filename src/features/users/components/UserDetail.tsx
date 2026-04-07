import React from 'react';
import { useToast } from '@/providers/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/layout/Card';
import { Button } from '@/components/forms/Button';
import { Badge } from '@/components/data-display/Badge';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { ArrowLeft, Edit, Mail, Phone, Trash2, User as UserIcon, Briefcase, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersService, User as ApiUser } from '@/features/users/api/users.api';
import { format } from 'date-fns';

export function UserDetail() {
  const { showToast } = useToast();
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
    try {
      await usersService.deleteUser(Number(userId));
      navigate('/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
      showToast('error', 'Notification', 'Failed to delete user');
    }
  };

  if (loading) return <PageSpinner fullPage label="Loading user" />;
  if (!user) return <PageSpinner fullPage label="User not found" />;

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || '?';

  return (
    <PageLayout
      title={fullName}
      subtitle={user.email}
      showBackButton
      backPath="/users"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate(`/users/${userId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit User
          </Button>
        </div>
      }
    >
      {}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40">
        <div className="w-14 h-14 rounded-2xl bg-brand-teal-100 dark:bg-brand-teal-900/30 flex items-center justify-center text-brand-teal-700 dark:text-brand-teal-300 text-xl font-black flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[17px] font-black text-slate-800 dark:text-slate-100 leading-tight">{fullName}</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{user.email}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge value={user.status?.name || 'Active'} variant="status" />
          {user.role?.name && <Badge value={user.role.name} variant="status" />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <Card title="User Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Email', value: user.email },
                { label: 'Role', value: user.role?.name || '-' },
                { label: 'Status', value: user.status?.name || 'Active', isBadge: true },
                { label: 'Join Date', value: user.join_date ? format(new Date(user.join_date), 'MMM d, yyyy') : '-' },
                { label: 'Manager', value: user.manager ? `${user.manager.first_name} ${user.manager.last_name}`.trim() : '-' },
              ].map(({ label, value, isBadge }) => (
                <div key={label} className="flex flex-col gap-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-theme-muted">{label}</p>
                  {isBadge
                    ? <Badge value={value} variant="status" />
                    : <p className="text-[14px] font-semibold text-theme-primary">{value}</p>
                  }
                </div>
              ))}
            </div>
          </Card>

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
                <div className="w-full py-6 text-center border-2 border-dashed border-theme-border rounded-xl">
                  <Star className="w-7 h-7 text-theme-muted mx-auto mb-2" />
                  <p className="text-[13px] text-theme-muted font-medium">No skills assigned.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Contact">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-teal-50 dark:bg-brand-teal-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Email</p>
                  <p className="text-[13px] font-semibold text-theme-primary truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-teal-50 dark:bg-brand-teal-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-brand-teal-600 dark:text-brand-teal-400" />
                </div>
                <div>
                  <p className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Phone</p>
                  <p className="text-[13px] font-semibold text-theme-primary">{user.phone || '-'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Activity">
            <div className="space-y-3">
              {[
                { label: 'Tasks Completed', value: '0' },
                { label: 'Hours Logged', value: '0h' },
                { label: 'Active Projects', value: '0' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-theme-neutral">
                  <p className="text-[12px] text-theme-muted font-bold uppercase tracking-wide">{label}</p>
                  <p className="text-[20px] font-black text-theme-primary leading-none">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
