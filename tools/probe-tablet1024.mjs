import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }});
const page = await ctx.newPage();
await page.goto('http://localhost:8745/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE);
await page.waitForTimeout(800);

const data = await page.evaluate(() => {
  const html = document.documentElement;
  const total = html.scrollHeight;
  const vh = window.innerHeight;
  const overflow = total - vh;

  // Direct children of body — what's contributing to height?
  const breakdown = [];
  Array.from(document.body.children).forEach(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs.display === 'none') return;
    breakdown.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : null,
      id: el.id || null,
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      height: Math.round(r.height),
      position: cs.position
    });
  });
  return { totalHeight: total, viewport: vh, overflow, breakdown };
});
console.log('Tablet 1024 page-height breakdown:');
console.log(`  scrollHeight=${data.totalHeight}, viewport=${data.viewport}, overflow=${data.overflow}`);
console.log('  body direct children:');
data.breakdown.forEach(c => console.log(`    ${c.tag}.${(c.cls||'').slice(0,40)} ${c.id?'#'+c.id:''} top=${c.top} bottom=${c.bottom} h=${c.height} pos=${c.position}`));

await browser.close();
