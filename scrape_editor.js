const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('https://app.pitchavatar.com/main/presentations/detail/76430', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    const cookieBtn = await page.$('button:has-text("Accept All")');
    if (cookieBtn) await cookieBtn.click();
    
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log("Found login form. Filling...");
      await page.fill('input[type="email"]', 'yevhen.shaforostov@roi4cio.com');
      await page.fill('input[type="password"]', 'zbc1ehv4xap.RWB@kmx');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(10000); 
    }
    
    const text = await page.evaluate(() => document.body.innerText);
    const html = await page.evaluate(() => document.body.innerHTML);
    
    fs.writeFileSync('pitchavatar_dump.txt', text);
    console.log("Successfully dumped page text.");
  } catch(e) {
    console.error(e);
  }
  await browser.close();
})();
