// Apply the saved theme before the page paints (avoids a flash of the wrong theme).
(function () {
  var theme = 'dark';
  try {
    var saved = localStorage.getItem('mrklin-theme');
    if (saved === 'dark' || saved === 'light') theme = saved;
    else if (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches) theme = 'light';
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', theme);
})();
