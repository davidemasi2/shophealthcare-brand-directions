import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const OUT = 'directions/21-lemon/v27/_audit/visual-compare';
await fs.mkdir(OUT, { recursive: true });

const personas = [
  { id: 'SP1', q: 'p=SP1&s=TX&a=35&x=M&pg=0&c=none' },
  { id: 'CL1', q: 'p=CL1&s=CA&a=32&x=F&pg=0&c=none' },
];
const phases = ['read', 'price', 'compare', 'lock'];
const bps = [
  { name: 'desktop-1440', w: 1440, h: 900 },
  { name: 'mobile-375',   w: 375,  h: 812 },
];
const versions = ['v26', 'v27'];

const browser = await chromium.launch();
for (const v of versions) {
  for (const persona of personas) {
    for (const bp of bps) {
      for (const phase of phases) {
        const ctx = await browser.newContext({ viewport: { width: bp.w, height: bp.h } });
        const page = await ctx.newPage();
        const url = `https://davidemasi2.github.io/shophealthcare-brand-directions/directions/21-lemon/${v}/nora-app/index.html?${persona.q}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        try {
          await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE && document.querySelector('#nx-shell[data-layout-phase]'), null, { timeout: 12000 });
        } catch (e) { /* v26 may not have init same way */ }
        await page.waitForTimeout(400);
        await page.evaluate((p) => {
          const planSet = window.MOCK_NORA_RESPONSE;
          const vsHost = document.getElementById('dashValueStack');
          if (vsHost && window.ValueStack && !vsHost.children.length) try { window.ValueStack.mount(vsHost, { persona: window.NORA_ACTIVE_PERSONA, value: planSet?.headline_estimate || 290, currency: '$', cadence: '/mo' }); } catch(e){}
          if (['compare','lock','enroll'].includes(p) && window.PlanCards) {
            const pc = document.getElementById('dashPlanCards');
            if (pc && !pc.children.length) try { window.PlanCards.mount(pc, { planSet, onSelect:()=>{} }); } catch(e){}
          }
          if (['lock','enroll'].includes(p) && window.PlanReport) {
            const pr = document.getElementById('drawer-content');
            if (pr && !pr.querySelector('.plan-report__root')) {
              pr.style.display = 'block';
              const e0 = document.getElementById('drawer-empty'); if (e0) e0.style.display='none';
              const fp = (planSet.plans||[]).filter(x=>x.is_recommended)[0] || planSet.plans[0];
              if (fp) try { window.PlanReport.mount(pr, { planSet, plan: fp, skipped: false }); } catch(e){}
            }
          }
          if (window.LayoutDirector?.setLayoutPhase) try { window.LayoutDirector.setLayoutPhase(p, { animate: false }); } catch(e){}
        }, phase);
        await page.waitForTimeout(900);
        const path = `${OUT}/${v}__${persona.id}__${phase}__${bp.name}.png`;
        await page.screenshot({ path, fullPage: false });
        console.log(`saved ${path}`);
        await ctx.close();
      }
    }
  }
}
await browser.close();
