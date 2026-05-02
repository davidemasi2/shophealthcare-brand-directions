/* =============================================================
   LAYOUT-DIRECTOR — V26 Component G
   Phase-aware layout orchestrator.

   On phase transition: capture zone rects → swap data-layout-phase +
   per-zone role classes → capture new rects → invoke FlipZones.play()
   to animate from old → new positions over 720ms.

   Phase grammar (V26 LOCKED):
     match    — Chat LEAD,    Dash SUPPORT, Drawer MINI
     read     — Chat LEAD,    Dash SUPPORT, Drawer MINI
     price    — Chat SUPPORT, Dash LEAD,    Drawer MINI
     compare  — Chat MINI,    Dash LEAD,    Drawer MINI    (plans-grid mode)
     lock     — Chat MINI,    Dash SUPPORT, Drawer LEAD    (drawer slides in)
     enroll   — Single-column "Continue is the screen"

   Public API:
     window.LayoutDirector.init(shell?, opts?)
     window.LayoutDirector.setLayoutPhase('match'|'read'|'price'|'compare'|'lock'|'enroll', { animate?: bool })
     window.LayoutDirector.getCurrentPhase() -> string
   ============================================================= */
(function (global) {
  'use strict';

  // ─── PHASE → ROLE MAP ───────────────────────────────────────
  // Each role drives CSS rules in nora-app.css via .nx-zone--{role}.
  // 'lead-fullscreen' is reserved for ENROLL-B "Continue is the screen".
  var PHASE_ROLES = {
    match:   { chat: 'lead',    dash: 'support', drawer: 'mini' },
    read:    { chat: 'lead',    dash: 'support', drawer: 'mini' },
    price:   { chat: 'support', dash: 'lead',    drawer: 'mini' },
    compare: { chat: 'mini',    dash: 'lead',    drawer: 'mini' },
    lock:    { chat: 'mini',    dash: 'support', drawer: 'lead' },
    enroll:  { chat: 'enroll-collapsed', dash: 'enroll-collapsed', drawer: 'lead-fullscreen' }
  };

  var ROLE_CLASSES = ['nx-zone--lead', 'nx-zone--support', 'nx-zone--mini',
                      'nx-zone--lead-fullscreen', 'nx-zone--enroll-collapsed'];

  var DEFAULT_DURATION_MS = 720;

  var _shell = null;
  var _currentPhase = null;

  // ─── PUBLIC API ─────────────────────────────────────────────
  function init(shellEl, opts) {
    opts = opts || {};
    _shell = shellEl || global.document.getElementById('nx-shell');
    if (!_shell) {
      console.warn('[LayoutDirector] init: no shell element found');
      return;
    }
    var startPhase = opts.startPhase || 'match';
    setLayoutPhase(startPhase, { animate: false });
  }

  function setLayoutPhase(phaseKey, opts) {
    opts = opts || {};
    if (!_shell) _shell = global.document.getElementById('nx-shell');
    if (!_shell) return;

    var roles = PHASE_ROLES[phaseKey];
    if (!roles) {
      console.warn('[LayoutDirector] unknown phase:', phaseKey);
      return;
    }

    if (phaseKey === _currentPhase) return;

    var animate = opts.animate !== false;
    var reduced = false;
    try {
      reduced = global.matchMedia &&
                global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {}

    var els = _collectZones();

    if (animate && !reduced && global.FlipZones) {
      // FLIP — capture First
      var oldRects = global.FlipZones.capture(els);
      // Apply new state (Last is read after this)
      _applyPhase(phaseKey, roles);
      // Capture Last
      var newRects = global.FlipZones.capture(els);
      // Invert + Play
      global.FlipZones.play(els, oldRects, newRects, {
        duration: DEFAULT_DURATION_MS
      });
    } else {
      _applyPhase(phaseKey, roles);
    }

    _currentPhase = phaseKey;

    // Notify listeners (e.g. mobile-tabs auto-pivot)
    try {
      global.document.dispatchEvent(new CustomEvent('layoutPhaseChange', {
        detail: { phase: phaseKey, roles: roles }
      }));
    } catch (e) {}
  }

  function getCurrentPhase() {
    return _currentPhase;
  }

  // ─── INTERNAL ───────────────────────────────────────────────
  function _applyPhase(phaseKey, roles) {
    _shell.setAttribute('data-layout-phase', phaseKey);

    Object.keys(roles).forEach(function (zoneKey) {
      var el = global.document.getElementById('zone-' + zoneKey);
      if (!el) return;
      ROLE_CLASSES.forEach(function (cls) { el.classList.remove(cls); });
      el.classList.add('nx-zone--' + roles[zoneKey]);
    });
  }

  function _collectZones() {
    return [
      global.document.getElementById('zone-chat'),
      global.document.getElementById('zone-dash'),
      global.document.getElementById('zone-drawer')
    ].filter(Boolean);
  }

  // ─── EXPORT ─────────────────────────────────────────────────
  global.LayoutDirector = {
    init: init,
    setLayoutPhase: setLayoutPhase,
    getCurrentPhase: getCurrentPhase,
    PHASE_ROLES: PHASE_ROLES
  };
})(typeof window !== 'undefined' ? window : this);
