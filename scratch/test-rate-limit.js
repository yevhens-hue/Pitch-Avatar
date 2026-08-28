async function run() {
  const url = 'http://localhost:3000/api/sara/chat';
  let successCount = 0;
  let failCount = 0;
  for (let i = 0; i < 12; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1' // Fake IP
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
      });
      if (res.status === 429) {
        console.log(`Request ${i+1}: Rate limited (429)`);
        failCount++;
      } else {
        console.log(`Request ${i+1}: Status ${res.status}`);
        successCount++;
      }
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log(`Success: ${successCount}, Fail (429): ${failCount}`);
}
run();
