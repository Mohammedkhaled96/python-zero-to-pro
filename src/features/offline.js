/* ============================================================================
   features/offline — التشغيل بدون إنترنت (Service Worker)
   بيسجّل sw.js، وبيجهّز الكاش لما الطالب يطلب، وبينبّه لو فيه نسخة أحدث.
   ============================================================================ */
import { run, friendlyError } from "../runtime/python.js";
import { toast } from "../ui/toast.js";

const supported = () => "serviceWorker" in navigator && /^https?:$/.test(location.protocol);
let registration = null;

function ask(type, ms = 4000) {
  return new Promise(resolve => {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return resolve(null);
    const ch = new MessageChannel();
    let done = false;
    const timer = setTimeout(() => { if (!done) { done = true; resolve(null); } }, ms);
    ch.port1.onmessage = ev => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(ev.data);
    };
    try { navigator.serviceWorker.controller.postMessage({ type }, [ch.port2]); }
    catch (e) { clearTimeout(timer); resolve(null); }
  });
}

export function initOffline() {
  if (!supported()) return;
  navigator.serviceWorker.register(new URL("../../sw.js", import.meta.url), { scope: "./" }).then(reg => {
    registration = reg;
    reg.addEventListener("updatefound", () => {
      const sw = reg.installing;
      if (!sw) return;
      sw.addEventListener("statechange", () => {
        if (sw.state === "installed" && navigator.serviceWorker.controller) {
          toast("🆕 فيه نسخة أحدث من الكورس.", [{
            label: "حدّث الآن", primary: true,
            run: () => { sw.postMessage({ type: "SKIP_WAITING" }); setTimeout(() => location.reload(), 300); }
          }]);
        }
      });
    });
  }).catch(err => console.info("offline mode unavailable:", err && err.message));
}

const fmtBytes = n => (!n ? "—" : n < 1048576 ? Math.round(n / 1024) + " ك.بايت" : (n / 1048576).toFixed(1) + " ميجا");

export async function prepareOffline(btn) {
  if (!supported()) {
    toast("📴 العمل بدون إنترنت محتاج تفتح الكورس من استضافة (https أو localhost) — مش بفتح الملف مباشرةً من الجهاز (file://).", [], 12000);
    return;
  }
  const label = t => { if (btn) btn.textContent = t; };
  if (btn) btn.disabled = true;
  label("⏳ بنجهّز…");

  try {
    await navigator.serviceWorker.ready;
    /* الصفحة وملفاتها */
    await fetch(location.pathname, { cache: "reload" }).catch(() => {});
    /* محتوى الكورس كله (الوحدات والشرح) */
    label("⏳ بنخزّن الدروس…");
    const { course } = await import("../data/course.js");
    const { loadUnitContent } = await import("../data/content.js");
    for (const unit of course().units) {
      await loadUnitContent(unit).catch(() => {});
    }
    /* بايثون */
    label("⏳ بنحمّل بايثون…");
    await run({ kind: "run", code: "print(1)", ns: "offline-warmup" }, { timeout: 180000 });

    const status = await ask("STATUS", 5000);
    const est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null;
    const size = est && est.usage ? " · المساحة المستخدمة: " + fmtBytes(est.usage) : "";
    const files = status ? " · " + (status.runtime + status.shell) + " ملف متخزّن" : "";
    label("✓ جاهز أوفلاين");
    if (btn) btn.disabled = false;
    toast("📴 تمام — الكورس وبايثون متخزّنين على الجهاز. تقدر تفتحه وتشغّل الأكواد من غير إنترنت." + files + size, [], 12000);
  } catch (err) {
    label("📴 جهّزه للأوفلاين");
    if (btn) btn.disabled = false;
    toast("⚠️ مقدرناش نكمّل التجهيز: " + friendlyError(err), [], 10000);
  }
}
