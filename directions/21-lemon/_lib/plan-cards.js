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
     RENDER — per-card markup
     ----------------------------------------------------------- */
  function renderCard(plan, isSelected) {
    var tierLabel = plan.tier_label || ({
      budget: 'Budget',
      recommended: 'Recommended',
      premium: 'Premium'
    })[plan.tier] || 'Plan';
    var tierBadgeHTML;
    if (plan.tier === 'recommended') {
      // V23 H6 — RECOMMENDED ⭐ pill badge sits at the top of the card
      tierBadgeHTML = '<span class="plan-card__rec-badge">' +
                        '<span aria-hidden="true">⭐</span>' +
                        '<span>RECOMMENDED</span>' +
                      '</span>';
    } else {
      tierBadgeHTML = '<span class="plan-card__tier">' + escapeHtml(tierLabel) + '</span>';
    }
    // V24 — neutral category labels (Bronze/Silver/Gold are ACA metallic tiers
    // and brand-voice §C4 forbids implying ACA). Plan NAME below still shows
    // the carrier's actual product name verbatim.
    var shortTierName = ({
      budget: 'Lower premium',
      recommended: 'Best fit',
      premium: 'Richer coverage'
    })[plan.tier] || tierLabel;

    // Carrier logo: SVG asset OR text fallback
    var logoKey = carrierLogoKey(plan.carrier);
    var carrierTextShort = (function () {
      // Trim long carrier names: "Regence BlueCross BlueShield of Utah" → "Regence BCBS"
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
    var topline =
      '<div class="plan-card__topline">' +
        '<div class="plan-card__carrier">' +
          logoHTML +
          '<span class="plan-card__carrier-text">' + escapeHtml(carrierTextShort) + '</span>' +
        '</div>' +
        '<span class="plan-card__network">' + escapeHtml(plan.network_type || '') + '</span>' +
      '</div>';

    // Price block — host element for ValueStack (compact mode).
    // We render a fallback text immediately; mountValueStack() will
    // try to overlay Component A on top after insertion into the DOM.
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

    // Highlights
    var highlightsHTML = '<ul class="plan-card__highlights">';
    var highlights = (plan.highlights || []).slice(0, 3);
    highlights.forEach(function (h) {
      highlightsHTML +=
        '<li>' +
          '<strong>' + escapeHtml(h.label) + ':</strong>' +
          '<span>' + escapeHtml(h.value) + '</span>' +
        '</li>';
    });
    highlightsHTML += '</ul>';

    var ctaLabel = isSelected
      ? '✓ Selected'
      : 'Select this plan';

    var classes = ['plan-card', 'plan-card--' + (plan.tier || 'budget')];
    if (isSelected) classes.push('is-selected');

    // V24 — name block: neutral tier label headline + full
    // technical name as a 3-line max-clamp subhead. No ACA-metallic framing.
    var nameBlock =
      '<div class="plan-card__nameblock">' +
        '<h4 class="plan-card__short">' + escapeHtml(shortTierName) + '</h4>' +
        '<div class="plan-card__name-full" title="' + escapeHtml(plan.name) + '">' +
          escapeHtml(plan.name) +
        '</div>' +
      '</div>';

    return (
      '<button type="button" class="' + classes.join(' ') + '" ' +
        'data-plan-id="' + escapeHtml(plan.plan_id) + '" ' +
        'aria-pressed="' + (isSelected ? 'true' : 'false') + '">' +
        tierBadgeHTML +
        topline +
        nameBlock +
        priceBlock +
        highlightsHTML +
        '<p class="plan-card__desc">' + escapeHtml(plan.description) + '</p>' +
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
              'Compare side-by-side ↓' +
            '</button>' +
          '</div>'
        : '';
      target.classList.add('plan-cards');
      target.innerHTML =
        headHTML +
        '<div class="plan-cards__grid" data-pc-grid>' + cardsHTML + '</div>' +
        compareHTML;
      mountValueStacks(target, planSet);
      bind();
    }

    function bind() {
      // Card select
      var cards = target.querySelectorAll('.plan-card');
      Array.prototype.forEach.call(cards, function (card) {
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
                ? '✓ Selected'
                : 'Select this plan';
            }
          });
          if (typeof options.onSelect === 'function') {
            options.onSelect(id);
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
