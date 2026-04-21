const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('https://pitch-avatar.vercel.app', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.StonlyWidget !== undefined);
  await new Promise(resolve => setTimeout(resolve, 2000));

  const methodsToTest = [
    ['open', 'GciflOn74c'],
    ['open', { guideId: 'GciflOn74c' }],
    ['start', 'GciflOn74c'],
    ['launch', 'GciflOn74c'],
    ['tour', 'start', 'GciflOn74c'],
    ['guidedtour', 'start', 'GciflOn74c'],
    ['openGuide', 'GciflOn74c']
  ];

  for (const args of methodsToTest) {
    console.log(`--- Testing StonlyWidget(${JSON.stringify(args).slice(1, -1)}) ---`);
    await page.evaluate((testArgs) => {
      if (window.StonlyWidget) window.StonlyWidget(...testArgs);
    }, args);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await browser.close();
})();
