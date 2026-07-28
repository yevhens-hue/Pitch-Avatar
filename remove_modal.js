const fs = require('fs');
const file = 'src/components/ProjectEditor/ProjectEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove LinkReadyModal rendering
const modalRegex = /\s*<LinkReadyModal[^>]*\/>/;
content = content.replace(modalRegex, '');

fs.writeFileSync(file, content);
console.log("Removed LinkReadyModal from ProjectEditor");
