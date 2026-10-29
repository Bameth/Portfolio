import { EASE, isCoarsePointer, prefersReducedMotion } from "@/lib/env";
import { randomGlyph } from "@/lib/text";

/**
 * Effets des grands titres de section, pilotés par attributs :
 * - `data-reveal`   : apparition floutée quand l'élément entre à l'écran ;
 * - `data-title`    : brouillage du texte à l'apparition, inclinaison au défilement,
 *                     et largeur variable (`--wx`) calculée pour remplir la ligne au survol.
 */

const pending = new Map<Element, Animation>();

/** Annule l'apparition d'un élément (utilisé quand la tête 3D « construit » ce texte). */
export function cancelReveal(el: Element) {
  pending.get(el)?.cancel();
  pending.delete(el);
}

export function scramble(el: Element) {
  if (prefersReducedMotion()) return;
  const node = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim());
  if (!node) return;
  const original = node.nodeValue ?? "";
  const t0 = performance.now(), duration = 900;
  const step = (t: number) => {
    const p = Math.min(1, (t - t0) / duration), shown = Math.floor(p * original.length);
    let s = original.slice(0, shown);
    for (let i = shown; i < original.length; i++) s += original[i] === " " ? " " : randomGlyph();
    node.nodeValue = p < 1 ? s : original;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function stretchOnce(el: HTMLElement) {
  if (prefersReducedMotion() || !el.dataset.wx) return;
  const base = `'wdth' ${el.dataset.wb},'wght' 900`, wide = `'wdth' ${el.dataset.wx},'wght' 900`;
  el.animate([{ fontVariationSettings: base }, { fontVariationSettings: wide, offset: 0.45 }, { fontVariationSettings: base }],
    { duration: 1700, easing: "cubic-bezier(.65,0,.35,1)" });
}

/** Prépare les apparitions ; renvoie la fonction de nettoyage. */
export function setupReveals(): () => void {
  if (prefersReducedMotion()) return () => {};
  const observer = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    reveal(e.target);
  }), { threshold: 0.1 });

  const reveal = (el: Element) => {
    pending.get(el)?.play();
    pending.delete(el);
    observer.unobserve(el);
    if (el.hasAttribute("data-title")) {
      scramble(el);
      if (isCoarsePointer()) setTimeout(() => stretchOnce(el as HTMLElement), 250);
    }
  };

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.getBoundingClientRect().top < innerHeight * 0.9) return;
    const a = el.animate(
      [{ opacity: 0, transform: "translateY(40px)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
      { duration: 1000, easing: EASE, fill: "both" });
    a.pause();
    a.onfinish = () => a.cancel();
    pending.set(el, a);
    observer.observe(el);
  });

  // Un saut d'ancre peut dépasser un titre sans déclencher l'observer : on rattrape au défilement.
  const catchUp = () => pending.forEach((_, el) => { if (el.getBoundingClientRect().top < innerHeight) reveal(el); });
  addEventListener("scroll", catchUp, { passive: true });
  return () => {
    observer.disconnect();
    removeEventListener("scroll", catchUp);
    pending.clear();
  };
}

/** Calcule pour chaque titre la largeur de police maximale qui tient sur sa ligne. */
export function fitTitles() {
  document.querySelectorAll<HTMLElement>("h2[data-title]").forEach((el) => {
    // On mesure dans le conteneur direct : en colonne (contact), le titre ne doit pas déborder sur la voisine.
    const box = el.parentElement;
    if (!box || !el.offsetWidth) return;
    const cs = getComputedStyle(box), br = box.getBoundingClientRect();
    const left = br.left + parseFloat(cs.paddingLeft);
    const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 6;
    const prevTransition = el.style.transition, prevTransform = el.style.transform;
    const base = parseFloat(getComputedStyle(el).getPropertyValue("--wb")) || 60;
    el.dataset.wb = String(base);
    el.style.transition = "none";
    el.style.transform = "";
    const range = document.createRange();
    range.selectNodeContents(el);
    el.style.fontVariationSettings = `'wdth' ${base},'wght' 900`;
    const h0 = el.getBoundingClientRect().height;
    const fits = (w: number) => {
      el.style.fontVariationSettings = `'wdth' ${w},'wght' 900`;
      let right = 0;
      for (const r of range.getClientRects()) right = Math.max(right, r.right - left);
      return right <= avail && el.getBoundingClientRect().height <= h0 + 2;
    };
    let best = base;
    if (fits(150)) best = 150;
    else {
      let lo = base, hi = 150;
      for (let i = 0; i < 8; i++) {
        const mid = (lo + hi) / 2;
        if (fits(mid)) { lo = mid; best = mid; } else hi = mid;
      }
    }
    best = Math.max(base, best - 2);
    el.style.fontVariationSettings = "";
    void el.offsetWidth;
    el.style.transition = prevTransition;
    el.style.transform = prevTransform;
    el.dataset.wx = best.toFixed(1);
    el.style.setProperty("--wx", (isCoarsePointer() ? base : best).toFixed(1));
  });
}

let lastSkew = 0;

/** Incline les titres proportionnellement à la vitesse de défilement. */
export function skewTitles(velocity: number) {
  const skew = Math.max(-6, Math.min(6, velocity * 0.12));
  if (Math.abs(skew - lastSkew) <= 0.02) return;
  lastSkew = skew;
  document.querySelectorAll<HTMLElement>("[data-title]").forEach((el) => {
    el.style.transform = Math.abs(skew) < 0.05 ? "" : `skewY(${(-skew).toFixed(2)}deg)`;
  });
}
