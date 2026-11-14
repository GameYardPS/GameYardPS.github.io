/* Host adapter for the unchanged, pinned WebKitty modules. */
(function () {
  "use strict";
  var state = document.getElementById("state"), key = "gameyard-1402-run";
  var match = navigator.userAgent.match(/PlayStation 4[ \/]([\d.]+)/i);
  var payload = "./includes/payloads/HEN/goldhen_v2.4b18.14.bin";
  var armed = false;
  try { armed = sessionStorage.getItem(key) === "running" && sessionStorage.getItem("payload_path") === payload; } catch (e) {}
  if (!match || match[1] !== "14.02" || !armed) {
    state.textContent = "جارٍ العودة إلى صفحة التجهيز...";
    location.replace("index.html"); return;
  }
  window.isPayloadElf = function () { return false; };
  window.jailbreakSuccess = function () {
    try { sessionStorage.setItem(key, "complete"); } catch (e) {}
    state.textContent = "انتهت محاولة التشغيل — تحقق من إشعار GoldHEN على الجهاز.";
  };
  window.addEventListener("load", function () {
    var script = document.createElement("script");
    script.type = "module"; script.src = "./src/slopkit-afterglow/jb.js";
    script.onerror = function () { state.textContent = "تعذر تحميل المحرك. أعد فتح رابط المتجر عبر الإنترنت."; };
    document.head.appendChild(script);
  }, false);
})();
