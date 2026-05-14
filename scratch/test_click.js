const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('https://pitch-avatar-lab.vercel.app/chat-avatar/create', { waitUntil: 'networkidle2' });

  // Wait for StonlyWidget to be defined
  await page.waitForFunction(() => window.StonlyWidget !== undefined, {timeout: 10000}).catch(e => console.log("Stonly not loaded"));
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('--- Checking for Checklist Items ---');
  
  const items = await page.evaluate(() => {
    const list = document.querySelectorAll('.stonly-checklist-item');
    if (!list || list.length === 0) {
      // Check iframe if Stonly uses iframe
      const stonlyIframe = document.querySelector('#stonly-widget-iframe');
      if (stonlyIframe) {
         return "Stonly uses an iframe, we cannot access .stonly-checklist-item directly!";
      }
    }
    return Array.from(list).map(el => el.textContent);
  });
  
  console.log('Items found:', items);

  await browser.close();
})();
