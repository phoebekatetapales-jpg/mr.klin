// Applied before the app renders so login/app don't flash the wrong
// theme; the main script re-reads this same attribute at startup.
(function () {
  try {
    var saved = localStorage.getItem("mrklin_theme_v1");
    var theme = saved || ((window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
