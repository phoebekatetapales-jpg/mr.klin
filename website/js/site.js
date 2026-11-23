// Dark / light mode toggle (remembers the visitor's choice)
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  function sync() {
    var label = root.getAttribute('data-theme') === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  }
  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mrklin-theme', next); } catch (e) {}
    sync();
  });
  sync();

  // Mobile menu: the hamburger opens the nav as a drop-down panel
  var header = document.querySelector('header.site');
  var menuBtn = document.getElementById('menuToggle');
  function setMenu(open) {
    header.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!header.classList.contains('nav-open')); });
  document.querySelectorAll('#mainNav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && header.classList.contains('nav-open')) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener('click', function (e) { if (!header.contains(e.target)) setMenu(false); });

  // Header shadow once the page has scrolled
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Scroll reveal + stat count-up (skipped when the visitor prefers reduced motion)
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm && 'IntersectionObserver' in window) {
    var REVEAL = '.section-head, .story-copy, .story-text, .grid > *, .stats, .benefit, .gallery figure, .gal-item, .gal-bar,' +
      ' .contact-copy, .contact-card, .ceramic-art, .ceramic-copy, .values > *, .steps li, .offer, .svc-copy, .svc-photo, .svc-panel,' +
      ' .price-table-wrap, .faq-copy, .faq details, .svc-cta, .bd-card, .bd-side, .reach-card, .msg-form, .map-wrap, .photo-credits, .footer-main > *';
    var countUp = function (el) {
      var m = el.textContent.trim().match(/^(\d+)(\+?)$/); if (!m) return;
      var end = +m[1], t0 = null;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / 1200, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + m[2];
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      setTimeout(function () { el.textContent = m[1] + m[2]; }, 1400); // always land on the real number
    };
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.matches('.stats')) e.target.querySelectorAll('.stat strong').forEach(countUp);
        revealer.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    var tagReveals = function () {
      document.querySelectorAll(REVEAL).forEach(function (el) {
        if (el.classList.contains('reveal')) return;
        // Stagger siblings in the same row so cards arrive one after another
        var i = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.setProperty('--reveal-delay', (Math.min(i, 5) * 0.07) + 's');
        el.classList.add('reveal');
        revealer.observe(el);
      });
    };
    tagReveals();
    // The Our Work gallery redraws its photos when a filter is picked
    var grid = document.getElementById('galGrid');
    if (grid) new MutationObserver(tagReveals).observe(grid, { childList: true });
  }

  // Highlight the nav link for the section on screen
  var links = document.querySelectorAll('nav.main a');
  var map = { home: 0, about: 0, services: 2, packages: 2, ceramic: 2, work: 3, contact: 4 };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id] !== undefined) {
          links.forEach(function (l) { l.classList.remove('active'); });
          links[map[e.target.id]].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
