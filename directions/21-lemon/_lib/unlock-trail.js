/* =============================================================
   UNLOCK TRAIL — V25 Component B (6-phase model)
   IIFE module exposing window.UnlockTrail.

   V25: 6 PHASES (MATCH · READ · PRICE · COMPARE · LOCK · ENROLL)
   replace V21's 7 atomic steps. Backward-compatible via
   LEGACY_STEP_MAP — existing callers using { currentStep: N }
   continue to work; the trail derives the phase from the step.
   ============================================================= */
(function (global) {
  'use strict';

  // ─── TUNING CONSTANTS ────────────────────────────────────────
  var POP_IN_MS    = 600;
  var POP_HOLD_MS  = 2000;
  var POP_OUT_MS   = 400;
  var POP_TOTAL_MS = POP_IN_MS + POP_HOLD_MS + POP_OUT_MS;

  var STORAGE_KEY = 'shc_session';

  // ─── PHASE DEFINITIONS ───────────────────────────────────────
  // 6 phases. Compare auto-completes on plan-pick; Enroll is parked
  // until markEnrollReady(true) is called (post-Lock).
  var PHASES = [
    { id:1, key:'match',   label:'MATCH',   tooltip:'We see you. Persona + state.',
      tail:'Just two minutes to your number.' },
    { id:2, key:'read',    label:'READ',    tooltip:'Age, sex, conditions — plus your card if you have one.',
      tail:"You're already halfway. The hard part is done." },
    { id:3, key:'price',   label:'PRICE',   tooltip:'Your real number with your real carriers.',
      tail:'Your number is one tap away.' },
    { id:4, key:'compare', label:'COMPARE', tooltip:'Weigh your options. We marked the fit.',
      tail:'Pick the one that fits. We marked our recommendation.' },
    { id:5, key:'lock',    label:'LOCK',    tooltip:'Hold this rate for 30 days.',
      tail:'Almost yours. Lock this number.' },
    { id:6, key:'enroll',  label:'ENROLL',  tooltip:'Sign up. Coverage starts.',
      tail:'Carrier-ready. Coverage starts in days.', conditional:true,
      parkedTooltip:'Ready when you are.' }
  ];
  var TOTAL_PHASES = PHASES.length; // 6
  var PHASE_BY_KEY = {};
  PHASES.forEach(function (p) { PHASE_BY_KEY[p.key] = p; });

  // Backward-compat: legacy callers pass currentStep 1-9.
  // Map each legacy step to a phase + intra-phase sub-progress.
  var LEGACY_STEP_MAP = {
    1: { phase:1, sub:50  },   // tile entered
    2: { phase:1, sub:100 },   // state set → match complete-ish
    3: { phase:2, sub:33  },   // age
    4: { phase:2, sub:66  },   // sex
    5: { phase:2, sub:100 },   // conditions → read complete
    6: { phase:3, sub:50  },   // discovery underway
    7: { phase:4, sub:0   },   // plans rendered → PRICE complete, COMPARE active
    8: { phase:5, sub:0   },   // plan picked → COMPARE complete, LOCK active
    9: { phase:6, sub:0   }    // lock complete → ENROLL active
  };

  // ─── INTERNAL STATE ──────────────────────────────────────────
  var instances = []; // { host, state, els, popTimer, onStageHover }

  // ─── PUBLIC API ──────────────────────────────────────────────
  var UnlockTrail = {
    mount: mount,
    update: update,
    advancePhase: advancePhase,
    completePhase: completePhase,
    markEnrollReady: markEnrollReady,
    hydrate: hydrate,
    PHASES: PHASES,
    TOTAL_PHASES: TOTAL_PHASES
  };

  function mount(host, opts) {
    if (!host) {
      console.warn('[UnlockTrail] mount called with no host');
      return null;
    }
    opts = opts || {};

    var existing = findInstance(host);
    if (existing) {
      existing.state = mergeState(existing.state, opts);
      render(existing);
      return UnlockTrail;
    }

    var state = mergeState(defaultState(), opts);
    var inst = { host: host, state: state, els: null, popTimer: null,
                 onStageHover: opts.onStageHover || null };
    instances.push(inst);
    build(inst);
    render(inst);
    persist(inst);
    return UnlockTrail;
  }

  // update() — supports BOTH the legacy { currentStep, completedPct }
  // shape AND the new { phaseKey, subProgress } shape. valueEstimate
  // and valueDelta still flow through.
  function update(next) {
    next = next || {};
    var targets = next.host ? instances.filter(function (i) { return i.host === next.host; })
                            : instances;
    targets.forEach(function (inst) {
      var prev = inst.state;
      var prevPhase = prev.currentPhase;
      inst.state = mergeState(prev, next);
      render(inst);
      persist(inst);
      // Phase-boundary pop-badge
      if (next.isUnlockEvent === true &&
          typeof next.valueDelta === 'number' && next.valueDelta > 0) {
        triggerPop(inst, next.valueDelta);
      }
      // Auto-pop on phase advance with positive delta in valueEstimate
      else if (inst.state.currentPhase > prevPhase &&
               typeof inst.state.valueDelta === 'number' && inst.state.valueDelta > 0) {
        triggerPop(inst, inst.state.valueDelta);
      }
    });
  }

  // Direct phase API — preferred for new-world callers
  function advancePhase(phaseKey) {
    var p = PHASE_BY_KEY[phaseKey];
    if (!p) {
      console.warn('[UnlockTrail] advancePhase: unknown phase', phaseKey);
      return;
    }
    update({ currentPhase: p.id, subProgress: 0 });
  }
  function completePhase(phaseKey) {
    var p = PHASE_BY_KEY[phaseKey];
    if (!p) {
      console.warn('[UnlockTrail] completePhase: unknown phase', phaseKey);
      return;
    }
    // Mark sub at 100, then auto-advance to next phase if one exists
    var nextId = p.id < TOTAL_PHASES ? p.id + 1 : p.id;
    update({ currentPhase: nextId, subProgress: nextId > p.id ? 0 : 100 });
  }
  function markEnrollReady(ready) {
    update({ enrollReady: !!ready });
  }

  // hydrate() — reads V25 schema or migrates V21 legacy state
  function hydrate() {
    try {
      var raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.unlock_trail) return null;
      var t = parsed.unlock_trail;

      // V25 schema?
      if (typeof t.currentPhase === 'number') {
        return {
          currentPhase:  t.currentPhase,
          subProgress:   typeof t.subProgress === 'number' ? t.subProgress : 0,
          enrollReady:   !!t.enrollReady,
          valueEstimate: (t.valueEstimate === null || typeof t.valueEstimate === 'number') ? t.valueEstimate : null,
          valueDelta:    0,
          timestamp:     t.timestamp || null
        };
      }
      // V21 legacy migration
      if (typeof t.currentStep === 'number') {
        var mapped = LEGACY_STEP_MAP[t.currentStep] || { phase:1, sub:0 };
        return {
          currentPhase:  mapped.phase,
          subProgress:   mapped.sub,
          enrollReady:   false,
          valueEstimate: (t.valueEstimate === null || typeof t.valueEstimate === 'number') ? t.valueEstimate : null,
          valueDelta:    0,
          timestamp:     t.timestamp || null
        };
      }
      return null;
    } catch (err) {
      console.warn('[UnlockTrail] hydrate failed:', err);
      return null;
    }
  }

  // ─── STATE HELPERS ───────────────────────────────────────────
  function defaultState() {
    return {
      currentPhase:  1,
      subProgress:   0,
      enrollReady:   false,
      valueEstimate: null,
      valueDelta:    0
    };
  }
  function mergeState(prev, next) {
    var merged = {
      currentPhase:  prev.currentPhase,
      subProgress:   prev.subProgress,
      enrollReady:   prev.enrollReady,
      valueEstimate: prev.valueEstimate,
      valueDelta:    0
    };
    // Legacy step input → derive phase + sub
    if (typeof next.currentStep === 'number') {
      var mapped = LEGACY_STEP_MAP[next.currentStep];
      if (mapped) {
        merged.currentPhase = mapped.phase;
        merged.subProgress  = mapped.sub;
      }
    }
    // Direct phase API
    if (typeof next.currentPhase === 'number') {
      merged.currentPhase = next.currentPhase;
    }
    if (typeof next.subProgress === 'number') {
      merged.subProgress = next.subProgress;
    }
    if (typeof next.enrollReady === 'boolean') {
      merged.enrollReady = next.enrollReady;
    }
    if ('valueEstimate' in next) {
      merged.valueEstimate = next.valueEstimate;
    }
    if (typeof next.valueDelta === 'number') {
      merged.valueDelta = next.valueDelta;
    }
    // Clamp
    if (merged.currentPhase < 1) merged.currentPhase = 1;
    if (merged.currentPhase > TOTAL_PHASES + 1) merged.currentPhase = TOTAL_PHASES + 1;
    if (merged.subProgress < 0) merged.subProgress = 0;
    if (merged.subProgress > 100) merged.subProgress = 100;
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

    host.innerHTML = '';
    host.style.setProperty('--ut-pop-dur', POP_TOTAL_MS + 'ms');

    var top = el('div', 'ut-top');
    var stagesEl = el('div', 'ut-stages');
    var stageEls = [];

    PHASES.forEach(function (p) {
      var stageEl = el('div', 'ut-stage');
      stageEl.setAttribute('tabindex', '0');
      stageEl.setAttribute('data-phase-key', p.key);
      stageEl.setAttribute('data-phase-id', String(p.id));
      if (p.conditional) stageEl.classList.add('is-conditional');

      var dot = el('div', 'ut-dot');
      // Inner check (for completed) + sub-progress ring overlay (for active)
      dot.innerHTML =
        '<svg class="ut-check" viewBox="0 0 8 8" aria-hidden="true">' +
          '<path d="M1.4 4.2 L3.2 6 L6.6 2"/>' +
        '</svg>' +
        '<span class="ut-subring" aria-hidden="true"></span>';
      stageEl.appendChild(dot);

      var label = el('div', 'ut-label');
      label.textContent = p.label;
      stageEl.appendChild(label);

      var tip = el('div', 'ut-tooltip');
      tip.innerHTML = '<strong>' + p.label + '</strong> — ' + p.tooltip;
      tip.setAttribute('role', 'tooltip');
      stageEl.appendChild(tip);

      // Tap-to-show on touch
      stageEl.addEventListener('click', function (e) {
        if (global.matchMedia && global.matchMedia('(hover: hover)').matches) return;
        e.stopPropagation();
        var wasOpen = stageEl.classList.contains('is-tap-open');
        stageEls.forEach(function (s2) { s2.classList.remove('is-tap-open'); });
        if (!wasOpen) stageEl.classList.add('is-tap-open');
      });
      stageEl.addEventListener('mouseenter', function () {
        if (typeof inst.onStageHover === 'function') {
          try { inst.onStageHover(p); } catch (err) {}
        }
      });

      stagesEl.appendChild(stageEl);
      stageEls.push(stageEl);
    });

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
    var activePhaseId = s.currentPhase;

    els.stageEls.forEach(function (stageEl, idx) {
      var phase = PHASES[idx];
      var phaseId = phase.id;
      stageEl.classList.remove('is-completed', 'is-active', 'is-parked');
      stageEl.removeAttribute('aria-current');

      // Conditional ENROLL phase parking — until markEnrollReady(true)
      // OR phase reached, render small/dim "ready when you are" state
      var isParked = phase.conditional && !s.enrollReady && phaseId > activePhaseId;
      if (isParked) {
        stageEl.classList.add('is-parked');
        // Replace tooltip strong text for parked state
        var pTip = stageEl.querySelector('.ut-tooltip');
        if (pTip) pTip.innerHTML = '<strong>' + phase.label + '</strong> — ' + (phase.parkedTooltip || phase.tooltip);
        stageEl.setAttribute('aria-label', phase.label + ' — ready when you are');
        // Reset sub-progress var
        stageEl.style.setProperty('--sub-progress', '0%');
      } else if (phaseId < activePhaseId) {
        stageEl.classList.add('is-completed');
        stageEl.setAttribute('aria-label', phase.label + ' — completed');
        stageEl.style.setProperty('--sub-progress', '100%');
        // Reset tooltip to default
        var cTip = stageEl.querySelector('.ut-tooltip');
        if (cTip) cTip.innerHTML = '<strong>' + phase.label + '</strong> — ' + phase.tooltip;
      } else if (phaseId === activePhaseId) {
        stageEl.classList.add('is-active');
        stageEl.setAttribute('aria-label', phase.label + ' — current');
        stageEl.setAttribute('aria-current', 'step');
        stageEl.style.setProperty('--sub-progress', s.subProgress + '%');
        var aTip = stageEl.querySelector('.ut-tooltip');
        if (aTip) aTip.innerHTML = '<strong>' + phase.label + '</strong> — ' + phase.tooltip;
      } else {
        stageEl.setAttribute('aria-label', phase.label + ' — upcoming');
        stageEl.style.setProperty('--sub-progress', '0%');
        var fTip = stageEl.querySelector('.ut-tooltip');
        if (fTip) fTip.innerHTML = '<strong>' + phase.label + '</strong> — ' + phase.tooltip;
      }
    });

    // Value pill — same persona-aware tag as V24
    if (s.valueEstimate === null || typeof s.valueEstimate === 'undefined') {
      els.valueEl.classList.add('is-pending');
      els.valueEl.textContent = 'Calculating…';
    } else {
      els.valueEl.classList.remove('is-pending');
      var personaTag = '';
      // OCR baseline supersedes persona tag if present
      var ocr = global.NORA_OCR_BASELINE;
      if (ocr && typeof ocr.monthly_premium === 'number') {
        personaTag = '<span class="ut-context"> · vs $' + formatNumber(ocr.monthly_premium) + ' your current</span>';
      } else {
        var personaKey = (global.NORA_ACTIVE_PERSONA || '').toUpperCase();
        var TAGS = {
          SP1: 'self-employed',
          CL1: 'vs $890 renewal',
          BR1: 'bridge years',
          RU1: '24h coverage',
          PC1: 'diagnostic',
          GEN: 'estimate'
        };
        if (TAGS[personaKey]) {
          personaTag = '<span class="ut-context"> · ' + TAGS[personaKey] + '</span>';
        }
      }
      els.valueEl.innerHTML =
        '<span class="ut-tilde">~</span>$' + formatNumber(s.valueEstimate) +
        '<span class="ut-suffix">/mo</span>' +
        personaTag;
    }

    // Counter row — phase-aware tail
    els.counterEl.innerHTML = renderCounter(s);

    // Aria — derive overall completion %
    var overallPct = computeOverallPct(s);
    inst.host.setAttribute('aria-valuenow', String(overallPct));
  }

  // 0-100 across all 6 phases, weighting equally
  function computeOverallPct(s) {
    var perPhase = 100 / TOTAL_PHASES;
    var done = (s.currentPhase - 1) * perPhase;
    var inPhase = (s.subProgress / 100) * perPhase;
    return Math.round(done + inPhase);
  }

  function renderCounter(s) {
    var phase = PHASES[s.currentPhase - 1] || PHASES[TOTAL_PHASES - 1];
    var tail = phase.tail;
    if (s.currentPhase > TOTAL_PHASES) {
      tail = "You're enrolled. Welcome to ShopHealthcare.";
    }
    return '<span class="ut-tail">' + tail + '</span>';
  }

  // ─── POP-BADGE ───────────────────────────────────────────────
  function triggerPop(inst, delta) {
    if (!inst.els || !inst.els.popEl) return;
    var pop = inst.els.popEl;
    pop.textContent = '+$' + formatNumber(delta) + ' just unlocked';
    pop.classList.remove('is-popping');
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
        currentPhase:  inst.state.currentPhase,
        subProgress:   inst.state.subProgress,
        enrollReady:   inst.state.enrollReady,
        valueEstimate: inst.state.valueEstimate,
        timestamp:     Date.now()
      };
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (err) {
      // silent — quota / privacy mode
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
