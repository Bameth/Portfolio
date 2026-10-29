"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FEATURES } from "@/config/features";
import { EASE, prefersReducedMotion } from "@/lib/env";
import { STORAGE_KEYS, storage } from "@/lib/storage";
import { usePortfolio } from "@/state/portfolio";
import { usePreferences } from "@/state/preferences";

/** Écran de démarrage façon terminal ; lance l'animation d'entrée du site à la fin. */
export function BootScreen() {
  const { startIntro } = usePortfolio();
  const { t } = usePreferences();
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const booting = useRef(false);
  const [hidden, setHidden] = useState(false);

  const finish = useCallback(() => {
    if (!booting.current) return;
    booting.current = false;
    storage.set(STORAGE_KEYS.bootSeen, "1");
    const el = root.current;
    el?.querySelectorAll<HTMLElement>("[data-boot]").forEach((l) => (l.style.opacity = "1"));
    const a = el?.animate([
      { transform: "scale(1,1)", filter: "brightness(1)", opacity: 1 },
      { transform: "scale(1,.004)", filter: "brightness(2.5)", opacity: 1, offset: 0.55 },
      { transform: "scale(0,.004)", filter: "brightness(4)", opacity: 0 },
    ], { duration: 720, easing: "cubic-bezier(.7,0,.3,1)", fill: "forwards" });
    if (a) a.onfinish = () => setHidden(true);
    else setHidden(true);
    startIntro(380);
  }, [startIntro]);

  useEffect(() => {
    const seen = FEATURES.introOnce && storage.get(STORAGE_KEYS.bootSeen) === "1";
    if (FEATURES.splash === "off" || prefersReducedMotion() || seen) {
      setHidden(true);
      startIntro(0);
      return;
    }
    booting.current = true;
    const lines = [...(root.current?.querySelectorAll<HTMLElement>("[data-boot]") ?? [])];
    const total = FEATURES.splash === "court" ? 1500 : 3600;
    const t0 = performance.now();
    lines.forEach((l) => (l.style.opacity = "0"));
    let raf = 0, end = 0;
    const tick = (now: number) => {
      if (!booting.current) return;
      const p = Math.min(1, (now - t0) / total), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      if (bar.current) bar.current.style.width = e * 100 + "%";
      if (pct.current) pct.current.textContent = Math.round(e * 100) + "%";
      if (time.current) time.current.textContent = ((now - t0) / 1000).toFixed(2) + "s";
      lines.forEach((l, i) => {
        if (p >= (i / (lines.length - 1)) * 0.92 && l.style.opacity === "0") {
          l.style.opacity = "1";
          l.animate([{ opacity: 0, transform: "translateX(-10px)" }, { opacity: 1, transform: "none" }], { duration: 300, easing: EASE });
        }
      });
      if (p < 1) raf = requestAnimationFrame(tick);
      else end = window.setTimeout(finish, 380);
    };
    raf = requestAnimationFrame(tick);
    const onKey = (e: KeyboardEvent) => { if (["Enter", "Escape", " "].includes(e.key)) finish(); };
    addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(raf); clearTimeout(end); removeEventListener("keydown", onKey); };
  }, [finish, startIntro]);

  if (hidden) return null;

  const step = (label: string, dots: string) => (
    <div data-boot="" className="whitespace-pre">
      {"  "}{label} <span className="text-d2">{dots}</span> <span className="text-mint">ok</span>
    </div>
  );

  return (
    <div ref={root} className="fixed inset-0 z-300 flex origin-center flex-col justify-between bg-p2 p-[clamp(20px,5vw,72px)]" onClick={finish} role="presentation">
      <div className="flex items-center justify-between font-mono text-[11px] text-d2">
        <span className="flex size-[30px] items-center justify-center rounded-[3px] bg-mint font-sans text-base font-black text-p2">AB</span>
        <span>{t("Entrée ↵ ou clic pour passer", "Enter ↵ or click to skip")}</span>
      </div>
      <div className="w-full max-w-[760px] font-mono text-[clamp(11px,1.15vw,15px)] leading-[2.05] text-d1">
        <div data-boot="" className="whitespace-pre">
          <span className="text-pink">$</span> <span className="text-t1">ameth run portfolio --env=prod</span>
        </div>
        {step(t("↳ résolution des dépendances", "↳ resolving dependencies"), ".......")}
        {step(t("↳ chargement de 6 projets", "↳ loading 6 projects"), "..........")}
        {step(t("↳ liaison Dakar ⇄ Montréal", "↳ linking Dakar ⇄ Montréal"), ".........")}
        {step(t("↳ compilation de l'interface", "↳ compiling the interface"), ".......")}
        <div className="mt-3.5 flex items-center gap-3.5">
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-[1px] bg-l0"><div ref={bar} className="absolute inset-y-0 left-0 w-0 bg-mint" /></div>
          <span ref={pct} className="w-11 flex-none text-right text-t1">0%</span>
        </div>
        <div data-boot="" className="mt-2.5 text-mint">
          {t("✓ prêt en", "✓ ready in")} <span ref={time} className="text-amber">0.00s</span> {t("· bienvenue.", "· welcome.")}
        </div>
      </div>
    </div>
  );
}
