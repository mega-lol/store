import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const outDir = path.resolve('output/playwright');
await fs.mkdir(outDir, { recursive: true });

const errors = [];
const modelResponses = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`);
});
page.on('pageerror', (err) => {
  errors.push(`[pageerror] ${err.message}`);
});
page.on('response', (res) => {
  const url = res.url();
  if (url.includes('baseball_cap.glb') || url.includes('/models/')) {
    modelResponses.push({ url, status: res.status() });
  }
});

await page.goto('http://127.0.0.1:4173/megahats/designer', { waitUntil: 'networkidle' });
await page.waitForSelector('canvas', { timeout: 15000 });
await page.waitForTimeout(2500);

const canvas = page.locator('canvas').first();
const box = await canvas.boundingBox();
if (!box) throw new Error('Canvas not found for drag interactions');

const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;

async function capture(name) {
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
}

async function drag(dx, dy) {
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + dx, cy + dy, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(800);
}

await capture('angle-front');
await drag(260, 0);
await capture('angle-right');
await drag(-520, 0);
await capture('angle-left');
await drag(260, -180);
await capture('angle-top');
await drag(0, 320);
await capture('angle-low');

await fs.writeFile(
  path.join(outDir, 'playwright-report.json'),
  JSON.stringify({ errors, modelResponses }, null, 2),
  'utf8',
);

console.log('Saved screenshots to', outDir);
console.log('Model responses:', JSON.stringify(modelResponses));
if (errors.length) {
  console.log('Errors:');
  for (const e of errors) console.log(e);
} else {
  console.log('Errors: none');
}

await browser.close();
