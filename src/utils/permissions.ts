/**
 * Central RBAC permission utility.
 * All role checks should go through these helpers — never hardcode role strings elsewhere.
 */

export const ROLES = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project Manager',
  TEAM_LEAD: 'Team Lead',
  EMPLOYEE: 'Employee',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// ── Role predicate helpers ───────────────────────────────────
export const isAdmin = (role?: string | null): boolean =>
  role === ROLES.ADMIN;

export const isProjectManager = (role?: string | null): boolean =>
  role === ROLES.PROJECT_MANAGER;

export const isTeamLead = (role?: string | null): boolean =>
  role === ROLES.TEAM_LEAD;

export const isEmployee = (role?: string | null): boolean =>
  role === ROLES.EMPLOYEE;

/** Admin OR Project Manager — full access level */
export const isFullAccess = (role?: string | null): boolean =>
  role === ROLES.ADMIN || role === ROLES.PROJECT_MANAGER;

/** Team Lead and above (Admin, PM, TL) */
export const isTeamLeadOrAbove = (role?: string | null): boolean =>
  role === ROLES.ADMIN || role === ROLES.PROJECT_MANAGER || role === ROLES.TEAM_LEAD;

/** Employee only — most restricted */
export const isEmployeeOnly = (role?: string | null): boolean =>
  role === ROLES.EMPLOYEE;

// ── Capability checks ────────────────────────────────────────
export const can = {
  // Projects
  createProject:   (role?: string | null) => isFullAccess(role),
  editProject:     (role?: string | null) => isTeamLeadOrAbove(role),
  deleteProject:   (role?: string | null) => isFullAccess(role),
  assignToProject: (role?: string | null) => isTeamLeadOrAbove(role),

  // Tasks
  createTask: (role?: string | null) => isTeamLeadOrAbove(role),
  deleteTask: (role?: string | null) => isTeamLeadOrAbove(role),
  updateTask: (_role?: string | null) => true, // All roles can update (scoped by backend)

  // Issues
  createIssue: (role?: string | null) => isTeamLeadOrAbove(role),
  deleteIssue: (role?: string | null) => isTeamLeadOrAbove(role),
  updateIssue: (_role?: string | null) => true,

  // Timelogs
  createTimelog: (_role?: string | null) => true, // All can log time
  deleteTimelog: (role?: string | null) => isTeamLeadOrAbove(role),

  // Timesheets
  createTimesheet: (_role?: string | null) => true,
  deleteTimesheet: (role?: string | null) => isTeamLeadOrAbove(role),

  // User management
  createUser:   (role?: string | null) => isFullAccess(role),
  deleteUser:   (role?: string | null) => isFullAccess(role),
  manageUsers:  (role?: string | null) => isFullAccess(role),

  // Navigation / page access
  viewDashboard:     (_role?: string | null) => true,
  viewProjects:      (_role?: string | null) => true,
  viewTasks:         (_role?: string | null) => true,
  viewIssues:        (_role?: string | null) => true,
  viewTimeLogs:      (_role?: string | null) => true,
  viewTimesheets:    (_role?: string | null) => true,
  viewNotifications: (_role?: string | null) => true,
  viewSettings:      (_role?: string | null) => true,
  viewProfile:       (_role?: string | null) => true,

  // Restricted pages (TL and above)
  viewReports:       (role?: string | null) => isTeamLeadOrAbove(role),
  viewMilestones:    (role?: string | null) => isTeamLeadOrAbove(role),

  // Management pages (Admin/PM only)
  viewUsers:         (role?: string | null) => isFullAccess(role),
  viewTeams:         (role?: string | null) => isFullAccess(role),
  viewRoles:         (role?: string | null) => isFullAccess(role),
};

// ── Settings tab access ──────────────────────────────────────
export const settingsTabs = {
  profile:         (_role?: string | null) => true,
  notifications:   (_role?: string | null) => true,
  organization:    (role?: string | null) => isFullAccess(role),
  users:           (role?: string | null) => isFullAccess(role),
  security:        (role?: string | null) => isFullAccess(role),
  integrations:    (role?: string | null) => isFullAccess(role),
};
