// Our Work gallery. To add a photo: put it in images/work/ and add a line below.
(function () {
  var PHOTOS = [
    { src: 'images/work/work-1.jpg', w: 560, h: 700, title: 'Exterior detail & polish', category: 'Detailing', alt: 'Freshly detailed bronze SUV with a mirror-gloss finish' },
    { src: 'images/hero.jpg', w: 1600, h: 893, title: 'Machine polishing in the bay', category: 'Detailing', alt: 'Detailers machine-polishing and hand-drying a black sedan inside the shop' },
    { src: 'images/work/work-2.jpg', w: 560, h: 700, title: 'Underchassis & rustproofing', category: 'Protection', alt: 'Underchassis of a vehicle on a lift after rustproof coating' },
    { src: 'images/work/work-3.jpg', w: 560, h: 700, title: 'Aircon service', category: 'Mechanical', alt: "Technician's gauges connected to an SUV's aircon system" },
    { src: 'images/work/work-4.jpg', w: 560, h: 700, title: 'Dashboard & wiring repair', category: 'Electrical', alt: 'Van interior with the dashboard removed for wiring repair' },
    { src: 'images/work/work-8.jpg', w: 1600, h: 1200, title: 'Paint correction on a hybrid sedan', category: 'Detailing', alt: 'Detailer machine-polishing the roof of a black Toyota hybrid sedan in the shop' },
    { src: 'images/work/work-6.jpg', w: 1600, h: 1200, title: 'Lift service & brake check', category: 'Mechanical', alt: 'Grey SUV raised on a two-post lift with wheels removed for brake service' },
    { src: 'images/work/work-5.jpg', w: 1200, h: 1600, title: 'Fresh from the bay', category: 'Detailing', alt: 'Glossy silver Kia SUV parked under the shop’s hexagon lights after service' },
    { src: 'images/work/work-7.jpg', w: 1200, h: 1600, title: 'Car show winner', category: 'Showcase', alt: 'Trophy displayed under the open hood of a black Nissan at an auto show' }
  ];
  var $ = function (id) { return document.getElementById(id); };
  var filter = 'All', visible = [], current = 0;
  var cats = ['All'].concat(PHOTOS.map(function (p) { return p.category; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function renderFilters() {
    $('galFilters').innerHTML = cats.map(function (c) {
      var n = c === 'All' ? PHOTOS.length : PHOTOS.filter(function (p) { return p.category === c; }).length;
      return '<button type="button" data-cat="' + esc(c) + '" aria-pressed="' + (c === filter) + '"' + (c === filter ? ' class="on"' : '') + '>' + esc(c) + ' <small>' + n + '</small></button>';
    }).join('');
  }
  function renderGrid() {
    visible = PHOTOS.filter(function (p) { return filter === 'All' || p.category === filter; });
    $('galGrid').innerHTML = visible.map(function (p, i) {
      var wide = p.w > p.h * 1.2 ? ' wide' : '';
      return '<button type="button" class="gal-item' + wide + '" data-i="' + i + '" aria-label="Open photo: ' + esc(p.title) + '">' +
        '<img src="' + esc(p.src) + '" width="' + p.w + '" height="' + p.h + '" alt="' + esc(p.alt) + '" loading="lazy">' +
        '<span class="gal-cap"><small>' + esc(p.category) + '</small>' + esc(p.title) + '</span></button>';
    }).join('');
    $('galEmpty').hidden = visible.length > 0;
  }
  function show(i) {
    current = (i + visible.length) % visible.length;
    var p = visible[current];
    $('lbImg').src = p.src; $('lbImg').alt = p.alt;
    $('lbTitle').textContent = p.title;
    $('lbMeta').textContent = p.category + ' · ' + (current + 1) + ' of ' + visible.length;
    var single = visible.length < 2;
    $('lbPrev').hidden = single; $('lbNext').hidden = single;
  }

  $('galFilters').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    filter = b.dataset.cat; renderFilters(); renderGrid();
  });
  $('galGrid').addEventListener('click', function (e) {
    var b = e.target.closest('.gal-item'); if (!b) return;
    show(+b.dataset.i); $('lightbox').showModal();
  });
  $('lbPrev').addEventListener('click', function () { show(current - 1); });
  $('lbNext').addEventListener('click', function () { show(current + 1); });
  $('lbClose').addEventListener('click', function () { $('lightbox').close(); });
  $('lightbox').addEventListener('click', function (e) { if (e.target === this) this.close(); });
  $('lightbox').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  // Swipe left/right on phones
  var startX = null;
  $('lightbox').addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  $('lightbox').addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX; startX = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });

  renderFilters(); renderGrid();
})();
