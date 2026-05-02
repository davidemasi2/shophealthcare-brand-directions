/* =============================================================
   NORA APP — Milestone 1
   - URL param parsing (?p=&s=&a=&x=&pg=&c=)
   - persona-strings.json fetch + resolution (RU1/SP1/BR1/CL1/PC1/GEN)
   - persona-tagged opener that echoes URL params back
   - Mock 4-step scripted conversation (name → ZIP → DOB → conditions → "finalizing…")
   - Mobile tab nav between zones
   - prefers-reduced-motion honored
   ============================================================= */
(function () {
  'use strict';

  // -----------------------------------------------------------
  // 0. Config
  // -----------------------------------------------------------
  var VALID_PERSONAS = ['RU1', 'SP1', 'BR1', 'CL1', 'PC1', 'GEN'];
  var REDUCED_MOTION = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Plan estimates per persona (used for dashboard initial state)
  // Catalog overrides apply when pg=1 or conditions=pregnancy
  var PERSONA_NUMBERS = {
    RU1: { plan: 290, compare: 890, label: 'Open-market PPO' },
    SP1: { plan: 290, compare: 890, label: 'Open-market freelancer PPO' },
    BR1: { plan: 520, compare: 1180, label: 'Open-market typical premium' },
    CL1: { plan: 290, compare: 890, label: 'Your renewal premium' },
    PC1: { plan: 290, compare: 680, label: 'What others in your bracket pay' },
    GEN: { plan: 290, compare: 760, label: 'Typical premium for your situation' }
  };
  var CATALOG_NUMBERS = { plan: 520, compare: 890, label: 'Open-market typical PPO' };

  var STATE_NAMES = {
    AL:'Alabama', AK:'Alaska', AZ:'Arizona', AR:'Arkansas', CA:'California',
    CO:'Colorado', CT:'Connecticut', DE:'Delaware', FL:'Florida', GA:'Georgia',
    HI:'Hawaii', ID:'Idaho', IL:'Illinois', IN:'Indiana', IA:'Iowa',
    KS:'Kansas', KY:'Kentucky', LA:'Louisiana', ME:'Maine', MD:'Maryland',
    MA:'Massachusetts', MI:'Michigan', MN:'Minnesota', MS:'Mississippi', MO:'Missouri',
    MT:'Montana', NE:'Nebraska', NV:'Nevada', NH:'New Hampshire', NJ:'New Jersey',
    NM:'New Mexico', NY:'New York', NC:'North Carolina', ND:'North Dakota', OH:'Ohio',
    OK:'Oklahoma', OR:'Oregon', PA:'Pennsylvania', RI:'Rhode Island', SC:'South Carolina',
    SD:'South Dakota', TN:'Tennessee', TX:'Texas', UT:'Utah', VT:'Vermont',
    VA:'Virginia', WA:'Washington', WV:'West Virginia', WI:'Wisconsin', WY:'Wyoming',
    DC:'District of Columbia'
  };

  // -----------------------------------------------------------
  // 1. URL param parsing — fall back gracefully
  // -----------------------------------------------------------
  function parseContext() {
    var params = new URLSearchParams(window.location.search);

    // persona (uppercase), validated against whitelist
    var rawP = (params.get('p') || '').toUpperCase();
    var persona = VALID_PERSONAS.indexOf(rawP) !== -1 ? rawP : 'GEN';

    // state — 2-char uppercase code, must be a known US state
    var rawS = (params.get('s') || '').toUpperCase();
    var state = STATE_NAMES[rawS] ? rawS : null;

    // age — integer 18–65
    var rawA = parseInt(params.get('a'), 10);
    var age = (rawA >= 18 && rawA <= 65) ? rawA : null;

    // sex — M/F
    var rawX = (params.get('x') || '').toUpperCase();
    var sex = (rawX === 'M' || rawX === 'F') ? rawX : null;

    // pregnancy — 0/1 (bool)
    var pregnancy = params.get('pg') === '1';

    // conditions — none|managed|utilization|pregnancy
    var rawC = (params.get('c') || '').toLowerCase();
    var validC = ['none', 'managed', 'utilization', 'pregnancy'];
    var conditions = validC.indexOf(rawC) !== -1 ? rawC : 'none';

    // pregnancy flag in conditions implies the routing too
    if (conditions === 'pregnancy') pregnancy = true;

    return { persona: persona, state: state, age: age, sex: sex, pregnancy: pregnancy, conditions: conditions };
  }

  // -----------------------------------------------------------
  // 2. Load persona-strings.json (graceful fallback if blocked)
  // -----------------------------------------------------------
  // Inline fallback mirrors persona-strings.json verbatim; used when the
  // file:// protocol or a fetch error blocks the JSON from loading. The
  // JSON file is the canonical source — this is the safety net only.
  var FALLBACK_STRINGS = {
    RU1: {
      label: "Just lost insurance",
      noraOpener: "Let's get you back on coverage fast. Your plan can be active in 24 hours.",
      reinforce: "You just got hit. The system failed you. We can have you covered by your start date.",
      revealReinforce: "You just got hit. Here's what coverage looks like by your start date — no gap.",
      dashboardHeadline: "Coverage in 24 hours.",
      comparisonAnchor: "what your monthly premium will be once you're back on coverage",
      hasCurrentCoverage: false,
      cardScanStrategy: "assume_recent",
      cardScanOffer: "Have your old card? 10 seconds to show what stays vs what changes."
    },
    SP1: {
      label: "Self-employed / 1099",
      noraOpener: "37% of self-employed people in your bracket save the most on the right plan. Let me show you what that looks like for you.",
      reinforce: "You're 1099 — and most freelancers don't realize this kind of plan exists. It was built for self-employed people with irregular income.",
      revealReinforce: "You're 1099 — and most freelancers don't realize the plan we'd write you was built for them. Here's your real number.",
      dashboardHeadline: "Built for irregular income.",
      comparisonAnchor: "what most freelancers pay on the open market",
      hasCurrentCoverage: "maybe",
      cardScanStrategy: "neutral_ask",
      cardScanOffer: "Quick one — do you have current insurance you're shopping against?"
    },
    BR1: {
      label: "Pre-65 bridge years",
      noraOpener: "5+ years from your transition is the costliest stretch. Let's bridge it without the premium spike.",
      reinforce: "You're in the longest, most expensive insurance gap of your life. The plan we'd write you was designed for exactly this window.",
      revealReinforce: "The plan we'd write you was designed for exactly this window. Here's what bridging the gap really costs.",
      dashboardHeadline: "Bridge the gap.",
      comparisonAnchor: "what you'd pay on the open market for bridge coverage",
      hasCurrentCoverage: "usually",
      cardScanStrategy: "assume_have",
      cardScanOffer: "Got your current card? I'll show the bridge math against what you have."
    },
    CL1: {
      label: "My premium just spiked",
      noraOpener: "Let me see your current premium and show you the actual delta.",
      reinforce: "Your renewal letter is real. Most renewals jumped 26–114%. Our number sits 50–60% under what you're being asked to pay now.",
      revealReinforce: "Your renewal letter is real. Here's what our number looks like next to it — same network, lower premium.",
      dashboardHeadline: "Your renewal vs. our number.",
      comparisonAnchor: "your renewal premium — the one that just spiked",
      hasCurrentCoverage: true,
      cardScanStrategy: "assume_have",
      cardScanOffer: "Want me to read your current card and show what your renewal actually changes?"
    },
    PC1: {
      label: "Check if I'm overpaying",
      noraOpener: "Worst case: your plan's fine and you saved 60 seconds. Let me run the check.",
      reinforce: "Most people are. About 6 in 10 we check are paying for things they'll never use.",
      revealReinforce: "About 6 in 10 we check are paying for things they'll never use. Here's where you actually land.",
      dashboardHeadline: "Plan diagnostic.",
      comparisonAnchor: "whether your current plan is the best deal in your state",
      hasCurrentCoverage: true,
      cardScanStrategy: "assume_have",
      cardScanOffer: "Scan your card — I'll check coverage parity for your conditions before we shop."
    },
    GEN: {
      label: "Not sure",
      noraOpener: "Let me ask 3 things and tell you which path makes sense.",
      reinforce: "Most common answer we get. Most people have no idea what they're actually paying for.",
      revealReinforce: "Most people don't know what they're actually paying for. Here's your real number — and what's hiding behind it.",
      dashboardHeadline: "Routing your numbers.",
      comparisonAnchor: "the typical premium for someone in your situation",
      hasCurrentCoverage: "unknown",
      cardScanStrategy: "neutral_ask",
      cardScanOffer: "Quick gut-check — do you have current insurance you're shopping against?"
    }
  };

  function loadPersonaStrings() {
    return fetch('persona-strings.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .catch(function () { return FALLBACK_STRINGS; });
  }

  // -----------------------------------------------------------
  // 3. DOM helpers
  // -----------------------------------------------------------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, opts) {
    var node = document.createElement(tag);
    if (opts) {
      if (opts.cls)  node.className = opts.cls;
      if (opts.html != null) node.innerHTML = opts.html;
      if (opts.text != null) node.textContent = opts.text;
      if (opts.attrs) Object.keys(opts.attrs).forEach(function (k) { node.setAttribute(k, opts.attrs[k]); });
    }
    return node;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
  function timeStamp() {
    var d = new Date();
    var h = d.getHours(); var m = d.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + (m < 10 ? '0' + m : m) + ' ' + ampm;
  }

  // -----------------------------------------------------------
  // 4. Chat rendering
  // -----------------------------------------------------------
  var scrollEl;
  var qrEl;
  var inputEl;
  var formEl;

  function scrollToBottom() {
    if (!scrollEl) return;
    requestAnimationFrame(function () {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    });
  }

  function appendMessage(opts) {
    // opts: { from: 'nora'|'user', html, isAha }
    var msg = el('div', { cls: 'nx-msg from-' + opts.from });
    var avatar = el('div', { cls: 'nx-msg-avatar', text: opts.from === 'nora' ? 'N' : 'U' });
    var bubWrap = el('div');
    var bub = el('div', { cls: 'nx-bub' + (opts.isAha ? ' is-aha' : '') });
    bub.innerHTML = opts.html;
    var ts = el('span', { cls: 'nx-ts', text: timeStamp() });
    bubWrap.appendChild(bub);
    bubWrap.appendChild(ts);
    msg.appendChild(avatar);
    msg.appendChild(bubWrap);
    scrollEl.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  function appendTypingIndicator(statusText) {
    var msg = el('div', { cls: 'nx-msg from-nora' });
    var avatar = el('div', { cls: 'nx-msg-avatar', text: 'N' });
    var bub = el('div', { cls: 'nx-bub' });
    // V24 Tier 6 · Optional inline status text — appears on long Nora
    // pauses (>1.2s). "Pulling carrier rates…" / "Cross-referencing your
    // state's rules…" — makes the wait feel like work being done.
    if (statusText) {
      var status = el('span', { cls: 'nx-typing-status', text: statusText });
      bub.appendChild(status);
      // Fade in immediately on next paint
      requestAnimationFrame(function () { status.classList.add('is-visible'); });
    }
    var dots = document.createElement('span');
    dots.className = 'nx-typing';
    dots.innerHTML = '<span></span><span></span><span></span>';
    bub.appendChild(dots);
    msg.appendChild(avatar);
    msg.appendChild(bub);
    scrollEl.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  function setQuickReplies(options, onPick) {
    qrEl.innerHTML = '';
    if (!options || !options.length) return;
    options.forEach(function (opt) {
      var btn = el('button', { cls: 'nx-qr', text: opt.label, attrs: { type: 'button' } });
      btn.addEventListener('click', function () {
        clearQuickReplies();
        onPick(opt);
      });
      qrEl.appendChild(btn);
    });
  }
  function clearQuickReplies() { qrEl.innerHTML = ''; }

  // -----------------------------------------------------------
  // 5. Mock Nora — scripted 4-step conversation
  // -----------------------------------------------------------
  var ctx;          // URL context
  var personaCfg;  // persona-strings entry
  var convoState = { step: 'opener-questions' };

  // Estimates: 800–1500ms typing latency, plus a 250–400ms read pause
  function noraSay(html, opts) {
    opts = opts || {};
    var rawDelay = opts.delay != null ? opts.delay : (800 + Math.random() * 700);
    var delay = REDUCED_MOTION ? 50 : Math.min(1500, rawDelay);
    // V24 Tier 6 · Use inline status text on long pauses (>=1200ms).
    // Pulled from opts.statusText OR auto-rotated from a generic pool.
    var statusText = null;
    if (!REDUCED_MOTION && delay >= 1200) {
      statusText = opts.statusText ||
        NORA_TYPING_STATUS[Math.floor(Math.random() * NORA_TYPING_STATUS.length)];
    }
    var typing = appendTypingIndicator(statusText);
    setTimeout(function () {
      // Defensive: if the typing node was already removed (race / re-init),
      // skip removal but still append the message so the opener lands.
      if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
      appendMessage({ from: 'nora', html: html, isAha: !!opts.isAha });
      if (opts.then) opts.then();
    }, delay);
  }
  // V24 Tier 6 · Inline status text pool — sparingly auto-injected on
  // long Nora typing pauses to make the wait feel deliberate.
  var NORA_TYPING_STATUS = [
    'Pulling carrier rates…',
    'Cross-referencing your state’s rules…',
    'Checking eligibility…',
    'Matching your network…'
  ];

  function userSay(html) {
    appendMessage({ from: 'user', html: html });
  }

  // Persona-tagged opener — echoes URL params back, then asks first question
  function buildOpener() {
    var pieces = [];
    if (ctx.state) pieces.push(STATE_NAMES[ctx.state]);
    if (ctx.age != null) pieces.push(String(ctx.age));
    if (ctx.sex) pieces.push(ctx.sex === 'M' ? 'male' : 'female');
    if (ctx.pregnancy) pieces.push('pregnancy planned');

    var echo;
    if (pieces.length) {
      echo = "I see " + pieces.join(' · ') + ". ";
    } else {
      echo = "Hi — I'm Nora. ";
    }

    // Pregnancy override: route to Catalog
    if (ctx.pregnancy) {
      return echo +
        "The plan we'd usually write doesn't cover maternity, so I'm routing you to a product line that does — same shop, different plan. " +
        "Let me ask a few things. First — what's your name?";
    }

    // Otherwise pull persona-tagged opener from persona-strings.json.
    // The persona string may already end with a "Let me…" sentence — only
    // append the lock-it-in line if it doesn't already lead the user there.
    var opener = personaCfg.noraOpener || '';
    var followup = /\blet me\b/i.test(opener)
      ? " A few quick questions to lock it in. First — what's your name?"
      : " Let me ask a few quick questions to lock it in. First — what's your name?";
    return echo + escapeHtml(opener) + followup;
  }

  function startConversation() {
    // V24 Tier 6 · Pre-opener context-gathering line. During the 1.2s
    // pre-opener delay, surface a subtle "Nora is gathering your
    // context…" mono-caps row above where the message will land. Fades
    // out as Nora's actual message appears.
    if (!REDUCED_MOTION && scrollEl) {
      var preOpener = el('div', { cls: 'nx-pre-opener', text: 'Nora is gathering your context' });
      scrollEl.appendChild(preOpener);
      requestAnimationFrame(function () {
        preOpener.classList.add('is-visible');
      });
      setTimeout(function () {
        preOpener.classList.remove('is-visible');
        preOpener.classList.add('is-fading');
        setTimeout(function () {
          if (preOpener.parentNode) preOpener.parentNode.removeChild(preOpener);
        }, 320);
      }, 1100);
    }
    // Step 0 — persona-tagged opener (first question is name)
    // V24 Tier 5 — opener delay aligned with stage-curtain timing.
    // Stage finishes at T+1180ms; typing-dots appear T+1180ms, message
    // fully renders ~T+1500ms. Reduced motion: 50ms (legacy fast path).
    noraSay(buildOpener(), {
      delay: REDUCED_MOTION ? 50 : 1180,
      then: function () {
        // No quick replies for an open name field — just text input
        setInputPlaceholder("Type your first name…");
        convoState.step = 'awaiting-name';
        // V25 · HERO entry — assume_have / assume_recent personas get a
        // card-scan offer right after the opener. Parallel to the name
        // field; user can take either path.
        maybeOfferCardScan('opener');
      }
    });
  }

  function handleUserInput(text) {
    text = (text || '').trim();
    if (!text) return;

    if (convoState.step === 'awaiting-name') {
      userSay(escapeHtml(text));
      updateFact('name', text);
      convoState.name = text;
      askForZip(text);
      return;
    }

    if (convoState.step === 'awaiting-zip') {
      userSay(escapeHtml(text));
      // Light validation — pull first 5 digits if present
      var digits = (text.match(/\d/g) || []).join('').slice(0, 5);
      var zipShown = digits.length === 5 ? digits : text;
      updateFact('zip', zipShown);
      askForDob();
      return;
    }

    if (convoState.step === 'awaiting-dob') {
      userSay(escapeHtml(text));
      updateFact('dob', text);
      askForConditions();
      return;
    }

    if (convoState.step === 'awaiting-conditions-text') {
      userSay(escapeHtml(text));
      updateFact('conditions', text);
      // V25 · MID-DISCOVERY entry — neutral_ask personas (SP1 / GEN) get
      // the gating question here. Other strategies fall through directly.
      maybeOfferCardScan('mid-discovery', presentAuthGate);
      return;
    }

    // Fallback — any text after finalize is acknowledged but no advance
    if (convoState.step === 'finalized') {
      userSay(escapeHtml(text));
      noraSay("Got it. Hang tight — we'll pick this back up the moment your real quote lands. <span class='nx-mute'>(Milestone 2 wires this to a live backend.)</span>");
      return;
    }
  }

  // -----------------------------------------------------------
  // V25 · OCR card-scan integration
  // -----------------------------------------------------------
  // Persona-keyed entry strategy. Every persona gets the offer; persona
  // governs WHEN (hero vs mid-discovery vs on-demand) and HOW it's framed
  // (assume_have vs assume_recent vs neutral_ask).
  //
  //   assume_have   → CL1, BR1, PC1 — almost certainly has current insurance
  //   assume_recent → RU1            — just lost coverage, has old card
  //   neutral_ask   → SP1, GEN       — mixed reality, ask before offering
  //   on_demand     → (none default) — only available via dashboard footer
  //
  // SP1 (1099) is `neutral_ask`, NOT `none` — freelancers may or may not
  // have current insurance (self-paid ACA, partner's plan, COBRA, none).

  function maybeOfferCardScan(stage, onContinue) {
    var done = function () {
      if (typeof onContinue === 'function') {
        try { onContinue(); } catch (e) {}
      }
    };
    if (window.NORA_OCR_BASELINE || convoState.ocrOffered) {
      done();
      return false;
    }
    var strategy = (personaCfg && personaCfg.cardScanStrategy) || 'on_demand';

    if (stage === 'opener' && (strategy === 'assume_have' || strategy === 'assume_recent')) {
      offerCardScan({ mode: 'direct', afterDelay: 1500, onContinue: onContinue });
      return true;
    }
    if (stage === 'mid-discovery' && strategy === 'neutral_ask') {
      offerCardScan({ mode: 'ask', afterDelay: 700, onContinue: onContinue });
      return true;
    }
    done();
    return false;
  }

  function offerCardScan(opts) {
    opts = opts || {};
    convoState.ocrOffered = true;

    var prompt = (personaCfg && personaCfg.cardScanOffer) ||
      'Have your current card? I can show you exactly what changes.';

    var fireContinue = function () {
      if (typeof opts.onContinue === 'function') {
        try { opts.onContinue(); } catch (e) {}
      }
    };

    noraSay(escapeHtml(prompt), {
      delay: typeof opts.afterDelay === 'number' ? opts.afterDelay : 600,
      then: function () {
        var replies = (opts.mode === 'ask') ? [
          { label: 'Yes — let me show you', value: '__ocr_yes' },
          { label: "No, I'm fresh",         value: '__ocr_no' },
          { label: 'Not sure',              value: '__ocr_unsure' }
        ] : [
          { label: 'Snap your card →',      value: '__ocr_yes' },
          { label: 'Skip for now',          value: '__ocr_no' }
        ];
        setQuickReplies(replies, function (pick) {
          clearQuickReplies();
          userSay(escapeHtml(pick.label));
          if (pick.value === '__ocr_yes') {
            openOCRCapture({ onContinue: opts.onContinue });
          } else if (pick.value === '__ocr_no') {
            if (opts.mode === 'ask') {
              noraSay("No problem — I'll work from state typicals.", {
                delay: REDUCED_MOTION ? 50 : 500,
                then: fireContinue
              });
            } else {
              setTimeout(fireContinue, REDUCED_MOTION ? 50 : 250);
            }
          } else if (pick.value === '__ocr_unsure') {
            noraSay("No worries. We'll work from state typicals — and you can always upload from the dashboard later.", {
              delay: REDUCED_MOTION ? 50 : 500,
              then: fireContinue
            });
          }
        });
      }
    });
  }

  function openOCRCapture(opts) {
    opts = opts || {};
    var fireContinue = function () {
      if (typeof opts.onContinue === 'function') {
        try { opts.onContinue(); } catch (e) {}
      }
    };
    if (!window.OCRCapture || typeof window.OCRCapture.show !== 'function') {
      fireContinue();
      return;
    }
    window.OCRCapture.show({
      persona: ctx.persona || 'GEN',
      onConfirm: function (card) {
        // Avoid "Aetna Aetna Silver 5500" duplication when plan_name
        // already includes the carrier brand. Show plan_name when it
        // contains the carrier; otherwise show "carrier · plan_name".
        var displayName = ocrDisplayName(card);
        var line = '<strong>' + escapeHtml(displayName) +
          ' · $' + card.monthly_premium + '/mo</strong>. Rolling that into your numbers.';
        noraSay(line, {
          delay: REDUCED_MOTION ? 50 : 600,
          then: fireContinue
        });
        applyOCRBaselineToDash(card);
      },
      onSkip: function () {
        setTimeout(fireContinue, REDUCED_MOTION ? 50 : 200);
      }
    });
  }

  function ocrDisplayName(card) {
    if (!card) return '';
    var carrier = card.carrier || '';
    var planName = card.plan_name || '';
    if (!planName) return carrier;
    if (!carrier) return planName;
    // If plan_name already contains the carrier (case-insensitive), show
    // plan_name alone — otherwise concatenate with a separator.
    if (planName.toLowerCase().indexOf(carrier.toLowerCase()) !== -1) {
      return planName;
    }
    return carrier + ' · ' + planName;
  }

  function applyOCRBaselineToDash(card) {
    // 1) Add/update "Current plan" row in dashboard fact list
    var knownList = document.getElementById('known-list');
    if (knownList) {
      var existing = knownList.querySelector('[data-key="current-plan"]');
      var bodyHtml = '<span class="nx-known-mark" aria-hidden="true">✓</span>' +
                     '<span class="nx-known-text">Current: <b>' +
                     escapeHtml(ocrDisplayName(card)) +
                     ' · $' + card.monthly_premium + '/mo</b></span>';
      if (existing) {
        existing.innerHTML = bodyHtml;
      } else {
        var li = document.createElement('li');
        li.className = 'known-item is-confirmed';
        li.setAttribute('data-key', 'current-plan');
        li.innerHTML = bodyHtml;
        knownList.insertBefore(li, knownList.firstChild);
      }
    }
    // 2) Trigger Trail re-render to pick up new value-pill context
    if (window.UnlockTrail && typeof window.UnlockTrail.update === 'function') {
      try { window.UnlockTrail.update({}); } catch (e) {}
    }
    // 3) If plan-cards already mounted, re-mount to surface savings deltas
    if (planCardsApi && window.MOCK_NORA_RESPONSE) {
      var pcEl = document.querySelector('[data-plan-cards]');
      if (pcEl) {
        try {
          window.PlanCards.mount(pcEl, { planSet: window.MOCK_NORA_RESPONSE });
        } catch (e) {}
      }
    }
    // 4) If plan-report already mounted, re-mount so Mode 2A/2B selection updates
    if (planReportApi && window.MOCK_NORA_RESPONSE) {
      var prEl = document.getElementById('drawer-content');
      if (prEl && prEl.style.display !== 'none') {
        // Re-mount with same selectedPlanId — Tier 4b will swap to Mode 2B
        var firstPlan = (window.MOCK_NORA_RESPONSE.plans || [])
          .filter(function (p) { return p.tier === 'recommended'; })[0] ||
          window.MOCK_NORA_RESPONSE.plans[0];
        if (firstPlan) {
          try {
            window.PlanReport.mount(prEl, {
              planSet: window.MOCK_NORA_RESPONSE,
              selectedPlanId: firstPlan.plan_id,
              skipped: window.NoraSession && window.NoraSession.isSkipped ? window.NoraSession.isSkipped() : false
            });
          } catch (e) {}
        }
      }
    }
  }

  function askForZip(name) {
    setInputPlaceholder("Type your ZIP…");
    var firstName = (name || '').split(' ')[0] || name;
    // V24 · Reveal ValueStack now that the user has identified themselves.
    // Post-name-bind reveal lands the dramatic moment when there's a
    // person to attach it to.
    mountValueStackAfterName();
    noraSay("Thanks, " + escapeHtml(firstName) + ". What's your ZIP code? I use it to pull the right network and rate.", {
      then: function () { convoState.step = 'awaiting-zip'; }
    });
  }

  // V24 · ValueStack reveal — fires after the user binds their first name.
  // Idempotent: re-calls are silently no-ops.
  function mountValueStackAfterName() {
    var vsHost = $('#dashValueStack');
    if (!vsHost || !window.ValueStack) return;
    if (vsHost.dataset.vsMounted === '1') return;
    var nums = currentNumbers();
    try {
      valueStackApi = window.ValueStack.mount(vsHost, {
        persona: ctx.pregnancy ? 'GEN' : (ctx.persona || 'GEN'),
        primary:   { value: nums.plan,                suffix: '/mo',  label: ctx.pregnancy ? 'Catalog estimate' : 'Your estimate' },
        secondary: { value: nums.plan * 12,           suffix: '/yr',  label: "That's annual" },
        tertiary:  { value: (nums.compare - nums.plan) * 12, suffix: ' saved/yr', label: nums.label, direction: 'down' },
        compareValue: nums.compare,
        autoplayOnVisible: true,
        isEstimate: true,
        locked: false
      });
      vsHost.dataset.vsMounted = '1';
      // V26 · Layout transition — name bound, ValueStack revealed → PRICE phase
      // (Dashboard takes lead; chat condenses to support column.)
      if (window.LayoutDirector) {
        try { window.LayoutDirector.setLayoutPhase('price'); } catch (e) {}
      }
    } catch (e) { /* Value Stack non-critical; continue */ }
  }

  function askForDob() {
    setInputPlaceholder("MM/DD/YYYY…");
    noraSay("Got it. What's your date of birth? <span class='nx-mute'>(MM/DD/YYYY)</span>", {
      then: function () { convoState.step = 'awaiting-dob'; }
    });
  }

  function askForConditions() {
    setInputPlaceholder("Type or pick an option above…");
    noraSay("Last big one — anything I should know about your health? Pick what's closest, or tell me in your own words.", {
      then: function () {
        convoState.step = 'awaiting-conditions-text';
        setQuickReplies([
          { label: 'Nothing major',     value: 'none' },
          { label: 'Managed condition', value: 'managed' },
          { label: 'Higher utilization', value: 'utilization' },
          { label: 'Prefer to type',    value: '__free' }
        ], function (pick) {
          if (pick.value === '__free') {
            // Just open the field — user types
            setInputPlaceholder("Type a quick note…");
            return;
          }
          userSay(escapeHtml(pick.label));
          updateFact('conditions', pick.label);
          // V25 · MID-DISCOVERY entry — neutral_ask personas get the
          // gating question; other strategies pass through to AuthGate.
          maybeOfferCardScan('mid-discovery', presentAuthGate);
        });
      }
    });
  }

  // V21 — replaced finalize() with two-step flow:
  //   1) presentAuthGate() — drops Auth Gate as the next "message" in the chat
  //   2) finalize() — fires after AuthGate success or skip; surfaces plan cards

  function presentAuthGate() {
    convoState.step = 'awaiting-auth';
    var firstName = (convoState.name || '').split(' ')[0] || 'thanks';

    // Hide chat input + quick replies temporarily — auth gate is the moment
    if (formEl) formEl.style.opacity = '0.4';
    if (inputEl) inputEl.disabled = true;
    clearQuickReplies();

    // V23 · Keep the dashboard zone alive — show finalizing skeleton while gate is open
    startDashAuthSkeleton();

    noraSay(
      "Got everything I need, " + escapeHtml(firstName) + ". " +
      "Quick thing while I finish — give me your email and I'll hold this number for you in writing.",
      {
        delay: REDUCED_MOTION ? 60 : 1100,
        then: function () {
          // Inject auth-gate as the next chat element
          mountAuthGateInChat();
        }
      }
    );
  }

  // V23 · Dashboard "Nora finalizing" skeleton — cycles 3 status lines while
  // AuthGate is mid-flight. Locked Value Stack stays visible (anchor).
  var dashAuthSkelTimer = null;
  function startDashAuthSkeleton() {
    var skelEl = $('#dash-authskel');
    var statusEl = $('#dash-authskel-status');
    if (!skelEl || !statusEl) return;
    var lines = [
      'Pulling carrier rates',
      'Comparing networks',
      'Locking your number'
    ];
    var idx = 0;
    skelEl.hidden = false;
    skelEl.classList.add('is-cycling');
    statusEl.textContent = lines[0];
    if (dashAuthSkelTimer) clearInterval(dashAuthSkelTimer);
    if (REDUCED_MOTION) return; // hold on first line
    dashAuthSkelTimer = setInterval(function () {
      idx = (idx + 1) % lines.length;
      statusEl.style.opacity = '0';
      setTimeout(function () {
        statusEl.textContent = lines[idx];
        statusEl.style.opacity = '';
      }, 200);
    }, 1800);
  }
  function stopDashAuthSkeleton() {
    var skelEl = $('#dash-authskel');
    if (dashAuthSkelTimer) { clearInterval(dashAuthSkelTimer); dashAuthSkelTimer = null; }
    if (skelEl) {
      skelEl.classList.remove('is-cycling');
      skelEl.hidden = true;
    }
  }

  function mountAuthGateInChat() {
    if (!scrollEl || !window.AuthGate) {
      // No auth gate available — fall through to legacy finalize
      finalize();
      return;
    }
    var host = el('div', { cls: 'nx-msg from-nora' });
    var avatar = el('div', { cls: 'nx-msg-avatar', text: 'N' });
    var bubWrap = el('div');
    var gateSlot = el('div', { attrs: { 'data-auth-gate': '' } });
    bubWrap.appendChild(gateSlot);
    host.appendChild(avatar);
    host.appendChild(bubWrap);
    scrollEl.appendChild(host);
    scrollToBottom();

    try {
      window.AuthGate.mount(gateSlot, {
        persona: ctx.persona || 'GEN',
        state: ctx.state || null,                  // V24 · enable state-specific carrot
        comparisonAnchor: noraComparisonAnchor,
        onSubmit: function (payload) {
          // session.js will handle the mocked Klaviyo + JWT round-trip
          // Default success path runs after the magic-link mock resolves
          // Bridge to the rest of our flow once gate hides
          setTimeout(function () {
            try { window.AuthGate.hide(host.querySelector('[data-auth-gate]')); } catch (e) {}
            continueAfterAuth(false);
          }, 1600);
        },
        onSkip: function () {
          try { window.AuthGate.setSkipped(true); } catch (e) {}
          continueAfterAuth(true);
        }
      });
    } catch (e) {
      // Mount failed — still continue gracefully
      finalize();
    }
  }

  function continueAfterAuth(skipped) {
    // Re-enable chat input
    if (formEl) formEl.style.opacity = '';
    if (inputEl) inputEl.disabled = false;

    // V23 · Stop the dashboard finalizing skeleton — gate moment is over
    stopDashAuthSkeleton();

    // Update NoraSession state
    if (window.NoraSession) {
      window.NoraSession.update({
        is_skipped: !!skipped,
        is_authed: !skipped
      });
    }

    finalize(skipped);
  }

  function finalize(skipped) {
    convoState.step = 'finalized';
    setInputPlaceholder("Type or pick an option above…");
    noraSay(
      "Pulling carrier rates now and matching exactly what you told me. " +
      (skipped
        ? "<span class='nx-mute'>(You're in skip mode — save and forward will lock until you give me an email.)</span>"
        : "<span class='nx-mute'>(Magic link is in your inbox — same gate, same offer, anytime.)</span>"),
      {
        delay: REDUCED_MOTION ? 60 : 1100,
        then: function () {
          setTimeout(function () {
            noraSay(
              "Estimate so far: <b class='aha-num'>~$" + currentNumbers().plan + "/mo</b> for your plan, vs. " +
              "<b>~$" + currentNumbers().compare + "/mo</b> on " + currentNumbers().label + ". " +
              "You'd save around <b>~$" + (currentNumbers().compare - currentNumbers().plan) + "/mo</b>.",
              { isAha: true, delay: REDUCED_MOTION ? 60 : 1100, then: function () {
                // V21 · Surface plan options now
                surfacePlanOptions();
              }}
            );
          }, REDUCED_MOTION ? 60 : 800);
        }
      }
    );
  }

  // V24 Tier 4 — Spotify-Wrapped percentile framing. Insert (or re-show)
  // a single-line callout below the value-stack dial after a successful
  // plan-lock. Pulled from persona-strings.json `lockPercentile`.
  // Honest framing: "you'd be in the bottom X% of premium-payers." It
  // anchors identity, not pressure.
  function surfacePercentile() {
    try {
      var pctNum = (personaCfg && typeof personaCfg.lockPercentile === 'number')
        ? personaCfg.lockPercentile
        : 25;
      var dashWrap = document.getElementById('dash-vs-wrap');
      if (!dashWrap) return;
      // Idempotent: reuse existing node if present.
      var node = dashWrap.querySelector('.nx-percentile');
      if (!node) {
        node = document.createElement('div');
        node.className = 'nx-percentile';
        node.setAttribute('aria-live', 'polite');
        dashWrap.appendChild(node);
      }
      node.innerHTML =
        "You'd be in the <span class='nx-pct-emph'>bottom</span> " +
        "<span class='nx-pct-num'>" + pctNum + "%</span> " +
        "of premium-payers in your bracket.";
      // Slide in 1.5s after PLAN LOCKED caption fades — feels earned, not loud.
      setTimeout(function () {
        try { node.classList.add('is-visible'); } catch (e) {}
      }, REDUCED_MOTION ? 50 : 1500);
    } catch (e) { /* fail-safe — non-critical */ }
  }

  // V21 — Reveal plan cards in dashboard zone, transform Value Stack into "locked" mode
  function surfacePlanOptions() {
    var planSet = window.MOCK_NORA_RESPONSE;
    if (!planSet || !window.PlanCards) return;

    // V26 · Layout transition — plans rendered → COMPARE phase
    // (Plans-grid takes the lead; chat condenses to top strip.)
    if (window.LayoutDirector) {
      try { window.LayoutDirector.setLayoutPhase('compare'); } catch (e) {}
    }

    // V24 Tier 6 · Hide plan-peek now that real cards are arriving.
    removePlanPeek();

    // V24 Tier 7 · Advance the drawer route preview to "Lock your plan".
    advanceDrawerRoute(2);
    announce('Plan options ready. Pick a plan from the dashboard.');

    // Compress the estimate block — keep eyebrow/headline visible but de-emphasize
    var estimateBlock = $('#dash-estimate-block');
    if (estimateBlock) {
      var known = $('#dash-known');
      if (known) known.style.display = 'none';
      // Replace headline copy
      var headline = $('#dash-headline');
      if (headline) headline.textContent = 'Pick the shape that fits you.';
      var eyebrow = $('#dash-eyebrow');
      if (eyebrow) eyebrow.textContent = '★ YOUR PLAN OPTIONS';
      // V23 · Reinforce paragraph reframed for the plan-pick moment
      var reinforceEl = $('#dash-reinforce');
      if (reinforceEl) {
        reinforceEl.textContent =
          'Three plans on the same network. Pick by how much premium you want vs how often you use care.';
      }
    }

    // V23 · Lock Value Stack to the RECOMMENDED plan's premium AND
    // recompute Tier 2 (annual) + Tier 3 (savings vs current $890 anchor).
    var rec = (planSet.plans || []).filter(function (p) { return p.tier === 'recommended'; })[0];
    var nums = currentNumbers();
    if (rec && valueStackApi && typeof valueStackApi.lock === 'function') {
      try {
        var lockedMonthly = Math.round(rec.monthly_premium);
        var compareValue = (rec.compared_to_user && rec.compared_to_user.current_plan_premium) ||
                           nums.compare;
        var annualSavings = (compareValue - lockedMonthly) * 12;
        valueStackApi.lock(lockedMonthly, {
          secondary: { value: lockedMonthly * 12, suffix: '/yr', label: "That's annual" },
          tertiary: {
            value: annualSavings,
            suffix: ' saved/yr',
            label: nums.label,
            direction: 'down'
          },
          compareValue: compareValue
        });
        // V24 Tier 4 · Spotify-Wrapped percentile callout — slides in 1.5s
        // after the PLAN LOCKED caption fades. Single line under the dial.
        surfacePercentile();
      } catch (e) { /* lock recompute failed; carry on */ }
    }

    // V23 · Bridge Nora chat — explain the spread before plan cards land
    if (rec) {
      var budget = (planSet.plans || []).filter(function (p) { return p.tier === 'budget'; })[0];
      var premium = (planSet.plans || []).filter(function (p) { return p.tier === 'premium'; })[0];
      var bronze = budget ? Math.round(budget.monthly_premium) : null;
      var silver = Math.round(rec.monthly_premium);
      var gold = premium ? Math.round(premium.monthly_premium) : null;
      var bridgeMsg =
        "Your baseline is around <b>~$" + bronze + "/mo</b> — that's Bronze, max deductible. " +
        "Silver lands at <b>~$" + silver + "/mo</b> with predictable copays. " +
        (gold ? "Gold runs <b>~$" + gold + "/mo</b> with the lowest deductible. " : "") +
        "Most freelancers in your bracket pick Silver.";
      noraSay(bridgeMsg, { delay: REDUCED_MOTION ? 50 : 700 });
    }

    // Reveal the plan cards slot
    var pcWrap = $('#dash-plan-cards-host');
    if (pcWrap) pcWrap.classList.add('is-active');

    var pcEl = document.querySelector('[data-plan-cards]');
    if (!pcEl) return;
    try {
      planCardsApi = window.PlanCards.mount(pcEl, {
        planSet: planSet,
        onSelect: function (planId) {
          // V24 Tier 6 · Pre-celebration "Locking your plan with [Carrier]…"
          // overlay — gives the celebration weight. 600ms anticipation.
          var chosen = (planSet.plans || []).filter(function (p) {
            return p.plan_id === planId;
          })[0];
          var carrier = (chosen && (chosen.carrier_name || chosen.carrier)) || 'your carrier';
          showLockingOverlay(carrier);

          // V25 · Trail: COMPARE done → LOCK active (user just committed)
          if (window.UnlockTrail && typeof window.UnlockTrail.completePhase === 'function') {
            try { window.UnlockTrail.completePhase('compare'); } catch (e) {}
          }
          // V26 · Layout transition — plan picked → LOCK phase
          // (Chosen card glows center; drawer slides in from right.)
          if (window.LayoutDirector) {
            try { window.LayoutDirector.setLayoutPhase('lock'); } catch (e) {}
          }

          var fireLock = function () {
            try {
              if (chosen && valueStackApi && typeof valueStackApi.lock === 'function') {
                var lockedMonthly = Math.round(chosen.monthly_premium);
                var compareValue = (chosen.compared_to_user &&
                                    chosen.compared_to_user.current_plan_premium) ||
                                   currentNumbers().compare;
                var annualSavings = (compareValue - lockedMonthly) * 12;
                valueStackApi.lock(lockedMonthly, {
                  secondary: { value: lockedMonthly * 12, suffix: '/yr', label: "That's annual" },
                  tertiary: {
                    value: annualSavings,
                    suffix: ' saved/yr',
                    label: currentNumbers().label,
                    direction: 'down'
                  },
                  compareValue: compareValue
                });
                // V24 Tier 4 · Re-surface percentile on user-chosen plan too.
                surfacePercentile();
              }
              // Lemon-glow the chosen card.
              var chosenCard = pcEl.querySelector(
                '.plan-card[data-plan-id="' + planId + '"]'
              );
              if (chosenCard) {
                chosenCard.classList.remove('is-locking');
                void chosenCard.offsetWidth;
                chosenCard.classList.add('is-locking');
                setTimeout(function () {
                  try { chosenCard.classList.remove('is-locking'); } catch (e) {}
                }, 1100);
              }
            } catch (e) { /* celebration failed; continue */ }
            // V28 · LOCK is now its own dedicated screen. Plan-report mounts
            // in (now-hidden) drawer at LOCK so it's ready to render at ENROLL
            // when drawer becomes the screen.
            surfacePlanReport(planId);
            // V28 · Inline LOCK gate: chosen card + email gate (if not yet
            // authed) + Continue → ENROLL CTA. Replaces the old soft "Continue
            // to enrollment when you're ready" link buried in dash-vs-wrap.
            mountLockGate(planId, planSet);
            // V25 · Trail: LOCK done → ENROLL active (parked phase un-parks)
            if (window.UnlockTrail && typeof window.UnlockTrail.completePhase === 'function') {
              try { window.UnlockTrail.completePhase('lock'); } catch (e) {}
            }
          };

          if (REDUCED_MOTION) { fireLock(); }
          else { setTimeout(fireLock, 600); }
        },
        onCompareClick: function () {
          if (window.PlanCompareModal) {
            window.PlanCompareModal.show({ planSet: planSet, diffsOnly: true });
          }
        }
      });
    } catch (e) { /* PlanCards mount failed; continue */ }

    // V23 · Update Unlock Trail to step 7 (Plan).
    // No isUnlockEvent flag → no mystery delta pop.
    if (window.UnlockTrail && rec) {
      try {
        window.UnlockTrail.update({
          currentStep: 7,
          completedPct: 100,
          valueEstimate: Math.round(rec.monthly_premium)
          // intentionally no valueDelta + no isUnlockEvent
        });
      } catch (e) {}
    }

    // Auto-pivot on mobile to dashboard tab so user sees the cards
    if (window.matchMedia && window.matchMedia('(max-width: 767px)').matches) {
      var dashTab = document.querySelector('.nx-tab[data-tab="dash"]');
      if (dashTab) dashTab.click();
    }
  }

  function surfacePlanReport(planId) {
    var planSet = window.MOCK_NORA_RESPONSE;
    var content = $('#drawer-content');
    var empty   = $('#drawer-empty');
    if (!content || !planSet || !window.PlanReport) return;

    // V24 Tier 7 · Advance the drawer route to "Report appears here" before
    // the empty state hides — gives screen-reader users a final progress
    // confirmation.
    advanceDrawerRoute(3);
    announce('Your report is ready in the drawer.');

    if (empty) empty.classList.add('is-hidden');
    content.style.display = 'block';

    try {
      planReportApi = window.PlanReport.mount(content, {
        planSet: planSet,
        selectedPlanId: planId,
        skipped: window.NoraSession && window.NoraSession.isSkipped ? window.NoraSession.isSkipped() : false,
        onSave:           function () { console.log('[V21] Save clicked — wires to backend in V22'); },
        onEmailPdf:       function () { console.log('[V21] Email PDF clicked — wires in V22'); },
        onForward:        function () { console.log('[V21] Forward clicked — wires in V22'); },
        onContinueEnroll: function () {
          console.log('[V21] Continue to enrollment');
          // V25 · Trail: ENROLL phase complete (terminal)
          if (window.UnlockTrail && typeof window.UnlockTrail.completePhase === 'function') {
            try { window.UnlockTrail.completePhase('enroll'); } catch (e) {}
          }
          // V26 · Layout transition — Continue clicked → ENROLL phase
          // ("Continue is the screen" — single-column drawer fullscreen.)
          if (window.LayoutDirector) {
            try { window.LayoutDirector.setLayoutPhase('enroll'); } catch (e) {}
          }
        },
        onOpenEmailGate:  function () {
          if (window.AuthGate) {
            try { window.AuthGate.show(); } catch (e) {}
          }
        }
      });
    } catch (e) { /* PlanReport mount failed; continue */ }

    // Auto-pivot drawer tab on mobile
    if (window.matchMedia && window.matchMedia('(max-width: 1023px)').matches) {
      var drawerTab = document.querySelector('.nx-tab[data-tab="drawer"]');
      if (drawerTab) drawerTab.click();
    }
  }

  function setInputPlaceholder(txt) {
    if (inputEl) inputEl.placeholder = txt;
  }

  function currentNumbers() {
    return ctx.pregnancy ? CATALOG_NUMBERS : (PERSONA_NUMBERS[ctx.persona] || PERSONA_NUMBERS.GEN);
  }

  // -----------------------------------------------------------
  // 6. Dashboard scaffolding — V21 mounts ValueStack + UnlockTrail
  // -----------------------------------------------------------
  var valueStackApi = null;       // returned by ValueStack.mount, used to lock() later
  var planCardsApi  = null;
  var planReportApi = null;
  var noraComparisonAnchor = null;

  function renderDashboardScaffold() {
    var headline = $('#dash-headline');
    var eyebrow  = $('#dash-eyebrow');
    var reinforceEl = $('#dash-reinforce');
    var trustState = $('#trust-state');

    var nums = currentNumbers();

    if (ctx.pregnancy) {
      // V24 Tier 6 · Make Catalog routing immediately legible — the user
      // shouldn't be confused why they're seeing different numbers.
      eyebrow.textContent = '★ CATALOG ROUTE · MATERNITY-COVERED';
      headline.textContent = 'A plan that covers pregnancy.';
      // V23 · Persona reinforce paragraph (Catalog variant)
      if (reinforceEl) {
        reinforceEl.textContent =
          "Standard plans don't cover maternity — the Catalog line does. Same shop, different product.";
      }
    } else {
      eyebrow.textContent = '★ YOUR ESTIMATE';
      headline.textContent = personaCfg.dashboardHeadline || 'Routing your numbers.';
      // V23 · Persona reinforce paragraph — prefer revealReinforce, fall back to reinforce
      if (reinforceEl) {
        var rein = personaCfg.revealReinforce || personaCfg.reinforce || '';
        reinforceEl.textContent = rein;
      }
    }

    // V24 · Defer ValueStack reveal until after name-bind. On init we show
    // a "Pulling your numbers…" placeholder; mountValueStackAfterName() is
    // called from askForZip() once the user has typed their first name.
    // This applies the Apple Card / Wealthfront pattern — the headline +
    // rationale arrive first, the number lands as a dramatic reveal.
    var vsHost = $('#dashValueStack');
    if (vsHost) {
      vsHost.innerHTML =
        '<div class="nx-vs-pre" aria-live="polite">' +
          '<div class="nx-vs-pre-pip"><span></span><span></span><span></span></div>' +
          '<div class="nx-vs-pre-label">Pulling your numbers…</div>' +
        '</div>';
    }
    noraComparisonAnchor = personaCfg.comparisonAnchor || 'the typical premium for someone in your situation';

    // "What we know so far" — confirmed facts from URL
    setFact('state', ctx.state ? STATE_NAMES[ctx.state] : null);
    setFact('age',   ctx.age   != null ? ctx.age + ' yrs' : null);
    setFact('sex',   ctx.sex   ? (ctx.sex === 'M' ? 'Male' : 'Female') : null);
    setFact('conditions', ctx.conditions ? humanizeConditions(ctx.conditions, ctx.pregnancy) : null);

    if (trustState) trustState.textContent = ctx.state ? STATE_NAMES[ctx.state] : 'all 50 states';

    // V21 · Mount Unlock Trail at top of app — Discovery stage (step 6/7)
    // V24 · Trail value MUST match the dial (URL-authoritative `nums.plan`).
    // Don't pull a stale `valueEstimate` from prior session's localStorage —
    // we use saved `currentStep`/`completedPct` only.
    var trailHost = document.querySelector('[data-unlock-trail]');
    if (trailHost && window.UnlockTrail) {
      var savedTrail = null;
      try { savedTrail = window.UnlockTrail.hydrate(); } catch (e) {}
      var trailState = {
        currentStep:  (savedTrail && typeof savedTrail.currentStep  === 'number') ? savedTrail.currentStep  : 6,
        completedPct: (savedTrail && typeof savedTrail.completedPct === 'number') ? savedTrail.completedPct : 71,
        valueEstimate: nums.plan,    // ALWAYS from current URL persona, never stale
        valueDelta: 0
      };
      // If hydrate produced a state but we have a fresh URL persona,
      // ensure currentStep ≥ 6 (we just arrived in the app).
      if (trailState.currentStep < 6) trailState.currentStep = 6;
      try { window.UnlockTrail.mount(trailHost, trailState); } catch (e) {}
    }

    // V24 Tier 6 · Plan-cards locked-preview peek. Renders BEFORE the
    // plan-cards host (which is hidden until surfacePlanOptions). Tells
    // the user real plan options are coming — anticipation hook. Hidden
    // by removePlanPeek() when surfacePlanOptions activates.
    var pcHost = $('#dash-plan-cards-host');
    if (pcHost && !pcHost.classList.contains('is-active')) {
      var peekExisting = document.querySelector('.nx-plan-peek');
      if (!peekExisting) {
        var peek = document.createElement('div');
        peek.className = 'nx-plan-peek';
        peek.id = 'dash-plan-peek';
        peek.innerHTML =
          '<span class="nx-plan-peek-icon" aria-hidden="true">🔒</span>' +
          '<span>Your plan options unlock when Nora finishes.</span>';
        pcHost.parentNode.insertBefore(peek, pcHost);
      }
    }
  }
  function removePlanPeek() {
    var peek = document.getElementById('dash-plan-peek');
    if (peek && peek.parentNode) {
      peek.style.opacity = '0';
      setTimeout(function () {
        try { peek.parentNode.removeChild(peek); } catch (e) {}
      }, 280);
    }
  }

  // V24 Tier 7 · Advance the drawer's 3-step route preview.
  // stepIndex is 1-based: 1=Chat, 2=Lock plan, 3=Report appears.
  function advanceDrawerRoute(stepIndex) {
    var steps = document.querySelectorAll('.nx-drawer-route .nx-route-step');
    if (!steps || !steps.length) return;
    Array.prototype.forEach.call(steps, function (step, i) {
      var n = i + 1;
      step.classList.toggle('is-active', n === stepIndex);
      step.classList.toggle('is-faded', n < stepIndex);
      if (n === stepIndex) {
        step.setAttribute('aria-current', 'step');
      } else {
        step.removeAttribute('aria-current');
      }
    });
  }

  // V24 Tier 7 · A11y · Announce status messages via the off-screen live
  // region. Uses polite mode (won't interrupt screen readers).
  function announce(msg) {
    var liveRegion = document.getElementById('nx-aria-live');
    if (!liveRegion) return;
    // Clear and re-set to force re-announcement even if same text.
    liveRegion.textContent = '';
    setTimeout(function () {
      liveRegion.textContent = msg;
    }, 60);
  }

  // V24 Tier 6 · "Locking your plan with [Carrier]…" pre-celebration
  // overlay. Renders on top of the dial wrap for ~600ms before the lock
  // pulse. Makes the celebration feel earned, not instant.
  function showLockingOverlay(carrier) {
    var wrap = document.getElementById('dash-vs-wrap');
    if (!wrap) return;
    var overlay = wrap.querySelector('.nx-locking-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'nx-locking-overlay';
      overlay.setAttribute('aria-live', 'polite');
      wrap.appendChild(overlay);
    }
    overlay.textContent = 'Locking your plan with ' + carrier + '…';
    requestAnimationFrame(function () {
      overlay.classList.add('is-visible');
    });
    setTimeout(function () {
      overlay.classList.remove('is-visible');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 320);
    }, REDUCED_MOTION ? 50 : 580);
  }

  // V24 Tier 6 · "Continue to enrollment when ready" soft CTA. Appears
  // 2s after the lock celebration — gives the user an out without
  // rushing them. Mono-caps, teal, on-brand restraint.
  // V28 · Retained for V19/V23/V24/V25 backwards compat; V28 LOCK uses
  // mountLockGate() below as the single primary CTA at LOCK.
  function surfaceLockedCTA() {
    var wrap = document.getElementById('dash-vs-wrap');
    if (!wrap) return;
    if (wrap.querySelector('.nx-locked-cta')) return; // idempotent
    var cta = document.createElement('a');
    cta.className = 'nx-locked-cta';
    cta.href = '#continue';
    cta.textContent = '✓ Continue to enrollment when you’re ready';
    cta.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('[V24 Tier 6] Continue to enrollment — wires to backend in V25');
    });
    wrap.appendChild(cta);
    setTimeout(function () {
      cta.classList.add('is-visible');
    }, REDUCED_MOTION ? 50 : 2000);
  }

  // V28 · Inline LOCK gate. Renders inside #dash-lock-gate (which is the
  // LOCK phase's only visible content alongside the chosen card).
  // Two states:
  //   1. User already authed (gated mid-PRICE) → render confirmation +
  //      single Continue button that fires onContinueToEnroll.
  //   2. User NOT authed (skipped earlier) → render email field + Continue
  //      button. Continue submits gate then fires onContinueToEnroll.
  // Continuation always sets layout phase to 'enroll'.
  function mountLockGate(planId, planSet) {
    var host = document.getElementById('dash-lock-gate');
    if (!host) return;
    // Idempotent — if already mounted for this plan, re-show.
    if (host.dataset.mountedPlan === planId) {
      host.removeAttribute('hidden');
      return;
    }
    host.dataset.mountedPlan = planId;
    host.removeAttribute('hidden');

    var chosen = (planSet && planSet.plans || []).filter(function (p) {
      return p.plan_id === planId;
    })[0] || {};
    var carrier = chosen.carrier_name || chosen.carrier || 'your carrier';
    var monthly = chosen.monthly_premium ? Math.round(chosen.monthly_premium) : null;

    var alreadyAuthed = !!(window.NoraSession &&
                           typeof window.NoraSession.isAuthed === 'function' &&
                           window.NoraSession.isAuthed());

    while (host.firstChild) host.removeChild(host.firstChild);

    var header = document.createElement('div');
    header.className = 'nx-lock-gate__header';
    header.textContent = '✓ PLAN SELECTED';

    var lead = document.createElement('div');
    lead.className = 'nx-lock-gate__lead';
    lead.textContent = alreadyAuthed
      ? 'Hold this rate for 30 days.'
      : 'Lock this rate for 30 days.';

    var sub = document.createElement('div');
    sub.className = 'nx-lock-gate__sub';
    sub.textContent = alreadyAuthed
      ? 'Same gate, same offer. Continue when you’re ready.'
      : 'Email me anytime — same gate, same offer. No follow-up unless you ask.';

    var form = document.createElement('form');
    form.className = 'nx-lock-gate__form';
    form.setAttribute('novalidate', '');

    var emailInput = null;
    if (!alreadyAuthed) {
      var lbl = document.createElement('label');
      lbl.setAttribute('for', 'lock-gate-email');
      lbl.textContent = 'Your email';
      emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.id = 'lock-gate-email';
      emailInput.name = 'email';
      emailInput.autocomplete = 'email';
      emailInput.required = true;
      emailInput.placeholder = 'you@example.com';
      form.appendChild(lbl);
      form.appendChild(emailInput);
    }

    var btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'nx-lock-gate__continue';
    btn.textContent = 'Continue with ' + carrier + ' →';
    form.appendChild(btn);

    var micro = document.createElement('div');
    micro.className = 'nx-lock-gate__micro';
    micro.textContent = monthly
      ? '✓ $' + monthly + '/mo locked · NPN #19482230'
      : 'NPN #19482230 · Core Value Insurance Associates LLC';

    host.appendChild(header);
    host.appendChild(lead);
    host.appendChild(sub);
    host.appendChild(form);
    host.appendChild(micro);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Gate (if not authed) → set authed via NoraSession before transitioning.
      if (emailInput) {
        var v = (emailInput.value || '').trim();
        if (!v || !/^\S+@\S+\.\S+$/.test(v)) {
          emailInput.focus();
          emailInput.setAttribute('aria-invalid', 'true');
          return;
        }
        try {
          if (window.NoraSession && typeof window.NoraSession.setAuthed === 'function') {
            window.NoraSession.setAuthed(v);
          }
        } catch (err) {}
      }
      // Trail: enroll phase active (terminal advance happens on Continue
      // inside ENROLL screen receipt).
      if (window.UnlockTrail && typeof window.UnlockTrail.advancePhase === 'function') {
        try { window.UnlockTrail.advancePhase('enroll'); } catch (err) {}
      }
      // Layout: ENROLL — single-column drawer fullscreen with receipt.
      if (window.LayoutDirector) {
        try { window.LayoutDirector.setLayoutPhase('enroll'); } catch (err) {}
      }
      announce('Continuing to enrollment.');
    });

    // Focus the primary input (or button) for keyboard users.
    setTimeout(function () {
      if (emailInput) emailInput.focus();
      else btn.focus();
    }, REDUCED_MOTION ? 0 : 220);
  }

  function humanizeConditions(c, pregnant) {
    if (pregnant)              return 'Pregnancy / maternity';
    if (c === 'managed')      return 'Managed condition';
    if (c === 'utilization')  return 'Higher utilization';
    if (c === 'pregnancy')    return 'Pregnancy / maternity';
    return 'None disclosed';
  }

  function setFact(key, value) {
    var item = document.querySelector('.known-item[data-key="' + key + '"]');
    var slot = $('#fact-' + key);
    if (!item) return;
    if (value) {
      item.classList.remove('is-pending');
      item.classList.add('is-confirmed');
      var mark = item.querySelector('.nx-known-mark');
      if (mark) mark.textContent = '✓';
      if (slot) slot.textContent = value;
    } else {
      // Pending state for facts not yet known
      item.classList.add('is-pending');
      item.classList.remove('is-confirmed');
      var mark2 = item.querySelector('.nx-known-mark');
      if (mark2) mark2.textContent = '⊙';
      if (slot) {
        slot.outerHTML = '<span class="nx-mute">pending…</span>';
      }
    }
  }

  // Display labels for facts collected mid-conversation (preserves casing)
  var FACT_LABELS = {
    name: 'Name',
    zip: 'ZIP',
    dob: 'DOB',
    state: 'State',
    age: 'Age',
    sex: 'Sex',
    conditions: 'Conditions'
  };

  // updateFact is what the chat flow calls when Nora collects a new datum
  function updateFact(key, value) {
    var item = document.querySelector('.known-item[data-key="' + key + '"]');
    if (item) {
      // V24 Tier 6 · Animated "writing into the record" stroke. While
      // .is-confirming is set, the underline fills (720ms) and the mark
      // does a 460ms scale-pop. Then we settle into .is-confirmed.
      var wasPending = item.classList.contains('is-pending');
      item.classList.remove('is-pending');
      var mark = item.querySelector('.nx-known-mark');
      if (mark) mark.textContent = '✓';
      var slot = $('#fact-' + key);
      if (slot) slot.textContent = value;
      else {
        // Replace the pending span with confirmed text using the canonical label
        var textEl = item.querySelector('.nx-known-text');
        if (textEl) {
          var label = FACT_LABELS[key] || (key.charAt(0).toUpperCase() + key.slice(1));
          textEl.innerHTML = label + ': <b id="fact-' + key + '">' + escapeHtml(value) + '</b>';
        }
      }
      if (wasPending && !REDUCED_MOTION) {
        item.classList.add('is-confirming');
        // Settle to plain confirmed after the fill animation
        setTimeout(function () {
          item.classList.remove('is-confirming');
          item.classList.add('is-confirmed');
        }, 740);
      } else {
        item.classList.add('is-confirmed');
      }
    }
    // V21 · Push to NoraSession so the idle-timer + cross-device resume stays accurate
    if (window.NoraSession && typeof window.NoraSession.update === 'function') {
      try {
        var partial = { discovery_progress: {} };
        partial.discovery_progress[key] = value;
        window.NoraSession.update(partial);
      } catch (e) {}
    }
  }

  // -----------------------------------------------------------
  // 7. Mobile tab nav
  // -----------------------------------------------------------
  function setupMobileTabs() {
    var tabs = document.querySelectorAll('.nx-tab');
    var manualOverride = false; // set when user taps a tab; cleared on next layout transition

    function activateZone(target) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === target;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      ['chat', 'dash', 'drawer'].forEach(function (z) {
        var zone = $('#zone-' + z);
        if (zone) {
          zone.classList.toggle('is-active', z === target);
          zone.classList.toggle('is-active-tab', z === target);
        }
      });
      if (target === 'chat') scrollToBottom();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        manualOverride = true;
        activateZone(tab.getAttribute('data-tab'));
      });
    });

    // V26 · Mobile auto-pivot — listen for layoutPhaseChange and switch
    // to the LEAD zone unless the user manually picked a tab. Manual
    // override clears at the next phase boundary so auto-pivot resumes.
    // V28 · The phase event now carries `visibleZones` (zones not hidden
    // by the zone-collapse contract). When LOCK or ENROLL collapses to a
    // single visible zone, that zone is the auto-pivot target — even if
    // its role isn't 'lead' (V28 LOCK uses 'lead-fullscreen-dash').
    document.addEventListener('layoutPhaseChange', function (e) {
      if (!e.detail) return;
      var roles = e.detail.roles || {};
      var visibleZones = e.detail.visibleZones;
      var leadZone = null;
      // V28 contract: if a single zone remains visible after collapse, that
      // zone is the lead by definition.
      if (Array.isArray(visibleZones) && visibleZones.length === 1) {
        leadZone = visibleZones[0];
      } else {
        // V26 fallback: scan roles for lead / lead-fullscreen.
        ['chat', 'dash', 'drawer'].forEach(function (z) {
          if (roles[z] === 'lead' || roles[z] === 'lead-fullscreen') leadZone = z;
        });
      }
      if (!leadZone) return;
      if (window.matchMedia && window.matchMedia('(max-width: 767px)').matches) {
        activateZone(leadZone);
      }
      manualOverride = false;
    });
  }

  // -----------------------------------------------------------
  // 8. Boot
  // -----------------------------------------------------------
  function boot(strings) {
    ctx = parseContext();
    personaCfg = strings[ctx.persona] || strings.GEN;

    // V24 Tier 3 · Surface active persona globally so satellite components
    // (PlanCards rationale band, UnlockTrail context tag) can pick the
    // right copy variant without us having to thread `persona` through
    // every options bag.
    window.NORA_ACTIVE_PERSONA = ctx.persona;
    // V24 Tier 4 · Surface persona-strings globally too, so satellite
    // components (SocialProof, percentile insert) can read the persona's
    // socialProofLabel + lockPercentile without re-fetching.
    window.NORA_PERSONA_STRINGS = strings;

    // V24 Tier 4 · Mount SocialProof live counter on dashboard.
    try {
      var spNode = document.querySelector('[data-social-proof][data-sp-host="dashboard"]');
      if (spNode && window.SocialProof) {
        window.SocialProof.mount(spNode, { persona: ctx.persona });
      }
    } catch (e) { /* fail-safe */ }

    scrollEl = $('#chat-scroll');
    qrEl     = $('#quick-replies');
    inputEl  = $('#chat-input');
    formEl   = $('#chat-form');

    // V24 — URL is authoritative. If the URL has any persona/quiz params AND
    // localStorage holds a different persona, CLEAR localStorage so the URL
    // wins. This prevents tab clicks / chat submits / reloads from flipping
    // persona to a stale localStorage entry.
    var urlHasPersonaParams = (function () {
      var sp = new URLSearchParams(window.location.search);
      return sp.has('p') || sp.has('s') || sp.has('a') || sp.has('x') || sp.has('pg') || sp.has('c');
    })();
    if (urlHasPersonaParams && window.localStorage) {
      try {
        var stored = window.localStorage.getItem('shc_session');
        if (stored) {
          var parsed = JSON.parse(stored);
          // Allow URL to win when persona/state mismatch.
          if (!parsed || parsed.persona !== ctx.persona ||
              (parsed.quiz_answers && parsed.quiz_answers.state !== ctx.state)) {
            window.localStorage.removeItem('shc_session');
          }
        }
      } catch (e) { /* swallow — non-critical */ }
    }

    // V21 · Initialize NoraSession with URL params + start idle timer
    if (window.NoraSession) {
      try {
        var initialState = {
          persona: ctx.persona,
          quiz_answers: {
            state: ctx.state,
            age: ctx.age,
            sex: ctx.sex,
            pregnancy: !!ctx.pregnancy,
            conditions: ctx.conditions
          }
        };
        // V24 · Only resume via ?token= magic link path. If no token, do NOT
        // synthesize a sample — let init() use cleared/fresh localStorage.
        var sp2 = new URLSearchParams(window.location.search);
        var hydrated = sp2.has('token') ? window.NoraSession.hydrateFromUrl() : null;
        window.NoraSession.init(initialState);
        if (window.NoraSession.startIdleTimer) window.NoraSession.startIdleTimer();
        if (hydrated && hydrated.email) {
          // User came back from a magic link — chat could resume here in V22
          console.log('[V21] Resumed via magic link', hydrated);
        }
      } catch (e) { /* NoraSession is non-critical; continue */ }
    }

    // M1: chat zone is the primary "active" zone on mobile by default
    $('#zone-chat').classList.add('is-active');

    // V24 Tier 5 — stage-curtain class is managed by primeBootClass() so
    // its timing is anchored to page-load, not persona-strings fetch.

    // Wire form
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = inputEl.value;
      if (!v.trim()) return;
      inputEl.value = '';
      handleUserInput(v);
    });

    setupMobileTabs();
    renderDashboardScaffold();

    // Open the persona-tagged conversation
    startConversation();

    // Expose minimal debug surface
    window.NoraApp = {
      ctx: ctx,
      personaCfg: personaCfg,
      strings: strings,
      reset: function () { window.location.reload(); },
      // Test helpers — exposed for browser-console interactive testing
      _testFinalize:   function () { presentAuthGate(); },
      _testPlans:      function () { surfacePlanOptions(); },
      _testPercentile: function () { surfacePercentile(); }
    };
  }

  // V24 Tier 5 — set the boot class as early as possible so the stage
  // curtain animations have a chance to play even if persona-strings
  // load takes a beat. Class is dropped after final stage settles
  // (1300ms from prime, NOT from boot — keeps timing tight regardless of
  // how slowly the persona-strings fetch completes).
  function primeBootClass() {
    var REDUCED_BOOT = false;
    try { REDUCED_BOOT = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
    if (!REDUCED_BOOT && document.body) {
      document.body.classList.add('nx-is-booting');
      setTimeout(function () {
        if (document.body) document.body.classList.remove('nx-is-booting');
      }, 1300);
    }
  }

  // V26 · LayoutDirector — initial layout phase = 'read' (chat-lead).
  // Subsequent transitions fire at app events (name bind / plans render /
  // plan pick / continue clicked).
  function initLayoutDirector() {
    if (window.LayoutDirector && typeof window.LayoutDirector.init === 'function') {
      try {
        window.LayoutDirector.init(document.getElementById('nx-shell'), {
          startPhase: 'read'
        });
      } catch (e) { /* layout director non-critical */ }
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      primeBootClass();
      loadPersonaStrings().then(function (s) {
        boot(s);
        initLayoutDirector();
      });
    });
  } else {
    primeBootClass();
    loadPersonaStrings().then(function (s) {
      boot(s);
      initLayoutDirector();
    });
  }
})();
