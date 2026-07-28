const fs = require('fs');

function updateFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /\{isHRSkin \? 'Enrollments' : 'Share \/ Enroll'\}/g,
    "{isHRSkin || mode === 'enrollment' ? 'Enrollments' : 'Share'}"
  );
  content = content.replace(
    /\{isHRSkin \? 'Manage enrollments for this project\.' : 'Create a new enrollment link or manage existing ones for this project\.'\}/g,
    "{isHRSkin || mode === 'enrollment' ? 'Manage enrollments for this project.' : 'Create a new share link or manage existing ones for this project.'}"
  );
  fs.writeFileSync(file, content);
}

updateFile('src/components/ProjectEditor/panels/ShareAssignPanel.tsx');
updateFile('src/components/ShareEnrollModal/ShareEnrollModal.tsx');
console.log("Updated titles in both files.");
