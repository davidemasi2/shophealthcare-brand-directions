import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1, colorScheme: 'light' });
const page = await ctx.newPage();
await page.goto('https://davidemasi2.github.io/shophealthcare-brand-directions/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE);

await page.evaluate(() => {
  window.__v27_force = function (phase) {
    const planSet = window.MOCK_NORA_RESPONSE;
    const vsHost = document.getElementById('dashValueStack');
    if (vsHost && window.ValueStack && !vsHost.children.length) {
      window.ValueStack.mount(vsHost, { persona: window.NORA_ACTIVE_PERSONA, value: 290, currency: '$', cadence: '/mo' });
    }
    if (window.PlanCards) {
      const pcHost = document.getElementById('dashPlanCards');
      if (pcHost && !pcHost.children.length) window.PlanCards.mount(pcHost, { planSet: planSet, onSelect: () => {} });
    }
    if (window.PlanReport) {
      const prHost = document.getElementById('drawer-content');
      if (prHost && !prHost.querySelector('.plan-report__root')) {
        prHost.style.display = 'block';
        document.getElementById('drawer-empty').style.display = 'none';
        window.PlanReport.mount(prHost, { planSet, plan: planSet.plans[0], skipped: false });
      }
    }
    const phaseBefore = document.getElementById('nx-shell').getAttribute('data-layout-phase');
    window.LayoutDirector.setLayoutPhase(phase, { animate: false });
    const phaseAfter = document.getElementById('nx-shell').getAttribute('data-layout-phase');
    window.__phaseTrace = { before: phaseBefore, after: phaseAfter, currentPhase: window.LayoutDirector.getCurrentPhase() };
    return phaseAfter;
  };
});

const got = await page.evaluate(() => window.__v27_force('lock'));
console.log("__v27_force returned:", got);
const trace = await page.evaluate(() => window.__phaseTrace);
console.log("Phase trace from inside force:", trace);

// Now check at intervals
for (const t of [0, 100, 300, 600, 900, 1500]) {
  await page.waitForTimeout(t === 0 ? 0 : (t - (t === 100 ? 0 : (t - 100))));
  const p = await page.evaluate(() => document.getElementById('nx-shell').getAttribute('data-layout-phase'));
  console.log(`+${t}ms: phase=${p}`);
}
await browser.close();
