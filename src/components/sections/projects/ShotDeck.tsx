"use client";

import { useEffect, useRef, useState } from "react";
import { PROJECTS, shotName } from "@/content/projects";
import { shotUrl } from "@/lib/cloudinary";
import { EASE, isCoarsePointer, prefersReducedMotion } from "@/lib/env";
import { useFrame } from "@/hooks/useFrame";
import { pointer } from "@/lib/pointer";
import { pad2 } from "@/lib/text";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

/** Position 3D de la carte située `k` rangs derrière la capture affichée. */
function cardStyle(k: number, n: number): React.CSSProperties {
  const leaving = n > 2 && k === n - 1;
  if (k === 0) return { transform: "translate3d(0,0,0)", opacity: 1, filter: "brightness(1)" };
  if (leaving) return { transform: "translate3d(-18%,14%,220px) rotateY(16deg) rotateZ(-4deg)", opacity: 0, filter: "brightness(1)" };
  if (k <= 3) return { transform: `translate3d(${k * 5}%,${-k * 6.5}%,${-k * 110}px)`, opacity: 1 - k * 0.2, filter: `brightness(${1 - k * 0.22})` };
  return { transform: "translate3d(20%,-26%,-440px)", opacity: 0, filter: "brightness(.4)" };
}

/** Pile de captures en perspective : clic ou ← → pour avancer, glisser sur mobile. */
export function ShotDeck() {
  const { projectIndex, shotIndex, stepShot } = usePortfolio();
  const { t } = usePreferences();
  const deck = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: 20, y: -10 });
  const touch = useRef({ x: 0, swiped: false });
  const first = useRef(true);
  const [coarse, setCoarse] = useState(false);
  const p = PROJECTS[projectIndex], n = p.shots.length;

  useEffect(() => setCoarse(isCoarsePointer()), []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (prefersReducedMotion()) return;
    deck.current?.animate(
      [{ transform: "perspective(1200px) rotateY(-38deg) translateZ(-160px)", opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 950, easing: EASE });
  }, [projectIndex]);

  // Le point de fuite suit la souris au-dessus de la pile.
  useFrame(() => {
    const el = deck.current;
    if (!el || prefersReducedMotion() || isCoarsePointer()) return;
    const r = el.getBoundingClientRect();
    const inside = pointer.x > r.left && pointer.x < r.right && pointer.y > r.top && pointer.y < r.bottom;
    const ox = inside ? 20 + ((pointer.x - r.left) / r.width - 0.5) * 70 : 20;
    const oy = inside ? -10 + ((pointer.y - r.top) / r.height - 0.5) * 70 : -10;
    const o = origin.current;
    o.x += (ox - o.x) * 0.1;
    o.y += (oy - o.y) * 0.1;
    el.style.perspectiveOrigin = `${o.x.toFixed(1)}% ${o.y.toFixed(1)}%`;
  });

  const onClick = () => {
    if (touch.current.swiped) { touch.current.swiped = false; return; }
    stepShot(1);
  };

  const hint = n > 1 ? (coarse ? t("glisser", "swipe") : t("cliquer ou ← →", "click or ← →")) : t("capture unique", "single screenshot");
  const navButton = "size-11 rounded border border-l3 bg-transparent text-[15px] text-t1";

  return (
    <div className="flex min-w-0 flex-col gap-4 overflow-hidden p-[clamp(16px,2vw,28px)]">
      <div
        ref={deck}
        data-caret-skip=""
        onClick={onClick}
        onTouchStart={(e) => { touch.current.x = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touch.current.x;
          if (Math.abs(dx) > 40) { touch.current.swiped = true; stepShot(dx < 0 ? 1 : -1); }
        }}
        className="relative aspect-16/11 perspective-[1600px] perspective-origin-[20%_-10%]"
      >
        {p.shots.map((id, j) => {
          const k = (j - shotIndex + n) % n, visible = k <= 4 || (n > 2 && k === n - 1);
          return (
            <div
              key={id}
              data-card={k}
              style={{ ...cardStyle(k, n), zIndex: n - k, pointerEvents: k === 0 ? "auto" : "none" }}
              className="absolute top-[13%] right-[11%] bottom-0 left-0 flex flex-col overflow-hidden rounded-md border border-l3 bg-p3 shadow-[0_30px_60px_rgba(0,0,0,.5)] transition-[transform,opacity,filter] duration-[900ms,600ms,600ms] ease-out-expo"
            >
              <div className="flex flex-none justify-between gap-2.5 border-b border-l2 bg-p1 px-[11px] py-[7px] font-mono text-[10px] whitespace-nowrap text-d1">
                <span className="overflow-hidden text-ellipsis">{shotName(id)}</span>
                <span>{pad2(j + 1)}</span>
              </div>
              <div className="relative min-h-0 flex-1">
                <img src={visible ? shotUrl(id, 1400) : BLANK} alt={shotName(id)} loading="lazy" className="absolute inset-0 size-full object-contain" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-2.5">
        <span className="font-mono text-[11px] text-d1">{pad2(shotIndex + 1)} / {pad2(n)} · {hint}</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => stepShot(-1)} aria-label={t("Précédent", "Previous")} className={navButton}>←</button>
          <button type="button" onClick={() => stepShot(1)} aria-label={t("Suivant", "Next")} className={navButton}>→</button>
        </div>
      </div>
    </div>
  );
}
