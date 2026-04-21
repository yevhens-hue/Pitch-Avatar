const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Log console messages from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('https://pitch-avatar.vercel.app', { waitUntil: 'networkidle2' });

  // Wait for StonlyWidget to be defined
  await page.waitForFunction(() => window.StonlyWidget !== undefined);

  // Wait a bit for it to initialize completely
  await new Promise(resolve => setTimeout(resolve, 3000));

  const widgetInfo = await page.evaluate(() => {
    const keys = Object.keys(window.StonlyWidget || {});
    let openMethods = [];
    if (window.StonlyWidget) {
      for (const key in window.StonlyWidget) {
         if (key.toLowerCase().includes('open') || key.toLowerCase().includes('tour') || key.toLowerCase().includes('guide')) {
           openMethods.push(key);
         }
      }
    }
    return {
       typeof: typeof window.StonlyWidget,
       keys: keys,
       openMethods: openMethods,
       isFunction: typeof window.StonlyWidget === 'function',
       queue: window.StonlyWidget.q || window.StonlyWidget.queue
    };
  });

  console.log('StonlyWidget Info:', JSON.stringify(widgetInfo, null, 2));

  await browser.close();
})();
