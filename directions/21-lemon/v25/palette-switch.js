/* =============================================================
   palette-switch.js — Direction 21 · Lemon
   Page navigator only — palette switcher REMOVED 2026-04-29.
   Single canonical theme: V23 SHC-Match (defined on :root in lemon.css).
   ============================================================= */
(function () {
  'use strict';

  var pages = [
    { href: '../toc.html',                         label: 'TOC',            klass: 'ps-home'   },
    { href: 'homepage.html', label: 'V25 · Persona Quiz', klass: 'ps-current' },
    { href: 'nora-app/?p=SP1&s=TX&a=35&x=M&pg=0&c=none', label: 'V25 · Nora App', klass: 'ps-current' },
    { href: '../homepage-v1-original-quiet.html',  label: 'V1 · Orig Quiet',   klass: 'ps-archive' },
    { href: '../homepage-v2-original-loud.html',   label: 'V2 · Orig Loud',    klass: 'ps-archive' },
    { href: '../homepage-v3-heritage-quiet.html',  label: 'V3 · Hrtg Quiet',   klass: 'ps-archive' },
    { href: '../homepage-v4-heritage-loud.html',   label: 'V4 · Hrtg Loud',    klass: 'ps-archive' },
    { href: '../homepage-v5-disruptor-quiet.html', label: 'V5 · Disr Quiet',   klass: 'ps-archive' },
    { href: '../homepage-v6-disruptor-loud.html',  label: 'V6 · Disr Loud',    klass: 'ps-archive' },
    { href: '../homepage-v7-com-clone.html',       label: 'V7 · .com Clone',   klass: 'ps-archive' },
    { href: '../homepage-v8-clone-optimized.html', label: 'V8 · Switchboard',  klass: 'ps-archive' },
    { href: '../homepage-v9-journey-fork.html',    label: 'V9 · Journey Fork', klass: 'ps-archive' },
    { href: '../homepage-v10-simplified.html',     label: 'V10 · Simplified',  klass: 'ps-archive' },
    { href: '../homepage-v11-conversion.html',     label: 'V11 · Conversion',  klass: 'ps-archive' },
    { href: '../homepage-v12-clean.html',          label: 'V12 · Clean',       klass: 'ps-archive' },
    { href: '../homepage-v13-refined.html',        label: 'V13 · Refined',     klass: 'ps-archive' },
    { href: '../homepage-v14-immaculate.html',     label: 'V14 · Immaculate',  klass: 'ps-archive' },
    { href: '../homepage-v15-precise.html',        label: 'V15 · Precise',     klass: 'ps-archive' },
    { href: '../homepage-v16-skill-aligned.html',  label: 'V16 · Skill-Aligned', klass: 'ps-archive' },
    { href: '../homepage-v17-tile-rewrite.html',   label: 'V17 · Tile Rewrite', klass: 'ps-archive' },
    { href: '../homepage-v18-howmath-checklist.html', label: 'V18 · How the Math', klass: 'ps-archive' },
    { href: '../homepage-v19-deploy-polish.html',  label: 'V19 · Deploy Polish', klass: 'ps-archive' },
    { href: '../reskin-shophealthcare-com.html',   label: 'Reskin · .com',     klass: 'ps-archive' }
  ];

  function currentPage() {
    var path = (location.pathname || '').split('/').pop() || 'index.html';
    return path;
  }

  function build() {
    if (document.querySelector('.palette-switch')) return;

    var here = currentPage();

    var root = document.createElement('div');
    root.className = 'palette-switch';
    root.setAttribute('aria-label', 'Page navigator');

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
