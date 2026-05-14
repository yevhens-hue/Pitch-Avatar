const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  page.on('console', msg => { if(!msg.text().includes('404') && !msg.text().includes('401')) console.log('LOG:', msg.text()); });
  
  await page.goto('https://pitch-avatar-lab.vercel.app/chat-avatar/create', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.StonlyWidget !== undefined, {timeout: 10000});
  await new Promise(r => setTimeout(r, 2000));

  console.log('--- Testing openGuide object ---');
  await page.evaluate(() => window.StonlyWidget('openGuide', { guideId: 'mdPPvKKoUL' }));
  
  // Wait up to 10 seconds to see if a tooltip becomes visible
  let found = false;
  for(let i=0; i<10; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const isVisible = await page.evaluate(() => {
      // Look for Stonly guide tooltips, usually have specific classes or ids
      const tooltips = Array.from(document.querySelectorAll('div')).filter(el => 
        el.id && el.id.includes('stonly') && el.style.display !== 'none' && el.innerHTML.includes('mdPPvKKoUL')
      );
      return tooltips.length > 0;
    });
    if (isVisible) { found = true; break; }
  }
  console.log('Tooltip visible after openGuide object:', found);

  await browser.close();
})();
