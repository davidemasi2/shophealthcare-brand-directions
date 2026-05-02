import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, forcedColors: 'active' });
const page = await ctx.newPage();
await page.goto('http://localhost:8745/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector);
await page.waitForTimeout(700);

const data = await page.evaluate(() => {
  const el = document.querySelector('.nx-drawer-title');
  if (!el) return 'no element';
  const cs = getComputedStyle(el);
  return {
    text: el.textContent.slice(0, 50),
    color: cs.color,
    backgroundColor: cs.backgroundColor,
    opacity: cs.opacity,
    fontSize: cs.fontSize
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
