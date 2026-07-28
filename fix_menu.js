const fs = require('fs');
const file = 'src/components/ProjectEditor/ProjectEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace ['slides', 'settings', 'import', 'share', 'enrollments'] with ['slides', 'settings', 'import', 'enrollments']
// And other variations
content = content.replace(/'share', 'enrollments'/g, "'enrollments'");
// Remove the isHRSkin filter for 'share' since it's already removed
content = content.replace(/  if \(isHRSkin\) \{\n    items = items\.filter\(item => item !== 'share'\);\n  \}\n/g, "");

fs.writeFileSync(file, content);
console.log("Removed 'share' from visibleMenuItems");
