const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('https://pitch-avatar-lab.vercel.app/chat-avatar/create', { waitUntil: 'networkidle2' });

  // Wait for StonlyWidget to be defined
  await page.waitForFunction(() => window.StonlyWidget !== undefined, {timeout: 10000}).catch(e => console.log("Stonly not loaded"));
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('--- Testing API for Tour mdPPvKKoUL ---');
  
  await page.evaluate(() => {
    if (window.StonlyWidget) {
       console.log("Calling openGuide with string...");
       window.StonlyWidget("openGuide", "mdPPvKKoUL");
    }
  });
  await new Promise(resolve => setTimeout(resolve, 3000));

  await page.evaluate(() => {
    if (window.StonlyWidget) {
       console.log("Calling openGuide with object...");
       window.StonlyWidget("openGuide", { guideId: "mdPPvKKoUL" });
    }
  });
  await new Promise(resolve => setTimeout(resolve, 3000));

  await browser.close();
})();
