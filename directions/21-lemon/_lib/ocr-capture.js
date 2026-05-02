/* =============================================================
   OCR-CAPTURE — V25 Component E
   Insurance-card capture overlay with mock OCR backend.

   Public API:
     window.OCRCapture.show({ persona, onConfirm, onSkip, manualOnly })
     window.OCRCapture.hide()

   On confirm, sets window.NORA_OCR_BASELINE and dispatches the custom
   event 'noraOCRBaselineSet' on document. Consumers (Trail / cards /
   plan-report) read NORA_OCR_BASELINE on next render.

   Mock backend = setTimeout with persona-keyed deterministic card data.
   Real backend swap = replace `mockScan()` body with fetch to Eugenio's
   endpoint; the rest of the component is wire-compatible.
   ============================================================= */
(function (global) {
  'use strict';

  // ─── PERSONA-KEYED MOCK CARDS (swap for real OCR backend) ────
  var MOCK_CARDS = {
    RU1: { carrier: 'Cigna',           plan_name: 'Cigna OAP HSA',           monthly_premium: 712,  deductible: 1500, network_type: 'PPO' },
    SP1: { carrier: 'Blue Cross',      plan_name: 'BCBS Bronze Essential',   monthly_premium: 524,  deductible: 7500, network_type: 'EPO' },
    BR1: { carrier: 'UnitedHealthcare',plan_name: 'UHC PPO Plus',            monthly_premium: 1180, deductible: 2000, network_type: 'PPO' },
    CL1: { carrier: 'Aetna',           plan_name: 'Aetna Silver 5500',       monthly_premium: 890,  deductible: 5500, network_type: 'PPO' },
    PC1: { carrier: 'Humana',          plan_name: 'Humana Gold Plus PPO',    monthly_premium: 645,  deductible: 1000, network_type: 'PPO' },
    GEN: { carrier: 'Cigna',           plan_name: 'Cigna Open Access Plus',  monthly_premium: 480,  deductible: 3500, network_type: 'PPO' }
  };

  // ─── INTERNAL STATE ─────────────────────────────────────────
  var _overlay = null;
  var _opts    = null;
  var _previouslyFocused = null;
  var _escHandler = null;
  var _trapHandler = null;

  // ─── PUBLIC API ─────────────────────────────────────────────
  function show(opts) {
    opts = opts || {};
    _opts = opts;
    try { _previouslyFocused = global.document.activeElement; } catch (e) { _previouslyFocused = null; }

    if (!_overlay) buildOverlay();
    renderState('intro');
    _overlay.classList.add('is-open');
    global.document.body.style.overflow = 'hidden';

    _escHandler = function (e) { if (e.key === 'Escape') skip(); };
    global.document.addEventListener('keydown', _escHandler);
    _trapHandler = function (e) {
      if (e.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey ? global.document.activeElement === first : global.document.activeElement === last) {
        e.preventDefault();
        try { (e.shiftKey ? last : first).focus(); } catch (er) {}
      }
    };
    global.document.addEventListener('keydown', _trapHandler);

    // Focus first input
    requestAnimationFrame(function () {
      var f = focusables();
      if (f.length) { try { f[0].focus(); } catch (e) {} }
    });

    if (opts.manualOnly) renderState('manual');
  }

  function hide() {
    if (!_overlay) return;
    _overlay.classList.remove('is-open');
    global.document.body.style.overflow = '';
    if (_escHandler) global.document.removeEventListener('keydown', _escHandler);
    if (_trapHandler) global.document.removeEventListener('keydown', _trapHandler);
    _escHandler = null; _trapHandler = null;
    if (_previouslyFocused && typeof _previouslyFocused.focus === 'function') {
      try { _previouslyFocused.focus(); } catch (e) {}
    }
    _previouslyFocused = null;
  }

  // ─── OVERLAY BUILD ──────────────────────────────────────────
  function buildOverlay() {
    _overlay = global.document.createElement('div');
    _overlay.className = 'ocr-overlay';
    _overlay.setAttribute('role', 'dialog');
    _overlay.setAttribute('aria-modal', 'true');
    _overlay.setAttribute('aria-labelledby', 'ocr-title');
    _overlay.innerHTML =
      '<div class="ocr-backdrop" data-ocr-backdrop></div>' +
      '<div class="ocr-panel">' +
        '<button type="button" class="ocr-close" data-ocr-skip aria-label="Close — skip card scan">×</button>' +
        '<div class="ocr-body" data-ocr-body></div>' +
        '<div class="ocr-foot">' +
          '<a href="#" class="ocr-skip-link" data-ocr-skip>Skip — I\'ll tell Nora directly</a>' +
        '</div>' +
      '</div>';
    global.document.body.appendChild(_overlay);

    // Backdrop click + skip link both call skip()
    _overlay.querySelector('[data-ocr-backdrop]').addEventListener('click', skip);
    Array.prototype.forEach.call(_overlay.querySelectorAll('[data-ocr-skip]'), function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); skip(); });
    });
  }

  // ─── RENDER STATES ──────────────────────────────────────────
  function renderState(stateName, payload) {
    var body = _overlay.querySelector('[data-ocr-body]');
    if (!body) return;

    if (stateName === 'intro')    body.innerHTML = renderIntro();
    if (stateName === 'scanning') body.innerHTML = renderScanning();
    if (stateName === 'confirm')  body.innerHTML = renderConfirm(payload);
    if (stateName === 'manual')   body.innerHTML = renderManual(payload);
    if (stateName === 'failed')   body.innerHTML = renderFailed();

    bindStateInteractions(stateName);
  }

  function renderIntro() {
    return (
      '<h2 class="ocr-title" id="ocr-title">Add your current card</h2>' +
      '<p class="ocr-privacy">' +
        'We read carrier, plan, premium, deductible. ' +
        '<strong>We don\'t read your member ID.</strong>' +
      '</p>' +
      '<div class="ocr-options">' +
        '<button type="button" class="ocr-opt" data-ocr-input="camera">' +
          '<span class="ocr-opt-icon" aria-hidden="true">📷</span>' +
          '<span class="ocr-opt-label">Take a photo</span>' +
        '</button>' +
        '<button type="button" class="ocr-opt" data-ocr-input="upload">' +
          '<span class="ocr-opt-icon" aria-hidden="true">📁</span>' +
          '<span class="ocr-opt-label">Upload an image</span>' +
        '</button>' +
        '<button type="button" class="ocr-opt" data-ocr-input="paste">' +
          '<span class="ocr-opt-icon" aria-hidden="true">📋</span>' +
          '<span class="ocr-opt-label">Paste from clipboard</span>' +
        '</button>' +
      '</div>' +
      '<div class="ocr-or"><span>or</span></div>' +
      '<button type="button" class="ocr-manual-link" data-ocr-manual>' +
        'Type it out instead →' +
      '</button>'
    );
  }

  function renderScanning() {
    return (
      '<h2 class="ocr-title" id="ocr-title">Reading your card…</h2>' +
      '<div class="ocr-scan-frame">' +
        '<span class="ocr-scan-corner ocr-scan-corner--tl"></span>' +
        '<span class="ocr-scan-corner ocr-scan-corner--tr"></span>' +
        '<span class="ocr-scan-corner ocr-scan-corner--bl"></span>' +
        '<span class="ocr-scan-corner ocr-scan-corner--br"></span>' +
        '<span class="ocr-scan-beam"></span>' +
      '</div>' +
      '<p class="ocr-scan-status" data-ocr-scan-status>Looking for your carrier…</p>'
    );
  }

  function renderConfirm(card) {
    if (!card) card = {};
    return (
      '<h2 class="ocr-title" id="ocr-title">Did we get this right?</h2>' +
      '<div class="ocr-card-preview">' +
        '<div class="ocr-card-row"><span class="ocr-card-label">CARRIER</span><span class="ocr-card-value">' + escapeHtml(card.carrier || '—') + '</span></div>' +
        '<div class="ocr-card-row"><span class="ocr-card-label">PLAN</span><span class="ocr-card-value">' + escapeHtml(card.plan_name || '—') + '</span></div>' +
        '<div class="ocr-card-row"><span class="ocr-card-label">PREMIUM</span><span class="ocr-card-value">$' + formatMoney(card.monthly_premium) + '<span class="ocr-suffix">/mo</span></span></div>' +
        '<div class="ocr-card-row"><span class="ocr-card-label">DEDUCTIBLE</span><span class="ocr-card-value">$' + formatMoney(card.deductible) + '</span></div>' +
        '<div class="ocr-card-row"><span class="ocr-card-label">NETWORK</span><span class="ocr-card-value">' + escapeHtml(card.network_type || '—') + '</span></div>' +
      '</div>' +
      '<div class="ocr-actions">' +
        '<button type="button" class="ocr-action-edit" data-ocr-edit>Edit</button>' +
        '<button type="button" class="ocr-action-confirm" data-ocr-confirm>Looks right →</button>' +
      '</div>'
    );
  }

  function renderManual(initial) {
    initial = initial || {};
    return (
      '<h2 class="ocr-title" id="ocr-title">Tell Nora about your current plan</h2>' +
      '<p class="ocr-manual-intro">Just three quick fields. We\'ll use these to compare.</p>' +
      '<form class="ocr-form" data-ocr-manual-form>' +
        '<label class="ocr-field">' +
          '<span class="ocr-field-label">Carrier</span>' +
          '<input type="text" name="carrier" required value="' + escapeHtml(initial.carrier || '') + '" placeholder="UnitedHealthcare, Cigna, BCBS…" />' +
        '</label>' +
        '<label class="ocr-field">' +
          '<span class="ocr-field-label">Monthly premium</span>' +
          '<div class="ocr-field-money">' +
            '<span class="ocr-field-prefix">$</span>' +
            '<input type="number" name="monthly_premium" required min="0" step="1" value="' + (typeof initial.monthly_premium === 'number' ? initial.monthly_premium : '') + '" placeholder="0" />' +
            '<span class="ocr-field-suffix">/mo</span>' +
          '</div>' +
        '</label>' +
        '<label class="ocr-field">' +
          '<span class="ocr-field-label">Annual deductible</span>' +
          '<div class="ocr-field-money">' +
            '<span class="ocr-field-prefix">$</span>' +
            '<input type="number" name="deductible" min="0" step="50" value="' + (typeof initial.deductible === 'number' ? initial.deductible : '') + '" placeholder="0" />' +
          '</div>' +
        '</label>' +
        '<label class="ocr-field">' +
          '<span class="ocr-field-label">Plan name (optional)</span>' +
          '<input type="text" name="plan_name" value="' + escapeHtml(initial.plan_name || '') + '" placeholder="If you know it" />' +
        '</label>' +
        '<button type="submit" class="ocr-action-confirm">Use these numbers →</button>' +
      '</form>'
    );
  }

  function renderFailed() {
    return (
      '<h2 class="ocr-title" id="ocr-title">Couldn\'t quite read that.</h2>' +
      '<p class="ocr-privacy">No problem. Want to try a clearer image, or just tell me directly?</p>' +
      '<div class="ocr-actions">' +
        '<button type="button" class="ocr-action-edit" data-ocr-retry>Try again</button>' +
        '<button type="button" class="ocr-action-confirm" data-ocr-manual>Type it out →</button>' +
      '</div>'
    );
  }

  // ─── INTERACTIONS PER STATE ─────────────────────────────────
  function bindStateInteractions(stateName) {
    if (stateName === 'intro') {
      Array.prototype.forEach.call(_overlay.querySelectorAll('[data-ocr-input]'), function (btn) {
        btn.addEventListener('click', function () {
          var inputType = btn.getAttribute('data-ocr-input');
          renderState('scanning');
          mockScan(inputType, function (result) {
            if (result.error) renderState('failed');
            else renderState('confirm', result.card);
          });
        });
      });
      var manualBtn = _overlay.querySelector('[data-ocr-manual]');
      if (manualBtn) manualBtn.addEventListener('click', function () { renderState('manual'); });
    }
    if (stateName === 'confirm') {
      var editBtn = _overlay.querySelector('[data-ocr-edit]');
      var confirmBtn = _overlay.querySelector('[data-ocr-confirm]');
      var card = currentCard();
      if (editBtn) editBtn.addEventListener('click', function () { renderState('manual', card); });
      if (confirmBtn) confirmBtn.addEventListener('click', function () {
        confirmBaseline(card);
      });
    }
    if (stateName === 'manual') {
      var form = _overlay.querySelector('[data-ocr-manual-form]');
      if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        var card = {
          carrier:         (fd.get('carrier') || '').toString().trim(),
          monthly_premium: parseFloat(fd.get('monthly_premium')) || 0,
          deductible:      parseFloat(fd.get('deductible')) || 0,
          plan_name:       (fd.get('plan_name') || '').toString().trim(),
          network_type:    'PPO',
          source:          'manual'
        };
        if (!card.carrier || !card.monthly_premium) return;
        confirmBaseline(card);
      });
    }
    if (stateName === 'failed') {
      var retryBtn = _overlay.querySelector('[data-ocr-retry]');
      var manualBtn2 = _overlay.querySelector('[data-ocr-manual]');
      if (retryBtn) retryBtn.addEventListener('click', function () { renderState('intro'); });
      if (manualBtn2) manualBtn2.addEventListener('click', function () { renderState('manual'); });
    }
  }

  // Cache the last scanned card so confirm-after-edit-back works
  var _lastCard = null;
  function currentCard() { return _lastCard; }

  // ─── MOCK OCR BACKEND ───────────────────────────────────────
  // SWAP for real backend: replace this function body with a fetch to
  // Eugenio's OCR endpoint. Input: blob/dataURL from camera/upload/paste.
  // Output: same shape as MOCK_CARDS entries.
  function mockScan(inputType, cb) {
    var statusEl = _overlay.querySelector('[data-ocr-scan-status]');
    var beats = ['Looking for your carrier…', 'Reading plan name…', 'Pulling premium…'];
    var i = 0;
    var interval = setInterval(function () {
      i++;
      if (statusEl && beats[i]) statusEl.textContent = beats[i];
      if (i >= beats.length) clearInterval(interval);
    }, 500);

    setTimeout(function () {
      clearInterval(interval);
      // Simulate occasional OCR failure (5% rate, but force success in mock)
      var personaKey = (_opts && _opts.persona ? _opts.persona : 'GEN').toUpperCase();
      var card = MOCK_CARDS[personaKey] || MOCK_CARDS.GEN;
      _lastCard = Object.assign({ source: 'ocr-' + inputType }, card);
      cb({ card: _lastCard });
    }, 1700);
  }

  // ─── COMMIT ─────────────────────────────────────────────────
  function confirmBaseline(card) {
    if (!card) return;
    global.NORA_OCR_BASELINE = card;
    try {
      global.document.dispatchEvent(new CustomEvent('noraOCRBaselineSet', { detail: card }));
    } catch (e) {}
    if (_opts && typeof _opts.onConfirm === 'function') {
      try { _opts.onConfirm(card); } catch (e) {}
    }
    hide();
  }

  function skip() {
    if (_opts && typeof _opts.onSkip === 'function') {
      try { _opts.onSkip(); } catch (e) {}
    }
    hide();
  }

  // ─── UTILITIES ──────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }
  function formatMoney(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function focusables() {
    if (!_overlay) return [];
    var sel = 'a[href], button:not([disabled]), input:not([disabled]),' +
              ' select:not([disabled]), textarea:not([disabled]),' +
              ' [tabindex]:not([tabindex="-1"])';
    return Array.prototype.filter.call(_overlay.querySelectorAll(sel), function (el) {
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    });
  }

  // ─── EXPORT ─────────────────────────────────────────────────
  global.OCRCapture = { show: show, hide: hide };
})(typeof window !== 'undefined' ? window : this);
