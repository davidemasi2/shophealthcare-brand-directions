import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }});
const page = await ctx.newPage();
await page.goto('http://localhost:8745/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector);
await page.waitForTimeout(500);
const data = await page.evaluate(() => {
  const el = document.querySelector('.nx-account');
  if (!el) return 'no nx-account';
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    displayCS: cs.display,
    visibilityCS: cs.visibility,
    hiddenAttr: el.hasAttribute('hidden'),
    rect: { w: r.width, h: r.height, top: r.top, left: r.left },
    classes: el.className
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
