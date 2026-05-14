import fs from 'fs';
import path from 'path';

/**
 * BATCH PROCESSOR PATTERN (200 REQUESTS)
 * 
 * This script demonstrates the pattern for handling mass requests (e.g. 200) 
 * in a single conversation using Gemini 1.5's massive context window.
 */

interface Task {
  id: string;
  input: string;
}

const BATCH_SIZE = 200;

async function generateBatchPrompt(tasks: Task[]) {
  const promptHeader = `
You are a high-throughput processing agent. 
Below are ${tasks.length} tasks. For each task, provide a structured response in JSON format.
Output only the JSON array containing the results.

TASK FORMAT:
{ "id": "task_id", "result": "your_analysis" }
  `;

  const tasksString = tasks.map(t => `TASK ID: ${t.id}\nINPUT: ${t.input}`).join('\n\n---\n\n');

  return `${promptHeader}\n\n${tasksString}`;
}

async function runBatch() {
  const tasksPath = path.join(process.cwd(), 'scratch/batch_tasks.json');
  
  if (!fs.existsSync(tasksPath)) {
    // Create dummy tasks for demo
    const dummyTasks = Array.from({ length: 5 }, (_, i) => ({
      id: `task_${i + 1}`,
      input: `Analyze lead feedback for project ${i + 100}`
    }));
    fs.writeFileSync(tasksPath, JSON.stringify(dummyTasks, null, 2));
    console.log('Created dummy tasks in scratch/batch_tasks.json');
  }

  const tasks: Task[] = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
  const prompt = await generateBatchPrompt(tasks);

  console.log(`Generated prompt with ${tasks.length} tasks.`);
  console.log('--- PROMPT PREVIEW ---');
  console.log(prompt.substring(0, 500) + '...');
  
  // In a real scenario, we would send this prompt to the LLM API
  // e.g. const response = await gemini.generateContent(prompt);
}

runBatch();
