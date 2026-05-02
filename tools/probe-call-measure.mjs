import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }});
const page = await ctx.newPage();
await page.goto('https://davidemasi2.github.io/shophealthcare-brand-directions/directions/21-lemon/v27/nora-app/index.html?p=SP1&s=TX&a=35&x=M&pg=0&c=none', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.LayoutDirector && window.MOCK_NORA_RESPONSE);
await page.waitForTimeout(700);

// Inject the EXACT harness helpers (paste from harness file inline)
const harness = readFileSync('tools/v27-audit.mjs', 'utf-8');
const helpersStart = harness.indexOf("if (window.__v27Injected) return;");
const helpersEnd = harness.indexOf("};\n  });\n}", helpersStart);
const body = harness.slice(helpersStart, helpersEnd + 4);
console.log("Body length:", body.length);

await page.evaluate(`(function() { ${body} })()`);

await page.evaluate(() => window.__v27_force('lock'));
await page.waitForTimeout(900);

const beforeMeasure = await page.evaluate(() => document.getElementById('nx-shell').getAttribute('data-layout-phase'));
console.log("Before measure call:", beforeMeasure);

const m = await page.evaluate(() => window.__v27_measure && window.__v27_measure());
console.log("Measure layoutPhase:", m && m.layoutPhase);
console.log("Measure truncated count:", m && m.truncated.length);

const afterMeasure = await page.evaluate(() => document.getElementById('nx-shell').getAttribute('data-layout-phase'));
console.log("After measure call:", afterMeasure);

await browser.close();
