/* =============================================================
   UNLOCK TRAIL — V21 Component B
   IIFE module exposing window.UnlockTrail = { mount, update, hydrate }.
   Stage definitions, animation tuning, and stage labels live at top.
   ============================================================= */
(function (global) {
  'use strict';

  // ─── TUNING CONSTANTS ────────────────────────────────────────
  // Pop-badge total visible time = POP_IN + POP_HOLD + POP_OUT.
  // CSS keyframe `ut-pop` is composed from these via --ut-pop-dur var.
  var POP_IN_MS   = 600;
  var POP_HOLD_MS = 2000;
  var POP_OUT_MS  = 400;
  var POP_TOTAL_MS = POP_IN_MS + POP_HOLD_MS + POP_OUT_MS; // 3000ms

  var STORAGE_KEY = 'shc_session';

  // ─── STAGE DEFINITIONS ───────────────────────────────────────
  // Edit labels/tooltips here. Keys are 1-indexed (matches `currentStep`).
  // Each stage has:
  //   label    — short caps label under the dot (≤ 10 chars ideal)
  //   tooltip  — short explainer on hover/tap of a future dot
  //   surface  — which app shows it (informational only)
  var STAGES = [
    { id: 1, label: 'Tile',       tooltip: 'Persona declared',                                 surface: 'homepage' },
    { id: 2, label: 'State',      tooltip: 'State sets which carriers can quote you',          surface: 'quiz' },
    { id: 3, label: 'Age',        tooltip: 'Age narrows the rate band',                        surface: 'quiz' },
    { id: 4, label: 'Sex',        tooltip: 'Sex affects your underwriting rate',               surface: 'quiz' },
    { id: 5, label: 'Conditions', tooltip: 'Pregnancy + ongoing conditions route the plan',    surface: 'quiz' },
    { id: 6, label: 'Discovery',  tooltip: 'Name, ZIP, DOB, and details so Nora can quote',    surface: 'nora' },
    { id: 7, label: 'Plan',       tooltip: 'Your real, finalized quote',                       surface: 'nora' }
  ];
  var TOTAL_STEPS = STAGES.length; // 7

  // ─── INTERNAL STATE ──────────────────────────────────────────
  // Only one trail per page is the realistic case (top of quiz / top of app).
  // We support multiple simultaneously by keying state to the host element.
  var instances = []; // { host, state, els }

  // ─── PUBLIC API ──────────────────────────────────────────────
  var UnlockTrail = {
    mount: mount,
    update: update,
    hydrate: hydrate,
    STAGES: STAGES,
    TOTAL_STEPS: TOTAL_STEPS
  };

  function mount(host, opts) {
    if (!host) {
      console.warn('[UnlockTrail] mount called with no host');
      return null;
    }
    opts = opts || {};

    // Idempotent: if already mounted, just re-render
    var existing = findInstance(host);
    if (existing) {
      existing.state = mergeState(existing.state, opts);
      render(existing);
      return UnlockTrail;
    }

    var state = mergeState(defaultState(), opts);
    var inst = { host: host, state: state, els: null, popTimer: null, onStageHover: opts.onStageHover || null };
    instances.push(inst);
    build(inst);
    render(inst);
    persist(inst);
    return UnlockTrail;
  }

  // update() applies to ALL mounted instances (most pages have one).
  // If you need per-host targeting, pass { host } in `next`.
  function update(next) {
    next = next || {};
    var targets = next.host ? instances.filter(function (i) { return i.host === next.host; })
                            : instances;
    targets.forEach(function (inst) {
      var prev = inst.state;
      inst.state = mergeState(prev, next);
      render(inst);
      persist(inst);
      // Trigger pop-badge animation if a positive valueDelta was passed
      if (typeof next.valueDelta === 'number' && next.valueDelta > 0) {
        triggerPop(inst, next.valueDelta);
      }
    });
  }

  // hydrate() returns the saved trail state from localStorage, or null.
  // Callers can pass it into mount() to resume where the user left off.
  function hydrate() {
    try {
      var raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.unlock_trail) return null;
      var t = parsed.unlock_trail;
      return {
        currentStep:    typeof t.currentStep === 'number' ? t.currentStep : 1,
        completedPct:   typeof t.completedPct === 'number' ? t.completedPct : 0,
        valueEstimate:  (t.valueEstimate === null || typeof t.valueEstimate === 'number') ? t.valueEstimate : null,
        valueDelta:     0, // never replay an old delta on hydrate
        timestamp:      t.timestamp || null
      };
    } catch (err) {
      console.warn('[UnlockTrail] hydrate failed:', err);
      return null;
    }
  }

  // ─── STATE HELPERS ───────────────────────────────────────────
  function defaultState() {
    return {
      currentStep: 1,
      completedPct: 0,
      valueEstimate: null,
      valueDelta: 0
    };
  }
  function mergeState(prev, next) {
    var merged = {
      currentStep:   typeof next.currentStep   === 'number' ? next.currentStep   : prev.currentStep,
      completedPct:  typeof next.completedPct  === 'number' ? next.completedPct  : prev.completedPct,
      valueEstimate: ('valueEstimate' in next) ? next.valueEstimate : prev.valueEstimate,
      valueDelta:    typeof next.valueDelta    === 'number' ? next.valueDelta    : 0
    };
    // Clamp
    if (merged.currentStep < 1) merged.currentStep = 1;
    if (merged.currentStep > TOTAL_STEPS + 1) merged.currentStep = TOTAL_STEPS + 1;
    if (merged.completedPct < 0) merged.completedPct = 0;
    if (merged.completedPct > 100) merged.completedPct = 100;
    return merged;
  }

  // ─── DOM BUILD (once per mount) ──────────────────────────────
  function build(inst) {
    var host = inst.host;
    host.classList.add('unlock-trail');
    host.setAttribute('role', 'progressbar');
    host.setAttribute('aria-valuemin', '0');
    host.setAttribute('aria-valuemax', '100');
    host.setAttribute('aria-label', 'Unlock progress');

    host.innerHTML = ''; // idempotent

    // Inject CSS variable for pop-total duration so JS / CSS stay in sync
    host.style.setProperty('--ut-pop-dur', POP_TOTAL_MS + 'ms');

    var top = el('div', 'ut-top');

    var stagesEl = el('div', 'ut-stages');
    var stageEls = [];
    STAGES.forEach(function (s, idx) {
      var stageEl = el('div', 'ut-stage');
      stageEl.setAttribute('tabindex', '0');
      stageEl.setAttribute('data-stage-id', String(s.id));

      var dot = el('div', 'ut-dot');
      // Inline SVG check (8x8 viewBox, scales via CSS .ut-check sizing)
      dot.innerHTML = '<svg class="ut-check" viewBox="0 0 8 8" aria-hidden="true">' +
                      '<path d="M1.4 4.2 L3.2 6 L6.6 2"/>' +
                      '</svg>';
      stageEl.appendChild(dot);

      var label = el('div', 'ut-label');
      label.textContent = s.label;
      stageEl.appendChild(label);

      var tip = el('div', 'ut-tooltip');
      tip.innerHTML = '<strong>' + s.label + '</strong> — ' + s.tooltip;
      tip.setAttribute('role', 'tooltip');
      stageEl.appendChild(tip);

      // Tap-to-show on touch (no :hover): toggle .is-tap-open
      stageEl.addEventListener('click', function (e) {
        // Only react on coarse pointers — desktop hover handles itself
        if (global.matchMedia && global.matchMedia('(hover: hover)').matches) return;
        e.stopPropagation();
        var wasOpen = stageEl.classList.contains('is-tap-open');
        // Close all others
        stageEls.forEach(function (s2) { s2.classList.remove('is-tap-open'); });
        if (!wasOpen) stageEl.classList.add('is-tap-open');
      });

      stageEl.addEventListener('mouseenter', function () {
        if (typeof inst.onStageHover === 'function') {
          try { inst.onStageHover(s); } catch (err) { /* swallow consumer errors */ }
        }
      });

      stagesEl.appendChild(stageEl);
      stageEls.push(stageEl);
    });

    // Close tap-open tooltips when tapping outside any stage
    if (!build._docTapBound) {
      global.document.addEventListener('click', function () {
        instances.forEach(function (i) {
          if (!i.els) return;
          i.els.stageEls.forEach(function (s) { s.classList.remove('is-tap-open'); });
        });
      });
      build._docTapBound = true;
    }

    var valueWrap = el('div', 'ut-value-wrap');
    var value = el('div', 'ut-value');
    var pop = el('div', 'ut-pop');
    pop.setAttribute('aria-live', 'polite');
    valueWrap.appendChild(value);
    valueWrap.appendChild(pop);

    top.appendChild(stagesEl);
    top.appendChild(valueWrap);

    var counter = el('div', 'ut-counter');

    host.appendChild(top);
    host.appendChild(counter);

    inst.els = {
      stagesEl:  stagesEl,
      stageEls:  stageEls,
      valueEl:   value,
      popEl:     pop,
      counterEl: counter
    };
  }

  // ─── RENDER (called on every state change) ───────────────────
  function render(inst) {
    var s = inst.state;
    var els = inst.els;

    // Dots
    els.stageEls.forEach(function (stageEl, idx) {
      var stageNum = idx + 1; // 1-indexed
      stageEl.classList.remove('is-completed', 'is-active');
      if (stageNum < s.currentStep) {
        stageEl.classList.add('is-completed');
        stageEl.setAttribute('aria-label', STAGES[idx].label + ' — completed');
      } else if (stageNum === s.currentStep) {
        stageEl.classList.add('is-active');
        stageEl.setAttribute('aria-label', STAGES[idx].label + ' — current');
      } else {
        stageEl.setAttribute('aria-label', STAGES[idx].label + ' — upcoming');
      }
    });

    // Value pill
    if (s.valueEstimate === null || typeof s.valueEstimate === 'undefined') {
      els.valueEl.classList.add('is-pending');
      els.valueEl.textContent = 'Calculating…';
    } else {
      els.valueEl.classList.remove('is-pending');
      els.valueEl.innerHTML =
        '<span class="ut-tilde">~</span>$' + formatNumber(s.valueEstimate) +
        '<span class="ut-suffix">/mo</span>';
    }

    // Step counter
    els.counterEl.innerHTML = renderCounter(s);

    // Aria
    inst.host.setAttribute('aria-valuenow', String(s.completedPct));
  }

  function renderCounter(s) {
    if (s.currentStep > TOTAL_STEPS) {
      return '<strong>Complete</strong> <span class="ut-sep">·</span> ' +
             '<span class="ut-tail">Your real plan is ready</span>';
    }
    var stepNum = Math.min(s.currentStep, TOTAL_STEPS);
    var remaining = TOTAL_STEPS - stepNum;
    var pct = Math.round(s.completedPct);

    // Step counter copy chooser — tail rotates by progress band
    var tail;
    if (remaining === 0) {
      tail = '<span class="ut-tail">Almost there · One more thing</span>';
    } else if (remaining === 1) {
      tail = '<span class="ut-tail">Almost there · One more thing</span>';
    } else if (pct >= 70) {
      tail = '<span class="ut-tail">' + remaining + ' to your real plan</span>';
    } else if (pct >= 40) {
      tail = remaining + ' questions left <span class="ut-sep">·</span> Then Nora takes over';
    } else {
      tail = "You're " + pct + '% of the way to your real plan';
    }

    return '<strong>Step ' + stepNum + ' of ' + TOTAL_STEPS + '</strong> ' +
           '<span class="ut-sep">·</span> ' + tail;
  }

  // ─── POP-BADGE ───────────────────────────────────────────────
  function triggerPop(inst, delta) {
    if (!inst.els || !inst.els.popEl) return;
    var pop = inst.els.popEl;
    pop.textContent = '+$' + formatNumber(delta) + ' just unlocked';
    // Restart animation
    pop.classList.remove('is-popping');
    // Force reflow so re-adding the class restarts the animation
    void pop.offsetWidth;
    pop.classList.add('is-popping');

    if (inst.popTimer) global.clearTimeout(inst.popTimer);
    inst.popTimer = global.setTimeout(function () {
      pop.classList.remove('is-popping');
    }, POP_TOTAL_MS + 50);
  }

  // ─── PERSISTENCE ─────────────────────────────────────────────
  function persist(inst) {
    try {
      if (!global.localStorage) return;
      var current = {};
      try {
        var raw = global.localStorage.getItem(STORAGE_KEY);
        if (raw) current = JSON.parse(raw) || {};
      } catch (parseErr) {
        current = {};
      }
      current.unlock_trail = {
        currentStep:    inst.state.currentStep,
        completedPct:   inst.state.completedPct,
        valueEstimate:  inst.state.valueEstimate,
        lastValueDelta: inst.state.valueDelta || 0,
        timestamp:      Date.now()
      };
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (err) {
      // Quota / privacy mode — silent fallback, component still works in-memory
      // console.warn('[UnlockTrail] persist failed:', err);
    }
  }

  // ─── UTILS ───────────────────────────────────────────────────
  function el(tag, cls) {
    var e = global.document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function findInstance(host) {
    for (var i = 0; i < instances.length; i++) {
      if (instances[i].host === host) return instances[i];
    }
    return null;
  }

  function formatNumber(n) {
    n = Math.round(Number(n) || 0);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ─── EXPORT ──────────────────────────────────────────────────
  global.UnlockTrail = UnlockTrail;
})(typeof window !== 'undefined' ? window : this);
