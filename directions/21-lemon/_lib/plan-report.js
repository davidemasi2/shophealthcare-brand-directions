/* =============================================================
   PLAN-REPORT — V21 Component D · Mode 2
   Detailed plan report inside the right drawer.
   Plain JS IIFE. Exposes window.PlanReport.
   Peer dep: window.ValueStack (Component A) — falls back if absent.

   Spec: nora-app-design-brief.md §8 + endpoints-contract.md §5
   ============================================================= */
(function () {
  'use strict';

  // Map raw benefit keys to human-readable labels for the Fine Print
  var BENEFIT_LABELS = {
    medical_deductible_individual: 'Medical Deductible (Individual)',
    medical_deductible_family:     'Medical Deductible (Family)',
    drug_deductible:               'Drug Benefits Deductible',
    combined_med_drug_deductible:  'Combined Medical & Drug Deductible',
    out_of_pocket_max_individual:  'Out-of-Pocket Max (Individual)',
    out_of_pocket_max_family:      'Out-of-Pocket Max (Family)',
    primary_care:                  'Primary Care Visit',
    other_practitioner:            'Other Practitioner (Nurse / PA)',
    specialist:                    'Specialist Visit',
    urgent_care:                   'Urgent Care',
    emergency_room:                'Emergency Room Services',
    emergency_transportation:      'Emergency Transportation / Ambulance',
    preventive:                    'Preventive Care / Screening / Immunization',
    well_baby:                     'Well Baby Visits and Care',
    generic_drugs:                 'Generic Drugs',
    preferred_brand_drugs:         'Preferred Brand Drugs',
    non_preferred_brand_drugs:     'Non-Preferred Brand Drugs',
    specialty_drugs:               'Specialty Drugs',
    imaging:                       'Imaging (CT/PET Scans, MRIs)',
    xrays:                         'X-rays and Diagnostic Imaging',
    laboratory:                    'Laboratory Outpatient Services',
    chiropractic:                  'Chiropractic Care',
    outpatient_surgery:            'Outpatient Surgery',
    outpatient_rehabilitation:     'Outpatient Rehabilitation Services',
    inpatient_physician:           'Inpatient Physician and Surgical Services',
    inpatient_hospital:            'Inpatient Hospital Services',
    skilled_nursing:               'Skilled Nursing Facility',
    habilitation:                  'Habilitation Services',
    home_health:                   'Home Health Care Services',
    durable_medical:               'Durable Medical Equipment',
    hospice:                       'Hospice Services',
    mental_health_outpatient:      'Mental / Behavioral Health Outpatient',
    mental_health_inpatient:       'Mental / Behavioral Health Inpatient',
    substance_abuse_outpatient:    'Substance Abuse Outpatient Services',
    substance_abuse_inpatient:     'Substance Abuse Inpatient Services',
    prenatal_postnatal:            'Prenatal and Postnatal Care',
    delivery_inpatient_maternity:  'Delivery and Inpatient Maternity Care',
    rehab_speech:                  'Rehabilitative Speech Therapy',
    rehab_occupational_physical:   'Rehabilitative Occupational / Physical Therapy',
    allergy_testing:               'Allergy Testing',
    chemotherapy:                  'Chemotherapy',
    radiation:                     'Radiation',
    dialysis:                      'Dialysis',
    infusion_therapy:              'Infusion Therapy',
    transplant:                    'Transplant',
    reconstructive_surgery:        'Reconstructive Surgery',
    accidental_dental:             'Accidental Dental',
    diabetes_education:            'Diabetes Education',
    routine_eye_exam_children:     'Routine Eye Exam (Children)',
    eye_glasses_children:          'Eye Glasses for Children',
    dental_check_children:         'Dental Check-Up for Children',
    additional_benefits:           'Additional Benefits'
  };

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function formatMoney(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function formatBenefitValue(v) {
    if (v == null || v === '') return '—';
    if (Array.isArray(v)) return v.join('<br>');
    if (typeof v === 'number') return '$' + formatMoney(v);
    return escapeHtml(v);
  }

  function findPlan(planSet, planId) {
    if (!planSet || !planSet.plans) return null;
    for (var i = 0; i < planSet.plans.length; i++) {
      if (planSet.plans[i].plan_id === planId) return planSet.plans[i];
    }
    return null;
  }

  /* -----------------------------------------------------------
     RENDER — sectioned markup
     ----------------------------------------------------------- */

  // SECTION 1 — Heading
  function renderHeading(plan) {
    var carrierShort = (function () {
      var c = plan.carrier || '';
      if (/regence/i.test(c)) return 'Regence BCBS';
      if (/university of utah/i.test(c)) return 'U of U Health';
      return c;
    })();
    return (
      '<div class="plan-report__section" data-pr-section="heading">' +
        '<div class="plan-report__heading-eyebrow">Chosen plan</div>' +
        '<h3 class="plan-report__title">' + escapeHtml(plan.name) + '</h3>' +
        '<p class="plan-report__subtitle">' +
          escapeHtml(carrierShort) +
          '<span class="pr-dot">·</span>' +
          escapeHtml(plan.network_type) +
          '<span class="pr-dot">·</span>' +
          escapeHtml(plan.plan_id) +
        '</p>' +
      '</div>'
    );
  }

  // SECTION 2 — Premium block (ValueStack host)
  function renderPremium(plan) {
    var monthly = plan.monthly_premium || 0;
    var annual = monthly * 12;
    var hasComp = plan.compared_to_user && typeof plan.compared_to_user.savings_annual === 'number';
    var fallbackTertiary = '';
    if (hasComp) {
      fallbackTertiary =
        '<div class="prf-tertiary">↓ $' + formatMoney(plan.compared_to_user.savings_annual) + '/yr</div>' +
        '<span class="prf-tertiary-anchor">vs your current plan</span>';
    } else {
      fallbackTertiary =
        '<span class="prf-tertiary-anchor">vs typical PPO in your state</span>';
    }
    var fallback =
      '<div class="plan-report__premium-fallback">' +
        '<div class="prf-primary">' +
          '<span class="prf-prefix">$</span>' +
          '<span>' + formatMoney(monthly) + '</span>' +
          '<span class="prf-suffix">/mo</span>' +
        '</div>' +
        '<div class="prf-secondary">' +
          '<span class="prf-secondary-label">Annual:</span>' +
          '$' + formatMoney(annual) +
        '</div>' +
        fallbackTertiary +
      '</div>';
    return (
      '<div class="plan-report__section plan-report__premium" data-pr-section="premium">' +
        '<div class="plan-report__premium-host" data-pr-vs-host>' + fallback + '</div>' +
      '</div>'
    );
  }

  // SECTION 3 — Things you'll actually use
  function renderUseList(plan) {
    var items = (plan.things_youll_use || []).map(function (line) {
      // Each line typically formatted "Label: value"
      return '<li class="plan-report__list-row">' +
        '<span class="pr-mark">✓</span>' +
        '<span class="pr-text">' + escapeHtml(line) + '</span>' +
      '</li>';
    }).join('');
    return (
      '<div class="plan-report__section" data-pr-section="use">' +
        '<div class="plan-report__eyebrow">⌬ Things you\'ll actually use</div>' +
        '<ul class="plan-report__list plan-report__list--use">' + items + '</ul>' +
      '</div>'
    );
  }

  // SECTION 4 — Things to know (V24 · collapse-by-default per Apple Card pattern)
  function renderKnowList(plan) {
    var lines = (plan.things_to_know || []);
    var items = lines.map(function (line) {
      return '<li class="plan-report__list-row">' +
        '<span class="pr-mark">•</span>' +
        '<span class="pr-text">' + escapeHtml(line) + '</span>' +
      '</li>';
    }).join('');
    if (!items) return '';
    var count = lines.length;
    var countLabel = count + (count === 1 ? ' item' : ' items');
    return (
      '<div class="plan-report__section plan-report__fineprint" data-pr-section="know" data-pr-collapsible>' +
        '<button type="button" class="plan-report__fineprint-toggle" data-pr-collapsible-toggle>' +
          '<span class="pr-toggle-title">⚠ Things to know' +
            '<span class="pr-toggle-count">· ' + countLabel + '</span>' +
          '</span>' +
          '<span class="pr-chev" aria-hidden="true">›</span>' +
        '</button>' +
        '<div class="plan-report__fineprint-body">' +
          '<ul class="plan-report__list plan-report__list--know">' + items + '</ul>' +
        '</div>' +
      '</div>'
    );
  }

  // SECTION 5 — Not covered (NEVER hidden — Plan 01 compliance)
  function renderExclusions(plan) {
    var items = (plan.exclusions || []).map(function (line) {
      return '<li class="plan-report__list-row">' +
        '<span class="pr-mark">•</span>' +
        '<span class="pr-text">' + escapeHtml(line) + '</span>' +
      '</li>';
    }).join('');
    return (
      '<div class="plan-report__section" data-pr-section="excl">' +
        '<div class="plan-report__eyebrow">✚ Not covered</div>' +
        '<ul class="plan-report__list plan-report__list--excl">' + items + '</ul>' +
      '</div>'
    );
  }

  // SECTION 6 — Add-ons (3 categories × 3 tiers)
  function renderAddons(addons) {
    if (!addons) return '';
    var catMeta = [
      { key: 'dental',           label: 'Dental',          icon: '🦷' },
      { key: 'vision',           label: 'Vision',          icon: '👓' },
      { key: 'critical_illness', label: 'Critical Illness', icon: '🩺' }
    ];
    var blocks = catMeta.map(function (cat) {
      var tiers = addons[cat.key] || [];
      if (!tiers.length) return '';
      var tiersHTML = tiers.map(function (t, i) {
        var label = t.tier === 'recommended' ? 'Recommended' :
                    (t.tier === 'budget' ? 'Budget' : 'Premium');
        var star = t.tier === 'recommended' ? ' ★' : '';
        return (
          '<button type="button" class="plan-report__addon-tier" ' +
            'data-pr-addon-cat="' + cat.key + '" ' +
            'data-pr-addon-tier="' + t.tier + '" ' +
            'data-pr-addon-price="' + (t.monthly_premium || 0) + '" ' +
            'data-pr-addon-name="' + escapeHtml(t.name) + '">' +
            '<span class="pr-tier-price">$' + formatMoney(t.monthly_premium) + '/mo</span>' +
            '<span class="pr-tier-label">' + escapeHtml(label) + star + '</span>' +
          '</button>'
        );
      }).join('');
      // Footer line: pick recommended tier for the suggested CTA
      var rec = tiers.filter(function (t) { return t.tier === 'recommended'; })[0] || tiers[0];
      var foot =
        '<p class="plan-report__addon-foot">' +
          escapeHtml(rec.name || '') +
        '</p>' +
        '<button type="button" class="plan-report__addon-cta" data-pr-addon-add="' + cat.key + '">' +
          'Add Recommended →' +
        '</button>';
      return (
        '<div class="plan-report__addon-cat" data-pr-addon-block="' + cat.key + '">' +
          '<div class="plan-report__addon-head">' +
            '<span class="plan-report__addon-name">' +
              '<span class="pr-icon" aria-hidden="true">' + cat.icon + '</span>' +
              escapeHtml(cat.label) +
            '</span>' +
          '</div>' +
          '<div class="plan-report__addon-tiers">' + tiersHTML + '</div>' +
          foot +
        '</div>'
      );
    }).join('');
    // V24 Tier 3 · Apple Card pattern — Add-ons collapse-by-default with
    // a category list as the scope hint. "Add-ons · Dental, Vision,
    // Critical Illness" tells the user what's inside without revealing.
    var labelList = catMeta
      .filter(function (c) { return (addons[c.key] || []).length > 0; })
      .map(function (c) { return c.label; });
    var labelString = labelList.join(', ');
    return (
      '<div class="plan-report__section plan-report__fineprint" data-pr-section="addons" data-pr-collapsible>' +
        '<button type="button" class="plan-report__fineprint-toggle" data-pr-collapsible-toggle>' +
          '<span class="pr-toggle-title">⌬ Add-ons' +
            '<span class="pr-toggle-count">· ' + escapeHtml(labelString) + '</span>' +
          '</span>' +
          '<span class="pr-chev" aria-hidden="true">›</span>' +
        '</button>' +
        '<div class="plan-report__fineprint-body">' +
          '<div class="plan-report__addons">' + blocks + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // SECTION 7 — Fine print (collapsed by default)
  function renderFinePrint(plan) {
    var benefits = plan.benefits || {};
    var keys = Object.keys(benefits);
    var rows = keys.map(function (key) {
      var label = BENEFIT_LABELS[key] || key.replace(/_/g, ' ');
      var value = formatBenefitValue(benefits[key]);
      return (
        '<tr>' +
          '<th>' + escapeHtml(label) + '</th>' +
          '<td>' + value + '</td>' +
        '</tr>'
      );
    }).join('');
    // V24 Tier 3 · scope hint
    var rowCount = keys.length;
    var countLabel = rowCount + (rowCount === 1 ? ' line' : ' lines');
    return (
      '<div class="plan-report__section plan-report__fineprint" data-pr-section="fine" data-pr-fine>' +
        '<button type="button" class="plan-report__fineprint-toggle" data-pr-fine-toggle>' +
          '<span class="pr-toggle-title">⌬ Fine print' +
            '<span class="pr-toggle-count">· ' + countLabel + '</span>' +
          '</span>' +
          '<span class="pr-chev" aria-hidden="true">›</span>' +
        '</button>' +
        '<div class="plan-report__fineprint-body">' +
          '<table class="plan-report__benefits-table">' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>'
    );
  }

  // SECTION 8 — Action row (Save / Email PDF / Forward)
  function renderActions(skipped) {
    var lockedClass = skipped ? ' is-locked' : '';
    var tooltipHTML = skipped
      ? '<span class="plan-report__action-tooltip">Sign in to save or share this plan</span>'
      : '';
    return (
      '<div class="plan-report__section" data-pr-section="actions">' +
        '<div class="plan-report__actions">' +
          '<button type="button" class="plan-report__action' + lockedClass + '" data-pr-action="save"' +
            (skipped ? ' aria-disabled="true"' : '') + '>' +
            '<span class="pr-act-icon">' + (skipped ? '🔒' : '💾') + '</span>' +
            '<span>Save</span>' + tooltipHTML +
          '</button>' +
          '<button type="button" class="plan-report__action' + lockedClass + '" data-pr-action="email"' +
            (skipped ? ' aria-disabled="true"' : '') + '>' +
            '<span class="pr-act-icon">' + (skipped ? '🔒' : '✉') + '</span>' +
            '<span>Email PDF</span>' + tooltipHTML +
          '</button>' +
          '<button type="button" class="plan-report__action' + lockedClass + '" data-pr-action="forward"' +
            (skipped ? ' aria-disabled="true"' : '') + '>' +
            '<span class="pr-act-icon">' + (skipped ? '🔒' : '↗') + '</span>' +
            '<span>Forward</span>' + tooltipHTML +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  // SECTION 9 — Continue CTA + license
  function renderContinue(licenseText) {
    return (
      '<div class="plan-report__section" data-pr-section="continue">' +
        '<button type="button" class="plan-report__continue" data-pr-continue>' +
          'Continue to enrollment →' +
        '</button>' +
        '<p class="plan-report__license" data-license-text>' + escapeHtml(licenseText) + '</p>' +
      '</div>'
    );
  }

  // Skip-mode banner
  function renderSkipBanner() {
    return (
      '<div class="plan-report__skip-banner">' +
        '<span aria-hidden="true">🔒</span>' +
        '<span>Want to save or share this? Email me anytime — same gate, same offer.</span>' +
        '<button type="button" data-pr-banner-cta>Open</button>' +
      '</div>'
    );
  }

  /* -----------------------------------------------------------
     Mount ValueStack inside premium host (peer dep, with fallback).
     ----------------------------------------------------------- */
  function mountPremium(rootEl, plan) {
    var host = rootEl.querySelector('[data-pr-vs-host]');
    if (!host) return;
    if (!window.ValueStack || typeof window.ValueStack.mount !== 'function') {
      console.log('[PlanReport] ValueStack not loaded — using fallback premium render.');
      return; // fallback already rendered
    }
    var monthly = plan.monthly_premium || 0;
    var annual = monthly * 12;
    var hasComp = plan.compared_to_user && typeof plan.compared_to_user.savings_annual === 'number';
    var tertiary;
    if (hasComp) {
      tertiary = {
        value: plan.compared_to_user.savings_annual,
        suffix: '/yr',
        label: 'vs your current plan',
        direction: 'down'
      };
    } else {
      tertiary = {
        value: 0,
        suffix: '',
        label: 'vs typical PPO in your state',
        direction: 'down'
      };
    }
    host.innerHTML = '';
    try {
      window.ValueStack.mount(host, {
        primary: { value: monthly, suffix: '/mo' },
        secondary: { label: 'Annual', value: annual },
        tertiary: hasComp ? tertiary : null,
        locked: true,
        isEstimate: false
      });
    } catch (e) {
      console.warn('[PlanReport] ValueStack mount failed', e);
      // Re-render fallback
      host.innerHTML =
        '<div class="plan-report__premium-fallback">' +
          '<div class="prf-primary">' +
            '<span class="prf-prefix">$</span>' +
            '<span>' + formatMoney(monthly) + '</span>' +
            '<span class="prf-suffix">/mo</span>' +
          '</div>' +
          '<div class="prf-secondary">' +
            '<span class="prf-secondary-label">Annual:</span>' +
            '$' + formatMoney(annual) +
          '</div>' +
        '</div>';
    }
  }

  // Spawn a momentary flash badge near the top showing total update
  function showAddonFlash(target, monthlyAddons) {
    var existing = target.querySelector('.plan-report__addon-flash');
    if (existing) existing.remove();
    var flash = document.createElement('div');
    flash.className = 'plan-report__addon-flash';
    var total = monthlyAddons.reduce(function (s, n) { return s + n; }, 0);
    flash.textContent = '+ $' + formatMoney(total) + '/mo add-ons';
    // Position roughly below the premium block
    var premium = target.querySelector('[data-pr-section="premium"]');
    if (premium) {
      var rect = premium.getBoundingClientRect();
      flash.style.top = (rect.bottom + window.scrollY + 8) + 'px';
      flash.style.left = (rect.left + rect.width / 2) + 'px';
      flash.style.transform = 'translate(-50%, 8px)';
    } else {
      flash.style.top = '20px';
      flash.style.left = '50%';
      flash.style.transform = 'translate(-50%, 8px)';
    }
    document.body.appendChild(flash);
    requestAnimationFrame(function () {
      flash.classList.add('is-shown');
    });
    setTimeout(function () {
      flash.classList.remove('is-shown');
      setTimeout(function () { try { flash.remove(); } catch (e) {} }, 300);
    }, 1000);
  }

  /* -----------------------------------------------------------
     PUBLIC API — mount(target, options)
     ----------------------------------------------------------- */
  function mount(target, options) {
    if (!target || !target.nodeType) {
      console.warn('[PlanReport] mount target not found.');
      return null;
    }
    options = options || {};
    var planSet = options.planSet;
    var selectedPlanId = options.selectedPlanId;
    if (!planSet) {
      console.warn('[PlanReport] options.planSet is required.');
      return null;
    }
    var plan = findPlan(planSet, selectedPlanId);
    if (!plan) {
      console.warn('[PlanReport] selectedPlanId not found in planSet:', selectedPlanId);
      return null;
    }
    var skipped = !!options.skipped;
    var licenseText = options.licenseText ||
      'Operated by Core Value Insurance Associates, LLC · NPN #19482230 · ShopHealthcare is licensed in all 50 states · Verifiable at NIPR.com';

    // Track add-on selections (per category)
    var addonSelections = {}; // { dental: { tier, price }, ... }

    target.classList.add('plan-report');
    target.classList.remove('is-revealed');
    // V25 · Mode 2A vs 2B branching — 2B (Switch Report) ships in Tier 4b.
    // For now the body renders Mode 2A regardless of OCR baseline; the
    // premium block already conditionally shows compared_to_user savings
    // when present, so OCR-aware messaging works inside 2A too.
    target.classList.toggle('plan-report--mode-2b', !!window.NORA_OCR_BASELINE);

    var skipBanner = skipped ? renderSkipBanner() : '';
    // V25 · Mode 2A section order — primary CTA promotes above accordions.
    //   1. SkipBanner (if skipped)
    //   2. Heading
    //   3. Premium block (uses compared_to_user when available)
    //   4. What you'll actually use
    //   5. Not covered  (compliance, ALWAYS visible)
    //   6. Continue to enrollment  (PRIMARY visual anchor)
    //   7. Actions row (Save / Email PDF / Forward)
    //   8. ▸ Things to know       (accordion, collapsed-by-default)
    //   9. ▸ Add-ons              (accordion, collapsed-by-default)
    //  10. ▸ Fine print           (accordion, collapsed-by-default)
    target.innerHTML =
      skipBanner +
      renderHeading(plan) +
      renderPremium(plan) +
      renderUseList(plan) +
      renderExclusions(plan) +              // ALWAYS visible — compliance
      renderContinue(licenseText) +         // PRIMARY CTA, promoted
      renderActions(skipped) +
      renderKnowList(plan) +                // collapsed accordion
      renderAddons(planSet.addons) +        // collapsed accordion
      renderFinePrint(plan);                // collapsed accordion

    // Mount Component A premium block
    mountPremium(target, plan);

    // Sectioned cascade reveal — apply staggered delays to each section
    var sections = target.querySelectorAll('.plan-report__section');
    var reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {}
    if (reduced) {
      target.classList.add('is-revealed');
    } else {
      // V24 Tier 5 — unified 60ms cascade stagger (was 80ms)
      Array.prototype.forEach.call(sections, function (s, i) {
        s.style.transitionDelay = (i * 60) + 'ms';
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          target.classList.add('is-revealed');
        });
      });
    }

    /* -------- bind interactions -------- */

    // Fine-print toggle
    var fineToggle = target.querySelector('[data-pr-fine-toggle]');
    var fineEl = target.querySelector('[data-pr-fine]');
    if (fineToggle && fineEl) {
      // V24 Tier 7 · A11y · aria-expanded + aria-controls
      if (!fineEl.id) fineEl.id = 'pr-fineprint-' + Math.random().toString(36).slice(2, 7);
      fineToggle.setAttribute('aria-expanded', fineEl.classList.contains('is-open') ? 'true' : 'false');
      fineToggle.setAttribute('aria-controls', fineEl.id);
      fineToggle.addEventListener('click', function () {
        fineEl.classList.toggle('is-open');
        fineToggle.setAttribute('aria-expanded', fineEl.classList.contains('is-open') ? 'true' : 'false');
      });
    }

    // V24 · Generic collapsible toggles (Things to know, etc.)
    // Apple Card pattern — collapse-by-default, expand on click.
    // V24 Tier 7 · A11y · aria-expanded reflects open state, aria-controls
    // links button to its panel for screen readers.
    var genericToggles = target.querySelectorAll('[data-pr-collapsible-toggle]');
    Array.prototype.forEach.call(genericToggles, function (toggle, idx) {
      var section = toggle.closest('[data-pr-collapsible]');
      // Initial aria-expanded state
      toggle.setAttribute('aria-expanded', section && section.classList.contains('is-open') ? 'true' : 'false');
      // Tag the panel for aria-controls
      if (section && !section.id) {
        section.id = 'pr-collapsible-' + idx + '-' + Math.random().toString(36).slice(2, 7);
      }
      if (section) toggle.setAttribute('aria-controls', section.id);
      toggle.addEventListener('click', function () {
        if (!section) return;
        section.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', section.classList.contains('is-open') ? 'true' : 'false');
      });
    });

    // Add-on tier picker
    var tierBtns = target.querySelectorAll('[data-pr-addon-tier]');
    Array.prototype.forEach.call(tierBtns, function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-pr-addon-cat');
        var tier = btn.getAttribute('data-pr-addon-tier');
        var price = parseFloat(btn.getAttribute('data-pr-addon-price')) || 0;
        // De-select siblings in same category
        var sibs = target.querySelectorAll('[data-pr-addon-cat="' + cat + '"]');
        Array.prototype.forEach.call(sibs, function (s) { s.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
        addonSelections[cat] = { tier: tier, price: price };
        // Show flash badge with new total
        var prices = Object.keys(addonSelections).map(function (k) { return addonSelections[k].price; });
        showAddonFlash(target, prices);
      });
    });
    // "Add Recommended" CTA — pick the recommended tier in that block
    var addCTAs = target.querySelectorAll('[data-pr-addon-add]');
    Array.prototype.forEach.call(addCTAs, function (cta) {
      cta.addEventListener('click', function () {
        var cat = cta.getAttribute('data-pr-addon-add');
        var recBtn = target.querySelector(
          '[data-pr-addon-cat="' + cat + '"][data-pr-addon-tier="recommended"]'
        );
        if (recBtn) recBtn.click();
      });
    });

    // Action buttons
    var actBtns = target.querySelectorAll('[data-pr-action]');
    Array.prototype.forEach.call(actBtns, function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-locked')) return;
        var act = btn.getAttribute('data-pr-action');
        if (act === 'save'    && typeof options.onSave === 'function')      options.onSave();
        if (act === 'email'   && typeof options.onEmailPdf === 'function')  options.onEmailPdf();
        if (act === 'forward' && typeof options.onForward === 'function')   options.onForward();
      });
    });

    // Continue CTA
    var contBtn = target.querySelector('[data-pr-continue]');
    if (contBtn) {
      contBtn.addEventListener('click', function () {
        if (typeof options.onContinueEnroll === 'function') options.onContinueEnroll();
      });
    }

    // Skip-banner CTA
    var bannerBtn = target.querySelector('[data-pr-banner-cta]');
    if (bannerBtn) {
      bannerBtn.addEventListener('click', function () {
        if (typeof options.onOpenEmailGate === 'function') options.onOpenEmailGate();
      });
    }

    return {
      el: target,
      destroy: function () {
        target.innerHTML = '';
        target.classList.remove('plan-report', 'is-revealed');
      }
    };
  }

  window.PlanReport = { mount: mount };
})();
