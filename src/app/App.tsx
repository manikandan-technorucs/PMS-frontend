import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ProjectsList } from './pages/ProjectsList';
import { ProjectDetail } from './pages/ProjectDetail';
import { ProjectCreate } from './pages/ProjectCreate';
import { ProjectEdit } from './pages/ProjectEdit';
import { TasksList } from './pages/TasksList';
import { TaskDetail } from './pages/TaskDetail';
import { TaskCreate } from './pages/TaskCreate';
import { TaskEdit } from './pages/TaskEdit';
import { IssuesList } from './pages/IssuesList';
import { IssueDetail } from './pages/IssueDetail';
import { IssueCreate } from './pages/IssueCreate';
import { IssueEdit } from './pages/IssueEdit';
import { TimeLog } from './pages/TimeLog';
import { Reports } from './pages/Reports';
import { UsersList } from './pages/UsersList';
import { UserDetail } from './pages/UserDetail';
import { UserEdit } from './pages/UserEdit';
import { UserCreate } from './pages/UserCreate';
import { Teams } from './pages/Teams';
import { TeamCreate } from './pages/TeamCreate';
import { TeamDetail } from './pages/TeamDetail';
import { TeamEdit } from './pages/TeamEdit';
import { Roles } from './pages/Roles';
import { RoleCreate } from './pages/RoleCreate';
import { RoleDetail } from './pages/RoleDetail';
import { RoleEdit } from './pages/RoleEdit';
import { Permissions } from './pages/Permissions';
import { Automation } from './pages/Automation';
import { EmailTemplates } from './pages/EmailTemplates';
import { NotificationSettings } from './pages/NotificationSettings';
import { Settings } from './pages/Settings';

function App() {
  return (
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
          <Route path="/notifications" element={<NotificationSettings />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;