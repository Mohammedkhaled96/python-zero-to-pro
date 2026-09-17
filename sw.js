/* ============================================================================
   Service Worker لكورس بايثون — تشغيل الكورس بدون إنترنت
   ----------------------------------------------------------------------------
   إيه اللي بيحصل:
   1) أول زيارة: بنخزّن الصفحة نفسها (الكورس كله ملف واحد).
   2) أول مرّة تشغّل كود: بنخزّن ملفات بايثون (Pyodide) من الـ CDN وهي بتتحمّل.
   3) بعد كده الكورس بيفتح ويشغّل الأكواد من غير إنترنت.

   ملحوظة: لازم الملف ده يبقى جنب index.html على نفس الاستضافة (https أو localhost).
   ============================================================================ */

var VERSION = "v1";
var SHELL_CACHE = "py-course-shell-" + VERSION;
var RUNTIME_CACHE = "py-course-runtime-" + VERSION;
var PYODIDE_PREFIX = "https://cdn.jsdelivr.net/pyodide/";
var SHELL_FILES = ["./", "./index.html"];

/* ---------- التنصيب: نخزّن الصفحة ---------- */
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      return Promise.all(
        SHELL_FILES.map(function (url) {
          return cache.add(new Request(url, { cache: "reload" })).catch(function () {});
        })
      );
    })
  );
});

/* ---------- التفعيل: نمسح النسخ القديمة ---------- */
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.map(function (name) {
          if (name !== SHELL_CACHE && name !== RUNTIME_CACHE && name.indexOf("py-course-") === 0) {
            return caches.delete(name);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* ---------- من الكاش الأول، ونحدّث في الخلفية ---------- */
function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (cached) {
      var network = fetch(request)
        .then(function (response) {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(function () {
          return cached || Response.error();
        });
      return cached || network;
    });
  });
}

/* ---------- من الكاش بس لو موجود (ملفات بايثون ما بتتغيّرش: إصدار مثبّت) ---------- */
function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        /* بنخزّن الردود السليمة بس (ولا الأخطاء ولا الردود الجزئية) */
        if (response && (response.ok || response.type === "opaque") && response.status !== 206) {
          cache.put(request, response.clone()).catch(function () {});
        }
        return response;
      });
    });
  });
}

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }

  /* ملفات بايثون من الـ CDN: من الكاش الأول (ده اللي بيخلّي التشغيل يعمل أوفلاين) */
  if (request.url.indexOf(PYODIDE_PREFIX) === 0) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  /* صفحة الكورس نفسها: من الكاش فورًا، ونجيب التحديث في الخلفية */
  if (url.origin === self.location.origin) {
    if (request.mode === "navigate" || /\.html?$/.test(url.pathname) || url.pathname.endsWith("/")) {
      event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
      return;
    }
    event.respondWith(
      caches.match(request).then(function (cached) {
        return cached || fetch(request);
      })
    );
    return;
  }

  /* أي حاجة تانية: الشبكة، ولو فشلت نجرّب الكاش */
  event.respondWith(
    fetch(request).catch(function () {
      return caches.match(request).then(function (cached) {
        return cached || Response.error();
      });
    })
  );
});

/* ---------- رسائل من الصفحة ---------- */
self.addEventListener("message", function (event) {
  var data = event.data || {};
  var reply = function (payload) {
    if (event.ports && event.ports[0]) event.ports[0].postMessage(payload);
  };

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (data.type === "STATUS") {
    Promise.all([
      caches.open(SHELL_CACHE).then(function (c) { return c.keys(); }),
      caches.open(RUNTIME_CACHE).then(function (c) { return c.keys(); })
    ]).then(function (res) {
      reply({ version: VERSION, shell: res[0].length, runtime: res[1].length });
    }).catch(function () {
      reply({ version: VERSION, shell: 0, runtime: 0 });
    });
    return;
  }

  if (data.type === "CLEAR") {
    caches.keys().then(function (names) {
      return Promise.all(
        names.map(function (name) {
          return name.indexOf("py-course-") === 0 ? caches.delete(name) : null;
        })
      );
    }).then(function () {
      reply({ cleared: true });
    }).catch(function () {
      reply({ cleared: false });
    });
  }
});
