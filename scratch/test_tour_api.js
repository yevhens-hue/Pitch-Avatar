const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => { if(!msg.text().includes('404') && !msg.text().includes('401')) console.log('LOG:', msg.text()); });
  
  await page.goto('https://pitch-avatar-lab.vercel.app/chat-avatar/create', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.StonlyWidget !== undefined, {timeout: 10000});
  await new Promise(r => setTimeout(r, 2000));

  console.log('--- Testing startTour ---');
  await page.evaluate(() => window.StonlyWidget('startTour', 'mdPPvKKoUL'));
  await new Promise(r => setTimeout(r, 3000));
  
  let elements = await page.evaluate(() => document.querySelectorAll('div[class*="stonly"]').length);
  console.log('Elements after startTour:', elements);

  if (elements === 0) {
    console.log('--- Testing Tour start ---');
    await page.evaluate(() => window.StonlyWidget('Tour', 'start', 'mdPPvKKoUL'));
    await new Promise(r => setTimeout(r, 3000));
    elements = await page.evaluate(() => document.querySelectorAll('div[class*="stonly"]').length);
    console.log('Elements after Tour start:', elements);
  }

  if (elements === 0) {
    console.log('--- Testing openGuide with id string ---');
    await page.evaluate(() => window.StonlyWidget('openGuide', 'mdPPvKKoUL'));
    await new Promise(r => setTimeout(r, 3000));
    elements = await page.evaluate(() => document.querySelectorAll('div[class*="stonly"]').length);
    console.log('Elements after openGuide string:', elements);
  }

  await browser.close();
})();
