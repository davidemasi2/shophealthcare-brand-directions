// Run EXACTLY what the harness does: navigate, force, wait, measure.
// Then dump the measurement directly.
import { chromium } from 'playwright';

const harnessHelpers = `
window.__v27_force = function (phase) {
  const planSet = window.MOCK_NORA_RESPONSE;
  const vsHost = document.getElementById('dashValueStack');
  if (vsHost && window.ValueStack && !vsHost.children.length) {
    window.ValueStack.mount(vsHost, { persona: window.NORA_ACTIVE_PERSONA, value: 290, currency: '$', cadence: '/mo' });
  }
  const wantPlans = ['compare','lock','enroll'].indexOf(phase) >= 0;
  if (wantPlans && planSet && window.PlanCards) {
    const pcHost = document.getElementById('dashPlanCards');
    if (pcHost && !pcHost.children.length) window.PlanCards.mount(pcHost, { planSet: planSet, onSelect: function () {} });
  }
  const wantReport = ['lock','enroll'].indexOf(phase) >= 0;
  if (wantReport && planSet && window.PlanReport) {
    const prHost = document.getElementById('drawer-content');
    if (prHost && !prHost.querySelector('.plan-report__root')) {
      const firstPlan = (planSet.plans || []).filter(function(p){ return p.is_recommended; })[0] || planSet.plans[0];
      prHost.style.display = 'block';
      const empty = document.getElementById('drawer-empty');
      if (empty) empty.style.display = 'none';
      window.PlanReport.mount(prHost, { planSet, plan: firstPlan, skipped: false });
    }
  }
  window.LayoutDirector.setLayoutPhase(phase, { animate: false });
  return window.LayoutDirector.getCurrentPhase();
};
`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }});
const page = await ctx.newPage();
await page.goto('https://davidemasi2.github.io/shophealthcare-brand-directions/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE);

await page.evaluate(harnessHelpers);
const phaseSet = await page.evaluate(() => window.__v27_force('lock'));
console.log('phaseSet=', phaseSet);
await page.waitForTimeout(900);

const result = await page.evaluate(() => {
  const shell = document.getElementById('nx-shell');
  const phase = shell.getAttribute('data-layout-phase');
  const carriers = Array.from(document.querySelectorAll('.plan-card__carrier-text')).map(el => {
    const cs = getComputedStyle(el);
    return { text: el.textContent, ws: cs.whiteSpace, ov: cs.overflow, to: cs.textOverflow, sw: el.scrollWidth, cw: el.clientWidth };
  });
  return { domPhase: phase, getCurrent: window.LayoutDirector.getCurrentPhase(), carriers };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
