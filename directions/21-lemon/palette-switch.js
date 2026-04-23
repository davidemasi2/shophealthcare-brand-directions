/* =============================================================
   palette-switch.js — Direction 21 · Lemon
   Injects a fixed-top-right widget with:
     · 6-palette switcher (chips swap body theme-* class, persists)
     · Cross-page navigator (collapsible list of all variants)
   Shared across all HTML files in 21-lemon/
   ============================================================= */
(function () {
  'use strict';

  var STORAGE_KEY = 'lemonTheme21';

  var palettes = [
    { id: 'theme-original',  name: 'Original',  p1: '#FFE4DB', p2: '#FFE86E', p3: '#FF6A5C' },
    { id: 'theme-heritage',  name: 'Heritage',  p1: '#F4F8FB', p2: '#FFD25C', p3: '#3D9AB3' },
    { id: 'theme-disruptor', name: 'Disruptor', p1: '#FAF6E8', p2: '#D8FF4A', p3: '#FF2E63' },
    { id: 'theme-sunset',    name: 'Sunset',    p1: '#FFE9D6', p2: '#FFB347', p3: '#C0392B' },
    { id: 'theme-clinic',    name: 'Clinic',    p1: '#F0F5EC', p2: '#F5DC6B', p3: '#2F8060' },
    { id: 'theme-almanac',   name: 'Almanac',   p1: '#F2EBDB', p2: '#E8C547', p3: '#C8273A' },
    { id: 'theme-shc-match', name: 'SHC-Match', p1: '#FFFFFF', p2: '#FFC857', p3: '#00B5D8' },
    { id: 'theme-y2k',       name: 'Y2K',       p1: '#FFE7F5', p2: '#FFDE3A', p3: '#00D9FF' }
  ];

  var pages = [
    { href: 'index.html',                       label: 'Index',          klass: 'ps-home'   },
    { href: 'homepage-v1-original-quiet.html',  label: 'V1 · Orig Quiet'                    },
    { href: 'homepage-v2-original-loud.html',   label: 'V2 · Orig Loud'                     },
    { href: 'homepage-v3-heritage-quiet.html',  label: 'V3 · Hrtg Quiet'                    },
    { href: 'homepage-v4-heritage-loud.html',   label: 'V4 · Hrtg Loud'                     },
    { href: 'homepage-v5-disruptor-quiet.html', label: 'V5 · Disr Quiet'                    },
    { href: 'homepage-v6-disruptor-loud.html',  label: 'V6 · Disr Loud'                     },
    { href: 'reskin-shophealthcare-com.html',   label: 'Reskin · .com',  klass: 'ps-reskin' }
  ];

  function currentPage() {
    var path = (location.pathname || '').split('/').pop() || 'index.html';
    return path;
  }

  function currentTheme() {
    var m = (document.body.className || '').match(/theme-[\w-]+/);
    return m ? m[0] : 'theme-original';
  }

  function applyTheme(t) {
    document.body.className = (document.body.className || '')
      .replace(/theme-[\w-]+/, t);
    if (!/theme-/.test(document.body.className)) {
      document.body.className += ' ' + t;
    }
    try { localStorage.setItem(STORAGE_KEY, t); } catch (_) { /* ignore */ }
    Array.prototype.forEach.call(
      document.querySelectorAll('.palette-switch .ps-chip'),
      function (c) { c.classList.toggle('active', c.dataset.theme === t); }
    );
  }

  function build() {
    if (document.querySelector('.palette-switch')) return;

    var saved;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) { saved = null; }
    if (saved && palettes.some(function (p) { return p.id === saved; })) {
      document.body.className = (document.body.className || '')
        .replace(/theme-[\w-]+/, saved);
    }
    var active = currentTheme();
    var here = currentPage();

    var root = document.createElement('div');
    root.className = 'palette-switch';
    root.setAttribute('aria-label', 'Palette and page switcher');

    var label = document.createElement('div');
    label.className = 'ps-label';
    label.textContent = 'Palette';
    root.appendChild(label);

    var rail = document.createElement('div');
    rail.className = 'ps-rail';
    palettes.forEach(function (p) {
      var btn = document.createElement('button');
      btn.className = 'ps-chip' + (p.id === active ? ' active' : '');
      btn.dataset.theme = p.id;
      btn.style.setProperty('--p1', p.p1);
      btn.style.setProperty('--p2', p.p2);
      btn.style.setProperty('--p3', p.p3);
      btn.title = p.name;
      btn.setAttribute('aria-label', 'Switch to ' + p.name + ' palette');
      var tip = document.createElement('span');
      tip.className = 'ps-tip';
      tip.textContent = p.name;
      btn.appendChild(tip);
      btn.addEventListener('click', function () { applyTheme(p.id); });
      rail.appendChild(btn);
    });
    root.appendChild(rail);

    var hr = document.createElement('hr');
    hr.className = 'ps-divider';
    root.appendChild(hr);

    var toggle = document.createElement('button');
    toggle.className = 'ps-toggle';
    toggle.type = 'button';
    toggle.innerHTML = 'Pages <span class="caret">▾</span>';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () {
      var open = root.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    root.appendChild(toggle);

    var pageList = document.createElement('div');
    pageList.className = 'ps-pages';
    pages.forEach(function (pg) {
      var a = document.createElement('a');
      a.className = 'ps-page' + (pg.klass ? ' ' + pg.klass : '');
      a.href = pg.href;
      if (pg.href === here) a.setAttribute('aria-current', 'page');
      var dot = document.createElement('span');
      dot.className = 'ps-dot';
      a.appendChild(dot);
      a.appendChild(document.createTextNode(pg.label));
      pageList.appendChild(a);
    });
    root.appendChild(pageList);

    document.body.appendChild(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
