/* ============================================================================
   core/scroll — كل حسابات التمرير في مكان واحد
   الهدف: الطالب ما يتزحلقش من مكانه لما محتوى فوقه يتحمّل أو يكبر.
     jumpTo        قفزة فورية لعنصر
     anchor/keep   تثبيت نقطة مرجعية قبل تغيير كبير ورجوعها بعده
     pin           تثبيت الهدف بعد القفزة لحد ما الصفحة تستقرّ
   ============================================================================ */
import { $$ } from "./dom.js";

export function scrollBy(y) {
  if (y) window.scrollBy({ top: y, left: 0, behavior: "instant" });
}

/* قفزة بحساب مطلق بدل scrollIntoView:
   لما المحتوى بيتحمّل فورًا (نسخة الملف الواحد) المتصفّح ساعات بيحسب
   scrollIntoView على موضع تمرير قديم فيروح لمكان غلط — الحساب المطلق مضمون.
   بيرجّع المسافة المطلوبة بين أعلى الشاشة والعنصر (عشان التثبيت يعرفها) */
export function jumpTo(node) {
  const margin = parseFloat(getComputedStyle(node).scrollMarginTop) || 0;
  const top = node.getBoundingClientRect().top + window.scrollY - margin;
  window.scrollTo({ top: Math.max(0, Math.round(top)), left: 0, behavior: "instant" });
  return margin;
}

/* أول عنصر واصل لأعلى الشاشة وإحنا برّه الجزء اللي هيتغيّر */
export function anchor(skipNode) {
  if (window.scrollY < 5) return null;
  const list = $$("section.unit, .unit:not([data-lazy]) .lesson");
  for (const node of list) {
    if (skipNode && (node === skipNode || skipNode.contains(node))) continue;
    const r = node.getBoundingClientRect();
    if (r.bottom > 0) return { node, top: r.top };
  }
  return null;
}

export function keepAnchor(a) {
  if (!a || !a.node.isConnected) return;
  const delta = a.node.getBoundingClientRect().top - a.top;
  if (Math.abs(delta) > 0.5) scrollBy(delta);
}

/* بعد أي قفزة بنفضل مثبّتين الهدف شوية (محرّرات وخطوط ممكن تكبر متأخّرة).
   أول حركة من الطالب بتلغي التثبيت فورًا. */
let pinState = { node: null, want: 0, until: 0 };

/* want = المكان المطلوب للعنصر من أعلى الشاشة. لو مش متبعت بنقيسه —
   لكن الأفضل نبعته عشان ما نثبّتش على قياس قبل ما التمرير يستقرّ. */
export function pin(node, want = null, ms = 1600) {
  pinState = {
    node,
    want: want === null ? node.getBoundingClientRect().top : want,
    until: Date.now() + ms
  };
  let tries = 0;
  const step = () => {
    if (pinState.node !== node || Date.now() > pinState.until || !node.isConnected) return;
    const delta = node.getBoundingClientRect().top - pinState.want;
    if (Math.abs(delta) > 1) scrollBy(delta);
    tries++;
    setTimeout(step, tries < 4 ? 60 : 250);
  };
  step();
}

export function releasePin() { pinState.until = 0; }

["wheel", "touchstart", "mousedown", "keydown"].forEach(ev => {
  window.addEventListener(ev, releasePin, { passive: true });
});
