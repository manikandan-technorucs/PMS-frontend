export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  TEAM_LEAD: 'Team Lead',
  EMPLOYEE: 'Employee',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const isAdmin = (role?: string | null): boolean =>
  role === ROLES.ADMIN;

export const isSuperAdmin = (role?: string | null): boolean =>
  role === ROLES.SUPER_ADMIN;

export const isTeamLead = (role?: string | null): boolean =>
  role === ROLES.TEAM_LEAD;

export const isEmployee = (role?: string | null): boolean =>
  role === ROLES.EMPLOYEE;

export const isFullAccess = (role?: string | null): boolean =>
  role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;

export const isTeamLeadOrAbove = (role?: string | null): boolean =>
  role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN || role === ROLES.TEAM_LEAD;

export const isEmployeeOnly = (role?: string | null): boolean =>
  role === ROLES.EMPLOYEE;

export const can = {
  createProject:   (role?: string | null) => isFullAccess(role),
  editProject:     (role?: string | null) => isTeamLeadOrAbove(role),
  deleteProject:   (role?: string | null) => isFullAccess(role),
  assignToProject: (role?: string | null) => isTeamLeadOrAbove(role),

  createTask: (role?: string | null) => isTeamLeadOrAbove(role),
  deleteTask: (role?: string | null) => isTeamLeadOrAbove(role),
  updateTask: (_role?: string | null) => true, 

  createIssue: (role?: string | null) => isTeamLeadOrAbove(role),
  deleteIssue: (role?: string | null) => isTeamLeadOrAbove(role),
  updateIssue: (_role?: string | null) => true,

  manageTaskLists: (role?: string | null) => isTeamLeadOrAbove(role),

  createTimelog: (_role?: string | null) => true, 
  deleteTimelog: (role?: string | null) => isTeamLeadOrAbove(role),

  createTimesheet: (_role?: string | null) => true,
  deleteTimesheet: (role?: string | null) => isTeamLeadOrAbove(role),

  createUser:   (role?: string | null) => isFullAccess(role),
  deleteUser:   (role?: string | null) => isFullAccess(role),
  manageUsers:  (role?: string | null) => isFullAccess(role),

  viewDashboard:     (_role?: string | null) => true,
  viewProjects:      (_role?: string | null) => true,
  viewTasks:         (_role?: string | null) => true,
  viewIssues:        (_role?: string | null) => true,
  viewTimeLogs:      (_role?: string | null) => true,
  viewTimesheets:    (_role?: string | null) => true,
  viewNotifications: (_role?: string | null) => true,
  viewSettings:      (_role?: string | null) => true,
  viewProfile:       (_role?: string | null) => true,

  viewReports:       (role?: string | null) => isTeamLeadOrAbove(role),
  viewMilestones:    (role?: string | null) => isTeamLeadOrAbove(role),

  viewUsers:         (role?: string | null) => isFullAccess(role),
  viewTeams:         (role?: string | null) => isFullAccess(role),
  viewRoles:         (role?: string | null) => isFullAccess(role),
};

export const settingsTabs = {
  profile:         (_role?: string | null) => true,
  notifications:   (_role?: string | null) => true,
  organization:    (role?: string | null) => isFullAccess(role),
  users:           (role?: string | null) => isFullAccess(role),
  security:        (role?: string | null) => isFullAccess(role),
  integrations:    (role?: string | null) => isFullAccess(role),
};
