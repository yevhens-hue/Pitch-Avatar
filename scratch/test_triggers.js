const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('request', request => {
    if (request.url().includes('stonly')) {
      console.log('NETWORK:', request.url());
    }
  });

  await page.goto('https://pitch-avatar.vercel.app', { waitUntil: 'networkidle2' });

  // Wait for StonlyWidget to be defined
  await page.waitForFunction(() => window.StonlyWidget !== undefined);
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('--- Calling StonlyWidget("openContent") ---');
  await page.evaluate(() => {
    if (window.StonlyWidget) window.StonlyWidget("openContent", "GciflOn74c");
  });
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('--- Calling StonlyWidget("Tour", "start") ---');
  await page.evaluate(() => {
    if (window.StonlyWidget) window.StonlyWidget("Tour", "start", "GciflOn74c");
  });
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('--- Calling StonlyWidget("startTour") ---');
  await page.evaluate(() => {
    if (window.StonlyWidget) window.StonlyWidget("startTour", "GciflOn74c");
  });
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('--- Calling StonlyWidget.openGuide ---');
  const result = await page.evaluate(() => {
    try {
      if (typeof window.StonlyWidget.openGuide === 'function') {
        window.StonlyWidget.openGuide("GciflOn74c");
        return "openGuide called";
      }
      return "openGuide is not a function";
    } catch(e) { return e.message; }
  });
  console.log('openGuide result:', result);
  await new Promise(resolve => setTimeout(resolve, 2000));

  await browser.close();
})();
