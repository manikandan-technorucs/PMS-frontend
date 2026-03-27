const fs = require('fs');

function processFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('@/components/ui/Button/Button') && !content.includes('variant="')) return;

    let originalContent = content;
    content = content.replace(/import\s+\{\s*Button\s*\}\s+from\s+['"]@\/components\/ui\/Button\/Button['"];?/g, "import { Button } from 'primereact/button';");

    content = content.replace(/<Button([^>]*?)variant=(['"])outline\2([^>]*?)>/g, function(match, p1, p2, p3) {
        if ((p1+p3).includes('className=')) {
            return `<Button${p1}outlined${p3}>`.replace(/className=(['"])(.*?)\1/, `className=$1!px-4 !py-2 !text-[13px] font-medium $2$1`);
        }
        return `<Button${p1}outlined className="!px-4 !py-2 !text-[13px] font-medium"${p3}>`;
    });

    content = content.replace(/<Button([^>]*?)variant=(['"])gradient\2([^>]*?)>/g, function(match, p1, p2, p3) {
        if ((p1+p3).includes('className=')) {
            return `<Button${p1}${p3}>`.replace(/className=(['"])(.*?)\1/, `className=$1bg-brand-teal-600 hover:bg-brand-teal-700 text-white border-0 !px-4 !py-2 !text-[13px] font-medium shadow-sm $2$1`);
        }
        return `<Button${p1}className="bg-brand-teal-600 hover:bg-brand-teal-700 text-white border-0 !px-4 !py-2 !text-[13px] font-medium shadow-sm"${p3}>`;
    });

    content = content.replace(/<Button([^>]*?)variant=(['"])primary\2([^>]*?)>/g, function(match, p1, p2, p3) {
        if ((p1+p3).includes('className=')) {
            return `<Button${p1}${p3}>`.replace(/className=(['"])(.*?)\1/, `className=$1bg-brand-teal-600 hover:bg-brand-teal-700 text-white border-0 !px-4 !py-2 !text-[13px] font-medium shadow-sm $2$1`);
        }
        return `<Button${p1}className="bg-brand-teal-600 hover:bg-brand-teal-700 text-white border-0 !px-4 !py-2 !text-[13px] font-medium shadow-sm"${p3}>`;
    });

    content = content.replace(/<Button([^>]*?)variant=(['"])danger\2([^>]*?)>/g, function(match, p1, p2, p3) {
        if ((p1+p3).includes('className=')) {
            return `<Button${p1}severity="danger"${p3}>`.replace(/className=(['"])(.*?)\1/, `className=$1!px-4 !py-2 !text-[13px] font-medium $2$1`);
        }
        return `<Button${p1}severity="danger" className="!px-4 !py-2 !text-[13px] font-medium"${p3}>`;
    });

    content = content.replace(/<Button([^>]*?)variant=(['"])ghost\2([^>]*?)>/g, function(match, p1, p2, p3) {
        if ((p1+p3).includes('className=')) {
            return `<Button${p1}text${p3}>`.replace(/className=(['"])(.*?)\1/, `className=$1!px-4 !py-2 !text-[13px] font-medium $2$1`);
        }
        return `<Button${p1}text className="!px-4 !py-2 !text-[13px] font-medium"${p3}>`;
    });

    content = content.replace(/<Button([^>]*?)variant=\{?(['"])outline\2\}?([^>]*?)>/g, function(match, p1, p2, p3) {
        if ((p1+p3).includes('className=')) return `<Button${p1}outlined${p3}>`.replace(/className=(['"])(.*?)\1/, `className=$1!px-4 !py-2 !text-[13px] font-medium $2$1`);
        return `<Button${p1}outlined className="!px-4 !py-2 !text-[13px] font-medium"${p3}>`;
    });

    // Remove size="" properties as we are using tailwind for size now
    content = content.replace(/<Button([^>]*?)size=(['"])(sm|md|lg)\2([^>]*?)>/g, `<Button$1$4>`);

    if (originalContent !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
}

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            walk(file);
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
                processFile(file);
            }
        }
    });
}

walk('c:/Users/trucs/Downloads/Zoho_rep/frontend/src');
console.log('Done');
