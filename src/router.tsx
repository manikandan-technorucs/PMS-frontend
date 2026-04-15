import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Dashboard } from '@/features/dashboard/components/Dashboard';
import { PageLoader } from '@/components/feedback/Loader/PageLoader';
import { ProtectedRoute } from '@/components/core/ProtectedRoute';
import { UnauthorizedPage } from '@/components/core/UnauthorizedPage';
import { ROLES } from '@/utils/permissions';

const PM_ONLY = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const TL_PLUS = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_LEAD];
const ALL = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.EMPLOYEE];

const ProjectsListView = React.lazy(() => import('@/features/projects/components/views/ProjectsListView').then(v => ({ default: v.ProjectsListView })));
const ProjectCreateView = React.lazy(() => import('@/features/projects/components/views/ProjectCreateView').then(v => ({ default: v.ProjectCreateView })));
const ProjectDetailView = React.lazy(() => import('@/features/projects/components/views/ProjectDetailView').then(v => ({ default: v.ProjectDetailView })));
const ProjectEditView = React.lazy(() => import('@/features/projects/components/views/ProjectEditView').then(v => ({ default: v.ProjectEditView })));
const TemplatesListView = React.lazy(() => import('@/features/projects/components/views/TemplatesListView').then(v => ({ default: v.TemplatesListView })));
const TemplateCreateView = React.lazy(() => import('@/features/projects/components/views/TemplateCreateView').then(v => ({ default: v.TemplateCreateView })));

const TasksListView = React.lazy(() => import('@/features/tasks/components/views/TasksListView').then(v => ({ default: v.TasksListView })));
const TaskCreateView = React.lazy(() => import('@/features/tasks/components/views/TaskCreateView').then(v => ({ default: v.TaskCreateView })));
const TaskDetailView = React.lazy(() => import('@/features/tasks/components/views/TaskDetailView').then(v => ({ default: v.TaskDetailView })));
const TaskEditView = React.lazy(() => import('@/features/tasks/components/views/TaskEditView').then(v => ({ default: v.TaskEditView })));
const TaskImportPage = React.lazy(() => import('@/features/tasks/components/views/TaskImportView').then(v => ({ default: v.TaskImportPage })));

const IssuesList = React.lazy(() => import('@/features/issues/components/views/IssuesListView').then(v => ({ default: v.IssuesListView })));
const IssueCreate = React.lazy(() => import('@/features/issues/components/views/IssueCreateView').then(v => ({ default: v.IssueCreateView })));
const IssueDetail = React.lazy(() => import('@/features/issues/components/views/IssueDetailView').then(v => ({ default: v.IssueDetailView })));
const IssueEdit = React.lazy(() => import('@/features/issues/components/views/IssueEditView').then(v => ({ default: v.IssueEditView })));
const IssueImportPage = React.lazy(() => import('@/features/issues/components/IssueImport').then(v => ({ default: v.IssueImportPage })));

const TimeLog = React.lazy(() => import('@/features/timelogs/components/views/TimeLogListView').then(v => ({ default: v.TimeLogListView })));
const WeeklyTimeLogAdd = React.lazy(() => import('@/features/timelogs/components/views/WeeklyTimeLogAddView').then(v => ({ default: v.WeeklyTimeLogAddView })));
const TimeLogAdd = React.lazy(() => import('@/features/timelogs/components/views/TimeLogAddView').then(v => ({ default: v.TimeLogAddView })));

const UsersList = React.lazy(() => import('@/features/users/components/UsersList').then(v => ({ default: v.UsersList })));
const UserCreate = React.lazy(() => import('@/features/users/components/UserCreate').then(v => ({ default: v.UserCreate })));
const UserDetail = React.lazy(() => import('@/features/users/components/UserDetail').then(v => ({ default: v.UserDetail })));
const UserEdit = React.lazy(() => import('@/features/users/components/UserEdit').then(v => ({ default: v.UserEdit })));
const Teams = React.lazy(() => import('@/features/teams/components/Teams').then(v => ({ default: v.Teams })));
const TeamCreate = React.lazy(() => import('@/features/teams/components/TeamCreate').then(v => ({ default: v.TeamCreate })));
const TeamDetail = React.lazy(() => import('@/features/teams/components/TeamDetail').then(v => ({ default: v.TeamDetail })));
const TeamEdit = React.lazy(() => import('@/features/teams/components/TeamEdit').then(v => ({ default: v.TeamEdit })));
const Roles = React.lazy(() => import('@/features/roles/components/Roles').then(v => ({ default: v.Roles })));
const RoleCreate = React.lazy(() => import('@/features/roles/components/views/RoleCreateView').then(v => ({ default: v.RoleCreateView })));
const RoleDetail = React.lazy(() => import('@/features/roles/components/views/RoleDetailView').then(v => ({ default: v.RoleDetailView })));
const RoleEdit = React.lazy(() => import('@/features/roles/components/views/RoleEditView').then(v => ({ default: v.RoleEditView })));

const Reports = React.lazy(() => import('@/features/reports/components/Reports').then(v => ({ default: v.Reports })));
const MilestonesList = React.lazy(() => import('@/features/milestones/components/MilestonesList').then(v => ({ default: v.MilestonesList })));
const MilestoneCreate = React.lazy(() => import('@/features/milestones/components/MilestoneCreate').then(v => ({ default: v.MilestoneCreate })));
const MilestoneEditView = React.lazy(() => import('@/features/milestones/components/views/MilestoneEditView').then(v => ({ default: v.MilestoneEditView })));
const Notifications = React.lazy(() => import('@/features/notifications/components/Notifications').then(v => ({ default: v.Notifications })));
const NotificationSettings = React.lazy(() => import('@/features/notifications/components/NotificationSettings').then(v => ({ default: v.NotificationSettings })));
const Settings = React.lazy(() => import('@/features/settings/components/Settings').then(v => ({ default: v.Settings })));
const Profile = React.lazy(() => import('@/features/users/components/Profile').then(v => ({ default: v.Profile })));

export function AppRouter() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="h-full w-full"
            >
                <Suspense fallback={<PageLoader />}>
                    <Routes location={location}>
                        { }
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />

                        { }
                        <Route path="/" element={<Dashboard />} />

                        { }
                        <Route path="/projects" element={<ProjectsListView />} />
                        <Route path="/projects/create" element={
                            <ProtectedRoute allowedRoles={PM_ONLY}><ProjectCreateView /></ProtectedRoute>
                        } />
                        <Route path="/projects/:projectId" element={<ProjectDetailView />} />
                        <Route path="/projects/:projectId/edit" element={
                            <ProtectedRoute allowedRoles={TL_PLUS}><ProjectEditView /></ProtectedRoute>
                        } />
                        <Route path="/projects/:projectId/overview" element={<ProjectDetailView />} />
                        <Route path="/projects/:projectId/tasks" element={<ProjectDetailView />} />
                        <Route path="/projects/:projectId/issues" element={<ProjectDetailView />} />
                        <Route path="/projects/:projectId/milestones" element={<ProjectDetailView />} />
                        <Route path="/projects/:projectId/documents" element={<ProjectDetailView />} />
                        <Route path="/projects/:projectId/reports" element={<ProjectDetailView />} />

                        <Route path="/templates" element={<TemplatesListView />} />
                        <Route path="/templates/create" element={
                            <ProtectedRoute allowedRoles={ALL}><TemplateCreateView /></ProtectedRoute>
                        } />

                        { }
                        <Route path="/tasks" element={<TasksListView />} />
                        <Route path="/tasks/create" element={
                            <ProtectedRoute allowedRoles={TL_PLUS}><TaskCreateView /></ProtectedRoute>
                        } />
                        <Route path="/tasks/import" element={<TaskImportPage />} />
                        <Route path="/tasks/:taskId" element={<TaskDetailView />} />
                        <Route path="/tasks/:taskId/edit" element={<TaskEditView />} />

                        { }
                        <Route path="/issues" element={<IssuesList />} />
                        <Route path="/issues/create" element={
                            <ProtectedRoute allowedRoles={TL_PLUS}><IssueCreate /></ProtectedRoute>
                        } />
                        <Route path="/issues/import" element={<IssueImportPage />} />
                        <Route path="/issues/:issueId" element={<IssueDetail />} />
                        <Route path="/issues/:issueId/edit" element={<IssueEdit />} />

                        { }
                        <Route path="/time-log" element={<TimeLog />} />
                        <Route path="/time-log/add" element={<TimeLogAdd />} />
                        <Route path="/time-log/weekly-add" element={<WeeklyTimeLogAdd />} />

                        { }
                        <Route path="/reports" element={
                            <ProtectedRoute allowedRoles={TL_PLUS}><Reports /></ProtectedRoute>
                        } />

                        { }
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

                        { }
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

                        { }
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

                        { }
                        <Route path="/milestones" element={
                            <ProtectedRoute allowedRoles={TL_PLUS}><MilestonesList /></ProtectedRoute>
                        } />
                        <Route path="/milestones/create" element={
                            <ProtectedRoute allowedRoles={TL_PLUS}><MilestoneCreate /></ProtectedRoute>
                        } />
                        <Route path="/milestones/:milestoneId/edit" element={
                            <ProtectedRoute allowedRoles={TL_PLUS}><MilestoneEditView /></ProtectedRoute>
                        } />

                        { }
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/notification-settings" element={<NotificationSettings />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </Suspense>
            </motion.div>
        </AnimatePresence>
    );
}
