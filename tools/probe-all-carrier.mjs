import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }});
const page = await ctx.newPage();
await page.goto('https://davidemasi2.github.io/shophealthcare-brand-directions/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE);
await page.waitForTimeout(700);

await page.evaluate(() => {
  const planSet = window.MOCK_NORA_RESPONSE;
  const vsHost = document.getElementById('dashValueStack');
  if (vsHost && window.ValueStack) window.ValueStack.mount(vsHost, { persona: window.NORA_ACTIVE_PERSONA, value: 290, currency: '$', cadence: '/mo' });
  const pcHost = document.getElementById('dashPlanCards');
  if (pcHost && window.PlanCards) window.PlanCards.mount(pcHost, { planSet: planSet, onSelect: function(){} });
  const prHost = document.getElementById('drawer-content');
  if (prHost && window.PlanReport) {
    prHost.style.display = 'block'; document.getElementById('drawer-empty').style.display = 'none';
    window.PlanReport.mount(prHost, { planSet, plan: planSet.plans[0], skipped: false });
  }
  window.LayoutDirector.setLayoutPhase('lock', { animate: false });
});
await page.waitForTimeout(900);

const all = await page.evaluate(() => {
  const els = document.querySelectorAll('.plan-card__carrier-text');
  return Array.from(els).map(el => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const shell = el.closest('.nx-shell');
    return {
      text: el.textContent,
      whiteSpace: cs.whiteSpace,
      overflow: cs.overflow,
      textOverflow: cs.textOverflow,
      width: Math.round(r.width),
      sw: el.scrollWidth,
      cw: el.clientWidth,
      shellPhase: shell ? shell.getAttribute('data-layout-phase') : 'no shell',
      ancestorTag: el.parentElement?.parentElement?.parentElement?.parentElement?.tagName.toLowerCase()
    };
  });
});
console.log(JSON.stringify(all, null, 2));
await browser.close();
