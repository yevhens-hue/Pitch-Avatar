const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  await page.goto('https://pitch-avatar-lab.vercel.app/chat-avatar/create', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.StonlyWidget !== undefined, {timeout: 10000});
  await new Promise(r => setTimeout(r, 2000));

  const methodsToTest = [
    () => window.StonlyWidget('openGuide', { guideId: 'mdPPvKKoUL' }),
    () => window.StonlyWidget('openGuide', 'mdPPvKKoUL'),
    () => window.StonlyWidget('startTour', 'mdPPvKKoUL'),
    () => window.StonlyWidget('startTour', { tourId: 'mdPPvKKoUL' }),
    () => window.StonlyWidget('Tour', 'start', 'mdPPvKKoUL'),
    () => window.StonlyWidget('tour', 'start', 'mdPPvKKoUL')
  ];

  for (let i = 0; i < methodsToTest.length; i++) {
    console.log(`\n--- Testing Method ${i} ---`);
    const result = await page.evaluate((index) => {
      try {
        const methods = [
          () => window.StonlyWidget('openGuide', { guideId: 'mdPPvKKoUL' }),
          () => window.StonlyWidget('openGuide', 'mdPPvKKoUL'),
          () => window.StonlyWidget('startTour', 'mdPPvKKoUL'),
          () => window.StonlyWidget('startTour', { tourId: 'mdPPvKKoUL' }),
          () => window.StonlyWidget('Tour', 'start', 'mdPPvKKoUL'),
          () => window.StonlyWidget('tour', 'start', 'mdPPvKKoUL')
        ];
        methods[index]();
        return "Executed without throwing";
      } catch (e) {
        return "Threw error: " + e.message;
      }
    }, i);
    console.log(result);
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();
})();
