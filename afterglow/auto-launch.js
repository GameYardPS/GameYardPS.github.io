(function () {
  "use strict";
  var state = document.getElementById("count"), cache = document.getElementById("cache");
  var retry = document.getElementById("retry"), started = false, key = "gameyard-1400-run";
  var match = navigator.userAgent.match(/PlayStation 4[ \/]([\d.]+)/i);
  retry.onclick = function () { location.replace("../index.html"); };
  if (!match || !/^(13\.52|14\.00)$/.test(match[1])) {
    state.textContent = "افتح رابط المتجر من جهاز PS4 بإصدار مدعوم."; return;
  }
  try {
    if (sessionStorage.getItem(key)) {
      state.textContent = "انتهت محاولة التشغيل. تحقق من إشعار GoldHEN على الجهاز.";
      retry.hidden = false; return;
    }
  } catch (e) {}
  state.textContent = "جارٍ تجهيز GoldHEN تلقائيًا...";
  GameYardCache.wait({
    onProgress: function (event) {
      cache.textContent = "جارٍ حفظ ملفات إصدارك" + (event.total ? " — " + Math.round(event.loaded / event.total * 100) + "%" : "...");
    },
    onReady: function (result) {
      if (started) return; started = true;
      cache.textContent = result.cached ? "اكتمل حفظ الملفات." : "التشغيل عبر الاتصال الحالي.";
      state.textContent = "جارٍ تشغيل GoldHEN تلقائيًا...";
      try { sessionStorage.setItem(key, "running"); } catch (e) {}
      location.href = "jb.html?log=1&afterglow=run&mode=goldhen";
    },
    onError: function () {
      cache.textContent = "تعذر حفظ الملفات. تحقق من الاتصال ثم أعد المحاولة.";
      state.textContent = "توقف التجهيز"; retry.hidden = false;
    }
  });
})();
