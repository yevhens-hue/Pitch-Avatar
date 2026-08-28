async function run() {
  try {
    const res = await fetch('https://pitch-avatar-lab.vercel.app/api/coach/save-to-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: 'c5c7328a-d15f-49c6-b379-41708023b7aa',
        questionText: 'Test',
        expectedAnswer: 'Test',
        expectedSlideId: '1',
        saveTarget: 'scenario'
      })
    });
    const data = await res.json();
    console.log("Status:", res.status, "Data:", data);
  } catch (e) {
    console.error(e.message);
  }
}
run();
