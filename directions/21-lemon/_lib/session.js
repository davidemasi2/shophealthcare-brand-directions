/* =============================================================
   NORA SESSION — V21 Component C (foundation)
   IIFE module exposing window.NoraSession.
   Manages: localStorage persistence, mocked backend sync, idle
   detection, resume-link generation/hydration, drop-off recovery.

   Spec: front-end design/quiz-app-capture-flow.md §6
         front-end design/nora-app-design-brief.md §7
         front-end design/endpoints-contract.md §6 + §8
   ============================================================= */
(function (global) {
  'use strict';

  // ─── TUNING / CONFIGURATION ──────────────────────────────────
  // Centralised constants — change here to retune without touching
  // any other code.
  var CONFIG = {
    STORAGE_KEY:        'shc_session',
    STRINGS_CACHE_KEY:  'shc_persona_strings',
    DEBOUNCE_MS:        500,           // localStorage write debounce
    IDLE_TRIGGER_MS:    5 * 60 * 1000, // 5 min default; tune here
    IDLE_MIN_PCT:       20,            // only fire idle email above this
    MOCK_LATENCY_MS:    800,           // simulated backend round-trip
    MOCK_OAUTH_MS:      1200,          // simulated Google redirect
    SESSION_VERSION:    1
  };

  // ─── STATE ───────────────────────────────────────────────────
  var state = defaultState();
  var debounceTimer = null;
  var idleTimer = null;
  var idleListenersBound = false;
  var idleFiredForCurrentSession = false;
  var subscribers = [];

  // ─── PUBLIC API ──────────────────────────────────────────────
  var NoraSession = {
    // lifecycle
    init:               init,
    update:             update,
    get:                get,
    reset:              reset,

    // progress
    getCompletedPct:    getCompletedPct,

    // auth-related capture
    setEmail:           setEmail,
    setPhone:           setPhone,
    setAuthed:          setAuthed,
    setSkipped:         setSkipped,
    isAuthed:           isAuthed,
    isSkipped:          isSkipped,

    // mocked backend
    requestMagicLink:   requestMagicLink,
    requestGoogleAuth:  requestGoogleAuth,

    // resume / drop-off
    hydrateFromUrl:     hydrateFromUrl,
    startIdleTimer:     startIdleTimer,
    stopIdleTimer:      stopIdleTimer,
    fireResumeEmail:    fireResumeEmail,

    // observability
    subscribe:          subscribe,

    // exposed for tuning + tests
    CONFIG:             CONFIG,
    get IDLE_TRIGGER_MS() { return CONFIG.IDLE_TRIGGER_MS; },
    set IDLE_TRIGGER_MS(v) {
      if (typeof v === 'number' && v > 0) {
        CONFIG.IDLE_TRIGGER_MS = v;
        if (idleListenersBound) startIdleTimer(); // restart with new value
      }
    }
  };

  // ─── INIT ────────────────────────────────────────────────────
  function init(initialState) {
    // Idempotent: if we already have a session_id, just merge.
    var hadSession = !!state.session_id;
    if (!hadSession) {
      var hydrated = loadFromStorage();
      if (hydrated && hydrated.session_id) {
        state = hydrated;
        log('Resumed session from localStorage:', state.session_id);
      } else {
        state.session_id = generateSessionId();
        log('Started new session:', state.session_id);
      }
    }
    if (initialState && typeof initialState === 'object') {
      state = mergeState(state, initialState);
    }
    state.last_activity = Date.now();
    persist();
    notify();
    return state.session_id;
  }

  function update(partial) {
    if (!partial || typeof partial !== 'object') return state;
    state = mergeState(state, partial);
    state.last_activity = Date.now();
    persistDebounced();
    notify();
    return state;
  }

  function get() {
    // Defensive copy — callers shouldn't be able to mutate internal state.
    return JSON.parse(JSON.stringify(state));
  }

  function reset() {
    state = defaultState();
    state.session_id = generateSessionId();
    state.last_activity = Date.now();
    idleFiredForCurrentSession = false;
    persist();
    notify();
    log('Session reset:', state.session_id);
    return state.session_id;
  }

  // ─── PROGRESS ────────────────────────────────────────────────
  // Heuristic: percentage of "filled" fields across quiz + discovery.
  // 9 fields total; each contributes ~11pct.
  function getCompletedPct() {
    var fields = [
      state.quiz_answers && state.quiz_answers.state,
      state.quiz_answers && state.quiz_answers.age,
      state.quiz_answers && state.quiz_answers.sex,
      state.discovery_progress && state.discovery_progress.name,
      state.discovery_progress && state.discovery_progress.zip,
      state.discovery_progress && state.discovery_progress.dob,
      state.discovery_progress && state.discovery_progress.conditions_detail,
      state.discovery_progress && state.discovery_progress.start_date,
      state.email
    ];
    var filled = 0;
    for (var i = 0; i < fields.length; i++) {
      if (fields[i] !== null && fields[i] !== undefined && fields[i] !== '') filled++;
    }
    var pct = Math.round((filled / fields.length) * 100);
    state.completed_pct = pct;
    return pct;
  }

  // ─── EMAIL / PHONE / AUTH STATE ──────────────────────────────
  function setEmail(email) {
    state.email = email || null;
    state.last_activity = Date.now();
    persistDebounced();
    notify();
  }

  function setPhone(phone, smsOptIn) {
    state.phone = phone || null;
    state.sms_opt_in = !!smsOptIn;
    state.last_activity = Date.now();
    persistDebounced();
    notify();
  }

  function setAuthed(flag) {
    state.is_authed = !!flag;
    if (state.is_authed) state.is_skipped = false;
    state.last_activity = Date.now();
    persistDebounced();
    notify();
  }

  function setSkipped(flag) {
    state.is_skipped = !!flag;
    if (state.is_skipped) state.is_authed = false;
    state.last_activity = Date.now();
    persistDebounced();
    notify();
  }

  function isAuthed() {
    return !!state.is_authed;
  }

  function isSkipped() {
    return !!state.is_skipped;
  }

  // ─── MOCKED BACKEND CALLS ────────────────────────────────────
  // Real backend swap-points:
  //   requestMagicLink → POST /api/auth/magic-link
  //   requestGoogleAuth → GET  /api/auth/google?session_id=…
  //   fireResumeEmail   → POST /api/auth/resume-email (server-fired in prod)
  function requestMagicLink(email, phone, smsOptIn) {
    return new Promise(function (resolve, reject) {
      if (!isValidEmail(email)) {
        reject(new Error('Invalid email'));
        return;
      }

      setTimeout(function () {
        var jwt = mockJwt({
          ses: state.session_id,
          email: email,
          type: 'magic_link'
        });
        var resumeUrl = buildResumeUrl(jwt);

        // Persist locally.
        setEmail(email);
        if (smsOptIn && phone) setPhone(phone, true);
        else if (phone) setPhone(phone, false);

        // Simulate Klaviyo email queue.
        log('[MOCK Klaviyo] Magic link email queued', {
          to: email,
          template: 'resume_link',
          resumeUrl: resumeUrl,
          sessionPct: getCompletedPct()
        });

        resolve({
          sent: true,
          resumeUrl: resumeUrl,
          token: jwt,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }, CONFIG.MOCK_LATENCY_MS);
    });
  }

  function requestGoogleAuth() {
    return new Promise(function (resolve) {
      setTimeout(function () {
        var fakeUser = {
          name: 'Sarah Demo',
          email: 'sarah.demo@gmail.com'
        };
        var jwt = mockJwt({
          ses: state.session_id,
          email: fakeUser.email,
          type: 'auth'
        });
        setEmail(fakeUser.email);
        setAuthed(true);
        log('[MOCK Google OAuth] Authed as', fakeUser.email);
        resolve({
          authed: true,
          user: fakeUser,
          token: jwt
        });
      }, CONFIG.MOCK_OAUTH_MS);
    });
  }

  function fireResumeEmail(trigger) {
    // In prod this is server-side; we simulate the network call so the
    // frontend can preview what will happen.
    if (!state.email) {
      log('[NoraSession] No email captured — resume email skipped');
      return Promise.resolve({ sent: false, reason: 'no_email' });
    }
    var pct = getCompletedPct();
    log('[MOCK Klaviyo] Resume email fired', {
      to: state.email,
      trigger: trigger || 'idle_5min',
      template: 'resume_link',
      sessionPct: pct,
      session_id: state.session_id
    });
    return Promise.resolve({
      sent: true,
      template: 'resume_link',
      trigger: trigger || 'idle_5min'
    });
  }

  // ─── RESUME FROM URL ─────────────────────────────────────────
  function hydrateFromUrl() {
    try {
      var url = new URL(global.location.href);
      var token = url.searchParams.get('token');
      if (!token) return null;

      var ref = url.searchParams.get('ref') || 'email-link';
      var payload = decodeMockJwt(token);
      if (!payload) {
        log('[NoraSession] hydrateFromUrl: token decode failed');
        return null;
      }

      // First try localStorage (same browser).
      var local = loadFromStorage();
      if (local && local.session_id === payload.ses) {
        state = local;
        log('[NoraSession] hydrated from local storage via ?token=', payload.ses);
      } else {
        // Mocked "backend fetch" — in prod hits GET /api/session/:id.
        // We synthesize a plausible state from the JWT payload.
        state = mergeState(defaultState(), {
          session_id: payload.ses,
          email: payload.email || null,
          is_authed: payload.type === 'auth',
          completed_pct: 57 // mocked default for cross-device demo
        });
        log('[NoraSession] hydrated synthetic state from token (mocked)');
      }

      state.last_activity = Date.now();
      persist();
      notify();

      return {
        restored: true,
        session_id: state.session_id,
        completed_pct: getCompletedPct(),
        email: state.email,
        ref: ref
      };
    } catch (err) {
      log('[NoraSession] hydrateFromUrl error:', err);
      return null;
    }
  }

  // ─── IDLE DETECTION ──────────────────────────────────────────
  function startIdleTimer() {
    stopIdleTimer();
    if (!idleListenersBound) bindIdleListeners();
    idleTimer = global.setTimeout(onIdleFire, CONFIG.IDLE_TRIGGER_MS);
    log('[NoraSession] idle timer started; trigger in', CONFIG.IDLE_TRIGGER_MS, 'ms');
  }

  function stopIdleTimer() {
    if (idleTimer) {
      global.clearTimeout(idleTimer);
      idleTimer = null;
    }
  }

  function resetIdleTimer() {
    if (!idleListenersBound) return;
    state.last_activity = Date.now();
    if (idleTimer) {
      global.clearTimeout(idleTimer);
      idleTimer = global.setTimeout(onIdleFire, CONFIG.IDLE_TRIGGER_MS);
    }
  }

  function onIdleFire() {
    var pct = getCompletedPct();
    if (idleFiredForCurrentSession) {
      log('[NoraSession] idle: already fired this session');
      return;
    }
    if (!state.email) {
      log('[NoraSession] idle: no email captured — skipping');
      return;
    }
    if (pct <= CONFIG.IDLE_MIN_PCT) {
      log('[NoraSession] idle: completed_pct too low (', pct, '%) — skipping');
      return;
    }
    if (state.is_authed && state.drawer_state === 'enrolled') {
      log('[NoraSession] idle: already enrolled — skipping');
      return;
    }
    idleFiredForCurrentSession = true;
    fireResumeEmail('idle_5min');
  }

  function bindIdleListeners() {
    if (idleListenersBound) return;
    idleListenersBound = true;
    var events = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    events.forEach(function (ev) {
      global.addEventListener(ev, resetIdleTimer, { passive: true });
    });
    // Custom event surface: components can dispatch nora-activity to reset.
    global.addEventListener('nora-activity', resetIdleTimer);
  }

  // ─── PUB / SUB ───────────────────────────────────────────────
  function subscribe(fn) {
    if (typeof fn !== 'function') return function () {};
    subscribers.push(fn);
    return function unsubscribe() {
      var i = subscribers.indexOf(fn);
      if (i >= 0) subscribers.splice(i, 1);
    };
  }

  function notify() {
    var snapshot = get();
    for (var i = 0; i < subscribers.length; i++) {
      try { subscribers[i](snapshot); }
      catch (err) { log('[NoraSession] subscriber threw:', err); }
    }
  }

  // ─── PERSISTENCE ─────────────────────────────────────────────
  function persistDebounced() {
    if (debounceTimer) global.clearTimeout(debounceTimer);
    debounceTimer = global.setTimeout(persist, CONFIG.DEBOUNCE_MS);
  }

  function persist() {
    if (debounceTimer) {
      global.clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    try {
      if (!global.localStorage) return;
      global.localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      // Storage quota / disabled / private mode — fail silently.
      log('[NoraSession] persist failed:', err && err.message);
    }
  }

  function loadFromStorage() {
    try {
      if (!global.localStorage) return null;
      var raw = global.localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return mergeState(defaultState(), parsed);
    } catch (err) {
      log('[NoraSession] loadFromStorage failed:', err && err.message);
      return null;
    }
  }

  // ─── HELPERS ─────────────────────────────────────────────────
  function defaultState() {
    return {
      version:               CONFIG.SESSION_VERSION,
      session_id:            null,
      persona:               null,
      quiz_answers: {
        state:       null,
        age:         null,
        sex:         null,
        pregnancy:   null,
        conditions:  null
      },
      discovery_progress: {
        name:                null,
        zip:                 null,
        dob:                 null,
        conditions_detail:   null,
        start_date:          null
      },
      estimate: {
        monthly:           null,
        annual:            null,
        savings_monthly:   null,
        savings_annual:    null,
        comparison_label:  null,
        comparison_value:  null
      },
      selected_plan_id:    null,
      drawer_state:        'empty',  // empty | summary | full | enrolled
      completed_pct:       0,
      email:               null,
      phone:               null,
      sms_opt_in:          false,
      is_authed:           false,
      is_skipped:          false,
      conversation_history: [],
      last_activity:       null
    };
  }

  function mergeState(prev, next) {
    var out = shallowMerge(prev, next);
    // Deep-merge nested objects.
    out.quiz_answers        = shallowMerge(prev.quiz_answers || {},        next.quiz_answers || {});
    out.discovery_progress  = shallowMerge(prev.discovery_progress || {}, next.discovery_progress || {});
    out.estimate            = shallowMerge(prev.estimate || {},           next.estimate || {});
    if (Array.isArray(next.conversation_history)) {
      out.conversation_history = next.conversation_history.slice();
    } else {
      out.conversation_history = (prev.conversation_history || []).slice();
    }
    return out;
  }

  function shallowMerge(a, b) {
    var out = {};
    var k;
    for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) out[k] = a[k];
    for (k in b) if (Object.prototype.hasOwnProperty.call(b, k)) {
      if (b[k] !== undefined) out[k] = b[k];
    }
    return out;
  }

  function generateSessionId() {
    return 'ses_mock_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  // Mock JWT — base64url of JSON. Not cryptographically signed.
  // Real backend uses HS256 (see endpoints-contract §9).
  function mockJwt(payload) {
    var p = shallowMerge({
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      nonce: Math.random().toString(36).slice(2)
    }, payload || {});
    var header = b64url(JSON.stringify({ alg: 'mock', typ: 'JWT' }));
    var body   = b64url(JSON.stringify(p));
    var sig    = b64url('mock-signature-' + Math.random().toString(36).slice(2, 8));
    return header + '.' + body + '.' + sig;
  }

  function decodeMockJwt(token) {
    if (!token || typeof token !== 'string') return null;
    var parts = token.split('.');
    if (parts.length !== 3) {
      // Allow demo tokens like "test_token_xyz" — synthesize a default payload.
      return { ses: 'ses_mock_token', email: null, type: 'magic_link' };
    }
    try {
      return JSON.parse(b64urlDecode(parts[1]));
    } catch (err) {
      return null;
    }
  }

  function b64url(str) {
    var b64 = (typeof btoa === 'function') ? btoa(unescape(encodeURIComponent(str))) : '';
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function b64urlDecode(str) {
    var b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return decodeURIComponent(escape((typeof atob === 'function') ? atob(b64) : ''));
  }

  function buildResumeUrl(token) {
    var origin = global.location.origin;
    var path = global.location.pathname;
    return origin + path + '?token=' + encodeURIComponent(token) + '&ref=email-link';
  }

  function isValidEmail(email) {
    return typeof email === 'string' &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function log() {
    if (!global.console || !global.console.log) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[NoraSession]');
    global.console.log.apply(global.console, args);
  }

  // ─── EXPORT ──────────────────────────────────────────────────
  global.NoraSession = NoraSession;

})(typeof window !== 'undefined' ? window : this);
