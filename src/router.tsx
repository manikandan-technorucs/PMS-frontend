import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '@/features/dashboard/components/Dashboard'; // Dashboard eagerly loaded (critical path)

// Generic loading fallback
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
);

// Lazy load feature routes
// Projects
const ProjectsList = React.lazy(() => import('@/features/projects/components/ProjectsList').then(v => ({ default: v.ProjectsList })));
const ProjectCreate = React.lazy(() => import('@/features/projects/components/ProjectCreate').then(v => ({ default: v.ProjectCreate })));
const ProjectDetail = React.lazy(() => import('@/features/projects/components/ProjectDetail').then(v => ({ default: v.ProjectDetail })));
const ProjectEdit = React.lazy(() => import('@/features/projects/components/ProjectEdit').then(v => ({ default: v.ProjectEdit })));

// Tasks
const TasksList = React.lazy(() => import('@/features/tasks/components/TasksList').then(v => ({ default: v.TasksList })));
const TaskCreate = React.lazy(() => import('@/features/tasks/components/TaskCreate').then(v => ({ default: v.TaskCreate })));
const TaskDetail = React.lazy(() => import('@/features/tasks/components/TaskDetail').then(v => ({ default: v.TaskDetail })));
const TaskEdit = React.lazy(() => import('@/features/tasks/components/TaskEdit').then(v => ({ default: v.TaskEdit })));

// Issues
const IssuesList = React.lazy(() => import('@/features/issues/components/IssuesList').then(v => ({ default: v.IssuesList })));
const IssueCreate = React.lazy(() => import('@/features/issues/components/IssueCreate').then(v => ({ default: v.IssueCreate })));
const IssueDetail = React.lazy(() => import('@/features/issues/components/IssueDetail').then(v => ({ default: v.IssueDetail })));
const IssueEdit = React.lazy(() => import('@/features/issues/components/IssueEdit').then(v => ({ default: v.IssueEdit })));

// Time Logs & Timesheets
const TimeLog = React.lazy(() => import('@/features/timelogs/components/TimeLog').then(v => ({ default: v.TimeLog })));
const TimeLogCreate = React.lazy(() => import('@/features/timelogs/components/TimeLogCreate').then(v => ({ default: v.TimeLogCreate })));
const TimeLogEdit = React.lazy(() => import('@/features/timelogs/components/TimeLogEdit').then(v => ({ default: v.TimeLogEdit })));
const Timesheets = React.lazy(() => import('@/features/timesheets/components/TimesheetsList').then(v => ({ default: v.TimesheetsList })));
const TimesheetCreate = React.lazy(() => import('@/features/timesheets/components/TimesheetCreate').then(v => ({ default: v.TimesheetCreate })));
const TimesheetDetail = React.lazy(() => import('@/features/timesheets/components/TimesheetDetail').then(v => ({ default: v.TimesheetDetail })));
const TimesheetEdit = React.lazy(() => import('@/features/timesheets/components/TimesheetEdit').then(v => ({ default: v.TimesheetEdit })));

// Users, Teams, Roles
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

// Admin & Others
const Reports = React.lazy(() => import('@/features/reports/components/Reports').then(v => ({ default: v.Reports })));
const MilestonesList = React.lazy(() => import('@/features/milestones/components/MilestonesList').then(v => ({ default: v.MilestonesList })));
const MilestoneCreate = React.lazy(() => import('@/features/milestones/components/MilestoneCreate').then(v => ({ default: v.MilestoneCreate })));
// const Automation = React.lazy(() => import('@/features/automation/components').then(v => ({ default: v.Automation })));
// const EmailTemplates = React.lazy(() => import('@/features/email_templates/components').then(v => ({ default: v.EmailTemplates })));
const Notifications = React.lazy(() => import('@/features/notifications/components/Notifications').then(v => ({ default: v.Notifications })));
const NotificationSettings = React.lazy(() => import('@/features/notifications/components/NotificationSettings').then(v => ({ default: v.NotificationSettings })));
const Settings = React.lazy(() => import('@/features/settings/components/Settings').then(v => ({ default: v.Settings })));
const Profile = React.lazy(() => import('@/features/users/components/Profile').then(v => ({ default: v.Profile })));

export function AppRouter() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<Dashboard />} />

                {/* Projects */}
                <Route path="/projects" element={<ProjectsList />} />
                <Route path="/projects/create" element={<ProjectCreate />} />
                <Route path="/projects/:projectId" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/edit" element={<ProjectEdit />} />
                <Route path="/projects/:projectId/overview" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/tasks" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/issues" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/milestones" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/documents" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/reports" element={<ProjectDetail />} />

                {/* Tasks */}
                <Route path="/tasks" element={<TasksList />} />
                <Route path="/tasks/create" element={<TaskCreate />} />
                <Route path="/tasks/:taskId" element={<TaskDetail />} />
                <Route path="/tasks/:taskId/edit" element={<TaskEdit />} />

                {/* Issues */}
                <Route path="/issues" element={<IssuesList />} />
                <Route path="/issues/create" element={<IssueCreate />} />
                <Route path="/issues/:issueId" element={<IssueDetail />} />
                <Route path="/issues/:issueId/edit" element={<IssueEdit />} />

                {/* Time & Reports */}
                <Route path="/time-log" element={<TimeLog />} />
                <Route path="/time-log/create" element={<TimeLogCreate />} />
                <Route path="/time-log/edit/:id" element={<TimeLogEdit />} />
                <Route path="/timesheets" element={<Timesheets />} />
                <Route path="/timesheets/create" element={<TimesheetCreate />} />
                <Route path="/timesheets/edit/:id" element={<TimesheetEdit />} />
                <Route path="/timesheets/:id" element={<TimesheetDetail />} />
                <Route path="/reports" element={<Reports />} />

                {/* Users */}
                <Route path="/users" element={<UsersList />} />
                <Route path="/users/create" element={<UserCreate />} />
                <Route path="/users/:userId" element={<UserDetail />} />
                <Route path="/users/:userId/edit" element={<UserEdit />} />

                {/* Teams */}
                <Route path="/teams" element={<Teams />} />
                <Route path="/teams/create" element={<TeamCreate />} />
                <Route path="/teams/:teamId" element={<TeamDetail />} />
                <Route path="/teams/:teamId/edit" element={<TeamEdit />} />

                {/* Roles */}
                <Route path="/roles" element={<Roles />} />
                <Route path="/roles/create" element={<RoleCreate />} />
                <Route path="/roles/:roleId" element={<RoleDetail />} />
                <Route path="/roles/:roleId/edit" element={<RoleEdit />} />

                {/* Admin */}
                <Route path="/milestones" element={<MilestonesList />} />
                <Route path="/milestones/create" element={<MilestoneCreate />} />
                {/* <Route path="/automation" element={<Automation />} /> */}
                {/* <Route path="/email-templates" element={<EmailTemplates />} /> */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/notification-settings" element={<NotificationSettings />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Suspense>
    );
}
