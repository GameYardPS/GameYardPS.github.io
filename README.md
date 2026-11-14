# GameYard PS4 Multi-Firmware Host

واجهة GameYard عربية لتشغيل GoldHEN مع اختيار المحرك المناسب تلقائيًا ودعم التخزين دون اتصال.

## الإصدارات المدعومة في هذه النسخة

- 7.00–8.52
- 9.00–9.60
- 10.00–11.02
- 11.50–12.02
- 12.50–13.00
- 13.02–13.52

## المصدر

تعتمد ملفات التشغيل متعددة الإصدارات على مجلد `g2all` من مستودع `gamerhack/gamerhack.github.io` عند المراجعة:

`066f5b456f2fb9da47bfb7f6b9ddc8e599cee30f`

إصدار GoldHEN المضمّن: `v2.4b18.12`، مع محرك التشغيل وملفات الكاش المحدّثة بتاريخ 2026-10-06.

التعديلات الخاصة بـGameYard محصورة في الواجهة، التوجيه حسب الإصدار، رسائل الحالة، الصور، وملفات التخزين. ملفات المحرك الأصلية محفوظة مع إشعارات ترخيصها.

## النشر

ارفع محتويات المجلد إلى جذر مستودع GitHub Pages، ثم فعّل Pages من الفرع `main` والمجلد الجذر `/`.

بعد أول زيارة ناجحة، اختر تثبيت الملفات وانتظر اكتمال الحفظ، ثم عُد إلى الواجهة واضغط تشغيل GoldHEN. احتفظ بذكر المصدر الأصلي عند إعادة النشر.


## Afterglow Web — 2026-11-04

PS4 14.00 now routes to `afterglow/index.html`. Existing PS4 7.00–13.52 routes, runtime files, payloads and cache behavior are preserved. This is separate from the PS5 website.

Source: https://github.com/well0nez/afterglow-web at acf25a831725f0d44fcb64725d4ce35acbba8f9d, with the same runtime files verified for Hazzaz and MOSGAME. Only branding, language, landing-page firmware guards and cache entries are customized. Original engine JavaScript and payload bytes are preserved. Source and AGPL/MIT license notices are included in `afterglow/`. Physical PS4 execution remains untested in this development environment.

## تحديث هوية GameYard — 2026-11-10

تم تحديث الصفحة الرئيسية وصفحات تثبيت الكاش وواجهة Afterglow بإضافة الصورة الشخصية الكرتونية والشعار الأخضر الجديد. تم تضمين الصور في ملفات التخزين دون اتصال مع الإبقاء على منطق الاستغلال والحمولات وأسماء ملفات التشغيل الأصلية دون تغيير. لا توجد اختبارات تشغيل على جهاز PS4 حقيقي لهذا التحديث البصري.

## إصلاح الصور والتوافق مع متصفح PS4 — v6

الصور السابقة كانت تالفة أثناء رفع الملفات. تم رفع صورتَي الهوية الجديدتين مع التحقق من Git blob SHA1 مطابقًا للملفات المحلية، وإصلاح مساحات الواجهة باستبدال دوال CSS الحديثة غير المدعومة في بعض متصفحات PS4. تحديث manifests لإجبار إعادة التخزين. لا تغيير في JavaScript الخاص بالاستغلال أو payload binaries. لم يُختبر على PS4 حقيقي بعد.

## PS4 14.02 and automatic GoldHEN — 2026-11-14

The host automatically detects the firmware, saves its offline files on the first visit, then starts GoldHEN without install or launch clicks. Earlier firmware keeps its existing engine and payload bytes. Each firmware cache group has an independent revision marker. Downloads and updates finish before an engine is loaded; a cache error stops the attempt and displays a retry control.

PS4 14.02 uses the isolated `webkitty/` route, pinned to ArabPixel/WebKitty commit `8c8ee71bc7622dcb80713889029d6a16c8a269ab`, with its unmodified six engine modules and GoldHEN v2.4b18.14. See `webkitty/UPSTREAM.json`, source headers and licenses. No runtime assets are fetched from another shop's site. The existing shop artwork, colors, contact information and older firmware routes are preserved.

Open the main site URL online for the first save. If Application Cache is unavailable, the host can run online without claiming offline support. Completed/restored 14.xx attempts wait for a fresh visit to the main URL before another attempt. Physical PS4 execution has not been tested in this development environment.

Verification: `node tools/verify-host.mjs`.
