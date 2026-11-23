// Booking & estimate: vehicle + services -> calendar slot -> contact details,
// then the request is saved to the dashboard (or sent by Messenger / SMS as a fallback).
// The customer can switch the dialog between English and Tagalog; what is sent to
// the shop always stays in English so the dashboard reads the same.
(function () {
  var SHOP_SMS = '09178805755';
  var SHOP_MESSENGER = 'https://m.me/mrklintradingandservicescorp';
  var BOOKINGS_API = 'https://mr-klin.vercel.app/api/bookings'; // shows up on the Mr. Klin dashboard
  var BOOK_AHEAD_DAYS = 60;
  var DOWNPAYMENT = 0.5; // at least 50% of the estimated total
  var TIMES = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

  var TEXT = {
    en: {
      langGroup: 'Language', close: 'Close',
      kicker: 'Book a service', title: 'Get your estimate & pick a slot',
      step1: '1. Car & services', step2: '2. Date & time', step3: '3. Your details',
      vehLabel: 'Your vehicle', svcLabel: 'Services (choose one or more)',
      mobileToggle: 'Home / office service <small>— we come to you (fee confirmed by our team)</small>',
      dateLabel: 'Choose a date', prevMonth: 'Previous month', nextMonth: 'Next month',
      timeLabel: 'Choose a time', timeHint: 'Pick a date first.',
      name: 'Full name', phone: 'Mobile number', email: 'Email address', car: 'Car make & model', carPh: 'e.g. Toyota Fortuner 2021',
      plate: 'Plate number <small style="color:var(--muted)">(optional)</small>',
      addr: 'Service address', addrPh: 'Where should we go?',
      notes: 'Notes <small style="color:var(--muted)">(optional)</small>',
      notesPh: 'Anything we should know — stains, dents, warning lights…',
      photos: 'Photos of your unit <small>(optional, up to 3)</small>',
      photosHint: 'Show us the car and any problem areas — scratches, dents, stains. It helps us quote faster.',
      photoAdd: 'Add photo', photoRemove: 'Remove photo', photoAlt: 'Photo of your unit',
      errPhoto: "We couldn't read that photo. Please try a different one.", errPhotoMax: 'You can add up to 3 photos.',
      remTitle: 'Before your visit',
      remOrcr: "Please bring your vehicle's <b>OR/CR</b> (Official Receipt and Certificate of Registration).",
      remDown: 'A downpayment of <b>at least 50%</b> of your total estimated price is required to secure your booking.',
      downAmt: 'For this booking, that is at least {amt}.',
      downAmtFrom: 'For this booking, that is at least {amt} (more if the final price is higher).',
      downQuote: 'The amount will be based on your quote after inspection.',
      summary: 'Your booking', doneTitle: 'Booking received!',
      doneText: "We'll text or call you to confirm your slot and final price.",
      sendMessenger: 'Send via Messenger', sendSms: 'Send via SMS', copy: 'Copy details', copied: 'Copied!',
      copyPrompt: 'Copy your booking details:',
      call: 'Prefer to talk? Call <a href="tel:09178805755">0917-880-5755</a>.',
      totalLabel: 'Estimated total', back: 'Back',
      next: ['Next: pick a date', 'Next: your details', 'Confirm booking'], sending: 'Sending…',
      from: 'from ', quoteAfter: 'Quote after inspection',
      noteVehicle: 'Select your vehicle to see prices', noteService: 'Select at least one service',
      noteQuoted: 'Quoted after inspection', noteFinal: 'Final price confirmed after inspection',
      notePlusQuote: function (n) { return '+ ' + n + ' service' + (n > 1 ? 's' : '') + ' quoted after inspection'; },
      rowVehicle: 'Vehicle', rowServices: 'Services', rowDate: 'Date', rowTime: 'Time', rowWhere: 'Where',
      rowEstimate: 'Estimate', rowDown: 'Downpayment (50%)',
      whereHome: 'Home / office service', whereShop: 'At the shop — ',
      branchLabel: 'Which branch?', branchTaguig: 'Taguig — Bagumbayan', branchSucat: 'Sucat — Parañaque',
      quoteFor: ' + quote for ', afterQuote: 'After your quote',
      errVehicle: 'Please choose your vehicle type.', errService: 'Please choose at least one service.',
      errDate: 'Please choose a date.', errTime: 'Please choose a time.',
      errName: 'Please enter your name.', errPhone: 'Please enter a valid mobile number.', errEmail: 'Please enter a valid email address.',
      errAddr: 'Please enter the address for the home / office service.',
      sentIntro: 'Want a faster reply? You can also send these details to us directly:',
      failIntro: "We couldn't save your booking online just now. Please send it to us with one tap instead:",
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    tl: {
      langGroup: 'Wika', close: 'Isara',
      kicker: 'Mag-book ng serbisyo', title: 'Alamin ang presyo at pumili ng schedule',
      step1: '1. Sasakyan at serbisyo', step2: '2. Petsa at oras', step3: '3. Iyong detalye',
      vehLabel: 'Ang iyong sasakyan', svcLabel: 'Mga serbisyo (pumili ng isa o higit pa)',
      mobileToggle: 'Home / office service <small>— kami ang pupunta sa inyo (kukumpirmahin ng aming team ang bayad)</small>',
      dateLabel: 'Pumili ng petsa', prevMonth: 'Nakaraang buwan', nextMonth: 'Susunod na buwan',
      timeLabel: 'Pumili ng oras', timeHint: 'Pumili muna ng petsa.',
      name: 'Buong pangalan', phone: 'Mobile number', email: 'Email address', car: 'Brand at modelo ng sasakyan', carPh: 'hal. Toyota Fortuner 2021',
      plate: 'Plate number <small style="color:var(--muted)">(opsyonal)</small>',
      addr: 'Address ng serbisyo', addrPh: 'Saan kami pupunta?',
      notes: 'Mga tala <small style="color:var(--muted)">(opsyonal)</small>',
      notesPh: 'May dapat ba kaming malaman? — mantsa, yupi, warning lights…',
      photos: 'Mga litrato ng sasakyan <small>(opsyonal, hanggang 3)</small>',
      photosHint: 'Ipakita ang sasakyan at ang mga parteng may problema — gasgas, yupi, mantsa. Mas mabilis naming maibibigay ang presyo.',
      photoAdd: 'Magdagdag ng litrato', photoRemove: 'Alisin ang litrato', photoAlt: 'Litrato ng sasakyan mo',
      errPhoto: 'Hindi namin mabasa ang litratong iyan. Pakisubukan ang iba.', errPhotoMax: 'Hanggang 3 litrato lang ang puwede.',
      remTitle: 'Bago ka pumunta',
      remOrcr: 'Pakidala ang <b>OR/CR</b> ng iyong sasakyan (Official Receipt at Certificate of Registration).',
      remDown: 'Kailangan ng downpayment na <b>hindi bababa sa 50%</b> ng kabuuang tinatayang presyo para ma-secure ang iyong booking.',
      downAmt: 'Para sa booking na ito, hindi bababa sa {amt}.',
      downAmtFrom: 'Para sa booking na ito, hindi bababa sa {amt} (mas mataas kung tataas ang final na presyo).',
      downQuote: 'Ibabatay ang halaga sa presyo pagkatapos ng inspeksyon.',
      summary: 'Ang iyong booking', doneTitle: 'Natanggap na ang booking mo!',
      doneText: 'Ite-text o tatawagan ka namin para kumpirmahin ang schedule at final na presyo.',
      sendMessenger: 'Ipadala sa Messenger', sendSms: 'Ipadala sa SMS', copy: 'Kopyahin ang detalye', copied: 'Nakopya na!',
      copyPrompt: 'Kopyahin ang detalye ng booking:',
      call: 'Mas gusto mong tumawag? Tawagan kami sa <a href="tel:09178805755">0917-880-5755</a>.',
      totalLabel: 'Tinatayang kabuuan', back: 'Bumalik',
      next: ['Susunod: pumili ng petsa', 'Susunod: iyong detalye', 'Kumpirmahin ang booking'], sending: 'Ipinapadala…',
      from: 'mula ', quoteAfter: 'Presyo pagkatapos ng inspeksyon',
      noteVehicle: 'Piliin ang sasakyan para makita ang presyo', noteService: 'Pumili ng kahit isang serbisyo',
      noteQuoted: 'Presyo pagkatapos ng inspeksyon', noteFinal: 'Kukumpirmahin ang final na presyo pagkatapos ng inspeksyon',
      notePlusQuote: function (n) { return '+ ' + n + ' serbisyong ipe-presyo pagkatapos ng inspeksyon'; },
      rowVehicle: 'Sasakyan', rowServices: 'Mga serbisyo', rowDate: 'Petsa', rowTime: 'Oras', rowWhere: 'Saan',
      rowEstimate: 'Tinatayang presyo', rowDown: 'Downpayment (50%)',
      whereHome: 'Home / office service', whereShop: 'Sa shop — ',
      branchLabel: 'Aling branch?', branchTaguig: 'Taguig — Bagumbayan', branchSucat: 'Sucat — Parañaque',
      quoteFor: ' + quote para sa ', afterQuote: 'Pagkatapos ng quote',
      errVehicle: 'Pakipili ang uri ng iyong sasakyan.', errService: 'Pumili ng kahit isang serbisyo.',
      errDate: 'Pakipili ng petsa.', errTime: 'Pakipili ng oras.',
      errName: 'Pakilagay ang iyong pangalan.', errPhone: 'Pakilagay ang tamang mobile number.', errEmail: 'Pakilagay ang tamang email address.',
      errAddr: 'Pakilagay ang address para sa home / office service.',
      sentIntro: 'Gusto mo ng mas mabilis na sagot? Puwede mo ring ipadala sa amin ang detalye nang direkta:',
      failIntro: 'Hindi namin na-save online ang booking mo ngayon. Ipadala na lang ito sa amin sa isang tap:',
      months: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
      days: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
      weekdays: ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado']
    }
  };

  // size: 0 = small, 1 = mid-size, 2 = large
  var VEHICLES = [
    { id: 'sedan', label: 'Sedan', size: 0 },
    { id: 'hatch', label: 'Hatchback', size: 0 },
    { id: 'coupe', label: 'Sports / coupe', size: 0 },
    { id: 'suv', label: 'SUV / crossover', size: 1 },
    { id: 'pickup', label: 'Pickup', size: 1 },
    { id: 'van', label: 'Van / MPV', size: 2 }
  ];
  // price: [small, mid-size, large]; from: price is a starting point; null price = quoted after inspection
  // name/desc are English (also what is sent to the shop); tl holds the Tagalog [name, desc] shown on screen
  var SERVICES = [
    { id: 'spa', name: 'Auto Spa Package', desc: 'Wash, asphalt removal, machine wax, engine wash, hyperdressing', price: [2250, 2590, 2930],
      tl: ['Auto Spa Package', 'Car wash, pagtanggal ng aspalto, machine wax, engine wash, hyperdressing'] },
    { id: 'interior', name: 'Interior Detail', desc: 'Full cabin clean, priced by vehicle size', price: [4000, 5000, 6000], group: 'interior',
      tl: ['Interior Detail', 'Buong linis ng loob ng sasakyan, presyo ayon sa laki'] },
    { id: 'interior-deep', name: 'Interior Detail + carpet dismantle', desc: 'Seats and carpets out for a deep clean', price: [5500, 6500, 7500], group: 'interior',
      tl: ['Interior Detail + pagtanggal ng carpet', 'Tinatanggal ang upuan at carpet para sa malalimang linis'] },
    { id: 'exterior', name: 'Exterior Detail', desc: 'Full exterior treatment', price: [4000, 6500, 9000],
      tl: ['Exterior Detail', 'Buong treatment sa labas ng sasakyan'] },
    { id: 'underchassis', name: 'Underchassis & rustproofing', desc: 'Rust & corrosion prevention, chassis protection', price: [1800, 1800, 1800], from: true,
      tl: ['Underchassis at rustproofing', 'Proteksyon laban sa kalawang at kaagnasan ng chassis'] },
    { id: 'ceramic', name: 'Nano ceramic coating', desc: 'Long-lasting gloss and paint protection', price: null,
      tl: ['Nano ceramic coating', 'Pangmatagalang kintab at proteksyon ng pintura'] },
    { id: 'tint', name: 'Tint film / PPF', desc: 'Window tint or paint protection film', price: null,
      tl: ['Tint film / PPF', 'Tint ng bintana o paint protection film'] },
    { id: 'pms', name: 'Preventive maintenance (PMS)', desc: 'Oil, filters, battery & tire services', price: null,
      tl: ['Preventive maintenance (PMS)', 'Langis, filter, baterya at gulong'] },
    { id: 'aircon', name: 'Aircon service', desc: 'Cleaning, recharge & check-up', price: null,
      tl: ['Aircon service', 'Paglilinis, recharge at check-up'] },
    { id: 'body', name: 'Body repair & paint', desc: 'Dents, scratches, repainting', price: null,
      tl: ['Body repair at pintura', 'Yupi, gasgas, repainting'] },
    { id: 'accessories', name: 'Accessories & electrical', desc: 'Upholstery, sounds & lights, dashcam, central lock', price: null,
      tl: ['Accessories at electrical', 'Upholstery, sounds at ilaw, dashcam, central lock'] }
  ];

  var dlg = document.getElementById('booking');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var $ = function (id) { return document.getElementById(id); };
  var peso = function (n) { return '₱' + n.toLocaleString('en-PH'); };
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var lastDay = new Date(today); lastDay.setDate(lastDay.getDate() + BOOK_AHEAD_DAYS);
  var state = { step: 0, vehicle: null, services: {}, date: null, time: null, view: new Date(today.getFullYear(), today.getMonth(), 1), error: '', intro: '' };

  // ----- Language -----
  var lang = 'en';
  try { if (localStorage.getItem('mrklin-booking-lang') === 'tl') lang = 'tl'; } catch (e) {}
  function t(key) { return TEXT[lang][key]; }
  function svcName(s) { return lang === 'tl' ? s.tl[0] : s.name; }
  function svcDesc(s) { return lang === 'tl' ? s.tl[1] : s.desc; }
  function applyLang() {
    dlg.lang = lang === 'tl' ? 'tl' : 'en';
    dlg.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    dlg.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.dataset.i18nHtml); });
    dlg.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.dataset.i18nPh); });
    dlg.querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    dlg.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    SERVICES.forEach(function (s) {
      dlg.querySelector('[data-svc-name="' + s.id + '"]').textContent = svcName(s);
      dlg.querySelector('[data-svc-desc="' + s.id + '"]').textContent = svcDesc(s);
    });
    if (!$('bkNextStep').disabled) $('bkNextStep').textContent = t('next')[state.step];
    if (state.error) showError(t(state.error));
    if (state.intro) $('bkSendIntro').textContent = t(state.intro);
    if (typeof renderPhotos === 'function' && photos) renderPhotos();
    renderPrices();
    if (state.step === 1) { renderCalendar(); renderTimes(); }
    if (state.step === 2) renderSummary();
  }
  dlg.querySelector('.bk-lang').addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang]'); if (!b || b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    try { localStorage.setItem('mrklin-booking-lang', lang); } catch (err) {}
    applyLang();
  });

  // ----- Step 1: vehicle + services -----
  $('bkVehicles').innerHTML = VEHICLES.map(function (v) {
    return '<label class="bk-chip"><input type="radio" name="bkVehicle" value="' + v.id + '"><span>' + v.label + '</span></label>';
  }).join('');
  $('bkServices').innerHTML = SERVICES.map(function (s) {
    return '<label class="bk-svc"><input type="checkbox" value="' + s.id + '"><div><b data-svc-name="' + s.id + '"></b><small data-svc-desc="' + s.id + '"></small></div><span class="amt" data-amt="' + s.id + '"></span></label>';
  }).join('');

  function vehicle() { return VEHICLES.filter(function (v) { return v.id === state.vehicle; })[0]; }
  function chosen() { return SERVICES.filter(function (s) { return state.services[s.id]; }); }
  function priceText(s) {
    if (!s.price) return t('quoteAfter');
    var v = vehicle();
    if (!v) return (s.from ? t('from') : '') + peso(Math.min.apply(null, s.price)) + (s.from ? '' : '+');
    return (s.from ? t('from') : '') + peso(s.price[v.size]);
  }
  function estimate() {
    var v = vehicle(), list = chosen(), total = 0, quote = [], from = false;
    list.forEach(function (s) {
      if (!s.price) { quote.push(s); return; }
      if (v) total += s.price[v.size];
      if (s.from) from = true;
    });
    return { total: total, quote: quote, from: from, priced: list.length - quote.length };
  }
  function downpayment(e) { return Math.ceil(e.total * DOWNPAYMENT); }
  // Estimate in words; en = true gives the English version that is sent to the shop
  function estimateText(e, en) {
    var L = en ? TEXT.en : TEXT[lang], name = en ? function (s) { return s.name; } : svcName;
    return (e.priced ? (e.from ? L.from : '') + peso(e.total) : (en ? 'For quote' : '—')) +
      (e.quote.length ? L.quoteFor + e.quote.map(name).join(', ') : '');
  }
  function renderPrices() {
    SERVICES.forEach(function (s) {
      var el = document.querySelector('[data-amt="' + s.id + '"]');
      el.textContent = priceText(s);
      el.classList.toggle('quote', !s.price);
    });
    var e = estimate(), note;
    $('bkTotal').textContent = (e.from ? t('from') : '') + peso(e.total);
    if (!state.vehicle) note = t('noteVehicle');
    else if (!chosen().length) note = t('noteService');
    else if (e.quote.length && !e.priced) note = t('noteQuoted');
    else if (e.quote.length) note = t('notePlusQuote')(e.quote.length);
    else note = t('noteFinal');
    $('bkTotalNote').textContent = note;
  }
  $('bkVehicles').addEventListener('change', function (e) { state.vehicle = e.target.value; renderPrices(); });
  $('bkServices').addEventListener('change', function (e) {
    var s = SERVICES.filter(function (x) { return x.id === e.target.value; })[0];
    state.services[s.id] = e.target.checked;
    // The two interior options are alternatives, not add-ons
    if (e.target.checked && s.group) {
      SERVICES.forEach(function (o) {
        if (o.group === s.group && o.id !== s.id) {
          state.services[o.id] = false;
          $('bkServices').querySelector('input[value="' + o.id + '"]').checked = false;
        }
      });
    }
    renderPrices();
  });
  // Branches the customer can bring the car to
  var BRANCHES = {
    taguig: { name: 'Taguig branch', address: '74 M.L Quezon St., Bagumbayan, Taguig' },
    sucat: { name: 'Sucat branch', address: '8406-B Dr. A Santos Avenue, Brgy. BF Homes, Parañaque City' }
  };
  function branch() { var r = document.querySelector('input[name="bkBranch"]:checked'); return BRANCHES[r ? r.value : 'taguig']; }
  function shopText(l) { var bb = branch(); return TEXT[l || lang].whereShop + bb.name + ', ' + bb.address; }
  $('bkMobile').addEventListener('change', function () {
    $('bkAddrWrap').hidden = !this.checked;
    $('bkBranchWrap').hidden = this.checked; // home service: no shop to pick
  });

  // ----- Step 2: calendar + time -----
  function sameDay(a, b) { return a && b && a.getTime() === b.getTime(); }
  function renderCalendar() {
    var y = state.view.getFullYear(), m = state.view.getMonth();
    $('bkMonth').textContent = t('months')[m] + ' ' + y;
    $('bkPrev').disabled = y === today.getFullYear() && m === today.getMonth();
    $('bkNext').disabled = new Date(y, m + 1, 1) > lastDay;
    var html = t('days').map(function (d) { return '<span class="dow" aria-hidden="true">' + d + '</span>'; }).join('');
    var first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    for (var i = 0; i < first; i++) html += '<span></span>';
    for (var d = 1; d <= days; d++) {
      var date = new Date(y, m, d), off = date < today || date > lastDay;
      var cls = 'bk-day' + (sameDay(date, today) ? ' today' : '') + (sameDay(date, state.date) ? ' selected' : '');
      html += '<button type="button" class="' + cls + '" data-day="' + d + '"' + (off ? ' disabled' : '') +
        ' aria-label="' + dateText(date, lang) + '"' + (sameDay(date, state.date) ? ' aria-pressed="true"' : '') + '>' + d + '</button>';
    }
    $('bkGrid').innerHTML = html;
  }
  function renderTimes() {
    if (!state.date) { $('bkTimes').innerHTML = ''; $('bkTimeHint').hidden = false; return; }
    $('bkTimeHint').hidden = true;
    var now = new Date();
    $('bkTimes').innerHTML = TIMES.map(function (tm) {
      var parts = tm.match(/(\d+):(\d+) (AM|PM)/), h = (+parts[1] % 12) + (parts[3] === 'PM' ? 12 : 0);
      var slot = new Date(state.date); slot.setHours(h, +parts[2]);
      var past = slot < new Date(now.getTime() + 60 * 60 * 1000); // at least an hour's notice
      return '<label class="bk-chip"><input type="radio" name="bkTime" value="' + tm + '"' + (state.time === tm ? ' checked' : '') + (past ? ' disabled' : '') +
        '><span' + (past ? ' style="opacity:.35"' : '') + '>' + tm + '</span></label>';
    }).join('');
  }
  $('bkGrid').addEventListener('click', function (e) {
    var b = e.target.closest('.bk-day'); if (!b || b.disabled) return;
    state.date = new Date(state.view.getFullYear(), state.view.getMonth(), +b.dataset.day);
    state.time = null; renderCalendar(); renderTimes();
  });
  $('bkTimes').addEventListener('change', function (e) { state.time = e.target.value; });
  $('bkPrev').addEventListener('click', function () { state.view = new Date(state.view.getFullYear(), state.view.getMonth() - 1, 1); renderCalendar(); });
  $('bkNext').addEventListener('click', function () { state.view = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1); renderCalendar(); });

  // ----- Step 3: details, summary, send -----
  // e.g. "Tuesday, November 10, 2026" / "Martes, Nobyembre 10, 2026"
  function dateText(d, l) {
    var L = TEXT[l || 'en'];
    return L.weekdays[d.getDay()] + ', ' + L.months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function summaryRows(withServices) {
    var e = estimate(), rows = [[t('rowVehicle'), vehicle().label]];
    if (withServices) rows.push([t('rowServices'), chosen().map(svcName).join(', ')]);
    return rows.concat([
      [t('rowDate'), dateText(state.date, lang)],
      [t('rowTime'), state.time],
      [t('rowWhere'), $('bkMobile').checked ? t('whereHome') + ($('bkAddr').value.trim() ? ' — ' + $('bkAddr').value.trim() : '') : shopText()],
      [t('rowEstimate'), estimateText(e)],
      [t('rowDown'), e.priced ? (e.from || e.quote.length ? t('from') : '') + peso(downpayment(e)) : t('afterQuote')]
    ]);
  }
  function downText() {
    var e = estimate();
    return !e.priced ? t('downQuote') : t(e.from || e.quote.length ? 'downAmtFrom' : 'downAmt').replace('{amt}', peso(downpayment(e)));
  }
  function renderSummary() {
    $('bkSummary').innerHTML = summaryRows(true).map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
    $('bkDownAmt').textContent = downText();
  }
  // Saved on this device so booking.html can show the details in either language
  function saveBooking(id) {
    var keep = lang, car = $('bkCar').value.trim(), plate = $('bkPlate').value.trim();
    var saved = { id: id || '', createdAt: Date.now(), name: $('bkName').value.trim(), phone: $('bkPhone').value.trim(),
      email: $('bkEmail').value.trim(), car: car, plate: plate, notes: $('bkNotes').value.trim(), message: message(id), text: {} };
    ['en', 'tl'].forEach(function (l) {
      lang = l;
      saved.text[l] = { rows: summaryRows(false), services: chosen().map(function (s) { return [svcName(s), priceText(s)]; }), down: downText() };
    });
    lang = keep;
    try { localStorage.setItem('mrklin-last-booking', JSON.stringify(saved)); return true; } catch (err) { return false; }
  }
  function message(id) {
    var e = estimate(), lines = [
      id ? 'Hi Mr. Klin! I booked a service on your website.' : 'Hi Mr. Klin! I would like to book a service.',
      '',
      id ? 'Reference: ' + id : null,
      'Name: ' + $('bkName').value.trim(),
      'Mobile: ' + $('bkPhone').value.trim(),
      'Email: ' + $('bkEmail').value.trim(),
      'Vehicle: ' + vehicle().label + ($('bkCar').value.trim() ? ' — ' + $('bkCar').value.trim() : '') + ($('bkPlate').value.trim() ? ' (' + $('bkPlate').value.trim() + ')' : ''),
      'Services: ' + chosen().map(function (s) { return s.name; }).join(', '),
      'Preferred schedule: ' + dateText(state.date) + ', ' + state.time,
      'Location: ' + ($('bkMobile').checked ? 'Home/office service — ' + $('bkAddr').value.trim() : shopText('en')),
      'Website estimate: ' + estimateText(e, true),
      '50% downpayment: ' + (e.priced ? (e.from || e.quote.length ? 'from ' : '') + peso(downpayment(e)) : 'after quote')
    ];
    if ($('bkNotes').value.trim()) lines.push('Notes: ' + $('bkNotes').value.trim());
    if (photos.length) lines.push(id ? 'Photos of my unit: ' + photos.length + ' uploaded with the booking' : "Photos of my unit: I'll send " + photos.length + ' photo' + (photos.length > 1 ? 's' : '') + ' in this chat');
    return lines.filter(function (l) { return l !== null; }).join('\n');
  }
  $('bkCopy').addEventListener('click', function () {
    var btn = this, text = message();
    var done = function () { btn.textContent = t('copied'); setTimeout(function () { btn.textContent = t('copy'); }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { prompt(t('copyPrompt'), text); });
    else prompt(t('copyPrompt'), text);
  });

  // ----- Photos of the unit -----
  // Shrunk in the browser to a JPEG of at most 1280px so uploads stay small on mobile data.
  var MAX_PHOTOS = 3, photos = [];
  function shrinkPhoto(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var tries = [[1280, 0.72], [1024, 0.6], [800, 0.5]];
        for (var i = 0; i < tries.length; i++) {
          var s = Math.min(1, tries[i][0] / Math.max(img.naturalWidth, img.naturalHeight));
          var c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.naturalWidth * s)); c.height = Math.max(1, Math.round(img.naturalHeight * s));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          var data = c.toDataURL('image/jpeg', tries[i][1]);
          if (data.length <= 600000) return resolve(data);
        }
        reject(new Error('too big'));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
      img.src = url;
    });
  }
  function renderPhotos() {
    $('bkPhotoList').innerHTML = photos.map(function (p, i) {
      return '<figure class="bk-photo"><img src="' + p + '" alt="' + esc(t('photoAlt')) + ' ' + (i + 1) + '">' +
        '<button type="button" data-photo="' + i + '" aria-label="' + esc(t('photoRemove')) + ' ' + (i + 1) + '">×</button></figure>';
    }).join('');
    $('bkPhotoAdd').hidden = photos.length >= MAX_PHOTOS;
  }
  $('bkPhotoInput').addEventListener('change', function () {
    var input = this, list = Array.prototype.slice.call(input.files || []);
    var room = MAX_PHOTOS - photos.length;
    if (list.length > room) setError('errPhotoMax');
    list = list.slice(0, room);
    input.value = '';
    list.reduce(function (p, file) {
      return p.then(function () {
        return shrinkPhoto(file).then(function (data) { photos.push(data); renderPhotos(); }, function () { setError('errPhoto'); });
      });
    }, Promise.resolve());
  });
  $('bkPhotoList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-photo]'); if (!b) return;
    photos.splice(+b.dataset.photo, 1); renderPhotos();
    $('bkPhotoInput').focus();
  });

  // ----- Step navigation -----
  function showError(msg) { $('bkError').textContent = msg; $('bkError').hidden = !msg; }
  function setError(key) { state.error = key; showError(key ? t(key) : ''); }
  function validate() {
    if (state.step === 0) {
      if (!state.vehicle) return 'errVehicle';
      if (!chosen().length) return 'errService';
    } else if (state.step === 1) {
      if (!state.date) return 'errDate';
      if (!state.time) return 'errTime';
    } else {
      if (!$('bkName').value.trim()) return 'errName';
      if ($('bkPhone').value.replace(/\D/g, '').length < 10) return 'errPhone';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('bkEmail').value.trim())) return 'errEmail';
      if ($('bkMobile').checked && !$('bkAddr').value.trim()) return 'errAddr';
    }
    return '';
  }
  function go(step) {
    state.step = step;
    document.querySelectorAll('.bk-panel').forEach(function (p) { p.hidden = +p.dataset.step !== step; });
    document.querySelectorAll('.bk-steps li').forEach(function (li, i) {
      li.className = i < step ? 'done' : i === step ? 'current' : '';
      if (i === step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    $('bkBack').hidden = step === 0;
    $('bkNextStep').disabled = false;
    $('bkNextStep').textContent = t('next')[step];
    $('bkNextStep').hidden = false;
    $('bkSendWrap').hidden = true;
    $('bkDone').hidden = true;
    state.intro = '';
    setError('');
    if (step === 1) { renderCalendar(); renderTimes(); }
    if (step === 2) renderSummary();
    dlg.querySelector('.bk-body').scrollTop = 0;
  }
  $('bkNextStep').addEventListener('click', function () {
    var err = validate(); setError(err); if (err) return;
    if (state.step < 2) return go(state.step + 1);
    renderSummary();
    var btn = this, text = encodeURIComponent(message());
    $('bkMessenger').href = SHOP_MESSENGER + '?text=' + text;
    $('bkSms').href = 'sms:' + SHOP_SMS + '?&body=' + text;
    btn.disabled = true; btn.textContent = t('sending');
    submitBooking().then(function (id) {
      // Show the full details on their own page; stay here if this browser can't save them
      if (saveBooking(id)) { location.href = 'booking.html'; return; }
      $('bkDone').hidden = false;
      state.intro = 'sentIntro'; $('bkSendIntro').textContent = t('sentIntro');
      $('bkSendWrap').hidden = false;
      btn.hidden = true; $('bkBack').hidden = true;
      $('bkDone').scrollIntoView({ block: 'nearest' });
    }, function () {
      // Couldn't reach the booking system: fall back to sending it by message
      state.intro = 'failIntro'; $('bkSendIntro').textContent = t('failIntro');
      $('bkSendWrap').hidden = false;
      btn.hidden = true;
      $('bkMessenger').focus();
    });
  });
  function submitBooking() {
    var e = estimate(), mobile = $('bkMobile').checked;
    return fetch(BOOKINGS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerName: $('bkName').value.trim(),
        phone: $('bkPhone').value.trim(),
        email: $('bkEmail').value.trim(),
        vehicleType: vehicle().label,
        vehicle: $('bkCar').value.trim() || vehicle().label,
        plate: $('bkPlate').value.trim(),
        services: chosen().map(function (s) { return s.name; }),
        date: state.date.getFullYear() + '-' + String(state.date.getMonth() + 1).padStart(2, '0') + '-' + String(state.date.getDate()).padStart(2, '0'),
        slot: state.time,
        location: mobile ? 'Home/office service — ' + $('bkAddr').value.trim() : shopText('en'),
        estimate: estimateText(e, true),
        notes: $('bkNotes').value.trim(),
        photos: photos,
        company: $('bkCompany').value
      })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json().then(function (d) { return d && d.id; }, function () { return ''; });
    });
  }
  $('bkBack').addEventListener('click', function () { go(state.step - 1); });
  // Editing details after a failed send brings the button back so the message is rebuilt
  dlg.querySelector('[data-step="2"] .bk-fields').addEventListener('input', function () {
    if (!$('bkSendWrap').hidden && $('bkDone').hidden) { $('bkSendWrap').hidden = true; state.intro = ''; $('bkNextStep').hidden = false; $('bkNextStep').disabled = false; $('bkNextStep').textContent = t('next')[2]; }
  });

  // ----- Open / close -----
  document.querySelectorAll('[data-book]').forEach(function (b) {
    b.addEventListener('click', function () { go(0); renderPrices(); dlg.showModal(); });
  });
  dlg.querySelector('[data-close]').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  applyLang();
  // Other pages link to index.html#book to open the booking straight away
  if (location.hash === '#book') { go(0); dlg.showModal(); history.replaceState(null, '', location.pathname); }
})();
