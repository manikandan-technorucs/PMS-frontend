const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') && !file.includes('node_modules')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src/app');

let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix grid-cols-2,3,4 to be responsive if they aren't already
    // We only replace if there isn't already a grid-cols-1 or md:grid-cols- in the same className string
    content = content.replace(/className="([^"]*\bgrid-cols-[2-9]\b[^"]*)"/g, (match, classList) => {
        if (!classList.includes('grid-cols-1') && !classList.includes('sm:grid-cols-') && !classList.includes('md:grid-cols-') && !classList.includes('lg:grid-cols-')) {
            return `className="${classList.replace(/grid-cols-([2-9])/, 'grid-cols-1 md:grid-cols-$1')}"`;
        }
        return match;
    });

    // Same for template literals className={`...`}
    content = content.replace(/className=\{`([^`]*\bgrid-cols-[2-9]\b[^`]*)`\}/g, (match, classList) => {
        if (!classList.includes('grid-cols-1') && !classList.includes('sm:grid-cols-') && !classList.includes('md:grid-cols-') && !classList.includes('lg:grid-cols-')) {
            return `className={\`${classList.replace(/grid-cols-([2-9])/, 'grid-cols-1 md:grid-cols-$1')}\`}`;
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log(`Updated grid in: ${file}`);
    }
});

console.log(`Done. Updated grid in ${changedCount} files.`);
