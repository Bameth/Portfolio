import { FEATURES } from "@/config/features";
import { prefersReducedMotion } from "@/lib/env";
import { monoFont, randomGlyph } from "@/lib/text";

/** Calque plein écran, non interactif, qui accueille les effets éphémères. */
const layer = () => document.querySelector<HTMLElement>("[data-fx]");

const BURST_COLORS = ["var(--mint)", "var(--pink)", "var(--amber)", "var(--violet)"];

/** Rebond du bouton cliqué et gerbe de glyphes au point de clic. */
export function burst(e: PointerEvent) {
  const target = (e.target as Element).closest?.("a,button");
  if (!target || prefersReducedMotion()) return;
  target.animate(
    [{ transform: "scale(1)" }, { transform: "scale(.94)", offset: 0.3 }, { transform: "scale(1.02)", offset: 0.7 }, { transform: "scale(1)" }],
    { duration: 420, easing: "ease-out", composite: "add" });
  const fx = layer();
  if (!FEATURES.particles || !fx) return;
  const font = monoFont();
  for (let i = 0; i < 11; i++) {
    const s = document.createElement("span");
    s.textContent = randomGlyph();
    Object.assign(s.style, {
      position: "absolute", left: e.clientX + "px", top: e.clientY + "px", pointerEvents: "none", willChange: "transform,opacity",
      font: `600 ${11 + Math.random() * 9}px ${font}`, color: BURST_COLORS[i % 4],
    });
    fx.appendChild(s);
    const ang = Math.random() * Math.PI * 2, dist = 40 + Math.random() * 70;
    const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 20;
    s.animate([
      { transform: "translate(-50%,-50%) scale(.4) rotate(0)", opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1) rotate(${Math.random() * 180 - 90}deg)`, opacity: 0 },
    ], { duration: 650 + Math.random() * 300, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => s.remove();
  }
}

/** Contours pointillés « boîte de layout » dessinés brièvement autour des éléments donnés. */
export function outlineBoxes(elements: Element[]) {
  const fx = layer();
  if (!fx || prefersReducedMotion()) return;
  const font = monoFont();
  elements.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const box = document.createElement("div");
    Object.assign(box.style, {
      position: "absolute", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px",
      border: "1px dashed rgba(22,242,179,.55)",
    });
    const tag = document.createElement("span");
    tag.textContent = `${el.tagName.toLowerCase()} · ${Math.round(r.width)}×${Math.round(r.height)}`;
    Object.assign(tag.style, {
      position: "absolute", left: "-1px", top: "-20px", padding: "2px 6px", background: "var(--mint)", color: "var(--bg)",
      font: `600 10px ${font}`, whiteSpace: "nowrap",
    });
    box.appendChild(tag);
    fx.appendChild(box);
    box.animate([
      { clipPath: "inset(0 100% 100% 0)", opacity: 1 },
      { clipPath: "inset(0 0 0 0)", opacity: 1, offset: 0.35 },
      { clipPath: "inset(0 0 0 0)", opacity: 1, offset: 0.8 },
      { clipPath: "inset(0 0 0 0)", opacity: 0 },
    ], { duration: 1100, delay: i * 90, easing: "cubic-bezier(.65,0,.35,1)", fill: "both" }).onfinish = () => box.remove();
  });
}
