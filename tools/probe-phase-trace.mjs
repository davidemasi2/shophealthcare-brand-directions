import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }});
const page = await ctx.newPage();
await page.goto('https://davidemasi2.github.io/shophealthcare-brand-directions/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE);
await page.waitForTimeout(700);

await page.evaluate(() => {
  const orig = window.LayoutDirector.setLayoutPhase;
  window.__phaseLog = [];
  window.LayoutDirector.setLayoutPhase = function(phase, opts) {
    const stack = new Error().stack.split('\n').slice(2,5).join(' | ');
    window.__phaseLog.push({ t: Date.now(), phase, stack: stack.slice(0,400) });
    return orig.call(window.LayoutDirector, phase, opts);
  };

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

const log = await page.evaluate(() => window.__phaseLog);
console.log("Phase calls:");
log.forEach((l, i) => console.log(`  [${i}] phase=${l.phase}  stack:${l.stack}`));
const final = await page.evaluate(() => document.getElementById('nx-shell').getAttribute('data-layout-phase'));
console.log("Final domPhase:", final);
await browser.close();
