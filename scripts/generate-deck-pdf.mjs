import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const htmlPath = resolve(__dirname, 'deck.html')
const outPath  = resolve(__dirname, '../pitch-avatar-deck.pdf')

if (!existsSync(htmlPath)) {
  console.error('❌  deck.html not found at', htmlPath)
  process.exit(1)
}

console.log('🚀  Launching browser…')
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
const page    = await browser.newPage()

await page.setViewport({ width: 1280, height: 720 })
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })

// Wait for web font
await new Promise(r => setTimeout(r, 1500))

console.log('📄  Generating PDF…')
await page.pdf({
  path: outPath,
  width:  '1280px',
  height: '720px',
  printBackground: true,
  pageRanges: '',
})

await browser.close()
console.log('✅  PDF saved to:', outPath)
