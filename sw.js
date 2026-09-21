/* ============================================================================
   Service Worker — تشغيل الكورس بدون إنترنت
     • ملفات التطبيق (الصفحة، الأنماط، الكود): من الكاش فورًا مع تحديث في الخلفية
     • محتوى الدروس وملفات بايثون (Pyodide): من الكاش أول ما تتخزّن
   لازم يبقى جنب index.html على نفس الاستضافة (https أو localhost).
   ============================================================================ */

const VERSION = "2026-09-21.1";
const APP_CACHE = "py-course-app-" + VERSION;
const DATA_CACHE = "py-course-data-" + VERSION;
const PYODIDE_PREFIX = "https://cdn.jsdelivr.net/pyodide/";

/* ملفات التطبيق الأساسية — لو أي واحد فشل، الباقي بيتخزّن عادي */
const APP_FILES = [
  "./",
  "./index.html",
  "./assets/favicon.svg",
  "./assets/css/tokens.css",
  "./assets/css/layout.css",
  "./assets/css/content.css",
  "./assets/css/components.css",
  "./assets/css/responsive.css",
  "./assets/css/print.css",
  "./content/course.json",
  "./src/main.js",
  "./src/core/dom.js",
  "./src/core/bus.js",
  "./src/core/storage.js",
  "./src/core/state.js",
  "./src/core/scroll.js",
  "./src/ui/toast.js",
  "./src/ui/modal.js",
  "./src/ui/highlight.js",
  "./src/data/course.js",
  "./src/data/content.js",
  "./src/data/search.js",
  "./src/runtime/python.js",
  "./src/runtime/worker.js",
  "./src/runtime/runnability.js",
  "./src/runtime/harness.py",
  "./src/features/render.js",
  "./src/features/navigation.js",
  "./src/features/toc.js",
  "./src/features/shell.js",
  "./src/features/code-blocks.js",
  "./src/features/lines-table.js",
  "./src/features/run-panel.js",
  "./src/features/editor.js",
  "./src/features/quiz.js",
  "./src/features/challenges.js",
  "./src/features/lesson-extras.js",
  "./src/features/dashboard.js",
  "./src/features/review.js",
  "./src/features/resume.js",
  "./src/features/side-tools.js",
  "./src/features/offline.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(APP_CACHE).then(cache =>
      Promise.all(APP_FILES.map(url =>
        cache.add(new Request(url, { cache: "reload" })).catch(() => {})
      ))
    )
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.map(name => {
        if (name !== APP_CACHE && name !== DATA_CACHE && name.indexOf("py-course-") === 0) return caches.delete(name);
      })))
      .then(() => self.clients.claim())
  );
});

/* من الكاش الأول، ونحدّث في الخلفية */
function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(cache =>
    cache.match(request).then(cached => {
      const network = fetch(request)
        .then(res => { if (res && res.ok) cache.put(request, res.clone()); return res; })
        .catch(() => cached || Response.error());
      return cached || network;
    })
  );
}

/* من الكاش بس لو موجود (محتوى الدروس وملفات بايثون — نسخ ثابتة) */
function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then(cache =>
    cache.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (res && (res.ok || res.type === "opaque") && res.status !== 206) {
          cache.put(request, res.clone()).catch(() => {});
        }
        return res;
      });
    })
  );
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  let url;
  try { url = new URL(request.url); } catch (e) { return; }

  /* ملفات بايثون من الـ CDN */
  if (request.url.indexOf(PYODIDE_PREFIX) === 0) {
    event.respondWith(cacheFirst(request, DATA_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    /* محتوى الدروس: من الكاش أول ما يتخزّن */
    if (/\/content\/(units|notes)\//.test(url.pathname) || /search-index\.json$/.test(url.pathname)) {
      event.respondWith(cacheFirst(request, DATA_CACHE));
      return;
    }
    /* الصفحة وملفات التطبيق */
    event.respondWith(staleWhileRevalidate(request, APP_CACHE));
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request).then(c => c || Response.error()))
  );
});

self.addEventListener("message", event => {
  const data = event.data || {};
  const reply = payload => { if (event.ports && event.ports[0]) event.ports[0].postMessage(payload); };

  if (data.type === "SKIP_WAITING") { self.skipWaiting(); return; }

  if (data.type === "STATUS") {
    Promise.all([
      caches.open(APP_CACHE).then(c => c.keys()),
      caches.open(DATA_CACHE).then(c => c.keys())
    ]).then(res => reply({ version: VERSION, shell: res[0].length, runtime: res[1].length }))
      .catch(() => reply({ version: VERSION, shell: 0, runtime: 0 }));
    return;
  }

  if (data.type === "CLEAR") {
    caches.keys()
      .then(names => Promise.all(names.map(n => (n.indexOf("py-course-") === 0 ? caches.delete(n) : null))))
      .then(() => reply({ cleared: true }))
      .catch(() => reply({ cleared: false }));
  }
});
