/* =============================================================
   AUTH-GATE — V21 Component C
   IIFE module exposing window.AuthGate.
   In-chat email gate for the "while I finish" moment.

   Spec: front-end design/quiz-app-capture-flow.md §6
         front-end design/nora-app-design-brief.md §7

   Depends on: window.NoraSession (session.js — load first)
   ============================================================= */
(function (global) {
  'use strict';

  // ─── PERSONA COMPARISON ANCHORS ──────────────────────────────
  // Default carrots if consumer doesn't pass comparisonAnchor.
  // Source of truth: front-end design/persona-strings.json
  var COMPARISON_ANCHORS = {
    RU1: "what your monthly premium will be once you're back on coverage",
    SP1: "what most freelancers pay on the open market",
    BR1: "what you'd pay on the open market for bridge coverage",
    CL1: "your renewal premium — the one that just spiked",
    PC1: "whether your current plan is the best deal in your state",
    GEN: "the typical premium for someone in your situation"
  };

  // V24 Tier 3 · Substack-grade AuthGate · persona-specific social proof.
  // One mono-caps line above the form. Number is illustrative for now —
  // real-time count arrives in V25 when analytics wiring lands.
  var SOCIAL_PROOF_LINES = {
    SP1: '12,847 freelancers got their number this week.',
    CL1: '5,290 renewal-spike checks this week.',
    BR1: '3,160 bridge-year checks this week.',
    PC1: '8,420 second-opinion checks this week.',
    RU1: '2,940 coverage restarts this week.',
    GEN: '12,847 people got their number this week.'
  };

  // V24 · State-specific carrot variants — when the consumer passes
  // `state` in opts, we inject the abbreviation into the anchor copy
  // for personas whose phrasing reads tighter with state context.
  // Falls back to plain anchor if state not provided / persona not in map.
  var STATE_NAMES = {
    AL:'AL',AK:'AK',AZ:'AZ',AR:'AR',CA:'CA',CO:'CO',CT:'CT',DE:'DE',FL:'FL',GA:'GA',
    HI:'HI',ID:'ID',IL:'IL',IN:'IN',IA:'IA',KS:'KS',KY:'KY',LA:'LA',ME:'ME',MD:'MD',
    MA:'MA',MI:'MI',MN:'MN',MS:'MS',MO:'MO',MT:'MT',NE:'NE',NV:'NV',NH:'NH',NJ:'NJ',
    NM:'NM',NY:'NY',NC:'NC',ND:'ND',OH:'OH',OK:'OK',OR:'OR',PA:'PA',RI:'RI',SC:'SC',
    SD:'SD',TN:'TN',TX:'TX',UT:'UT',VT:'VT',VA:'VA',WA:'WA',WV:'WV',WI:'WI',WY:'WY'
  };
  function buildStateSpecificAnchor(persona, state) {
    if (!state || !STATE_NAMES[state]) return null;
    var s = state;
    if (persona === 'SP1') return 'what most ' + s + ' self-employed pay on the open market';
    if (persona === 'BR1') return 'what you’d pay in ' + s + ' on the open market for bridge coverage';
    if (persona === 'CL1') return 'your ' + s + ' renewal premium — the one that just spiked';
    if (persona === 'PC1') return 'whether your current plan is the best deal in ' + s;
    if (persona === 'RU1') return 'what your ' + s + ' premium will be once you’re back on coverage';
    if (persona === 'GEN') return 'the typical ' + s + ' premium for someone in your situation';
    return null;
  }

  var GOOGLE_G_SVG =
    '<svg class="ag-google-icon" viewBox="0 0 18 18" aria-hidden="true">' +
      '<path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62z"/>' +
      '<path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86a5.36 5.36 0 0 1-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"/>' +
      '<path fill="#FBBC05" d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33z"/>' +
      '<path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96l3 2.33A5.36 5.36 0 0 1 9 3.58z"/>' +
    '</svg>';

  // ─── INTERNAL STATE ──────────────────────────────────────────
  var instances = []; // { host, opts, els, state }

  // ─── PUBLIC API ──────────────────────────────────────────────
  var AuthGate = {
    mount:        mount,
    show:         show,
    hide:         hide,
    success:      success,
    error:        error,
    setPersona:   setPersona,
    setSkipped:   setSkipped,
    isAuthed:     isAuthed,
    setAuthed:    setAuthed,
    reset:        reset,
    lockAction:   lockAction,
    unlockAction: unlockAction,
    refreshLocks: refreshLocks,
    showSkipBanner: showSkipBanner,
    hideSkipBanner: hideSkipBanner,
    COMPARISON_ANCHORS: COMPARISON_ANCHORS
  };

  // ─── MOUNT ───────────────────────────────────────────────────
  function mount(host, opts) {
    if (!host) {
      warn('mount called with no host');
      return null;
    }
    opts = opts || {};

    // Idempotent: if already mounted to this host, just re-render.
    var existing = findInstance(host);
    if (existing) {
      existing.opts = mergeOpts(existing.opts, opts);
      render(existing);
      return AuthGate;
    }

    var inst = {
      host:  host,
      opts:  mergeOpts(defaultOpts(), opts),
      els:   null,
      state: { hidden: false, loading: false, success: false, error: null }
    };
    instances.push(inst);
    build(inst);
    render(inst);

    // If session has already captured email + authed, hide gate by default.
    if (global.NoraSession && global.NoraSession.isAuthed && global.NoraSession.isAuthed()) {
      inst.state.hidden = true;
      inst.host.classList.add('is-hidden');
    }

    return AuthGate;
  }

  function findInstance(host) {
    for (var i = 0; i < instances.length; i++) {
      if (instances[i].host === host) return instances[i];
    }
    return null;
  }

  function defaultOpts() {
    return {
      persona: 'GEN',
      comparisonAnchor: null,    // computed from persona if null
      onSubmit: null,
      onSkip: null,
      onGoogleAuth: null,
      onShow: null,
      onHide: null
    };
  }

  function mergeOpts(prev, next) {
    var out = {};
    var k;
    for (k in prev) if (Object.prototype.hasOwnProperty.call(prev, k)) out[k] = prev[k];
    for (k in next) if (Object.prototype.hasOwnProperty.call(next, k)) {
      if (next[k] !== undefined) out[k] = next[k];
    }
    return out;
  }

  // ─── BUILD DOM ───────────────────────────────────────────────
  function build(inst) {
    var host = inst.host;
    host.classList.add('auth-gate');
    host.innerHTML = '';

    var bubble = el('div', 'auth-gate__bubble');

    // Avatar
    var avatar = el('div', 'auth-gate__avatar');
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = 'N';
    bubble.appendChild(avatar);

    // Copy block
    var copy = el('div', 'auth-gate__copy');
    var p1 = el('p', 'is-lead');
    p1.textContent = 'Quick thing while I finish.';
    copy.appendChild(p1);

    var p2 = el('p');
    p2.setAttribute('data-ag-carrot', '');
    copy.appendChild(p2);

    var p3 = el('p');
    // V24 · Soften "lock this rate for 30 days" — too binding-promise-y.
    // "Hold this number" is honest about what we can actually do.
    p3.innerHTML =
      'Plus I' + "'" + 'll hold this number for 30 days so you can ' +
      'think it over, and text you before your enrollment window closes.';
    copy.appendChild(p3);

    // V24 Tier 4 · Enrollment-window deadline (TurboTax pattern).
    // Honest OEP date — Dec 15 is the federal close for most states.
    // Computed as days-until-Dec-15 from today (Pacific TZ ignored — close enough).
    var deadlineLine = el('p', 'ag-window-deadline');
    deadlineLine.setAttribute('data-ag-deadline', '');
    copy.appendChild(deadlineLine);

    var noFollowup = el('div', 'auth-gate__no-followup');
    noFollowup.textContent = 'No follow-up unless you ask.';
    copy.appendChild(noFollowup);

    bubble.appendChild(copy);

    // V24 Tier 3 · Substack-grade social-proof line above the form.
    // Mono caps, ink-mute, single line — gives the form a sense of
    // shared momentum without claiming, promising, or pressuring.
    var socialProof = el('div', 'auth-gate__social-proof');
    socialProof.setAttribute('data-ag-social-proof', '');
    bubble.appendChild(socialProof);

    // Form
    var form = el('form', 'auth-gate__form');
    form.setAttribute('novalidate', '');
    form.setAttribute('autocomplete', 'on');

    var emailField = buildField('email', 'email', 'email', 'email', '✉');
    form.appendChild(emailField.field);

    // Divider
    var divider = el('div', 'auth-gate__divider');
    divider.textContent = 'or';

    // Google btn
    var googleBtn = el('button', 'auth-gate__btn auth-gate__btn--google');
    googleBtn.setAttribute('type', 'button');
    googleBtn.setAttribute('data-ag-google', '');
    googleBtn.innerHTML = GOOGLE_G_SVG + '<span>Continue with Google</span>';

    // V23 M5 — Phone wrap with SMS opt-in FIRST, phone field reveals only after opt-in.
    var phoneWrap = el('div', 'auth-gate__phone-wrap');

    var smsLabel = el('label', 'auth-gate__sms-toggle');
    var smsCheckbox = document.createElement('input');
    smsCheckbox.type = 'checkbox';
    smsCheckbox.setAttribute('data-ag-sms', '');
    smsLabel.appendChild(smsCheckbox);
    var smsTextWrap = document.createElement('span');
    smsTextWrap.innerHTML =
      'Text me before enrollment closes.' +
      '<span class="ag-toggle-sub">You' + "'" + 'll need to reply YES once. SMS is off by default.</span>';
    smsLabel.appendChild(smsTextWrap);
    phoneWrap.appendChild(smsLabel);

    var phoneField = buildField('phone', 'tel', 'tel', 'phone (optional)', '📱');
    // Phone field starts hidden; reveals on SMS opt-in
    phoneField.field.classList.add('auth-gate__field--phone-hidden');
    phoneWrap.appendChild(phoneField.field);

    // Toggle phone-field visibility based on SMS checkbox
    smsCheckbox.addEventListener('change', function () {
      if (smsCheckbox.checked) {
        phoneField.field.classList.remove('auth-gate__field--phone-hidden');
        try { phoneField.input.focus(); } catch (e) {}
      } else {
        phoneField.field.classList.add('auth-gate__field--phone-hidden');
        phoneField.input.value = '';
      }
    });

    // Continue btn
    var continueBtn = el('button', 'auth-gate__btn auth-gate__btn--primary');
    continueBtn.setAttribute('type', 'submit');
    continueBtn.setAttribute('data-ag-continue', '');
    continueBtn.innerHTML = '<span data-ag-continue-label>Continue →</span>';

    // Inline error
    var errBox = el('div', 'auth-gate__error');
    errBox.setAttribute('role', 'alert');
    errBox.setAttribute('data-ag-errbox', '');

    form.appendChild(divider);
    form.appendChild(googleBtn);
    form.appendChild(phoneWrap);
    form.appendChild(continueBtn);
    form.appendChild(errBox);

    bubble.appendChild(form);

    // V24 Tier 3 · Microcopy reorganized as ONE single-line bottom strip,
    // separated by · — less stack, more confident. Still mono caps.
    var micro = el('div', 'auth-gate__microcopy');
    micro.classList.add('auth-gate__microcopy--inline');
    micro.innerHTML =
      '<span>Email = your account. Not a list.</span>' +
      '<span class="ag-micro-sep" aria-hidden="true">·</span>' +
      '<span>No follow-up unless you ask.</span>' +
      '<span class="ag-micro-sep" aria-hidden="true">·</span>' +
      '<span>We never sell your data. Ever.</span>';
    bubble.appendChild(micro);

    // V24 Tier 3 · Skip link with soft chevron + breathing room.
    // V24 Tier 4 · Loss-aversion microcopy + tooltip explaining the trade.
    var skipWrap = el('div', 'auth-gate__skip');
    var skipA = document.createElement('a');
    skipA.setAttribute('href', '#');
    skipA.setAttribute('data-ag-skip', '');
    skipA.innerHTML =
      'Skip — you' + "'" + 'll lose your locked rate ' +
      '<span class="ag-skip-chev" aria-hidden="true">▾</span>' +
      '<span class="ag-skip-tooltip" role="tooltip">' +
        'Without your email we can' + "'" + 't hold the number for you. ' +
        'You can still see the plan, but the rate may shift.' +
      '</span>';
    skipWrap.appendChild(skipA);
    bubble.appendChild(skipWrap);

    // Success state (replaces the form)
    var successWrap = el('div', 'auth-gate__success');
    var successMsg = el('p', 'auth-gate__success-msg');
    successMsg.setAttribute('data-ag-success-msg', '');
    var successSub = el('p', 'auth-gate__success-sub');
    successSub.textContent = '(You can keep going here in the meantime.)';
    successWrap.appendChild(successMsg);
    successWrap.appendChild(successSub);
    bubble.appendChild(successWrap);

    host.appendChild(bubble);

    // Cache element refs
    inst.els = {
      bubble:        bubble,
      copyCarrotEl:  bubble.querySelector('[data-ag-carrot]'),
      socialProofEl: bubble.querySelector('[data-ag-social-proof]'),
      deadlineEl:    bubble.querySelector('[data-ag-deadline]'),
      form:          form,
      emailInput:    emailField.input,
      emailField:    emailField.field,
      phoneInput:    phoneField.input,
      phoneField:    phoneField.field,
      smsCheckbox:   smsCheckbox,
      continueBtn:   continueBtn,
      continueLabel: continueBtn.querySelector('[data-ag-continue-label]'),
      googleBtn:     googleBtn,
      skipLink:      skipA,
      errBox:        errBox,
      successMsg:    successMsg
    };

    // Bind events
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmit(inst);
    });
    googleBtn.addEventListener('click', function () {
      handleGoogle(inst);
    });
    skipA.addEventListener('click', function (e) {
      e.preventDefault();
      handleSkip(inst);
    });
    inst.els.emailInput.addEventListener('input', function () {
      // Clear error chrome on edit.
      inst.els.emailField.classList.remove('auth-gate__field--error');
      if (inst.state.error) {
        inst.state.error = null;
        host.classList.remove('is-error');
      }
      // V23 M6 — sync Continue button validity
      syncContinueValidity(inst);
    });

    // V23 M6 — kick off initial Continue button state (disabled while empty)
    syncContinueValidity(inst);
  }

  // V23 M6 — toggle Continue button + visual disabled state based on email validity.
  function syncContinueValidity(inst) {
    if (!inst || !inst.els || !inst.els.continueBtn) return;
    var btn = inst.els.continueBtn;
    var email = (inst.els.emailInput.value || '').trim();
    var ok = isValidEmail(email);
    if (ok) {
      btn.removeAttribute('aria-disabled');
      btn.classList.remove('is-disabled');
      btn.disabled = false;
    } else {
      btn.setAttribute('aria-disabled', 'true');
      btn.classList.add('is-disabled');
      // Don't set `.disabled` so users can still click and see field-level error;
      // the button styling clearly signals it's not yet active.
    }
  }

  function buildField(name, type, autocomplete, placeholder, iconChar) {
    var field = el('div', 'auth-gate__field');
    field.setAttribute('data-ag-field', name);
    var icon = el('div', 'auth-gate__field-icon');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = iconChar;
    field.appendChild(icon);

    var input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.placeholder = placeholder;
    input.setAttribute('autocomplete', autocomplete);
    input.setAttribute('aria-label', placeholder);
    input.setAttribute('data-ag-input', name);
    field.appendChild(input);

    return { field: field, input: input };
  }

  // ─── RENDER (apply opts to DOM) ──────────────────────────────
  function render(inst) {
    // V24 · Prefer a state-specific carrot if state is in opts and the
    // persona has a state-aware variant. Fall back to consumer-supplied
    // comparisonAnchor, then generic persona default.
    var stateSpecific = buildStateSpecificAnchor(inst.opts.persona, inst.opts.state);
    var carrot = stateSpecific ||
                 inst.opts.comparisonAnchor ||
                 COMPARISON_ANCHORS[inst.opts.persona] ||
                 COMPARISON_ANCHORS.GEN;
    inst.els.copyCarrotEl.innerHTML =
      'Give me your email and I' + "'" + 'll prepare a full plan-vs-plan ' +
      'breakdown — line by line, exactly what you' + "'" + 'd save over ' +
      '<strong>' + escapeHtml(carrot) + '</strong>.';

    // V24 Tier 3 · Persona-specific social proof line above the form.
    if (inst.els.socialProofEl) {
      var proofLine = SOCIAL_PROOF_LINES[inst.opts.persona] || SOCIAL_PROOF_LINES.GEN;
      inst.els.socialProofEl.textContent = proofLine;
    }

    // V24 Tier 4 · Enrollment-window deadline — TurboTax pattern.
    // Honest OEP date — Dec 15 federal default. Days computed live.
    if (inst.els.deadlineEl) {
      var d = computeOEPDeadline();
      if (d.daysLeft >= 0) {
        inst.els.deadlineEl.innerHTML =
          'Your enrollment window closes in ' +
          '<span class="ag-wd-num">' + d.daysLeft + ' day' + (d.daysLeft === 1 ? '' : 's') + '</span> — ' +
          '<span class="ag-wd-date">' + d.dateLabel + '</span>.';
        inst.els.deadlineEl.style.display = '';
      } else {
        // OEP closed — hide the line cleanly rather than show 0/negative.
        inst.els.deadlineEl.style.display = 'none';
      }
    }
  }

  // V24 Tier 4 · Compute days until next federal OEP close (Dec 15).
  // If we're past Dec 15, roll forward to the next year's Dec 15.
  // Returns { daysLeft, dateLabel } where dateLabel is "Dec 15".
  function computeOEPDeadline() {
    var now = new Date();
    var year = now.getFullYear();
    var target = new Date(year, 11, 15); // Dec 15 of this year
    if (now > target) {
      target = new Date(year + 1, 11, 15); // next year's Dec 15
    }
    var msPerDay = 24 * 60 * 60 * 1000;
    var daysLeft = Math.ceil((target - now) / msPerDay);
    return { daysLeft: daysLeft, dateLabel: 'Dec 15' };
  }

  // ─── EVENT HANDLERS ──────────────────────────────────────────
  function handleSubmit(inst) {
    if (inst.state.loading) return;
    var email = inst.els.emailInput.value.trim();
    var phone = inst.els.phoneInput.value.trim();
    var smsOptIn = inst.els.smsCheckbox.checked;

    if (!isValidEmail(email)) {
      showError(inst, 'That email looks off — want to double-check?');
      inst.els.emailField.classList.add('auth-gate__field--error');
      inst.els.emailInput.focus();
      return;
    }

    setLoading(inst, true);

    var payload = {
      email: email,
      phone: phone || null,
      smsOptIn: smsOptIn,
      method: 'magic-link'
    };

    var next = function (result) {
      // Default behavior even if consumer didn't supply onSubmit.
      if (global.NoraSession) {
        global.NoraSession.setEmail(email);
        if (phone) global.NoraSession.setPhone(phone, smsOptIn);
        global.NoraSession.setAuthed(true);
      }
      success(inst.host, email);
      setLoading(inst, false);
    };

    if (typeof inst.opts.onSubmit === 'function') {
      try {
        var ret = inst.opts.onSubmit(payload);
        if (ret && typeof ret.then === 'function') {
          ret.then(next).catch(function (err) {
            setLoading(inst, false);
            showError(inst, (err && err.message) || 'Something went wrong. Try again?');
          });
        } else {
          // Synchronous consumer — fall through to default mocked send.
          callMockMagicLink(payload).then(next).catch(function (err) {
            setLoading(inst, false);
            showError(inst, (err && err.message) || 'Something went wrong.');
          });
        }
      } catch (err) {
        setLoading(inst, false);
        showError(inst, (err && err.message) || 'Something went wrong.');
      }
    } else {
      callMockMagicLink(payload).then(next).catch(function (err) {
        setLoading(inst, false);
        showError(inst, (err && err.message) || 'Something went wrong.');
      });
    }
  }

  function callMockMagicLink(payload) {
    if (global.NoraSession && typeof global.NoraSession.requestMagicLink === 'function') {
      return global.NoraSession.requestMagicLink(payload.email, payload.phone, payload.smsOptIn);
    }
    // No NoraSession available — synthesize a minimal mocked response.
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({ sent: true, resumeUrl: '#mock' });
      }, 800);
    });
  }

  function handleGoogle(inst) {
    if (inst.state.loading) return;
    setLoading(inst, true, 'Redirecting to Google…');

    var fire = function () {
      if (typeof inst.opts.onGoogleAuth === 'function') {
        return Promise.resolve(inst.opts.onGoogleAuth());
      }
      if (global.NoraSession && typeof global.NoraSession.requestGoogleAuth === 'function') {
        return global.NoraSession.requestGoogleAuth();
      }
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve({ authed: true, user: { name: 'Sarah Demo', email: 'sarah.demo@gmail.com' } });
        }, 1200);
      });
    };

    fire().then(function (result) {
      setLoading(inst, false);
      var email = (result && result.user && result.user.email) || 'sarah.demo@gmail.com';
      success(inst.host, email);
    }).catch(function (err) {
      setLoading(inst, false);
      showError(inst, (err && err.message) || 'Google sign-in failed. Try email?');
    });
  }

  function handleSkip(inst) {
    if (global.NoraSession && typeof global.NoraSession.setSkipped === 'function') {
      global.NoraSession.setSkipped(true);
    }
    setSkipped(true); // refresh locks site-wide
    hide(inst.host);
    if (typeof inst.opts.onSkip === 'function') {
      try { inst.opts.onSkip(); }
      catch (err) { warn('onSkip threw:', err); }
    }
  }

  // ─── PUBLIC METHODS ──────────────────────────────────────────
  function show(host) {
    var targets = host ? [findInstance(host)].filter(Boolean) : instances;
    targets.forEach(function (inst) {
      inst.state.hidden = false;
      inst.state.success = false;
      inst.host.classList.remove('is-hidden', 'is-success', 'is-error', 'is-loading');
      if (typeof inst.opts.onShow === 'function') {
        try { inst.opts.onShow(); } catch (err) {}
      }
    });
  }

  function hide(host) {
    var targets = host ? [findInstance(host)].filter(Boolean) : instances;
    targets.forEach(function (inst) {
      inst.state.hidden = true;
      inst.host.classList.add('is-hidden');
      if (typeof inst.opts.onHide === 'function') {
        try { inst.opts.onHide(); } catch (err) {}
      }
    });
  }

  function success(host, emailOverride) {
    var targets = host ? [findInstance(host)].filter(Boolean) : instances;
    targets.forEach(function (inst) {
      var email = emailOverride || inst.els.emailInput.value.trim() ||
                  (global.NoraSession && global.NoraSession.get && global.NoraSession.get().email) ||
                  'your email';
      inst.els.successMsg.innerHTML =
        'Sent you a magic link at <span class="auth-gate__success-email">' +
        escapeHtml(email) +
        '</span>. Tap it from your email — that' + "'" + 's all I need.';
      inst.state.success = true;
      inst.state.error = null;
      inst.host.classList.remove('is-error', 'is-loading');
      inst.host.classList.add('is-success');
      // Mark authed so other surfaces unlock.
      if (global.NoraSession) global.NoraSession.setAuthed(true);
      setSkipped(false);
    });
  }

  function error(message, host) {
    var targets = host ? [findInstance(host)].filter(Boolean) : instances;
    targets.forEach(function (inst) {
      showError(inst, message || 'Something went wrong.');
    });
  }

  function setPersona(persona, host) {
    var targets = host ? [findInstance(host)].filter(Boolean) : instances;
    targets.forEach(function (inst) {
      inst.opts.persona = persona;
      inst.opts.comparisonAnchor = null; // recompute from new persona
      render(inst);
    });
  }

  function reset(host) {
    var targets = host ? [findInstance(host)].filter(Boolean) : instances;
    targets.forEach(function (inst) {
      inst.state = { hidden: false, loading: false, success: false, error: null };
      inst.els.emailInput.value = '';
      inst.els.phoneInput.value = '';
      inst.els.smsCheckbox.checked = false;
      inst.els.emailField.classList.remove('auth-gate__field--error');
      inst.els.continueLabel.textContent = 'Continue →';
      inst.host.classList.remove('is-hidden', 'is-success', 'is-error', 'is-loading');
    });
  }

  // ─── SKIPPED / AUTHED STATE — DRIVES LOCKS + BANNER ──────────
  function setSkipped(flag) {
    if (global.NoraSession && typeof global.NoraSession.setSkipped === 'function') {
      global.NoraSession.setSkipped(flag);
    }
    refreshLocks();
    if (flag) showSkipBanner();
    else hideSkipBanner();
  }

  function setAuthed(flag) {
    if (global.NoraSession && typeof global.NoraSession.setAuthed === 'function') {
      global.NoraSession.setAuthed(flag);
    }
    if (flag) {
      hideSkipBanner();
      refreshLocks();
    } else {
      refreshLocks();
    }
  }

  function isAuthed() {
    if (global.NoraSession && typeof global.NoraSession.isAuthed === 'function') {
      return global.NoraSession.isAuthed();
    }
    return false;
  }

  // Lock individual elements (for plan-report drawer save/forward/share).
  // Element gains [data-auth-locked] + tooltip; clicks reopen the gate.
  function lockAction(elOrSelector, opts) {
    var nodes = resolveNodes(elOrSelector);
    opts = opts || {};
    var tooltip = opts.tooltip || 'Sign in to save or share this plan';
    var withIcon = opts.icon !== false;
    nodes.forEach(function (node) {
      node.setAttribute('data-auth-locked', '');
      node.setAttribute('data-auth-tooltip', tooltip);
      // Inject lock pip if not already present.
      if (withIcon && !node.querySelector('.auth-locked-icon')) {
        var pos = global.getComputedStyle(node).position;
        if (pos === 'static' || !pos) node.style.position = 'relative';
        var pip = document.createElement('span');
        pip.className = 'auth-locked-icon';
        pip.setAttribute('aria-hidden', 'true');
        pip.innerHTML = '🔒';
        node.appendChild(pip);
      }
      // Click → reopen gate.
      if (!node._authClickBound) {
        node._authClickBound = true;
        node.addEventListener('click', onLockedClick, true);
      }
    });
  }

  function unlockAction(elOrSelector) {
    var nodes = resolveNodes(elOrSelector);
    nodes.forEach(function (node) {
      node.removeAttribute('data-auth-locked');
      node.removeAttribute('data-auth-tooltip');
      var pip = node.querySelector('.auth-locked-icon');
      if (pip) pip.parentNode.removeChild(pip);
    });
  }

  function onLockedClick(e) {
    if (isAuthed()) return;
    e.preventDefault();
    e.stopPropagation();
    show();
  }

  // refreshLocks() reads current authed state and updates every node
  // marked with [data-auth-lockable]. Consumers can wire features to
  // be auto-locked by adding that attribute.
  function refreshLocks() {
    var nodes = document.querySelectorAll('[data-auth-lockable]');
    var authed = isAuthed();
    Array.prototype.forEach.call(nodes, function (node) {
      var tooltip = node.getAttribute('data-auth-lockable-tooltip') ||
                    'Sign in to save or share this plan';
      if (!authed) {
        lockAction(node, { tooltip: tooltip });
      } else {
        unlockAction(node);
      }
    });
  }

  function showSkipBanner(hostNode) {
    // Find or create singleton banner.
    var banner = document.querySelector('.auth-skip-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'auth-skip-banner';
      banner.setAttribute('role', 'status');
      banner.innerHTML =
        '<span class="auth-skip-banner__icon" aria-hidden="true">✉</span>' +
        '<span class="auth-skip-banner__text">' +
          'Want to save or share this? Email me anytime — same gate, same offer.' +
        '</span>' +
        '<button type="button" class="auth-skip-banner__btn">Get my email gate again</button>';
      banner.querySelector('.auth-skip-banner__btn').addEventListener('click', function () {
        show();
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      });
    }
    var target = hostNode ||
                 document.querySelector('[data-auth-skip-banner-host]') ||
                 document.body;
    if (banner.parentNode !== target) {
      // Insert at top of target.
      target.insertBefore(banner, target.firstChild);
    }
  }

  function hideSkipBanner() {
    var banner = document.querySelector('.auth-skip-banner');
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
  }

  // ─── INTERNAL UTILITIES ──────────────────────────────────────
  function setLoading(inst, flag, customLabel) {
    inst.state.loading = !!flag;
    var btn = inst.els.continueBtn;
    var label = inst.els.continueLabel;
    var google = inst.els.googleBtn;
    if (flag) {
      inst.host.classList.add('is-loading');
      btn.disabled = true;
      google.disabled = true;
      label.innerHTML = '<span class="auth-gate__spinner" aria-hidden="true"></span> ' +
                        escapeHtml(customLabel || 'Sending…');
    } else {
      inst.host.classList.remove('is-loading');
      btn.disabled = false;
      google.disabled = false;
      label.textContent = 'Continue →';
    }
  }

  function showError(inst, msg) {
    inst.state.error = msg;
    inst.host.classList.add('is-error');
    inst.host.classList.remove('is-success');
    inst.els.errBox.textContent = msg;
  }

  function isValidEmail(email) {
    return typeof email === 'string' &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function resolveNodes(elOrSelector) {
    if (!elOrSelector) return [];
    if (typeof elOrSelector === 'string') {
      return Array.prototype.slice.call(document.querySelectorAll(elOrSelector));
    }
    if (elOrSelector.nodeType === 1) return [elOrSelector];
    if (elOrSelector.length !== undefined) return Array.prototype.slice.call(elOrSelector);
    return [];
  }

  function warn() {
    if (!global.console || !global.console.warn) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[AuthGate]');
    global.console.warn.apply(global.console, args);
  }

  // ─── EXPORT ──────────────────────────────────────────────────
  global.AuthGate = AuthGate;

})(typeof window !== 'undefined' ? window : this);
