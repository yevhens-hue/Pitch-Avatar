const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to login page...');
  await page.goto('https://app.pitchavatar.com/auth/sign-in', { waitUntil: 'networkidle2' });

  // Wait for login inputs
  console.log('Waiting for inputs...');
  await page.waitForSelector('input[type="email"], input[name="email"]');
  
  console.log('Typing credentials...');
  await page.type('input[type="email"], input[name="email"]', 'yevhen.shaforostov@roi4cio.com');
  await page.type('input[type="password"], input[name="password"]', 'zbc1ehv4xap.RWB@kmx');

  console.log('Clicking login...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
  ]).catch(e => console.log('Navigation wait timeout, continuing...'));

  console.log('Navigating to create-avatar...');
  await page.goto('https://app.pitchavatar.com/main/create-avatar', { waitUntil: 'networkidle2' });
  
  // Wait a bit for React to render
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Extracting text and taking screenshot...');
  await page.screenshot({ path: 'scratch/create-avatar.png', fullPage: true });
  
  const textContent = await page.evaluate(() => {
    // Return all text from buttons and headings
    const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, button, .step, [class*="step"], [role="tab"]'));
    return elements.map(e => e.innerText).filter(t => t && t.trim().length > 0);
  });
  
  fs.writeFileSync('scratch/create-avatar-text.json', JSON.stringify(textContent, null, 2));
  
  console.log('Done.');
  await browser.close();
})();
