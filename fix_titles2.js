const fs = require('fs');

function updateFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /\{isHRSkin \|\| mode === 'enrollment' \? 'Enrollments' : 'Share'\}/g,
    "'Enrollments'"
  );
  content = content.replace(
    /\{isHRSkin \|\| mode === 'enrollment' \? 'Manage enrollments for this project\.' : 'Create a new share link or manage existing ones for this project\.'\}/g,
    "'Manage enrollments for this project.'"
  );
  fs.writeFileSync(file, content);
}

updateFile('src/components/ProjectEditor/panels/ShareAssignPanel.tsx');
updateFile('src/components/ShareEnrollModal/ShareEnrollModal.tsx');
console.log("Updated titles in both files to only say Enrollments.");
