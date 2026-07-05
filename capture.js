const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to localhost:3000...");
  await page.goto('http://localhost:3000', { timeout: 90000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Take screenshot of the dashboard
  await page.screenshot({ path: '/Users/yevhen/.gemini/antigravity-ide/brain/eec02148-efe4-4511-90c4-02fc4bafea8e/dashboard.png' });
  console.log("Saved dashboard.png");

  // Try to click the first Create button we find
  const buttons = await page.locator('button').all();
  let clicked = false;
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && (text.includes('Presentation') || text.includes('Create') || text.includes('Avatar Coach'))) {
      await btn.click();
      clicked = true;
      break;
    }
  }

  if (clicked) {
    await page.waitForTimeout(2000);
    // Click advanced settings
    const advancedBtn = page.getByText('Advanced settings', { exact: false });
    if (await advancedBtn.isVisible()) {
      await advancedBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Toggle Coach Mode
    const coachToggle = page.getByText('Enable Coach Mode', { exact: false });
    if (await coachToggle.isVisible()) {
        await coachToggle.click();
        await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: '/Users/yevhen/.gemini/antigravity-ide/brain/eec02148-efe4-4511-90c4-02fc4bafea8e/coach_modal.png' });
    console.log("Saved coach_modal.png");
    
  }

  await browser.close();
})();
