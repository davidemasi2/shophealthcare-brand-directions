/* =============================================================
   LAYOUT-DIRECTOR — V26 Component G + V28 zone-collapse extension
   Phase-aware layout orchestrator.

   On phase transition: capture zone rects → swap data-layout-phase +
   per-zone role classes → apply zone collapse (display:none) for hidden
   zones → capture new rects → invoke FlipZones.play() to animate from
   old → new positions over 720ms.

   Phase grammar:
     match    — Chat LEAD,    Dash SUPPORT, Drawer MINI       (V26)
     read     — Chat LEAD,    Dash SUPPORT, Drawer MINI       (V26)
     price    — Chat SUPPORT, Dash LEAD,    Drawer MINI       (V26)
     compare  — Chat MINI,    Dash LEAD,    Drawer MINI       (V26)
     lock     — V28 — Dash takes lead-fullscreen single column;
                Chat + Drawer hidden via display:none (out of DOM flow).
                The chosen card + AuthGate inline live inside Dash.
     enroll   — V28 — Drawer takes lead-fullscreen single column;
                Chat + Dash hidden via display:none. Drawer holds the
                receipt + carrier handoff CTA.

   V28 contract (locked):
     • Each phase declares which zones should be `display:none` via
       PHASE_ROLES[phaseKey].hidden = ['chat', 'drawer', ...].
     • _applyDisplayState() runs as part of phase application, BEFORE
       the FLIP "Last" rect capture so animated zones target their
       post-hide positions.
     • On transition AWAY from a phase, previously-hidden zones get
       their display style cleared (back to stylesheet default).
     • Custom event 'layoutPhaseChange' payload carries `visibleZones`
       so AuthGate, social-proof, plan-cards can self-suppress.

   Public API:
     window.LayoutDirector.init(shell?, opts?)
     window.LayoutDirector.setLayoutPhase('match'|'read'|'price'|'compare'|'lock'|'enroll', { animate?: bool })
     window.LayoutDirector.getCurrentPhase() -> string
     window.LayoutDirector.PHASE_ROLES   (read-only reference)
   ============================================================= */
(function (global) {
  'use strict';

  // ─── PHASE → ROLE MAP ───────────────────────────────────────
  // Each role drives CSS rules in nora-app.css via .nx-zone--{role}.
  // 'hidden' lists zones that should be display:none at this phase
  // (V28 zone-collapse contract).
  var PHASE_ROLES = {
    match:   { chat: 'lead',     dash: 'support',          drawer: 'mini',           hidden: [] },
    read:    { chat: 'lead',     dash: 'support',          drawer: 'mini',           hidden: [] },
    price:   { chat: 'support',  dash: 'lead',             drawer: 'mini',           hidden: [] },
    compare: { chat: 'mini',     dash: 'lead',             drawer: 'mini',           hidden: [] },
    // V28 LOCK: Dash takes lead-fullscreen single column.
    // Chat + Drawer go display:none. Chosen card + AuthGate live in Dash.
    lock:    { chat: 'lead-fullscreen-dash', dash: 'lead-fullscreen-dash', drawer: 'lead-fullscreen-dash', hidden: ['chat', 'drawer'] },
    // V28 ENROLL: Drawer takes lead-fullscreen single column.
    // Chat + Dash go display:none. Drawer holds receipt + carrier handoff.
    enroll:  { chat: 'lead-fullscreen', dash: 'lead-fullscreen', drawer: 'lead-fullscreen', hidden: ['chat', 'dash'] }
  };

  var ROLE_CLASSES = ['nx-zone--lead', 'nx-zone--support', 'nx-zone--mini',
                      'nx-zone--lead-fullscreen', 'nx-zone--lead-fullscreen-dash',
                      'nx-zone--enroll-collapsed'];

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
      // FLIP — capture First (zones in their CURRENT display state)
      var oldRects = global.FlipZones.capture(els);
      // Apply new state — including display:none for newly-hidden zones
      _applyPhase(phaseKey, roles);
      // Capture Last (zones in their NEW display state)
      var newRects = global.FlipZones.capture(els);
      // FLIP animates only persisting visible nodes. Hidden nodes have
      // zero rect and are skipped by FlipZones.play().
      global.FlipZones.play(els, oldRects, newRects, {
        duration: DEFAULT_DURATION_MS
      });
    } else {
      _applyPhase(phaseKey, roles);
    }

    _currentPhase = phaseKey;

    // Notify listeners (mobile-tabs auto-pivot, AuthGate self-suppress,
    // social-proof self-suppress, plan-cards self-suppress).
    try {
      var visibleZones = ['chat', 'dash', 'drawer'].filter(function (z) {
        return roles.hidden.indexOf(z) === -1;
      });
      global.document.dispatchEvent(new CustomEvent('layoutPhaseChange', {
        detail: {
          phase: phaseKey,
          roles: roles,
          visibleZones: visibleZones,
          hiddenZones: roles.hidden.slice()
        }
      }));
    } catch (e) {}
  }

  function getCurrentPhase() {
    return _currentPhase;
  }

  // ─── INTERNAL ───────────────────────────────────────────────
  function _applyPhase(phaseKey, roles) {
    _shell.setAttribute('data-layout-phase', phaseKey);

    // 1) Role classes on each zone
    ['chat', 'dash', 'drawer'].forEach(function (zoneKey) {
      var el = global.document.getElementById('zone-' + zoneKey);
      if (!el) return;
      ROLE_CLASSES.forEach(function (cls) { el.classList.remove(cls); });
      el.classList.add('nx-zone--' + roles[zoneKey]);
    });

    // 2) V28 zone-collapse: hide zones flagged in roles.hidden,
    //    restore previously-hidden zones not flagged.
    _applyDisplayState(roles.hidden);
  }

  function _applyDisplayState(hiddenZones) {
    ['chat', 'dash', 'drawer'].forEach(function (zoneKey) {
      var el = global.document.getElementById('zone-' + zoneKey);
      if (!el) return;
      if (hiddenZones.indexOf(zoneKey) !== -1) {
        // Hide via inline style + data attr for CSS hooks.
        el.style.display = 'none';
        el.setAttribute('data-zone-hidden', 'true');
        el.setAttribute('aria-hidden', 'true');
      } else {
        // Restore default — clear inline style so stylesheet wins.
        el.style.display = '';
        el.removeAttribute('data-zone-hidden');
        el.removeAttribute('aria-hidden');
      }
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
