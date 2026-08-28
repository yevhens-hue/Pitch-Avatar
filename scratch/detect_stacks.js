import fs from 'fs';
import path from 'path';

const root = '/Users/yevhen/.gemini/antigravity/scratch/projects/github';
const dirs = fs.readdirSync(root).filter(file => {
  return fs.statSync(path.join(root, file)).isDirectory() && !file.startsWith('.') && file !== 'ECC' && file !== 'agent-skills';
});

const result = {};

for (const dir of dirs) {
  const dirPath = path.join(root, dir);
  const files = fs.readdirSync(dirPath);
  const langs = [];

  if (files.includes('package.json')) {
    langs.push('typescript', 'javascript');
  }
  if (files.includes('requirements.txt') || files.includes('Pipfile') || files.includes('pyproject.toml') || files.some(f => f.endsWith('.py'))) {
    if (!langs.includes('python')) langs.push('python');
  }
  if (files.includes('go.mod') || files.some(f => f.endsWith('.go'))) {
    langs.push('go');
  }
  if (files.includes('composer.json')) {
    langs.push('php');
  }
  if (files.includes('Gemfile')) {
    langs.push('ruby');
  }
  if (files.includes('Cargo.toml')) {
    langs.push('rust');
  }
  
  // Default fallback if no files recognized
  if (langs.length === 0) {
    langs.push('typescript', 'javascript'); // Default guess for web dev
  }
  
  result[dir] = langs;
}

console.log(JSON.stringify(result, null, 2));
