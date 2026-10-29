"use client";

import { useEffect, useRef, useState } from "react";
import { PROJECTS } from "@/content/projects";
import { EASE, prefersReducedMotion } from "@/lib/env";
import { pad2 } from "@/lib/text";
import { usePreferences } from "@/state/preferences";

/** Fin de page : récapitulatif de « build », temps de lecture et signature. */
export function BuildSummary() {
  const { t } = usePreferences();
  const box = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Les lignes s'affichent une à une quand le bloc entre à l'écran.
  useEffect(() => {
    const el = box.current;
    if (!el || prefersReducedMotion()) return;
    const lines = [...el.children] as HTMLElement[];
    lines.forEach((l) => (l.style.opacity = "0"));
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      lines.forEach((l, i) => {
        l.style.opacity = "1";
        l.animate([{ opacity: 0, transform: "translateX(-8px)" }, { opacity: 1, transform: "none" }], { duration: 350, delay: i * 260, easing: EASE, fill: "backwards" });
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const n = PROJECTS.length;
  return (
    <>
      <div ref={box} className="mt-[clamp(80px,8vw,120px)] overflow-x-auto rounded-md border border-l2 bg-p2 px-5 py-[18px] font-mono text-[clamp(11.5px,1vw,13px)] leading-[1.95] whitespace-nowrap text-d1">
        <div><span className="text-pink">$</span> <span className="text-t1">ameth build --summary</span></div>
        <div>{t(`✓ ${n} fichiers compilés · ${n} projets · 1 humain`, `✓ ${n} files compiled · ${n} projects · 1 human`)}</div>
        <div>
          <span className="text-mint">{t("0 erreur", "0 errors")}</span> · <span className="text-amber">{t("0 warning", "0 warnings")}</span> · {t("lu en", "read in")}{" "}
          <span className="text-t1">{pad2(Math.floor(elapsed / 60))}:{pad2(elapsed % 60)}</span>
        </div>
        <div className="text-mint">{t("→ merci d'avoir lu jusqu'au bout.", "→ thanks for reading all the way down.")}</div>
      </div>
      <div className="mt-[18px] flex flex-wrap justify-between gap-3 font-mono text-[11px] text-d1">
        <span>{t("© 2026 Ameth Ba · écrit à la main, Dakar ⇄ Montréal", "© 2026 Ameth Ba · handwritten, Dakar ⇄ Montréal")}</span>
        <a href="#index">EOF ↑</a>
      </div>
    </>
  );
}
