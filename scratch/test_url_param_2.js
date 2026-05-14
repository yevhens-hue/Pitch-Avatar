const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if(!msg.text().includes('404') && !msg.text().includes('401')) {
       console.log('LOG:', msg.text());
    }
  });

  console.log('Navigating...');
  await page.goto('https://pitch-avatar-lab.vercel.app/chat-avatar/create?stonly_tour=mdPPvKKoUL', { waitUntil: 'networkidle2' });

  console.log('Waiting for StonlyWidget...');
  await page.waitForFunction(() => window.StonlyWidget !== undefined, {timeout: 10000}).catch(e => console.log("Stonly not loaded"));
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('--- URL after wait ---');
  console.log('Current URL:', page.url());

  const evalResult = await page.evaluate(() => {
    try {
      if (typeof window.StonlyWidget === 'function') {
        window.StonlyWidget('openGuide', { guideId: 'mdPPvKKoUL' });
        return "Executed StonlyWidget('openGuide', { guideId: 'mdPPvKKoUL' })";
      }
      return "StonlyWidget is not a function";
    } catch(e) {
      return e.toString();
    }
  });
  console.log('Eval Result:', evalResult);
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Check DOM for tour elements
  const isTourActive = await page.evaluate(() => {
    return document.querySelectorAll('.stonly-widget').length;
  });
  console.log('Stonly elements count:', isTourActive);

  await browser.close();
})();
