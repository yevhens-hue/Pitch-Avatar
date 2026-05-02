const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to login page...');
  await page.goto('https://app.pitchavatar.com/auth/sign-in', { waitUntil: 'networkidle2' });

  // Handle cookies
  try {
    const acceptBtn = await page.waitForSelector('button::-p-text(Accept All)', { timeout: 3000 });
    if (acceptBtn) await acceptBtn.click();
    console.log('Accepted cookies.');
  } catch(e) {
    console.log('No cookie banner or error clicking it.');
  }

  // Wait for login inputs
  console.log('Waiting for inputs...');
  await page.waitForSelector('input[type="email"]');
  
  console.log('Typing credentials...');
  await page.type('input[type="email"]', 'yevhen.shaforostov@roi4cio.com');
  await page.type('input[type="password"]', 'zbc1ehv4xap.RWB@kmx');

  console.log('Clicking login and waiting for navigation...');
  await page.keyboard.press('Enter');
  
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    console.log('Navigation successful.');
  } catch(e) {
    console.log('Navigation wait timeout, continuing...');
    await new Promise(r => setTimeout(r, 5000));
  }

  console.log('Current URL after login:', page.url());

  console.log('Navigating to create-avatar...');
  await page.goto('https://app.pitchavatar.com/main/create-avatar', { waitUntil: 'networkidle2' });
  
  // Wait a bit for React to render
  await new Promise(r => setTimeout(r, 10000));
  
  console.log('Extracting text and taking screenshot...');
  await page.screenshot({ path: 'scratch/create-avatar2.png', fullPage: true });
  
  const textContent = await page.evaluate(() => {
    // Look specifically for elements that look like steps (1, 2, 3), labels, headers
    const elements = Array.from(document.querySelectorAll('div, span, button, h1, h2, h3, h4, p, label'));
    const uniqueText = new Set();
    elements.forEach(e => {
        if(e.childElementCount === 0 && e.innerText.trim().length > 0) {
            uniqueText.add(e.innerText.trim());
        }
    });
    return Array.from(uniqueText);
  });
  
  fs.writeFileSync('scratch/create-avatar-text2.json', JSON.stringify(textContent, null, 2));
  
  console.log('Done.');
  await browser.close();
})();
