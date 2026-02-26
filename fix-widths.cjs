const fs = require('fs');
const path = require('path');

const dir = './src/app/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Make forms take up full width of the container instead of awkwardly maxing out at 4xl on the left side
    content = content.replace(/className="max-w-4xl /g, 'className="');
    content = content.replace(/className={\`max-w-4xl /g, 'className={`');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed max-w-4xl width issue in ${file}`);
    }
});
