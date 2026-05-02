/* =============================================================
   SOCIAL PROOF — V24 Tier 4
   IIFE module exposing window.SocialProof.

   Live ticker counter for hero + dashboard. Persona-aware label.
   Number ticks UP at random intervals every 8-15 seconds, +1 to +3.
   Each persona has its own starting count + label.

   Spec: "premium-warm-honest persuasion" — never casino-dopamine.
   The number is illustrative for V24; real-time count arrives in V25
   when analytics wiring lands.

   Usage:
     <div data-social-proof></div>
     SocialProof.mount(node, { persona: 'SP1' })
   ============================================================= */
(function (global) {
  'use strict';

  // Persona-aware starting counts + labels.
  // Counts are illustrative-but-reasonable for an "in the last hour" frame.
  // Labels come from persona-strings.json socialProofLabel field.
  // Falls back to baked-in defaults if window.NORA_PERSONA_STRINGS isn't loaded.
  var DEFAULT_LINES = {
    SP1: { count: 1247, label: 'freelancers got their number this hour' },
    CL1: { count: 318,  label: 'renewal-spike checks this hour' },
    BR1: { count: 296,  label: 'bridge year quotes this hour' },
    RU1: { count: 184,  label: 'first-coverage applications this hour' },
    PC1: { count: 814,  label: 'diagnostic checks this hour' },
    GEN: { count: 1124, label: 'plan reviews this hour' }
  };

  // Tick cadence — every 8-15s, increment +1 to +3.
  var TICK_MIN_MS = 8000;
  var TICK_MAX_MS = 15000;
  var TICK_DELTA_MIN = 1;
  var TICK_DELTA_MAX = 3;

  var instances = []; // { node, persona, count, label, timer, reduced }

  var SocialProof = {
    mount: mount,
    setPersona: setPersona,
    destroy: destroy
  };

  function mount(node, opts) {
    if (!node) return null;
    opts = opts || {};
    // Idempotent: re-mount = update + restart.
    var existing = findInst(node);
    if (existing) {
      destroy(node);
    }
    var persona = (opts.persona || 'GEN').toUpperCase();
    var line = resolveLine(persona);
    var inst = {
      node: node,
      persona: persona,
      count: line.count,
      label: line.label,
      timer: null,
      reduced: prefersReducedMotion()
    };
    instances.push(inst);
    build(inst);
    if (!inst.reduced) scheduleTick(inst);
    return inst;
  }

  function setPersona(node, persona) {
    var inst = findInst(node);
    if (!inst) return;
    var p = (persona || 'GEN').toUpperCase();
    if (p === inst.persona) return;
    var line = resolveLine(p);
    inst.persona = p;
    inst.count = line.count;
    inst.label = line.label;
    renderText(inst);
  }

  function destroy(node) {
    var inst = findInst(node);
    if (!inst) return;
    if (inst.timer) clearTimeout(inst.timer);
    instances = instances.filter(function (i) { return i !== inst; });
  }

  // ─── INTERNAL ─────────────────────────────────────────────────
  function resolveLine(persona) {
    // Prefer label from the active persona-strings.json if loaded.
    var fromStrings = global.NORA_PERSONA_STRINGS && global.NORA_PERSONA_STRINGS[persona];
    var label = (fromStrings && fromStrings.socialProofLabel) ||
                (DEFAULT_LINES[persona] && DEFAULT_LINES[persona].label) ||
                DEFAULT_LINES.GEN.label;
    var count = (DEFAULT_LINES[persona] && DEFAULT_LINES[persona].count) ||
                DEFAULT_LINES.GEN.count;
    return { count: count, label: label };
  }

  function build(inst) {
    inst.node.innerHTML = '';
    inst.node.classList.add('social-proof');
    var dot = document.createElement('span');
    dot.className = 'sp-dot';
    dot.setAttribute('aria-hidden', 'true');
    var num = document.createElement('span');
    num.className = 'sp-num';
    num.setAttribute('data-sp-num', '');
    var label = document.createElement('span');
    label.className = 'sp-label';
    label.setAttribute('data-sp-label', '');
    inst.node.appendChild(dot);
    inst.node.appendChild(num);
    inst.node.appendChild(document.createTextNode(' '));
    inst.node.appendChild(label);
    renderText(inst);
  }

  function renderText(inst) {
    var num = inst.node.querySelector('[data-sp-num]');
    var lab = inst.node.querySelector('[data-sp-label]');
    if (num) num.textContent = formatNumber(inst.count);
    if (lab) lab.textContent = inst.label;
  }

  function scheduleTick(inst) {
    if (inst.reduced) return;
    var delay = randomInt(TICK_MIN_MS, TICK_MAX_MS);
    inst.timer = setTimeout(function () {
      tick(inst);
      scheduleTick(inst);
    }, delay);
  }

  function tick(inst) {
    var delta = randomInt(TICK_DELTA_MIN, TICK_DELTA_MAX);
    inst.count += delta;
    var num = inst.node.querySelector('[data-sp-num]');
    if (!num) return;
    num.textContent = formatNumber(inst.count);
    // Brief flash via class — kept short, premium-warm not casino-dopamine.
    num.classList.add('is-ticking');
    setTimeout(function () {
      try { num.classList.remove('is-ticking'); } catch (e) {}
    }, 350);
  }

  function findInst(node) {
    for (var i = 0; i < instances.length; i++) {
      if (instances[i].node === node) return instances[i];
    }
    return null;
  }

  function formatNumber(n) {
    n = Math.round(Number(n) || 0);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function prefersReducedMotion() {
    try {
      return global.matchMedia &&
             global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  }

  global.SocialProof = SocialProof;
})(typeof window !== 'undefined' ? window : this);
