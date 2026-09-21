/* ============================================================================
   core/dom — أدوات DOM مشتركة
   الطبقة دي ما بتعرفش حاجة عن الكورس: أدوات عامة بس.
   ============================================================================ */

export const $ = (sel, root) => (root || document).querySelector(sel);
export const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

export function el(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

/* بنكتب في الصفحة بس لو القيمة اتغيّرت — كل كتابة بتكلّف إعادة ترتيب الصفحة */
export function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

export const escHTML = s => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* لو حصل خطأ في جزء واحد، الباقي يكمّل عادي */
export function eachSafe(list, fn) {
  list.forEach((item, i) => {
    try { fn(item, i); }
    catch (err) { console.error("[course]", (item && item.id) || "", err); }
  });
}

export function safeDecode(s) {
  try { return decodeURIComponent(s); } catch (e) { return s; }
}

/* بنستنى الصفحة ترسم فريم — بنستخدمها قبل القياسات بعد تغييرات كبيرة */
export const nextFrame = () => new Promise(res => requestAnimationFrame(() => setTimeout(res, 0)));
