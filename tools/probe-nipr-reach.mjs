import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }});
const page = await ctx.newPage();
await page.goto('http://localhost:8745/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector);
await page.waitForTimeout(700);

const data = await page.evaluate(() => {
  const link = document.querySelector('a[href="https://nipr.com"]');
  if (!link) return 'no link';
  const linkRect = link.getBoundingClientRect();
  const out = { linkTop: linkRect.top, linkBottom: linkRect.bottom, viewportH: window.innerHeight, ancestors: [] };
  let n = link.parentElement, depth = 0;
  while (n && n !== document.body && depth < 12) {
    const cs = getComputedStyle(n);
    out.ancestors.push({
      tag: n.tagName.toLowerCase(),
      cls: (n.className && typeof n.className === 'string') ? n.className.slice(0, 60) : null,
      overflowY: cs.overflowY,
      scrollH: n.scrollHeight,
      clientH: n.clientHeight,
      isScrollable: (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && n.scrollHeight > n.clientHeight + 1
    });
    n = n.parentElement; depth++;
  }
  return out;
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
