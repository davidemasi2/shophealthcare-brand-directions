import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }});
const page = await ctx.newPage();
await page.goto('http://localhost:8745/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector);
await page.waitForTimeout(700);

const data = await page.evaluate(() => {
  const dash = document.getElementById('zone-dash');
  const cs = getComputedStyle(dash);
  return {
    classes: dash.className,
    overflowY: cs.overflowY,
    overflow: cs.overflow,
    overflowX: cs.overflowX,
    position: cs.position,
    height: cs.height,
    maxHeight: cs.maxHeight,
    scrollH: dash.scrollHeight,
    clientH: dash.clientHeight,
    rect: dash.getBoundingClientRect()
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
