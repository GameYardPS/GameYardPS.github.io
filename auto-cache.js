/* Shared cache gate. Engine modules are loaded only after caching settles. */
(function (global) {
  "use strict";
  var revision = "auto-v7-20261114";
  function appCache() {
    try { return global.applicationCache || null; } catch (e) { return null; }
  }
  function marker(group) { return "#cache-ready=" + group + "-" + revision; }
  function ready(group) {
    var ac = appCache(), saved = false;
    if (!ac) return true;
    try { saved = localStorage.getItem("gameyard-cache-" + group) === revision; } catch (e) {}
    return ac.status !== 0 && (saved || location.hash === marker(group));
  }
  function remember(group, cached) {
    if (!cached) return;
    try { localStorage.setItem("gameyard-cache-" + group, revision); } catch (e) {}
  }
  function wait(options) {
    var ac = appCache(), settled = false, timer = null;
    var events = ["checking", "downloading", "progress", "cached", "noupdate", "updateready", "error", "obsolete"];
    function clean() {
      if (timer !== null) clearTimeout(timer);
      if (ac) for (var i = 0; i < events.length; i++) ac.removeEventListener(events[i], change, false);
    }
    function fail() {
      if (settled) return;
      settled = true; clean();
      options.onError();
    }
    function done(cached) {
      if (settled) return;
      if (ac && ac.status === 4) {
        try { ac.swapCache(); } catch (e) { fail(); return; }
      }
      settled = true; clean();
      options.onReady({ cached: cached });
    }
    function change(event) {
      if (settled) return;
      var type = event.type;
      if (type === "error" || type === "obsolete") { fail(); return; }
      if (type === "cached" || type === "noupdate" || type === "updateready") { done(true); return; }
      if (options.onProgress) options.onProgress(event);
    }
    if (!ac) { timer = setTimeout(function () { done(false); }, 0); return; }
    for (var i = 0; i < events.length; i++) ac.addEventListener(events[i], change, false);
    timer = setTimeout(function () {
      if (ac.status === 1 || ac.status === 4) done(true);
      else if (ac.status === 5) fail();
      else if (ac.status === 0) {
        timer = setTimeout(function () { if (ac.status === 0) fail(); }, 20000);
      }
    }, 700);
  }
  global.GameYardCache = { appCache: appCache, ready: ready, remember: remember, marker: marker, wait: wait };
})(window);
