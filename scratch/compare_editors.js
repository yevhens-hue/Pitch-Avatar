const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  // Forward browser console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to login page...');
  await page.goto('https://admin-dev.pitchavatar.com/auth/sign-in', { waitUntil: 'networkidle2' });
  
  console.log('Waiting 3s for page to settle...');
  await new Promise(r => setTimeout(r, 3000));

  console.log('Finding inputs...');
  const emailInput = await page.$('input[type="email"]') || await page.$('input[name="email"]') || await page.$('input');
  const passwordInput = await page.$('input[type="password"]') || await page.$('input[name="password"]');
  
  if (emailInput && passwordInput) {
    console.log('Typing email...');
    await emailInput.focus();
    await emailInput.type('yevhen.shaforostov@roi4cio.com', { delay: 50 });
    
    console.log('Typing password...');
    await passwordInput.focus();
    await passwordInput.type('zbc1ehv4xap.RWB@kmx', { delay: 50 });

    console.log('Finding Войти button...');
    const buttons = await page.$$('button');
    let submitBtn;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text && text.includes('Войти')) {
        submitBtn = btn;
        break;
      }
    }

    if (submitBtn) {
      console.log('Clicking Войти button via evaluate click...');
      await page.evaluate(el => el.click(), submitBtn);
    } else {
      console.log('Войти button not found!');
    }
  } else {
    console.log('Inputs not found!');
  }

  console.log('Waiting 15s for login navigation and dashboard load...');
  await new Promise(r => setTimeout(r, 15000));
  
  console.log('Current URL after login attempt:', page.url());
  await page.screenshot({ path: 'scratch/after-login.png' });

  // Navigate to Template Editor
  console.log('Navigating to Template Editor (5933)...');
  await page.goto('https://admin-dev.pitchavatar.com/main/presentation-templates/5933', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 8000)); // wait for client-side load
  await page.screenshot({ path: 'scratch/template-editor-5933.png' });

  const templateDetails = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(el => el.innerText.trim());
    const buttons = Array.from(document.querySelectorAll('button')).map(el => el.innerText.trim());
    const tabs = Array.from(document.querySelectorAll('[role="tab"], .MuiTab-root')).map(el => el.innerText.trim());
    const bodyText = document.body.innerText.substring(0, 10000);
    return { headings, buttons, tabs, bodyText };
  });
  fs.writeFileSync('scratch/template-editor-5933.json', JSON.stringify(templateDetails, null, 2));

  // Navigate to Presentation Detail/Editor
  console.log('Navigating to Presentation Editor (21791)...');
  await page.goto('https://admin-dev.pitchavatar.com/main/presentations/detail/21791?page[number]=1&page[size]=10', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 8000)); // wait for client-side load
  await page.screenshot({ path: 'scratch/presentation-editor-21791.png' });

  const presentationDetails = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(el => el.innerText.trim());
    const buttons = Array.from(document.querySelectorAll('button')).map(el => el.innerText.trim());
    const tabs = Array.from(document.querySelectorAll('[role="tab"], .MuiTab-root')).map(el => el.innerText.trim());
    const bodyText = document.body.innerText.substring(0, 10000);
    return { headings, buttons, tabs, bodyText };
  });
  fs.writeFileSync('scratch/presentation-editor-21791.json', JSON.stringify(presentationDetails, null, 2));

  console.log('Finished comparison successfully.');
  await browser.close();
})();
