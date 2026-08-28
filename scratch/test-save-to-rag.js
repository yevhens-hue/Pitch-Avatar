const fetch = require('node-fetch');

async function test() {
  const projectId = 'fab749a9-bae7-43b2-9acd-7376914aa27e';
  const questionText = 'Test question from CLI?';
  const expectedAnswer = 'Test answer from CLI';
  const expectedSlideId = '1';

  try {
    const res = await fetch('http://localhost:3000/api/coach/save-to-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        questionText,
        expectedAnswer,
        expectedSlideId,
        saveTarget: 'rag',
        category: 'Technical',
        difficulty: 'Easy',
        source: 'manual'
      })
    });
    const data = await res.json();
    console.log('Save result:', data);

    // Now let's fetch the project metadata to see if it's there
    // We can't fetch it via API easily without auth, but we can trust the API response
  } catch (err) {
    console.error(err);
  }
}

test();
