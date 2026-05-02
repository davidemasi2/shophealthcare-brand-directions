import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }});
const page = await ctx.newPage();
await page.goto('http://localhost:8745/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE);
await page.waitForTimeout(800);

const offenders = await page.evaluate(() => {
  const out = [];
  const all = document.querySelectorAll('*');
  all.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.right > window.innerWidth + 1 && r.width > 0 && r.height > 0) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      out.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : null,
        right: Math.round(r.right),
        width: Math.round(r.width),
        text: (el.textContent || '').slice(0, 50)
      });
    }
  });
  return out;
});
console.log(`viewport=360, found ${offenders.length} offenders:`);
offenders.slice(0,30).forEach(o => console.log('  ', JSON.stringify(o)));

// Find rightmost
if (offenders.length) {
  const sorted = offenders.sort((a,b) => b.right - a.right);
  console.log('\nRIGHTMOST:');
  sorted.slice(0,5).forEach(o => console.log('  ', o.tag, o.cls?.slice(0,50), 'right=', o.right));
}

await browser.close();
