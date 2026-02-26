const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'src');

const dirsToMake = [
    'assets/styles',
    'components/ui/Button',
    'components/ui/Input',
    'components/ui/Select',
    'components/ui/Checkbox',
    'components/ui/Textarea',
    'components/ui/Card',
    'components/ui/Badge',
    'components/layout/Header',
    'components/layout/Sidebar',
    'components/layout/PageWrapper',
    'components/lists/DataTable',
    'pages/Dashboard',
    'pages/Notifications',
    'pages/Users',
    'pages/Settings',
    'pages/Projects',
    'pages/Tasks',
    'pages/Teams',
    'pages/Roles',
    'pages/TimeLog',
    'pages/Reports',
    'pages/Issues',
    'pages/Automation',
    'pages/EmailTemplates',
    'context'
];

dirsToMake.forEach(d => {
    fs.mkdirSync(path.join(projectRoot, d), { recursive: true });
});

// Move map: [oldPath, newPath]
const moveMap = [
    ['app/main.tsx', 'main.tsx'], // wait, the plan said src/app/main.tsx
    // Actually, I'll move main.tsx later if needed, but the plan was: src/main.tsx -> src/app/main.tsx. No, wait, currently it's in src/main.tsx. Move to src/app/main.tsx.
    ['main.tsx', 'app/main.tsx'],
    ['styles/theme.scss', 'assets/styles/theme.scss'],
    ['styles/components.scss', 'assets/styles/components.scss'],
    ['styles/globals.css', 'assets/styles/globals.css'], // if exists
    ['index.css', 'assets/styles/globals.css'], // renaming index.css
    ['app/context/ThemeContext.tsx', 'context/ThemeContext.tsx'],
    ['app/context/ToastContext.tsx', 'context/ToastContext.tsx'],

    // UI Components
    ['app/components/Button.tsx', 'components/ui/Button/Button.tsx'],
    ['app/components/Input.tsx', 'components/ui/Input/Input.tsx'],
    ['app/components/Select.tsx', 'components/ui/Select/Select.tsx'],
    ['app/components/Checkbox.tsx', 'components/ui/Checkbox/Checkbox.tsx'],
    ['app/components/Textarea.tsx', 'components/ui/Textarea/Textarea.tsx'],
    ['app/components/Card.tsx', 'components/ui/Card/Card.tsx'],
    ['app/components/StatCard.tsx', 'components/ui/Card/StatCard.tsx'],
    ['app/components/StatusBadge.tsx', 'components/ui/Badge/StatusBadge.tsx'],

    // Layout Components
    ['app/components/Header.tsx', 'components/layout/Header/Header.tsx'],
    ['app/components/Sidebar.tsx', 'components/layout/Sidebar/Sidebar.tsx'],
    ['app/components/PageLayout.tsx', 'components/layout/PageWrapper/PageLayout.tsx'],

    // Lists
    ['app/components/DataTable.tsx', 'components/lists/DataTable/DataTable.tsx']
];

// Pages group
const pageGroups = {
    'Dashboard': ['Dashboard.tsx'],
    'Notifications': ['Notifications.tsx', 'NotificationSettings.tsx'],
    'Users': ['Profile.tsx', 'Permissions.tsx', 'UserCreate.tsx', 'UserDetail.tsx', 'UserEdit.tsx', 'UsersList.tsx'],
    'Settings': ['Settings.tsx'],
    'Projects': ['ProjectCreate.tsx', 'ProjectDetail.tsx', 'ProjectEdit.tsx', 'ProjectsList.tsx'],
    'Tasks': ['TaskCreate.tsx', 'TaskDetail.tsx', 'TaskEdit.tsx', 'TasksList.tsx'],
    'Issues': ['IssueCreate.tsx', 'IssueDetail.tsx', 'IssueEdit.tsx', 'IssuesList.tsx'],
    'Teams': ['TeamCreate.tsx', 'TeamDetail.tsx', 'TeamEdit.tsx', 'Teams.tsx'],
    'Roles': ['RoleCreate.tsx', 'RoleDetail.tsx', 'RoleEdit.tsx', 'Roles.tsx'],
    'TimeLog': ['TimeLog.tsx', 'TimeLogCreate.tsx'],
    'Reports': ['Reports.tsx'],
    'Automation': ['Automation.tsx'],
    'EmailTemplates': ['EmailTemplates.tsx']
};

Object.keys(pageGroups).forEach(group => {
    pageGroups[group].forEach(file => {
        moveMap.push([`app/pages/${file}`, `pages/${group}/${file}`]);
    });
});

console.log("Moving files...");
moveMap.forEach(([oldP, newP]) => {
    const op = path.join(projectRoot, oldP);
    const np = path.join(projectRoot, newP);
    if (fs.existsSync(op)) {
        // ensure dir exists
        fs.mkdirSync(path.dirname(np), { recursive: true });
        // rename
        fs.renameSync(op, np);
    } else {
        console.log(`WARN: ${op} not found.`);
    }
});
console.log("Files moved!");
