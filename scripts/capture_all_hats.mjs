// Capture both colorways at all 8 spec camera presets via /designer?preview.
// Usage: BASE_URL=http://127.0.0.1:5173 OUT_DIR=~/Desktop/mega-shop-hats node scripts/capture_all_hats.mjs
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:5173';
const outDir = path.resolve(
  (process.env.OUT_DIR || 'output/playwright/all-hats').replace(/^~/, os.homedir()),
);
await fs.mkdir(outDir, { recursive: true });

// Matches CAMERA_PRESETS order in src/components/HatScene.tsx
const ANGLES = [
  'front', 'back', 'right', 'three-quarter-right',
  'three-quarter-left', 'left', 'under-brim', 'top-down',
];
const COLORWAYS = ['black', 'white'];

const errors = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`);
});
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

for (const colorway of COLORWAYS) {
  for (let i = 0; i < ANGLES.length; i++) {
    const url = `${baseUrl}/designer?preview&colorway=${colorway}&angle=${i}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 20000 });
    await page.evaluate(() => document.fonts.ready);
    // model load + decal textures + 500ms camera tween + settle
    await page.waitForTimeout(4000);
    const box = await page.locator('canvas').first().boundingBox();
    const name = `${colorway}-${String(i + 1).padStart(2, '0')}-${ANGLES[i]}.png`;
    await page.screenshot({ path: path.join(outDir, name), clip: box ?? undefined });
    console.log(`captured ${name}`);
  }
}

console.log(`\nSaved ${COLORWAYS.length * ANGLES.length} captures to ${outDir}`);
if (errors.length) {
  console.log('Errors:');
  for (const e of [...new Set(errors)]) console.log('  ', e);
  process.exitCode = 1;
} else {
  console.log('Errors: none');
}
await browser.close();
