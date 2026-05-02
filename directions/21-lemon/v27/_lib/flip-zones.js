/* =============================================================
   FLIP-ZONES — V26 Component F
   FLIP animation helper: First / Last / Invert / Play.
   Used by LayoutDirector to animate zones smoothly when grid
   areas reshuffle on phase transitions.

   Public API:
     window.FlipZones.capture(els) -> Map<Element, DOMRect>
     window.FlipZones.play(els, oldRects, newRects, { duration, easing })

   Honors prefers-reduced-motion (caller is responsible — this module
   plays animations unconditionally when invoked).
   ============================================================= */
(function (global) {
  'use strict';

  function capture(els) {
    var rects = new Map();
    if (!els) return rects;
    els.forEach(function (el) {
      if (el && el.getBoundingClientRect) {
        rects.set(el, el.getBoundingClientRect());
      }
    });
    return rects;
  }

  function play(els, oldRects, newRects, opts) {
    opts = opts || {};
    var duration = typeof opts.duration === 'number' ? opts.duration : 720;
    var easing = opts.easing || 'cubic-bezier(.22,.61,.36,1)';
    var staggerMs = typeof opts.stagger === 'number' ? opts.stagger : 0;

    if (!els || !oldRects || !newRects) return;

    var i = 0;
    els.forEach(function (el) {
      if (!el) return;
      var oldRect = oldRects.get(el);
      var newRect = newRects.get(el);
      if (!oldRect || !newRect) { i++; return; }

      var dx = oldRect.left - newRect.left;
      var dy = oldRect.top  - newRect.top;
      var sw = newRect.width  > 0 ? oldRect.width  / newRect.width  : 1;
      var sh = newRect.height > 0 ? oldRect.height / newRect.height : 1;

      // Skip the no-op case so we don't fight other transforms
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 &&
          Math.abs(sw - 1) < 0.01 && Math.abs(sh - 1) < 0.01) {
        i++; return;
      }

      // Cap scale to avoid extreme blur on collapsed→expanded
      sw = Math.max(0.01, Math.min(sw, 50));
      sh = Math.max(0.01, Math.min(sh, 50));

      var stagger = i * staggerMs;
      i++;

      // Stamp inverse transform (no transition yet)
      el.style.transformOrigin = 'top left';
      el.style.transition = 'none';
      el.style.transform =
        'translate(' + dx + 'px, ' + dy + 'px) scale(' + sw + ', ' + sh + ')';
      el.style.willChange = 'transform';

      // Force reflow so the inverse paints before the play
      void el.offsetWidth;

      // Schedule the play
      var play = function () {
        el.style.transition = 'transform ' + duration + 'ms ' + easing;
        el.style.transform = '';
      };
      if (stagger > 0) {
        global.setTimeout(play, stagger);
      } else {
        global.requestAnimationFrame(play);
      }

      // Cleanup
      var cleanup = function () {
        el.style.transition = '';
        el.style.transformOrigin = '';
        el.style.transform = '';
        el.style.willChange = '';
      };
      global.setTimeout(cleanup, duration + stagger + 80);
    });
  }

  global.FlipZones = { capture: capture, play: play };
})(typeof window !== 'undefined' ? window : this);
