const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('https://avatar-story-wizard.lovable.app/projects', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log("Found login form. Filling...");
      await page.fill('input[type="email"]', 'info@roi4cio.com');
      await page.fill('input[type="password"]', 'password');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(6000); // Wait for redirect and dashboard load
      
      if (!page.url().includes('/projects')) {
        await page.goto('https://avatar-story-wizard.lovable.app/projects', { waitUntil: 'networkidle' });
        await page.waitForTimeout(4000);
      }
    }
    
    const text = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    fs.writeFileSync('lovable_dump.txt', text);
    console.log("Successfully dumped page text.");
  } catch(e) {
    console.error(e);
  }
  await browser.close();
})();
