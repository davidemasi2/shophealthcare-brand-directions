// Run harness force + wait, then capture phase MULTIPLE times during/after measure
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

// Phase right BEFORE measure
const before = await page.evaluate(() => document.getElementById('nx-shell').getAttribute('data-layout-phase'));
console.log("phase BEFORE measure:", before);

// Now run the EXACT harness __v27_measure body and check layoutPhase at the end
const phaseAfterMeasure = await page.evaluate(() => {
  const shell = document.getElementById('nx-shell');
  const phaseStart = shell.getAttribute('data-layout-phase');

  // Simulate the entire __v27_measure work
  const html = document.documentElement;
  const docOverflow = Math.max(0, html.scrollHeight - window.innerHeight);
  const horizOverflow = Math.max(0, html.scrollWidth - window.innerWidth);
  const zoneIds = ['nx-shell','zone-chat','zone-dash','zone-drawer','dash-estimate-block','dash-plan-cards-host','drawer-content','drawer-empty'];
  zoneIds.forEach(id => { const el = document.getElementById(id); if (el) el.getBoundingClientRect(); });
  const allEls = document.querySelectorAll('*');
  let truncated = 0;
  allEls.forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.textOverflow === 'ellipsis' && (cs.whiteSpace === 'nowrap' || cs.overflow === 'hidden')) {
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) truncated++;
    }
  });
  const phaseAfterTruncCheck = shell.getAttribute('data-layout-phase');

  return { phaseStart, phaseAfterTruncCheck, truncated, allElsCount: allEls.length };
});
console.log(JSON.stringify(phaseAfterMeasure, null, 2));

await browser.close();
