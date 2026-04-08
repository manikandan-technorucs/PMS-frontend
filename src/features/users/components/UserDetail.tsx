import React from 'react';
import { useToast } from '@/providers/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Card } from '@/components/layout/Card';
import { Button } from '@/components/forms/Button';
import { Badge } from '@/components/data-display/Badge';
import { PageSpinner } from '@/components/feedback/Loader/PageSpinner';
import { ArrowLeft, Edit, Mail, Phone, Trash2, User as UserIcon, Briefcase, Star, CheckCircle, Clock, FolderKanban } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersService, User as ApiUser } from '@/features/users/api/users.api';
import { tasksService } from '@/features/tasks/api/tasks.api';
import { timelogsService } from '@/features/timelogs/api/timelogs.api';
import { projectsService } from '@/features/projects/api/projects.api';
import { format } from 'date-fns';

interface UserActivity {
  tasksCompleted: number;
  hoursLogged: number;
  activeProjects: number;
}

export function UserDetail() {
  const { showToast } = useToast();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<UserActivity>({ tasksCompleted: 0, hoursLogged: 0, activeProjects: 0 });
  const [activityLoading, setActivityLoading] = useState(true);

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

  // Fetch activity data once user is loaded
  useEffect(() => {
    if (!user?.email) return;

    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const [tasksRes, timelogsRes, projectsRes] = await Promise.allSettled([
          tasksService.getTasks({ skip: 0, limit: 1000, assignee_email: user.email }),
          timelogsService.getTimelogs(0, 1000),
          projectsService.getProjects(0, 1000),
        ]);

        // Tasks completed (assigned to this user with "Completed" status)
        let tasksCompleted = 0;
        if (tasksRes.status === 'fulfilled') {
          const items = Array.isArray(tasksRes.value) ? tasksRes.value : (tasksRes.value as any)?.items ?? [];
          tasksCompleted = items.filter((t: any) => t.status?.name === 'Completed').length;
        }

        // Hours logged by this user
        let hoursLogged = 0;
        if (timelogsRes.status === 'fulfilled') {
          const logs = Array.isArray(timelogsRes.value) ? timelogsRes.value : [];
          hoursLogged = logs
            .filter((l: any) => l.user_email === user.email || l.user?.email === user.email)
            .reduce((acc: number, l: any) => acc + (Number(l.hours) || 0), 0);
        }

        // Active projects where this user is a member
        let activeProjects = 0;
        if (projectsRes.status === 'fulfilled') {
          const projects = Array.isArray(projectsRes.value) ? projectsRes.value : [];
          activeProjects = projects.filter((p: any) => {
            const isActive = !['Completed', 'Closed', 'Cancelled'].includes(p.status?.name || '');
            const isMember = p.users?.some(
              (u: any) => u.email === user.email || u.id === Number(userId)
            );
            return isActive && isMember;
          }).length;
        }

        setActivity({ tasksCompleted, hoursLogged, activeProjects });
      } catch (error) {
        console.error('Failed to fetch user activity:', error);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivity();
  }, [user, userId]);

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

  const activityStats = [
    {
      label: 'Tasks Done',
      value: activityLoading ? '—' : String(activity.tasksCompleted),
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Hours Logged',
      value: activityLoading ? '—' : `${activity.hoursLogged.toFixed(1)}h`,
      icon: <Clock className="w-4 h-4" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Active Projects',
      value: activityLoading ? '—' : String(activity.activeProjects),
      icon: <FolderKanban className="w-4 h-4" />,
      color: 'text-brand-teal-600 dark:text-brand-teal-400',
      bg: 'bg-brand-teal-50 dark:bg-brand-teal-900/20',
    },
  ];

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
      {/* User header strip */}
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
        {/* Left: main content */}
        <div className="col-span-2 space-y-5">
          <Card title="User Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-5 py-4">
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
            <div className="flex flex-wrap gap-2 px-5 py-4">
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
                <div className="w-full py-5 text-center border-2 border-dashed border-theme-border rounded-xl">
                  <Star className="w-6 h-6 text-theme-muted mx-auto mb-2" />
                  <p className="text-[13px] text-theme-muted font-medium">No skills assigned.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: compact sidebar cards */}
        <div className="space-y-4">
          {/* Contact — compact, auto-height */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-brand-teal-400" />
              <h3 className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Contact</h3>
            </div>
            <div className="px-4 py-3 space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-teal-50 dark:bg-brand-teal-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-brand-teal-600 dark:text-brand-teal-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Email</p>
                  <p className="text-[12px] font-semibold text-theme-primary truncate">{user.email}</p>
                </div>
              </div>
              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-teal-50 dark:bg-brand-teal-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-brand-teal-600 dark:text-brand-teal-400" />
                </div>
                <div>
                  <p className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Phone</p>
                  <p className="text-[12px] font-semibold text-theme-primary">{user.phone || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity — compact, with real data */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-indigo-400" />
              <h3 className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Activity</h3>
            </div>
            <div className="px-3 py-3 space-y-2">
              {activityStats.map(({ label, value, icon, color, bg }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bg} ${color}`}>
                      {icon}
                    </div>
                    <p className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">{label}</p>
                  </div>
                  <p className={`text-[15px] font-black leading-none ${activityLoading ? 'text-slate-300 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100'}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
