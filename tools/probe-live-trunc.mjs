import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }});
const page = await ctx.newPage();
await page.goto('https://davidemasi2.github.io/shophealthcare-brand-directions/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE);
await page.waitForTimeout(800);
await page.evaluate(() => {
  if (window.__v27Injected) return;
  window.__v27Injected = true;
  const planSet = window.MOCK_NORA_RESPONSE;
  const vsHost = document.getElementById('dashValueStack');
  if (vsHost && window.ValueStack && !vsHost.children.length) {
    window.ValueStack.mount(vsHost, { persona: window.NORA_ACTIVE_PERSONA, value: 290, currency: '$', cadence: '/mo' });
  }
  const pcHost = document.getElementById('dashPlanCards');
  if (pcHost && !pcHost.children.length && window.PlanCards) {
    window.PlanCards.mount(pcHost, { planSet: planSet, onSelect: function(){} });
  }
  const prHost = document.getElementById('drawer-content');
  if (prHost && window.PlanReport && !prHost.querySelector('.plan-report__root')) {
    const firstPlan = (planSet.plans || []).filter(p => p.is_recommended)[0] || planSet.plans[0];
    prHost.style.display = 'block';
    document.getElementById('drawer-empty').style.display = 'none';
    window.PlanReport.mount(prHost, { planSet, plan: firstPlan, skipped: false });
  }
  window.LayoutDirector.setLayoutPhase('lock', { animate: false });
});
await page.waitForTimeout(900);
const result = await page.evaluate(() => {
  const el = document.querySelector('.plan-card__carrier-text');
  if (!el) return 'no element';
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    text: el.textContent,
    whiteSpace: cs.whiteSpace,
    overflow: cs.overflow,
    textOverflow: cs.textOverflow,
    width: r.width,
    height: r.height,
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    truncated: el.scrollWidth > el.clientWidth + 1
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
