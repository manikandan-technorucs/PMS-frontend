const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'src');

const rawMoveMap = [
    ['app/main.tsx', 'main.tsx'],
    ['main.tsx', 'app/main.tsx'],
    ['styles/theme.scss', 'assets/styles/theme.scss'],
    ['styles/components.scss', 'assets/styles/components.scss'],
    ['app/context/ThemeContext.tsx', 'context/ThemeContext.tsx'],
    ['app/context/ToastContext.tsx', 'context/ToastContext.tsx'],
    ['app/components/Button.tsx', 'components/ui/Button/Button.tsx'],
    ['app/components/Input.tsx', 'components/ui/Input/Input.tsx'],
    ['app/components/Select.tsx', 'components/ui/Select/Select.tsx'],
    ['app/components/Checkbox.tsx', 'components/ui/Checkbox/Checkbox.tsx'],
    ['app/components/Textarea.tsx', 'components/ui/Textarea/Textarea.tsx'],
    ['app/components/Card.tsx', 'components/ui/Card/Card.tsx'],
    ['app/components/StatCard.tsx', 'components/ui/Card/StatCard.tsx'],
    ['app/components/StatusBadge.tsx', 'components/ui/Badge/StatusBadge.tsx'],
    ['app/components/Header.tsx', 'components/layout/Header/Header.tsx'],
    ['app/components/Sidebar.tsx', 'components/layout/Sidebar/Sidebar.tsx'],
    ['app/components/PageLayout.tsx', 'components/layout/PageWrapper/PageLayout.tsx'],
    ['app/components/DataTable.tsx', 'components/lists/DataTable/DataTable.tsx']
];

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
        rawMoveMap.push([`app/pages/${file}`, `pages/${group}/${file}`]);
    });
});

// build mapping of exact old paths (no ext) to new generic @ paths
// e.g. "app/components/Button" -> "@/components/ui/Button/Button"
const oldToNewPaths = {};
const newToOldPaths = {};

rawMoveMap.forEach(([op, np]) => {
    let opNoExt = op.replace(/\.tsx?$/, '').replace(/\.s?css$/, '').replace(/\.cjs$/, '');
    let npNoExt = np.replace(/\.tsx?$/, '').replace(/\.s?css$/, '').replace(/\.cjs$/, '');
    oldToNewPaths[opNoExt] = `@/${npNoExt}`;
    // keep extensions for exact file mappings
    newToOldPaths[np] = op;
});

// Helper to crawl src
function walk(dir) {
    let results = [];
    let list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const allTsxFiles = walk(projectRoot);

allTsxFiles.forEach(file => {
    // Determine what THIS file's original path was
    const relNewPath = path.relative(projectRoot, file).replace(/\\/g, '/');
    let relOldPath = newToOldPaths[relNewPath] || relNewPath; // fallback if it wasn't moved

    const oldFileDir = path.dirname(path.join(projectRoot, relOldPath));

    let content = fs.readFileSync(file, 'utf8');

    // regex to match import/export statements
    const importRegex = /(?:import|export)\s+(?:.*?)\s+from\s+['"]([^'"]+)['"]/g;

    // extra regex for lazy imports: lazy(() => import('something'))
    const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;

    let modified = false;

    function replacer(match, importPath) {
        if (!importPath.startsWith('.')) {
            return match; // not a local import
        }

        // Resolve what the import WAS pointing to originally
        const resolvedAbsolute = path.resolve(oldFileDir, importPath);

        let resolvedRelative = path.relative(projectRoot, resolvedAbsolute).replace(/\\/g, '/');

        // Remove trailing extensions from the resolved path for mapping check
        // Often imports are without extension. If it had an extension, strip it to check map
        let lookupKey = resolvedRelative.replace(/\.tsx?$/, '').replace(/\.s?css$/, '');

        // Now lookup in oldToNewPaths map
        let newImportStr = oldToNewPaths[lookupKey];

        if (newImportStr) {
            // we have a target! 
            // if original import had .scss, keep .scss
            if (importPath.endsWith('.scss')) {
                newImportStr += '.scss';
            }
            if (importPath.endsWith('.css')) {
                newImportStr += '.css';
            }
            modified = true;
            return match.replace(importPath, newImportStr);
        } else {
            // the target file wasn't specifically moved in moveMap, but maybe its parent directory changed?
            // Actually, if it's not in moveMap, it didn't move. Let's map it to @/path
            modified = true;
            return match.replace(importPath, `@/${lookupKey}`);
        }
    }

    content = content.replace(importRegex, replacer);
    content = content.replace(dynamicImportRegex, replacer);

    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
    }
});

console.log("Import paths updated!");
