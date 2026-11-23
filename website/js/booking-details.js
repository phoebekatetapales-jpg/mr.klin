// Booking details page: shows the booking saved on this device by the booking dialog
(function () {
  var TEXT = {
    en: {
      langGroup: 'Language', pill: 'Booking received',
      title: 'Thank you, {name}! Your booking is in.',
      lead: "We'll text or call you at {phone} to confirm your schedule and final price.",
      emptyTitle: 'No booking to show yet',
      emptyLead: "Your booking details will appear here after you book a service on this device.",
      emptyText: "We couldn't find a recent booking on this device. Book a service and your details will show up here right away.",
      details: 'Booking details', ref: 'Reference no.', status: 'Waiting for confirmation', services: 'Services',
      email: 'Email', car: 'Car', plate: 'Plate no.', notes: 'Your notes',
      booked: 'Booked on {date}',
      noteTitle: 'Important reminders',
      orcr: "Please bring your vehicle's <b>OR/CR</b> (Official Receipt and Certificate of Registration) on the day of your service.",
      down: 'A downpayment of <b>at least 50%</b> of your total estimated price is required to secure your booking.',
      change: 'Need to change or cancel? Call <a href="tel:09178805755">0917-880-5755</a> or message us on Messenger and mention your reference number.',
      messenger: 'Send details on Messenger', call: 'Call 0917-880-5755', print: 'Save or print',
      another: 'Book another service', book: 'Book a service', contact: 'Contact us',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    tl: {
      langGroup: 'Wika', pill: 'Natanggap na ang booking',
      title: 'Salamat, {name}! Natanggap na namin ang booking mo.',
      lead: 'Ite-text o tatawagan ka namin sa {phone} para kumpirmahin ang schedule at final na presyo.',
      emptyTitle: 'Wala pang booking na maipapakita',
      emptyLead: 'Lalabas dito ang detalye ng booking mo pagkatapos mong mag-book sa device na ito.',
      emptyText: 'Wala kaming nakitang bagong booking sa device na ito. Mag-book ng serbisyo at lalabas agad dito ang iyong detalye.',
      details: 'Detalye ng booking', ref: 'Reference no.', status: 'Hinihintay ang kumpirmasyon', services: 'Mga serbisyo',
      email: 'Email', car: 'Sasakyan', plate: 'Plate no.', notes: 'Iyong mga tala',
      booked: 'Na-book noong {date}',
      noteTitle: 'Mahalagang paalala',
      orcr: 'Pakidala ang <b>OR/CR</b> ng iyong sasakyan (Official Receipt at Certificate of Registration) sa araw ng serbisyo.',
      down: 'Kailangan ng downpayment na <b>hindi bababa sa 50%</b> ng kabuuang tinatayang presyo para ma-secure ang iyong booking.',
      change: 'Kailangang baguhin o i-cancel? Tumawag sa <a href="tel:09178805755">0917-880-5755</a> o mag-message sa Messenger at banggitin ang iyong reference number.',
      messenger: 'Ipadala ang detalye sa Messenger', call: 'Tumawag sa 0917-880-5755', print: 'I-save o i-print',
      another: 'Mag-book ng iba pang serbisyo', book: 'Mag-book ng serbisyo', contact: 'Makipag-ugnayan',
      months: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre']
    }
  };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var booking = null, lang = 'en';
  try {
    booking = JSON.parse(localStorage.getItem('mrklin-last-booking') || 'null');
    if (localStorage.getItem('mrklin-booking-lang') === 'tl') lang = 'tl';
  } catch (e) {}
  if (booking && !(booking.text && booking.text.en && booking.text.tl)) booking = null;

  function render() {
    var T = TEXT[lang];
    document.documentElement.lang = lang === 'tl' ? 'tl' : 'en';
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = T[el.dataset.t]; });
    document.querySelectorAll('[data-t-html]').forEach(function (el) { el.innerHTML = T[el.dataset.tHtml]; });
    document.querySelectorAll('[data-t-aria]').forEach(function (el) { el.setAttribute('aria-label', T[el.dataset.tAria]); });
    document.querySelectorAll('.bd-intro [data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    $('bdFound').hidden = !booking; $('bdEmpty').hidden = !!booking;
    document.querySelector('.bd-intro .pill').style.display = booking ? '' : 'none';
    if (!booking) {
      $('bdTitle').textContent = T.emptyTitle; $('bdLead').textContent = T.emptyLead;
      return;
    }
    var B = booking.text[lang], first = booking.name.split(/\s+/)[0];
    $('bdTitle').textContent = T.title.replace('{name}', first);
    $('bdLead').textContent = T.lead.replace('{phone}', booking.phone);
    // web-<time>-<code>: the short code is what customers read out
    $('bdRef').textContent = booking.id ? 'MK-' + String(booking.id).split('-').pop().toUpperCase() : '—';
    $('bdServices').innerHTML = B.services.map(function (s) { return '<li><span>' + esc(s[0]) + '</span><span class="bd-price">' + esc(s[1]) + '</span></li>'; }).join('');
    var rows = B.rows.slice(0, 1);
    if (booking.email) rows.push([T.email, booking.email]);
    if (booking.car) rows.push([T.car, booking.car]);
    if (booking.plate) rows.push([T.plate, booking.plate]);
    rows = rows.concat(B.rows.slice(1));
    if (booking.notes) rows.push([T.notes, booking.notes]);
    $('bdRows').innerHTML = rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
    var d = new Date(booking.createdAt);
    $('bdBooked').textContent = T.booked.replace('{date}', T.months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear());
    $('bdDown').textContent = B.down;
    $('bdMessenger').href = 'https://m.me/mrklintradingandservicescorp?text=' + encodeURIComponent(booking.message);
  }
  document.querySelector('.bd-intro .bk-lang').addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang]'); if (!b || b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    try { localStorage.setItem('mrklin-booking-lang', lang); } catch (err) {}
    render();
  });
  $('bdPrint').addEventListener('click', function () { window.print(); });
  render();
})();
