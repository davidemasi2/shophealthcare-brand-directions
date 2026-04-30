/* =============================================================
   VALUE-STACK — V21 Component A
   Universal 3-tier accumulating value reveal.
   Plain JS IIFE. No dependencies. Exposes window.ValueStack.

   Spec: front-end design/quiz-app-capture-flow.md §9.A
   ============================================================= */
(function () {
  'use strict';

  /* -----------------------------------------------------------
     ANIMATION TIMING CONSTANTS (tune here)
     ----------------------------------------------------------- */
  var T = {
    PRIMARY_DURATION: 800,    // odometer roll + arc fill (ms)
    PRIMARY_EASING:   'cubic-bezier(.22,.61,.36,1)',
    GAP_AFTER_PRIMARY: 400,   // pause before tier 2
    GAP_AFTER_SECONDARY: 400, // pause before tier 3
    SPARK_COUNT: 5,
    SPARK_DISTANCE: 60,       // px outward from center
    VISIBILITY_THRESHOLD: 0.5 // IntersectionObserver ratio
  };

  /* -----------------------------------------------------------
     ARC GEOMETRY — 270° open at the bottom
     ----------------------------------------------------------- */
  var ARC = {
    SIZE: 200,        // viewBox unit
    RADIUS: 88,
    START_ANGLE: 135, // deg, top-left going clockwise
    SWEEP: 270        // deg
  };

  function polarToCart(cx, cy, r, deg) {
    var rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function buildArcPath() {
    var cx = ARC.SIZE / 2, cy = ARC.SIZE / 2, r = ARC.RADIUS;
    var start = polarToCart(cx, cy, r, ARC.START_ANGLE);
    var end   = polarToCart(cx, cy, r, ARC.START_ANGLE + ARC.SWEEP);
    var largeArc = ARC.SWEEP > 180 ? 1 : 0;
    return [
      'M', start.x.toFixed(2), start.y.toFixed(2),
      'A', r, r, 0, largeArc, 1, end.x.toFixed(2), end.y.toFixed(2)
    ].join(' ');
  }

  /* -----------------------------------------------------------
     VALUE FORMATTING
     ----------------------------------------------------------- */
  function formatNumber(n, opts) {
    opts = opts || {};
    if (typeof n !== 'number' || !isFinite(n)) return '0';
    var abs = Math.abs(n);
    // Plain dollar formatting with commas, no decimals unless locked
    var rounded = opts.locked && opts.allowDecimals ? n.toFixed(2) : Math.round(n);
    return String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function buildPrimaryHTML(value, opts) {
    var prefix = opts.isEstimate && !opts.locked ? '<span class="vs-approx">~</span>' : '';
    var dollar = '<span class="vs-prefix">$</span>';
    var number = '<span class="vs-num" data-vs-roll>' + formatNumber(value, opts) + '</span>';
    var suffix = opts.suffix
      ? '<span class="vs-suffix">' + escapeHtml(opts.suffix) + '</span>'
      : '';
    return prefix + dollar + number + suffix;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  /* -----------------------------------------------------------
     ODOMETER ROLL — animates a single number element from 0 → final
     ----------------------------------------------------------- */
  function rollNumber(el, finalValue, durationMs, opts) {
    if (!el) return;
    opts = opts || {};
    var start = performance.now();
    var startValue = 0;
    var ease = function (t) {
      // cubic-bezier(.22,.61,.36,1) approximation: ease-out cubic
      return 1 - Math.pow(1 - t, 3);
    };
    function tick(now) {
      var t = Math.min(1, (now - start) / durationMs);
      var v = startValue + (finalValue - startValue) * ease(t);
      el.textContent = formatNumber(v, opts);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = formatNumber(finalValue, opts);
    }
    requestAnimationFrame(tick);
  }

  /* -----------------------------------------------------------
     SPARK BURST — fire 3-5 lemon dots outward
     ----------------------------------------------------------- */
  function fireSparks(rootEl) {
    var layer = rootEl.querySelector('.value-stack__sparks');
    if (!layer) return;
    layer.innerHTML = '';
    for (var i = 0; i < T.SPARK_COUNT; i++) {
      var spark = document.createElement('span');
      spark.className = 'value-stack__spark';
      // Even-ish angular spread with slight jitter
      var baseAngle = (360 / T.SPARK_COUNT) * i;
      var jitter = (Math.random() - 0.5) * 30;
      var angle = baseAngle + jitter;
      var distance = T.SPARK_DISTANCE * (0.85 + Math.random() * 0.3);
      var rad = angle * Math.PI / 180;
      var x = Math.cos(rad) * distance;
      var y = Math.sin(rad) * distance;
      spark.style.setProperty('--vs-spark-x', x.toFixed(1) + 'px');
      spark.style.setProperty('--vs-spark-y', y.toFixed(1) + 'px');
      // Slight per-spark delay
      spark.style.animationDelay = (i * 30) + 'ms';
      layer.appendChild(spark);
    }
    // Force reflow so the animation kicks in even on second mount
    void rootEl.offsetWidth;
    rootEl.classList.add('is-sparking');
  }

  /* -----------------------------------------------------------
     PRIMARY ARC — fill 0→100% via stroke-dashoffset
     ----------------------------------------------------------- */
  function animateArc(arcFill, durationMs, ratio) {
    if (!arcFill) return;
    // Length is a 270° arc on r=88 → 88 * (270/360) * 2π
    var length = 2 * Math.PI * ARC.RADIUS * (ARC.SWEEP / 360);
    arcFill.setAttribute('stroke-dasharray', length.toFixed(2));
    arcFill.style.transition = 'none';
    arcFill.setAttribute('stroke-dashoffset', length.toFixed(2));
    // Force layout
    void arcFill.getBoundingClientRect();
    arcFill.style.transition = 'stroke-dashoffset ' + durationMs + 'ms ' + T.PRIMARY_EASING;
    var fillRatio = Math.max(0, Math.min(1, ratio == null ? 1 : ratio));
    arcFill.setAttribute('stroke-dashoffset', (length * (1 - fillRatio)).toFixed(2));
  }

  function setArcImmediate(arcFill, ratio) {
    if (!arcFill) return;
    var length = 2 * Math.PI * ARC.RADIUS * (ARC.SWEEP / 360);
    var fillRatio = Math.max(0, Math.min(1, ratio == null ? 1 : ratio));
    arcFill.setAttribute('stroke-dasharray', length.toFixed(2));
    arcFill.style.transition = 'none';
    arcFill.setAttribute('stroke-dashoffset', (length * (1 - fillRatio)).toFixed(2));
  }

  /* -----------------------------------------------------------
     RENDER — build the DOM scaffold
     ----------------------------------------------------------- */
  function render(target, options) {
    var persona = options.persona || 'GEN';
    var primary = options.primary || {};
    var secondary = options.secondary || null;
    var tertiary = options.tertiary || null;
    var direction = (tertiary && tertiary.direction) || 'down';

    target.classList.add('value-stack');
    target.classList.add('value-stack--' + direction);
    target.classList.add('value-stack--' + persona);
    if (options.locked) target.classList.add('value-stack--locked');

    var arcPath = buildArcPath();
    var primaryHTML = buildPrimaryHTML(primary.value || 0, {
      suffix: primary.suffix,
      isEstimate: options.isEstimate !== false,
      locked: !!options.locked
    });

    var secondaryHTML = '';
    if (secondary) {
      var secLabel = secondary.label
        ? '<span class="value-stack__secondary-label">' + escapeHtml(secondary.label) + '</span>'
        : '';
      var secVal = '$' + formatNumber(secondary.value, { locked: !!options.locked }) +
        (secondary.suffix ? escapeHtml(secondary.suffix) : '');
      secondaryHTML =
        '<div class="value-stack__secondary">' +
          secLabel +
          '<span class="value-stack__secondary-value">' + secVal + '</span>' +
        '</div>';
    }

    var tertiaryHTML = '';
    if (tertiary) {
      var arrow = direction === 'down' ? '↓' : '↑';
      var tertVal =
        '<span class="value-stack__tertiary-arrow">' + arrow + '</span>' +
        '$' + formatNumber(tertiary.value, { locked: !!options.locked }) +
        (tertiary.suffix ? escapeHtml(tertiary.suffix) : '');
      var tertLabel = tertiary.label
        ? '<span class="value-stack__tertiary-anchor">' + escapeHtml(tertiary.label) + '</span>'
        : '';
      tertiaryHTML =
        '<div class="value-stack__tertiary">' +
          '<span class="value-stack__tertiary-value">' + tertVal + '</span>' +
          tertLabel +
        '</div>';
    }

    var estimateNoteHTML = '';
    if (options.isEstimate !== false && !options.locked) {
      estimateNoteHTML =
        '<div class="value-stack__estimate-note">' +
          'Estimate' +
          '<span class="vs-dot"></span>' +
          'refines in 60s' +
        '</div>';
    }

    target.innerHTML =
      '<div class="value-stack__primary">' +
        '<svg class="value-stack__arc" viewBox="0 0 ' + ARC.SIZE + ' ' + ARC.SIZE + '" aria-hidden="true">' +
          '<path class="value-stack__arc-ground" d="' + arcPath + '" />' +
          '<path class="value-stack__arc-fill" d="' + arcPath + '" />' +
        '</svg>' +
        '<div class="value-stack__sparks" aria-hidden="true"></div>' +
        '<div class="value-stack__primary-inner">' +
          '<div class="value-stack__primary-number">' + primaryHTML + '</div>' +
        '</div>' +
      '</div>' +
      estimateNoteHTML +
      secondaryHTML +
      tertiaryHTML;
  }

  /* -----------------------------------------------------------
     PLAY — orchestrate the 3-tier sequence
     ----------------------------------------------------------- */
  function play(target, options) {
    if (target.dataset.vsPlayed === '1') return;
    target.dataset.vsPlayed = '1';

    var arcFill = target.querySelector('.value-stack__arc-fill');
    var rollEl = target.querySelector('[data-vs-roll]');
    var primary = options.primary || {};
    var compareValue = options.compareValue;

    // Arc fill ratio: if compareValue given, fill = primary/compare (clamped).
    // Otherwise, fill 100%.
    var ratio = 1;
    if (typeof compareValue === 'number' && compareValue > 0) {
      ratio = Math.max(0.08, Math.min(1, primary.value / compareValue));
    }

    // Tier 1 — start arc + odometer simultaneously
    setArcImmediate(arcFill, 0);
    requestAnimationFrame(function () {
      animateArc(arcFill, T.PRIMARY_DURATION, ratio);
      rollNumber(rollEl, primary.value || 0, T.PRIMARY_DURATION, {
        isEstimate: options.isEstimate !== false,
        locked: !!options.locked
      });
    });

    // Tier 1 completion: spark burst
    setTimeout(function () {
      fireSparks(target);
    }, T.PRIMARY_DURATION);

    // Tier 2 reveal
    setTimeout(function () {
      target.classList.add('is-revealed');
    }, T.PRIMARY_DURATION + T.GAP_AFTER_PRIMARY);

    // Tier 3 reveal
    setTimeout(function () {
      target.classList.add('is-revealed-2');
    }, T.PRIMARY_DURATION + T.GAP_AFTER_PRIMARY + 400 + T.GAP_AFTER_SECONDARY);
  }

  /* -----------------------------------------------------------
     STATIC RENDER — locked / reduced-motion final state
     ----------------------------------------------------------- */
  function renderFinal(target, options) {
    var arcFill = target.querySelector('.value-stack__arc-fill');
    var rollEl = target.querySelector('[data-vs-roll]');
    var primary = options.primary || {};
    var compareValue = options.compareValue;
    var ratio = 1;
    if (typeof compareValue === 'number' && compareValue > 0) {
      ratio = Math.max(0.08, Math.min(1, primary.value / compareValue));
    }
    setArcImmediate(arcFill, ratio);
    if (rollEl) rollEl.textContent = formatNumber(primary.value || 0, { locked: !!options.locked });
    target.classList.add('is-revealed');
    target.classList.add('is-revealed-2');
    target.dataset.vsPlayed = '1';
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  }

  /* -----------------------------------------------------------
     CLEANUP — remove observer + listener bookkeeping
     ----------------------------------------------------------- */
  function teardown(target) {
    if (target._vsObserver) {
      try { target._vsObserver.disconnect(); } catch (e) {}
      target._vsObserver = null;
    }
    target.classList.remove(
      'value-stack--down', 'value-stack--up', 'value-stack--locked',
      'is-revealed', 'is-revealed-2', 'is-sparking',
      'value-stack--SP1', 'value-stack--CL1', 'value-stack--BR1',
      'value-stack--RU1', 'value-stack--PC1', 'value-stack--GEN'
    );
    delete target.dataset.vsPlayed;
    target.innerHTML = '';
  }

  /* -----------------------------------------------------------
     PUBLIC API — mount(target, options)
     ----------------------------------------------------------- */
  function mount(target, options) {
    if (!target || !target.nodeType) {
      console.warn('[ValueStack] mount target not found or not a DOM node.');
      return null;
    }
    options = options || {};
    if (!options.primary || typeof options.primary.value !== 'number') {
      console.warn('[ValueStack] options.primary.value is required (number).');
      return null;
    }

    // Idempotent — clean previous mount
    teardown(target);

    render(target, options);

    var reduced = prefersReducedMotion();
    var locked = !!options.locked;

    if (locked || reduced) {
      renderFinal(target, options);
      return apiFor(target, options);
    }

    // Set pre-animation visual state for both autoplay-pending and manual modes:
    // arc empty + number at 0 — the odometer will roll up from there.
    setArcImmediate(target.querySelector('.value-stack__arc-fill'), 0);
    var preRollEl = target.querySelector('[data-vs-roll]');
    if (preRollEl) preRollEl.textContent = '0';

    if (options.autoplayOnVisible) {
      if (typeof IntersectionObserver === 'undefined') {
        play(target, options);
      } else {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.intersectionRatio >= T.VISIBILITY_THRESHOLD) {
              play(target, options);
              obs.disconnect();
              target._vsObserver = null;
            }
          });
        }, { threshold: [T.VISIBILITY_THRESHOLD] });
        target._vsObserver = obs;
        obs.observe(target);
      }
    }

    return apiFor(target, options);
  }

  function apiFor(target, options) {
    return {
      el: target,
      play: function () { play(target, options); },
      // lock(newValue, opts?) — locks the primary value, and optionally
      // recomputes Tier 2 (annual) + Tier 3 (savings) so the stack stays consistent.
      // opts: { secondary: { value, suffix?, label? },
      //         tertiary:  { value, suffix?, label?, direction? } }
      // If only a secondary/tertiary value (number) is provided, structure is preserved.
      lock: function (newValue, lockOpts) {
        if (typeof newValue === 'number') options.primary.value = newValue;
        if (lockOpts) {
          if (lockOpts.secondary != null) {
            if (!options.secondary) options.secondary = {};
            if (typeof lockOpts.secondary === 'number') {
              options.secondary.value = lockOpts.secondary;
            } else {
              if (typeof lockOpts.secondary.value === 'number') options.secondary.value = lockOpts.secondary.value;
              if (lockOpts.secondary.suffix != null) options.secondary.suffix = lockOpts.secondary.suffix;
              if (lockOpts.secondary.label != null)  options.secondary.label  = lockOpts.secondary.label;
            }
          }
          if (lockOpts.tertiary != null) {
            if (!options.tertiary) options.tertiary = { direction: 'down' };
            if (typeof lockOpts.tertiary === 'number') {
              options.tertiary.value = lockOpts.tertiary;
            } else {
              if (typeof lockOpts.tertiary.value === 'number') options.tertiary.value = lockOpts.tertiary.value;
              if (lockOpts.tertiary.suffix != null)    options.tertiary.suffix    = lockOpts.tertiary.suffix;
              if (lockOpts.tertiary.label != null)     options.tertiary.label     = lockOpts.tertiary.label;
              if (lockOpts.tertiary.direction != null) options.tertiary.direction = lockOpts.tertiary.direction;
            }
          }
          if (typeof lockOpts.compareValue === 'number') options.compareValue = lockOpts.compareValue;
        }
        options.locked = true;
        teardown(target);
        options.locked = true;
        render(target, options);
        renderFinal(target, options);
      },
      destroy: function () { teardown(target); }
    };
  }

  /* -----------------------------------------------------------
     EXPOSE
     ----------------------------------------------------------- */
  window.ValueStack = {
    mount: mount,
    _internals: { T: T, ARC: ARC, formatNumber: formatNumber }
  };
})();
