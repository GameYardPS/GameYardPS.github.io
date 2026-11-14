(function () {
  "use strict";
  var state = document.getElementById("count"), cache = document.getElementById("cache");
  var bar = document.getElementById("bar"), retry = document.getElementById("retry");
  var started = false, key = "gameyard-1402-run";
  var match = navigator.userAgent.match(/PlayStation 4[ \/]([\d.]+)/i);
  retry.onclick = function () { location.replace("../index.html"); };
  if (!match || match[1] !== "14.02") {
    state.textContent = "هذا المسار مخصص لجهاز PS4 بإصدار 14.02."; return;
  }
  try {
    if (sessionStorage.getItem(key)) {
      state.textContent = "انتهت محاولة التشغيل. تحقق من إشعار GoldHEN على الجهاز.";
      cache.textContent = "للمحاولة مجددًا، افتح الصفحة الرئيسية للمتجر.";
      retry.hidden = false; return;
    }
  } catch (e) {}
  GameYardCache.wait({
    onProgress: function (event) {
      var value = event.total ? Math.round(event.loaded / event.total * 100) : 0;
      state.textContent = "جارٍ حفظ الملفات تلقائيًا...";
      cache.textContent = value ? value + "% — سيبدأ GoldHEN عند الاكتمال" : "سيبدأ GoldHEN عند اكتمال حفظ الملفات.";
      if (value) bar.style.width = value + "%";
    },
    onReady: function (result) {
      if (started) return; started = true;
      try {
        sessionStorage.setItem("payload_path", "./includes/payloads/HEN/goldhen_v2.4b18.14.bin");
        sessionStorage.setItem(key, "running");
      } catch (e) {
        state.textContent = "تعذر تجهيز بيانات التشغيل في المتصفح.";
        cache.textContent = "أعد فتح متصفح PS4 ثم افتح رابط المتجر."; retry.hidden = false; return;
      }
      bar.style.width = "100%";
      state.textContent = "جارٍ تشغيل GoldHEN تلقائيًا...";
      cache.textContent = result.cached ? "اكتمل حفظ ملفات 14.02." : "التشغيل عبر الاتصال الحالي؛ التخزين دون اتصال غير متاح في هذا المتصفح.";
      location.href = "exploit.html";
    },
    onError: function () {
      state.textContent = "تعذر حفظ ملفات 14.02.";
      cache.textContent = "تحقق من اتصال الإنترنت ثم أعد المحاولة."; retry.hidden = false;
    }
  });
})();
