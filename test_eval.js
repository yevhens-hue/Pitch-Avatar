const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const res = await fetch('http://localhost:3000/api/coach/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: '5cfb35e3-aa02-4cc9-8778-c0e93fd350d8',
      slideId: 1,
      userMessage: 'Enablement', 
      isInitiation: false,
      language: 'Russian',
      activeScenarioId: 'b2f2e99f-5f52-4cf1-a20e-0b1809481fed'
    })
  });
  console.log(await res.json());
}
main();
