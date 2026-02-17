import { chromium } from 'playwright';

async function inspect() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
    }
  });
  
  page.on('pageerror', err => {
    errors.push('Page error: ' + err.message);
  });
  
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log('=== Checking for errors ===');
  await page.goto('http://localhost:8080');
  
  await page.waitForTimeout(5000);
  
  console.log('Errors:', errors);
  console.log('Warnings:', warnings.slice(0, 3));
  
  // Check root element innerHTML
  const rootHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    return {
      innerHTML: root?.innerHTML.substring(0, 500) || 'no root',
      outerHTML: root?.outerHTML.substring(0, 200) || 'no root'
    };
  });
  
  console.log('Root HTML:', rootHTML);
  
  // Take a screenshot anyway
  await page.screenshot({ path: '/tmp/homepage_test.png' });
  
  await browser.close();
}

inspect().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
