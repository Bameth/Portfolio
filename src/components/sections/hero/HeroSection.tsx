"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/content/site";
import { FEATURES } from "@/config/features";
import { HeadPortrait } from "@/features/head3d/HeadPortrait";
import { useClock } from "@/hooks/useClock";
import { useFrame } from "@/hooks/useFrame";
import { EASE, isCoarsePointer, prefersReducedMotion } from "@/lib/env";
import { outlineBoxes } from "@/lib/effects/fx";
import { isIdle, pointer } from "@/lib/pointer";
import { EXTRUSION } from "@/lib/theme";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";
import { CodeCard } from "./CodeCard";

const FIRST = [..."Ameth"], LAST = [..."Ba"];

interface Letter { el: HTMLElement; w: number; g: number }

/** Section d'accueil : nom en police variable réactive, carte de code et portrait 3D. */
export function HeroSection() {
  const { introDelay, goTo } = usePortfolio();
  const { t, theme } = usePreferences();
  const dakar = useClock(SITE.timezones.dakar);
  const montreal = useClock(SITE.timezones.montreal);
  const root = useRef<HTMLElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const letters = useRef<Letter[]>([]);
  const motion = useRef({ tilt: { x: 0, y: 0 }, ext: { x: 0, y: 0.6 }, extLast: { x: 9, y: 9 }, fontSize: 0 });
  const [lineOverflow, setLineOverflow] = useState(true);

  // Animation d'entrée, déclenchée à la fin de l'écran de démarrage.
  useEffect(() => {
    const el = root.current;
    if (introDelay == null || !el) return;
    const reduce = prefersReducedMotion();
    const timers: number[] = [];
    const play = (target: Element, frames: Keyframe[], opts: KeyframeAnimationOptions) =>
      reduce ? null : target.animate(frames, { fill: "both", easing: EASE, ...opts });
    const d0 = introDelay;
    letters.current.forEach((l, i) => play(l.el, [{ transform: "translateY(100%)" }, { transform: "none" }], { duration: 1100, delay: d0 + i * 60 }));
    const frame = el.querySelector("[data-photo]");
    if (frame) play(frame, [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration: 1300, delay: d0 + 200, easing: "cubic-bezier(.76,0,.24,1)" });
    el.querySelectorAll("[data-in]").forEach((n, i) =>
      play(n, [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 900, delay: d0 + 300 + i * 90 }));
    let d = d0 + 600;
    el.querySelectorAll<HTMLElement>("[data-type]").forEach((n) => {
      const len = Number(n.dataset.type) || 10, duration = len * 30;
      play(n, [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration, delay: d, easing: `steps(${len})` });
      d += duration + 70;
    });
    if (!reduce) {
      timers.push(window.setTimeout(() => outlineBoxes([h1.current, el.querySelector("[data-photo]")].filter(Boolean) as Element[]), d0 + 120));
      timers.push(window.setTimeout(() => setLineOverflow(false), d0 + 1700));
    }
    if (location.hash && location.hash !== "#index") timers.push(window.setTimeout(() => goTo("travaux"), d0 + 500));
    return () => timers.forEach(clearTimeout);
  }, [introDelay, goTo]);

  // Lettres, inclinaison 3D et extrusion du titre : suivent le curseur, ondulent au repos.
  useFrame((now) => {
    const y = scrollY, vh = innerHeight;
    if (prefersReducedMotion() || y > vh * 1.3) return;
    const coarse = isCoarsePointer(), idle = isIdle(now), squash = Math.min(1, y / (vh * 0.7));
    letters.current.forEach((o, i) => {
      let f: number;
      if (idle) f = ((Math.sin(now / 650 - i * 0.75) + 1) / 2) * (coarse ? 0.35 : 0.5);
      else {
        const r = o.el.getBoundingClientRect();
        f = Math.max(0, 1 - Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2)) / 420);
      }
      o.w += (75 + f * 75 - squash * 25 - o.w) * 0.12;
      o.g += (800 + f * 100 - squash * 400 - o.g) * 0.12;
      o.el.style.fontVariationSettings = `'wdth' ${o.w.toFixed(1)},'wght' ${o.g.toFixed(0)}`;
    });
    if (!FEATURES.effects3d) return;
    const m = motion.current;
    if (!coarse) {
      m.tilt.x += ((pointer.y / vh - 0.5) * -7 - m.tilt.x) * 0.07;
      m.tilt.y += ((pointer.x / innerWidth - 0.5) * 9 - m.tilt.y) * 0.07;
      root.current?.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
        const k = Number(el.dataset.tilt);
        el.style.transform = `rotateX(${(m.tilt.x * k).toFixed(2)}deg) rotateY(${(m.tilt.y * k).toFixed(2)}deg)`;
      });
    }
    const title = h1.current;
    if (!title) return;
    if (!m.fontSize) m.fontSize = parseFloat(getComputedStyle(title).fontSize) || 200;
    const tx = coarse || idle ? Math.sin(now / 1500) * 0.9 : -(pointer.x / innerWidth - 0.5) * 2;
    const ty = coarse || idle ? 0.55 + Math.cos(now / 1900) * 0.35 : -(pointer.y / vh - 0.5) * 2;
    m.ext.x += (tx - m.ext.x) * 0.08;
    m.ext.y += (ty - m.ext.y) * 0.08;
    if (Math.abs(m.ext.x - m.extLast.x) > 0.01 || Math.abs(m.ext.y - m.extLast.y) > 0.01) {
      m.extLast = { ...m.ext };
      const k = m.fontSize / 250;
      title.style.textShadow = EXTRUSION[theme]
        .map((c, i) => `${(m.ext.x * (i + 1) * k).toFixed(1)}px ${(m.ext.y * (i + 1) * k).toFixed(1)}px 0 ${c}`).join(",");
    }
  });

  // Recalcule l'extrusion quand le thème ou la taille changent.
  useEffect(() => { motion.current.extLast = { x: 9, y: 9 }; }, [theme]);
  useEffect(() => {
    const reset = () => { motion.current.fontSize = 0; };
    addEventListener("resize", reset);
    return () => removeEventListener("resize", reset);
  }, []);

  useEffect(() => {
    const blink = h1.current?.querySelector("[data-blink]");
    const a = blink?.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.51 }, { opacity: 0 }], { duration: 1050, iterations: Infinity });
    return () => a?.cancel();
  }, []);

  const letter = (ch: string, i: number, accent = false) => (
    <span
      key={i}
      ref={(el) => { if (el) letters.current[i] = { el, w: 75, g: 800 }; }}
      className={`inline-block [font-variation-settings:'wdth'_75,'wght'_800] ${accent ? "text-pink" : ""}`}
    >
      {ch}
    </span>
  );

  return (
    <section ref={root} id="index" data-sec="index" className="relative flex min-h-screen flex-col justify-center px-(--section-x) pt-[clamp(80px,12vh,120px)] pb-20">
      <div data-in="" className="mb-[clamp(20px,3vw,36px)] font-mono text-xs leading-[1.8] text-d1">
        {t("// index.ts · portfolio, édition 2026 ·", "// index.ts · portfolio, 2026 edition ·")}{" "}
        <span className="text-mint">Dakar {dakar}</span> · Montréal {montreal}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-[clamp(32px,4vw,64px)] perspective-[1400px]">
        <div className="min-w-0">
          <h1 ref={h1} className="m-0 -ml-[.12em] overflow-hidden pr-[.14em] pb-[.12em] pl-[.12em] text-[clamp(92px,15vw,290px)] leading-[.8] tracking-[-.02em] text-t1 uppercase" aria-label="Ameth Ba">
            <span className="flex pb-[.04em] data-clip:overflow-hidden" data-clip={lineOverflow ? "" : undefined} aria-hidden="true">
              {FIRST.map((ch, i) => letter(ch, i))}
            </span>
            <span className="flex items-end pb-[.04em] data-clip:overflow-hidden" data-clip={lineOverflow ? "" : undefined} aria-hidden="true">
              {LAST.map((ch, i) => letter(ch, FIRST.length + i, true))}
              <span data-blink="" className="mb-[.06em] ml-[.08em] inline-block h-[.72em] w-[.09em] bg-mint" />
            </span>
          </h1>
          <p className="mt-[clamp(18px,2.2vw,28px)] mb-0 max-w-[620px] text-[clamp(20px,2.1vw,32px)] leading-[1.2] text-pretty [font-variation-settings:'wdth'_92,'wght'_500]">
            {t("J'écris du code qui part en", "I write code that ships to")} <span className="text-mint">{t("production.", "production.")}</span>
          </p>
          <CodeCard />
        </div>
        <HeadPortrait />
      </div>
    </section>
  );
}
