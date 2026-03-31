import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '@/features/dashboard/components/Dashboard';
import { PageLoader } from '@/components/ui/Loader/PageLoader';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { UnauthorizedPage } from '@/components/ui/UnauthorizedPage';
import { ROLES } from '@/utils/permissions';

const PM_ONLY = [ROLES.ADMIN, ROLES.PROJECT_MANAGER];
const TL_PLUS = [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_LEAD];
const ALL = [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_LEAD, ROLES.EMPLOYEE];

// Lazy load feature routes
const ProjectsList = React.lazy(() => import('@/features/projects/components/ProjectsList').then(v => ({ default: v.ProjectsList })));
const ProjectCreate = React.lazy(() => import('@/features/projects/components/ProjectCreate').then(v => ({ default: v.ProjectCreate })));
const ProjectDetail = React.lazy(() => import('@/features/projects/components/ProjectDetail').then(v => ({ default: v.ProjectDetail })));
const ProjectEdit = React.lazy(() => import('@/features/projects/components/ProjectEdit').then(v => ({ default: v.ProjectEdit })));

const TasksList = React.lazy(() => import('@/features/tasks/components/TasksList').then(v => ({ default: v.TasksList })));
const TaskCreate = React.lazy(() => import('@/features/tasks/components/TaskCreate').then(v => ({ default: v.TaskCreate })));
const TaskDetail = React.lazy(() => import('@/features/tasks/components/TaskDetail').then(v => ({ default: v.TaskDetail })));
const TaskEdit = React.lazy(() => import('@/features/tasks/components/TaskEdit').then(v => ({ default: v.TaskEdit })));

const IssuesList = React.lazy(() => import('@/features/issues/components/IssuesList').then(v => ({ default: v.IssuesList })));
const IssueCreate = React.lazy(() => import('@/features/issues/components/IssueCreate').then(v => ({ default: v.IssueCreate })));
const IssueDetail = React.lazy(() => import('@/features/issues/components/IssueDetail').then(v => ({ default: v.IssueDetail })));
const IssueEdit = React.lazy(() => import('@/features/issues/components/IssueEdit').then(v => ({ default: v.IssueEdit })));

const TimeLog = React.lazy(() => import('@/features/timelogs/components/TimeLog').then(v => ({ default: v.TimeLog })));
const TimeLogCreate = React.lazy(() => import('@/features/timelogs/components/TimeLogCreate').then(v => ({ default: v.TimeLogCreate })));
const TimeLogEdit = React.lazy(() => import('@/features/timelogs/components/TimeLogEdit').then(v => ({ default: v.TimeLogEdit })));
const Timesheets = React.lazy(() => import('@/features/timesheets/components/TimesheetsList').then(v => ({ default: v.TimesheetsList })));
const TimesheetCreate = React.lazy(() => import('@/features/timesheets/components/TimesheetCreate').then(v => ({ default: v.TimesheetCreate })));
const TimesheetDetail = React.lazy(() => import('@/features/timesheets/components/TimesheetDetail').then(v => ({ default: v.TimesheetDetail })));
const TimesheetEdit = React.lazy(() => import('@/features/timesheets/components/TimesheetEdit').then(v => ({ default: v.TimesheetEdit })));

const UsersList = React.lazy(() => import('@/features/users/components/UsersList').then(v => ({ default: v.UsersList })));
const UserCreate = React.lazy(() => import('@/features/users/components/UserCreate').then(v => ({ default: v.UserCreate })));
const UserDetail = React.lazy(() => import('@/features/users/components/UserDetail').then(v => ({ default: v.UserDetail })));
const UserEdit = React.lazy(() => import('@/features/users/components/UserEdit').then(v => ({ default: v.UserEdit })));
const Teams = React.lazy(() => import('@/features/teams/components/Teams').then(v => ({ default: v.Teams })));
const TeamCreate = React.lazy(() => import('@/features/teams/components/TeamCreate').then(v => ({ default: v.TeamCreate })));
const TeamDetail = React.lazy(() => import('@/features/teams/components/TeamDetail').then(v => ({ default: v.TeamDetail })));
const TeamEdit = React.lazy(() => import('@/features/teams/components/TeamEdit').then(v => ({ default: v.TeamEdit })));
const Roles = React.lazy(() => import('@/features/roles/components/Roles').then(v => ({ default: v.Roles })));
const RoleCreate = React.lazy(() => import('@/features/roles/components/RoleCreate').then(v => ({ default: v.RoleCreate })));
const RoleDetail = React.lazy(() => import('@/features/roles/components/RoleDetail').then(v => ({ default: v.RoleDetail })));
const RoleEdit = React.lazy(() => import('@/features/roles/components/RoleEdit').then(v => ({ default: v.RoleEdit })));

const Reports = React.lazy(() => import('@/features/reports/components/Reports').then(v => ({ default: v.Reports })));
const MilestonesList = React.lazy(() => import('@/features/milestones/components/MilestonesList').then(v => ({ default: v.MilestonesList })));
const MilestoneCreate = React.lazy(() => import('@/features/milestones/components/MilestoneCreate').then(v => ({ default: v.MilestoneCreate })));
const Notifications = React.lazy(() => import('@/features/notifications/components/Notifications').then(v => ({ default: v.Notifications })));
const NotificationSettings = React.lazy(() => import('@/features/notifications/components/NotificationSettings').then(v => ({ default: v.NotificationSettings })));
const Settings = React.lazy(() => import('@/features/settings/components/Settings').then(v => ({ default: v.Settings })));
const Profile = React.lazy(() => import('@/features/users/components/Profile').then(v => ({ default: v.Profile })));

export function AppRouter() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Unauthorized page */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Dashboard — all roles */}
                <Route path="/" element={<Dashboard />} />

                {/* Projects — all roles can view; create/edit restricted */}
                <Route path="/projects" element={<ProjectsList />} />
                <Route path="/projects/create" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><ProjectCreate /></ProtectedRoute>
                } />
                <Route path="/projects/:projectId" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/edit" element={
                    <ProtectedRoute allowedRoles={TL_PLUS}><ProjectEdit /></ProtectedRoute>
                } />
                <Route path="/projects/:projectId/overview" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/tasks" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/issues" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/milestones" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/documents" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/reports" element={<ProjectDetail />} />

                {/* Tasks — all can view/update; TL+ can create/delete */}
                <Route path="/tasks" element={<TasksList />} />
                <Route path="/tasks/create" element={
                    <ProtectedRoute allowedRoles={TL_PLUS}><TaskCreate /></ProtectedRoute>
                } />
                <Route path="/tasks/:taskId" element={<TaskDetail />} />
                <Route path="/tasks/:taskId/edit" element={<TaskEdit />} />

                {/* Issues — all can view/update; TL+ can create/delete */}
                <Route path="/issues" element={<IssuesList />} />
                <Route path="/issues/create" element={
                    <ProtectedRoute allowedRoles={TL_PLUS}><IssueCreate /></ProtectedRoute>
                } />
                <Route path="/issues/:issueId" element={<IssueDetail />} />
                <Route path="/issues/:issueId/edit" element={<IssueEdit />} />

                {/* Time Logs — all roles */}
                <Route path="/time-log" element={<TimeLog />} />
                <Route path="/time-log/create" element={<TimeLogCreate />} />
                <Route path="/time-log/edit/:id" element={<TimeLogEdit />} />

                {/* Timesheets — all roles */}
                <Route path="/timesheets" element={<Timesheets />} />
                <Route path="/timesheets/create" element={<TimesheetCreate />} />
                <Route path="/timesheets/edit/:id" element={<TimesheetEdit />} />
                <Route path="/timesheets/:id" element={<TimesheetDetail />} />

                {/* Reports — TL and above */}
                <Route path="/reports" element={
                    <ProtectedRoute allowedRoles={TL_PLUS}><Reports /></ProtectedRoute>
                } />

                {/* Users — PM/Admin only */}
                <Route path="/users" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><UsersList /></ProtectedRoute>
                } />
                <Route path="/users/create" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><UserCreate /></ProtectedRoute>
                } />
                <Route path="/users/:userId" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><UserDetail /></ProtectedRoute>
                } />
                <Route path="/users/:userId/edit" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><UserEdit /></ProtectedRoute>
                } />

                {/* Teams — PM/Admin only */}
                <Route path="/teams" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><Teams /></ProtectedRoute>
                } />
                <Route path="/teams/create" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><TeamCreate /></ProtectedRoute>
                } />
                <Route path="/teams/:teamId" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><TeamDetail /></ProtectedRoute>
                } />
                <Route path="/teams/:teamId/edit" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><TeamEdit /></ProtectedRoute>
                } />

                {/* Roles — PM/Admin only */}
                <Route path="/roles" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><Roles /></ProtectedRoute>
                } />
                <Route path="/roles/create" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><RoleCreate /></ProtectedRoute>
                } />
                <Route path="/roles/:roleId" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><RoleDetail /></ProtectedRoute>
                } />
                <Route path="/roles/:roleId/edit" element={
                    <ProtectedRoute allowedRoles={PM_ONLY}><RoleEdit /></ProtectedRoute>
                } />

                {/* Milestones — TL and above */}
                <Route path="/milestones" element={
                    <ProtectedRoute allowedRoles={TL_PLUS}><MilestonesList /></ProtectedRoute>
                } />
                <Route path="/milestones/create" element={
                    <ProtectedRoute allowedRoles={TL_PLUS}><MilestoneCreate /></ProtectedRoute>
                } />

                {/* Notifications & Settings — all roles */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/notification-settings" element={<NotificationSettings />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Suspense>
    );
}
