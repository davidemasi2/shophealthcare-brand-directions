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
  // Catalog (Plan 02) overrides apply when pg=1 or conditions=pregnancy
  var PERSONA_NUMBERS = {
    RU1: { plan: 290, compare: 890, label: 'Open-market PPO' },
    SP1: { plan: 290, compare: 890, label: 'Open-market freelancer PPO' },
    BR1: { plan: 520, compare: 1180, label: 'ACA bridge plan' },
    CL1: { plan: 290, compare: 890, label: 'Your renewal premium' },
    PC1: { plan: 290, compare: 680, label: 'What others in your bracket pay' },
    GEN: { plan: 290, compare: 760, label: 'Typical premium for your situation' }
  };
  var CATALOG_NUMBERS = { plan: 520, compare: 890, label: 'ACA marketplace bronze' };

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
      noraOpener: "Let's get you back on coverage fast. Plan 01 can be active in 24 hours.",
      reinforce: "You just got hit. The system failed you. We can have you covered by your start date.",
      dashboardHeadline: "Coverage in 24 hours.",
      comparisonAnchor: "what your monthly premium will be once you're back on coverage",
      hasCurrentCoverage: false,
      cardScanRelevance: "none"
    },
    SP1: {
      label: "Self-employed / 1099",
      noraOpener: "37% of self-employed people in your bracket save the most on Plan 01. Let me show you what that looks like for you.",
      reinforce: "You're 1099 — and most freelancers don't realize Plan 01 exists. It was built for self-employed people with irregular income. ACA wasn't.",
      dashboardHeadline: "Built for irregular income.",
      comparisonAnchor: "what most freelancers pay on the open market",
      hasCurrentCoverage: "maybe",
      cardScanRelevance: "optional"
    },
    BR1: {
      label: "Pre-Medicare 55–64",
      noraOpener: "5+ years from Medicare is the costliest stretch. Let's bridge it without the ACA cliff.",
      reinforce: "You're in the longest, most expensive insurance gap of your life. Plan 01 was designed for exactly this window.",
      dashboardHeadline: "Bridge to Medicare.",
      comparisonAnchor: "what you'd pay for ACA bridge coverage until Medicare",
      hasCurrentCoverage: "usually",
      cardScanRelevance: "optional"
    },
    CL1: {
      label: "My premium just spiked",
      noraOpener: "Let me see your current premium and show you the actual delta.",
      reinforce: "Your renewal letter is real. Most renewals jumped 26–114%. Plan 01 sits 50–60% under what you're being asked to pay now.",
      dashboardHeadline: "Your renewal vs. Plan 01.",
      comparisonAnchor: "your renewal premium — the one that just spiked",
      hasCurrentCoverage: true,
      cardScanRelevance: "critical"
    },
    PC1: {
      label: "Check if I'm overpaying",
      noraOpener: "Worst case: your plan's fine and you saved 60 seconds. Let me run the check.",
      reinforce: "Most people are. About 6 in 10 we check are paying for things they'll never use.",
      dashboardHeadline: "Plan diagnostic.",
      comparisonAnchor: "whether your current plan is the best deal in your state",
      hasCurrentCoverage: true,
      cardScanRelevance: "critical"
    },
    GEN: {
      label: "Not sure",
      noraOpener: "Let me ask 3 things and tell you which path makes sense.",
      reinforce: "Most common answer we get. Most people have no idea what they're actually paying for.",
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
        "Plan 01 doesn't cover maternity, so I'm routing you to our Catalog product line — same brokerage, different plan that covers it. " +
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
      finalize();
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
          finalize();
        });
      }
    });
  }

  function finalize() {
    convoState.step = 'finalized';
    setInputPlaceholder("Type or pick an option above…");
    noraSay(
      "Got everything I need, " + escapeHtml((convoState.name || '').split(' ')[0] || 'thanks') + ". " +
      "I'm finalizing your quote now — pulling carrier rates and matching what you told me. " +
      "<span class='nx-mute'>(Mock stop. The real quote, email gate, and report drawer wire up in Milestones 2-5.)</span>",
      {
        delay: REDUCED_MOTION ? 60 : 1200,
        then: function () {
          setTimeout(function () {
            noraSay(
              "Estimate so far: <b class='aha-num'>~$" + currentNumbers().plan + "/mo</b> for Plan 01, vs. " +
              "<b>~$" + currentNumbers().compare + "/mo</b> on " + currentNumbers().label + ". " +
              "You'd save around <b>$" + (currentNumbers().compare - currentNumbers().plan) + "/mo</b> — " +
              "we'll firm this number up the moment the carrier rate comes back.",
              { isAha: true, delay: REDUCED_MOTION ? 60 : 1100 }
            );
          }, REDUCED_MOTION ? 60 : 800);
        }
      }
    );
  }

  function setInputPlaceholder(txt) {
    if (inputEl) inputEl.placeholder = txt;
  }

  function currentNumbers() {
    return ctx.pregnancy ? CATALOG_NUMBERS : (PERSONA_NUMBERS[ctx.persona] || PERSONA_NUMBERS.GEN);
  }

  // -----------------------------------------------------------
  // 6. Dashboard scaffolding (M2 wires up live updates)
  // -----------------------------------------------------------
  function renderDashboardScaffold() {
    var headline = $('#dash-headline');
    var eyebrow  = $('#dash-eyebrow');
    var bignum   = $('#dash-bignum');
    var bigLabel = $('#dash-bignum-label');
    var compare  = $('#dash-compare');
    var savings  = $('#dash-savings');
    var trustState = $('#trust-state');

    var nums = currentNumbers();

    if (ctx.pregnancy) {
      eyebrow.textContent = '★ CATALOG ROUTE';
      headline.textContent = 'A plan that covers it.';
      bigLabel.textContent = 'Catalog estimate';
    } else {
      eyebrow.textContent = '★ YOUR ESTIMATE';
      headline.textContent = personaCfg.dashboardHeadline;
      bigLabel.textContent = 'Plan 01 estimate';
    }

    bignum.innerHTML = '~$' + nums.plan + '<span class="nx-bignum-unit">/mo</span>';
    compare.textContent = '~$' + nums.compare + '/mo · ' + nums.label;
    savings.textContent = '~$' + (nums.compare - nums.plan) + '/mo';

    // "What we know so far" — confirmed facts from URL
    setFact('state', ctx.state ? STATE_NAMES[ctx.state] : null);
    setFact('age',   ctx.age   != null ? ctx.age + ' yrs' : null);
    setFact('sex',   ctx.sex   ? (ctx.sex === 'M' ? 'Male' : 'Female') : null);
    setFact('conditions', ctx.conditions ? humanizeConditions(ctx.conditions, ctx.pregnancy) : null);

    if (trustState) trustState.textContent = ctx.state ? STATE_NAMES[ctx.state] : 'all 50 states';
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
    if (!item) return;
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
      reset: function () { window.location.reload(); }
    };
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { loadPersonaStrings().then(boot); });
  } else {
    loadPersonaStrings().then(boot);
  }
})();
