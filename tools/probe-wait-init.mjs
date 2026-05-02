import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }});
const page = await ctx.newPage();
await page.goto('https://davidemasi2.github.io/shophealthcare-brand-directions/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE && document.querySelector('#nx-shell[data-layout-phase]'));
console.log("Boot fully complete");
await page.waitForTimeout(200);

await page.evaluate(() => {
  const planSet = window.MOCK_NORA_RESPONSE;
  const vsHost = document.getElementById('dashValueStack');
  if (vsHost && window.ValueStack) window.ValueStack.mount(vsHost, { persona: window.NORA_ACTIVE_PERSONA, value: 290, currency: '$', cadence: '/mo' });
  const pcHost = document.getElementById('dashPlanCards');
  if (pcHost && window.PlanCards) window.PlanCards.mount(pcHost, { planSet: planSet, onSelect: () => {} });
  const prHost = document.getElementById('drawer-content');
  if (prHost && window.PlanReport) {
    prHost.style.display = 'block'; document.getElementById('drawer-empty').style.display = 'none';
    window.PlanReport.mount(prHost, { planSet, plan: planSet.plans[0], skipped: false });
  }
  window.LayoutDirector.setLayoutPhase('lock', { animate: false });
});
await page.waitForTimeout(900);

const data = await page.evaluate(() => {
  const shell = document.getElementById('nx-shell');
  return {
    phase: shell.getAttribute('data-layout-phase'),
    carriers: Array.from(document.querySelectorAll('.plan-card__carrier-text')).map(el => {
      const cs = getComputedStyle(el);
      return { ws: cs.whiteSpace, to: cs.textOverflow, sw: el.scrollWidth, cw: el.clientWidth };
    })
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
