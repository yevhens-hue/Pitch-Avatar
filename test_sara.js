const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/create/video', { waitUntil: 'networkidle2' });
  
  // Wait for Sara button
  await page.waitForFunction(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(b => b.textContent === 'Sara');
  }, { timeout: 10000 });

  // Dispatch quota exceeded event to trigger the bubble
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('sara_custom_event', { detail: { type: 'quota_exceeded' } }));
  });

  // Wait 1 second for animation
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: '/Users/yevhen/.gemini/antigravity-ide/brain/5224cc08-413c-4455-8ee5-6d8db5551d74/puppeteer_bubble.png' });
  console.log("Bubble screenshot saved.");

  await browser.close();
})();
