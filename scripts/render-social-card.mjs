// Renders scripts/social-card.html to the link-preview image (1200 × 630 PNG).
// Playwright is not a dependency of this repository, so pass the folder of a playwright-core
// install: node scripts/render-social-card.mjs <path to playwright-core>
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const [playwright] = process.argv.slice(2);
if (!playwright) throw new Error('Usage: node scripts/render-social-card.mjs <path to playwright-core>');
const { chromium } = createRequire(import.meta.url)(playwright);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(new URL('./social-card.html', import.meta.url).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const output = fileURLToPath(new URL('../public/assets/kale-riders-social-en-v2.png', import.meta.url));
await page.screenshot({ path: output });
await browser.close();
console.log(`wrote ${output}`);
