import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { Header } from '@/components/layout/Header/Header';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { ProjectsList } from '@/pages/Projects/ProjectsList';
import { ProjectDetail } from '@/pages/Projects/ProjectDetail';
import { ProjectCreate } from '@/pages/Projects/ProjectCreate';
import { ProjectEdit } from '@/pages/Projects/ProjectEdit';
import { TasksList } from '@/pages/Tasks/TasksList';
import { TaskDetail } from '@/pages/Tasks/TaskDetail';
import { TaskCreate } from '@/pages/Tasks/TaskCreate';
import { TaskEdit } from '@/pages/Tasks/TaskEdit';
import { IssuesList } from '@/pages/Issues/IssuesList';
import { IssueDetail } from '@/pages/Issues/IssueDetail';
import { IssueCreate } from '@/pages/Issues/IssueCreate';
import { IssueEdit } from '@/pages/Issues/IssueEdit';
import { TimeLog } from '@/pages/TimeLog/TimeLog';
import { TimeLogCreate } from '@/pages/TimeLog/TimeLogCreate';
import { Reports } from '@/pages/Reports/Reports';
import { UsersList } from '@/pages/Users/UsersList';
import { UserDetail } from '@/pages/Users/UserDetail';
import { UserEdit } from '@/pages/Users/UserEdit';
import { UserCreate } from '@/pages/Users/UserCreate';
import { Teams } from '@/pages/Teams/Teams';
import { TeamCreate } from '@/pages/Teams/TeamCreate';
import { TeamDetail } from '@/pages/Teams/TeamDetail';
import { TeamEdit } from '@/pages/Teams/TeamEdit';
import { Roles } from '@/pages/Roles/Roles';
import { RoleCreate } from '@/pages/Roles/RoleCreate';
import { RoleDetail } from '@/pages/Roles/RoleDetail';
import { RoleEdit } from '@/pages/Roles/RoleEdit';
import { Permissions } from '@/pages/Users/Permissions';
import { Automation } from '@/pages/Automation/Automation';
import { EmailTemplates } from '@/pages/EmailTemplates/EmailTemplates';
import { NotificationSettings } from '@/pages/Notifications/NotificationSettings';
import { Notifications } from '@/pages/Notifications/Notifications';
import { Settings } from '@/pages/Settings/Settings';
import { Profile } from '@/pages/Users/Profile';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#F8FAFC]">
            <Header />
            <Sidebar />
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
              <Route path="/permissions" element={<Permissions />} />
              <Route path="/automation" element={<Automation />} />
              <Route path="/email-templates" element={<EmailTemplates />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/notification-settings" element={<NotificationSettings />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;