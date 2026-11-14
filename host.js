(function () {
  "use strict";
  var msgs = document.getElementById("msgs"), details = document.getElementById("det");
  var cache = document.getElementById("cache"), label = document.getElementById("run-label");
  var retry = document.getElementById("retry"), launched = false;
  window.msgs = msgs;
  function message(text, kind) { msgs.textContent = text; msgs.className = kind || ""; }
  function fail() {
    message("تعذر حفظ أو تحميل الملفات. تحقق من الاتصال ثم أعد المحاولة.", "bad");
    label.textContent = "توقّف التشغيل"; retry.hidden = false;
  }
  retry.onclick = function () { location.reload(); };
  function routeFor(fw) {
    if (fw === 14.02) return { page: "webkitty/index.html", session: "gameyard-1402-run" };
    if (fw === 14.00) return { page: "afterglow/index.html", session: "gameyard-1400-run" };
    if (fw >= 7.00 && fw <= 8.52) return { group: "700", cache: "cache700.html", src: "700/alert.js", module: true };
    if (fw >= 9.00 && fw <= 9.60) return { group: "900", cache: "cache900.html", src: "900/alert.js", module: true };
    if (fw >= 10.00 && fw <= 11.02) return { group: "css", cache: "cachecss.html", src: "css/main.js", css: true };
    if (fw >= 11.50 && fw <= 12.02) return { group: "slopkit", cache: "cacheslopkit.html", src: "slopkit/chain_lapse.js", module: true };
    if (fw >= 12.50 && fw <= 13.00) return { group: "slopkit", cache: "cacheslopkit.html", src: "slopkit/chain_poops.js", module: true };
    if (fw >= 13.02 && fw <= 13.52) return { group: "slopkit", cache: "cacheslopkit.html", src: "slopkit/jb.js?v=19", module: true };
    return null;
  }
  var match = navigator.userAgent.match(/PlayStation 4[ \/]([\d.]+)/i);
  var firmware = match ? match[1] : "UNKNOWN", route = match ? routeFor(parseFloat(firmware)) : null;
  details.textContent = "FIRMWARE " + firmware + (route ? " • SUPPORTED" : " • UNSUPPORTED");
  if (!match) { message("افتح هذا الرابط من متصفح جهاز PS4", "warn"); label.textContent = "التشغيل التلقائي على PS4"; cache.textContent = "سيتم اكتشاف إصدار جهازك تلقائيًا."; return; }
  if (!route) { message("الإصدار " + firmware + " غير مدعوم في هذه الحزمة", "bad"); label.textContent = "إصدار غير مدعوم"; cache.textContent = "الإصدارات المدعومة موضحة أعلاه."; return; }
  message("تم اكتشاف الإصدار " + firmware + " — جارٍ التجهيز", "ok");
  label.textContent = "تشغيل GoldHEN تلقائيًا";
  if (route.page) {
    try { sessionStorage.removeItem(route.session); } catch (e) {}
    cache.textContent = "سيتم حفظ ملفات إصدارك ثم بدء التشغيل تلقائيًا.";
    setTimeout(function () { location.replace(route.page); }, 500);
    return;
  }
  function start() {
    if (launched) return;
    launched = true;
    message("جارٍ تشغيل GoldHEN... أبقِ الصفحة مفتوحة", "warn");
    cache.textContent = GameYardCache.appCache() ? "اكتمل حفظ ملفات إصدارك." : "التشغيل عبر الاتصال الحالي؛ التخزين دون اتصال غير متاح في هذا المتصفح.";
    var script = document.createElement("script");
    if (route.module) script.type = "module";
    script.src = route.src; script.onerror = fail;
    if (route.css) script.onload = function () { setTimeout(function () { doJb(); }, 500); };
    document.head.appendChild(script);
  }
  if (!GameYardCache.ready(route.group)) {
    cache.textContent = "جارٍ بدء حفظ الملفات تلقائيًا...";
    setTimeout(function () { location.replace(route.cache); }, 500);
    return;
  }
  if (location.hash === GameYardCache.marker(route.group)) {
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }
  GameYardCache.wait({
    onReady: start,
    onError: fail,
    onProgress: function () { cache.textContent = "جارٍ تحديث الملفات... سيبدأ التشغيل عند الاكتمال."; }
  });
})();
