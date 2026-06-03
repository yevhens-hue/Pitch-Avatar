const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to login page...');
  await page.goto('https://avatar-story-wizard.lovable.app/admin');
  
  // Wait for login form
  await page.waitForLoadState('networkidle');
  
  console.log('Filling credentials...');
  // Adjust these selectors if needed based on standard lovable.app/admin or Supabase Auth UIs
  // Usually input type="email" and type="password"
  const emailInput = await page.locator('input[type="email"]');
  const passwordInput = await page.locator('input[type="password"]');
  
  if (await emailInput.count() > 0) {
    await emailInput.fill('info@roi4cio.com');
    await passwordInput.fill('password');
    // Click submit button
    await page.locator('button[type="submit"]').click();
  } else {
    console.log('Could not find email input, dumping HTML for debug...');
    fs.writeFileSync('login_page.html', await page.content());
  }

  // Wait for navigation or network idle after login
  await page.waitForTimeout(5000);
  
  console.log('Navigating to assignments...');
  await page.goto('https://avatar-story-wizard.lovable.app/assignments');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'assignments.png', fullPage: true });
  
  console.log('Navigating to assignments/add...');
  await page.goto('https://avatar-story-wizard.lovable.app/assignments/add');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'assignments_add.png', fullPage: true });
  
  const addHtml = await page.content();
  fs.writeFileSync('assignments_add.html', addHtml);
  
  console.log('Done.');
  await browser.close();
})();
