import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }});
const page = await ctx.newPage();
await page.goto('https://davidemasi2.github.io/shophealthcare-brand-directions/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE);
await page.waitForTimeout(700);

const trace = await page.evaluate(async () => {
  const planSet = window.MOCK_NORA_RESPONSE;
  const events = [];
  document.addEventListener('layoutPhaseChange', e => events.push({ t: Date.now(), phase: e.detail.phase }));
  
  const shell = document.getElementById('nx-shell');
  const log = (label) => ({ label, t: Date.now(), domPhase: shell.getAttribute('data-layout-phase'), getCurrentPhase: window.LayoutDirector.getCurrentPhase() });
  
  const states = [];
  states.push(log('start'));
  
  // Mount value stack
  const vsHost = document.getElementById('dashValueStack');
  if (vsHost && window.ValueStack) window.ValueStack.mount(vsHost, { persona: window.NORA_ACTIVE_PERSONA, value: 290, currency: '$', cadence: '/mo' });
  states.push(log('after-vs-mount'));

  const pcHost = document.getElementById('dashPlanCards');
  if (pcHost && window.PlanCards) window.PlanCards.mount(pcHost, { planSet: planSet, onSelect: function(){} });
  states.push(log('after-cards-mount'));

  const prHost = document.getElementById('drawer-content');
  if (prHost && window.PlanReport) {
    prHost.style.display = 'block'; document.getElementById('drawer-empty').style.display = 'none';
    window.PlanReport.mount(prHost, { planSet, plan: planSet.plans[0], skipped: false });
  }
  states.push(log('after-report-mount'));

  window.LayoutDirector.setLayoutPhase('lock', { animate: false });
  states.push(log('after-setLayoutPhase'));

  await new Promise(r => setTimeout(r, 100)); states.push(log('+100ms'));
  await new Promise(r => setTimeout(r, 200)); states.push(log('+300ms'));
  await new Promise(r => setTimeout(r, 300)); states.push(log('+600ms'));
  await new Promise(r => setTimeout(r, 300)); states.push(log('+900ms'));

  return { states, events };
});
console.log("STATES:");
trace.states.forEach(s => console.log(` ${s.label}: domPhase=${s.domPhase} getCurrent=${s.getCurrentPhase}`));
console.log("EVENTS:");
trace.events.forEach(e => console.log(` phaseEvent: ${e.phase}`));
await browser.close();
