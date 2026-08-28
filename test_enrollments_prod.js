const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  let attempts = 0;
  let isDeployed = false;

  while (!isDeployed && attempts < 15) {
    attempts++;
    console.log(`Checking deployment... Attempt ${attempts}`);
    const res = await page.goto('https://pitch-avatar-lab.vercel.app/api/cron/process-enrollments', { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => null);
    
    if (res && res.status() !== 404) {
      isDeployed = true;
      console.log('Deployment is live!');
    } else {
      console.log('Still waiting (Status: ' + (res ? res.status() : 'Error') + ')');
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  if (!isDeployed) {
    console.log("Timeout waiting for deployment.");
    await browser.close();
    process.exit(1);
  }

  // Go to enrollments page
  await page.goto('https://pitch-avatar-lab.vercel.app/enrollments', { waitUntil: 'networkidle2' });
  
  // Take screenshot
  await page.screenshot({ path: '/Users/yevhen/.gemini/antigravity-ide/brain/5ba70d2a-94bd-4bd0-afca-943859c0b8ff/prod_enrollments.png' });
  console.log("Screenshot saved.");

  await browser.close();
})().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
