/* =============================================================
   PLAN-COMPARE-MODAL — V21 Component D · Mode 3
   Lazy-mounted side-by-side comparison overlay.
   Plain JS IIFE. Exposes window.PlanCompareModal.

   Spec: nora-app-design-brief.md §8.2 + LARGE PLAN VIEW.pdf
   ============================================================= */
(function () {
  'use strict';

  // Same label map as plan-report.js (kept here so this module is
  // independently mountable without plan-report being loaded).
  var BENEFIT_LABELS = {
    monthly_premium:               'Monthly Premium',
    network_type:                  'Network Type',
    medical_deductible_individual: 'Medical Deductible',
    drug_deductible:               'Drug Benefits Deductible',
    combined_med_drug_deductible:  'Combined Medical & Drug Deductible',
    out_of_pocket_max_individual:  'Out of Pocket Max (Medical & Drug)',
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

  // The fixed row order pulled from LARGE PLAN VIEW.pdf — keeps the
  // comparison table visually faithful to the existing UI.
  var ROW_ORDER = [
    'monthly_premium',
    'network_type',
    'medical_deductible_individual',
    'drug_deductible',
    'combined_med_drug_deductible',
    'out_of_pocket_max_individual',
    'primary_care',
    'other_practitioner',
    'specialist',
    'urgent_care',
    'emergency_room',
    'emergency_transportation',
    'preventive',
    'well_baby',
    'generic_drugs',
    'preferred_brand_drugs',
    'non_preferred_brand_drugs',
    'specialty_drugs',
    'imaging',
    'xrays',
    'laboratory',
    'chiropractic',
    'outpatient_surgery',
    'outpatient_rehabilitation',
    'inpatient_physician',
    'inpatient_hospital',
    'skilled_nursing',
    'habilitation',
    'home_health',
    'durable_medical',
    'hospice',
    'mental_health_outpatient',
    'mental_health_inpatient',
    'substance_abuse_outpatient',
    'substance_abuse_inpatient',
    'prenatal_postnatal',
    'delivery_inpatient_maternity',
    'rehab_speech',
    'rehab_occupational_physical',
    'allergy_testing',
    'chemotherapy',
    'radiation',
    'dialysis',
    'infusion_therapy',
    'transplant',
    'reconstructive_surgery',
    'accidental_dental',
    'diabetes_education',
    'routine_eye_exam_children',
    'eye_glasses_children',
    'dental_check_children',
    'additional_benefits'
  ];

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function formatMoney(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function getCellValue(plan, key) {
    if (!plan) return '—';
    if (key === 'monthly_premium') {
      return '$' + formatMoney(plan.monthly_premium) + '/mo';
    }
    if (key === 'network_type') {
      return plan.network_type || '—';
    }
    var benefits = plan.benefits || {};
    var v = benefits[key];
    if (v == null || v === '') return '—';
    if (Array.isArray(v)) return v.join('<br>');
    if (typeof v === 'number') return '$' + formatMoney(v);
    // For combined_med_drug_deductible and similar pre-formatted strings
    return escapeHtml(v);
  }

  // True if all 3 cell values for a row are identical (string-equal).
  function rowAllSame(values) {
    if (!values.length) return true;
    var first = values[0];
    for (var i = 1; i < values.length; i++) {
      if (values[i] !== first) return false;
    }
    return true;
  }

  // For diff highlight: find the most common value and mark cells that
  // differ from it. If all 3 are different, mark all 3 (no majority).
  function diffMask(values) {
    var counts = {};
    values.forEach(function (v) { counts[v] = (counts[v] || 0) + 1; });
    var maxCount = 0;
    Object.keys(counts).forEach(function (k) {
      if (counts[k] > maxCount) maxCount = counts[k];
    });
    if (maxCount === values.length) return values.map(function () { return false; });
    if (maxCount === 1) return values.map(function () { return true; }); // all unique
    return values.map(function (v) { return counts[v] !== maxCount; });
  }

  /* -----------------------------------------------------------
     RENDER — full overlay markup
     ----------------------------------------------------------- */
  function buildOverlay() {
    var overlay = document.createElement('div');
    overlay.className = 'pcm-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'pcm-title');
    overlay.innerHTML =
      '<div class="pcm-backdrop" data-pcm-backdrop></div>' +
      '<div class="pcm-panel">' +
        '<div class="pcm-head">' +
          '<h3 class="pcm-title" id="pcm-title">Side-by-Side Plan Comparison</h3>' +
          '<label class="pcm-toggle">' +
            '<input type="checkbox" data-pcm-diffs checked />' +
            '<span class="pcm-toggle-track"></span>' +
            '<span>Show only differences</span>' +
          '</label>' +
          '<button type="button" class="pcm-close" data-pcm-close aria-label="Close comparison">×</button>' +
        '</div>' +
        '<div class="pcm-body" data-pcm-body></div>' +
        '<div class="pcm-foot" data-pcm-foot></div>' +
      '</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function renderTable(planSet, diffsOnly) {
    var plans = planSet.plans || [];

    // Header row
    var headCols = plans.map(function (p) {
      var tierLabel = p.tier === 'recommended' ? 'Recommended ★' :
                      (p.tier === 'budget' ? 'Budget' : 'Premium');
      var tierClass = p.tier === 'recommended' ? ' pcm-col-tier--recommended' : '';
      var carrierShort = (function () {
        var c = p.carrier || '';
        if (/regence/i.test(c)) return 'Regence BCBS';
        if (/university of utah/i.test(c)) return 'U of U Health';
        if (c.length > 26) return c.slice(0, 24) + '…';
        return c;
      })();
      return (
        '<th>' +
          '<div class="pcm-col-head">' +
            '<span class="pcm-col-tier' + tierClass + '">' + escapeHtml(tierLabel) + '</span>' +
            '<span class="pcm-col-carrier">' + escapeHtml(carrierShort) + '</span>' +
            '<span class="pcm-col-name">' + escapeHtml(p.name) + '</span>' +
            '<span class="pcm-col-network">' + escapeHtml(p.network_type || '') + '</span>' +
            '<span class="pcm-col-price">$' + formatMoney(p.monthly_premium) + '<small>/mo</small></span>' +
          '</div>' +
        '</th>'
      );
    }).join('');

    // Body rows
    var bodyRows = ROW_ORDER.map(function (key) {
      var values = plans.map(function (p) { return getCellValue(p, key); });
      var same = rowAllSame(values);
      if (diffsOnly && same) return ''; // hide identical rows
      var diffs = diffMask(values);
      var label = BENEFIT_LABELS[key] || key.replace(/_/g, ' ');
      var cells = values.map(function (v, i) {
        var classes = [];
        if (diffs[i]) classes.push('is-diff');
        if (v === '—') classes.push('is-empty');
        var clsAttr = classes.length ? ' class="' + classes.join(' ') + '"' : '';
        return '<td' + clsAttr + '>' + v + '</td>';
      }).join('');
      return (
        '<tr>' +
          '<th class="pcm-row-label">' + escapeHtml(label) + '</th>' +
          cells +
        '</tr>'
      );
    }).join('');

    return (
      '<table class="pcm-table">' +
        '<thead>' +
          '<tr>' +
            '<th class="pcm-row-label">Benefit</th>' +
            headCols +
          '</tr>' +
        '</thead>' +
        '<tbody>' + bodyRows + '</tbody>' +
      '</table>'
    );
  }

  function renderFoot(planSet, licenseText) {
    var plans = planSet.plans || [];
    var disclaimers = plans.filter(function (p) { return p.disclaimer; });
    var ul = '';
    if (disclaimers.length) {
      ul = '<ul>' + disclaimers.map(function (p) {
        var carrierShort = /regence/i.test(p.carrier) ? 'Regence BCBS' :
                           /university of utah/i.test(p.carrier) ? 'U of U Health' :
                           p.carrier;
        return '<li><strong>' + escapeHtml(carrierShort) + ':</strong> ' +
               escapeHtml(p.disclaimer) + '</li>';
      }).join('') + '</ul>';
    }
    return ul +
      '<span class="pcm-license" data-license-text>' + escapeHtml(licenseText) + '</span>';
  }

  /* -----------------------------------------------------------
     Singleton overlay — lazy-mount, keep alive between shows
     ----------------------------------------------------------- */
  var _overlay = null;
  var _options = null;
  var _onCloseCb = null;
  var _escHandler = null;
  var _trapHandler = null;
  var _previouslyFocused = null;

  function ensureOverlay() {
    if (!_overlay) {
      _overlay = buildOverlay();
      _overlay.querySelector('[data-pcm-close]').addEventListener('click', hide);
      _overlay.querySelector('[data-pcm-backdrop]').addEventListener('click', hide);
      _overlay.querySelector('[data-pcm-diffs]').addEventListener('change', function (e) {
        if (!_options) return;
        _options.diffsOnly = !!e.target.checked;
        renderInto(_overlay, _options);
      });
    }
    return _overlay;
  }

  function renderInto(overlay, options) {
    var body = overlay.querySelector('[data-pcm-body]');
    var foot = overlay.querySelector('[data-pcm-foot]');
    var diffsToggle = overlay.querySelector('[data-pcm-diffs]');
    var licenseText = options.licenseText ||
      'ShopHealthcare is licensed in all 50 states · Operated by Core Value Insurance Associates, LLC · NPN #19482230';
    var diffsOnly = options.diffsOnly !== false; // default true
    if (diffsToggle) diffsToggle.checked = diffsOnly;
    body.innerHTML = renderTable(options.planSet, diffsOnly);
    foot.innerHTML = renderFoot(options.planSet, licenseText);
  }

  // V24 Tier 7 · A11y · Get all keyboard-focusable elements inside an
  // element. Used for focus-trap inside the modal.
  function getFocusable(root) {
    if (!root) return [];
    var sel = 'a[href], button:not([disabled]), input:not([disabled]),' +
              ' select:not([disabled]), textarea:not([disabled]),' +
              ' [tabindex]:not([tabindex="-1"])';
    return Array.prototype.filter.call(
      root.querySelectorAll(sel),
      function (el) {
        // Filter out elements whose offsetParent is null (display:none).
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      }
    );
  }

  function show(options) {
    if (!options || !options.planSet) {
      console.warn('[PlanCompareModal] options.planSet is required.');
      return;
    }
    _options = Object.assign({ diffsOnly: true }, options);
    _onCloseCb = options.onClose || null;
    // V24 Tier 7 · Capture currently focused element to restore on close.
    try { _previouslyFocused = document.activeElement; } catch (e) { _previouslyFocused = null; }

    var overlay = ensureOverlay();
    renderInto(overlay, _options);
    requestAnimationFrame(function () {
      overlay.classList.add('is-open');
      // V24 Tier 7 · Move focus into the modal — first focusable (close btn).
      var focusables = getFocusable(overlay);
      if (focusables.length) {
        try { focusables[0].focus(); } catch (e) {}
      }
    });
    document.body.style.overflow = 'hidden';
    // ESC to close
    _escHandler = function (e) { if (e.key === 'Escape') hide(); };
    document.addEventListener('keydown', _escHandler);
    // V24 Tier 7 · Focus-trap: cycle Tab/Shift+Tab inside modal only.
    _trapHandler = function (e) {
      if (e.key !== 'Tab') return;
      var focusables = getFocusable(_overlay);
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || !_overlay.contains(document.activeElement)) {
          e.preventDefault();
          try { last.focus(); } catch (er) {}
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          try { first.focus(); } catch (er) {}
        }
      }
    };
    document.addEventListener('keydown', _trapHandler);
  }

  function hide() {
    if (!_overlay) return;
    _overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (_escHandler) {
      document.removeEventListener('keydown', _escHandler);
      _escHandler = null;
    }
    if (_trapHandler) {
      document.removeEventListener('keydown', _trapHandler);
      _trapHandler = null;
    }
    // V24 Tier 7 · Restore focus to the element that triggered the modal.
    if (_previouslyFocused && typeof _previouslyFocused.focus === 'function') {
      try { _previouslyFocused.focus(); } catch (e) {}
    }
    _previouslyFocused = null;
    if (typeof _onCloseCb === 'function') _onCloseCb();
  }

  window.PlanCompareModal = {
    show: show,
    hide: hide
  };
})();
