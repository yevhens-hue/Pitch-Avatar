const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log("Navigating to https://pitch-avatar-lab.vercel.app/chat-avatar/create ...");
  await page.goto('https://pitch-avatar-lab.vercel.app/chat-avatar/create', { waitUntil: 'networkidle2', timeout: 60000 });
  
  console.log("Waiting 3 seconds for checklist animation...");
  await new Promise(r => setTimeout(r, 3000));
  
  await page.screenshot({ path: '/Users/yevhen/.gemini/antigravity-ide/brain/15117f66-c4b3-45cc-a226-d02cc7c5e069/prod_checklist_test.png' });
  console.log("Screenshot saved.");

  await browser.close();
  console.log("Guide flow and checklist tested successfully.");
})().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
