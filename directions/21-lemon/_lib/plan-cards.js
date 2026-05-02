/* =============================================================
   PLAN-CARDS — V21 Component D · Mode 1
   3 plan cards in the dashboard zone.
   Plain JS IIFE. Exposes window.PlanCards.
   Peer dep: window.ValueStack (Component A) — falls back to text
   rendering if not loaded.

   Spec: nora-app-design-brief.md §5 + quiz-app-capture-flow.md §7
   ============================================================= */
(function () {
  'use strict';

  /* -----------------------------------------------------------
     Carrier name → SVG asset key map
     ----------------------------------------------------------- */
  var CARRIER_LOGO_MAP = {
    'unitedhealthcare': 'uhc',
    'unitedhealth': 'uhc',
    'uhc': 'uhc',
    'blue cross': 'bcbs',
    'bluecross': 'bcbs',
    'bcbs': 'bcbs',
    'regence': 'bcbs',          // Regence is a BCBS licensee
    'cigna': 'cigna',
    'aetna': 'aetna',
    'humana': 'humana'
  };

  function carrierLogoKey(carrierName) {
    if (!carrierName) return null;
    var lower = String(carrierName).toLowerCase();
    var keys = Object.keys(CARRIER_LOGO_MAP);
    for (var i = 0; i < keys.length; i++) {
      if (lower.indexOf(keys[i]) !== -1) return CARRIER_LOGO_MAP[keys[i]];
    }
    return null;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function formatMoney(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* -----------------------------------------------------------
     RENDER — per-card markup (V25 — 5 elements)
       1. Tier eyebrow badge (semantic anchor)
       2. Carrier logo + short text
       3. Tier headline + price block (+ optional savings delta vs OCR)
       4. WHY THIS ONE rationale (universal, persona-aware, falls back to description)
       5. Lock CTA pill
     Cut from card surface (lives in Receipt / Compare modal):
       · 3-bullet highlights list
       · Full plan name (3-line clamp)
       · Description paragraph (now repurposed as fallback rationale)
       · Network type tag
     ----------------------------------------------------------- */
  function renderCard(plan, isSelected) {
    // 1 — Tier eyebrow (universal, no separate "rec-badge" path)
    var tierEyebrowText = ({
      budget:      'SAVES MOST',
      recommended: 'RECOMMENDED ⭐',
      premium:     'FULL COVERAGE'
    })[plan.tier] || 'PLAN';
    var tierEyebrowHTML =
      '<span class="plan-card__tier-eyebrow plan-card__tier-eyebrow--' +
        (plan.tier || 'budget') + '">' +
        escapeHtml(tierEyebrowText).replace('⭐', '<span aria-hidden="true">⭐</span>') +
      '</span>';

    // 3a — Tier headline (Fraunces, the "what kind of plan" anchor)
    var shortTierName = ({
      budget:      'Lower premium',
      recommended: 'Best fit',
      premium:     'Richer coverage'
    })[plan.tier] || (plan.tier_label || 'Plan');

    // 2 — Carrier logo + short text
    var logoKey = carrierLogoKey(plan.carrier);
    var carrierTextShort = (function () {
      var c = plan.carrier || '';
      if (/regence/i.test(c)) return 'Regence BCBS';
      if (/university of utah/i.test(c)) return 'U of U Health';
      if (/blue cross/i.test(c) || /bluecross/i.test(c)) return 'BCBS';
      if (/unitedhealth/i.test(c)) return 'UnitedHealthcare';
      if (c.length > 22) return c.slice(0, 20) + '…';
      return c;
    })();
    var logoHTML;
    if (logoKey) {
      logoHTML = '<span class="plan-card__carrier-logo">' +
        '<img src="../assets/carriers/' + logoKey + '.svg" alt="" ' +
        'onerror="this.style.display=\'none\'" />' +
      '</span>';
    } else {
      logoHTML = '<span class="plan-card__carrier-logo" aria-hidden="true"></span>';
    }
    var carrierBlock =
      '<div class="plan-card__carrier">' +
        logoHTML +
        '<span class="plan-card__carrier-text">' + escapeHtml(carrierTextShort) + '</span>' +
      '</div>';

    // 3b — Price block (ValueStack host — fallback rendered immediately)
    var priceFallback =
      '<div class="plan-card__price-fallback">' +
        '<span class="pcp-prefix">$</span>' +
        '<span>' + formatMoney(plan.monthly_premium) + '</span>' +
        '<span class="pcp-suffix">/mo</span>' +
      '</div>';
    var priceBlock =
      '<div class="plan-card__price">' +
        '<div class="plan-card__price-host" data-pc-price>' +
          priceFallback +
        '</div>' +
      '</div>';

    // 3c — V25 OCR savings delta (only if window.NORA_OCR_BASELINE present)
    var savingsHTML = '';
    var ocr = window.NORA_OCR_BASELINE;
    if (ocr && typeof ocr.monthly_premium === 'number') {
      var annualDelta = (ocr.monthly_premium - plan.monthly_premium) * 12;
      if (annualDelta > 0) {
        savingsHTML =
          '<div class="plan-card__savings">' +
            '<span class="pcs-mark" aria-hidden="true">↓</span>' +
            'saves $' + formatMoney(annualDelta) + '/yr ' +
            '<span class="pcs-anchor">vs your card</span>' +
          '</div>';
      }
    }

    // 4 — Universal rationale (persona-aware → rationale → description fallback)
    var personaKey = (window.NORA_ACTIVE_PERSONA || '').toUpperCase();
    var personaRationale = (plan.rationale_by_persona && personaKey)
      ? plan.rationale_by_persona[personaKey]
      : null;
    // description IS already a one-line "why" for budget/premium tiers — repurpose
    var rationaleText = personaRationale || plan.rationale || plan.description || null;
    var rationaleHTML = '';
    if (rationaleText) {
      rationaleHTML =
        '<div class="plan-card__rationale">' +
          '<span class="pc-rationale-eyebrow">WHY THIS ONE</span>' +
          '<p class="pc-rationale-text">' + rationaleText + '</p>' +
        '</div>';
    }

    // 5 — CTA (V25 — commitment language)
    var ctaLabel = isSelected ? '✓ Locked' : 'Lock this plan →';

    var classes = ['plan-card', 'plan-card--' + (plan.tier || 'budget')];
    if (isSelected) classes.push('is-selected');

    // Headline + price grouped as the primary visual block
    var headlineBlock =
      '<h4 class="plan-card__short">' + escapeHtml(shortTierName) + '</h4>';

    return (
      '<button type="button" class="' + classes.join(' ') + '" ' +
        'data-plan-id="' + escapeHtml(plan.plan_id) + '" ' +
        'aria-pressed="' + (isSelected ? 'true' : 'false') + '">' +
        tierEyebrowHTML +
        carrierBlock +
        headlineBlock +
        priceBlock +
        savingsHTML +
        rationaleHTML +
        '<div class="plan-card__cta">' +
          '<span class="plan-card__cta-btn">' + escapeHtml(ctaLabel) + '</span>' +
        '</div>' +
      '</button>'
    );
  }

  /* -----------------------------------------------------------
     Mount ValueStack into each card's price host (peer dep).
     If ValueStack isn't loaded, leave the fallback text in place.
     ----------------------------------------------------------- */
  function mountValueStacks(rootEl, planSet) {
    if (!window.ValueStack || typeof window.ValueStack.mount !== 'function') {
      console.log('[PlanCards] ValueStack not loaded — using text fallback for prices.');
      return;
    }
    var hosts = rootEl.querySelectorAll('[data-pc-price]');
    var plans = planSet.plans || [];
    Array.prototype.forEach.call(hosts, function (host, i) {
      var plan = plans[i];
      if (!plan) return;
      // Replace fallback with empty container and mount Component A.
      // Premium is locked (no animation) — already revealed by this point.
      host.innerHTML = '';
      try {
        window.ValueStack.mount(host, {
          primary: { value: plan.monthly_premium, suffix: '/mo' },
          locked: true,
          isEstimate: false
        });
      } catch (e) {
        console.warn('[PlanCards] ValueStack mount failed for plan', plan.plan_id, e);
        // Re-render fallback
        host.innerHTML =
          '<div class="plan-card__price-fallback">' +
            '<span class="pcp-prefix">$</span>' +
            '<span>' + formatMoney(plan.monthly_premium) + '</span>' +
            '<span class="pcp-suffix">/mo</span>' +
          '</div>';
      }
    });
  }

  /* -----------------------------------------------------------
     Pagination row
     ----------------------------------------------------------- */
  function renderHead(planSet) {
    var current = planSet.set_number || 1;
    var total = planSet.total_sets || 1;
    var dotsHTML = '';
    for (var i = 1; i <= total; i++) {
      dotsHTML += '<span class="plan-cards__pager-dot' +
        (i === current ? ' is-active' : '') + '"></span>';
    }
    var prevDisabled = current <= 1 ? 'disabled' : '';
    var nextDisabled = current >= total ? 'disabled' : '';
    var pagerHTML = total > 1
      ? ('<div class="plan-cards__pager" data-pc-pager>' +
           '<button type="button" class="plan-cards__pager-btn" data-pc-prev ' +
             prevDisabled + ' aria-label="Previous set">‹</button>' +
           '<div class="plan-cards__pager-dots">' + dotsHTML + '</div>' +
           '<button type="button" class="plan-cards__pager-btn" data-pc-next ' +
             nextDisabled + ' aria-label="Next set">›</button>' +
         '</div>')
      : '';
    return (
      '<div class="plan-cards__head">' +
        '<span class="plan-cards__set-label">Set ' + current + ' of ' + total + '</span>' +
        pagerHTML +
      '</div>'
    );
  }

  /* -----------------------------------------------------------
     PUBLIC API — mount(target, options)
     ----------------------------------------------------------- */
  function mount(target, options) {
    if (!target || !target.nodeType) {
      console.warn('[PlanCards] mount target not found.');
      return null;
    }
    options = options || {};
    var planSet = options.planSet;
    if (!planSet || !Array.isArray(planSet.plans)) {
      console.warn('[PlanCards] options.planSet.plans is required.');
      return null;
    }

    var selectedPlanId = options.selectedPlanId || null;

    function render() {
      var headHTML = renderHead(planSet);
      var cardsHTML = planSet.plans.map(function (p) {
        return renderCard(p, p.plan_id === selectedPlanId);
      }).join('');
      var compareHTML = planSet.plans.length > 1
        ? '<div class="plan-cards__foot">' +
            '<button type="button" class="plan-cards__compare" data-pc-compare>' +
              'Compare full details ↓' +
            '</button>' +
          '</div>'
        : '';
      target.classList.add('plan-cards');
      target.setAttribute('role', 'region');
      target.setAttribute('aria-label', 'Plan options');
      target.innerHTML =
        headHTML +
        '<div class="plan-cards__grid" data-pc-grid role="group" aria-label="Available plans (use arrow keys to navigate)">' + cardsHTML + '</div>' +
        compareHTML;
      mountValueStacks(target, planSet);
      bind();
      // V24 Tier 5 — choreographed cascade entrance (60ms stagger via CSS)
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          target.classList.add('is-revealed');
        });
      });
    }

    function bind() {
      // Card select
      var cards = target.querySelectorAll('.plan-card');
      Array.prototype.forEach.call(cards, function (card, idx) {
        card.addEventListener('click', function () {
          var id = card.getAttribute('data-plan-id');
          selectedPlanId = id;
          // Update UI immediately
          Array.prototype.forEach.call(cards, function (c) {
            var isSel = c.getAttribute('data-plan-id') === id;
            c.classList.toggle('is-selected', isSel);
            c.setAttribute('aria-pressed', isSel ? 'true' : 'false');
            var ctaBtn = c.querySelector('.plan-card__cta-btn');
            if (ctaBtn) {
              ctaBtn.textContent = isSel
                ? '✓ Locked'
                : 'Lock this plan →';
            }
          });
          if (typeof options.onSelect === 'function') {
            options.onSelect(id);
          }
        });

        // V24 Tier 7 · A11y · Arrow-key navigation between plan cards.
        // ArrowRight / ArrowDown → next card. ArrowLeft / ArrowUp → prev.
        // Home → first, End → last. Wraps for circular feel.
        card.addEventListener('keydown', function (e) {
          var key = e.key;
          if (key !== 'ArrowRight' && key !== 'ArrowLeft' &&
              key !== 'ArrowDown' && key !== 'ArrowUp' &&
              key !== 'Home' && key !== 'End') return;
          e.preventDefault();
          var len = cards.length;
          var nextIdx = idx;
          if (key === 'ArrowRight' || key === 'ArrowDown') {
            nextIdx = (idx + 1) % len;
          } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
            nextIdx = (idx - 1 + len) % len;
          } else if (key === 'Home') {
            nextIdx = 0;
          } else if (key === 'End') {
            nextIdx = len - 1;
          }
          var nextCard = cards[nextIdx];
          if (nextCard && typeof nextCard.focus === 'function') {
            nextCard.focus();
          }
        });
      });

      // Pagination
      var prevBtn = target.querySelector('[data-pc-prev]');
      var nextBtn = target.querySelector('[data-pc-next]');
      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          if (typeof options.onSetChange === 'function' && planSet.set_number > 1) {
            options.onSetChange(planSet.set_number - 1);
          }
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          if (typeof options.onSetChange === 'function' && planSet.set_number < planSet.total_sets) {
            options.onSetChange(planSet.set_number + 1);
          }
        });
      }

      // Compare link
      var compareBtn = target.querySelector('[data-pc-compare]');
      if (compareBtn) {
        compareBtn.addEventListener('click', function () {
          if (typeof options.onCompareClick === 'function') {
            options.onCompareClick();
          }
        });
      }
    }

    render();

    return {
      el: target,
      setSelected: function (id) {
        selectedPlanId = id;
        var cards = target.querySelectorAll('.plan-card');
        Array.prototype.forEach.call(cards, function (c) {
          var isSel = c.getAttribute('data-plan-id') === id;
          c.classList.toggle('is-selected', isSel);
          c.setAttribute('aria-pressed', isSel ? 'true' : 'false');
          var ctaBtn = c.querySelector('.plan-card__cta-btn');
          if (ctaBtn) {
            ctaBtn.textContent = isSel
              ? '✓ Selected'
              : 'Select this plan';
          }
        });
      },
      updatePlanSet: function (newPlanSet) {
        planSet = newPlanSet;
        render();
      },
      destroy: function () { target.innerHTML = ''; }
    };
  }

  window.PlanCards = { mount: mount };
})();
