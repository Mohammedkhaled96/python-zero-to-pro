/* ============================================================================
   main — جذر التركيب: بيشغّل الطبقات بالترتيب ويربطها ببعض
   الترتيب: بيانات ← واجهة ← تنقّل ← مزايا ← استرجاع مكان الطالب
   ============================================================================ */
import { $, safeDecode } from "./core/dom.js";
import { on } from "./core/bus.js";
import { loadCourse, course } from "./data/course.js";
import { toast } from "./ui/toast.js";
import { createUnitSections, watchViewport, lazyCheck } from "./features/render.js";
import { buildToc, openUnitBlock, refreshProgress } from "./features/toc.js";
import { initNavigation, goTo, syncCurrent } from "./features/navigation.js";
import { initShell } from "./features/shell.js";
import { initSideTools, paintHeroStats } from "./features/side-tools.js";
import { initResume, restoreLast } from "./features/resume.js";
import { initOffline } from "./features/offline.js";
import { watchWarmTriggers } from "./runtime/python.js";

async function boot() {
  /* 1) البيانات: فهرس الكورس (خفيف — من غير محتوى الدروس) */
  try {
    await loadCourse();
  } catch (err) {
    document.getElementById("course").innerHTML =
      '<div class="unit-ph unit-err"><h2>⚠️ مقدرناش نحمّل الكورس</h2>' +
      "<p>اتأكّد إنك فاتح الكورس من سيرفر (أو GitHub Pages) مش بالضغط المباشر على الملف، وإن ملفات <code>content</code> جنب <code>index.html</code>.</p></div>";
    console.error(err);
    return;
  }

  /* 2) الواجهة: الفهرس والأرقام وأماكن الوحدات */
  document.title = course().title;
  paintHeroStats();
  buildToc();
  createUnitSections($("#course"));

  /* 3) السلوك */
  initShell();
  initNavigation();
  initSideTools();
  initResume();
  watchViewport();
  watchWarmTriggers();
  initOffline();

  on("storage:failed", () => {
    toast("⚠️ المتصفّح مش سامح بحفظ تقدّمك (وضع التصفّح الخفي أو المساحة مليانة). الكورس شغّال عادي، بس التقدّم مش هيتحفظ — استخدم «📤 تصدير تقدّمي» عشان ما يضيعش.", [], 12000);
  });
  on("progress:changed", refreshProgress);

  /* 4) نبدأ من الرابط، أو من آخر مكان وقف عنده الطالب */
  const hash = safeDecode(location.hash.slice(1));
  const opened = hash ? await goTo(hash) : false;
  if (!opened) await restoreLast();

  lazyCheck();
  syncCurrent();
  openUnitBlock(course().units[0].id);

  /* للاختبار والتشخيص من الكونسول */
  window.__BOOTED = true;
  window.PyCourse = { course, goTo, refreshProgress };
}

boot();
