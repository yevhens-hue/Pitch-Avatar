const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  await page.goto('https://pitch-avatar-lab.vercel.app/chat-avatar/create', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const selectors = [
    '[data-tour="avatar-selector"]',
    '[data-tour="voice-selector"]',
    '[data-tour="next-step-button"]',
    '[data-tour="instructions-input"]',
    '[data-tour="knowledge-base-input"]',
    '[data-tour="check-button"]'
  ];

  for (let sel of selectors) {
    const count = await page.evaluate((s) => document.querySelectorAll(s).length, sel);
    console.log(`Selector ${sel}: ${count} elements found.`);
  }

  await browser.close();
})();
