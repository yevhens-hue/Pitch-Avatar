/* Renders competitor_review_v3.html -> competitor_review_v3.pdf (16:9 slides) */
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const dir = __dirname;
  const htmlPath = path.join(dir, 'competitor_review_v3.html');
  const outPath = path.join(dir, 'competitor_review_v3.pdf');

  const browser = await puppeteer.launch({ headless: 'shell', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });
    // ensure web fonts are ready
    await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
    await page.pdf({
      path: outPath,
      width: '1280px',
      height: '720px',
      printBackground: true,
      pageRanges: '',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    console.log('PDF_OK ' + outPath);
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error('PDF_FAIL', e); process.exit(1); });
