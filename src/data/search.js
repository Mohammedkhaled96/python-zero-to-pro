/* ============================================================================
   data/search — فهرس البحث في محتوى الدروس
   بيتحمّل أول ما الطالب يبحث بـ 3 حروف أو أكتر (عشان أول فتح يفضل خفيف).
   ============================================================================ */
import { contentURL, inlined } from "./course.js";

let cache = null;
let job = null;

export function loadSearchIndex() {
  if (cache) return Promise.resolve(cache);

  const node = inlined.search();
  if (node) {
    cache = JSON.parse(node.textContent);
    return Promise.resolve(cache);
  }

  if (job) return job;
  job = fetch(contentURL("search-index.json"))
    .then(res => {
      if (!res.ok) throw new Error("search index " + res.status);
      return res.json();
    })
    .then(data => { cache = data; job = null; return data; })
    .catch(err => { job = null; throw err; });
  return job;
}
