const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  let hasSara = false;
  let attempts = 0;
  while (!hasSara && attempts < 10) {
    attempts++;
    console.log(`Navigating to https://pitch-avatar-lab.vercel.app/chat-avatar/ (Attempt ${attempts})...`);
    await page.goto('https://pitch-avatar-lab.vercel.app/chat-avatar/', { waitUntil: 'networkidle2', timeout: 60000 });
    
    hasSara = await page.evaluate(() => {
      const button = document.querySelector('button[aria-label="Open Sara AI assistant"]');
      return !!button;
    });
    
    if (!hasSara) {
      console.log("Sara FAB not found. Waiting 15s before retrying...");
      await new Promise(r => setTimeout(r, 15000));
    }
  }

  if (!hasSara) {
    console.error("Timeout waiting for deployment.");
    await browser.close();
    process.exit(1);
  }

  console.log("Sara FAB found! Deployment is live.");

  console.log("Dispatching quota_exceeded event to trigger bubble...");
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('sara_custom_event', { detail: { type: 'quota_exceeded' } }));
  });

  console.log("Waiting 2 seconds for animation...");
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: '/Users/yevhen/.gemini/antigravity-ide/brain/5224cc08-413c-4455-8ee5-6d8db5551d74/prod_bubble.png' });
  console.log("Bubble screenshot saved.");

  await browser.close();
})().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
