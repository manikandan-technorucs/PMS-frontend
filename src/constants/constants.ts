/**
 * Global application constants
 */

export const THEME_COLORS = {
    TEAL: 'hsl(160 60% 45%)',
    BRAND_TEAL: '#14b8a6',
    EMERALD: '#10b981',
    RED: '#ef4444',
    ORANGE: '#f97316',
    AMBER: '#f59e0b',
    SLATE: '#64748b',
};

export const PRIORITY_COLORS: Record<string, string> = {
    critical: '#991b1b',
    high: '#9a3412',
    medium: '#854d0e',
    low: '#166534',
    none: '#6b7280',
};

export const SEVERITY_COLORS: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
    normal: '#64748b',
    blocker: '#b91c1c',
    'show stopper': '#7f1d1d',
};

export const ISSUE_CLASSIFICATIONS = [
    'None', 'Security', 'Crash/Hang', 'Data Loss', 'Performance',
    'UI/UX Usability', 'Other Bugs', 'Feature (New)', 'Enhancement',
];

export const BUG_TYPE_OPTIONS = [
    { label: 'Internal', value: 'Internal' },
    { label: 'External', value: 'External' },
];

export const REPRO_OPTIONS = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
];

export const BILLING_OPTIONS = [
    { label: 'Billable', value: 'Billable' },
    { label: 'Non-Billable', value: 'Non-Billable' },
    { label: 'Internal', value: 'Internal' },
];

export const CACHE_INVALIDATION_RESOURCES = ['tasks', 'issues', 'timelogs', 'milestones'];
export const MUTATION_METHODS = ['post', 'put', 'delete', 'patch'];
export const AUTH_TOKEN_KEY = 'pms_token';
export const AUTH_REFRESH_TOKEN_KEY = 'pms_refresh_token';
