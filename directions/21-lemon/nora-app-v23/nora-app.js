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
      cardScanRelevance: "none"
    },
    SP1: {
      label: "Self-employed / 1099",
      noraOpener: "37% of self-employed people in your bracket save the most on the right plan. Let me show you what that looks like for you.",
      reinforce: "You're 1099 — and most freelancers don't realize this kind of plan exists. It was built for self-employed people with irregular income.",
      revealReinforce: "You're 1099 — and most freelancers don't realize the plan we'd write you was built for them. Here's your real number.",
      dashboardHeadline: "Built for irregular income.",
      comparisonAnchor: "what most freelancers pay on the open market",
      hasCurrentCoverage: "maybe",
      cardScanRelevance: "optional"
    },
    BR1: {
      label: "Pre-65 bridge years",
      noraOpener: "5+ years from your transition is the costliest stretch. Let's bridge it without the premium spike.",
      reinforce: "You're in the longest, most expensive insurance gap of your life. The plan we'd write you was designed for exactly this window.",
      revealReinforce: "The plan we'd write you was designed for exactly this window. Here's what bridging the gap really costs.",
      dashboardHeadline: "Bridge the gap.",
      comparisonAnchor: "what you'd pay on the open market for bridge coverage",
      hasCurrentCoverage: "usually",
      cardScanRelevance: "optional"
    },
    CL1: {
      label: "My premium just spiked",
      noraOpener: "Let me see your current premium and show you the actual delta.",
      reinforce: "Your renewal letter is real. Most renewals jumped 26–114%. Our number sits 50–60% under what you're being asked to pay now.",
      revealReinforce: "Your renewal letter is real. Here's what our number looks like next to it — same network, lower premium.",
      dashboardHeadline: "Your renewal vs. our number.",
      comparisonAnchor: "your renewal premium — the one that just spiked",
      hasCurrentCoverage: true,
      cardScanRelevance: "critical"
    },
    PC1: {
      label: "Check if I'm overpaying",
      noraOpener: "Worst case: your plan's fine and you saved 60 seconds. Let me run the check.",
      reinforce: "Most people are. About 6 in 10 we check are paying for things they'll never use.",
      revealReinforce: "About 6 in 10 we check are paying for things they'll never use. Here's where you actually land.",
      dashboardHeadline: "Plan diagnostic.",
      comparisonAnchor: "whether your current plan is the best deal in your state",
      hasCurrentCoverage: true,
      cardScanRelevance: "critical"
    },
    GEN: {
      label: "Not sure",
      noraOpener: "Let me ask 3 things and tell you which path makes sense.",
      reinforce: "Most common answer we get. Most people have no idea what they're actually paying for.",
      revealReinforce: "Most people don't know what they're actually paying for. Here's your real number — and what's hiding behind it.",
      dashboardHeadline: "Routing your numbers.",
      comparisonAnchor: "the typical premium for someone in your situation",
      hasCurrentCoverage: "unknown",
      cardScanRelevance: "ask"
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

  function appendTypingIndicator() {
    var msg = el('div', { cls: 'nx-msg from-nora' });
    var avatar = el('div', { cls: 'nx-msg-avatar', text: 'N' });
    var bub = el('div', { cls: 'nx-bub' });
    bub.innerHTML = '<span class="nx-typing"><span></span><span></span><span></span></span>';
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
    var typing = appendTypingIndicator();
    var delay = REDUCED_MOTION ? 50 : (opts.delay || (800 + Math.random() * 700));
    setTimeout(function () {
      typing.remove();
      appendMessage({ from: 'nora', html: html, isAha: !!opts.isAha });
      if (opts.then) opts.then();
    }, delay);
  }

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
    // Step 0 — persona-tagged opener (first question is name)
    noraSay(buildOpener(), {
      delay: REDUCED_MOTION ? 50 : 600,
      then: function () {
        // No quick replies for an open name field — just text input
        setInputPlaceholder("Type your first name…");
        convoState.step = 'awaiting-name';
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
      // V21 · Same auth-gate moment as the quick-reply path
      presentAuthGate();
      return;
    }

    // Fallback — any text after finalize is acknowledged but no advance
    if (convoState.step === 'finalized') {
      userSay(escapeHtml(text));
      noraSay("Got it. Hang tight — we'll pick this back up the moment your real quote lands. <span class='nx-mute'>(Milestone 2 wires this to a live backend.)</span>");
      return;
    }
  }

  function askForZip(name) {
    setInputPlaceholder("Type your ZIP…");
    var firstName = (name || '').split(' ')[0] || name;
    noraSay("Thanks, " + escapeHtml(firstName) + ". What's your ZIP code? I use it to pull the right network and rate.", {
      then: function () { convoState.step = 'awaiting-zip'; }
    });
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
          // V21 · After 4-step discovery, run auth-gate moment BEFORE finalize
          presentAuthGate();
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
      "Quick thing while I finish — give me your email and I'll lock this rate in writing.",
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

  // V21 — Reveal plan cards in dashboard zone, transform Value Stack into "locked" mode
  function surfacePlanOptions() {
    var planSet = window.MOCK_NORA_RESPONSE;
    if (!planSet || !window.PlanCards) return;

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
          surfacePlanReport(planId);
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
        onContinueEnroll: function () { console.log('[V21] Continue to enrollment'); },
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
      eyebrow.textContent = '★ CATALOG ROUTE';
      headline.textContent = 'A plan that covers it.';
      // V23 · Persona reinforce paragraph (Catalog variant)
      if (reinforceEl) {
        reinforceEl.textContent =
          "Honest answer = right plan. The Catalog line covers what your usual plan wouldn't — same shop, different product.";
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

    // V21 · Mount Value Stack into the dashboard's bignum slot
    var vsHost = $('#dashValueStack');
    if (vsHost && window.ValueStack) {
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
      } catch (e) { /* Value Stack non-critical; continue */ }
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
      item.classList.remove('is-pending');
      item.classList.add('is-confirmed');
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
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        ['chat', 'dash', 'drawer'].forEach(function (z) {
          var zone = $('#zone-' + z);
          if (zone) zone.classList.toggle('is-active', z === target);
        });
        // If switching to chat, jump scroll to bottom
        if (target === 'chat') scrollToBottom();
      });
    });
  }

  // -----------------------------------------------------------
  // 8. Boot
  // -----------------------------------------------------------
  function boot(strings) {
    ctx = parseContext();
    personaCfg = strings[ctx.persona] || strings.GEN;

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
      _testFinalize: function () { presentAuthGate(); },
      _testPlans:    function () { surfacePlanOptions(); }
    };
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { loadPersonaStrings().then(boot); });
  } else {
    loadPersonaStrings().then(boot);
  }
})();
