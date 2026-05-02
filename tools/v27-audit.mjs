#!/usr/bin/env node
// V27 audit harness — Playwright + axe-core sweeping the Nora app for
// every broken / cut-off / hidden / truncated / overflowing surface.
//
// Usage:
//   BASE_URL=http://localhost:8745 TARGET=v26 RUN_LABEL=baseline-v26 node tools/v27-audit.mjs
//   BASE_URL=http://localhost:8745 TARGET=v27 RUN_LABEL=after-fix-001 node tools/v27-audit.mjs
//   ONLY=core-SP1-compare-1440 node tools/v27-audit.mjs   # filter to one cell
//   GROUP=core node tools/v27-audit.mjs                    # filter by group
//
// Each cell produces:
//   <out>/<cellId>.json           full measurement record
//   <out>/<cellId>.png            full-page screenshot
//   <out>/<cellId>__chat.png      per-zone chat screenshot (when active)
//   <out>/<cellId>__dash.png      per-zone dash screenshot
//   <out>/<cellId>__drawer.png    per-zone drawer screenshot
//
// And one aggregate file:
//   <out>/_summary.json           run-wide summary (counts by severity)

import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const BASE_URL    = process.env.BASE_URL    || 'http://localhost:8745';
const TARGET      = process.env.TARGET      || 'v27';
const RUN_LABEL   = process.env.RUN_LABEL   || `${TARGET}-${new Date().toISOString().replace(/[:.]/g,'-')}`;
const ONLY        = process.env.ONLY        || null;
const GROUP       = process.env.GROUP       || null;
const HEADLESS    = process.env.HEADLESS !== '0';
const SLOW        = parseInt(process.env.SLOW || '0', 10);
const PHASE_WAIT  = parseInt(process.env.PHASE_WAIT || '900', 10);

const OUT_DIR = path.join(REPO_ROOT, 'directions/21-lemon/v27/_audit', RUN_LABEL);

const matrixPath = path.join(__dirname, 'v27-audit-matrix.json');
const matrix = JSON.parse(await fs.readFile(matrixPath, 'utf-8'));

// ─── helpers ───────────────────────────────────────────────────────────────

function buildAppUrl(target, params) {
  const qs = new URLSearchParams(params).toString();
  return `${BASE_URL}/directions/21-lemon/${target}/nora-app/index.html?${qs}`;
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

// Page-side helpers — injected via page.evaluate.

async function injectV27Helpers(page) {
  await page.evaluate(() => {
    if (window.__v27Injected) return;
    window.__v27Injected = true;

    // Force a layout phase including all preconditions (mount ValueStack,
    // PlanCards, PlanReport as needed). Runs synchronously so caller can
    // wait for animation settle externally.
    window.__v27_force = function (phase, opts) {
      opts = opts || {};
      const planSet = window.MOCK_NORA_RESPONSE;

      // Mount ValueStack into dash if not present.
      const vsHost = document.getElementById('dashValueStack');
      if (vsHost && window.ValueStack && !vsHost.children.length) {
        try {
          window.ValueStack.mount(vsHost, {
            persona: window.NORA_ACTIVE_PERSONA,
            value: planSet ? (planSet.headline_estimate || planSet.estimate || 290) : 290,
            currency: '$',
            cadence: '/mo',
          });
        } catch (e) { /* ignore */ }
      }

      const wantPlans = ['compare','lock','enroll'].indexOf(phase) >= 0;
      if (wantPlans && planSet && window.PlanCards) {
        const pcHost = document.getElementById('dashPlanCards');
        if (pcHost && !pcHost.children.length) {
          try {
            window.PlanCards.mount(pcHost, {
              planSet: planSet,
              onSelect: function () { /* noop */ }
            });
          } catch (e) { /* ignore */ }
        }
      }

      const wantReport = ['lock','enroll'].indexOf(phase) >= 0;
      if (wantReport && planSet && window.PlanReport) {
        const prHost = document.getElementById('drawer-content');
        const empty  = document.getElementById('drawer-empty');
        if (prHost && !prHost.querySelector('.plan-report__root')) {
          const firstPlan = (planSet.plans || []).filter(function(p){ return p.is_recommended; })[0]
            || (planSet.plans || [])[0];
          if (firstPlan) {
            try {
              prHost.style.display = 'block';
              if (empty) empty.style.display = 'none';
              // V27/V28 API: PlanReport takes `selectedPlanId`, not `plan`.
              window.PlanReport.mount(prHost, {
                planSet: planSet,
                selectedPlanId: firstPlan.plan_id,
                skipped: false,
                onSave: function () {},
                onEmailPdf: function () {},
                onForward: function () {},
                onContinueEnroll: function () {},
                onOpenEmailGate: function () {}
              });
            } catch (e) { /* ignore */ }
          }
        }
      }

      if (window.LayoutDirector && window.LayoutDirector.setLayoutPhase) {
        try {
          window.LayoutDirector.setLayoutPhase(phase, { animate: false });
        } catch (e) { /* ignore */ }
      }

      // V28 — at LOCK phase, simulate the real plan-pick state by marking
      // the recommended card as locked and mounting the inline lock-gate.
      // The harness can't trigger the actual onSelect callback chain, so we
      // replicate its visible side effects.
      if (phase === 'lock' && planSet) {
        const firstPlan = (planSet.plans || []).filter(function(p){ return p.is_recommended; })[0]
          || (planSet.plans || [])[0];
        if (firstPlan) {
          // Mark the chosen card .is-locked so V28 CSS shows it (others hide).
          const chosenCard = document.querySelector(
            '.plan-card[data-plan-id="' + firstPlan.plan_id + '"]'
          );
          if (chosenCard) chosenCard.classList.add('is-locked');
          // Mount lock-gate inline. mountLockGate is on the closure scope of
          // nora-app.js and not directly callable; replicate its DOM output.
          const gateHost = document.getElementById('dash-lock-gate');
          if (gateHost && !gateHost.firstChild) {
            gateHost.removeAttribute('hidden');
            gateHost.dataset.mountedPlan = firstPlan.plan_id;
            const carrier = firstPlan.carrier_name || firstPlan.carrier || 'your carrier';
            const monthly = firstPlan.monthly_premium ? Math.round(firstPlan.monthly_premium) : null;
            const alreadyAuthed = !!(window.NoraSession &&
                                     typeof window.NoraSession.isAuthed === 'function' &&
                                     window.NoraSession.isAuthed());
            gateHost.innerHTML =
              '<div class="nx-lock-gate__header">✓ PLAN SELECTED</div>' +
              '<div class="nx-lock-gate__lead">' + (alreadyAuthed
                ? 'Hold this rate for 30 days.'
                : 'Lock this rate for 30 days.') + '</div>' +
              '<div class="nx-lock-gate__sub">' + (alreadyAuthed
                ? 'Same gate, same offer. Continue when you’re ready.'
                : 'Email me anytime — same gate, same offer. No follow-up unless you ask.') + '</div>' +
              '<form class="nx-lock-gate__form" novalidate>' +
                (alreadyAuthed ? '' :
                  '<label for="lock-gate-email">Your email</label>' +
                  '<input id="lock-gate-email" type="email" required placeholder="you@example.com" autocomplete="email">') +
                '<button type="submit" class="nx-lock-gate__continue">Continue with ' + carrier + ' →</button>' +
              '</form>' +
              '<div class="nx-lock-gate__micro">' + (monthly
                ? '✓ $' + monthly + '/mo locked · NPN #19482230'
                : 'NPN #19482230 · Core Value Insurance Associates LLC') + '</div>';
          }
        }
      }

      return window.LayoutDirector && window.LayoutDirector.getCurrentPhase
        ? window.LayoutDirector.getCurrentPhase()
        : null;
    };

    // Set OCR baseline so PlanCards/PlanReport render Mode 2B (savings delta).
    window.__v27_setOcr = function (baselinePremium) {
      window.NORA_OCR_BASELINE = {
        monthly_premium: baselinePremium || 712,
        carrier: 'BlueCross',
        plan_name: 'Marketplace Bronze HMO',
        deductible: 7500
      };
    };

    // Comprehensive measurement collector. Returns a JSON-safe payload.
    window.__v27_measure = function () {
      const html = document.documentElement;
      const body = document.body;
      const docOverflow = Math.max(0, html.scrollHeight - window.innerHeight);
      const horizOverflow = Math.max(0, html.scrollWidth - window.innerWidth);

      // Per-zone bounds.
      const zoneIds = ['nx-shell','zone-chat','zone-dash','zone-drawer','dash-estimate-block','dash-plan-cards-host','drawer-content','drawer-empty'];
      const zones = {};
      zoneIds.forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) { zones[id] = null; return; }
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        zones[id] = {
          rect: { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) },
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          scrollTop: el.scrollTop,
          internallyScrollable: el.scrollHeight > el.clientHeight + 1,
          display: cs.display,
          visibility: cs.visibility,
          opacity: cs.opacity,
          zIndex: cs.zIndex,
          overflowX: cs.overflowX,
          overflowY: cs.overflowY,
          rendered: el.getClientRects().length > 0
        };
      });

      // Text-overflow ellipsis cells where scrollWidth > clientWidth → truncated.
      const truncated = [];
      const ellipsisEls = document.querySelectorAll('[style*="ellipsis"], .truncate, .nx-truncate, [class*="truncate"]');
      const allEls = document.querySelectorAll('*');
      allEls.forEach(function (el) {
        const cs = getComputedStyle(el);
        if (cs.textOverflow === 'ellipsis' && (cs.whiteSpace === 'nowrap' || cs.overflow === 'hidden')) {
          if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
            truncated.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || null,
              cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : null,
              text: (el.textContent || '').slice(0, 80),
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth
            });
          }
        }
      });

      // Off-screen interactive elements: focusable but bottom > viewport AND
      // not inside an internally-scrollable ancestor.
      const focusables = document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])');
      const offscreen = [];
      const SR_ONLY_RE = /\b(sr-only|visually-hidden|nx-skip-link|skip-link)\b/i;
      focusables.forEach(function (el) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || el.disabled) return;
        // Filter sr-only / skip-link patterns — intentionally offscreen until focused.
        const cls = (el.className && typeof el.className === 'string') ? el.className : '';
        if (SR_ONLY_RE.test(cls)) return;
        if ((el.textContent || '').trim().toLowerCase().startsWith('skip to')) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        const bottomBeyond = r.bottom > window.innerHeight + 2;
        const topBeyond    = r.top < -2;
        if (!bottomBeyond && !topBeyond) return;
        // Walk up DOM looking for scrollable ancestor.
        let n = el.parentElement, scrollable = false, depth = 0;
        while (n && n !== document.body && depth < 12) {
          const ncs = getComputedStyle(n);
          if ((ncs.overflowY === 'auto' || ncs.overflowY === 'scroll') && n.scrollHeight > n.clientHeight + 1) {
            scrollable = true; break;
          }
          n = n.parentElement; depth++;
        }
        // Document body itself counts as scrollable if doc overflows.
        if (!scrollable && (bottomBeyond ? html.scrollHeight - window.innerHeight > 0 : window.scrollY > 0)) {
          // Document-level scroll is allowed but we still flag it for review.
          offscreen.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            text: (el.textContent || el.value || el.getAttribute('aria-label') || '').slice(0,60),
            rect: { top: Math.round(r.top), bottom: Math.round(r.bottom) },
            reach: 'document-scroll'
          });
        } else if (!scrollable) {
          offscreen.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            text: (el.textContent || el.value || el.getAttribute('aria-label') || '').slice(0,60),
            rect: { top: Math.round(r.top), bottom: Math.round(r.bottom) },
            reach: 'unreachable'
          });
        }
      });

      // Tap targets (mobile heuristic — caller decides whether to enforce).
      // Filter sr-only / skip-link patterns. Filter elements with aria-hidden=true.
      const smallTargets = [];
      focusables.forEach(function (el) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || el.disabled) return;
        if (el.getAttribute('aria-hidden') === 'true') return;
        const cls = (el.className && typeof el.className === 'string') ? el.className : '';
        if (SR_ONLY_RE.test(cls)) return;
        if ((el.textContent || '').trim().toLowerCase().startsWith('skip to')) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        if (r.width < 44 || r.height < 44) {
          smallTargets.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            cls: cls.slice(0, 80) || null,
            text: (el.textContent || el.value || el.getAttribute('aria-label') || '').slice(0,40),
            w: Math.round(r.width), h: Math.round(r.height)
          });
        }
      });

      // Hidden but DOM-present elements (display:none / visibility:hidden / hidden attr / opacity:0).
      // We expect MANY of these (chat history offscreen, OCR overlay etc) so we
      // only flag elements that look like they SHOULD be visible based on phase.
      // Rather than guess phase context, we capture summary counts the harness
      // can correlate later.
      const hiddenCounts = { displayNone: 0, visibilityHidden: 0, hiddenAttr: 0, zeroOpacity: 0 };
      allEls.forEach(function (el) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none') hiddenCounts.displayNone++;
        else if (cs.visibility === 'hidden') hiddenCounts.visibilityHidden++;
        else if (parseFloat(cs.opacity) === 0) hiddenCounts.zeroOpacity++;
        if (el.hasAttribute('hidden')) hiddenCounts.hiddenAttr++;
      });

      // Z-stacking: top-of-stack at viewport center.
      let topAtCenter = null;
      try {
        const cx = Math.round(window.innerWidth / 2);
        const cy = Math.round(window.innerHeight / 2);
        const stack = document.elementsFromPoint(cx, cy);
        if (stack && stack.length) {
          topAtCenter = (stack.slice(0, 5)).map(function (el) {
            return {
              tag: el.tagName.toLowerCase(),
              id: el.id || null,
              cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 60) : null,
              z: getComputedStyle(el).zIndex
            };
          });
        }
      } catch (e) { /* ignore */ }

      // Layout phase reported by the app itself.
      const shell = document.getElementById('nx-shell');
      const layoutPhase = shell ? shell.getAttribute('data-layout-phase') : null;

      // Plan-cards mount state.
      const pcHost = document.getElementById('dashPlanCards');
      const planCards = pcHost ? pcHost.querySelectorAll('.plan-card').length : 0;

      // V28 — focus-rule measurements.
      // (a) Visible plan cards — count `.plan-card` whose computed display
      //     is not 'none' AND has a non-zero rect.
      const planCardsVisible = (function () {
        const cards = document.querySelectorAll('.plan-card');
        let count = 0;
        cards.forEach(function (c) {
          const cs = getComputedStyle(c);
          if (cs.display === 'none' || cs.visibility === 'hidden') return;
          const r = c.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return;
          count++;
        });
        return count;
      })();
      // (b) Zone visibility — chat / dash / drawer.
      const zoneVisible = (function () {
        const out = {};
        ['chat', 'dash', 'drawer'].forEach(function (key) {
          const el = document.getElementById('zone-' + key);
          if (!el) { out[key] = null; return; }
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') { out[key] = false; return; }
          const r = el.getBoundingClientRect();
          out[key] = r.width > 0 && r.height > 0;
        });
        return out;
      })();
      // (c) AuthGate banner visible? Match common selectors used by V25/V27
      //     auth-gate.js when the banner mode mounts.
      const bannerVisible = (function () {
        const candidates = document.querySelectorAll(
          '.auth-gate.is-banner, .auth-gate--banner, .auth-skip-banner, [data-auth-skip-banner]'
        );
        for (const el of candidates) {
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          return true;
        }
        return false;
      })();
      // (d) Primary CTA count — visible buttons/links that read as "primary".
      //     Heuristic: explicit primary classes, lemon button styling, or
      //     known LOCK/ENROLL CTAs. Anything inside .nx-zone--mini does NOT
      //     count as primary (it's a secondary/condense zone).
      const primaryCTAs = (function () {
        const sels = [
          '.plan-card__lock-cta',
          '.nx-lock-gate__continue',
          '.pr-continue-cta',
          '.pr-cta--primary',
          '.plan-report__continue',
          '.auth-gate__submit',
          '.nx-locked-cta'
        ];
        const found = [];
        sels.forEach(function (sel) {
          const list = document.querySelectorAll(sel);
          list.forEach(function (el) {
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') return;
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return;
            // Inside a nx-zone--mini ancestor? Skip (secondary).
            let n = el.parentElement, mini = false;
            while (n && n !== document.body) {
              if (n.classList && n.classList.contains('nx-zone--mini')) { mini = true; break; }
              n = n.parentElement;
            }
            if (mini) return;
            found.push({
              sel: sel,
              text: (el.textContent || el.value || el.getAttribute('aria-label') || '').slice(0, 60).trim(),
              w: Math.round(r.width),
              h: Math.round(r.height)
            });
          });
        });
        return found;
      })();

      // Spot-style on top 50 visible nodes.
      let spotStyles = [];
      const spotPicks = ['h1','h2','h3','p','button','a','input','label','span'];
      let spotCount = 0;
      spotPicks.forEach(function (tag) {
        if (spotCount >= 50) return;
        const list = document.querySelectorAll(tag);
        for (let i = 0; i < list.length && spotCount < 50; i++) {
          const el = list[i];
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const cs = getComputedStyle(el);
          spotStyles.push({
            tag: tag,
            ff: cs.fontFamily.split(',')[0].replace(/['"]/g,''),
            fs: cs.fontSize,
            lh: cs.lineHeight,
            color: cs.color,
            bg: cs.backgroundColor
          });
          spotCount++;
        }
      });

      return {
        viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio },
        layoutPhase: layoutPhase,
        docOverflow: docOverflow,
        horizOverflow: horizOverflow,
        zones: zones,
        truncated: truncated,
        offscreen: offscreen,
        smallTargets: smallTargets,
        hiddenCounts: hiddenCounts,
        topAtCenter: topAtCenter,
        planCardsMounted: planCards,
        spotStyles: spotStyles,
        // V28 focus-rule fields
        planCardsVisible: planCardsVisible,
        zoneVisible: zoneVisible,
        bannerVisible: bannerVisible,
        primaryCTAs: primaryCTAs
      };
    };
  });
}

async function captureZoneShot(page, cellId, zoneId) {
  try {
    const el = await page.$('#' + zoneId);
    if (!el) return null;
    const visible = await el.isVisible();
    if (!visible) return null;
    const out = path.join(OUT_DIR, `${cellId}__${zoneId.replace('zone-','')}.png`);
    await el.screenshot({ path: out, timeout: 5000 });
    return path.relative(REPO_ROOT, out);
  } catch (e) {
    return { error: e.message };
  }
}

// ─── cell runner ───────────────────────────────────────────────────────────

async function runCell(browser, cell) {
  const bp = matrix.breakpoints[cell.bp];
  if (!bp) throw new Error(`Unknown breakpoint: ${cell.bp}`);

  const ctxOpts = {
    viewport: { width: bp.width, height: bp.height },
    deviceScaleFactor: 1,
    reducedMotion: cell.reducedMotion ? 'reduce' : 'no-preference',
    forcedColors: cell.forcedColors ? 'active' : 'none',
    colorScheme: 'light'
  };

  const context = await browser.newContext(ctxOpts);
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (/favicon\.ico/i.test(text)) return;
      consoleErrors.push(text.slice(0, 300));
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push('PAGEERROR: ' + (err.message || String(err)).slice(0, 300));
  });

  let url, params;
  if (cell.group === 'edge') {
    const exit = matrix.edgeExits.find((e) => e.id === cell.edgeExit);
    params = exit.params;
    url = buildAppUrl(TARGET, params);
  } else {
    const persona = matrix.personas[cell.persona];
    params = { p: persona.p, s: persona.s, a: persona.a, x: persona.x, pg: persona.pg, c: persona.c };
    url = buildAppUrl(TARGET, params);
  }

  const t0 = Date.now();
  const cell_record = {
    id: cell.id,
    group: cell.group,
    persona: cell.persona || null,
    edgeExit: cell.edgeExit || null,
    phase: cell.phase || null,
    bp: cell.bp,
    bpDims: { width: bp.width, height: bp.height },
    ocr: !!cell.ocr,
    reducedMotion: !!cell.reducedMotion,
    forcedColors: !!cell.forcedColors,
    url,
    params,
    target: TARGET,
    runLabel: RUN_LABEL,
    timestamp: new Date().toISOString(),
    timing: {},
    measurements: null,
    axe: null,
    consoleErrors,
    screenshots: {},
    errors: []
  };

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch (e) {
    cell_record.errors.push('goto: ' + e.message);
    await context.close();
    return cell_record;
  }

  // Wait for app boot — LayoutDirector defined.
  if (cell.group === 'edge') {
    // Edge cells are exit screens, not full app boot. Just wait DOM idle.
    await page.waitForTimeout(800);
  } else {
    try {
      // Wait for full app boot — including LayoutDirector.init() which sets the
      // initial data-layout-phase attribute. Without the [data-layout-phase]
      // selector, waitForFunction races against initLayoutDirector() and our
      // __v27_force() can fire BEFORE init runs — at which point init's own
      // setLayoutPhase('read') overwrites the forced phase.
      await page.waitForFunction(
        () => window.LayoutDirector
          && window.MOCK_NORA_RESPONSE
          && document.querySelector('#nx-shell[data-layout-phase]'),
        null,
        { timeout: 12000 }
      );
    } catch (e) {
      cell_record.errors.push('boot-wait: ' + e.message);
    }
  }

  await injectV27Helpers(page);

  // Apply OCR baseline if requested.
  if (cell.ocr) {
    await page.evaluate(() => window.__v27_setOcr && window.__v27_setOcr(712));
  }

  // Force phase for non-edge cells.
  if (cell.group !== 'edge' && cell.phase) {
    try {
      const got = await page.evaluate((p) => window.__v27_force(p), cell.phase);
      cell_record.timing.phaseSet = got;
    } catch (e) {
      cell_record.errors.push('phase-set: ' + e.message);
    }
    // Wait for FLIP animation to settle (720ms easing + buffer).
    await page.waitForTimeout(cell.reducedMotion ? 220 : PHASE_WAIT);
  }

  // Run measurements.
  try {
    const m = await page.evaluate(() => window.__v27_measure && window.__v27_measure());
    cell_record.measurements = m;
  } catch (e) {
    cell_record.errors.push('measure: ' + e.message);
  }

  // Axe-core.
  try {
    const axe = await new AxeBuilder({ page })
      .options({ resultTypes: ['violations'] })
      .analyze();
    cell_record.axe = {
      violationCount: axe.violations.length,
      violations: axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.length,
        selectors: v.nodes.slice(0, 3).map((n) => n.target.join(' '))
      }))
    };
  } catch (e) {
    cell_record.errors.push('axe: ' + e.message);
  }

  // Screenshots.
  try {
    const fullPath = path.join(OUT_DIR, `${cell.id}.png`);
    await page.screenshot({ path: fullPath, fullPage: true, timeout: 10000 });
    cell_record.screenshots.full = path.relative(REPO_ROOT, fullPath);
  } catch (e) {
    cell_record.errors.push('screenshot-full: ' + e.message);
  }

  if (cell.group !== 'edge') {
    cell_record.screenshots.chat   = await captureZoneShot(page, cell.id, 'zone-chat');
    cell_record.screenshots.dash   = await captureZoneShot(page, cell.id, 'zone-dash');
    cell_record.screenshots.drawer = await captureZoneShot(page, cell.id, 'zone-drawer');
  }

  cell_record.timing.totalMs = Date.now() - t0;
  await context.close();
  return cell_record;
}

// ─── main ──────────────────────────────────────────────────────────────────

async function main() {
  await ensureDir(OUT_DIR);

  let cells = matrix.cells;
  if (ONLY) {
    const ids = ONLY.split(',').map(s => s.trim());
    cells = cells.filter(c => ids.includes(c.id));
  }
  if (GROUP) {
    const groups = GROUP.split(',').map(s => s.trim());
    cells = cells.filter(c => groups.includes(c.group));
  }

  console.log(`[v27-audit] target=${TARGET} runLabel=${RUN_LABEL} cells=${cells.length}`);
  console.log(`[v27-audit] out=${path.relative(REPO_ROOT, OUT_DIR)}`);

  const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW });
  const summary = {
    target: TARGET,
    runLabel: RUN_LABEL,
    timestamp: new Date().toISOString(),
    cellCount: cells.length,
    completed: 0,
    failed: 0,
    findings: {
      docOverflow: 0,
      horizOverflow: 0,
      truncated: 0,
      offscreenUnreachable: 0,
      smallTargets: 0,
      axeViolations: 0,
      consoleErrors: 0,
      cellErrors: 0,
      // V28 focus-rule violations
      focusViolations: 0
    },
    perCell: []
  };

  // V28 focus-rule evaluator. Runs against measurements for cells where a
  // focus contract applies (LOCK / ENROLL / COMPARE phases).
  function evalFocusRules(cell, m) {
    const violations = [];
    const phase = cell.phase || m.layoutPhase;
    if (!phase) return violations;
    const primary = (m.primaryCTAs || []).length;
    const planCards = m.planCardsVisible || 0;
    const zones = m.zoneVisible || {};
    const banner = !!m.bannerVisible;
    if (phase === 'lock') {
      if (primary !== 1) violations.push(`LOCK primaryCTAs=${primary} (expected 1)`);
      if (planCards !== 1) violations.push(`LOCK planCardsVisible=${planCards} (expected 1)`);
      if (zones.chat) violations.push('LOCK chat zone visible (expected hidden)');
      if (zones.drawer) violations.push('LOCK drawer zone visible (expected hidden)');
      if (banner) violations.push('LOCK banner visible (expected hidden)');
    } else if (phase === 'enroll') {
      if (primary !== 1) violations.push(`ENROLL primaryCTAs=${primary} (expected 1)`);
      if (planCards !== 0) violations.push(`ENROLL planCardsVisible=${planCards} (expected 0)`);
      if (zones.chat) violations.push('ENROLL chat zone visible (expected hidden)');
      if (zones.dash) violations.push('ENROLL dash zone visible (expected hidden)');
      if (banner) violations.push('ENROLL banner visible (expected hidden)');
    } else if (phase === 'compare') {
      if (banner) violations.push('COMPARE banner visible (expected hidden)');
    }
    return violations;
  }

  let i = 0;
  for (const cell of cells) {
    i++;
    const t0 = Date.now();
    let rec;
    try {
      rec = await runCell(browser, cell);
    } catch (e) {
      summary.failed++;
      console.error(`[${i}/${cells.length}] ${cell.id} FAILED ${e.message}`);
      continue;
    }
    summary.completed++;

    const m = rec.measurements || {};
    if ((m.docOverflow || 0) > 0) summary.findings.docOverflow++;
    if ((m.horizOverflow || 0) > 0) summary.findings.horizOverflow++;
    summary.findings.truncated   += (m.truncated || []).length;
    summary.findings.offscreenUnreachable += ((m.offscreen || []).filter(o => o.reach === 'unreachable')).length;
    summary.findings.smallTargets += (m.smallTargets || []).length;
    summary.findings.axeViolations += (rec.axe ? rec.axe.violationCount : 0);
    summary.findings.consoleErrors += (rec.consoleErrors || []).length;
    summary.findings.cellErrors    += (rec.errors || []).length;

    // V28 focus rules
    const focusVios = evalFocusRules(cell, m);
    summary.findings.focusViolations += focusVios.length;
    rec.focusViolations = focusVios;

    summary.perCell.push({
      id: rec.id, group: rec.group, bp: rec.bp,
      docOverflow: m.docOverflow || 0,
      horizOverflow: m.horizOverflow || 0,
      truncated: (m.truncated || []).length,
      offscreen: (m.offscreen || []).length,
      smallTargets: (m.smallTargets || []).length,
      axeViolations: rec.axe ? rec.axe.violationCount : 0,
      consoleErrors: (rec.consoleErrors || []).length,
      errors: (rec.errors || []).length,
      focusViolations: focusVios.length,
      ms: rec.timing.totalMs || 0
    });

    const recPath = path.join(OUT_DIR, `${rec.id}.json`);
    await fs.writeFile(recPath, JSON.stringify(rec, null, 2));

    const ms = Date.now() - t0;
    const flagBits = [];
    if ((m.docOverflow || 0) > 0) flagBits.push(`OVF=${m.docOverflow}`);
    if ((m.horizOverflow || 0) > 0) flagBits.push(`HOVF=${m.horizOverflow}`);
    if ((m.truncated || []).length) flagBits.push(`TR=${m.truncated.length}`);
    if (((m.offscreen || []).filter(o => o.reach === 'unreachable')).length) flagBits.push(`OFF=${((m.offscreen || []).filter(o => o.reach === 'unreachable')).length}`);
    if ((m.smallTargets || []).length) flagBits.push(`TT=${m.smallTargets.length}`);
    if (focusVios.length) flagBits.push(`FOCUS=${focusVios.length}`);
    if (rec.axe && rec.axe.violationCount) flagBits.push(`AXE=${rec.axe.violationCount}`);
    if ((rec.consoleErrors || []).length) flagBits.push(`CON=${rec.consoleErrors.length}`);
    if ((rec.errors || []).length) flagBits.push(`ERR=${rec.errors.length}`);
    const flag = flagBits.length ? ' ' + flagBits.join(' ') : '';
    console.log(`[${i}/${cells.length}] ${rec.id} (${ms}ms)${flag}`);
  }

  await browser.close();
  await fs.writeFile(path.join(OUT_DIR, '_summary.json'), JSON.stringify(summary, null, 2));
  console.log(`[v27-audit] DONE. completed=${summary.completed} failed=${summary.failed}`);
  console.log(`[v27-audit] findings:`, summary.findings);
  console.log(`[v27-audit] summary written to ${path.relative(REPO_ROOT, path.join(OUT_DIR, '_summary.json'))}`);
}

main().catch((e) => {
  console.error('[v27-audit] fatal:', e);
  process.exit(1);
});
