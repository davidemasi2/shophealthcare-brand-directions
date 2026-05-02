import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }});
const page = await ctx.newPage();
await page.goto('https://davidemasi2.github.io/shophealthcare-brand-directions/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE);
await page.waitForTimeout(700);

await page.evaluate(() => {
  window.__attrLog = [];
  const shell = document.getElementById('nx-shell');
  const obs = new MutationObserver((muts) => {
    muts.forEach(m => {
      if (m.type === 'attributes' && m.attributeName === 'data-layout-phase') {
        window.__attrLog.push({ t: Date.now(), value: shell.getAttribute('data-layout-phase'), stack: new Error().stack.split('\n').slice(0,5).join(' | ').slice(0,400) });
      }
    });
  });
  obs.observe(shell, { attributes: true, attributeFilter: ['data-layout-phase'] });

  // Mirror harness force
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

const log = await page.evaluate(() => window.__attrLog);
console.log(`Mutation events on data-layout-phase:`);
log.forEach((l, i) => console.log(`  [${i}] value=${l.value}`));
const final = await page.evaluate(() => document.getElementById('nx-shell').getAttribute('data-layout-phase'));
console.log("Final value:", final);

await browser.close();
