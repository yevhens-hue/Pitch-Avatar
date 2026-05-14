const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Navigate directly with the parameter
  await page.goto('https://pitch-avatar-lab.vercel.app/chat-avatar/create?stonly_tour=mdPPvKKoUL', { waitUntil: 'networkidle2' });

  // Wait for StonlyWidget
  await page.waitForFunction(() => window.StonlyWidget !== undefined, {timeout: 10000}).catch(e => console.log("Stonly not loaded"));
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('--- Checking URL after 5s ---');
  console.log('Current URL:', page.url());

  // Check if tour is active (look for Stonly UI elements in the DOM)
  const isTourActive = await page.evaluate(() => {
    // Look for typical Stonly tour containers
    return document.querySelectorAll('div[class*="stonly-"]').length > 0;
  });
  console.log('Tour UI elements found:', isTourActive);

  await browser.close();
})();
