(function () {
  "use strict";
  var group = document.body.getAttribute("data-cache-group");
  var msgs = document.getElementById("msgs"), bar = document.getElementById("bar");
  var percent = document.getElementById("percent"), retry = document.getElementById("go");
  retry.onclick = function () { location.reload(); };
  GameYardCache.wait({
    onProgress: function (event) {
      if (event.total) {
        var value = Math.round(event.loaded / event.total * 100);
        bar.style.width = value + "%"; percent.textContent = value + "%";
      }
      msgs.textContent = "جارٍ حفظ الملفات... سيبدأ GoldHEN تلقائيًا بعد الاكتمال.";
    },
    onReady: function (result) {
      GameYardCache.remember(group, result.cached);
      bar.style.width = "100%"; percent.textContent = result.cached ? "100%" : "ONLINE";
      msgs.textContent = result.cached ? "اكتمل الحفظ — جارٍ بدء التشغيل تلقائيًا" : "جارٍ بدء التشغيل عبر الاتصال الحالي";
      msgs.className = "ok";
      setTimeout(function () { location.replace("index.html" + GameYardCache.marker(group)); }, 500);
    },
    onError: function () {
      msgs.textContent = "تعذر حفظ الملفات. تحقق من اتصال الإنترنت ثم أعد المحاولة.";
      msgs.className = "bad"; retry.hidden = false; retry.disabled = false; retry.textContent = "إعادة المحاولة";
    }
  });
})();
