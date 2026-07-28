const fs = require('fs');
const file = 'src/app/enrollments/Enrollments.module.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\.fullPageFormBody \{\n  padding: 2\.5rem;\n  display: flex;\n  flex-direction: column;\n  gap: 2\.5rem;\n  background: #fafafa;\n\}/g,
  `.fullPageFormBody {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-top: 1.5rem;
  margin-bottom: 3rem;
}`
);

fs.writeFileSync(file, content);
