const fs = require('fs');
const file = 'src/components/ProjectEditor/ProjectEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the shareHeaderBtn
const btnRegex = /\s*<button\s+className=\{styles\.shareHeaderBtn\}[^>]*>\s*<Share2[^>]*\/>\s*Share\s*<\/button>/;
content = content.replace(btnRegex, '');

// 2. Change styling for Share tab in topBarCenter
content = content.replace(
  'className={`${styles.mainTab} ${isCoachItem ? styles.mainTabCoach : \'\'} ${activeMenuItem === item.id ? styles.active : \'\'}`}',
  'className={`${styles.mainTab} ${item.id === \'share\' ? styles.mainTabShare : \'\'} ${isCoachItem ? styles.mainTabCoach : \'\'} ${activeMenuItem === item.id ? styles.active : \'\'}`}'
);

fs.writeFileSync(file, content);
console.log("Updated ProjectEditor.tsx");
