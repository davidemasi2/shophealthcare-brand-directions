// Use the actual harness module to inject helpers, then call measure
import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1, colorScheme: 'light' });
const page = await ctx.newPage();
await page.goto('https://davidemasi2.github.io/shophealthcare-brand-directions/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE);

// Same as harness: page.evaluate the entire helpers block as anonymous fn
await page.evaluate(() => {
  if (window.__v27Injected) return;
  window.__v27Injected = true;
  window.__v27_force = function (phase, opts) {
    opts = opts || {};
    const planSet = window.MOCK_NORA_RESPONSE;
    const vsHost = document.getElementById('dashValueStack');
    if (vsHost && window.ValueStack && !vsHost.children.length) {
      try { window.ValueStack.mount(vsHost, { persona: window.NORA_ACTIVE_PERSONA, value: planSet ? (planSet.headline_estimate || planSet.estimate || 290) : 290, currency: '$', cadence: '/mo' }); } catch(e){}
    }
    const wantPlans = ['compare','lock','enroll'].indexOf(phase) >= 0;
    if (wantPlans && planSet && window.PlanCards) {
      const pcHost = document.getElementById('dashPlanCards');
      if (pcHost && !pcHost.children.length) try { window.PlanCards.mount(pcHost, { planSet: planSet, onSelect: function () {} }); } catch(e){}
    }
    const wantReport = ['lock','enroll'].indexOf(phase) >= 0;
    if (wantReport && planSet && window.PlanReport) {
      const prHost = document.getElementById('drawer-content');
      const empty = document.getElementById('drawer-empty');
      if (prHost && !prHost.querySelector('.plan-report__root')) {
        const firstPlan = (planSet.plans || []).filter(function(p){ return p.is_recommended; })[0] || (planSet.plans || [])[0];
        if (firstPlan) {
          try { prHost.style.display = 'block'; if (empty) empty.style.display = 'none'; window.PlanReport.mount(prHost, { planSet: planSet, plan: firstPlan, skipped: false }); } catch(e){}
        }
      }
    }
    if (window.LayoutDirector && window.LayoutDirector.setLayoutPhase) try { window.LayoutDirector.setLayoutPhase(phase, { animate: false }); } catch(e){}
    return window.LayoutDirector && window.LayoutDirector.getCurrentPhase ? window.LayoutDirector.getCurrentPhase() : null;
  };
  // Skipping __v27_measure — we'll use the inline version
});

await page.evaluate(() => window.__v27_force('lock'));
await page.waitForTimeout(900);

const data = await page.evaluate(() => {
  const shell = document.getElementById('nx-shell');
  return {
    phase: shell.getAttribute('data-layout-phase'),
    carriers: Array.from(document.querySelectorAll('.plan-card__carrier-text')).map(el => {
      const cs = getComputedStyle(el);
      return { text: el.textContent, ws: cs.whiteSpace, to: cs.textOverflow };
    })
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
