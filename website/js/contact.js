// Contact form: builds the message and opens Messenger or SMS with it filled in
(function () {
  var form = document.getElementById('msgForm');
  var $ = function (id) { return document.getElementById(id); };
  var sendVia = 'messenger';
  form.querySelectorAll('[data-send]').forEach(function (b) {
    b.addEventListener('click', function () { sendVia = b.dataset.send; });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = '';
    if (!$('msgName').value.trim()) err = 'Please enter your name.';
    else if ($('msgPhone').value.replace(/\D/g, '').length < 10) err = 'Please enter a valid mobile number.';
    else if (!$('msgText').value.trim()) err = 'Please type your message.';
    $('msgError').textContent = err; $('msgError').hidden = !err;
    if (err) return;
    var text = [
      'Hi Mr. Klin! I have a question.',
      '',
      'Name: ' + $('msgName').value.trim(),
      'Mobile: ' + $('msgPhone').value.trim(),
      'Car: ' + ($('msgCar').value.trim() || '—'),
      'Topic: ' + $('msgTopic').value,
      '',
      $('msgText').value.trim()
    ].join('\n');
    if (sendVia === 'messenger') return window.open('https://m.me/mrklintradingandservicescorp?text=' + encodeURIComponent(text), '_blank', 'noopener');
    location.href = sendVia === 'sms'
      ? 'sms:09178805755?&body=' + encodeURIComponent(text)
      : 'mailto:sales@mrklintradingservicescorp.com?subject=' + encodeURIComponent('Website inquiry: ' + $('msgTopic').value) + '&body=' + encodeURIComponent(text);
  });
})();
